import React, { useState } from "react";
import {
  Platform,
  RefreshControl,
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

const STATUS_COLOR = { stable: Colors.success, attention: Colors.warning, critical: Colors.danger };
const STATUS_BG = { stable: Colors.successLight, attention: Colors.warningLight, critical: Colors.dangerLight };
const STATUS_LABEL = { stable: "Stable", attention: "Needs Attention", critical: "Critical" };

export default function DoctorHome() {
  const { doctorProfile, doctorPatients, notifications } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;
  const unreadCount = notifications.filter((n) => !n.read).length;
  const alertPatients = doctorPatients.filter((p) => p.status !== "stable");
  const dueThisMonth = doctorPatients.filter((p) => p.pregnancyWeek >= 36);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View>
          <Text style={styles.greeting}>Good morning</Text>
          <Text style={styles.name}>{doctorProfile.name}</Text>
          <Text style={styles.hospital}>{doctorProfile.specialization}</Text>
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
        contentContainerStyle={{ padding: 20, paddingBottom: bottomPad, gap: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            setTimeout(() => setRefreshing(false), 1000);
          }} tintColor={Colors.purple} />
        }
      >
        <View style={styles.statsRow}>
          {[
            { label: "Total Patients", value: String(doctorProfile.patientsCount), icon: "people-outline" as const, color: Colors.purple, bg: Colors.purpleLight },
            { label: "Due Soon", value: String(dueThisMonth.length), icon: "calendar-outline" as const, color: Colors.teal, bg: Colors.tealLight },
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

        <View style={styles.quickActions}>
          {[
            { icon: "people-outline" as const, label: "All Patients", route: "/(tabs)/timeline", color: Colors.purple, bg: Colors.purpleLight },
            { icon: "chatbubbles-outline" as const, label: "Messages", route: "/(tabs)/records", color: Colors.teal, bg: Colors.tealLight },
            { icon: "scan-outline" as const, label: "Upload Scan", route: "/ultrasound-upload", color: Colors.success, bg: Colors.successLight },
            { icon: "qr-code-outline" as const, label: "Scan QR", route: "/scan", color: Colors.warning, bg: Colors.warningLight },
          ].map((a, i) => (
            <TouchableOpacity
              key={i}
              style={styles.quickActionItem}
              onPress={() => router.push(a.route as any)}
              activeOpacity={0.75}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: a.bg }]}>
                <Ionicons name={a.icon} size={22} color={a.color} />
              </View>
              <Text style={styles.quickActionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {alertPatients.length > 0 && (
          <View style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <View style={styles.alertHeaderLeft}>
                <Ionicons name="alert-circle" size={16} color={Colors.danger} />
                <Text style={styles.alertTitle}>Needs Attention</Text>
              </View>
              <Text style={styles.alertCount}>{alertPatients.length} patient{alertPatients.length > 1 ? "s" : ""}</Text>
            </View>
            {alertPatients.map((p, i) => (
              <TouchableOpacity
                key={p.id}
                style={[styles.alertRow, i > 0 && styles.alertDivider]}
                onPress={() => router.push({ pathname: "/patient-detail", params: { id: p.id } })}
                activeOpacity={0.8}
              >
                <View style={[styles.alertDot, { backgroundColor: STATUS_COLOR[p.status] }]} />
                <View style={styles.alertInfo}>
                  <Text style={styles.alertName}>{p.name}</Text>
                  <Text style={styles.alertSub}>Week {p.pregnancyWeek} · {STATUS_LABEL[p.status]}</Text>
                </View>
                <View style={styles.alertBtns}>
                  <TouchableOpacity
                    style={styles.alertActionBtn}
                    onPress={() => router.push({ pathname: "/doctor-chat", params: { patientId: p.id } })}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="chatbubble-outline" size={15} color={Colors.purple} />
                  </TouchableOpacity>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Patients</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/timeline")} activeOpacity={0.8}>
            <Text style={styles.sectionLink}>View All</Text>
          </TouchableOpacity>
        </View>
        {doctorPatients.slice(0, 3).map((p, i) => (
          <TouchableOpacity
            key={p.id}
            style={styles.patientRow}
            onPress={() => router.push({ pathname: "/patient-detail", params: { id: p.id } })}
            activeOpacity={0.8}
          >
            <View style={styles.rowAvatar}>
              <Text style={styles.rowInitial}>{p.name.charAt(0)}</Text>
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowName}>{p.name}</Text>
              <Text style={styles.rowSub}>Week {p.pregnancyWeek} · Last seen {p.lastVisit}</Text>
            </View>
            <View style={[styles.miniStatus, { backgroundColor: STATUS_BG[p.status] }]}>
              <View style={[styles.miniDot, { backgroundColor: STATUS_COLOR[p.status] }]} />
            </View>
            <View style={styles.rowActions}>
              <TouchableOpacity
                onPress={() => router.push({ pathname: "/doctor-chat", params: { patientId: p.id } })}
                style={styles.rowIconBtn}
                activeOpacity={0.8}
              >
                <Ionicons name="chatbubble-outline" size={15} color={Colors.purple} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push({ pathname: "/ultrasound-upload", params: { patientId: p.id } })}
                style={[styles.rowIconBtn, { backgroundColor: Colors.tealLight }]}
                activeOpacity={0.8}
              >
                <Ionicons name="scan-outline" size={15} color={Colors.teal} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  name: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.text, marginTop: 2 },
  hospital: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.purple, marginTop: 2 },
  headerActions: { flexDirection: "row", gap: 8, paddingTop: 4 },
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
    gap: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.textMuted, textAlign: "center" },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionItem: { alignItems: "center", gap: 8 },
  quickActionIcon: { width: 50, height: 50, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  quickActionLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: Colors.textSecondary },
  alertCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 3,
    borderLeftColor: Colors.danger,
  },
  alertHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  alertHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  alertTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.danger },
  alertCount: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  alertRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 },
  alertDivider: { borderTopWidth: 1, borderTopColor: Colors.border },
  alertDot: { width: 10, height: 10, borderRadius: 5 },
  alertInfo: { flex: 1 },
  alertName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text },
  alertSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  alertBtns: { flexDirection: "row", alignItems: "center", gap: 8 },
  alertActionBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.purpleLight,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text },
  sectionLink: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.purple },
  patientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 1,
  },
  rowAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.purpleLight,
    alignItems: "center",
    justifyContent: "center",
  },
  rowInitial: { fontSize: 17, fontFamily: "Inter_700Bold", color: Colors.purple },
  rowInfo: { flex: 1 },
  rowName: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.text },
  rowSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 2 },
  miniStatus: { width: 20, height: 20, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  miniDot: { width: 8, height: 8, borderRadius: 4 },
  rowActions: { flexDirection: "row", gap: 6 },
  rowIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: Colors.purpleLight,
    alignItems: "center",
    justifyContent: "center",
  },
});
