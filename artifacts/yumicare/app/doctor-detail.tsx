import React from "react";
import {
  Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";

const H_COLOR = Colors.purple;
const H_LIGHT = Colors.purpleLight;

export default function DoctorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { allDoctors, allPatients, allHospitals } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const doctor = allDoctors.find((d) => d.id === id);
  const patients = allPatients.filter((p) => p.doctorId === id);
  const hospital = allHospitals.find((h) => h.id === doctor?.hospitalId);

  if (!doctor) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: Colors.textMuted }}>Doctor not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Doctor Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: H_LIGHT }]}>
            <Text style={[styles.initial, { color: H_COLOR }]}>{doctor.name.replace("Dr. ", "").charAt(0)}</Text>
          </View>
          <Text style={styles.docName}>{doctor.name}</Text>
          <Text style={[styles.docSpec, { color: H_COLOR }]}>{doctor.specialization}</Text>
          <Text style={styles.docHosp}>{hospital?.name ?? "Hospital"}</Text>
          <View style={[styles.statusBadge, { backgroundColor: doctor.status === "active" ? "#EAF9F0" : Colors.border }]}>
            <View style={[styles.statusDot, { backgroundColor: doctor.status === "active" ? Colors.success : Colors.textMuted }]} />
            <Text style={[styles.statusText, { color: doctor.status === "active" ? Colors.success : Colors.textMuted }]}>{doctor.status}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          {[
            { label: "Patients", value: patients.length, icon: "people-outline" as const, color: Colors.teal },
            { label: "Joined", value: doctor.joinDate.split("-")[0]!, icon: "calendar-outline" as const, color: H_COLOR },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Ionicons name={s.icon} size={20} color={s.color} />
              <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Details</Text>
          {[
            { label: "License No.", value: doctor.licenseNo },
            { label: "Phone", value: doctor.phone },
            { label: "Email", value: doctor.email },
            { label: "Join Date", value: doctor.joinDate },
          ].map((item, i) => (
            <View key={i} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{item.label}</Text>
              <Text style={styles.detailValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        {patients.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Patients ({patients.length})</Text>
            {patients.map((p) => (
              <View key={p.id} style={styles.patRow}>
                <View style={styles.patAvatar}>
                  <Text style={styles.patInitial}>{p.name.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.patName}>{p.name}</Text>
                  <Text style={styles.patSub}>Week {p.pregnancyWeek} · {p.bloodGroup}</Text>
                </View>
                <View style={[styles.patStatus, {
                  backgroundColor: p.status === "critical" ? Colors.dangerLight : p.status === "attention" ? Colors.warningLight : "#EAF9F0",
                }]}>
                  <Text style={[styles.patStatusText, {
                    color: p.status === "critical" ? Colors.danger : p.status === "attention" ? Colors.warning : Colors.success,
                  }]}>{p.status}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center", shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text },
  profileCard: { backgroundColor: Colors.white, borderRadius: 20, padding: 24, alignItems: "center", gap: 6, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 3 },
  avatar: { width: 80, height: 80, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  initial: { fontSize: 32, fontFamily: "Inter_700Bold" },
  docName: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.text },
  docSpec: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  docHosp: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontFamily: "Inter_600SemiBold", textTransform: "capitalize" },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, backgroundColor: Colors.white, borderRadius: 14, padding: 14, alignItems: "center", gap: 4, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 1 },
  statVal: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  section: { backgroundColor: Colors.white, borderRadius: 18, padding: 16, gap: 8, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 1 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.text, marginBottom: 4 },
  detailRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  detailLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  detailValue: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.text },
  patRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: Colors.border },
  patAvatar: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.tealLight, alignItems: "center", justifyContent: "center" },
  patInitial: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.teal },
  patName: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.text },
  patSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  patStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  patStatusText: { fontSize: 10, fontFamily: "Inter_600SemiBold", textTransform: "capitalize" },
});
