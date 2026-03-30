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

const ADMIN_COLOR = "#E67E22";
const ADMIN_LIGHT = "#FEF5E7";

export default function AddHospitalScreen() {
  const { addHospital } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState({ name: "", city: "", address: "", phone: "", email: "", type: "Multi-Specialty", beds: "" });
  const [loading, setLoading] = useState(false);

  const update = (key: keyof typeof form, val: string) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = () => {
    if (!form.name || !form.city || !form.email) {
      Alert.alert("Required", "Please fill in name, city, and email.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setTimeout(() => {
      const result = addHospital({ ...form, beds: parseInt(form.beds) || 100 });
      setLoading(false);
      if (result.success && result.credentials) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          "Hospital Added!",
          `Credentials generated:\n\nEmail: ${result.credentials.email}\nPassword: ${result.credentials.password}\n\nShare these with the hospital admin.`,
          [{ text: "Done", onPress: () => router.back() }]
        );
      } else {
        Alert.alert("Error", result.error ?? "Failed to add hospital.");
      }
    }, 600);
  };

  const HOSPITAL_TYPES = ["Multi-Specialty", "Maternity", "General", "Specialty Clinic", "Women's Health"];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <Ionicons name="chevron-back" size={22} color={Colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Add Hospital</Text>
            <Text style={styles.headerSub}>Create account & generate credentials</Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="business-outline" size={22} color={ADMIN_COLOR} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 16 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.infoCard, { borderLeftColor: ADMIN_COLOR }]}>
            <Ionicons name="information-circle-outline" size={16} color={ADMIN_COLOR} />
            <Text style={styles.infoText}>
              After adding, login credentials will be auto-generated and shown to you. Share them with the hospital admin.
            </Text>
          </View>

          {[
            { key: "name" as const, label: "Hospital Name *", placeholder: "e.g. Apollo Maternity Hospital", icon: "business-outline" as const },
            { key: "city" as const, label: "City *", placeholder: "e.g. Mumbai", icon: "location-outline" as const },
            { key: "address" as const, label: "Full Address", placeholder: "Street, Area, Pincode", icon: "map-outline" as const },
            { key: "phone" as const, label: "Phone Number", placeholder: "+91 XX XXXX XXXX", icon: "call-outline" as const },
            { key: "email" as const, label: "Hospital Email *", placeholder: "hospital@yumicare.com", icon: "mail-outline" as const },
            { key: "beds" as const, label: "Number of Beds", placeholder: "e.g. 150", icon: "bed-outline" as const },
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
                  keyboardType={f.key === "email" ? "email-address" : f.key === "beds" ? "numeric" : f.key === "phone" ? "phone-pad" : "default"}
                  autoCapitalize={f.key === "email" ? "none" : "words"}
                />
              </View>
            </View>
          ))}

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Hospital Type</Text>
            <View style={styles.typeGrid}>
              {HOSPITAL_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeBtn, form.type === t && { backgroundColor: ADMIN_COLOR, borderColor: ADMIN_COLOR }]}
                  onPress={() => update("type", t)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.typeBtnText, form.type === t && { color: Colors.white }]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: ADMIN_COLOR }, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={loading}
          >
            <Ionicons name={loading ? "hourglass-outline" : "checkmark-circle-outline"} size={20} color={Colors.white} />
            <Text style={styles.submitBtnText}>{loading ? "Adding Hospital..." : "Add Hospital & Generate Credentials"}</Text>
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
  headerIcon: { marginLeft: "auto", width: 40, height: 40, borderRadius: 12, backgroundColor: "#FEF5E7", alignItems: "center", justifyContent: "center" },
  infoCard: { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: "#FEF5E7", borderRadius: 12, padding: 12, borderLeftWidth: 3 },
  infoText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textSecondary, lineHeight: 18 },
  field: { gap: 6 },
  fieldLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.text },
  inputWrap: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: Colors.white, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: 14 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", color: Colors.text, paddingVertical: 13 },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  typeBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white },
  typeBtnText: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 16, padding: 16, marginTop: 8 },
  submitBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.white },
});
