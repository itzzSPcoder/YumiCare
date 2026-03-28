import React from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
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

export default function DoctorProfile() {
  const { doctorProfile, doctorPatients, setRole, setIsOnboarded } = useApp();
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
    { icon: "notifications-outline" as const, label: "Notifications", route: "/notifications" },
    { icon: "lock-closed-outline" as const, label: "Privacy & Security", route: "/privacy" },
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
            <Ionicons name="medical" size={34} color={Colors.white} />
          </View>
          <Text style={styles.profileName}>{doctorProfile.name}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="medical" size={13} color={Colors.purple} />
            <Text style={styles.roleText}>{doctorProfile.specialization}</Text>
          </View>
          <Text style={styles.hospital}>{doctorProfile.hospital}</Text>
          <Text style={styles.licenseNo}>License: {doctorProfile.licenseNo}</Text>
        </View>

        <View style={styles.statsRow}>
          {[
            { label: "Patients", value: String(doctorProfile.patientsCount), icon: "people-outline" as const, color: Colors.purple, bg: Colors.purpleLight },
            { label: "Years Exp.", value: String(doctorProfile.yearsExp), icon: "ribbon-outline" as const, color: Colors.teal, bg: Colors.tealLight },
            { label: "Alerts", value: String(doctorPatients.filter(p => p.status !== "stable").length), icon: "warning-outline" as const, color: Colors.danger, bg: Colors.dangerLight },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: s.bg }]}>
                <Ionicons name={s.icon} size={18} color={s.color} />
              </View>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contact Information</Text>
          {[
            { icon: "call-outline" as const, label: "Phone", value: doctorProfile.phone },
            { icon: "mail-outline" as const, label: "Email", value: doctorProfile.email },
            { icon: "business-outline" as const, label: "Hospital", value: doctorProfile.hospital },
          ].map((row, i) => (
            <View key={i} style={[styles.contactRow, i > 0 && styles.divider]}>
              <View style={styles.contactIcon}>
                <Ionicons name={row.icon} size={16} color={Colors.purple} />
              </View>
              <View>
                <Text style={styles.contactLabel}>{row.label}</Text>
                <Text style={styles.contactValue}>{row.value}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.patientsHeader}>
            <Text style={styles.cardTitle}>My Patients</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)")} activeOpacity={0.7}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          {doctorPatients.slice(0, 4).map((p, i) => (
            <TouchableOpacity
              key={p.id}
              style={[styles.patientRow, i > 0 && styles.divider]}
              onPress={() => router.push({ pathname: "/patient-detail", params: { id: p.id } })}
              activeOpacity={0.75}
            >
              <View style={styles.patientAvatar}>
                <Text style={styles.patientInitial}>{p.name.charAt(0)}</Text>
              </View>
              <View style={styles.patientInfo}>
                <Text style={styles.patientName}>{p.name}</Text>
                <Text style={styles.patientSub}>Week {p.pregnancyWeek} · Due {p.dueDate}</Text>
              </View>
              <View style={[styles.statusDot, {
                backgroundColor: p.status === "stable" ? Colors.success : p.status === "attention" ? Colors.warning : Colors.danger
              }]} />
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
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
                <Ionicons name={item.icon} size={18} color={Colors.purple} />
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
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.purple,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  profileName: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.text },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.purpleLight,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  roleText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.purple },
  hospital: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textSecondary },
  licenseNo: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted, letterSpacing: 0.5 },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.textMuted, textAlign: "center" },
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
  divider: { borderTopWidth: 1, borderTopColor: Colors.border },
  contactRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  contactIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.purpleLight,
    alignItems: "center",
    justifyContent: "center",
  },
  contactLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  contactValue: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.text },
  patientsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  viewAll: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.purple },
  patientRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12 },
  patientAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.purpleLight,
    alignItems: "center",
    justifyContent: "center",
  },
  patientInitial: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.purple },
  patientInfo: { flex: 1 },
  patientName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text },
  patientSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 1 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
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
    backgroundColor: Colors.purpleLight,
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
