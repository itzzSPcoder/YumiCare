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
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useApp, PrescriptionMed } from "@/context/AppContext";

const FREQ_OPTIONS: { key: PrescriptionMed["frequency"]; label: string }[] = [
  { key: "OD", label: "OD (Once daily)" },
  { key: "BD", label: "BD (Twice daily)" },
  { key: "TDS", label: "TDS (Thrice daily)" },
  { key: "QID", label: "QID (Four times)" },
  { key: "SOS", label: "SOS (As needed)" },
  { key: "HS", label: "HS (Bedtime)" },
];

const INSTRUCTION_PRESETS = ["Before meals", "After meals", "With meals", "Before bed", "Empty stomach", "With milk", "With water"];

interface MedEntry {
  name: string;
  dosage: string;
  frequency: PrescriptionMed["frequency"];
  duration: string;
  instructions: string;
}

const emptyMed = (): MedEntry => ({ name: "", dosage: "", frequency: "OD", duration: "", instructions: "" });

export default function WritePrescriptionScreen() {
  const router = useRouter();
  const { patientId: paramPid } = useLocalSearchParams<{ patientId?: string }>();
  const { doctorProfile, doctorPatients, addPrescription, addTimelineEntry } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 16 : insets.top;

  const [selectedPatientId, setSelectedPatientId] = useState(paramPid ?? "");
  const [meds, setMeds] = useState<MedEntry[]>([emptyMed()]);
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const selectedPatient = doctorPatients.find(p => p.id === selectedPatientId);

  const updateMed = (index: number, field: keyof MedEntry, value: string) => {
    setMeds(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
  };

  const addMedRow = () => {
    if (meds.length >= 10) return;
    setMeds(prev => [...prev, emptyMed()]);
  };

  const removeMed = (index: number) => {
    if (meds.length <= 1) return;
    setMeds(prev => prev.filter((_, i) => i !== index));
  };

  const validateAndPreview = () => {
    if (!selectedPatientId) { Alert.alert("Error", "Please select a patient."); return; }
    const validMeds = meds.filter(m => m.name.trim());
    if (validMeds.length === 0) { Alert.alert("Error", "Please add at least one medication."); return; }
    for (const m of validMeds) {
      if (!m.dosage.trim()) { Alert.alert("Error", `Please enter dosage for ${m.name}`); return; }
      if (!m.duration.trim()) { Alert.alert("Error", `Please enter duration for ${m.name}`); return; }
    }
    setShowPreview(true);
  };

  const handlePrescribe = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const validMeds = meds.filter(m => m.name.trim());
    addPrescription({
      patientId: selectedPatientId,
      patientName: selectedPatient?.name ?? "",
      doctorId: doctorProfile?.id ?? "doc-001",
      doctorName: doctorProfile?.name ?? "Doctor",
      date: new Date().toISOString().split("T")[0]!,
      status: "active",
      clinicalNotes,
      medications: validMeds.map(m => ({
        name: m.name.trim(),
        dosage: m.dosage.trim(),
        frequency: m.frequency,
        duration: m.duration.trim(),
        instructions: m.instructions.trim() || "As directed",
      })),
    });
    addTimelineEntry({
      date: new Date().toISOString().split("T")[0]!,
      type: "prescription",
      title: "New Prescription",
      details: `${validMeds.length} medications prescribed by ${doctorProfile?.name}`,
      doctor: doctorProfile?.name,
    });
    Alert.alert("✅ Prescription Saved", `${validMeds.length} medications prescribed for ${selectedPatient?.name}`, [
      { text: "Done", onPress: () => router.back() },
    ]);
  };

  if (showPreview) {
    const validMeds = meds.filter(m => m.name.trim());
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: topPad + 12 }]}>
          <TouchableOpacity onPress={() => setShowPreview(false)} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review Prescription</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 16 }} showsVerticalScrollIndicator={false}>
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <Ionicons name="document-text" size={24} color={Colors.purple} />
              <View>
                <Text style={styles.previewTitle}>Prescription</Text>
                <Text style={styles.previewDate}>{new Date().toLocaleDateString("en", { day: "numeric", month: "long", year: "numeric" })}</Text>
              </View>
            </View>
            <View style={styles.previewDivider} />
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Patient</Text>
              <Text style={styles.previewValue}>{selectedPatient?.name}</Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Doctor</Text>
              <Text style={styles.previewValue}>{doctorProfile?.name}</Text>
            </View>
            <View style={styles.previewDivider} />
            <Text style={styles.rxTitle}>℞ Medications</Text>
            {validMeds.map((m, i) => (
              <View key={i} style={styles.rxItem}>
                <Text style={styles.rxNum}>{i + 1}.</Text>
                <View style={styles.rxInfo}>
                  <Text style={styles.rxName}>{m.name} {m.dosage}</Text>
                  <Text style={styles.rxDetail}>{FREQ_OPTIONS.find(f => f.key === m.frequency)?.label} · {m.duration}</Text>
                  {m.instructions ? <Text style={styles.rxInstr}>⤷ {m.instructions}</Text> : null}
                </View>
              </View>
            ))}
            {clinicalNotes ? (
              <>
                <View style={styles.previewDivider} />
                <Text style={styles.notesLabel}>Clinical Notes</Text>
                <Text style={styles.notesText}>{clinicalNotes}</Text>
              </>
            ) : null}
          </View>
          <TouchableOpacity style={styles.prescribeBtn} onPress={handlePrescribe} activeOpacity={0.85}>
            <Ionicons name="checkmark-circle" size={22} color={Colors.white} />
            <Text style={styles.prescribeBtnText}>Confirm & Prescribe</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Write Prescription</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 16 }} showsVerticalScrollIndicator={false}>
        {/* Patient selector */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Select Patient</Text>
          <View style={styles.patientGrid}>
            {doctorPatients.map(p => (
              <TouchableOpacity
                key={p.id}
                style={[styles.patientChip, selectedPatientId === p.id && styles.patientChipActive]}
                onPress={() => setSelectedPatientId(p.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.patientDot, { backgroundColor: p.status === "stable" ? Colors.success : p.status === "attention" ? Colors.warning : Colors.danger }]} />
                <Text style={[styles.patientChipText, selectedPatientId === p.id && styles.patientChipTextActive]}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Medications */}
        {meds.map((med, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.medHeader}>
              <Text style={styles.cardTitle}>Medication {index + 1}</Text>
              {meds.length > 1 && (
                <TouchableOpacity onPress={() => removeMed(index)}>
                  <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                </TouchableOpacity>
              )}
            </View>
            <TextInput style={styles.input} value={med.name} onChangeText={v => updateMed(index, "name", v)} placeholder="Drug name (e.g. Folic Acid)" placeholderTextColor={Colors.textMuted} />
            <View style={styles.row}>
              <TextInput style={[styles.input, { flex: 1 }]} value={med.dosage} onChangeText={v => updateMed(index, "dosage", v)} placeholder="Dosage (e.g. 5mg)" placeholderTextColor={Colors.textMuted} />
              <TextInput style={[styles.input, { flex: 1 }]} value={med.duration} onChangeText={v => updateMed(index, "duration", v)} placeholder="Duration (e.g. 30 days)" placeholderTextColor={Colors.textMuted} />
            </View>
            <Text style={styles.fieldLabel}>Frequency</Text>
            <View style={styles.freqRow}>
              {FREQ_OPTIONS.map(f => (
                <TouchableOpacity
                  key={f.key}
                  style={[styles.freqChip, med.frequency === f.key && styles.freqChipActive]}
                  onPress={() => updateMed(index, "frequency", f.key)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.freqText, med.frequency === f.key && styles.freqTextActive]}>{f.key}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.fieldLabel}>Instructions</Text>
            <View style={styles.freqRow}>
              {INSTRUCTION_PRESETS.slice(0, 4).map(ins => (
                <TouchableOpacity
                  key={ins}
                  style={[styles.freqChip, med.instructions === ins && styles.freqChipActive]}
                  onPress={() => updateMed(index, "instructions", ins)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.freqText, med.instructions === ins && styles.freqTextActive]}>{ins}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addMedBtn} onPress={addMedRow} activeOpacity={0.8}>
          <Ionicons name="add-circle-outline" size={20} color={Colors.purple} />
          <Text style={styles.addMedText}>Add Another Medication</Text>
        </TouchableOpacity>

        {/* Clinical Notes */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Clinical Notes</Text>
          <TextInput style={styles.notesInput} value={clinicalNotes} onChangeText={setClinicalNotes} placeholder="Additional observations, follow-up instructions..." placeholderTextColor={Colors.textMuted} multiline maxLength={1000} />
        </View>

        <TouchableOpacity style={styles.previewBtn} onPress={validateAndPreview} activeOpacity={0.85}>
          <Ionicons name="eye-outline" size={20} color={Colors.white} />
          <Text style={styles.previewBtnText}>Preview Prescription</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center", shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text },
  card: { backgroundColor: Colors.white, borderRadius: 18, padding: 16, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2, gap: 10 },
  cardTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.text },
  medHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  patientGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  patientChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: Colors.background, borderWidth: 1.5, borderColor: Colors.border },
  patientChipActive: { backgroundColor: Colors.purpleLight, borderColor: Colors.purple },
  patientDot: { width: 8, height: 8, borderRadius: 4 },
  patientChipText: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.text },
  patientChipTextActive: { fontFamily: "Inter_700Bold", color: Colors.purple },
  input: { backgroundColor: Colors.background, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.text, borderWidth: 1.5, borderColor: Colors.border },
  row: { flexDirection: "row", gap: 10 },
  fieldLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: Colors.textMuted },
  freqRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  freqChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  freqChipActive: { backgroundColor: Colors.purple, borderColor: Colors.purple },
  freqText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: Colors.textSecondary },
  freqTextActive: { color: Colors.white },
  notesInput: { backgroundColor: Colors.background, borderRadius: 12, padding: 14, fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.text, minHeight: 80, textAlignVertical: "top", borderWidth: 1.5, borderColor: Colors.border },
  addMedBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 2, borderColor: Colors.purple + "40", borderStyle: "dashed", borderRadius: 14, padding: 14 },
  addMedText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.purple },
  previewBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: Colors.purple, borderRadius: 16, padding: 18 },
  previewBtnText: { fontSize: 17, fontFamily: "Inter_700Bold", color: Colors.white },
  // Preview
  previewCard: { backgroundColor: Colors.white, borderRadius: 20, padding: 20, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 3, gap: 10 },
  previewHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  previewTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text },
  previewDate: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  previewDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 4 },
  previewRow: { flexDirection: "row", justifyContent: "space-between" },
  previewLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  previewValue: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.text },
  rxTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.purple },
  rxItem: { flexDirection: "row", gap: 8, paddingVertical: 6 },
  rxNum: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.purple, width: 20 },
  rxInfo: { flex: 1 },
  rxName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text },
  rxDetail: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 2 },
  rxInstr: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textSecondary, fontStyle: "italic", marginTop: 2 },
  notesLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.textSecondary },
  notesText: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.text, lineHeight: 20 },
  prescribeBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: Colors.teal, borderRadius: 16, padding: 18 },
  prescribeBtnText: { fontSize: 17, fontFamily: "Inter_700Bold", color: Colors.white },
});
