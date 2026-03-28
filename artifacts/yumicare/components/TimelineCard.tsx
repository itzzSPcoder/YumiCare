import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import type { TimelineEntry } from "@/context/AppContext";

const TYPE_CONFIG = {
  ultrasound: { icon: "scan-outline" as const, color: Colors.teal, bg: Colors.tealLight, label: "Ultrasound" },
  lab: { icon: "flask-outline" as const, color: Colors.purple, bg: Colors.purpleLight, label: "Lab Report" },
  medication: { icon: "medical-outline" as const, color: Colors.success, bg: Colors.successLight, label: "Medication" },
  symptom: { icon: "alert-circle-outline" as const, color: Colors.warning, bg: Colors.warningLight, label: "Symptom" },
  visit: { icon: "person-outline" as const, color: Colors.tealDark, bg: Colors.tealLight, label: "Doctor Visit" },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

interface Props {
  entry: TimelineEntry;
  isLast?: boolean;
}

export function TimelineCard({ entry, isLast }: Props) {
  const cfg = TYPE_CONFIG[entry.type];

  return (
    <View style={styles.wrapper}>
      <View style={styles.lineCol}>
        <View style={[styles.dot, { backgroundColor: cfg.color }]} />
        {!isLast && <View style={[styles.line, { borderColor: Colors.border }]} />}
      </View>
      <View style={[styles.card, isLast && { marginBottom: 0 }]}>
        <View style={styles.header}>
          <View style={[styles.typeTag, { backgroundColor: cfg.bg }]}>
            <Ionicons name={cfg.icon} size={13} color={cfg.color} />
            <Text style={[styles.typeLabel, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
          <Text style={styles.date}>{formatDate(entry.date)}</Text>
        </View>
        <Text style={styles.title}>{entry.title}</Text>
        <Text style={styles.details}>{entry.details}</Text>
        {entry.values && (
          <View style={styles.valuesRow}>
            {Object.entries(entry.values).map(([k, v]) => (
              <View key={k} style={styles.valueChip}>
                <Text style={styles.valueKey}>{k.replace(/_/g, " ")}</Text>
                <Text style={styles.valueVal}>{v}</Text>
              </View>
            ))}
          </View>
        )}
        {entry.doctor && (
          <Text style={styles.doctor}>
            <Ionicons name="person-circle-outline" size={12} color={Colors.textMuted} /> {entry.doctor}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 4,
  },
  lineCol: {
    width: 24,
    alignItems: "center",
    paddingTop: 16,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 1,
  },
  line: {
    flex: 1,
    width: 2,
    borderLeftWidth: 2,
    borderStyle: "dashed",
    marginTop: 4,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  typeTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  typeLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  date: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
  },
  title: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    marginBottom: 4,
  },
  details: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  valuesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  valueChip: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: "center",
  },
  valueKey: {
    fontSize: 10,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
  },
  valueVal: {
    fontSize: 13,
    color: Colors.text,
    fontFamily: "Inter_600SemiBold",
    marginTop: 1,
  },
  doctor: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
    marginTop: 8,
  },
});
