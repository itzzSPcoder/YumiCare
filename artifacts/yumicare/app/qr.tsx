import React from "react";
import {
  Platform,
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

export default function QRScreen() {
  const router = useRouter();
  const { patient } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health ID</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {patient && (
          <QRCodeDisplay patientId={patient.id} name={patient.name} />
        )}

        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Ionicons name="information-circle-outline" size={18} color={Colors.teal} />
            <Text style={styles.infoText}>
              Show this QR code to your healthcare provider for instant record access. Only verified medical staff can view your full records.
            </Text>
          </View>
        </View>

        <View style={styles.accessLevels}>
          <Text style={styles.accessTitle}>Access Levels</Text>
          {[
            { role: "Primary Doctor", access: "Full Record Access", icon: "checkmark-circle" as const, color: Colors.success },
            { role: "Secondary Doctor", access: "Requires Your Approval", icon: "time-outline" as const, color: Colors.warning },
            { role: "Emergency Doctor", access: "Critical Info Only · Time-Limited", icon: "alert-circle" as const, color: Colors.danger },
          ].map((level, i) => (
            <View key={i} style={styles.accessRow}>
              <Ionicons name={level.icon} size={16} color={level.color} />
              <View style={styles.accessInfo}>
                <Text style={styles.accessRole}>{level.role}</Text>
                <Text style={styles.accessAccess}>{level.access}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
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
  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  content: {
    flex: 1,
    padding: 20,
    gap: 20,
    alignItems: "center",
  },
  infoBox: {
    backgroundColor: Colors.tealLight,
    borderRadius: 14,
    padding: 14,
    width: "100%",
  },
  infoRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.tealDark,
    lineHeight: 20,
  },
  accessLevels: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    width: "100%",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
    gap: 14,
  },
  accessTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    marginBottom: 4,
  },
  accessRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  accessInfo: {
    flex: 1,
  },
  accessRole: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  accessAccess: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    marginTop: 1,
  },
});
