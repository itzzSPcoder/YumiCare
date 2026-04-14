import React from "react";
import {
  Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";

const ADMIN_COLOR = "#E67E22";
const ADMIN_LIGHT = "#FEF5E7";

export default function AdminReports() {
  const { allHospitals, allDoctors, allUsers, auditLogs, appointments } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;
  const totalPatients = allUsers.filter((u) => u.role === "patient").length;
  const totalDoctors = allDoctors.length;
  const totalHospitals = allHospitals.length;
  const totalApts = appointments.length;
  const completedApts = appointments.filter(a => a.status === "completed").length;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={styles.title}>System Reports</Text>
        <Text style={styles.sub}>Platform-wide statistics</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ padding: 20, paddingBottom: bottomPad, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsRow}>
          {[
            { label: "Total Hospitals", value: totalHospitals, icon: "business-outline" as const, color: ADMIN_COLOR, bg: ADMIN_LIGHT },
            { label: "Total Doctors", value: totalDoctors, icon: "medical-outline" as const, color: "#5B8FF9", bg: "#EEF3FF" },
            { label: "Total Patients", value: totalPatients, icon: "people-outline" as const, color: Colors.teal, bg: Colors.tealLight },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: s.bg }]}>
                <Ionicons name={s.icon} size={18} color={s.color} />
              </View>
              <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Platform Metrics</Text>
          <Text style={styles.cardSub}>Real-time statistics</Text>
          <View style={styles.metricsGrid}>
            {[
              { label: "Total Appointments", value: totalApts, color: Colors.teal },
              { label: "Completed Visits", value: completedApts, color: Colors.success },
              { label: "Pending Visits", value: totalApts - completedApts, color: Colors.warning },
              { label: "Audit Actions", value: auditLogs.length, color: Colors.purple },
            ].map((m, i) => (
              <View key={i} style={styles.metricCard}>
                <Text style={[styles.metricVal, { color: m.color }]}>{m.value}</Text>
                <Text style={styles.metricLabel}>{m.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Hospital Summary</Text>
          <View style={{ gap: 10, marginTop: 8 }}>
            {allHospitals.map((h) => {
              const dcount = allDoctors.filter((d) => d.hospitalId === h.id).length;
              return (
                <View key={h.id} style={styles.hospitalRow}>
                  <View style={[styles.hAvatar, { backgroundColor: ADMIN_LIGHT }]}>
                    <Ionicons name="business" size={16} color={ADMIN_COLOR} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.hName}>{h.name}</Text>
                    <Text style={styles.hMeta}>{h.city} · {dcount} doctors · {h.patients} patients</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Platform Health</Text>
          <View style={{ gap: 12, marginTop: 8 }}>
            {[
              { label: "Data Storage", value: "AsyncStorage", status: "good" },
              { label: "Active Users", value: `${allUsers.filter(u => u.isActive).length}/${allUsers.length}`, status: allUsers.filter(u => !u.isActive).length === 0 ? "good" : "warn" },
              { label: "Total Records", value: `${totalPatients + totalDoctors + totalHospitals}`, status: "good" },
              { label: "Audit Log Entries", value: `${auditLogs.length}`, status: "good" },
              { label: "Appointments Tracked", value: `${totalApts}`, status: "good" },
            ].map((item, i) => (
              <View key={i} style={styles.healthRow}>
                <View style={[styles.healthDot, { backgroundColor: item.status === "good" ? Colors.success : Colors.warning }]} />
                <Text style={styles.healthLabel}>{item.label}</Text>
                <Text style={styles.healthVal}>{item.value}</Text>
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
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", color: Colors.text },
  sub: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  scroll: { flex: 1 },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, backgroundColor: Colors.white, borderRadius: 16, padding: 12, alignItems: "center", gap: 4, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 1 },
  statIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statVal: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.textMuted, textAlign: "center" },
  card: { backgroundColor: Colors.white, borderRadius: 18, padding: 16, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.text },
  cardSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 2, marginBottom: 16 },
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metricCard: { width: "47%", backgroundColor: Colors.background, borderRadius: 12, padding: 14, alignItems: "center", gap: 4 },
  metricVal: { fontSize: 26, fontFamily: "Inter_700Bold" },
  metricLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted, textAlign: "center" },
  hospitalRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  hAvatar: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  hName: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.text },
  hMeta: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  healthRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  healthDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success },
  healthLabel: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.text },
  healthVal: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.textSecondary },
});
