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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";
import { SectionHeader } from "@/components/SectionHeader";

const RECORD_TYPES = [
  { icon: "scan-outline" as const, label: "Ultrasound Reports", count: 3, color: Colors.teal, bg: Colors.tealLight },
  { icon: "flask-outline" as const, label: "Lab Reports", count: 5, color: Colors.purple, bg: Colors.purpleLight },
  { icon: "medical-outline" as const, label: "Prescriptions", count: 2, color: Colors.success, bg: Colors.successLight },
  { icon: "document-text-outline" as const, label: "Doctor's Notes", count: 4, color: Colors.warning, bg: Colors.warningLight },
];

export default function RecordsScreen() {
  const { patient } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={styles.title}>Health Records</Text>
        <TouchableOpacity style={styles.uploadBtn} activeOpacity={0.8}>
          <Ionicons name="cloud-upload-outline" size={20} color={Colors.teal} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ padding: 20, paddingBottom: bottomPad, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {patient && (
          <View>
            <SectionHeader title="Digital Health ID" />
            <QRCodeDisplay patientId={patient.id} name={patient.name} />
          </View>
        )}

        <View>
          <SectionHeader title="Record Categories" />
          <View style={styles.grid}>
            {RECORD_TYPES.map((rt, i) => (
              <TouchableOpacity key={i} style={styles.recordCard} activeOpacity={0.8}>
                <View style={[styles.recordIcon, { backgroundColor: rt.bg }]}>
                  <Ionicons name={rt.icon} size={22} color={rt.color} />
                </View>
                <Text style={styles.recordLabel}>{rt.label}</Text>
                <Text style={[styles.recordCount, { color: rt.color }]}>{rt.count} files</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View>
          <SectionHeader title="Access Control" />
          <View style={styles.accessCard}>
            <View style={styles.accessRow}>
              <View style={styles.accessInfo}>
                <View style={[styles.accessDot, { backgroundColor: Colors.success }]} />
                <View>
                  <Text style={styles.accessName}>Dr. Priya Sharma</Text>
                  <Text style={styles.accessRole}>Primary Doctor · Full Access</Text>
                </View>
              </View>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            </View>
            <View style={[styles.accessRow, { borderTopWidth: 1, borderTopColor: Colors.border }]}>
              <View style={styles.accessInfo}>
                <View style={[styles.accessDot, { backgroundColor: Colors.warning }]} />
                <View>
                  <Text style={styles.accessName}>Dr. Raj Mehta</Text>
                  <Text style={styles.accessRole}>Secondary · Pending Approval</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.approveBtn} activeOpacity={0.8}>
                <Text style={styles.approveBtnText}>Approve</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View>
          <SectionHeader title="Audit Log" />
          <View style={styles.auditCard}>
            {[
              { action: "Viewed records", who: "Dr. Priya Sharma", time: "2 hours ago", icon: "eye-outline" as const },
              { action: "Added lab report", who: "Dr. Priya Sharma", time: "5 days ago", icon: "add-circle-outline" as const },
              { action: "Emergency access", who: "Dr. Rao (Emergency)", time: "2 weeks ago", icon: "alert-circle-outline" as const },
            ].map((log, i) => (
              <View
                key={i}
                style={[
                  styles.auditRow,
                  i > 0 && { borderTopWidth: 1, borderTopColor: Colors.border },
                ]}
              >
                <View style={styles.auditIconWrap}>
                  <Ionicons name={log.icon} size={16} color={Colors.teal} />
                </View>
                <View style={styles.auditInfo}>
                  <Text style={styles.auditAction}>{log.action}</Text>
                  <Text style={styles.auditWho}>{log.who}</Text>
                </View>
                <Text style={styles.auditTime}>{log.time}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  uploadBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.tealLight,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    flex: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  recordCard: {
    width: "47%",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  recordIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  recordLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
    marginBottom: 4,
  },
  recordCount: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  accessCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  accessRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  accessInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  accessDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  accessName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  accessRole: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    marginTop: 1,
  },
  approveBtn: {
    backgroundColor: Colors.tealLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  approveBtnText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.teal,
  },
  auditCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  auditRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  auditIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.tealLight,
    alignItems: "center",
    justifyContent: "center",
  },
  auditInfo: {
    flex: 1,
  },
  auditAction: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  auditWho: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    marginTop: 1,
  },
  auditTime: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
  },
});
