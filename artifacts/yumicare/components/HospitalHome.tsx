import React from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { SectionHeader } from "./SectionHeader";

const STATUS_COLOR = { stable: Colors.success, attention: Colors.warning, critical: Colors.danger };

export default function HospitalHome() {
  const { currentUser, hospitalDoctors, allPatients, getHospitalBeds, appointments, allHospitals } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;

  const hospitalId = currentUser?.id ?? "hosp-001";
  const hospital = allHospitals.find(h => h.id === hospitalId);
  const beds = getHospitalBeds(hospitalId);
  const occupiedBeds = beds.filter(b => b.status === "occupied").length;
  const totalBeds = beds.length;
  const occupancyPct = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
  const criticalPatients = allPatients.filter(p => p.status === "critical");
  const todayStr = new Date().toISOString().split("T")[0]!;
  const todayApts = appointments.filter(a => a.date === todayStr && a.hospitalId === hospitalId && a.status === "upcoming");

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View>
          <Text style={styles.greeting}>{hospital?.name ?? "Hospital"}</Text>
          <Text style={styles.sub}>{hospital?.city} · {hospital?.accreditation}</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn} onPress={() => router.push("/notifications")} activeOpacity={0.8}>
          <Ionicons name="notifications-outline" size={22} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: bottomPad, gap: 20 }} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: "Doctors", value: hospitalDoctors.length, icon: "medical-outline" as const, color: Colors.purple, bg: Colors.purpleLight },
            { label: "Patients", value: allPatients.length, icon: "people-outline" as const, color: Colors.teal, bg: Colors.tealLight },
            { label: "Beds", value: `${occupiedBeds}/${totalBeds}`, icon: "bed-outline" as const, color: "#5B8FF9", bg: "#EEF3FF" },
            { label: "Today", value: todayApts.length, icon: "calendar-outline" as const, color: Colors.success, bg: Colors.successLight },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: s.bg }]}>
                <Ionicons name={s.icon} size={16} color={s.color} />
              </View>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Bed Occupancy */}
        <TouchableOpacity style={styles.bedCard} onPress={() => router.push("/bed-management" as any)} activeOpacity={0.85}>
          <View style={styles.bedTop}>
            <View>
              <Text style={styles.bedTitle}>Bed Occupancy</Text>
              <Text style={styles.bedSub}>{occupiedBeds} occupied · {totalBeds - occupiedBeds} available</Text>
            </View>
            <View style={styles.bedCircle}>
              <Text style={styles.bedPct}>{occupancyPct}%</Text>
            </View>
          </View>
          <View style={styles.bedBar}>
            <View style={[styles.bedBarFill, { width: `${occupancyPct}%`, backgroundColor: occupancyPct > 80 ? Colors.danger : occupancyPct > 50 ? Colors.warning : Colors.success }]} />
          </View>
          <View style={styles.bedAction}>
            <Text style={styles.bedActionText}>Manage Beds</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.purple} />
          </View>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.purpleLight }]} onPress={() => router.push("/add-doctor")} activeOpacity={0.85}>
            <Ionicons name="person-add-outline" size={20} color={Colors.purple} />
            <Text style={[styles.actionText, { color: Colors.purple }]}>Add Doctor</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.tealLight }]} onPress={() => router.push("/bed-management" as any)} activeOpacity={0.85}>
            <Ionicons name="bed-outline" size={20} color={Colors.teal} />
            <Text style={[styles.actionText, { color: Colors.teal }]}>Beds</Text>
          </TouchableOpacity>
        </View>

        {/* Critical Alerts */}
        {criticalPatients.length > 0 && (
          <View>
            <SectionHeader title="⚠️ Critical Patients" />
            <View style={styles.alertList}>
              {criticalPatients.map((p, i) => (
                <View key={p.id} style={[styles.alertRow, i > 0 && styles.divider]}>
                  <View style={[styles.alertDot, { backgroundColor: Colors.danger }]} />
                  <View style={styles.alertInfo}>
                    <Text style={styles.alertName}>{p.name}</Text>
                    <Text style={styles.alertSub}>Week {p.pregnancyWeek} · {p.bloodGroup} · Due {p.dueDate}</Text>
                  </View>
                  <View style={[styles.alertBadge, { backgroundColor: Colors.dangerLight }]}>
                    <Text style={[styles.alertBadgeText, { color: Colors.danger }]}>Critical</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Doctors on duty */}
        <View>
          <SectionHeader title="Active Doctors" />
          <View style={styles.doctorList}>
            {hospitalDoctors.filter(d => d.status === "active").slice(0, 5).map((d, i) => (
              <View key={d.id} style={[styles.doctorRow, i > 0 && styles.divider]}>
                <View style={styles.doctorAvatar}>
                  <Text style={styles.doctorInitial}>{d.name.charAt(0)}</Text>
                </View>
                <View style={styles.doctorInfo}>
                  <Text style={styles.doctorName}>{d.name}</Text>
                  <Text style={styles.doctorSpec}>{d.specialization} · {d.patientsCount} patients</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: Colors.successLight }]}>
                  <Text style={[styles.statusText, { color: Colors.success }]}>Active</Text>
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
  greeting: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.text },
  sub: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.textMuted, marginTop: 2 },
  notifBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center", shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2 },
  statsRow: { flexDirection: "row", gap: 8 },
  statCard: { flex: 1, backgroundColor: Colors.white, borderRadius: 14, padding: 10, alignItems: "center", gap: 4, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 1 },
  statIcon: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 9, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  bedCard: { backgroundColor: Colors.white, borderRadius: 18, padding: 18, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 10, elevation: 2, gap: 12 },
  bedTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  bedTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.text },
  bedSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 2 },
  bedCircle: { width: 50, height: 50, borderRadius: 25, borderWidth: 4, borderColor: Colors.purple, alignItems: "center", justifyContent: "center" },
  bedPct: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.purple },
  bedBar: { height: 8, backgroundColor: Colors.border, borderRadius: 4, overflow: "hidden" },
  bedBarFill: { height: "100%", borderRadius: 4 },
  bedAction: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingTop: 4 },
  bedActionText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.purple },
  actionsRow: { flexDirection: "row", gap: 10 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, padding: 14 },
  actionText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  alertList: { backgroundColor: Colors.white, borderRadius: 18, overflow: "hidden", shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  alertRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14 },
  divider: { borderTopWidth: 1, borderTopColor: Colors.border },
  alertDot: { width: 10, height: 10, borderRadius: 5 },
  alertInfo: { flex: 1 },
  alertName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text },
  alertSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 1 },
  alertBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  alertBadgeText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  doctorList: { backgroundColor: Colors.white, borderRadius: 18, overflow: "hidden", shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  doctorRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  doctorAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.purpleLight, alignItems: "center", justifyContent: "center" },
  doctorInitial: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.purple },
  doctorInfo: { flex: 1 },
  doctorName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text },
  doctorSpec: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontFamily: "Inter_700Bold" },
});
