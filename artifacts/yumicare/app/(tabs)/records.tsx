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
import { QRCodeDisplay } from "@/components/QRCodeDisplay";
import HospitalPatients from "@/components/HospitalPatients";
import AdminReports from "@/components/AdminReports";
import { SectionHeader } from "@/components/SectionHeader";

// ─── Patient Records ──────────────────────────────────────────────────────────

const RECORD_TYPES = [
  { icon: "scan-outline" as const, label: "Ultrasound Reports", count: 3, color: Colors.teal, bg: Colors.tealLight },
  { icon: "flask-outline" as const, label: "Lab Reports", count: 5, color: Colors.purple, bg: Colors.purpleLight },
  { icon: "medical-outline" as const, label: "Prescriptions", count: 2, color: Colors.success, bg: Colors.successLight },
  { icon: "document-text-outline" as const, label: "Doctor's Notes", count: 4, color: Colors.warning, bg: Colors.warningLight },
];

const RECENT_RECORDS = [
  { icon: "flask-outline" as const, title: "Blood Work Panel", date: "Mar 18, 2026", type: "Lab", color: Colors.purple, bg: Colors.purpleLight },
  { icon: "scan-outline" as const, title: "Anomaly Scan", date: "Mar 25, 2026", type: "Ultrasound", color: Colors.teal, bg: Colors.tealLight },
  { icon: "medical-outline" as const, title: "Iron Supplement Rx", date: "Mar 10, 2026", type: "Prescription", color: Colors.success, bg: Colors.successLight },
];

function PatientRecords() {
  const { patient } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={styles.title}>My Records</Text>
      </View>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: bottomPad, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.typeGrid}>
          {RECORD_TYPES.map((r, i) => (
            <TouchableOpacity key={i} style={[styles.typeCard, { backgroundColor: r.bg }]} activeOpacity={0.8}>
              <View style={[styles.typeIconWrap, { backgroundColor: r.color + "20" }]}>
                <Ionicons name={r.icon} size={20} color={r.color} />
              </View>
              <Text style={[styles.typeCount, { color: r.color }]}>{r.count}</Text>
              <Text style={styles.typeLabel}>{r.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View>
          <SectionHeader title="Recent Documents" />
          <View style={styles.recentList}>
            {RECENT_RECORDS.map((rec, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.recentRow, i > 0 && styles.divider]}
                activeOpacity={0.8}
              >
                <View style={[styles.recentIcon, { backgroundColor: rec.bg }]}>
                  <Ionicons name={rec.icon} size={18} color={rec.color} />
                </View>
                <View style={styles.recentInfo}>
                  <Text style={styles.recentTitle}>{rec.title}</Text>
                  <Text style={styles.recentDate}>{rec.date}</Text>
                </View>
                <View style={[styles.typePill, { backgroundColor: rec.bg }]}>
                  <Text style={[styles.typePillText, { color: rec.color }]}>{rec.type}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {patient && (
          <View>
            <SectionHeader title="My Health ID" />
            <QRCodeDisplay patientId={patient.id} name={patient.name} compact />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Doctor Messages Inbox ────────────────────────────────────────────────────

const DOCTOR_CHATS = [
  { patientId: "PAT-2024-001", name: "Aisha Rahman", week: 24, lastMsg: "Doctor, I've been having mild swelling in my feet.", time: "11:15 AM", unread: 1, status: "stable" as const },
  { patientId: "PAT-2024-002", name: "Sara Khan", week: 32, lastMsg: "Thank you for the prescription, feeling better now.", time: "Yesterday", unread: 0, status: "attention" as const },
  { patientId: "PAT-2024-003", name: "Mia Johnson", week: 14, lastMsg: "When is my next appointment scheduled?", time: "2 days ago", unread: 2, status: "stable" as const },
  { patientId: "PAT-2024-004", name: "Nadia Malik", week: 38, lastMsg: "I have severe headache and vision blur since morning.", time: "3 days ago", unread: 0, status: "critical" as const },
];

const STATUS_COLOR = { stable: Colors.success, attention: Colors.warning, critical: Colors.danger };

function DoctorMessages() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;

  const totalUnread = DOCTOR_CHATS.reduce((sum, c) => sum + c.unread, 0);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View>
          <Text style={styles.title}>Messages</Text>
          {totalUnread > 0 && (
            <Text style={styles.unreadSub}>{totalUnread} unread message{totalUnread > 1 ? "s" : ""}</Text>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: bottomPad, gap: 0 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.chatList}>
          {DOCTOR_CHATS.map((chat, i) => (
            <TouchableOpacity
              key={chat.patientId}
              style={[styles.chatRow, i > 0 && styles.divider, chat.unread > 0 && styles.chatRowUnread]}
              onPress={() => router.push({ pathname: "/doctor-chat", params: { patientId: chat.patientId } })}
              activeOpacity={0.8}
            >
              <View style={styles.chatAvatar}>
                <Text style={styles.chatAvatarText}>{chat.name.charAt(0)}</Text>
                <View style={[styles.chatStatusDot, { backgroundColor: STATUS_COLOR[chat.status] }]} />
              </View>
              <View style={styles.chatInfo}>
                <View style={styles.chatTopRow}>
                  <Text style={styles.chatName}>{chat.name}</Text>
                  <Text style={styles.chatTime}>{chat.time}</Text>
                </View>
                <View style={styles.chatBottomRow}>
                  <Text style={styles.chatLast} numberOfLines={1}>{chat.lastMsg}</Text>
                  {chat.unread > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadBadgeText}>{chat.unread}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.chatWeek}>Week {chat.week} · Patient</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export default function RecordsScreen() {
  const { role } = useApp();
  if (role === "doctor") return <DoctorMessages />;
  if (role === "hospital") return <HospitalPatients />;
  if (role === "admin") return <AdminReports />;
  return <PatientRecords />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 24, fontFamily: "Inter_700Bold", color: Colors.text },
  unreadSub: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.purple, marginTop: 2 },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  typeCard: {
    width: "47%",
    borderRadius: 18,
    padding: 16,
    gap: 6,
  },
  typeIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  typeCount: { fontSize: 26, fontFamily: "Inter_700Bold" },
  typeLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.textSecondary },
  recentList: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  recentRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  divider: { borderTopWidth: 1, borderTopColor: Colors.border },
  recentIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  recentInfo: { flex: 1 },
  recentTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text },
  recentDate: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 2 },
  typePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typePillText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  chatList: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  chatRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  chatRowUnread: { backgroundColor: Colors.purpleLight + "40" },
  chatAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.purpleLight,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  chatAvatarText: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.purple },
  chatStatusDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  chatInfo: { flex: 1 },
  chatTopRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  chatName: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.text },
  chatTime: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  chatBottomRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 3 },
  chatLast: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textSecondary },
  unreadBadge: {
    backgroundColor: Colors.purple,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  unreadBadgeText: { fontSize: 11, fontFamily: "Inter_700Bold", color: Colors.white },
  chatWeek: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted },
});
