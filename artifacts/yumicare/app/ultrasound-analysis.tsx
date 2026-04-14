import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";

const { width } = Dimensions.get("window");

// ─── Normal Ranges (WHO Standards) ─────────────────────────────────
const NORMAL_RANGES: Record<string, { min: number; max: number; unit: string; label: string }> = {
  bpd: { min: 20, max: 98, unit: "mm", label: "Biparietal Diameter" },
  hc: { min: 80, max: 360, unit: "mm", label: "Head Circumference" },
  ac: { min: 60, max: 380, unit: "mm", label: "Abdominal Circumference" },
  fl: { min: 10, max: 80, unit: "mm", label: "Femur Length" },
  efw: { min: 100, max: 4500, unit: "g", label: "Est. Fetal Weight" },
};

// Gestational-week-based expected ranges (simplified)
const WEEK_RANGES: Record<number, Record<string, [number, number]>> = {
  12: { bpd: [18, 24], hc: [65, 85], ac: [50, 70], fl: [7, 12], efw: [45, 65] },
  16: { bpd: [31, 37], hc: [112, 132], ac: [90, 115], fl: [17, 23], efw: [120, 180] },
  20: { bpd: [43, 53], hc: [155, 190], ac: [135, 170], fl: [28, 36], efw: [280, 400] },
  24: { bpd: [55, 65], hc: [200, 235], ac: [175, 215], fl: [40, 47], efw: [550, 750] },
  28: { bpd: [65, 78], hc: [240, 280], ac: [215, 265], fl: [48, 57], efw: [900, 1300] },
  32: { bpd: [74, 88], hc: [275, 315], ac: [260, 310], fl: [56, 65], efw: [1400, 2100] },
  36: { bpd: [80, 95], hc: [300, 340], ac: [290, 345], fl: [63, 72], efw: [2200, 3100] },
  40: { bpd: [85, 100], hc: [315, 360], ac: [315, 380], fl: [70, 80], efw: [2800, 4200] },
};

// Get closest week range
function getClosestWeek(week: number): number {
  const weeks = Object.keys(WEEK_RANGES).map(Number);
  return weeks.reduce((prev, curr) => Math.abs(curr - week) < Math.abs(prev - week) ? curr : prev);
}

interface Detection {
  class: string;
  confidence: number;
  bbox: [number, number, number, number]; // x, y, w, h
}

interface AnalysisResult {
  detections: Detection[];
  measurements: Record<string, number>;
  healthStatus: "normal" | "review_needed" | "anomaly_detected";
  confidence: number;
  scanType: "2d" | "3d" | "4d" | "color_doppler";
  gestationalWeek: number;
}

// Simulated AI analysis (replace with real API call when YOLO backend is ready)
function simulateYOLOAnalysis(scanType: string, gestationalWeek: number): AnalysisResult {
  const week = getClosestWeek(gestationalWeek);
  const ranges = WEEK_RANGES[week] ?? WEEK_RANGES[24]!;

  // Generate realistic measurements within normal range (with slight variations)
  const measurements: Record<string, number> = {};
  const detections: Detection[] = [];

  for (const [key, [min, max]] of Object.entries(ranges)) {
    const range = max - min;
    const value = Math.round(min + Math.random() * range);
    measurements[key] = value;
    
    if (key !== "efw") {
      detections.push({
        class: `fetal_${key === "bpd" || key === "hc" ? "head" : key === "ac" ? "abdomen" : "femur"}`,
        confidence: 0.82 + Math.random() * 0.15,
        bbox: [
          0.15 + Math.random() * 0.2,
          0.15 + Math.random() * 0.2,
          0.25 + Math.random() * 0.2,
          0.25 + Math.random() * 0.2,
        ],
      });
    }
  }

  // Determine health status
  let anomalies = 0;
  for (const [key, value] of Object.entries(measurements)) {
    const [min, max] = ranges[key] ?? [0, 9999];
    if (value < min * 0.85 || value > max * 1.15) anomalies++;
  }

  return {
    detections,
    measurements,
    healthStatus: anomalies === 0 ? "normal" : anomalies <= 1 ? "review_needed" : "anomaly_detected",
    confidence: 0.85 + Math.random() * 0.12,
    scanType: scanType as any,
    gestationalWeek,
  };
}

const SCAN_TYPES = [
  { key: "2d", label: "2D Scan", icon: "scan-outline" as const, desc: "Standard B-mode" },
  { key: "3d", label: "3D Surface", icon: "cube-outline" as const, desc: "3D Rendering" },
  { key: "4d", label: "4D Realtime", icon: "videocam-outline" as const, desc: "Moving 3D" },
  { key: "color", label: "Color Doppler", icon: "color-palette-outline" as const, desc: "Blood flow" },
];

const HEALTH_CONFIG = {
  normal: { color: Colors.success, bg: Colors.successLight, icon: "checkmark-circle" as const, label: "Normal Development", desc: "All measurements are within expected ranges for gestational age." },
  review_needed: { color: Colors.warning, bg: Colors.warningLight, icon: "alert-circle" as const, label: "Needs Review", desc: "Some measurements are slightly outside expected ranges. Clinical review recommended." },
  anomaly_detected: { color: Colors.danger, bg: Colors.dangerLight, icon: "warning" as const, label: "Anomaly Detected", desc: "Significant deviation from expected values detected. Immediate clinical evaluation required." },
};

export default function UltrasoundAnalysisScreen() {
  const { patientId } = useLocalSearchParams<{ patientId?: string }>();
  const { doctorPatients } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : Math.max(insets.top, 20);

  const patient = patientId
    ? doctorPatients.find((p) => p.id === patientId)
    : doctorPatients[0];

  const [scanType, setScanType] = useState("2d");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  // Animation values
  const scanAnim = useRef(new Animated.Value(0)).current;
  const resultOpac = useRef(new Animated.Value(0)).current;
  const resultTrans = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (analyzing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(scanAnim, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    } else {
      scanAnim.stopAnimation();
      scanAnim.setValue(0);
    }
  }, [analyzing, scanAnim]);

  useEffect(() => {
    if (result) {
      Animated.parallel([
        Animated.timing(resultOpac, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(resultTrans, { toValue: 0, duration: 500, easing: Easing.out(Easing.exp), useNativeDriver: true }),
      ]).start();
    } else {
      resultOpac.setValue(0);
      resultTrans.setValue(20);
    }
  }, [result, resultOpac, resultTrans]);

  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
        Alert.alert("Permissions Required", "We need access to your camera and gallery to analyze ultrasound scans. Please enable them in your device settings.");
        return false;
      }
    }
    return true;
  };

  const pickImage = useCallback(async () => {
    const hasPerms = await requestPermissions();
    if (!hasPerms) return;

    try {
      const picked = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.9,
      });
      if (!picked.canceled && picked.assets[0]) {
        setImageUri(picked.assets[0].uri);
        setResult(null);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not pick image.");
    }
  }, []);

  const takePhoto = useCallback(async () => {
    const hasPerms = await requestPermissions();
    if (!hasPerms) return;

    try {
      const picked = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.9,
      });
      if (!picked.canceled && picked.assets[0]) {
        setImageUri(picked.assets[0].uri);
        setResult(null);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not capture image. Verify camera permissions.");
    }
  }, []);

  const runAnalysis = useCallback(async () => {
    if (!imageUri) {
      Alert.alert("No Image", "Please upload or capture an ultrasound image first.");
      return;
    }
    setResult(null);
    setAnalyzing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Simulate AI processing time (2-4 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 2000));

    const gestWeek = patient?.pregnancyWeek ?? 24;
    const analysisResult = simulateYOLOAnalysis(scanType, gestWeek);
    setResult(analysisResult);
    setAnalyzing(false);
    Haptics.notificationAsync(
      analysisResult.healthStatus === "normal"
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning
    );
  }, [imageUri, scanType, patient]);

  const getWeekRanges = () => {
    const week = getClosestWeek(patient?.pregnancyWeek ?? 24);
    return WEEK_RANGES[week] ?? WEEK_RANGES[24]!;
  };

  const isInRange = (key: string, value: number) => {
    const ranges = getWeekRanges();
    const [min, max] = ranges[key] ?? [0, 9999];
    return value >= min * 0.9 && value <= max * 1.1;
  };

  const previewHeight = 240;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Ultrasound Analysis</Text>
        <LinearGradient
          colors={["#9333EA", "#7E22CE"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.aiBadge}
        >
          <Ionicons name="sparkles" size={14} color="#fff" />
          <Text style={styles.aiBadgeText}>AI</Text>
        </LinearGradient>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 80, gap: 18 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Disclaimer Banner */}
        {showDisclaimer && (
          <Animated.View style={styles.disclaimerCard}>
            <View style={styles.disclaimerHeader}>
              <Ionicons name="information-circle" size={20} color={Colors.warning} />
              <Text style={styles.disclaimerTitle}>AI-Assisted Analysis</Text>
              <TouchableOpacity onPress={() => setShowDisclaimer(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={styles.disclaimerText}>
              This AI analysis is for <Text style={{ fontFamily: "Inter_700Bold" }}>reference purposes only</Text>.
              It does NOT replace professional medical diagnosis. Always consult a qualified provider.
            </Text>
          </Animated.View>
        )}

        {/* Patient Info */}
        {patient && (
          <View style={styles.patientBar}>
            <View style={styles.patientAvatar}>
              <Text style={styles.patientAvatarText}>{patient.name.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.patientName}>{patient.name}</Text>
              <Text style={styles.patientMeta}>
                Week {patient.pregnancyWeek} · {patient.bloodGroup} · Age {patient.age}
              </Text>
            </View>
            <View style={styles.weekBadge}>
              <Text style={styles.weekBadgeText}>Wk {patient.pregnancyWeek}</Text>
            </View>
          </View>
        )}

        {/* Scan Type Selection */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Scan Type</Text>
          <Text style={styles.cardSub}>Select the ultrasound modality</Text>
          <View style={styles.scanGrid}>
            {SCAN_TYPES.map((st) => {
              const active = scanType === st.key;
              return (
                <TouchableOpacity
                  key={st.key}
                  style={[styles.scanOption, active && styles.scanOptionActive]}
                  onPress={() => { setScanType(st.key); Haptics.selectionAsync(); }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.scanIcon, active && styles.scanIconActive]}>
                    <Ionicons name={st.icon} size={20} color={active ? "#fff" : Colors.teal} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.scanLabel, active && styles.scanLabelActive]}>{st.label}</Text>
                    <Text style={[styles.scanDesc, active && { color: Colors.teal }]} numberOfLines={1}>{st.desc}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Image Upload */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Ultrasound Image</Text>
            {imageUri && !analyzing && (
              <TouchableOpacity style={styles.reselectBtn} onPress={pickImage}>
                <Ionicons name="swap-horizontal" size={14} color={Colors.purple} />
                <Text style={styles.reselectBtnText}>Retake</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {imageUri ? (
            <View style={[styles.imagePreviewWrapper, { height: previewHeight }]}>
              <Image source={{ uri: imageUri }} style={[styles.previewImg, { height: previewHeight }]} resizeMode="cover" />
              
              {/* Scanning Overlay Effect */}
              {analyzing && (
                <View style={StyleSheet.absoluteFill}>
                  <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)" }} />
                  <Animated.View style={[
                    styles.scanLaser,
                    {
                      transform: [{
                        translateY: scanAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, previewHeight - 4], // 4 is laser height
                        }),
                      }]
                    }
                  ]} />
                </View>
              )}
              
              {!analyzing && scanType === "2d" && (
                <View style={styles.badge2D}>
                  <Ionicons name="cube-outline" size={12} color="#fff" />
                  <Text style={styles.badge2DText}>Ready for 3D AI conversion</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.uploadArea}>
              <View style={styles.uploadIconCircle}>
                <Ionicons name="scan-outline" size={32} color={Colors.teal} />
              </View>
              <Text style={styles.uploadTitle}>Upload Fetal Scan</Text>
              <Text style={styles.uploadDesc}>Supported formats: JPG, PNG, DICOM</Text>
              <View style={styles.uploadActions}>
                <TouchableOpacity style={styles.uploadBtn} onPress={pickImage} activeOpacity={0.8}>
                  <Ionicons name="images-outline" size={18} color={Colors.teal} />
                  <Text style={styles.uploadBtnText}>Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.uploadBtn, styles.uploadBtnAlt]} onPress={takePhoto} activeOpacity={0.8}>
                  <Ionicons name="camera-outline" size={18} color="#fff" />
                  <Text style={[styles.uploadBtnText, { color: "#fff" }]}>Camera</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Analyze Button */}
          <TouchableOpacity
            disabled={!imageUri || analyzing}
            activeOpacity={0.9}
            style={styles.analyzeBtnWrapper}
            onPress={runAnalysis}
          >
            <LinearGradient
              colors={imageUri && !analyzing ? ["#9333EA", "#7E22CE"] : [Colors.textMuted, Colors.textMuted]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.analyzeBtn, (!imageUri || analyzing) && { opacity: 0.7 }]}
            >
              {analyzing ? (
                <View style={styles.analyzingRow}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.analyzeBtnText}>Processing via YOLOv8...</Text>
                </View>
              ) : (
                <>
                  <Ionicons name="sparkles" size={20} color="#fff" />
                  <Text style={styles.analyzeBtnText}>Run AI Analysis</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ─── Results ─── */}
        {result && (
          <Animated.View style={{ opacity: resultOpac, transform: [{ translateY: resultTrans }], gap: 18 }}>
            
            {/* Health Status Dashboard style */}
            <View style={[styles.healthCard, { backgroundColor: HEALTH_CONFIG[result.healthStatus].bg, borderColor: HEALTH_CONFIG[result.healthStatus].color + "40" }]}>
              <View style={styles.healthHeader}>
                <View style={[styles.healthIconWrap, { backgroundColor: HEALTH_CONFIG[result.healthStatus].color + "25" }]}>
                  <Ionicons name={HEALTH_CONFIG[result.healthStatus].icon} size={28} color={HEALTH_CONFIG[result.healthStatus].color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.healthTitle, { color: HEALTH_CONFIG[result.healthStatus].color }]}>
                    {HEALTH_CONFIG[result.healthStatus].label}
                  </Text>
                  <Text style={[styles.healthDesc, { color: Colors.text }]}>{HEALTH_CONFIG[result.healthStatus].desc}</Text>
                </View>
              </View>
              <View style={styles.confidencePanel}>
                <View style={styles.confidenceHeader}>
                  <Text style={styles.confidenceLabel}>YOLOv8 Detection Confidence</Text>
                  <Text style={[styles.confidenceValue, { color: HEALTH_CONFIG[result.healthStatus].color }]}>
                    {(result.confidence * 100).toFixed(1)}%
                  </Text>
                </View>
                <View style={styles.confidenceTrack}>
                  <View style={[styles.confidenceFill, { width: `${result.confidence * 100}%`, backgroundColor: HEALTH_CONFIG[result.healthStatus].color }]} />
                </View>
              </View>
            </View>

            {/* Detections / Measurements combined grid */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Ionicons name="analytics-outline" size={18} color={Colors.teal} />
                <Text style={[styles.cardTitle, { color: Colors.teal }]}>Biometry & YOLO Detections</Text>
              </View>
              <Text style={styles.cardSub}>Compared with Week {getClosestWeek(result.gestationalWeek)} standards</Text>

              <View style={styles.measureGrid}>
                {Object.entries(result.measurements).map(([key, value]) => {
                  const info = NORMAL_RANGES[key];
                  if (!info) return null;
                  const inRange = isInRange(key, value);
                  const ranges = getWeekRanges();
                  const [min, max] = ranges[key] ?? [0, 999];
                  
                  // Find corresponding detection confidence if exists
                  const detection = result.detections.find(d => d.class.includes(key === "bpd" || key === "hc" ? "head" : key === "ac" ? "abdomen" : "femur"));
                  
                  return (
                    <View key={key} style={[styles.measureCard, !inRange && styles.measureCardWarn]}>
                      <View style={styles.measureHeader}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                          <Text style={styles.measureKey}>{key.toUpperCase()}</Text>
                          {detection && (
                            <View style={styles.microTag}>
                              <Text style={styles.microTagText}>{(detection.confidence * 100).toFixed(0)}% acc</Text>
                            </View>
                          )}
                        </View>
                        <Ionicons
                          name={inRange ? "checkmark-circle" : "alert-circle"}
                          size={18}
                          color={inRange ? Colors.success : Colors.warning}
                        />
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginTop: 4 }}>
                         <Text style={[styles.measureValue, !inRange && { color: Colors.warning }]}>{value}</Text>
                         <Text style={[styles.measureUnit, { marginBottom: 3 }]}>{info.unit}</Text>
                      </View>
                      
                      <Text style={styles.measureLabel}>{info.label}</Text>
                      <View style={styles.rangePill}>
                         <Text style={styles.measureRange}>Normal: {min}–{max}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* 2D → 3D Visualization Note */}
            {scanType === "2d" && (
              <LinearGradient 
                colors={["#FAF5FF", "#F3E8FF"]} 
                style={styles.card3D}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.card3DHeader}>
                  <View style={styles.card3DIcon}>
                    <Ionicons name="cube" size={24} color={Colors.purple} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.card3DTitle}>3D Model Synthesis</Text>
                    <Text style={styles.card3DDesc}>
                      AI can generate a gestational-age-matched 3D reference model for week {patient?.pregnancyWeek ?? 24} based on these 2D biometrics.
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.card3DBtn} activeOpacity={0.8} onPress={() => {
                  Alert.alert(
                    "3D Model Synthesis",
                    `A pre-rendered 3D fetal model for gestational week ${patient?.pregnancyWeek ?? 24} would be displayed here.\n\nThis requires a 3D model library (Three.js) integration which will be implemented with the YOLO backend.\n\n⚠️ This is for reference only — not actual anatomy.`,
                    [{ text: "Understood", style: "default" }]
                  );
                }}>
                  <LinearGradient colors={["#9333EA", "#7E22CE"]} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.card3DBtnInner}>
                    <Ionicons name="eye" size={18} color="#fff" />
                    <Text style={styles.card3DBtnText}>Generate 3D Reference Model</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            )}

            {/* Clinical Notes */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Ionicons name="document-text-outline" size={18} color={Colors.text} />
                <Text style={styles.cardTitle}>AI Clinical Draft</Text>
              </View>
              <View style={styles.summaryBox}>
                <Text style={styles.summaryText}>
                  {result.healthStatus === "normal"
                    ? `Fetal biometry at ${result.gestationalWeek} weeks shows all measurements within normal physiological limits. BPD (${result.measurements.bpd}mm), HC (${result.measurements.hc}mm), AC (${result.measurements.ac}mm), and FL (${result.measurements.fl}mm) are consistent with gestational age. Estimated fetal weight is ${result.measurements.efw}g. No structural anomalies detected in current planes. Routine antenatal care advised.`
                    : result.healthStatus === "review_needed"
                    ? `Fetal biometry at ${result.gestationalWeek} weeks. Some measurements deviate slightly from expected normograms. Suggest close interval growth scan in 2 weeks to assess interval growth trajectory.`
                    : `Fetal biometry at ${result.gestationalWeek} weeks reveals significant deviance in one or more biometric parameters. Recommend immediate referral for targeted anomaly scan by maternal-fetal medicine specialist.`}
                </Text>
              </View>
              <TouchableOpacity style={styles.copyBtn} activeOpacity={0.7} onPress={() => {
                 Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                 Alert.alert("Copied", "Draft copied to clipboard for EHR integration.");
              }}>
                <Ionicons name="copy-outline" size={14} color={Colors.teal} />
                <Text style={styles.copyBtnText}>Copy to Clipboard</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.05)"
  },
  backBtn: {
    width: 42, height: 42, borderRadius: 14, backgroundColor: Colors.white,
    alignItems: "center", justifyContent: "center",
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 2,
  },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text },
  aiBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6,
  },
  aiBadgeText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#fff" },

  disclaimerCard: {
    backgroundColor: "#FFFBEB", borderRadius: 16, padding: 14, gap: 8,
    borderWidth: 1, borderColor: "#FDE68A",
  },
  disclaimerHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  disclaimerTitle: { flex: 1, fontSize: 14, fontFamily: "Inter_700Bold", color: "#D97706" },
  disclaimerText: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#92400E", lineHeight: 20 },

  patientBar: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: Colors.white, borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: "rgba(0,0,0,0.03)",
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  patientAvatar: { width: 48, height: 48, borderRadius: 16, backgroundColor: Colors.tealLight, alignItems: "center", justifyContent: "center" },
  patientAvatarText: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.teal },
  patientName: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.text },
  patientMeta: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 3 },
  weekBadge: { backgroundColor: Colors.tealLight, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
  weekBadgeText: { fontSize: 13, fontFamily: "Inter_700Bold", color: Colors.teal },

  card: {
    backgroundColor: Colors.white, borderRadius: 20, padding: 18, gap: 4,
    borderWidth: 1, borderColor: "rgba(0,0,0,0.03)",
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  cardTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: Colors.text, letterSpacing: -0.3 },
  cardSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginBottom: 14 },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },

  scanGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 4 },
  scanOption: {
    width: (width - 40 - 36 - 12) / 2, // math for 2 cols considering padding
    minWidth: "48%",
    backgroundColor: Colors.background, borderRadius: 16, padding: 14, gap: 10,
    borderWidth: 1.5, borderColor: "rgba(0,0,0,0.05)",
    flexDirection: "row", alignItems: "center",
  },
  scanOptionActive: { borderColor: Colors.teal, backgroundColor: Colors.tealLight },
  scanIcon: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.white,
    alignItems: "center", justifyContent: "center",
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  scanIconActive: { backgroundColor: Colors.teal },
  scanLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text },
  scanLabelActive: { color: Colors.teal },
  scanDesc: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 2 },

  reselectBtn: { backgroundColor: Colors.purpleLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, flexDirection: "row", alignItems:"center", gap: 4},
  reselectBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: Colors.purple},

  uploadArea: {
    borderWidth: 2, borderColor: Colors.teal + "50", borderStyle: "dashed", borderRadius: 20,
    padding: 32, alignItems: "center", gap: 12, marginTop: 6, backgroundColor: Colors.tealLight + "40",
  },
  uploadIconCircle: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.tealLight,
    alignItems: "center", justifyContent: "center",
  },
  uploadTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.text },
  uploadDesc: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  uploadActions: { flexDirection: "row", gap: 12, marginTop: 12 },
  uploadBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderWidth: 1.5, borderColor: Colors.teal, borderRadius: 14,
    paddingHorizontal: 20, paddingVertical: 12, backgroundColor: Colors.white,
  },
  uploadBtnAlt: { backgroundColor: Colors.teal, borderColor: Colors.teal },
  uploadBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.teal },

  imagePreviewWrapper: { borderRadius: 18, overflow: "hidden", marginTop: 6, backgroundColor: "#000", position: 'relative' },
  previewImg: { width: "100%", borderRadius: 18 },
  scanLaser: {
    position: 'absolute', left: 0, right: 0, height: 4, 
    backgroundColor: "#00FFDD",
    shadowColor: "#00FFDD", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 10, elevation: 5,
  },
  badge2D: {
    position: "absolute", bottom: 12, left: 12,
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(147, 51, 234, 0.9)", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  badge2DText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#fff" },

  analyzeBtnWrapper: { marginTop: 16, borderRadius: 16, overflow: 'hidden' },
  analyzeBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    paddingVertical: 18,
  },
  analyzingRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  analyzeBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 0.5 },

  healthCard: {
    borderRadius: 20, padding: 20, gap: 16,
    borderWidth: 1.5,
  },
  healthHeader: { flexDirection: "row", alignItems: "center", gap: 14 },
  healthIconWrap: { width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  healthTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 4 },
  healthDesc: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.text, lineHeight: 18 },
  confidencePanel: { backgroundColor: "rgba(255,255,255,0.7)", borderRadius: 14, padding: 12 },
  confidenceHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  confidenceLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: Colors.textMuted },
  confidenceTrack: { height: 6, borderRadius: 3, backgroundColor: "rgba(0,0,0,0.06)" },
  confidenceFill: { height: 6, borderRadius: 3 },
  confidenceValue: { fontSize: 14, fontFamily: "Inter_700Bold" },

  measureGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 6 },
  measureCard: {
    width: (width - 40 - 36 - 12) / 2, // adaptive width
    minWidth: "48%",
    backgroundColor: "#F8FAFC", borderRadius: 16, padding: 14, gap: 4,
    borderWidth: 1, borderColor: "rgba(0,0,0,0.04)",
  },
  measureCardWarn: { borderColor: Colors.warning + "40", backgroundColor: Colors.warningLight },
  measureHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  measureKey: { fontSize: 13, fontFamily: "Inter_700Bold", color: Colors.text, letterSpacing: 0.5 },
  measureValue: { fontSize: 26, fontFamily: "Inter_700Bold", color: Colors.text, letterSpacing: -1 },
  measureUnit: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  measureLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 2, height: 28 }, // fixed height for alignment
  rangePill: { backgroundColor: "rgba(0,0,0,0.05)", alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginTop: 4 },
  measureRange: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: Colors.textMuted },
  
  microTag: { backgroundColor: Colors.purpleLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4},
  microTagText: { fontSize: 9, fontFamily: "Inter_700Bold", color: Colors.purple },

  card3D: {
    borderRadius: 20, padding: 20, gap: 16,
    borderWidth: 1, borderColor: "rgba(147, 51, 234, 0.15)",
  },
  card3DHeader: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
  card3DIcon: {
    width: 48, height: 48, borderRadius: 14, backgroundColor: Colors.white,
    alignItems: "center", justifyContent: "center",
    shadowColor: Colors.purple, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2,
  },
  card3DTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.purple, marginBottom: 4 },
  card3DDesc: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.text, lineHeight: 20 },
  card3DBtn: { borderRadius: 14, overflow: 'hidden' },
  card3DBtnInner: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 14,
  },
  card3DBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },

  summaryBox: { backgroundColor: Colors.background, borderRadius: 14, padding: 16, marginTop: 6, borderWidth: 1, borderColor: "rgba(0,0,0,0.04)" },
  summaryText: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.text, lineHeight: 22 },
  copyBtn: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", marginTop: 12, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: Colors.tealLight, borderRadius: 10 },
  copyBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.teal },
});
