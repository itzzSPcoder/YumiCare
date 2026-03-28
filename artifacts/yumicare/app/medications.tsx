import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";

const SCHEDULES = ["Morning", "Afternoon", "Evening", "Night"];

interface MedState {
  name: string;
  dose: string;
  schedule: string;
  taken: boolean;
  notes: string;
}

export default function MedicationsScreen() {
  const { patient } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [meds, setMeds] = useState<MedState[]>([
    { name: "Folic Acid", dose: "5mg", schedule: "Morning", taken: true, notes: "Take with breakfast" },
    { name: "Iron Supplement", dose: "325mg", schedule: "Evening", taken: false, notes: "Avoid dairy 1hr before/after" },
    { name: "Vitamin D3", dose: "2000 IU", schedule: "Morning", taken: true, notes: "Take with fatty meal" },
  ]);

  const toggleTaken = (i: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMeds((prev) => prev.map((m, idx) => idx === i ? { ...m, taken: !m.taken } : m));
  };

  const takenCount = meds.filter((m) => m.taken).length;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Medications</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.progressCard}>
          <View style={styles.progressTop}>
            <View>
              <Text style={styles.progressTitle}>Today's Progress</Text>
              <Text style={styles.progressSub}>
                {takenCount} of {meds.length} medications taken
              </Text>
            </View>
            <View style={styles.progressCircle}>
              <Text style={styles.progressPct}>{Math.round((takenCount / meds.length) * 100)}%</Text>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(takenCount / meds.length) * 100}%` }]} />
          </View>
        </View>

        <Text style={styles.sectionLabel}>Scheduled Medications</Text>
        {SCHEDULES.map((sched) => {
          const schedMeds = meds.map((m, i) => ({ ...m, index: i })).filter((m) => m.schedule === sched);
          if (schedMeds.length === 0) return null;
          return (
            <View key={sched}>
              <View style={styles.scheduleRow}>
                <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
                <Text style={styles.scheduleLabel}>{sched}</Text>
              </View>
              <View style={styles.medCard}>
                {schedMeds.map((m, i) => (
                  <View
                    key={m.index}
                    style={[styles.medRow, i > 0 && styles.divider, m.taken && styles.takenRow]}
                  >
                    <View style={[styles.medIcon, { backgroundColor: m.taken ? Colors.successLight : Colors.tealLight }]}>
                      <Ionicons
                        name="medical"
                        size={18}
                        color={m.taken ? Colors.success : Colors.teal}
                      />
                    </View>
                    <View style={styles.medInfo}>
                      <Text style={[styles.medName, m.taken && styles.medNameTaken]}>{m.name}</Text>
                      <Text style={styles.medDose}>{m.dose}</Text>
                      {!!m.notes && <Text style={styles.medNotes}>{m.notes}</Text>}
                    </View>
                    <Switch
                      value={m.taken}
                      onValueChange={() => toggleTaken(m.index)}
                      trackColor={{ false: Colors.border, true: Colors.success }}
                      thumbColor={Colors.white}
                    />
                  </View>
                ))}
              </View>
            </View>
          );
        })}

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.teal} />
          <Text style={styles.infoText}>
            This list is synced with prescriptions from Dr. {patient?.primaryDoctor}. Contact your doctor to make changes.
          </Text>
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
  title: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text },
  sectionLabel: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.text },
  progressCard: {
    backgroundColor: Colors.teal,
    borderRadius: 20,
    padding: 20,
    gap: 14,
  },
  progressTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.white },
  progressSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)", marginTop: 2 },
  progressCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  progressPct: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.white },
  progressTrack: { height: 8, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: Colors.white, borderRadius: 4 },
  scheduleRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8, marginTop: 4 },
  scheduleLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: Colors.textMuted, textTransform: "uppercase", letterSpacing: 0.5 },
  medCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 8,
  },
  medRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  takenRow: { backgroundColor: Colors.successLight + "50" },
  divider: { borderTopWidth: 1, borderTopColor: Colors.border },
  medIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  medInfo: { flex: 1 },
  medName: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.text },
  medNameTaken: { textDecorationLine: "line-through", color: Colors.textMuted },
  medDose: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textSecondary, marginTop: 1 },
  medNotes: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 2, fontStyle: "italic" },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: Colors.tealLight,
    borderRadius: 14,
    padding: 14,
  },
  infoText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.tealDark, lineHeight: 19 },
});
