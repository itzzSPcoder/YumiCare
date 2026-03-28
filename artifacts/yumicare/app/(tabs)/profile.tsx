import React from "react";
import {
  Alert,
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
import { useApp } from "@/context/AppContext";

const MENU_ITEMS = [
  { icon: "notifications-outline" as const, label: "Notifications", arrow: true },
  { icon: "lock-closed-outline" as const, label: "Privacy & Security", arrow: true },
  { icon: "share-social-outline" as const, label: "Share Records", arrow: true },
  { icon: "help-circle-outline" as const, label: "Help & Support", arrow: true },
];

export default function ProfileScreen() {
  const { patient, role, setRole, setIsOnboarded, emergencyAccessEnabled, setEmergencyAccessEnabled } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;

  const handleLogout = () => {
    Alert.alert(
      "Switch Role",
      "Go back to role selection?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Switch",
          style: "destructive",
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await setIsOnboarded(false);
            await setRole(null);
            router.replace("/onboarding");
          },
        },
      ]
    );
  };

  const roleColor = role === "doctor" ? Colors.purple : Colors.teal;
  const roleBg = role === "doctor" ? Colors.purpleLight : Colors.tealLight;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ padding: 20, paddingBottom: bottomPad, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: roleColor }]}>
            <Ionicons
              name={role === "doctor" ? "medical" : "person"}
              size={32}
              color={Colors.white}
            />
          </View>
          <Text style={styles.profileName}>{patient?.name ?? "User"}</Text>
          <View style={[styles.roleBadge, { backgroundColor: roleBg }]}>
            <Text style={[styles.roleText, { color: roleColor }]}>
              {role === "doctor" ? "Doctor" : "Patient"}
            </Text>
          </View>
          {patient && (
            <Text style={styles.patientId}>{patient.id}</Text>
          )}
        </View>

        {patient && (
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Health Overview</Text>
            {[
              { label: "Age", value: `${patient.age} years` },
              { label: "Blood Group", value: patient.bloodGroup },
              { label: "Pregnancy Week", value: `Week ${patient.pregnancyWeek}` },
              { label: "Due Date", value: patient.dueDate },
              { label: "Primary Doctor", value: patient.primaryDoctor },
            ].map((row, i) => (
              <View
                key={i}
                style={[styles.infoRow, i > 0 && { borderTopWidth: 1, borderTopColor: Colors.border }]}
              >
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Text style={styles.infoValue}>{row.value}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.toggleCard}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Ionicons name="shield-checkmark-outline" size={18} color={Colors.danger} />
              <View>
                <Text style={styles.toggleLabel}>Emergency Access</Text>
                <Text style={styles.toggleSub}>Allow emergency doctors to view critical info</Text>
              </View>
            </View>
            <Switch
              value={emergencyAccessEnabled}
              onValueChange={(v) => {
                Haptics.selectionAsync();
                setEmergencyAccessEnabled(v);
              }}
              trackColor={{ false: Colors.border, true: Colors.teal }}
              thumbColor={Colors.white}
            />
          </View>
        </View>

        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.menuRow, i > 0 && { borderTopWidth: 1, borderTopColor: Colors.border }]}
              activeOpacity={0.75}
            >
              <View style={styles.menuIconWrap}>
                <Ionicons name={item.icon} size={18} color={Colors.textSecondary} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              {item.arrow && (
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.switchBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="swap-horizontal-outline" size={18} color={Colors.danger} />
          <Text style={styles.switchBtnText}>Switch Role</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>YumiCare v1.0.0</Text>
          <Text style={styles.footerText}>Secure Maternal Healthcare Platform</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  scroll: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  profileName: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    marginBottom: 8,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 8,
  },
  roleText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  patientId: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  infoLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  toggleCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  toggleLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  toggleSub: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    marginTop: 1,
  },
  menuCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.text,
  },
  switchBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.dangerLight,
    borderRadius: 14,
    padding: 14,
  },
  switchBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.danger,
  },
  footer: {
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
  },
});
