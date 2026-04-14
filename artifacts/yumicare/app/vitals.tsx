import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";

const RANGES = {
  systolic: { min: 70, max: 250, normalMin: 90, normalMax: 130, label: "mmHg" },
  diastolic: { min: 40, max: 150, normalMin: 60, normalMax: 85, label: "mmHg" },
  weight: { min: 30, max: 200, normalMin: 40, normalMax: 120, label: "kg" },
  glucose: { min: 40, max: 500, normalMin: 70, normalMax: 140, label: "mg/dL" },
  hemoglobin: { min: 4, max: 20, normalMin: 11, normalMax: 16, label: "g/dL" },
};

function getStatusColor(value: number, range: typeof RANGES.systolic): string {
  if (value < range.normalMin) return Colors.warning;
  if (value > range.normalMax) return Colors.danger;
  return Colors.success;
}

function getStatusLabel(value: number, range: typeof RANGES.systolic): string {
  if (value < range.normalMin) return "Low";
  if (value > range.normalMax) return "High";
  return "Normal";
}

export default function VitalsScreen() {
  const router = useRouter();
  const { patient, addVital, getPatientVitals } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 16 : insets.top;

  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [weight, setWeight] = useState("");
  const [glucose, setGlucose] = useState("");
  const [hemoglobin, setHemoglobin] = useState("");
  const [notes, setNotes] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const patientId = patient?.id ?? "pat-001";
  const history = getPatientVitals(patientId).slice(0, 10);

  const validateAndSave = () => {
    if (!systolic && !diastolic && !weight && !glucose && !hemoglobin) {
      Alert.alert("No Data", "Please enter at least one vital reading.");
      return;
    }

    const errors: string[] = [];
    if (systolic && (Number(systolic) < RANGES.systolic.min || Number(systolic) > RANGES.systolic.max)) errors.push(`Systolic BP must be ${RANGES.systolic.min}–${RANGES.systolic.max}`);
    if (diastolic && (Number(diastolic) < RANGES.diastolic.min || Number(diastolic) > RANGES.diastolic.max)) errors.push(`Diastolic BP must be ${RANGES.diastolic.min}–${RANGES.diastolic.max}`);
    if (weight && (Number(weight) < RANGES.weight.min || Number(weight) > RANGES.weight.max)) errors.push(`Weight must be ${RANGES.weight.min}–${RANGES.weight.max}`);
    if (glucose && (Number(glucose) < RANGES.glucose.min || Number(glucose) > RANGES.glucose.max)) errors.push(`Glucose must be ${RANGES.glucose.min}–${RANGES.glucose.max}`);
    if (hemoglobin && (Number(hemoglobin) < RANGES.hemoglobin.min || Number(hemoglobin) > RANGES.hemoglobin.max)) errors.push(`Hemoglobin must be ${RANGES.hemoglobin.min}–${RANGES.hemoglobin.max}`);

    if ((systolic && !diastolic) || (!systolic && diastolic)) errors.push("Please enter both systolic and diastolic BP");

    if (errors.length > 0) {
      Alert.alert("Invalid Values", errors.join("\n"));
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const now = new Date();
    addVital({
      patientId,
      date: now.toISOString().split("T")[0]!,
      time: now.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit", hour12: false }),
      systolic: systolic ? Number(systolic) : undefined,
      diastolic: diastolic ? Number(diastolic) : undefined,
      weight: weight ? Number(weight) : undefined,
      glucose: glucose ? Number(glucose) : undefined,
      hemoglobin: hemoglobin ? Number(hemoglobin) : undefined,
      notes: notes || undefined,
    });

    Alert.alert("✅ Vitals Saved", "Your health reading has been recorded successfully.", [
      { text: "OK", onPress: () => { setSystolic(""); setDiastolic(""); setWeight(""); setGlucose(""); setHemoglobin(""); setNotes(""); } },
    ]);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log Vitals</Text>
        <TouchableOpacity onPress={() => setShowHistory(!showHistory)} style={styles.historyBtn}>
          <Ionicons name={showHistory ? "create-outline" : "time-outline"} size={20} color={Colors.teal} />
        </TouchableOpacity>
      </View>

      {showHistory ? (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 12 }} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Vitals History</Text>
          {history.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="pulse-outline" size={40} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No vitals recorded yet</Text>
            </View>
          )}
          {history.map((v, i) => (
            <View key={v.id} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyDate}>{v.date}</Text>
                <Text style={styles.historyTime}>{v.time}</Text>
              </View>
              <View style={styles.historyStats}>
                {v.systolic && v.diastolic && (
                  <View style={styles.historyStat}>
                    <Text style={styles.historyStatLabel}>BP</Text>
                    <Text style={[styles.historyStatVal, { color: getStatusColor(v.systolic, RANGES.systolic) }]}>{v.systolic}/{v.diastolic}</Text>
                    <Text style={[styles.historyStatBadge, { color: getStatusColor(v.systolic, RANGES.systolic) }]}>{getStatusLabel(v.systolic, RANGES.systolic)}</Text>
                  </View>
                )}
                {v.weight && (
                  <View style={styles.historyStat}>
                    <Text style={styles.historyStatLabel}>Weight</Text>
                    <Text style={styles.historyStatVal}>{v.weight} kg</Text>
                  </View>
                )}
                {v.glucose && (
                  <View style={styles.historyStat}>
                    <Text style={styles.historyStatLabel}>Glucose</Text>
                    <Text style={[styles.historyStatVal, { color: getStatusColor(v.glucose, RANGES.glucose) }]}>{v.glucose} mg/dL</Text>
                    <Text style={[styles.historyStatBadge, { color: getStatusColor(v.glucose, RANGES.glucose) }]}>{getStatusLabel(v.glucose, RANGES.glucose)}</Text>
                  </View>
                )}
                {v.hemoglobin && (
                  <View style={styles.historyStat}>
                    <Text style={styles.historyStatLabel}>Hgb</Text>
                    <Text style={[styles.historyStatVal, { color: getStatusColor(v.hemoglobin, RANGES.hemoglobin) }]}>{v.hemoglobin} g/dL</Text>
                    <Text style={[styles.historyStatBadge, { color: getStatusColor(v.hemoglobin, RANGES.hemoglobin) }]}>{getStatusLabel(v.hemoglobin, RANGES.hemoglobin)}</Text>
                  </View>
                )}
              </View>
              {v.notes && <Text style={styles.historyNotes}>📝 {v.notes}</Text>}
            </View>
          ))}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 16 }} showsVerticalScrollIndicator={false}>
          {/* Blood Pressure */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="heart-outline" size={18} color={Colors.danger} />
              <Text style={styles.cardTitle}>Blood Pressure</Text>
            </View>
            <View style={styles.bpRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Systolic</Text>
                <TextInput style={styles.input} value={systolic} onChangeText={setSystolic} keyboardType="numeric" placeholder="120" placeholderTextColor={Colors.textMuted} maxLength={3} />
                <Text style={styles.inputUnit}>mmHg</Text>
              </View>
              <Text style={styles.bpSlash}>/</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Diastolic</Text>
                <TextInput style={styles.input} value={diastolic} onChangeText={setDiastolic} keyboardType="numeric" placeholder="80" placeholderTextColor={Colors.textMuted} maxLength={3} />
                <Text style={styles.inputUnit}>mmHg</Text>
              </View>
            </View>
            {systolic && diastolic && (
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(Number(systolic), RANGES.systolic) + "20" }]}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(Number(systolic), RANGES.systolic) }]} />
                <Text style={[styles.statusText, { color: getStatusColor(Number(systolic), RANGES.systolic) }]}>{getStatusLabel(Number(systolic), RANGES.systolic)} Range (Normal: 90-130/60-85)</Text>
              </View>
            )}
          </View>

          {/* Weight */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="fitness-outline" size={18} color={Colors.teal} />
              <Text style={styles.cardTitle}>Weight</Text>
            </View>
            <View style={styles.singleInputRow}>
              <TextInput style={[styles.input, styles.inputWide]} value={weight} onChangeText={setWeight} keyboardType="decimal-pad" placeholder="65.0" placeholderTextColor={Colors.textMuted} maxLength={5} />
              <Text style={styles.inputUnitLg}>kg</Text>
            </View>
          </View>

          {/* Glucose */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="flask-outline" size={18} color={Colors.purple} />
              <Text style={styles.cardTitle}>Blood Glucose</Text>
            </View>
            <View style={styles.singleInputRow}>
              <TextInput style={[styles.input, styles.inputWide]} value={glucose} onChangeText={setGlucose} keyboardType="numeric" placeholder="95" placeholderTextColor={Colors.textMuted} maxLength={3} />
              <Text style={styles.inputUnitLg}>mg/dL</Text>
            </View>
            {glucose && (
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(Number(glucose), RANGES.glucose) + "20" }]}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(Number(glucose), RANGES.glucose) }]} />
                <Text style={[styles.statusText, { color: getStatusColor(Number(glucose), RANGES.glucose) }]}>{getStatusLabel(Number(glucose), RANGES.glucose)} (Normal: 70-140 mg/dL)</Text>
              </View>
            )}
          </View>

          {/* Hemoglobin */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="water-outline" size={18} color={Colors.danger} />
              <Text style={styles.cardTitle}>Hemoglobin</Text>
            </View>
            <View style={styles.singleInputRow}>
              <TextInput style={[styles.input, styles.inputWide]} value={hemoglobin} onChangeText={setHemoglobin} keyboardType="decimal-pad" placeholder="11.5" placeholderTextColor={Colors.textMuted} maxLength={4} />
              <Text style={styles.inputUnitLg}>g/dL</Text>
            </View>
            {hemoglobin && (
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(Number(hemoglobin), RANGES.hemoglobin) + "20" }]}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(Number(hemoglobin), RANGES.hemoglobin) }]} />
                <Text style={[styles.statusText, { color: getStatusColor(Number(hemoglobin), RANGES.hemoglobin) }]}>{getStatusLabel(Number(hemoglobin), RANGES.hemoglobin)} (Normal: 11-16 g/dL)</Text>
              </View>
            )}
          </View>

          {/* Notes */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="document-text-outline" size={18} color={Colors.textSecondary} />
              <Text style={styles.cardTitle}>Notes (Optional)</Text>
            </View>
            <TextInput style={styles.notesInput} value={notes} onChangeText={setNotes} placeholder="Any symptoms or observations..." placeholderTextColor={Colors.textMuted} multiline maxLength={500} />
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={validateAndSave} activeOpacity={0.85}>
            <Ionicons name="checkmark-circle-outline" size={22} color={Colors.white} />
            <Text style={styles.saveBtnText}>Save Vitals</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center", shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text },
  historyBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.tealLight, alignItems: "center", justifyContent: "center" },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text, marginBottom: 4 },
  card: { backgroundColor: Colors.white, borderRadius: 18, padding: 16, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2, gap: 12 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.text },
  bpRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  bpSlash: { fontSize: 24, fontFamily: "Inter_700Bold", color: Colors.textMuted, marginTop: 16 },
  inputGroup: { flex: 1, gap: 4 },
  inputLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  input: { backgroundColor: Colors.background, borderRadius: 12, padding: 14, fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.text, textAlign: "center", borderWidth: 1.5, borderColor: Colors.border },
  inputUnit: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.textMuted, textAlign: "center" },
  singleInputRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  inputWide: { flex: 1, textAlign: "left", paddingLeft: 18, fontSize: 20 },
  inputUnitLg: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.textMuted, width: 50 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  notesInput: { backgroundColor: Colors.background, borderRadius: 12, padding: 14, fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.text, minHeight: 80, textAlignVertical: "top", borderWidth: 1.5, borderColor: Colors.border },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: Colors.teal, borderRadius: 16, padding: 18 },
  saveBtnText: { fontSize: 17, fontFamily: "Inter_700Bold", color: Colors.white },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  historyCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2, gap: 10 },
  historyHeader: { flexDirection: "row", justifyContent: "space-between" },
  historyDate: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.text },
  historyTime: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  historyStats: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  historyStat: { alignItems: "center", gap: 2, minWidth: 65 },
  historyStatLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  historyStatVal: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.text },
  historyStatBadge: { fontSize: 9, fontFamily: "Inter_600SemiBold" },
  historyNotes: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textSecondary },
});
