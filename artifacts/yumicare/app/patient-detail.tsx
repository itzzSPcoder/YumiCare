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
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";

const STATUS_COLOR = {
  stable: Colors.success,
  attention: Colors.warning,
  critical: Colors.danger,
};
const STATUS_BG = {
  stable: Colors.successLight,
  attention: Colors.warningLight,
  critical: Colors.dangerLight,
};
const STATUS_LABEL = { stable: "Stable", attention: "Needs Attention", critical: "Critical" };

const TIMELINE_DATA = [
  { date: "2026-03-27", title: "Routine checkup", type: "visit", values: { "BP": "124/80", "Weight": "68kg", "HR": "82 bpm" } },
  { date: "2026-03-15", title: "Lab results reviewed", type: "lab", values: { "Hemoglobin": "10.8", "Sugar": "115" } },
  { date: "2026-02-28", title: "Ultrasound scan", type: "ultrasound", values: { "BPD": "82mm", "FL": "62mm", "EFW": "1820g" } },
];

const TYPE_COLOR = {
  visit: Colors.teal,
  lab: Colors.purple,
  ultrasound: Colors.teal,
  medication: Colors.success,
  symptom: Colors.warning,
};
const TYPE_BG = {
  visit: Colors.tealLight,
  lab: Colors.purpleLight,
  ultrasound: Colors.tealLight,
  medication: Colors.successLight,
  symptom: Colors.warningLight,
};

export default function PatientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { doctorPatients } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const p = doctorPatients.find((pat) => pat.id === id) ?? doctorPatients[0]!;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Patient Details</Text>
        <TouchableOpacity onPress={() => router.push("/emergency")} style={styles.emergencyBtn}>
          <Ionicons name="alert-circle" size={22} color={Colors.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 100, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.patientCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>{p.name.charAt(0)}</Text>
            </View>
            <View style={styles.patientMeta}>
              <Text style={styles.patientName}>{p.name}</Text>
              <Text style={styles.patientSub}>Age {p.age} · {p.bloodGroup} · ID: {p.id}</Text>
              <View style={[styles.statusBadge, { backgroundColor: STATUS_BG[p.status] }]}>
                <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[p.status] }]} />
                <Text style={[styles.statusLabel, { color: STATUS_COLOR[p.status] }]}>{STATUS_LABEL[p.status]}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.vitalGrid}>
          {[
            { label: "Week", value: String(p.pregnancyWeek), icon: "heart-outline" as const, color: Colors.teal, bg: Colors.tealLight },
            { label: "Due Date", value: p.dueDate.split("-").slice(1).join("/"), icon: "calendar-outline" as const, color: Colors.purple, bg: Colors.purpleLight },
            { label: "Blood Group", value: p.bloodGroup, icon: "water-outline" as const, color: Colors.danger, bg: Colors.dangerLight },
          ].map((v, i) => (
            <View key={i} style={styles.vitalCard}>
              <View style={[styles.vitalIcon, { backgroundColor: v.bg }]}>
                <Ionicons name={v.icon} size={16} color={v.color} />
              </View>
              <Text style={[styles.vitalValue, { color: v.color }]}>{v.value}</Text>
              <Text style={styles.vitalLabel}>{v.label}</Text>
            </View>
          ))}
        </View>

        {p.allergies.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="warning" size={16} color={Colors.danger} />
              <Text style={[styles.cardTitle, { color: Colors.danger }]}>Allergies</Text>
            </View>
            <View style={styles.tagRow}>
              {p.allergies.map((a, i) => (
                <View key={i} style={styles.allergyTag}>
                  <Text style={styles.allergyText}>{a}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="medical" size={16} color={Colors.purple} />
            <Text style={[styles.cardTitle, { color: Colors.purple }]}>Current Medications</Text>
          </View>
          {p.medications.map((m, i) => (
            <View key={i} style={[styles.medRow, i > 0 && { borderTopWidth: 1, borderTopColor: Colors.border }]}>
              <View style={styles.medDot} />
              <Text style={styles.medText}>{m}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Visit History</Text>
          {TIMELINE_DATA.map((entry, i) => (
            <View key={i} style={[styles.visitRow, i > 0 && { borderTopWidth: 1, borderTopColor: Colors.border }]}>
              <View style={[styles.visitDot, { backgroundColor: (TYPE_COLOR as any)[entry.type] ?? Colors.teal }]} />
              <View style={styles.visitInfo}>
                <Text style={styles.visitTitle}>{entry.title}</Text>
                <Text style={styles.visitDate}>{entry.date}</Text>
                {entry.values && (
                  <View style={styles.valRow}>
                    {Object.entries(entry.values).map(([k, v]) => (
                      <View key={k} style={styles.valChip}>
                        <Text style={styles.valKey}>{k}</Text>
                        <Text style={styles.valVal}>{v}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8}>
            <Ionicons name="add-circle-outline" size={18} color={Colors.teal} />
            <Text style={styles.actionBtnText}>Add Note</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.purpleLight }]} activeOpacity={0.8}>
            <Ionicons name="create-outline" size={18} color={Colors.purple} />
            <Text style={[styles.actionBtnText, { color: Colors.purple }]}>Prescribe</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text },
  emergencyBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.dangerLight,
    alignItems: "center",
    justifyContent: "center",
  },
  patientCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  avatarRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.purpleLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: { fontSize: 26, fontFamily: "Inter_700Bold", color: Colors.purple },
  patientMeta: { flex: 1, gap: 4 },
  patientName: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.text },
  patientSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  vitalGrid: { flexDirection: "row", gap: 10 },
  vitalCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  vitalIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  vitalValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  vitalLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.textMuted, textAlign: "center" },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    gap: 2,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  cardTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.text, marginBottom: 8 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  allergyTag: {
    backgroundColor: Colors.dangerLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  allergyText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.danger },
  medRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 },
  medDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.purple },
  medText: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.text },
  visitRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 12 },
  visitDot: { width: 10, height: 10, borderRadius: 5, marginTop: 3 },
  visitInfo: { flex: 1 },
  visitTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text },
  visitDate: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 2, marginBottom: 6 },
  valRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  valChip: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: "center",
  },
  valKey: { fontSize: 10, color: Colors.textMuted, fontFamily: "Inter_400Regular" },
  valVal: { fontSize: 12, color: Colors.text, fontFamily: "Inter_600SemiBold" },
  actionRow: { flexDirection: "row", gap: 12 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.tealLight,
    borderRadius: 14,
    padding: 14,
  },
  actionBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.teal },
});
