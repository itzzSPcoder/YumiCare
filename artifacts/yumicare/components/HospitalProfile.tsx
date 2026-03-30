import React from "react";
import {
  Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";

const H_COLOR = Colors.purple;
const H_LIGHT = Colors.purpleLight;

export default function HospitalProfile() {
  const { currentUser, allHospitals, hospitalDoctors, allPatients, logout } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;
  const hospital = allHospitals.find((h) => h.id === currentUser?.id);

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure?", [
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
          <View style={[styles.avatar, { backgroundColor: H_LIGHT }]}>
            <Ionicons name="business" size={36} color={H_COLOR} />
          </View>
          <Text style={styles.hospName}>{hospital?.name ?? currentUser?.name}</Text>
          <Text style={[styles.hospType, { color: H_COLOR }]}>{hospital?.type ?? "Hospital"}</Text>
          <Text style={styles.hospCity}>{hospital?.city} · {hospital?.accreditation}</Text>
        </View>

        <View style={styles.statsRow}>
          {[
            { label: "Doctors", value: hospitalDoctors.length, icon: "medical-outline" as const, color: H_COLOR },
            { label: "Patients", value: allPatients.length, icon: "people-outline" as const, color: Colors.teal },
            { label: "Beds", value: hospital?.beds ?? 0, icon: "bed-outline" as const, color: "#5B8FF9" },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Ionicons name={s.icon} size={20} color={s.color} />
              <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hospital Details</Text>
          {[
            { label: "Address", value: hospital?.address ?? "-" },
            { label: "Phone", value: hospital?.phone ?? "-" },
            { label: "Email", value: hospital?.email ?? "-" },
            { label: "Accreditation", value: hospital?.accreditation ?? "-" },
          ].map((item, i) => (
            <View key={i} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{item.label}</Text>
              <Text style={styles.detailValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Management</Text>
          {[
            { icon: "person-add-outline" as const, label: "Add New Doctor", sub: "Create doctor account & credentials", action: () => router.push("/add-doctor") },
            { icon: "medical-outline" as const, label: "Manage Doctors", sub: "View and manage your doctors", action: () => router.push("/(tabs)/timeline") },
            { icon: "people-outline" as const, label: "View Patients", sub: "All patients in your hospital", action: () => router.push("/(tabs)/records") },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={styles.menuItem} onPress={item.action} activeOpacity={0.8}>
              <View style={[styles.menuIcon, { backgroundColor: H_LIGHT }]}>
                <Ionicons name={item.icon} size={20} color={H_COLOR} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSub}>{item.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
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
  hospName: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.text, textAlign: "center" },
  hospType: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  hospCity: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, backgroundColor: Colors.white, borderRadius: 14, padding: 14, alignItems: "center", gap: 4, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 1 },
  statVal: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  section: { backgroundColor: Colors.white, borderRadius: 18, padding: 16, gap: 4, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 1 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.text, marginBottom: 8 },
  detailRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  detailLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  detailValue: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.text, flex: 1, textAlign: "right" },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  menuIcon: { width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  menuLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text },
  menuSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 1 },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: Colors.white, borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: Colors.danger + "40" },
  logoutText: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.danger },
});
