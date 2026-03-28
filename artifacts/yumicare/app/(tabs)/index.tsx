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
import { QRCodeDisplay } from "@/components/QRCodeDisplay";

export default function HomeScreen() {
  const { patient, timeline, role } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = React.useState(false);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;

  const recentEntries = timeline.slice(0, 3);

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
      value: "11.2",
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

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View>
          <Text style={styles.greeting}>Good morning</Text>
          <Text style={styles.name}>{patient?.name ?? "Patient"}</Text>
        </View>
        <TouchableOpacity
          style={styles.qrBtn}
          onPress={() => router.push("/qr")}
          activeOpacity={0.8}
        >
          <Ionicons name="qr-code-outline" size={22} color={Colors.teal} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ padding: 20, paddingBottom: bottomPad, gap: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.teal} />
        }
      >
        <EmergencyBanner />

        {patient && (
          <PregnancyProgress week={patient.pregnancyWeek} />
        )}

        <QuickStats stats={stats} />

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

        {role === "patient" && patient && (
          <View>
            <SectionHeader title="My Health ID" />
            <QRCodeDisplay patientId={patient.id} name={patient.name} compact />
          </View>
        )}

        {role === "doctor" && (
          <View style={styles.doctorPanel}>
            <View style={styles.doctorPanelHeader}>
              <Ionicons name="people-outline" size={18} color={Colors.purple} />
              <Text style={styles.doctorPanelTitle}>Patients Under Care</Text>
            </View>
            {["Aisha Rahman – Week 24", "Sara Khan – Week 32", "Mia Johnson – Week 14"].map((p, i) => (
              <TouchableOpacity key={i} style={styles.patientRow} activeOpacity={0.75}>
                <View style={styles.patientAvatar}>
                  <Ionicons name="person" size={16} color={Colors.purple} />
                </View>
                <Text style={styles.patientRowName}>{p}</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        )}
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
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: Colors.background,
  },
  greeting: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
  },
  name: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  qrBtn: {
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
  doctorPanel: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  doctorPanelHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  doctorPanelTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  patientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  patientAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.purpleLight,
    alignItems: "center",
    justifyContent: "center",
  },
  patientRowName: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.text,
  },
});
