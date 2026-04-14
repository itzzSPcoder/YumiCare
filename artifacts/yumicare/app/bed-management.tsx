import React, { useState } from "react";
import {
  Alert,
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
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";

const WARD_LABELS: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  general: { label: "General", color: Colors.teal, bg: Colors.tealLight, icon: "bed-outline" },
  labor: { label: "Labor", color: Colors.purple, bg: Colors.purpleLight, icon: "heart-outline" },
  icu: { label: "ICU", color: Colors.danger, bg: Colors.dangerLight, icon: "pulse-outline" },
  private: { label: "Private", color: "#5B8FF9", bg: "#EEF3FF", icon: "shield-outline" },
};

export default function BedManagementScreen() {
  const router = useRouter();
  const { currentUser, getHospitalBeds, dischargeBed, allPatients, hospitalDoctors } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 16 : insets.top;
  const [wardFilter, setWardFilter] = useState<string>("all");

  const hospitalId = currentUser?.id ?? "hosp-001";
  const allBeds = getHospitalBeds(hospitalId);
  const beds = wardFilter === "all" ? allBeds : allBeds.filter(b => b.ward === wardFilter);
  const occupied = allBeds.filter(b => b.status === "occupied").length;
  const total = allBeds.length;
  const occupancyPct = total > 0 ? Math.round((occupied / total) * 100) : 0;

  const handleDischarge = (bedId: string, patientName?: string) => {
    Alert.alert("Discharge Patient", `Discharge ${patientName} from this bed?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Discharge", style: "destructive", onPress: () => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); dischargeBed(bedId); } },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bed Management</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 16 }} showsVerticalScrollIndicator={false}>
        {/* Occupancy overview */}
        <View style={styles.overviewCard}>
          <View style={styles.overviewCircle}>
            <Text style={styles.overviewPct}>{occupancyPct}%</Text>
            <Text style={styles.overviewLabel}>Occupied</Text>
          </View>
          <View style={styles.overviewStats}>
            <View style={styles.overviewStat}>
              <View style={[styles.overviewDot, { backgroundColor: Colors.danger }]} />
              <Text style={styles.overviewStatText}>{occupied} Occupied</Text>
            </View>
            <View style={styles.overviewStat}>
              <View style={[styles.overviewDot, { backgroundColor: Colors.success }]} />
              <Text style={styles.overviewStatText}>{total - occupied} Available</Text>
            </View>
            <View style={styles.overviewStat}>
              <View style={[styles.overviewDot, { backgroundColor: Colors.textMuted }]} />
              <Text style={styles.overviewStatText}>{total} Total Beds</Text>
            </View>
          </View>
        </View>

        {/* Ward filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} style={{ flexGrow: 0 }}>
          <TouchableOpacity
            style={[styles.filterChip, wardFilter === "all" && styles.filterChipActive]}
            onPress={() => setWardFilter("all")}
          >
            <Text style={[styles.filterText, wardFilter === "all" && styles.filterTextActive]}>All Wards</Text>
          </TouchableOpacity>
          {Object.entries(WARD_LABELS).map(([key, val]) => (
            <TouchableOpacity
              key={key}
              style={[styles.filterChip, wardFilter === key && { backgroundColor: val.color, borderColor: val.color }]}
              onPress={() => setWardFilter(key)}
            >
              <Text style={[styles.filterText, wardFilter === key && styles.filterTextActive]}>{val.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Bed grid */}
        <View style={styles.bedGrid}>
          {beds.map(bed => {
            const ward = WARD_LABELS[bed.ward]!;
            return (
              <TouchableOpacity
                key={bed.id}
                style={[styles.bedCard, bed.status === "occupied" && styles.bedCardOccupied]}
                onPress={() => bed.status === "occupied" && handleDischarge(bed.id, bed.patientName)}
                activeOpacity={bed.status === "occupied" ? 0.8 : 1}
              >
                <View style={styles.bedTop}>
                  <Text style={styles.bedNumber}>{bed.bedNumber}</Text>
                  <View style={[styles.wardBadge, { backgroundColor: ward.bg }]}>
                    <Text style={[styles.wardText, { color: ward.color }]}>{ward.label}</Text>
                  </View>
                </View>
                {bed.status === "occupied" ? (
                  <View style={styles.bedOccupiedInfo}>
                    <View style={[styles.bedStatusDot, { backgroundColor: Colors.danger }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.bedPatientName}>{bed.patientName}</Text>
                      <Text style={styles.bedDoctor}>{bed.doctorName}</Text>
                      <Text style={styles.bedDate}>Since: {bed.admissionDate}</Text>
                      {bed.notes && <Text style={styles.bedNotes}>{bed.notes}</Text>}
                    </View>
                  </View>
                ) : (
                  <View style={styles.bedAvailable}>
                    <Ionicons name="checkmark-circle-outline" size={24} color={Colors.success} />
                    <Text style={styles.bedAvailText}>Available</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center", shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text },
  overviewCard: { flexDirection: "row", backgroundColor: Colors.white, borderRadius: 20, padding: 20, gap: 20, alignItems: "center", shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 10, elevation: 2 },
  overviewCircle: { width: 90, height: 90, borderRadius: 45, borderWidth: 6, borderColor: Colors.teal, alignItems: "center", justifyContent: "center" },
  overviewPct: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.teal },
  overviewLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  overviewStats: { flex: 1, gap: 8 },
  overviewStat: { flexDirection: "row", alignItems: "center", gap: 8 },
  overviewDot: { width: 10, height: 10, borderRadius: 5 },
  overviewStatText: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.text },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.border },
  filterChipActive: { backgroundColor: Colors.teal, borderColor: Colors.teal },
  filterText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.textSecondary },
  filterTextActive: { color: Colors.white },
  bedGrid: { gap: 12 },
  bedCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 1, borderLeftWidth: 4, borderLeftColor: Colors.success },
  bedCardOccupied: { borderLeftColor: Colors.danger },
  bedTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  bedNumber: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.text },
  wardBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  wardText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  bedOccupiedInfo: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  bedStatusDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  bedPatientName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text },
  bedDoctor: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 1 },
  bedDate: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  bedNotes: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.warning, marginTop: 2, fontStyle: "italic" },
  bedAvailable: { flexDirection: "row", alignItems: "center", gap: 8 },
  bedAvailText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.success },
});
