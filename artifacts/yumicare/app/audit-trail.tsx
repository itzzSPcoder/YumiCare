import React, { useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useApp, type AuditLog } from "@/context/AppContext";

const ACTION_COLORS: Record<string, { color: string; bg: string; icon: string }> = {
  "Created Hospital": { color: "#E67E22", bg: "#FEF5E7", icon: "business-outline" },
  "Added Doctor": { color: Colors.purple, bg: Colors.purpleLight, icon: "medical-outline" },
  "Added Patient": { color: Colors.teal, bg: Colors.tealLight, icon: "person-add-outline" },
  "Wrote Prescription": { color: "#5B8FF9", bg: "#EEF3FF", icon: "document-text-outline" },
  "Uploaded Ultrasound": { color: Colors.teal, bg: Colors.tealLight, icon: "scan-outline" },
  "Booked Appointment": { color: Colors.success, bg: Colors.successLight, icon: "calendar-outline" },
  "Admitted Patient": { color: Colors.danger, bg: Colors.dangerLight, icon: "bed-outline" },
  "Discharged Patient": { color: Colors.success, bg: Colors.successLight, icon: "exit-outline" },
  "Toggled User Status": { color: Colors.warning, bg: Colors.warningLight, icon: "toggle-outline" },
  "Reset Password": { color: Colors.danger, bg: Colors.dangerLight, icon: "key-outline" },
};

const ROLE_COLORS: Record<string, string> = { admin: "#E67E22", hospital: Colors.purple, doctor: "#5B8FF9", patient: Colors.teal };

export default function AuditTrailScreen() {
  const router = useRouter();
  const { auditLogs } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 16 : insets.top;
  const [filterRole, setFilterRole] = useState<string>("all");

  const filtered = filterRole === "all" ? auditLogs : auditLogs.filter(l => l.userRole === filterRole);

  const formatDate = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" }) + " " + d.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Audit Trail</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, maxHeight: 50 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 12 }}>
        {["all", "admin", "hospital", "doctor", "patient"].map(r => (
          <TouchableOpacity
            key={r}
            style={[styles.filterChip, filterRole === r && { backgroundColor: r === "all" ? Colors.teal : ROLE_COLORS[r], borderColor: "transparent" }]}
            onPress={() => setFilterRole(r)}
          >
            <Text style={[styles.filterText, filterRole === r && { color: Colors.white }]}>{r === "all" ? "All" : r.charAt(0).toUpperCase() + r.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 0 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.countText}>{filtered.length} actions recorded</Text>
        <View style={styles.timeline}>
          {filtered.map((log, i) => {
            const ac = ACTION_COLORS[log.action] ?? { color: Colors.textSecondary, bg: Colors.background, icon: "ellipse-outline" };
            return (
              <View key={log.id} style={styles.logRow}>
                <View style={styles.logLine}>
                  <View style={[styles.logDot, { backgroundColor: ac.color }]} />
                  {i < filtered.length - 1 && <View style={styles.logConnector} />}
                </View>
                <View style={styles.logCard}>
                  <View style={styles.logTop}>
                    <View style={[styles.logIcon, { backgroundColor: ac.bg }]}>
                      <Ionicons name={ac.icon as any} size={16} color={ac.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.logAction}>{log.action}</Text>
                      <Text style={styles.logTime}>{formatDate(log.timestamp)}</Text>
                    </View>
                    <View style={[styles.roleBadge, { backgroundColor: (ROLE_COLORS[log.userRole] ?? Colors.textMuted) + "20" }]}>
                      <Text style={[styles.roleText, { color: ROLE_COLORS[log.userRole] ?? Colors.textMuted }]}>{log.userRole}</Text>
                    </View>
                  </View>
                  <View style={styles.logDetails}>
                    <Text style={styles.logUser}>By: {log.userName}</Text>
                    {log.details && <Text style={styles.logDetail}>{log.details}</Text>}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center", shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.border },
  filterText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: Colors.textSecondary },
  countText: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.textMuted, marginBottom: 12 },
  timeline: { gap: 0 },
  logRow: { flexDirection: "row", gap: 12 },
  logLine: { width: 20, alignItems: "center" },
  logDot: { width: 12, height: 12, borderRadius: 6, marginTop: 14 },
  logConnector: { width: 2, flex: 1, backgroundColor: Colors.border, marginTop: 2 },
  logCard: { flex: 1, backgroundColor: Colors.white, borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 1, shadowRadius: 4, elevation: 1, gap: 8 },
  logTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  logIcon: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  logAction: { fontSize: 13, fontFamily: "Inter_700Bold", color: Colors.text },
  logTime: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  roleText: { fontSize: 9, fontFamily: "Inter_700Bold", textTransform: "uppercase" },
  logDetails: { gap: 2, paddingLeft: 42 },
  logUser: { fontSize: 11, fontFamily: "Inter_500Medium", color: Colors.textSecondary },
  logDetail: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.text },
});
