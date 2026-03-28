import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

export default function PrivacyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [settings, setSettings] = useState({
    biometric: true,
    twoFactor: false,
    auditLog: true,
    anonymousData: false,
    locationAccess: false,
  });

  const toggle = (key: keyof typeof settings) => {
    Haptics.selectionAsync();
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleItems = [
    { key: "biometric" as const, label: "Biometric Lock", sub: "Use Face ID or fingerprint to open app", icon: "finger-print-outline" as const },
    { key: "twoFactor" as const, label: "Two-Factor Authentication", sub: "Extra security for your account", icon: "shield-outline" as const },
    { key: "auditLog" as const, label: "Audit Logging", sub: "Track every access to your records", icon: "document-text-outline" as const },
    { key: "anonymousData" as const, label: "Share Anonymous Data", sub: "Help improve maternal care research", icon: "analytics-outline" as const },
    { key: "locationAccess" as const, label: "Location Access", sub: "For nearby hospital suggestions", icon: "location-outline" as const },
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Privacy & Security</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.secureCard}>
          <Ionicons name="shield-checkmark" size={28} color={Colors.teal} />
          <View style={styles.secureInfo}>
            <Text style={styles.secureTitle}>AES-256 Encryption Active</Text>
            <Text style={styles.secureSub}>All your data is encrypted end-to-end</Text>
          </View>
          <View style={styles.secureBadge}>
            <Text style={styles.secureBadgeText}>Secure</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Security Settings</Text>
          {toggleItems.map((item, i) => (
            <View key={item.key} style={[styles.toggleRow, i > 0 && styles.divider]}>
              <View style={styles.toggleLeft}>
                <View style={styles.toggleIcon}>
                  <Ionicons name={item.icon} size={17} color={Colors.teal} />
                </View>
                <View style={styles.toggleText}>
                  <Text style={styles.toggleLabel}>{item.label}</Text>
                  <Text style={styles.toggleSub}>{item.sub}</Text>
                </View>
              </View>
              <Switch
                value={settings[item.key]}
                onValueChange={() => toggle(item.key)}
                trackColor={{ false: Colors.border, true: Colors.teal }}
                thumbColor={Colors.white}
              />
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Data & Access</Text>
          {[
            { icon: "download-outline" as const, label: "Export My Data", sub: "Download a copy of your records", color: Colors.teal },
            { icon: "trash-outline" as const, label: "Delete Account", sub: "Permanently remove all data", color: Colors.danger },
          ].map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.actionRow, i > 0 && styles.divider]}
              activeOpacity={0.75}
            >
              <View style={[styles.toggleIcon, { backgroundColor: item.color + "15" }]}>
                <Ionicons name={item.icon} size={17} color={item.color} />
              </View>
              <View style={styles.toggleText}>
                <Text style={[styles.toggleLabel, { color: item.color }]}>{item.label}</Text>
                <Text style={styles.toggleSub}>{item.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="lock-closed-outline" size={16} color={Colors.teal} />
          <Text style={styles.infoText}>
            YumiCare follows HIPAA-compliant privacy standards. Your medical data is never sold or shared without your consent.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
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
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  title: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text },
  secureCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.tealLight,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.teal + "30",
  },
  secureInfo: { flex: 1 },
  secureTitle: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.tealDark },
  secureSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.teal, marginTop: 2 },
  secureBadge: { backgroundColor: Colors.teal, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  secureBadgeText: { fontSize: 11, fontFamily: "Inter_700Bold", color: Colors.white },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.text, marginBottom: 14 },
  divider: { borderTopWidth: 1, borderTopColor: Colors.border },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12 },
  actionRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  toggleLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  toggleIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.tealLight,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleText: { flex: 1 },
  toggleLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text },
  toggleSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 2 },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: Colors.tealLight,
    borderRadius: 14,
    padding: 14,
  },
  infoText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.tealDark, lineHeight: 19 },
});
