import React from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { SectionHeader } from "./SectionHeader";

const ADMIN_COLOR = "#E67E22";
const ADMIN_LIGHT = "#FEF5E7";

export default function AdminHome() {
  const { allHospitals, allDoctors, allUsers, auditLogs } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;

  const totalPatients = allUsers.filter(u => u.role === "patient").length;
  const activeUsers = allUsers.filter(u => u.isActive).length;
  const inactiveUsers = allUsers.filter(u => !u.isActive).length;
  const recentLogs = auditLogs.slice(0, 5);
  const lastSync = new Date().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" });

  const systemChecks = [
    { label: "Hospitals", value: allHospitals.length > 0 ? "Active" : "None", ok: allHospitals.length > 0 },
    { label: "Doctors", value: allDoctors.length > 0 ? "Active" : "None", ok: allDoctors.length > 0 },
    { label: "Patient Records", value: totalPatients > 0 ? "Active" : "None", ok: totalPatients > 0 },
    { label: "Active Users", value: `${activeUsers}/${allUsers.length}`, ok: inactiveUsers === 0 },
    { label: "Last Data Sync", value: lastSync, ok: true },
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View>
          <Text style={styles.greeting}>Admin Dashboard</Text>
          <Text style={styles.sub}>Platform Overview</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn} onPress={() => router.push("/notifications")} activeOpacity={0.8}>
          <Ionicons name="notifications-outline" size={22} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: bottomPad, gap: 20 }} showsVerticalScrollIndicator={false}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {[
            { label: "Hospitals", value: allHospitals.length, icon: "business-outline" as const, color: ADMIN_COLOR, bg: ADMIN_LIGHT },
            { label: "Doctors", value: allDoctors.length, icon: "medical-outline" as const, color: "#5B8FF9", bg: "#EEF3FF" },
            { label: "Patients", value: totalPatients, icon: "people-outline" as const, color: Colors.teal, bg: Colors.tealLight },
            { label: "Users", value: allUsers.length, icon: "person-outline" as const, color: Colors.purple, bg: Colors.purpleLight },
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

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: ADMIN_LIGHT }]} onPress={() => router.push("/add-hospital")} activeOpacity={0.85}>
            <Ionicons name="add-circle-outline" size={20} color={ADMIN_COLOR} />
            <Text style={[styles.actionText, { color: ADMIN_COLOR }]}>Add Hospital</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#EEF3FF" }]} onPress={() => router.push("/user-management" as any)} activeOpacity={0.85}>
            <Ionicons name="people-outline" size={20} color="#5B8FF9" />
            <Text style={[styles.actionText, { color: "#5B8FF9" }]}>Users</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.purpleLight }]} onPress={() => router.push("/audit-trail" as any)} activeOpacity={0.85}>
            <Ionicons name="list-outline" size={20} color={Colors.purple} />
            <Text style={[styles.actionText, { color: Colors.purple }]}>Audit</Text>
          </TouchableOpacity>
        </View>

        {/* System Status */}
        <View>
          <SectionHeader title="System Status" />
          <View style={styles.statusCard}>
            {systemChecks.map((check, i) => (
              <View key={i} style={[styles.statusRow, i > 0 && styles.divider]}>
                <View style={[styles.statusDot, { backgroundColor: check.ok ? Colors.success : Colors.warning }]} />
                <Text style={styles.statusLabel}>{check.label}</Text>
                <Text style={[styles.statusValue, { color: check.ok ? Colors.success : Colors.warning }]}>{check.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View>
          <SectionHeader title="Recent Activity" actionText="View All" onAction={() => router.push("/audit-trail" as any)} />
          <View style={styles.activityCard}>
            {recentLogs.map((log, i) => (
              <View key={log.id} style={[styles.activityRow, i > 0 && styles.divider]}>
                <View style={[styles.activityDot, { backgroundColor: ADMIN_COLOR }]} />
                <View style={styles.activityInfo}>
                  <Text style={styles.activityAction}>{log.action}</Text>
                  <Text style={styles.activityDetails}>{log.userName} · {log.details}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingHorizontal: 20, paddingBottom: 8 },
  greeting: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.text },
  sub: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.textMuted, marginTop: 2 },
  notifBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center", shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: { width: "47%", backgroundColor: Colors.white, borderRadius: 16, padding: 16, alignItems: "center", gap: 6, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 1 },
  statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 28, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  actionsRow: { flexDirection: "row", gap: 10 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 14, padding: 14 },
  actionText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  statusCard: { backgroundColor: Colors.white, borderRadius: 18, overflow: "hidden", shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14 },
  divider: { borderTopWidth: 1, borderTopColor: Colors.border },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusLabel: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.text },
  statusValue: { fontSize: 13, fontFamily: "Inter_700Bold" },
  activityCard: { backgroundColor: Colors.white, borderRadius: 18, overflow: "hidden", shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  activityRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14 },
  activityDot: { width: 8, height: 8, borderRadius: 4 },
  activityInfo: { flex: 1 },
  activityAction: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.text },
  activityDetails: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 1 },
});
