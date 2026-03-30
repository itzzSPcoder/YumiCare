import React, { useState } from "react";
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const COMMON_ALLERGIES = ["Penicillin", "Aspirin", "Sulfa drugs", "Codeine", "Latex", "None"];
const COMMON_MEDS = ["Folic Acid 5mg", "Iron Supplement", "Vitamin D3", "Vitamin B12", "Calcium", "None"];

export default function AddPatientScreen() {
  const { addPatient } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState({
    name: "", age: "", bloodGroup: "B+", pregnancyWeek: "", dueDate: "",
    email: "", allergies: [] as string[], medications: [] as string[],
  });
  const [loading, setLoading] = useState(false);

  const update = (key: keyof typeof form, val: any) => setForm((p) => ({ ...p, [key]: val }));
  const toggle = (field: "allergies" | "medications", val: string) => {
    setForm((p) => {
      const arr = p[field];
      return { ...p, [field]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr.filter(x => x !== "None"), val] };
    });
  };

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.pregnancyWeek) {
      Alert.alert("Required", "Please fill in name, email, and pregnancy week.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setTimeout(() => {
      const result = addPatient({
        name: form.name,
        age: parseInt(form.age) || 25,
        bloodGroup: form.bloodGroup,
        pregnancyWeek: parseInt(form.pregnancyWeek) || 8,
        dueDate: form.dueDate || new Date(Date.now() + 180 * 86400000).toISOString().split("T")[0]!,
        email: form.email,
        allergies: form.allergies.filter(a => a !== "None"),
        medications: form.medications.filter(m => m !== "None"),
      });
      setLoading(false);
      if (result.success && result.credentials) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          "Patient Added!",
          `Account created for ${form.name}.\n\nLogin Credentials:\nEmail: ${result.credentials.email}\nPassword: ${result.credentials.password}\n\nShare these with the patient.`,
          [{ text: "Done", onPress: () => router.back() }]
        );
      } else {
        Alert.alert("Error", result.error ?? "Failed to add patient.");
      }
    }, 600);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <Ionicons name="chevron-back" size={22} color={Colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Add Patient</Text>
            <Text style={styles.headerSub}>Register a new patient & create their account</Text>
          </View>
          <View style={[styles.headerIcon, { backgroundColor: Colors.tealLight }]}>
            <Ionicons name="heart-outline" size={22} color={Colors.teal} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 16 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.infoCard, { borderLeftColor: Colors.teal, backgroundColor: Colors.tealLight }]}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.teal} />
            <Text style={styles.infoText}>
              A login account will be created for the patient. Share the credentials so they can access YumiCare.
            </Text>
          </View>

          {[
            { key: "name" as const, label: "Full Name *", placeholder: "Patient's full name", icon: "person-outline" as const },
            { key: "age" as const, label: "Age", placeholder: "e.g. 28", icon: "calendar-number-outline" as const, numeric: true },
            { key: "email" as const, label: "Email Address *", placeholder: "patient@email.com", icon: "mail-outline" as const, email: true },
            { key: "pregnancyWeek" as const, label: "Current Pregnancy Week *", placeholder: "e.g. 12", icon: "stats-chart-outline" as const, numeric: true },
            { key: "dueDate" as const, label: "Estimated Due Date", placeholder: "YYYY-MM-DD", icon: "calendar-outline" as const },
          ].map((f) => (
            <View key={f.key} style={styles.field}>
              <Text style={styles.fieldLabel}>{f.label}</Text>
              <View style={styles.inputWrap}>
                <Ionicons name={f.icon} size={18} color={Colors.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder={f.placeholder}
                  placeholderTextColor={Colors.textMuted}
                  value={String(form[f.key])}
                  onChangeText={(v) => update(f.key, v)}
                  keyboardType={f.numeric ? "numeric" : f.email ? "email-address" : "default"}
                  autoCapitalize={f.email ? "none" : "words"}
                />
              </View>
            </View>
          ))}

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Blood Group</Text>
            <View style={styles.chipRow}>
              {BLOOD_GROUPS.map((bg) => (
                <TouchableOpacity
                  key={bg}
                  style={[styles.chip, form.bloodGroup === bg && { backgroundColor: Colors.teal, borderColor: Colors.teal }]}
                  onPress={() => update("bloodGroup", bg)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, form.bloodGroup === bg && { color: Colors.white }]}>{bg}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Known Allergies</Text>
            <View style={styles.chipRow}>
              {COMMON_ALLERGIES.map((a) => (
                <TouchableOpacity
                  key={a}
                  style={[styles.chip, form.allergies.includes(a) && { backgroundColor: Colors.danger, borderColor: Colors.danger }]}
                  onPress={() => toggle("allergies", a)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, form.allergies.includes(a) && { color: Colors.white }]}>{a}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Current Medications</Text>
            <View style={styles.chipRow}>
              {COMMON_MEDS.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.chip, form.medications.includes(m) && { backgroundColor: Colors.success, borderColor: Colors.success }]}
                  onPress={() => toggle("medications", m)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, form.medications.includes(m) && { color: Colors.white }]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: Colors.teal }, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={loading}
          >
            <Ionicons name={loading ? "hourglass-outline" : "person-add-outline"} size={20} color={Colors.white} />
            <Text style={styles.submitBtnText}>{loading ? "Adding Patient..." : "Add Patient & Generate Login"}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center", shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2 },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.text },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  headerIcon: { marginLeft: "auto", width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  infoCard: { flexDirection: "row", alignItems: "flex-start", gap: 8, borderRadius: 12, padding: 12, borderLeftWidth: 3 },
  infoText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textSecondary, lineHeight: 18 },
  field: { gap: 6 },
  fieldLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.text },
  inputWrap: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: Colors.white, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: 14 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", color: Colors.text, paddingVertical: 13 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white },
  chipText: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 16, padding: 16, marginTop: 8 },
  submitBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.white },
});
