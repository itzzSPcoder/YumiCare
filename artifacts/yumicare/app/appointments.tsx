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

const APPOINTMENTS = [
  { id: "1", date: "April 4, 2026", time: "10:00 AM", doctor: "Dr. Priya Sharma", type: "Prenatal Checkup", location: "City Women's Medical Center", status: "upcoming" },
  { id: "2", date: "April 18, 2026", time: "2:30 PM", doctor: "Dr. Priya Sharma", type: "Glucose Tolerance Test", location: "Lab – City Women's Medical Center", status: "upcoming" },
  { id: "3", date: "May 2, 2026", time: "11:00 AM", doctor: "Dr. Priya Sharma", type: "28-Week Ultrasound", location: "Radiology Dept – City Women's MC", status: "upcoming" },
  { id: "4", date: "March 25, 2026", time: "10:00 AM", doctor: "Dr. Priya Sharma", type: "Anomaly Scan", location: "City Women's Medical Center", status: "completed" },
  { id: "5", date: "February 28, 2026", time: "9:30 AM", doctor: "Dr. Priya Sharma", type: "22-Week Checkup", location: "City Women's Medical Center", status: "completed" },
];

export default function AppointmentsScreen() {
  const { patient } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const upcoming = APPOINTMENTS.filter((a) => a.status === "upcoming");
  const past = APPOINTMENTS.filter((a) => a.status === "completed");

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Appointments</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {upcoming.length > 0 && (
          <View>
            <Text style={styles.sectionLabel}>Upcoming</Text>
            <View style={styles.group}>
              {upcoming.map((appt, i) => (
                <View key={appt.id} style={[styles.apptCard, i > 0 && styles.divider]}>
                  <View style={styles.apptDateCol}>
                    <View style={styles.apptDateBox}>
                      <Text style={styles.apptDay}>{appt.date.split(" ")[1]?.replace(",", "")}</Text>
                      <Text style={styles.apptMonth}>{appt.date.split(" ")[0]?.slice(0, 3)}</Text>
                    </View>
                  </View>
                  <View style={styles.apptInfo}>
                    <Text style={styles.apptType}>{appt.type}</Text>
                    <View style={styles.apptRow}>
                      <Ionicons name="time-outline" size={13} color={Colors.textMuted} />
                      <Text style={styles.apptMeta}>{appt.time}</Text>
                    </View>
                    <View style={styles.apptRow}>
                      <Ionicons name="person-outline" size={13} color={Colors.textMuted} />
                      <Text style={styles.apptMeta}>{appt.doctor}</Text>
                    </View>
                    <View style={styles.apptRow}>
                      <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
                      <Text style={styles.apptMeta} numberOfLines={1}>{appt.location}</Text>
                    </View>
                  </View>
                  <View style={styles.upcomingBadge}>
                    <Text style={styles.upcomingBadgeText}>Soon</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {past.length > 0 && (
          <View>
            <Text style={styles.sectionLabel}>Past Visits</Text>
            <View style={[styles.group, { opacity: 0.8 }]}>
              {past.map((appt, i) => (
                <View key={appt.id} style={[styles.apptCard, i > 0 && styles.divider]}>
                  <View style={styles.apptDateCol}>
                    <View style={[styles.apptDateBox, { backgroundColor: Colors.border }]}>
                      <Text style={[styles.apptDay, { color: Colors.textMuted }]}>{appt.date.split(" ")[1]?.replace(",", "")}</Text>
                      <Text style={[styles.apptMonth, { color: Colors.textMuted }]}>{appt.date.split(" ")[0]?.slice(0, 3)}</Text>
                    </View>
                  </View>
                  <View style={styles.apptInfo}>
                    <Text style={styles.apptType}>{appt.type}</Text>
                    <View style={styles.apptRow}>
                      <Ionicons name="checkmark-circle" size={13} color={Colors.success} />
                      <Text style={[styles.apptMeta, { color: Colors.success }]}>Completed</Text>
                    </View>
                    <View style={styles.apptRow}>
                      <Ionicons name="person-outline" size={13} color={Colors.textMuted} />
                      <Text style={styles.apptMeta}>{appt.doctor}</Text>
                    </View>
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
  sectionLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 },
  group: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  divider: { borderTopWidth: 1, borderTopColor: Colors.border },
  apptCard: { flexDirection: "row", alignItems: "flex-start", gap: 14, padding: 16 },
  apptDateCol: { alignItems: "center" },
  apptDateBox: {
    width: 48,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.tealLight,
    alignItems: "center",
    justifyContent: "center",
  },
  apptDay: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.teal },
  apptMonth: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: Colors.teal, textTransform: "uppercase" },
  apptInfo: { flex: 1, gap: 4 },
  apptType: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.text, marginBottom: 4 },
  apptRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  apptMeta: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted, flex: 1 },
  upcomingBadge: {
    backgroundColor: Colors.teal,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  upcomingBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: Colors.white },
});
