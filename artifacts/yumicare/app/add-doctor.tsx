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

const H_COLOR = Colors.purple;
const H_LIGHT = Colors.purpleLight;

const SPECIALIZATIONS = [
  "Obstetrics & Gynecology",
  "Maternal-Fetal Medicine",
  "Neonatology",
  "Reproductive Medicine",
  "General Obstetrics",
  "Perinatology",
];

export default function AddDoctorScreen() {
  const { addDoctor } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState({ name: "", specialization: "Obstetrics & Gynecology", licenseNo: "", phone: "", email: "" });
  const [loading, setLoading] = useState(false);

  const update = (key: keyof typeof form, val: string) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.licenseNo) {
      Alert.alert("Required", "Please fill in name, email, and license number.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setTimeout(() => {
      const result = addDoctor(form);
      setLoading(false);
      if (result.success && result.credentials) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          "Doctor Added!",
          `Account created for ${form.name}.\n\nLogin Credentials:\nEmail: ${result.credentials.email}\nPassword: ${result.credentials.password}\n\nShare these with the doctor.`,
          [{ text: "Done", onPress: () => router.back() }]
        );
      } else {
        Alert.alert("Error", result.error ?? "Failed to add doctor.");
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
            <Text style={styles.headerTitle}>Add Doctor</Text>
            <Text style={styles.headerSub}>Register a new doctor to your hospital</Text>
          </View>
          <View style={[styles.headerIcon, { backgroundColor: H_LIGHT }]}>
            <Ionicons name="medical-outline" size={22} color={H_COLOR} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 16 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.infoCard, { borderLeftColor: H_COLOR, backgroundColor: H_LIGHT }]}>
            <Ionicons name="information-circle-outline" size={16} color={H_COLOR} />
            <Text style={styles.infoText}>
              Login credentials will be auto-generated for the doctor. Share them so they can access YumiCare.
            </Text>
          </View>

          {[
            { key: "name" as const, label: "Full Name *", placeholder: "Dr. Full Name", icon: "person-outline" as const },
            { key: "licenseNo" as const, label: "Medical License No. *", placeholder: "MCI-OBG-2020-XXXX", icon: "card-outline" as const },
            { key: "phone" as const, label: "Phone Number", placeholder: "+91 XXXXX XXXXX", icon: "call-outline" as const },
            { key: "email" as const, label: "Email Address *", placeholder: "dr.name@hospital.com", icon: "mail-outline" as const },
          ].map((f) => (
            <View key={f.key} style={styles.field}>
              <Text style={styles.fieldLabel}>{f.label}</Text>
              <View style={styles.inputWrap}>
                <Ionicons name={f.icon} size={18} color={Colors.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder={f.placeholder}
                  placeholderTextColor={Colors.textMuted}
                  value={form[f.key]}
                  onChangeText={(v) => update(f.key, v)}
                  keyboardType={f.key === "email" ? "email-address" : f.key === "phone" ? "phone-pad" : "default"}
                  autoCapitalize={f.key === "email" ? "none" : "words"}
                />
              </View>
            </View>
          ))}

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Specialization</Text>
            <View style={styles.specGrid}>
              {SPECIALIZATIONS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.specBtn, form.specialization === s && { backgroundColor: H_COLOR, borderColor: H_COLOR }]}
                  onPress={() => update("specialization", s)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.specBtnText, form.specialization === s && { color: Colors.white }]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: H_COLOR }, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={loading}
          >
            <Ionicons name={loading ? "hourglass-outline" : "person-add-outline"} size={20} color={Colors.white} />
            <Text style={styles.submitBtnText}>{loading ? "Adding Doctor..." : "Add Doctor & Generate Credentials"}</Text>
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
  specGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  specBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white },
  specBtnText: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 16, padding: 16, marginTop: 8 },
  submitBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.white },
});
