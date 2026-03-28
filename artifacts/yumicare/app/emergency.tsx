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

export default function EmergencyScreen() {
  const router = useRouter();
  const { patient } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (!patient) return null;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency Card</Text>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.patientCard}>
          <View style={styles.avatarWrap}>
            <Ionicons name="person" size={32} color={Colors.white} />
          </View>
          <Text style={styles.patientName}>{patient.name}</Text>
          <Text style={styles.patientId}>ID: {patient.id}</Text>
        </View>

        <View style={styles.criticalGrid}>
          <View style={[styles.criticalItem, styles.criticalBlood]}>
            <Ionicons name="water" size={22} color={Colors.white} />
            <Text style={styles.criticalLabel}>Blood Group</Text>
            <Text style={styles.criticalValue}>{patient.bloodGroup}</Text>
          </View>
          <View style={[styles.criticalItem, styles.criticalPreg]}>
            <Ionicons name="heart" size={22} color={Colors.white} />
            <Text style={styles.criticalLabel}>Pregnancy Week</Text>
            <Text style={styles.criticalValue}>Week {patient.pregnancyWeek}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="warning" size={16} color={Colors.danger} />
            <Text style={[styles.sectionTitle, { color: Colors.danger }]}>Allergies</Text>
          </View>
          <View style={styles.tagRow}>
            {patient.allergies.map((a, i) => (
              <View key={i} style={styles.allergyTag}>
                <Text style={styles.allergyText}>{a}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="medical" size={16} color={Colors.purple} />
            <Text style={[styles.sectionTitle, { color: Colors.purple }]}>Current Medications</Text>
          </View>
          {patient.medications.map((m, i) => (
            <View key={i} style={styles.medRow}>
              <View style={styles.medDot} />
              <Text style={styles.medText}>{m}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={16} color={Colors.teal} />
            <Text style={[styles.sectionTitle, { color: Colors.teal }]}>Primary Doctor</Text>
          </View>
          <Text style={styles.doctorName}>{patient.primaryDoctor}</Text>
        </View>

        <View style={styles.dueSection}>
          <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.dueText}>Due Date: {patient.dueDate}</Text>
        </View>

        <View style={styles.disclaimerBox}>
          <Ionicons name="information-circle-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.disclaimer}>
            This emergency card is for medical personnel only. Access is logged and time-limited.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.danger,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.white,
  },
  liveText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
    letterSpacing: 1,
  },
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  content: {
    padding: 20,
  },
  patientCard: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  avatarWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.teal,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  patientName: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    marginBottom: 4,
  },
  patientId: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  criticalGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  criticalItem: {
    flex: 1,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    gap: 6,
  },
  criticalBlood: {
    backgroundColor: Colors.danger,
  },
  criticalPreg: {
    backgroundColor: Colors.teal,
  },
  criticalLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.8)",
  },
  criticalValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  allergyTag: {
    backgroundColor: Colors.dangerLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.danger + "40",
  },
  allergyText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.danger,
  },
  medRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  medDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.purple,
  },
  medText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.text,
  },
  doctorName: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  dueSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  dueText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
  },
  disclaimerBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: Colors.border,
    borderRadius: 10,
    padding: 12,
  },
  disclaimer: {
    flex: 1,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    lineHeight: 16,
  },
});
