import React, { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";

export default function ScanScreen() {
  const router = useRouter();
  const { doctorPatients } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [scanned, setScanned] = useState(false);
  const [scannedPatient, setScannedPatient] = useState<typeof doctorPatients[0] | null>(null);

  const simulateScan = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const patient = doctorPatients[0]!;
    setScannedPatient(patient);
    setScanned(true);
  };

  if (scanned && scannedPatient) {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { setScanned(false); setScannedPatient(null); }} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Patient Found</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.resultCard}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={48} color={Colors.success} />
          </View>
          <Text style={styles.resultName}>{scannedPatient.name}</Text>
          <Text style={styles.resultId}>{scannedPatient.id}</Text>
          <View style={styles.resultStats}>
            {[
              { label: "Blood Group", value: scannedPatient.bloodGroup, color: Colors.danger },
              { label: "Week", value: String(scannedPatient.pregnancyWeek), color: Colors.teal },
              { label: "Due", value: scannedPatient.dueDate.slice(5).replace("-", "/"), color: Colors.purple },
            ].map((s, i) => (
              <View key={i} style={styles.resultStat}>
                <Text style={[styles.resultStatVal, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.resultStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
          {scannedPatient.allergies.length > 0 && (
            <View style={styles.allergyAlert}>
              <Ionicons name="warning" size={16} color={Colors.danger} />
              <Text style={styles.allergyAlertText}>
                Allergies: {scannedPatient.allergies.join(", ")}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push({ pathname: "/patient-detail", params: { id: scannedPatient.id } })}
            activeOpacity={0.85}
          >
            <Ionicons name="folder-open-outline" size={18} color={Colors.white} />
            <Text style={styles.primaryBtnText}>View Full Records</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push("/emergency")}
            activeOpacity={0.85}
          >
            <Ionicons name="alert-circle-outline" size={18} color={Colors.danger} />
            <Text style={styles.secondaryBtnText}>Emergency Card</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Patient QR</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.scanArea}>
        <View style={styles.viewfinder}>
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
          <View style={styles.scanLine} />
          <Ionicons name="qr-code-outline" size={80} color="rgba(255,255,255,0.3)" />
        </View>
        <Text style={styles.scanHint}>Point camera at patient's QR code</Text>
        <Text style={styles.scanSub}>The code is found in the patient's YumiCare app or printed card</Text>
      </View>

      <View style={styles.scanBottomArea}>
        <TouchableOpacity style={styles.simulateBtn} onPress={simulateScan} activeOpacity={0.85}>
          <Ionicons name="scan-outline" size={20} color={Colors.white} />
          <Text style={styles.simulateBtnText}>Simulate QR Scan</Text>
        </TouchableOpacity>
        <Text style={styles.simulateNote}>Demo mode — tap to simulate a successful scan</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0D1F2D" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.white },
  scanArea: { flex: 1, alignItems: "center", justifyContent: "center", gap: 20 },
  viewfinder: {
    width: 260,
    height: 260,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 36,
    height: 36,
    borderColor: Colors.teal,
  },
  tl: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 10 },
  tr: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 10 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 10 },
  br: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 10 },
  scanLine: {
    position: "absolute",
    width: "80%",
    height: 2,
    backgroundColor: Colors.teal,
    opacity: 0.7,
  },
  scanHint: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.white, textAlign: "center" },
  scanSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.5)", textAlign: "center", paddingHorizontal: 40 },
  scanBottomArea: { alignItems: "center", gap: 10, paddingBottom: 60 },
  simulateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.teal,
    borderRadius: 16,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  simulateBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.white },
  simulateNote: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.4)" },
  resultCard: {
    flex: 1,
    margin: 20,
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    gap: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  successIcon: { marginBottom: 4 },
  resultName: { fontSize: 24, fontFamily: "Inter_700Bold", color: Colors.text },
  resultId: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted, letterSpacing: 0.5 },
  resultStats: { flexDirection: "row", gap: 20, marginVertical: 8 },
  resultStat: { alignItems: "center", gap: 4 },
  resultStatVal: { fontSize: 20, fontFamily: "Inter_700Bold" },
  resultStatLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  allergyAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.dangerLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.danger + "30",
  },
  allergyAlertText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.danger, flex: 1 },
  actionButtons: { padding: 20, gap: 12 },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.teal,
    borderRadius: 14,
    padding: 16,
  },
  primaryBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.white },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.dangerLight,
    borderRadius: 14,
    padding: 14,
  },
  secondaryBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.danger },
});
