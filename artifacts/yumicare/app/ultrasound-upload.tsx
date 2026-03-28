import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";

interface UltrasoundRecord {
  id: string;
  date: string;
  week: number;
  title: string;
  notes: string;
  measurements: { BPD?: string; FL?: string; HC?: string; AC?: string; EFW?: string };
  fileName: string;
  uploaded: boolean;
}

const EXISTING_RECORDS: UltrasoundRecord[] = [
  {
    id: "u1",
    date: "Mar 25, 2026",
    week: 24,
    title: "Anomaly Scan",
    notes: "Normal fetal anatomy. No structural abnormalities detected.",
    measurements: { BPD: "61mm", FL: "44mm", HC: "220mm", AC: "195mm", EFW: "680g" },
    fileName: "anomaly_scan_24wk.jpg",
    uploaded: true,
  },
  {
    id: "u2",
    date: "Jan 18, 2026",
    week: 12,
    title: "Dating Scan",
    notes: "Crown-rump length normal. NT measurement within range.",
    measurements: { BPD: "22mm", FL: "9mm" },
    fileName: "dating_scan_12wk.jpg",
    uploaded: true,
  },
];

export default function UltrasoundUploadScreen() {
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const { doctorPatients, addTimelineEntry } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const patient = doctorPatients.find((p) => p.id === patientId) ?? doctorPatients[0]!;
  const [records, setRecords] = useState<UltrasoundRecord[]>(EXISTING_RECORDS);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    title: "",
    notes: "",
    BPD: "",
    FL: "",
    HC: "",
    AC: "",
    EFW: "",
  });

  const handleUpload = () => {
    if (!form.title.trim()) {
      Alert.alert("Required", "Please enter a scan title.");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const newRecord: UltrasoundRecord = {
      id: String(Date.now()),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      week: patient.pregnancyWeek,
      title: form.title,
      notes: form.notes,
      measurements: {
        ...(form.BPD && { BPD: form.BPD + "mm" }),
        ...(form.FL && { FL: form.FL + "mm" }),
        ...(form.HC && { HC: form.HC + "mm" }),
        ...(form.AC && { AC: form.AC + "mm" }),
        ...(form.EFW && { EFW: form.EFW + "g" }),
      },
      fileName: `scan_${form.title.toLowerCase().replace(/\s+/g, "_")}.jpg`,
      uploaded: true,
    };
    setRecords((prev) => [newRecord, ...prev]);
    addTimelineEntry({
      date: new Date().toISOString().split("T")[0]!,
      type: "ultrasound",
      title: form.title,
      details: form.notes || "Ultrasound scan uploaded by Dr.",
      values: Object.fromEntries(
        Object.entries({ BPD: form.BPD, FL: form.FL, HC: form.HC, AC: form.AC, EFW: form.EFW })
          .filter(([, v]) => v !== "")
      ),
      doctor: "Dr. Priya Sharma",
    });
    setForm({ title: "", notes: "", BPD: "", FL: "", HC: "", AC: "", EFW: "" });
    setShowForm(false);
    Alert.alert("Uploaded", `Ultrasound report for ${patient.name} saved successfully.`);
  };

  const simulateCapture = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Scan Image",
      "In production this opens the camera to capture the ultrasound image. Using existing report placeholder.",
      [{ text: "OK" }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Ultrasound Upload</Text>
          <Text style={styles.headerSub}>{patient.name}</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowForm((v) => !v)}
          activeOpacity={0.8}
        >
          <Ionicons name={showForm ? "close" : "add"} size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 60, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.patientCard}>
          <View style={styles.patientAvatar}>
            <Text style={styles.patientInitial}>{patient.name.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.patientName}>{patient.name}</Text>
            <Text style={styles.patientSub}>Week {patient.pregnancyWeek} · {patient.bloodGroup} · Due {patient.dueDate}</Text>
          </View>
        </View>

        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>New Ultrasound Report</Text>

            <TouchableOpacity style={styles.captureBox} onPress={simulateCapture} activeOpacity={0.8}>
              <Ionicons name="camera" size={32} color={Colors.teal} />
              <Text style={styles.captureLabel}>Capture / Upload Image</Text>
              <Text style={styles.captureSub}>Tap to take photo or select from gallery</Text>
            </TouchableOpacity>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Scan Title *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Growth Scan, Anomaly Scan..."
                placeholderTextColor={Colors.textMuted}
                value={form.title}
                onChangeText={(v) => setForm((f) => ({ ...f, title: v }))}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Clinical Notes</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Observations, findings, or notes..."
                placeholderTextColor={Colors.textMuted}
                value={form.notes}
                onChangeText={(v) => setForm((f) => ({ ...f, notes: v }))}
                multiline
                numberOfLines={3}
              />
            </View>

            <Text style={styles.fieldLabel}>Measurements (optional)</Text>
            <View style={styles.measureGrid}>
              {[
                { key: "BPD" as const, label: "BPD (mm)" },
                { key: "FL" as const, label: "FL (mm)" },
                { key: "HC" as const, label: "HC (mm)" },
                { key: "AC" as const, label: "AC (mm)" },
                { key: "EFW" as const, label: "EFW (g)" },
              ].map((m) => (
                <View key={m.key} style={styles.measureField}>
                  <Text style={styles.measureLabel}>{m.label}</Text>
                  <TextInput
                    style={styles.measureInput}
                    placeholder="—"
                    placeholderTextColor={Colors.textMuted}
                    value={form[m.key]}
                    onChangeText={(v) => setForm((f) => ({ ...f, [m.key]: v }))}
                    keyboardType="decimal-pad"
                  />
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.uploadBtn} onPress={handleUpload} activeOpacity={0.85}>
              <Ionicons name="cloud-upload-outline" size={18} color={Colors.white} />
              <Text style={styles.uploadBtnText}>Save Report</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionLabel}>Previous Scans ({records.length})</Text>
        {records.map((rec) => (
          <View key={rec.id} style={styles.recordCard}>
            <View style={styles.recordTop}>
              <View style={styles.scanThumb}>
                <Ionicons name="scan" size={24} color={Colors.teal} />
              </View>
              <View style={styles.recordMeta}>
                <Text style={styles.recordTitle}>{rec.title}</Text>
                <Text style={styles.recordDate}>{rec.date} · Week {rec.week}</Text>
                <View style={styles.uploadedBadge}>
                  <Ionicons name="checkmark-circle" size={12} color={Colors.success} />
                  <Text style={styles.uploadedText}>Uploaded</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.viewBtn}
                onPress={() => Alert.alert("Ultrasound Image", `Viewing: ${rec.fileName}\n\nIn production this shows the actual scan image.`)}
                activeOpacity={0.8}
              >
                <Ionicons name="eye-outline" size={16} color={Colors.teal} />
              </TouchableOpacity>
            </View>

            {rec.notes && <Text style={styles.recordNotes}>{rec.notes}</Text>}

            {Object.keys(rec.measurements).length > 0 && (
              <View style={styles.measurements}>
                {Object.entries(rec.measurements).map(([k, v]) => (
                  <View key={k} style={styles.measureChip}>
                    <Text style={styles.measureChipKey}>{k}</Text>
                    <Text style={styles.measureChipVal}>{v}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
    marginTop: 2,
  },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.text },
  headerSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.teal,
    alignItems: "center",
    justifyContent: "center",
  },
  patientCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  patientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.purpleLight,
    alignItems: "center",
    justifyContent: "center",
  },
  patientInitial: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.purple },
  patientName: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.text },
  patientSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 2 },
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    gap: 14,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  formTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: Colors.text },
  captureBox: {
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.tealLight,
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: Colors.teal + "40",
    borderStyle: "dashed",
  },
  captureLabel: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.teal },
  captureSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.teal, opacity: 0.7 },
  fieldGroup: { gap: 6 },
  fieldLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: Colors.textMuted, textTransform: "uppercase", letterSpacing: 0.5 },
  textInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.text,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  measureGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  measureField: { width: "30%", gap: 4 },
  measureLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  measureInput: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
    borderWidth: 1.5,
    borderColor: Colors.border,
    textAlign: "center",
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.teal,
    borderRadius: 14,
    padding: 14,
  },
  uploadBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.white },
  sectionLabel: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.text },
  recordCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    gap: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  recordTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  scanThumb: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.tealLight,
    alignItems: "center",
    justifyContent: "center",
  },
  recordMeta: { flex: 1, gap: 3 },
  recordTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.text },
  recordDate: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  uploadedBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  uploadedText: { fontSize: 11, fontFamily: "Inter_500Medium", color: Colors.success },
  viewBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.tealLight,
    alignItems: "center",
    justifyContent: "center",
  },
  recordNotes: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textSecondary, lineHeight: 18 },
  measurements: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  measureChip: {
    backgroundColor: Colors.tealLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: "center",
  },
  measureChipKey: { fontSize: 10, fontFamily: "Inter_500Medium", color: Colors.teal },
  measureChipVal: { fontSize: 13, fontFamily: "Inter_700Bold", color: Colors.tealDark },
});
