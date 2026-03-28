import React from "react";
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
import { PregnancyProgress } from "@/components/PregnancyProgress";
import { QuickStats } from "@/components/QuickStats";
import { EmergencyBanner } from "@/components/EmergencyBanner";
import { SectionHeader } from "@/components/SectionHeader";
import { TimelineCard } from "@/components/TimelineCard";

export default function PatientHome() {
  const { patient, timeline, notifications } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = React.useState(false);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;
  const recentEntries = timeline.slice(0, 3);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const stats = [
    {
      label: "Blood Group",
      value: patient?.bloodGroup ?? "—",
      icon: "water-outline" as const,
      color: Colors.danger,
      bg: Colors.dangerLight,
    },
    {
      label: "Hemoglobin",
      value: "11.2 g/dL",
      icon: "flask-outline" as const,
      color: Colors.purple,
      bg: Colors.purpleLight,
    },
    {
      label: "BP",
      value: "118/76",
      icon: "pulse-outline" as const,
      color: Colors.teal,
      bg: Colors.tealLight,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View>
          <Text style={styles.greeting}>Good morning</Text>
          <Text style={styles.name}>{patient?.name ?? "Patient"}</Text>
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
            style={[styles.iconBtn, { backgroundColor: Colors.tealLight }]}
            onPress={() => router.push("/qr")}
            activeOpacity={0.8}
          >
            <Ionicons name="qr-code-outline" size={22} color={Colors.teal} />
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
          }} tintColor={Colors.teal} />
        }
      >
        <EmergencyBanner />

        {patient && <PregnancyProgress week={patient.pregnancyWeek} />}

        <QuickStats stats={stats} />

        <View style={styles.quickActions}>
          {[
            { icon: "medical-outline" as const, label: "Medications", route: "/medications" },
            { icon: "warning-outline" as const, label: "Allergies", route: "/allergies" },
            { icon: "calendar-outline" as const, label: "Appointments", route: "/appointments" },
            { icon: "chatbubble-outline" as const, label: "Messages", route: "/messages" },
          ].map((action, i) => (
            <TouchableOpacity
              key={i}
              style={styles.quickActionItem}
              onPress={() => router.push(action.route as any)}
              activeOpacity={0.75}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name={action.icon} size={20} color={Colors.teal} />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View>
          <SectionHeader
            title="Recent Activity"
            action="View All"
            onAction={() => router.push("/(tabs)/timeline")}
          />
          {recentEntries.map((entry, i) => (
            <TimelineCard
              key={entry.id}
              entry={entry}
              isLast={i === recentEntries.length - 1}
            />
          ))}
        </View>

        <View style={styles.upcomingCard}>
          <View style={styles.upcomingHeader}>
            <Ionicons name="calendar" size={16} color={Colors.teal} />
            <Text style={styles.upcomingTitle}>Next Appointment</Text>
          </View>
          <Text style={styles.upcomingDate}>April 4, 2026 · 10:00 AM</Text>
          <Text style={styles.upcomingDoctor}>Dr. Priya Sharma · Routine Checkup</Text>
          <TouchableOpacity
            style={styles.upcomingBtn}
            onPress={() => router.push("/appointments")}
            activeOpacity={0.8}
          >
            <Text style={styles.upcomingBtnText}>View Details</Text>
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
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: Colors.background,
  },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  name: { fontSize: 24, fontFamily: "Inter_700Bold", color: Colors.text },
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
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  quickActionItem: { alignItems: "center", gap: 8 },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.tealLight,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: Colors.textSecondary },
  upcomingCard: {
    backgroundColor: Colors.teal,
    borderRadius: 20,
    padding: 20,
  },
  upcomingHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  upcomingTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.8)", textTransform: "uppercase", letterSpacing: 0.5 },
  upcomingDate: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.white, marginBottom: 4 },
  upcomingDoctor: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)", marginBottom: 16 },
  upcomingBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  upcomingBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.white },
});
