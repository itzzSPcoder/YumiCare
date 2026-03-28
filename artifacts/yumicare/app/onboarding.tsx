import React, { useState } from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";

const ROLES = [
  {
    id: "patient" as const,
    title: "I'm a Patient",
    subtitle: "Track your pregnancy journey, access records, and share with doctors.",
    icon: "heart-outline" as const,
    color: Colors.teal,
    bg: Colors.tealLight,
  },
  {
    id: "doctor" as const,
    title: "I'm a Doctor",
    subtitle: "View patient records, add clinical notes, and monitor pregnancy progress.",
    icon: "medical-outline" as const,
    color: Colors.purple,
    bg: Colors.purpleLight,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { setRole, setIsOnboarded } = useApp();
  const [selected, setSelected] = useState<"patient" | "doctor" | null>(null);
  const insets = useSafeAreaInsets();

  const handleContinue = async () => {
    if (!selected) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await setRole(selected);
    await setIsOnboarded(true);
    router.replace("/(tabs)");
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { paddingTop: topPad + 20 }]}>
      <View style={styles.logoRow}>
        <View style={styles.logoCircle}>
          <Ionicons name="heart" size={28} color={Colors.white} />
        </View>
        <Text style={styles.logoText}>YumiCare</Text>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Your pregnancy,{"\n"}beautifully secured.</Text>
        <Text style={styles.heroSub}>
          Unified maternal health records with AI-assisted insights and emergency-ready access.
        </Text>
      </View>

      <Text style={styles.roleLabel}>How will you use YumiCare?</Text>

      <View style={styles.roleCards}>
        {ROLES.map((role) => (
          <TouchableOpacity
            key={role.id}
            style={[
              styles.roleCard,
              selected === role.id && {
                borderColor: role.color,
                borderWidth: 2,
                backgroundColor: role.bg,
              },
            ]}
            onPress={() => {
              setSelected(role.id);
              Haptics.selectionAsync();
            }}
            activeOpacity={0.85}
          >
            <View style={[styles.roleIcon, { backgroundColor: selected === role.id ? role.color : Colors.border }]}>
              <Ionicons
                name={role.icon}
                size={24}
                color={selected === role.id ? Colors.white : Colors.textMuted}
              />
            </View>
            <View style={styles.roleText}>
              <Text style={[styles.roleTitle, selected === role.id && { color: role.color }]}>
                {role.title}
              </Text>
              <Text style={styles.roleSub}>{role.subtitle}</Text>
            </View>
            {selected === role.id && (
              <Ionicons name="checkmark-circle" size={22} color={role.color} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.continueBtn, !selected && styles.continueBtnDisabled]}
        onPress={handleContinue}
        disabled={!selected}
        activeOpacity={0.85}
      >
        <Text style={styles.continueBtnText}>Continue</Text>
        <Ionicons name="arrow-forward" size={18} color={Colors.white} />
      </TouchableOpacity>

      <View style={styles.features}>
        {["HIPAA-grade encryption", "QR Emergency Access", "AI-Powered Insights"].map((f, i) => (
          <View key={i} style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={14} color={Colors.teal} />
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 40,
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.teal,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  hero: {
    marginBottom: 40,
  },
  heroTitle: {
    fontSize: 34,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    lineHeight: 42,
    marginBottom: 12,
  },
  heroSub: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  roleLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textSecondary,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  roleCards: {
    gap: 12,
    marginBottom: 28,
  },
  roleCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  roleIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  roleText: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    marginBottom: 4,
  },
  roleSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  continueBtn: {
    backgroundColor: Colors.teal,
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
  },
  continueBtnDisabled: {
    backgroundColor: Colors.tealMid,
  },
  continueBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
  },
  features: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  featureText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
  },
});
