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
import type { UserRole } from "@/context/AppContext";

const ROLE_CONFIG = {
  patient: { label: "Patient", icon: "heart-outline" as const, color: Colors.teal, bg: Colors.tealLight, desc: "Track your pregnancy & health" },
  doctor: { label: "Doctor", icon: "medical-outline" as const, color: "#5B8FF9", bg: "#EEF3FF", desc: "Manage patients & records" },
  hospital: { label: "Hospital", icon: "business-outline" as const, color: Colors.purple, bg: Colors.purpleLight, desc: "Manage doctors & operations" },
  admin: { label: "Admin", icon: "shield-checkmark-outline" as const, color: "#E67E22", bg: "#FEF5E7", desc: "System administration" },
};

const DEMO_CREDS: Record<UserRole, { email: string; password: string }> = {
  admin: { email: "admin@yumicare.com", password: "YumiAdmin@2024" },
  hospital: { email: "citywmc@yumicare.com", password: "CityWMC@123" },
  doctor: { email: "dr.priya@yumicare.com", password: "DrPriya@123" },
  patient: { email: "aisha@yumicare.com", password: "Aisha@123" },
};

export default function LoginScreen() {
  const { login } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedRole, setSelectedRole] = useState<UserRole>("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDevCreds, setShowDevCreds] = useState(false);
  const [logoTaps, setLogoTaps] = useState(0);

  const handleLogoTap = () => {
    const newTaps = logoTaps + 1;
    setLogoTaps(newTaps);
    if (newTaps >= 7) {
      setShowDevCreds(!showDevCreds);
      setLogoTaps(0);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Forgot Password?",
      "Please contact your hospital administrator or system admin to reset your password.\n\nAdmin: admin@yumicare.com",
      [{ text: "OK" }]
    );
  };

  const cfg = ROLE_CONFIG[selectedRole];

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Required", "Please enter your email and password.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setTimeout(() => {
      const result = login(email.trim(), password.trim());
      setLoading(false);
      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace("/(tabs)");
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Login Failed", result.error ?? "Invalid credentials.");
      }
    }, 600);
  };

  const autofill = () => {
    const creds = DEMO_CREDS[selectedRole];
    setEmail(creds.email);
    setPassword(creds.password);
    Haptics.selectionAsync();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.logoRow} onPress={handleLogoTap} activeOpacity={0.9}>
          <View style={[styles.logoIcon, { backgroundColor: cfg.color }]}>
            <Ionicons name="heart" size={22} color={Colors.white} />
          </View>
          <Text style={styles.logoText}>YumiCare</Text>
        </TouchableOpacity>

        <Text style={styles.headline}>Welcome back</Text>
        <Text style={styles.subline}>Sign in to your account</Text>

        <Text style={styles.sectionLabel}>Select your role</Text>
        <View style={styles.roleGrid}>
          {(Object.keys(ROLE_CONFIG) as UserRole[]).map((role) => {
            const r = ROLE_CONFIG[role];
            const active = selectedRole === role;
            return (
              <TouchableOpacity
                key={role}
                style={[styles.roleCard, active && { borderColor: r.color, borderWidth: 2, backgroundColor: r.bg }]}
                onPress={() => {
                  setSelectedRole(role);
                  setEmail("");
                  setPassword("");
                  Haptics.selectionAsync();
                }}
                activeOpacity={0.8}
              >
                <View style={[styles.roleIcon, { backgroundColor: active ? r.color : Colors.border }]}>
                  <Ionicons name={r.icon} size={18} color={active ? Colors.white : Colors.textMuted} />
                </View>
                <Text style={[styles.roleLabel, active && { color: r.color, fontFamily: "Inter_700Bold" }]}>{r.label}</Text>
                <Text style={styles.roleDesc}>{r.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={[styles.formCard, { borderTopColor: cfg.color }]}>
          <View style={styles.formHeader}>
            <View style={[styles.formIcon, { backgroundColor: cfg.bg }]}>
              <Ionicons name={cfg.icon} size={20} color={cfg.color} />
            </View>
            <View>
              <Text style={[styles.formRole, { color: cfg.color }]}>{cfg.label} Login</Text>
              <Text style={styles.formSub}>{cfg.desc}</Text>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email Address</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Password</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Enter your password"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPass((v) => !v)} style={styles.eyeBtn}>
                <Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.7} style={{ alignSelf: "flex-end" }}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: cfg.color }, loading && { opacity: 0.75 }]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <Text style={styles.loginBtnText}>Signing in...</Text>
            ) : (
              <>
                <Ionicons name="log-in-outline" size={18} color={Colors.white} />
                <Text style={styles.loginBtnText}>Sign In as {cfg.label}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {showDevCreds && (
          <View style={styles.credBox}>
            <View style={styles.devHeader}>
              <Ionicons name="code-outline" size={16} color={Colors.warning} />
              <Text style={styles.credTitle}>Developer Mode</Text>
            </View>
            <View style={styles.credGrid}>
              {(Object.keys(DEMO_CREDS) as UserRole[]).map((role) => {
                const c = DEMO_CREDS[role];
                const r = ROLE_CONFIG[role];
                return (
                  <TouchableOpacity key={role} style={[styles.credCard, { borderLeftColor: r.color }]} onPress={() => { setSelectedRole(role); setEmail(c.email); setPassword(c.password); Haptics.selectionAsync(); }} activeOpacity={0.8}>
                    <Text style={[styles.credRole, { color: r.color }]}>{r.label}</Text>
                    <Text style={styles.credEmail}>{c.email}</Text>
                    <Text style={styles.credPass}>{c.password}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 20, gap: 16 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 },
  logoIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  logoText: { fontSize: 24, fontFamily: "Inter_700Bold", color: Colors.text },
  headline: { fontSize: 30, fontFamily: "Inter_700Bold", color: Colors.text, marginTop: 8 },
  subline: { fontSize: 15, fontFamily: "Inter_400Regular", color: Colors.textSecondary, marginBottom: 8 },
  sectionLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.textMuted, textTransform: "uppercase", letterSpacing: 0.8 },
  roleGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  roleCard: {
    width: "47%",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    gap: 6,
    borderWidth: 1.5,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 1,
  },
  roleIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  roleLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text },
  roleDesc: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    gap: 16,
    borderTopWidth: 3,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  formHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  formIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  formRole: { fontSize: 17, fontFamily: "Inter_700Bold" },
  formSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  field: { gap: 6 },
  fieldLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.text },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 2,
  },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.text,
    paddingVertical: 12,
  },
  eyeBtn: { padding: 4 },
  loginBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    padding: 16,
    marginTop: 4,
  },
  loginBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.white },
  forgotText: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.teal },
  credBox: {
    backgroundColor: Colors.warningLight,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1.5,
    borderColor: Colors.warning + "40",
  },
  devHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  credTitle: { fontSize: 13, fontFamily: "Inter_700Bold", color: Colors.warning },
  credGrid: { gap: 8 },
  credCard: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 10,
    borderLeftWidth: 3,
    gap: 2,
  },
  credRole: { fontSize: 12, fontFamily: "Inter_700Bold", textTransform: "uppercase", letterSpacing: 0.5 },
  credEmail: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.text },
  credPass: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted },
});
