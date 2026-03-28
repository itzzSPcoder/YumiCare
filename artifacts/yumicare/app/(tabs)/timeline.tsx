import React, { useState } from "react";
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { TimelineCard } from "@/components/TimelineCard";
import { AddRecordSheet } from "@/components/AddRecordSheet";
import type { TimelineEntry, DoctorPatient } from "@/context/AppContext";

// ─── Patient view ────────────────────────────────────────────────────────────

const FILTERS: { key: TimelineEntry["type"] | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "ultrasound", label: "Ultrasound" },
  { key: "lab", label: "Lab" },
  { key: "medication", label: "Meds" },
  { key: "visit", label: "Visits" },
];

function PatientTimeline() {
  const { timeline, addTimelineEntry } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;
  const [filter, setFilter] = useState<TimelineEntry["type"] | "all">("all");
  const [showAdd, setShowAdd] = useState(false);

  const filtered = filter === "all" ? timeline : timeline.filter((e) => e.type === filter);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View>
          <Text style={styles.headerTitle}>Timeline</Text>
          <Text style={styles.headerSub}>{timeline.length} health records</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowAdd(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        style={{ maxHeight: 52, flexGrow: 0 }}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            onPress={() => {
              Haptics.selectionAsync();
              setFilter(f.key);
            }}
            activeOpacity={0.75}
          >
            <Text style={[styles.filterLabel, filter === f.key && styles.filterLabelActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TimelineCard entry={item} isLast={index === filtered.length - 1} />
        )}
        contentContainerStyle={{ padding: 20, paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="time-outline" size={48} color={Colors.tealMid} />
            <Text style={styles.emptyText}>No records found</Text>
          </View>
        }
      />

      <AddRecordSheet
        visible={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={addTimelineEntry}
      />
    </View>
  );
}

// ─── Doctor view — Patients list ─────────────────────────────────────────────

const STATUS_COLOR = { stable: Colors.success, attention: Colors.warning, critical: Colors.danger };
const STATUS_BG = { stable: Colors.successLight, attention: Colors.warningLight, critical: Colors.dangerLight };
const STATUS_LABEL = { stable: "Stable", attention: "Attention", critical: "Critical" };

function DoctorPatients() {
  const { doctorPatients } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "stable" | "attention" | "critical">("all");

  const filtered = doctorPatients.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View>
          <Text style={styles.headerTitle}>Patients</Text>
          <Text style={styles.headerSub}>{doctorPatients.length} under care</Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: Colors.purple }]}
          onPress={() => router.push("/scan")}
          activeOpacity={0.8}
        >
          <Ionicons name="qr-code-outline" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search patients..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {!!search && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingTop: 10 }}
        >
          {(["all", "stable", "attention", "critical"] as const).map((s) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.filterChip,
                filterStatus === s && {
                  backgroundColor: s === "all" ? Colors.purple : STATUS_COLOR[s as keyof typeof STATUS_COLOR] ?? Colors.purple,
                  borderColor: "transparent",
                },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setFilterStatus(s);
              }}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.filterLabel,
                  filterStatus === s && { color: Colors.white, fontFamily: "Inter_700Bold" },
                ]}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: 16, paddingBottom: bottomPad, gap: 12 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: p }) => (
          <TouchableOpacity
            style={styles.patientCard}
            onPress={() => router.push({ pathname: "/patient-detail", params: { id: p.id } })}
            activeOpacity={0.8}
          >
            <View style={styles.cardTop}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitial}>{p.name.charAt(0)}</Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{p.name}</Text>
                <Text style={styles.cardSub}>Age {p.age} · Week {p.pregnancyWeek} · {p.bloodGroup}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: STATUS_BG[p.status] }]}>
                <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[p.status] }]} />
                <Text style={[styles.statusLabel, { color: STATUS_COLOR[p.status] }]}>
                  {STATUS_LABEL[p.status]}
                </Text>
              </View>
            </View>
            <View style={styles.cardBottom}>
              <View style={styles.cardStat}>
                <Ionicons name="calendar-outline" size={12} color={Colors.textMuted} />
                <Text style={styles.cardStatText}>Due: {p.dueDate}</Text>
              </View>
              <View style={styles.cardStat}>
                <Ionicons name="time-outline" size={12} color={Colors.textMuted} />
                <Text style={styles.cardStatText}>Last seen: {p.lastVisit}</Text>
              </View>
              <View style={styles.quickActions}>
                <TouchableOpacity
                  style={styles.quickActionBtn}
                  onPress={() => router.push({ pathname: "/doctor-chat", params: { patientId: p.id } })}
                  activeOpacity={0.8}
                >
                  <Ionicons name="chatbubble-outline" size={14} color={Colors.purple} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickActionBtn}
                  onPress={() => router.push({ pathname: "/ultrasound-upload", params: { patientId: p.id } })}
                  activeOpacity={0.8}
                >
                  <Ionicons name="scan-outline" size={14} color={Colors.teal} />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No patients found</Text>
          </View>
        }
      />
    </View>
  );
}

export default function TimelineScreen() {
  const { role } = useApp();
  if (role === "doctor") return <DoctorPatients />;
  return <PatientTimeline />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 24, fontFamily: "Inter_700Bold", color: Colors.text },
  headerSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 2 },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.teal,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  filters: { paddingHorizontal: 20, gap: 8, paddingBottom: 12 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.teal, borderColor: "transparent" },
  filterLabel: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.textSecondary },
  filterLabelActive: { color: Colors.white, fontFamily: "Inter_700Bold" },
  empty: { alignItems: "center", paddingTop: 80, gap: 10 },
  emptyText: { fontSize: 15, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  searchWrap: { paddingHorizontal: 16, marginBottom: 4 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  searchInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", color: Colors.text },
  patientCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.purpleLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.purple },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.text },
  cardSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 2 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  cardBottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cardStat: { flexDirection: "row", alignItems: "center", gap: 4, flex: 1 },
  cardStatText: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  quickActions: { flexDirection: "row", gap: 6 },
  quickActionBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.purpleLight,
    alignItems: "center",
    justifyContent: "center",
  },
});
