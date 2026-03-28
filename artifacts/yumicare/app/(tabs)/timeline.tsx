import React, { useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { TimelineCard } from "@/components/TimelineCard";
import { AddRecordSheet } from "@/components/AddRecordSheet";
import type { TimelineEntry } from "@/context/AppContext";

const FILTERS: { key: TimelineEntry["type"] | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "ultrasound", label: "Ultrasound" },
  { key: "lab", label: "Lab" },
  { key: "medication", label: "Meds" },
  { key: "visit", label: "Visits" },
  { key: "symptom", label: "Symptoms" },
];

export default function TimelineScreen() {
  const { timeline, role } = useApp();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<TimelineEntry["type"] | "all">("all");
  const [showAdd, setShowAdd] = useState(false);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;

  const filtered = filter === "all" ? timeline : timeline.filter((e) => e.type === filter);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={styles.title}>Medical Timeline</Text>
        {role === "patient" && (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowAdd(true);
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={22} color={Colors.white} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterRow}>
        <FlatList
          data={FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, filter === item.key && styles.filterChipActive]}
              onPress={() => setFilter(item.key)}
              activeOpacity={0.75}
            >
              <Text
                style={[styles.filterLabel, filter === item.key && styles.filterLabelActive]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={48} color={Colors.tealMid} />
            <Text style={styles.emptyTitle}>No records found</Text>
            <Text style={styles.emptySub}>
              {role === "patient" ? "Add your first health record." : "No records for this filter."}
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <TimelineCard
            entry={item}
            isLast={index === filtered.length - 1}
          />
        )}
      />

      <AddRecordSheet visible={showAdd} onClose={() => setShowAdd(false)} />
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
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.teal,
    alignItems: "center",
    justifyContent: "center",
  },
  filterRow: {
    backgroundColor: Colors.background,
  },
  filterList: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.teal,
    borderColor: Colors.teal,
  },
  filterLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
  },
  filterLabelActive: {
    color: Colors.white,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  emptySub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textMuted,
    textAlign: "center",
  },
});
