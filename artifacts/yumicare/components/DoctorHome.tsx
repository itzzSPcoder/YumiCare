import React from "react";
import {
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
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { SectionHeader } from "./SectionHeader";

const STATUS_COLOR = { stable: Colors.success, attention: Colors.warning, critical: Colors.danger };
const STATUS_BG = { stable: Colors.successLight, attention: Colors.warningLight, critical: Colors.dangerLight };
const STATUS_LABEL = { stable: "Stable", attention: "Attention", critical: "Critical" };

export default function DoctorHome() {
  const { doctorProfile, doctorPatients, getDoctorAppointments, prescriptions } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;

  const doctorId = doctorProfile?.id ?? "doc-001";
  const todayStr = new Date().toISOString().split("T")[0]!;
  const allApts = getDoctorAppointments(doctorId);
  const todayApts = allApts.filter(a => a.date === todayStr && a.status === "upcoming");
  const upcomingApts = allApts.filter(a => a.date >= todayStr && a.status === "upcoming").slice(0, 5);
  const alertPatients = doctorPatients.filter(p => p.status !== "stable");
  const dueSoon = doctorPatients.filter(p => p.pregnancyWeek >= 36);

  const quickStats = [
    { label: "Patients", value: String(doctorPatients.length), icon: "people-outline" as const, color: Colors.purple, bg: Colors.purpleLight },
    { label: "Today", value: String(todayApts.length), icon: "calendar-outline" as const, color: Colors.teal, bg: Colors.tealLight },
    { label: "Alerts", value: String(alertPatients.length), icon: "warning-outline" as const, color: Colors.danger, bg: Colors.dangerLight },
    { label: "Due Soon", value: String(dueSoon.length), icon: "time-outline" as const, color: "#5B8FF9", bg: "#EEF3FF" },
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View>
          <Text style={styles.greeting}>Hello, {doctorProfile?.name?.split(" ").slice(0, 2).join(" ")} 👩‍⚕️</Text>
          <Text style={styles.subGreeting}>{doctorProfile?.specialization}</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn} onPress={() => router.push("/notifications")} activeOpacity={0.8}>
          <Ionicons name="notifications-outline" size={22} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: bottomPad, gap: 20 }} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsRow}>
          {quickStats.map((s, i) => (
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
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.purpleLight }]} onPress={() => router.push("/write-prescription" as any)} activeOpacity={0.85}>
            <Ionicons name="document-text-outline" size={20} color={Colors.purple} />
            <Text style={[styles.actionText, { color: Colors.purple }]}>Prescribe</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#F3E8FF" }]} onPress={() => router.push("/ultrasound-analysis" as any)} activeOpacity={0.85}>
            <Ionicons name="sparkles" size={20} color="#9333EA" />
            <Text style={[styles.actionText, { color: "#9333EA" }]}>AI Scan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.successLight }]} onPress={() => router.push("/add-patient")} activeOpacity={0.85}>
            <Ionicons name="person-add-outline" size={20} color={Colors.success} />
            <Text style={[styles.actionText, { color: Colors.success }]}>Add Patient</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Appointments */}
        <View>
          <SectionHeader title="Today's Appointments" actionText={todayApts.length > 0 ? `${todayApts.length} scheduled` : undefined} />
          {todayApts.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="calendar-outline" size={28} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No appointments today</Text>
            </View>
          ) : (
            <View style={styles.aptList}>
              {todayApts.map((apt, i) => (
                <View key={apt.id} style={[styles.aptRow, i > 0 && styles.divider]}>
                  <View style={styles.aptTime}>
                    <Text style={styles.aptTimeText}>{apt.time}</Text>
                  </View>
                  <View style={styles.aptInfo}>
                    <Text style={styles.aptName}>{apt.patientName}</Text>
                    <Text style={styles.aptType}>{apt.type}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Alert Patients */}
        {alertPatients.length > 0 && (
          <View>
            <SectionHeader title="⚠️ Needs Attention" />
            <View style={styles.alertList}>
              {alertPatients.map((p, i) => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.alertRow, i > 0 && styles.divider]}
                  onPress={() => router.push({ pathname: "/patient-detail", params: { id: p.id } })}
                  activeOpacity={0.8}
                >
                  <View style={[styles.alertDot, { backgroundColor: STATUS_COLOR[p.status] }]} />
                  <View style={styles.alertInfo}>
                    <Text style={styles.alertName}>{p.name}</Text>
                    <Text style={styles.alertSub}>Week {p.pregnancyWeek} · {p.bloodGroup}</Text>
                  </View>
                  <View style={[styles.alertBadge, { backgroundColor: STATUS_BG[p.status] }]}>
                    <Text style={[styles.alertBadgeText, { color: STATUS_COLOR[p.status] }]}>{STATUS_LABEL[p.status]}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Upcoming Appointments */}
        {upcomingApts.length > 0 && (
          <View>
            <SectionHeader title="Upcoming Schedule" />
            <View style={styles.aptList}>
              {upcomingApts.map((apt, i) => (
                <View key={apt.id} style={[styles.aptRow, i > 0 && styles.divider]}>
                  <View style={styles.aptDateBox}>
                    <Text style={styles.aptDateNum}>{new Date(apt.date).getDate()}</Text>
                    <Text style={styles.aptDateMonth}>{new Date(apt.date).toLocaleString("en", { month: "short" })}</Text>
                  </View>
                  <View style={styles.aptInfo}>
                    <Text style={styles.aptName}>{apt.patientName}</Text>
                    <Text style={styles.aptType}>{apt.time} · {apt.type}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingHorizontal: 20, paddingBottom: 8 },
  greeting: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.text },
  subGreeting: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.textMuted, marginTop: 2 },
  notifBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center", shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2 },
  statsRow: { flexDirection: "row", gap: 8 },
  statCard: { flex: 1, backgroundColor: Colors.white, borderRadius: 14, padding: 12, alignItems: "center", gap: 4, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 1 },
  statIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  actionsRow: { flexDirection: "row", gap: 10 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 14, padding: 14 },
  actionText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  emptyCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 24, alignItems: "center", gap: 8, borderWidth: 2, borderColor: Colors.border, borderStyle: "dashed" },
  emptyText: { fontSize: 14, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  aptList: { backgroundColor: Colors.white, borderRadius: 18, overflow: "hidden", shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  aptRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  divider: { borderTopWidth: 1, borderTopColor: Colors.border },
  aptTime: { backgroundColor: Colors.tealLight, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  aptTimeText: { fontSize: 12, fontFamily: "Inter_700Bold", color: Colors.teal },
  aptDateBox: { backgroundColor: Colors.purpleLight, borderRadius: 10, width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  aptDateNum: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.purple },
  aptDateMonth: { fontSize: 9, fontFamily: "Inter_600SemiBold", color: Colors.purple, marginTop: -2 },
  aptInfo: { flex: 1 },
  aptName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text },
  aptType: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 1, textTransform: "capitalize" },
  alertList: { backgroundColor: Colors.white, borderRadius: 18, overflow: "hidden", shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  alertRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  alertDot: { width: 10, height: 10, borderRadius: 5 },
  alertInfo: { flex: 1 },
  alertName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text },
  alertSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 1 },
  alertBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  alertBadgeText: { fontSize: 10, fontFamily: "Inter_700Bold" },
});
