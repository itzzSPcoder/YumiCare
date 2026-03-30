import React, { useState } from "react";
import {
  Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";

const STATUS_COLOR = { stable: Colors.success, attention: Colors.warning, critical: Colors.danger };
const STATUS_BG = { stable: "#EAF9F0", attention: Colors.warningLight, critical: Colors.dangerLight };

export default function HospitalPatients() {
  const { allPatients, allDoctors } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "stable" | "attention" | "critical">("all");

  const filtered = allPatients.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" ? true : p.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View>
          <Text style={styles.title}>Patients</Text>
          <Text style={styles.sub}>{allPatients.length} enrolled in your hospital</Text>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search patients..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.filters}>
        {(["all", "stable", "attention", "critical"] as const).map((f) => {
          const color = f === "all" ? Colors.purple : STATUS_COLOR[f as keyof typeof STATUS_COLOR];
          return (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, filter === f && { backgroundColor: color, borderColor: color }]}
              onPress={() => setFilter(f)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterText, filter === f && { color: Colors.white }]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ padding: 20, paddingBottom: bottomPad, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {filtered.map((p) => {
          const doctor = allDoctors.find((d) => d.id === p.doctorId);
          return (
            <TouchableOpacity
              key={p.id}
              style={styles.card}
              onPress={() => router.push({ pathname: "/patient-detail", params: { id: p.id } })}
              activeOpacity={0.8}
            >
              <View style={styles.cardTop}>
                <View style={[styles.avatar, { backgroundColor: STATUS_BG[p.status] }]}>
                  <Text style={[styles.initial, { color: STATUS_COLOR[p.status] }]}>{p.name.charAt(0)}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.patName}>{p.name}</Text>
                  <Text style={styles.patSub}>Week {p.pregnancyWeek} · {p.bloodGroup} · Age {p.age}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_BG[p.status] }]}>
                  <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[p.status] }]} />
                  <Text style={[styles.statusText, { color: STATUS_COLOR[p.status] }]}>{p.status}</Text>
                </View>
              </View>
              <View style={styles.cardMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="medical-outline" size={13} color={Colors.textMuted} />
                  <Text style={styles.metaText}>{doctor?.name ?? "Unassigned"}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={13} color={Colors.textMuted} />
                  <Text style={styles.metaText}>Due {p.dueDate}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", color: Colors.text },
  sub: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 2 },
  searchWrap: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 20, backgroundColor: Colors.white, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 2, marginBottom: 4, borderWidth: 1.5, borderColor: Colors.border },
  searchInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", color: Colors.text, paddingVertical: 12 },
  filters: { flexDirection: "row", gap: 8, paddingHorizontal: 20, marginBottom: 4 },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border },
  filterText: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  scroll: { flex: 1 },
  card: { backgroundColor: Colors.white, borderRadius: 18, padding: 16, gap: 10, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  initial: { fontSize: 20, fontFamily: "Inter_700Bold" },
  cardInfo: { flex: 1 },
  patName: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.text },
  patSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontFamily: "Inter_600SemiBold", textTransform: "capitalize" },
  cardMeta: { flexDirection: "row", gap: 16 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted },
});
