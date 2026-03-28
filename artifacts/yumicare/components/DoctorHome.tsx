import React, { useState } from "react";
import {
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import type { DoctorPatient } from "@/context/AppContext";

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
const STATUS_LABEL = {
  stable: "Stable",
  attention: "Needs Attention",
  critical: "Critical",
};

function PatientCard({ p, onPress }: { p: DoctorPatient; onPress: () => void }) {
  const color = STATUS_COLOR[p.status];
  const bg = STATUS_BG[p.status];
  return (
    <TouchableOpacity style={styles.patientCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardTop}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitial}>{p.name.charAt(0)}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{p.name}</Text>
          <Text style={styles.cardSub}>Age {p.age} · Week {p.pregnancyWeek} · {p.bloodGroup}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: bg }]}>
          <View style={[styles.statusDot, { backgroundColor: color }]} />
          <Text style={[styles.statusLabel, { color }]}>{STATUS_LABEL[p.status]}</Text>
        </View>
      </View>
      <View style={styles.cardBottom}>
        <View style={styles.cardStat}>
          <Ionicons name="calendar-outline" size={13} color={Colors.textMuted} />
          <Text style={styles.cardStatText}>Last visit: {p.lastVisit}</Text>
        </View>
        <View style={styles.cardStat}>
          <Ionicons name="time-outline" size={13} color={Colors.textMuted} />
          <Text style={styles.cardStatText}>Due: {p.dueDate}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function DoctorHome() {
  const { doctorProfile, doctorPatients, notifications } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;
  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = search.trim()
    ? doctorPatients.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    : doctorPatients;

  const alertPatients = doctorPatients.filter(
    (p) => p.status === "critical" || p.status === "attention"
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.name}>{doctorProfile.name}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push("/notifications")}
            activeOpacity={0.8}
          >
            <Ionicons name="notifications-outline" size={22} color={Colors.text} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: Colors.purpleLight }]}
            onPress={() => router.push("/scan")}
            activeOpacity={0.8}
          >
            <Ionicons name="qr-code-outline" size={22} color={Colors.purple} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            setTimeout(() => setRefreshing(false), 1000);
          }} tintColor={Colors.purple} />
        }
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 4, gap: 16 }}>
          <View style={styles.statsRow}>
            {[
              { label: "Total Patients", value: String(doctorProfile.patientsCount), icon: "people-outline" as const, color: Colors.purple, bg: Colors.purpleLight },
              { label: "Due This Month", value: "3", icon: "calendar-outline" as const, color: Colors.teal, bg: Colors.tealLight },
              { label: "Alerts", value: String(alertPatients.length), icon: "warning-outline" as const, color: Colors.danger, bg: Colors.dangerLight },
            ].map((s, i) => (
              <View key={i} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: s.bg }]}>
                  <Ionicons name={s.icon} size={18} color={s.color} />
                </View>
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {alertPatients.length > 0 && (
            <View style={styles.alertSection}>
              <View style={styles.alertHeader}>
                <Ionicons name="alert-circle" size={16} color={Colors.danger} />
                <Text style={styles.alertTitle}>Requires Attention</Text>
              </View>
              {alertPatients.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.alertRow}
                  onPress={() => router.push({ pathname: "/patient-detail", params: { id: p.id } })}
                  activeOpacity={0.8}
                >
                  <View style={[styles.alertDot, { backgroundColor: STATUS_COLOR[p.status] }]} />
                  <View style={styles.alertInfo}>
                    <Text style={styles.alertName}>{p.name}</Text>
                    <Text style={styles.alertSub}>Week {p.pregnancyWeek} · {STATUS_LABEL[p.status]}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>My Patients</Text>
              <Text style={styles.sectionCount}>{filtered.length} patients</Text>
            </View>
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search patients..."
                placeholderTextColor={Colors.textMuted}
                value={search}
                onChangeText={setSearch}
              />
              {!!search && (
                <TouchableOpacity onPress={() => setSearch("")}>
                  <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, gap: 12, marginTop: 12 }}>
          {filtered.map((p) => (
            <PatientCard
              key={p.id}
              p={p}
              onPress={() => router.push({ pathname: "/patient-detail", params: { id: p.id } })}
            />
          ))}
          {filtered.length === 0 && (
            <View style={styles.emptySearch}>
              <Ionicons name="search-outline" size={40} color={Colors.tealMid} />
              <Text style={styles.emptyText}>No patients found</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: Colors.background,
  },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  name: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.text },
  headerActions: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  badge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { fontSize: 9, fontFamily: "Inter_700Bold", color: Colors.white },
  scroll: { flex: 1 },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 6,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.textMuted, textAlign: "center" },
  alertSection: {
    backgroundColor: Colors.dangerLight,
    borderRadius: 16,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.danger + "30",
  },
  alertHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  alertTitle: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.danger },
  alertRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 12,
  },
  alertDot: { width: 10, height: 10, borderRadius: 5 },
  alertInfo: { flex: 1 },
  alertName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text },
  alertSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 1 },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text },
  sectionCount: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.text,
  },
  patientCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.purpleLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.purple },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.text },
  cardSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 2 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  cardBottom: {
    flexDirection: "row",
    gap: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cardStat: { flexDirection: "row", alignItems: "center", gap: 4 },
  cardStatText: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  emptySearch: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium", color: Colors.textMuted },
});
