import React, { useState } from "react";
import {
  Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";

const ADMIN_COLOR = "#E67E22";
const ADMIN_LIGHT = "#FEF5E7";

export default function AdminHome() {
  const { adminProfile, allHospitals, allDoctors, allUsers, notifications } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;
  const unread = notifications.filter((n) => !n.read).length;
  const totalPatients = allUsers.filter((u) => u.role === "patient").length;
  const activeHospitals = allHospitals.length;
  const activeDoctors = allDoctors.filter((d) => d.status === "active").length;

  const stats = [
    { label: "Hospitals", value: String(activeHospitals), icon: "business-outline" as const, color: ADMIN_COLOR, bg: ADMIN_LIGHT },
    { label: "Doctors", value: String(activeDoctors), icon: "medical-outline" as const, color: "#5B8FF9", bg: "#EEF3FF" },
    { label: "Patients", value: String(totalPatients), icon: "people-outline" as const, color: Colors.teal, bg: Colors.tealLight },
    { label: "Users", value: String(allUsers.length), icon: "person-outline" as const, color: Colors.purple, bg: Colors.purpleLight },
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View>
          <Text style={styles.greeting}>System Administrator</Text>
          <Text style={styles.name}>YumiCare Admin Portal</Text>
          <Text style={[styles.badge, { color: ADMIN_COLOR }]}>Super Admin · Full Access</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push("/notifications")} activeOpacity={0.8}>
            <Ionicons name="notifications-outline" size={22} color={Colors.text} />
            {unread > 0 && (
              <View style={styles.notifDot}>
                <Text style={styles.notifDotText}>{unread}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: ADMIN_LIGHT }]} onPress={() => router.push("/admin-reports")} activeOpacity={0.8}>
            <Ionicons name="bar-chart-outline" size={22} color={ADMIN_COLOR} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ padding: 20, paddingBottom: bottomPad, gap: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 800); }} tintColor={ADMIN_COLOR} />}
      >
        <View style={[styles.systemCard, { borderLeftColor: ADMIN_COLOR }]}>
          <View style={styles.systemRow}>
            <View style={[styles.systemIcon, { backgroundColor: ADMIN_LIGHT }]}>
              <Ionicons name="checkmark-circle" size={20} color={ADMIN_COLOR} />
            </View>
            <View>
              <Text style={styles.systemStatus}>All Systems Operational</Text>
              <Text style={styles.systemSub}>Last checked: just now · Uptime 99.9%</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          {stats.map((s, i) => (
            <View key={i} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: s.bg }]}>
                <Ionicons name={s.icon} size={18} color={s.color} />
              </View>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actionsRow}>
          {[
            { icon: "add-circle-outline" as const, label: "Add Hospital", color: ADMIN_COLOR, bg: ADMIN_LIGHT, route: "/add-hospital" },
            { icon: "business-outline" as const, label: "Hospitals", color: Colors.purple, bg: Colors.purpleLight, route: "/(tabs)/timeline" },
            { icon: "bar-chart-outline" as const, label: "Reports", color: "#5B8FF9", bg: "#EEF3FF", route: "/admin-reports" },
            { icon: "settings-outline" as const, label: "Settings", color: Colors.teal, bg: Colors.tealLight, route: "/(tabs)/profile" },
          ].map((a, i) => (
            <TouchableOpacity key={i} style={styles.actionItem} onPress={() => router.push(a.route as any)} activeOpacity={0.75}>
              <View style={[styles.actionIcon, { backgroundColor: a.bg }]}>
                <Ionicons name={a.icon} size={22} color={a.color} />
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Registered Hospitals</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/timeline")} activeOpacity={0.8}>
            <Text style={[styles.sectionLink, { color: ADMIN_COLOR }]}>View All</Text>
          </TouchableOpacity>
        </View>

        {allHospitals.map((h) => (
          <TouchableOpacity
            key={h.id}
            style={styles.hospitalCard}
            onPress={() => router.push({ pathname: "/hospital-detail", params: { id: h.id } })}
            activeOpacity={0.8}
          >
            <View style={[styles.hospitalAvatar, { backgroundColor: ADMIN_LIGHT }]}>
              <Ionicons name="business" size={20} color={ADMIN_COLOR} />
            </View>
            <View style={styles.hospitalInfo}>
              <Text style={styles.hospitalName}>{h.name}</Text>
              <Text style={styles.hospitalMeta}>{h.city} · {h.type} · {h.doctors} doctors</Text>
              <Text style={styles.hospitalAccred}>{h.accreditation}</Text>
            </View>
            <View style={styles.hospitalRight}>
              <View style={[styles.activeBadge, { backgroundColor: "#EAF9F0" }]}>
                <View style={styles.activeDot} />
                <Text style={styles.activeText}>Active</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
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
  greeting: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.textMuted, textTransform: "uppercase", letterSpacing: 0.8 },
  name: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.text, marginTop: 2 },
  badge: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginTop: 2 },
  headerActions: { flexDirection: "row", gap: 8 },
  iconBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center", shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2 },
  notifDot: { position: "absolute", top: 6, right: 6, width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.danger, alignItems: "center", justifyContent: "center" },
  notifDotText: { fontSize: 9, fontFamily: "Inter_700Bold", color: Colors.white },
  scroll: { flex: 1 },
  systemCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, borderLeftWidth: 3, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 1 },
  systemRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  systemIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  systemStatus: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.success },
  systemSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: { width: "47%", backgroundColor: Colors.white, borderRadius: 16, padding: 14, alignItems: "center", gap: 4, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 1 },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 24, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  actionsRow: { flexDirection: "row", justifyContent: "space-between", backgroundColor: Colors.white, borderRadius: 20, padding: 16, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 1 },
  actionItem: { alignItems: "center", gap: 8 },
  actionIcon: { width: 50, height: 50, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  actionLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: Colors.textSecondary },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text },
  sectionLink: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  hospitalCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: Colors.white, borderRadius: 16, padding: 14, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 1 },
  hospitalAvatar: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  hospitalInfo: { flex: 1, gap: 2 },
  hospitalName: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.text },
  hospitalMeta: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  hospitalAccred: { fontSize: 11, fontFamily: "Inter_500Medium", color: Colors.success },
  hospitalRight: { alignItems: "flex-end", gap: 6 },
  activeBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
  activeText: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: Colors.success },
});
