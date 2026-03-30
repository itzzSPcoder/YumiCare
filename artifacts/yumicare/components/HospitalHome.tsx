import React, { useState } from "react";
import {
  Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";

const H_COLOR = Colors.purple;
const H_LIGHT = Colors.purpleLight;

export default function HospitalHome() {
  const { currentUser, allHospitals, hospitalDoctors, allPatients, notifications } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;
  const hospital = allHospitals.find((h) => h.id === currentUser?.id);
  const unread = notifications.filter((n) => !n.read).length;
  const criticalPatients = allPatients.filter((p) => p.status === "critical");

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View>
          <Text style={styles.greeting}>Hospital Portal</Text>
          <Text style={styles.name}>{hospital?.name ?? currentUser?.name}</Text>
          <Text style={styles.city}>{hospital?.city} · {hospital?.type}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push("/notifications")} activeOpacity={0.8}>
            <Ionicons name="notifications-outline" size={22} color={Colors.text} />
            {unread > 0 && (
              <View style={styles.badge}><Text style={styles.badgeText}>{unread}</Text></View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: H_LIGHT }]} onPress={() => router.push("/add-doctor")} activeOpacity={0.8}>
            <Ionicons name="person-add-outline" size={22} color={H_COLOR} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ padding: 20, paddingBottom: bottomPad, gap: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 800); }} tintColor={H_COLOR} />}
      >
        <View style={styles.statsRow}>
          {[
            { label: "Doctors", value: String(hospitalDoctors.length), icon: "medical-outline" as const, color: H_COLOR, bg: H_LIGHT },
            { label: "Patients", value: String(allPatients.length), icon: "people-outline" as const, color: Colors.teal, bg: Colors.tealLight },
            { label: "Beds", value: String(hospital?.beds ?? 0), icon: "bed-outline" as const, color: "#5B8FF9", bg: "#EEF3FF" },
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

        <View style={styles.quickActions}>
          {[
            { icon: "person-add-outline" as const, label: "Add Doctor", route: "/add-doctor", color: H_COLOR, bg: H_LIGHT },
            { icon: "people-outline" as const, label: "All Doctors", route: "/(tabs)/timeline", color: "#5B8FF9", bg: "#EEF3FF" },
            { icon: "heart-outline" as const, label: "Patients", route: "/(tabs)/records", color: Colors.teal, bg: Colors.tealLight },
            { icon: "ribbon-outline" as const, label: "Accreditation", route: "/(tabs)/profile", color: Colors.warning, bg: Colors.warningLight },
          ].map((a, i) => (
            <TouchableOpacity key={i} style={styles.qaItem} onPress={() => router.push(a.route as any)} activeOpacity={0.75}>
              <View style={[styles.qaIcon, { backgroundColor: a.bg }]}>
                <Ionicons name={a.icon} size={22} color={a.color} />
              </View>
              <Text style={styles.qaLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {criticalPatients.length > 0 && (
          <View style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <Ionicons name="alert-circle" size={16} color={Colors.danger} />
              <Text style={styles.alertTitle}>Critical Patients</Text>
              <Text style={styles.alertCount}>{criticalPatients.length}</Text>
            </View>
            {criticalPatients.map((p, i) => (
              <View key={p.id} style={[styles.alertRow, i > 0 && { borderTopWidth: 1, borderTopColor: Colors.border }]}>
                <View style={styles.redDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.alertName}>{p.name}</Text>
                  <Text style={styles.alertSub}>Week {p.pregnancyWeek} · {p.bloodGroup}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Our Doctors</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/timeline")} activeOpacity={0.8}>
            <Text style={[styles.sectionLink, { color: H_COLOR }]}>View All</Text>
          </TouchableOpacity>
        </View>

        {hospitalDoctors.slice(0, 3).map((d) => (
          <TouchableOpacity
            key={d.id}
            style={styles.doctorRow}
            onPress={() => router.push({ pathname: "/doctor-detail", params: { id: d.id } })}
            activeOpacity={0.8}
          >
            <View style={[styles.docAvatar, { backgroundColor: H_LIGHT }]}>
              <Text style={[styles.docInitial, { color: H_COLOR }]}>{d.name.charAt(4)}</Text>
            </View>
            <View style={styles.docInfo}>
              <Text style={styles.docName}>{d.name}</Text>
              <Text style={styles.docSpec}>{d.specialization}</Text>
            </View>
            <View style={styles.docRight}>
              <Text style={styles.docPatients}>{d.patientsCount} patients</Text>
              <View style={[styles.statusBadge, { backgroundColor: d.status === "active" ? "#EAF9F0" : Colors.border }]}>
                <Text style={[styles.statusText, { color: d.status === "active" ? Colors.success : Colors.textMuted }]}>{d.status}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 20, paddingBottom: 16 },
  greeting: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.textMuted, textTransform: "uppercase", letterSpacing: 0.6 },
  name: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.text, marginTop: 2 },
  city: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.purple, marginTop: 2 },
  headerActions: { flexDirection: "row", gap: 8 },
  iconBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center", shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2 },
  badge: { position: "absolute", top: 6, right: 6, width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.danger, alignItems: "center", justifyContent: "center" },
  badgeText: { fontSize: 9, fontFamily: "Inter_700Bold", color: Colors.white },
  scroll: { flex: 1 },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, backgroundColor: Colors.white, borderRadius: 16, padding: 14, alignItems: "center", gap: 4, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 1 },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  quickActions: { flexDirection: "row", justifyContent: "space-between", backgroundColor: Colors.white, borderRadius: 20, padding: 16, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 1 },
  qaItem: { alignItems: "center", gap: 8 },
  qaIcon: { width: 50, height: 50, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  qaLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: Colors.textSecondary },
  alertCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, borderLeftWidth: 3, borderLeftColor: Colors.danger, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 1 },
  alertHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  alertTitle: { flex: 1, fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.danger },
  alertCount: { fontSize: 12, fontFamily: "Inter_700Bold", color: Colors.danger, backgroundColor: Colors.dangerLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  alertRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  redDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.danger },
  alertName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text },
  alertSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text },
  sectionLink: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  doctorRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: Colors.white, borderRadius: 16, padding: 14, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 1 },
  docAvatar: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  docInitial: { fontSize: 18, fontFamily: "Inter_700Bold" },
  docInfo: { flex: 1 },
  docName: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.text },
  docSpec: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  docRight: { alignItems: "flex-end", gap: 4 },
  docPatients: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.textSecondary },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  statusText: { fontSize: 10, fontFamily: "Inter_600SemiBold", textTransform: "capitalize" },
});
