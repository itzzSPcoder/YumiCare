import React from "react";
import {
  Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";

const ADMIN_COLOR = "#E67E22";
const ADMIN_LIGHT = "#FEF5E7";

export default function HospitalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { allHospitals, allDoctors, allPatients } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const hospital = allHospitals.find((h) => h.id === id);
  const doctors = allDoctors.filter((d) => d.hospitalId === id);
  const patients = allPatients.filter((p) => p.hospitalId === id);

  if (!hospital) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: Colors.textMuted }}>Hospital not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hospital Detail</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: ADMIN_LIGHT }]}>
            <Ionicons name="business" size={36} color={ADMIN_COLOR} />
          </View>
          <Text style={styles.hospName}>{hospital.name}</Text>
          <Text style={[styles.hospType, { color: ADMIN_COLOR }]}>{hospital.type}</Text>
          <Text style={styles.hospAccred}>{hospital.accreditation}</Text>
          <View style={styles.activeBadge}>
            <View style={styles.activeDot} />
            <Text style={styles.activeText}>Active</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          {[
            { label: "Doctors", value: doctors.length, icon: "medical-outline" as const, color: Colors.purple },
            { label: "Patients", value: patients.length, icon: "people-outline" as const, color: Colors.teal },
            { label: "Beds", value: hospital.beds, icon: "bed-outline" as const, color: "#5B8FF9" },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Ionicons name={s.icon} size={20} color={s.color} />
              <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          {[
            { label: "City", value: hospital.city, icon: "location-outline" as const },
            { label: "Address", value: hospital.address, icon: "map-outline" as const },
            { label: "Phone", value: hospital.phone, icon: "call-outline" as const },
            { label: "Email", value: hospital.email, icon: "mail-outline" as const },
          ].map((item, i) => (
            <View key={i} style={styles.infoRow}>
              <Ionicons name={item.icon} size={16} color={Colors.textMuted} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {doctors.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Doctors ({doctors.length})</Text>
            {doctors.map((d) => (
              <View key={d.id} style={styles.docRow}>
                <View style={[styles.docAvatar, { backgroundColor: Colors.purpleLight }]}>
                  <Text style={[styles.docInitial, { color: Colors.purple }]}>{d.name.replace("Dr. ", "").charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.docName}>{d.name}</Text>
                  <Text style={styles.docSpec}>{d.specialization}</Text>
                </View>
                <Text style={styles.docPatients}>{d.patientsCount} patients</Text>
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
  hospName: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.text, textAlign: "center" },
  hospType: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  hospAccred: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.success },
  activeBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#EAF9F0", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
  activeText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: Colors.success },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, backgroundColor: Colors.white, borderRadius: 14, padding: 14, alignItems: "center", gap: 4, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 1 },
  statVal: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  section: { backgroundColor: Colors.white, borderRadius: 18, padding: 16, gap: 10, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 1 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.text, marginBottom: 4 },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 4 },
  infoLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  infoValue: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.text },
  docRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: Colors.border },
  docAvatar: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  docInitial: { fontSize: 15, fontFamily: "Inter_700Bold" },
  docName: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.text },
  docSpec: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  docPatients: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.textSecondary },
});
