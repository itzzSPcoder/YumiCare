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

export default function PatientProfile() {
  const { patient, setRole, setIsOnboarded, emergencyAccessEnabled, setEmergencyAccessEnabled } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;

  const handleSwitchRole = () => {
    Alert.alert("Switch Role", "Go back to role selection?", [
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
    ]);
  };

  const menuItems = [
    { icon: "medical-outline" as const, label: "My Medications", route: "/medications" },
    { icon: "warning-outline" as const, label: "Allergies", route: "/allergies" },
    { icon: "notifications-outline" as const, label: "Notifications", route: "/notifications" },
    { icon: "lock-closed-outline" as const, label: "Privacy & Security", route: "/privacy" },
    { icon: "share-social-outline" as const, label: "Share Records", route: "/(tabs)/records" },
    { icon: "help-circle-outline" as const, label: "Help & Support", route: "/help" },
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={styles.title}>My Profile</Text>
      </View>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: bottomPad, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={34} color={Colors.white} />
          </View>
          <Text style={styles.profileName}>{patient?.name ?? "Patient"}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="heart" size={13} color={Colors.teal} />
            <Text style={styles.roleText}>Patient</Text>
          </View>
          <Text style={styles.patientId}>{patient?.id}</Text>
          <TouchableOpacity
            style={styles.qrBtn}
            onPress={() => router.push("/qr")}
            activeOpacity={0.8}
          >
            <Ionicons name="qr-code-outline" size={16} color={Colors.white} />
            <Text style={styles.qrBtnText}>View Health ID</Text>
          </TouchableOpacity>
        </View>

        {patient && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Health Overview</Text>
            {[
              { label: "Age", value: `${patient.age} years` },
              { label: "Blood Group", value: patient.bloodGroup },
              { label: "Pregnancy Week", value: `Week ${patient.pregnancyWeek}` },
              { label: "Due Date", value: patient.dueDate },
              { label: "Primary Doctor", value: patient.primaryDoctor },
            ].map((row, i) => (
              <View key={i} style={[styles.infoRow, i > 0 && styles.divider]}>
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Text style={styles.infoValue}>{row.value}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <View style={styles.toggleIconWrap}>
                <Ionicons name="shield-checkmark-outline" size={18} color={Colors.danger} />
              </View>
              <View>
                <Text style={styles.toggleLabel}>Emergency Access</Text>
                <Text style={styles.toggleSub}>Let emergency doctors view critical info</Text>
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
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.menuRow, i > 0 && styles.divider]}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.75}
            >
              <View style={styles.menuIconWrap}>
                <Ionicons name={item.icon} size={18} color={Colors.teal} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.switchBtn} onPress={handleSwitchRole} activeOpacity={0.8}>
          <Ionicons name="swap-horizontal-outline" size={18} color={Colors.danger} />
          <Text style={styles.switchBtnText}>Switch Role</Text>
        </TouchableOpacity>
        <Text style={styles.version}>YumiCare v1.0.0 · Secure Maternal Healthcare</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 24, fontFamily: "Inter_700Bold", color: Colors.text },
  profileCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    gap: 6,
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
    backgroundColor: Colors.teal,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  profileName: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.text },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.tealLight,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  roleText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.teal },
  patientId: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted, letterSpacing: 0.5 },
  qrBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.teal,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 6,
  },
  qrBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.white },
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
  cardTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.text, marginBottom: 12 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10 },
  divider: { borderTopWidth: 1, borderTopColor: Colors.border },
  infoLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textSecondary },
  infoValue: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.text },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  toggleLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  toggleIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.dangerLight,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text },
  toggleSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 2 },
  menuCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  menuRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.tealLight,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium", color: Colors.text },
  switchBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.dangerLight,
    borderRadius: 14,
    padding: 14,
  },
  switchBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.danger },
  version: { textAlign: "center", fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted },
});
