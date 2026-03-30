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

const MOCK_STATS = [
  { label: "Jan", patients: 18, doctors: 2 },
  { label: "Feb", patients: 24, doctors: 3 },
  { label: "Mar", patients: 31, doctors: 4 },
];

export default function AdminReports() {
  const { allHospitals, allDoctors, allUsers } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;
  const totalPatients = allUsers.filter((u) => u.role === "patient").length;
  const totalDoctors = allDoctors.length;
  const totalHospitals = allHospitals.length;
  const maxPatients = Math.max(...MOCK_STATS.map((s) => s.patients));

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
          <Text style={styles.cardTitle}>Patient Growth</Text>
          <Text style={styles.cardSub}>Monthly new registrations</Text>
          <View style={styles.chart}>
            {MOCK_STATS.map((s, i) => (
              <View key={i} style={styles.chartCol}>
                <Text style={styles.chartVal}>{s.patients}</Text>
                <View style={[styles.bar, { height: (s.patients / maxPatients) * 100, backgroundColor: ADMIN_COLOR }]} />
                <Text style={styles.chartLabel}>{s.label}</Text>
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
          <Text style={styles.cardTitle}>System Health</Text>
          <View style={{ gap: 12, marginTop: 8 }}>
            {[
              { label: "API Response Time", value: "42ms", status: "good" },
              { label: "Database Status", value: "Healthy", status: "good" },
              { label: "Active Sessions", value: "1", status: "good" },
              { label: "Storage Used", value: "2.1 MB / 10 GB", status: "good" },
              { label: "Last Backup", value: "2 hours ago", status: "good" },
            ].map((item, i) => (
              <View key={i} style={styles.healthRow}>
                <View style={styles.healthDot} />
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
  chart: { flexDirection: "row", alignItems: "flex-end", gap: 20, height: 130, paddingTop: 8 },
  chartCol: { flex: 1, alignItems: "center", gap: 4 },
  chartVal: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: Colors.text },
  bar: { width: "100%", borderRadius: 6, minHeight: 4 },
  chartLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  hospitalRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  hAvatar: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  hName: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.text },
  hMeta: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  healthRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  healthDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success },
  healthLabel: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.text },
  healthVal: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.textSecondary },
});
