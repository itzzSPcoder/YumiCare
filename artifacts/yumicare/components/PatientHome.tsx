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

const WEEK_TIPS: Record<number, string> = {
  8: "Your baby is the size of a raspberry! Morning sickness may peak now.",
  12: "End of first trimester! Nausea may start to improve soon.",
  14: "Second trimester starts! Energy levels may increase.",
  16: "You might start feeling flutters — baby's first movements!",
  20: "Halfway there! Anatomy scan is usually done around now.",
  24: "Baby can hear your voice now. Viability milestone reached!",
  28: "Third trimester! Start counting baby kicks daily.",
  32: "Baby is gaining weight rapidly. Braxton Hicks may start.",
  36: "Baby is almost full term. Start packing your hospital bag!",
  38: "Full term! Baby could arrive any day now.",
  40: "Due date! Stay calm and follow your doctor's guidance.",
};

function getWeekTip(week: number): string {
  const keys = Object.keys(WEEK_TIPS).map(Number).sort((a, b) => a - b);
  let best = keys[0]!;
  for (const k of keys) {
    if (k <= week) best = k;
  }
  return WEEK_TIPS[best] ?? "Stay healthy and keep tracking your vitals!";
}

function getBPStatus(sys?: number, dia?: number): { label: string; color: string } {
  if (!sys || !dia) return { label: "Not recorded", color: Colors.textMuted };
  if (sys >= 140 || dia >= 90) return { label: "High", color: Colors.danger };
  if (sys >= 130 || dia >= 85) return { label: "Elevated", color: Colors.warning };
  return { label: "Normal", color: Colors.success };
}

export default function PatientHome() {
  const { patient, getLatestVitals, appointments, prescriptions, timeline } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;

  const latestVitals = patient ? getLatestVitals(patient.id) : null;
  const bpStatus = getBPStatus(latestVitals?.systolic, latestVitals?.diastolic);
  const nextAppointment = patient ? appointments.filter(a => a.patientId === patient.id && a.status === "upcoming").sort((a, b) => a.date.localeCompare(b.date))[0] : null;
  const activePrescriptions = patient ? prescriptions.filter(p => p.patientId === patient.id && p.status === "active") : [];

  const quickStats = [
    {
      label: "Blood Pressure",
      value: latestVitals?.systolic ? `${latestVitals.systolic}/${latestVitals.diastolic}` : "—",
      sub: bpStatus.label,
      icon: "heart-outline" as const,
      color: latestVitals?.systolic ? bpStatus.color : Colors.textMuted,
      bg: Colors.tealLight,
    },
    {
      label: "Hemoglobin",
      value: latestVitals?.hemoglobin ? `${latestVitals.hemoglobin}` : "—",
      sub: latestVitals?.hemoglobin ? (latestVitals.hemoglobin < 11 ? "Low" : "Normal") : "Not recorded",
      icon: "water-outline" as const,
      color: latestVitals?.hemoglobin ? (latestVitals.hemoglobin < 11 ? Colors.warning : Colors.success) : Colors.textMuted,
      bg: Colors.purpleLight,
    },
    {
      label: "Weight",
      value: latestVitals?.weight ? `${latestVitals.weight}` : "—",
      sub: latestVitals?.weight ? "kg" : "Not recorded",
      icon: "fitness-outline" as const,
      color: Colors.teal,
      bg: Colors.tealLight,
    },
  ];

  const quickActions = [
    { icon: "pulse-outline" as const, label: "Log Vitals", route: "/vitals", color: Colors.teal, bg: Colors.tealLight },
    { icon: "footsteps-outline" as const, label: "Kick Counter", route: "/kick-counter", color: Colors.purple, bg: Colors.purpleLight },
    { icon: "calendar-outline" as const, label: "Book Appt", route: "/book-appointment", color: Colors.success, bg: Colors.successLight },
    { icon: "chatbubbles-outline" as const, label: "Messages", route: "/messages", color: "#5B8FF9", bg: "#EEF3FF" },
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View>
          <Text style={styles.greeting}>Hello, {patient?.name?.split(" ")[0] ?? "there"} 👋</Text>
          <Text style={styles.subGreeting}>Week {patient?.pregnancyWeek ?? "—"} · Due {patient?.dueDate ?? "—"}</Text>
        </View>
        <TouchableOpacity
          style={styles.notifBtn}
          onPress={() => router.push("/notifications")}
          activeOpacity={0.8}
        >
          <Ionicons name="notifications-outline" size={22} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: bottomPad, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Weekly Tip */}
        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Ionicons name="bulb-outline" size={18} color={Colors.teal} />
            <Text style={styles.tipTitle}>Week {patient?.pregnancyWeek} Tip</Text>
          </View>
          <Text style={styles.tipText}>{getWeekTip(patient?.pregnancyWeek ?? 24)}</Text>
        </View>

        {/* Health Stats */}
        <View>
          <SectionHeader title="Health Stats" actionText={latestVitals ? `Updated ${latestVitals.date}` : undefined} />
          {!latestVitals && (
            <TouchableOpacity style={styles.emptyVitals} onPress={() => router.push("/vitals")} activeOpacity={0.8}>
              <Ionicons name="add-circle-outline" size={32} color={Colors.teal} />
              <Text style={styles.emptyVitalsTitle}>No vitals recorded yet</Text>
              <Text style={styles.emptyVitalsSub}>Tap to log your first health reading</Text>
            </TouchableOpacity>
          )}
          {latestVitals && (
            <TouchableOpacity activeOpacity={0.85} onPress={() => router.push("/vitals")}>
              <View style={styles.statsGrid}>
                {quickStats.map((s, i) => (
                  <View key={i} style={[styles.statCard, { backgroundColor: s.bg }]}>
                    <View style={[styles.statIconWrap, { backgroundColor: s.color + "20" }]}>
                      <Ionicons name={s.icon} size={18} color={s.color} />
                    </View>
                    <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                    <Text style={styles.statLabel}>{s.label}</Text>
                    <Text style={[styles.statSub, { color: s.color }]}>{s.sub}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Actions */}
        <View>
          <SectionHeader title="Quick Actions" />
          <View style={styles.actionsGrid}>
            {quickActions.map((a, i) => (
              <TouchableOpacity
                key={i}
                style={styles.actionCard}
                onPress={() => router.push(a.route as any)}
                activeOpacity={0.8}
              >
                <View style={[styles.actionIconWrap, { backgroundColor: a.bg }]}>
                  <Ionicons name={a.icon} size={22} color={a.color} />
                </View>
                <Text style={styles.actionLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Next Appointment */}
        <View>
          <SectionHeader title="Next Appointment" />
          {nextAppointment ? (
            <TouchableOpacity style={styles.appointmentCard} onPress={() => router.push("/appointments")} activeOpacity={0.85}>
              <View style={styles.aptLeft}>
                <View style={styles.aptDateBox}>
                  <Text style={styles.aptDateDay}>{new Date(nextAppointment.date).getDate()}</Text>
                  <Text style={styles.aptDateMonth}>{new Date(nextAppointment.date).toLocaleString("en", { month: "short" })}</Text>
                </View>
              </View>
              <View style={styles.aptInfo}>
                <Text style={styles.aptTitle}>{nextAppointment.type.charAt(0).toUpperCase() + nextAppointment.type.slice(1)} Visit</Text>
                <Text style={styles.aptSub}>{nextAppointment.time} · {nextAppointment.doctorName}</Text>
                <View style={[styles.aptTypeBadge, { backgroundColor: nextAppointment.type === "emergency" ? Colors.dangerLight : Colors.tealLight }]}>
                  <Text style={[styles.aptTypeText, { color: nextAppointment.type === "emergency" ? Colors.danger : Colors.teal }]}>{nextAppointment.type}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.emptyCard} onPress={() => router.push("/book-appointment" as any)} activeOpacity={0.8}>
              <Ionicons name="calendar-outline" size={28} color={Colors.teal} />
              <Text style={styles.emptyCardTitle}>No upcoming appointments</Text>
              <Text style={styles.emptyCardSub}>Book your next prenatal visit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Active Medications */}
        {activePrescriptions.length > 0 && (
          <View>
            <SectionHeader title="Active Medications" actionText={`${activePrescriptions.reduce((s, p) => s + p.medications.length, 0)} meds`} />
            <View style={styles.medsCard}>
              {activePrescriptions.slice(0, 1).flatMap(rx => rx.medications).slice(0, 4).map((med, i) => (
                <View key={i} style={[styles.medRow, i > 0 && styles.divider]}>
                  <View style={styles.medDot} />
                  <View style={styles.medInfo}>
                    <Text style={styles.medName}>{med.name} {med.dosage}</Text>
                    <Text style={styles.medFreq}>{med.frequency} · {med.instructions}</Text>
                  </View>
                </View>
              ))}
              <TouchableOpacity style={styles.viewAllBtn} onPress={() => router.push("/medications")} activeOpacity={0.8}>
                <Text style={styles.viewAllText}>View All Medications</Text>
                <Ionicons name="chevron-forward" size={14} color={Colors.teal} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Recent Activity */}
        <View>
          <SectionHeader title="Recent Activity" />
          <View style={styles.activityCard}>
            {timeline.slice(0, 3).map((entry, i) => (
              <View key={entry.id} style={[styles.activityRow, i > 0 && styles.divider]}>
                <View style={[styles.activityDot, { backgroundColor: entry.type === "ultrasound" ? Colors.teal : entry.type === "lab" ? Colors.purple : entry.type === "vital" ? Colors.success : Colors.warning }]} />
                <View style={styles.activityInfo}>
                  <Text style={styles.activityTitle}>{entry.title}</Text>
                  <Text style={styles.activityDate}>{entry.date}</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
              </View>
            ))}
          </View>
        </View>

        {/* Emergency Access */}
        <TouchableOpacity
          style={styles.emergencyBtn}
          onPress={() => router.push("/emergency")}
          activeOpacity={0.85}
        >
          <Ionicons name="alert-circle" size={24} color={Colors.white} />
          <View style={styles.emergencyInfo}>
            <Text style={styles.emergencyTitle}>Emergency Card</Text>
            <Text style={styles.emergencySub}>Quick access to vital medical info</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingHorizontal: 20, paddingBottom: 8 },
  greeting: { fontSize: 24, fontFamily: "Inter_700Bold", color: Colors.text },
  subGreeting: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.textMuted, marginTop: 2 },
  notifBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center", shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2 },
  tipCard: { backgroundColor: Colors.tealLight, borderRadius: 18, padding: 16, borderLeftWidth: 4, borderLeftColor: Colors.teal },
  tipHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  tipTitle: { fontSize: 13, fontFamily: "Inter_700Bold", color: Colors.teal },
  tipText: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.text, lineHeight: 20 },
  emptyVitals: { backgroundColor: Colors.white, borderRadius: 18, padding: 24, alignItems: "center", gap: 6, borderWidth: 2, borderColor: Colors.border, borderStyle: "dashed" },
  emptyVitalsTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.text },
  emptyVitalsSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  statsGrid: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, borderRadius: 16, padding: 14, alignItems: "center", gap: 4 },
  statIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 2 },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.textSecondary, textAlign: "center" },
  statSub: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  actionsGrid: { flexDirection: "row", gap: 10 },
  actionCard: { flex: 1, backgroundColor: Colors.white, borderRadius: 16, padding: 14, alignItems: "center", gap: 8, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 1 },
  actionIconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  actionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: Colors.text, textAlign: "center" },
  appointmentCard: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: Colors.white, borderRadius: 18, padding: 16, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  aptLeft: {},
  aptDateBox: { backgroundColor: Colors.tealLight, borderRadius: 14, width: 54, height: 54, alignItems: "center", justifyContent: "center" },
  aptDateDay: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.teal },
  aptDateMonth: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: Colors.teal, marginTop: -2 },
  aptInfo: { flex: 1 },
  aptTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.text },
  aptSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 2, marginBottom: 4 },
  aptTypeBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  aptTypeText: { fontSize: 10, fontFamily: "Inter_600SemiBold", textTransform: "capitalize" },
  emptyCard: { backgroundColor: Colors.white, borderRadius: 18, padding: 20, alignItems: "center", gap: 6, borderWidth: 2, borderColor: Colors.border, borderStyle: "dashed" },
  emptyCardTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text },
  emptyCardSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  medsCard: { backgroundColor: Colors.white, borderRadius: 18, padding: 14, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  medRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 },
  divider: { borderTopWidth: 1, borderTopColor: Colors.border },
  medDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.teal },
  medInfo: { flex: 1 },
  medName: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.text },
  medFreq: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 1 },
  viewAllBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  viewAllText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.teal },
  activityCard: { backgroundColor: Colors.white, borderRadius: 18, padding: 4, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  activityRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12 },
  activityDot: { width: 10, height: 10, borderRadius: 5 },
  activityInfo: { flex: 1 },
  activityTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.text },
  activityDate: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 1 },
  emergencyBtn: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: Colors.danger, borderRadius: 18, padding: 18 },
  emergencyInfo: { flex: 1 },
  emergencyTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.white },
  emergencySub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)", marginTop: 1 },
});
