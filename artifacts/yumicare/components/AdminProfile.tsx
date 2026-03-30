import React from "react";
import {
  Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";

const ADMIN_COLOR = "#E67E22";
const ADMIN_LIGHT = "#FEF5E7";

export default function AdminProfile() {
  const { adminProfile, allHospitals, allDoctors, allUsers, logout } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={styles.title}>Profile</Text>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ padding: 20, paddingBottom: bottomPad, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: ADMIN_LIGHT }]}>
            <Ionicons name="shield-checkmark" size={36} color={ADMIN_COLOR} />
          </View>
          <Text style={styles.profileName}>{adminProfile.name}</Text>
          <Text style={[styles.profileRole, { color: ADMIN_COLOR }]}>Super Administrator</Text>
          <Text style={styles.profileEmail}>{adminProfile.email}</Text>
          <View style={styles.fullAccessBadge}>
            <Ionicons name="lock-open-outline" size={12} color={ADMIN_COLOR} />
            <Text style={[styles.fullAccessText, { color: ADMIN_COLOR }]}>Full System Access</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          {[
            { label: "Hospitals", value: allHospitals.length, icon: "business-outline" as const, color: ADMIN_COLOR, bg: ADMIN_LIGHT },
            { label: "Doctors", value: allDoctors.length, icon: "medical-outline" as const, color: "#5B8FF9", bg: "#EEF3FF" },
            { label: "Patients", value: allUsers.filter(u => u.role === "patient").length, icon: "people-outline" as const, color: Colors.teal, bg: Colors.tealLight },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: s.bg }]}>
                <Ionicons name={s.icon} size={16} color={s.color} />
              </View>
              <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Admin Actions</Text>
          {[
            { icon: "add-circle-outline" as const, label: "Add New Hospital", sub: "Register a hospital & generate credentials", action: () => router.push("/add-hospital"), color: ADMIN_COLOR },
            { icon: "business-outline" as const, label: "Manage Hospitals", sub: "View, edit & deactivate hospitals", action: () => router.push("/(tabs)/timeline"), color: Colors.purple },
            { icon: "bar-chart-outline" as const, label: "System Reports", sub: "View platform-wide analytics", action: () => router.push("/admin-reports"), color: "#5B8FF9" },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={styles.menuItem} onPress={item.action} activeOpacity={0.8}>
              <View style={[styles.menuIcon, { backgroundColor: item.color + "20" }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSub}>{item.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Info</Text>
          {[
            { label: "App Version", value: "1.0.0" },
            { label: "Environment", value: "Production" },
            { label: "Admin ID", value: adminProfile.id },
          ].map((item, i) => (
            <View key={i} style={styles.infoRow}>
              <Text style={styles.infoLabel}>{item.label}</Text>
              <Text style={styles.infoValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", color: Colors.text },
  scroll: { flex: 1 },
  profileCard: { backgroundColor: Colors.white, borderRadius: 20, padding: 24, alignItems: "center", gap: 6, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 3 },
  avatar: { width: 80, height: 80, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  profileName: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.text },
  profileRole: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  profileEmail: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  fullAccessBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#FEF5E7", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginTop: 4 },
  fullAccessText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, backgroundColor: Colors.white, borderRadius: 14, padding: 12, alignItems: "center", gap: 4, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 1 },
  statIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statVal: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  section: { backgroundColor: Colors.white, borderRadius: 18, padding: 16, gap: 4, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 1 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.text, marginBottom: 8 },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  menuIcon: { width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  menuInfo: { flex: 1 },
  menuLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text },
  menuSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 1 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  infoLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  infoValue: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.text },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: Colors.white, borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: Colors.danger + "40" },
  logoutText: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.danger },
});
