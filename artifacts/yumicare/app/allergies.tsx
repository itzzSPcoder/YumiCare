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

const ALLERGY_INFO: Record<string, { severity: string; reaction: string; color: string }> = {
  "Penicillin": { severity: "Severe", reaction: "Anaphylaxis, rash, difficulty breathing", color: Colors.danger },
  "Sulfa drugs": { severity: "Moderate", reaction: "Skin rash, nausea, photosensitivity", color: Colors.warning },
  "Aspirin": { severity: "Moderate", reaction: "GI irritation, possible bleeding", color: Colors.warning },
  "Latex": { severity: "Severe", reaction: "Contact dermatitis, anaphylaxis", color: Colors.danger },
  "Codeine": { severity: "Moderate", reaction: "Respiratory depression, nausea", color: Colors.warning },
};

const SEVERITY_COLOR: Record<string, string> = {
  Severe: Colors.danger,
  Moderate: Colors.warning,
  Mild: Colors.success,
};

export default function AllergiesScreen() {
  const { patient } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const allergies = patient?.allergies ?? [];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Allergies</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.warningCard}>
          <Ionicons name="warning" size={22} color={Colors.danger} />
          <View style={styles.warningText}>
            <Text style={styles.warningTitle}>Critical Allergy Information</Text>
            <Text style={styles.warningSub}>
              Always inform healthcare providers about these allergies before any treatment.
            </Text>
          </View>
        </View>

        {allergies.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="checkmark-circle-outline" size={48} color={Colors.success} />
            <Text style={styles.emptyTitle}>No allergies recorded</Text>
            <Text style={styles.emptySub}>You have no documented drug allergies.</Text>
          </View>
        ) : (
          allergies.map((allergy, i) => {
            const info = ALLERGY_INFO[allergy] ?? { severity: "Unknown", reaction: "Consult your doctor", color: Colors.textMuted };
            const severityColor = SEVERITY_COLOR[info.severity] ?? Colors.textMuted;
            return (
              <View key={i} style={styles.allergyCard}>
                <View style={styles.allergyTop}>
                  <View style={styles.allergyIconWrap}>
                    <Ionicons name="warning" size={20} color={info.color} />
                  </View>
                  <View style={styles.allergyMeta}>
                    <Text style={styles.allergyName}>{allergy}</Text>
                    <View style={[styles.severityBadge, { backgroundColor: severityColor + "20" }]}>
                      <Text style={[styles.severityText, { color: severityColor }]}>{info.severity}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.allergyReaction}>
                  <Text style={styles.reactionLabel}>Possible Reactions</Text>
                  <Text style={styles.reactionText}>{info.reaction}</Text>
                </View>
              </View>
            );
          })
        )}

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.teal} />
          <Text style={styles.infoText}>
            To add or update allergy information, please contact your primary doctor — Dr. {patient?.primaryDoctor}.
          </Text>
        </View>

        <View style={styles.emergencyNote}>
          <Text style={styles.emergencyNoteTitle}>Emergency Note</Text>
          <Text style={styles.emergencyNoteText}>
            Your allergy information is included in your emergency health card, accessible via QR scan by verified emergency personnel.
          </Text>
          <TouchableOpacity
            style={styles.emergencyBtn}
            onPress={() => router.push("/emergency")}
            activeOpacity={0.8}
          >
            <Ionicons name="shield-checkmark-outline" size={16} color={Colors.white} />
            <Text style={styles.emergencyBtnText}>View Emergency Card</Text>
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
  warningCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: Colors.dangerLight,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.danger + "30",
  },
  warningText: { flex: 1 },
  warningTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.danger, marginBottom: 4 },
  warningSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.danger + "CC", lineHeight: 18 },
  empty: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text },
  emptySub: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  allergyCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  allergyTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  allergyIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.dangerLight,
    alignItems: "center",
    justifyContent: "center",
  },
  allergyMeta: { flex: 1, gap: 6 },
  allergyName: { fontSize: 17, fontFamily: "Inter_700Bold", color: Colors.text },
  severityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: "flex-start" },
  severityText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  allergyReaction: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  reactionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: Colors.textMuted, textTransform: "uppercase", letterSpacing: 0.5 },
  reactionText: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textSecondary, lineHeight: 18 },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: Colors.tealLight,
    borderRadius: 14,
    padding: 14,
  },
  infoText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.tealDark, lineHeight: 19 },
  emergencyNote: {
    backgroundColor: Colors.danger,
    borderRadius: 20,
    padding: 20,
    gap: 8,
  },
  emergencyNoteTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.white },
  emergencyNoteText: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.85)", lineHeight: 18 },
  emergencyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 4,
  },
  emergencyBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.white },
});
