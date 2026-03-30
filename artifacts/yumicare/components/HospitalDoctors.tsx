import React, { useState } from "react";
import {
  Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";

const H_COLOR = Colors.purple;
const H_LIGHT = Colors.purpleLight;

export default function HospitalDoctors() {
  const { hospitalDoctors } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  const filtered = hospitalDoctors.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.specialization.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" ? true : d.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View>
          <Text style={styles.title}>Doctors</Text>
          <Text style={styles.sub}>{hospitalDoctors.length} registered in your hospital</Text>
        </View>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: H_COLOR }]} onPress={() => router.push("/add-doctor")} activeOpacity={0.8}>
          <Ionicons name="add" size={20} color={Colors.white} />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search doctors..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.filters}>
        {(["all", "active", "inactive"] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && { backgroundColor: H_COLOR }]}
            onPress={() => setFilter(f)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterText, filter === f && { color: Colors.white }]}>
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ padding: 20, paddingBottom: bottomPad, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="medical-outline" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>No doctors found</Text>
            <TouchableOpacity style={[styles.addBtn, { backgroundColor: H_COLOR, marginTop: 8 }]} onPress={() => router.push("/add-doctor")} activeOpacity={0.8}>
              <Ionicons name="person-add-outline" size={16} color={Colors.white} />
              <Text style={styles.addBtnText}>Add First Doctor</Text>
            </TouchableOpacity>
          </View>
        )}
        {filtered.map((d) => (
          <TouchableOpacity
            key={d.id}
            style={styles.card}
            onPress={() => router.push({ pathname: "/doctor-detail", params: { id: d.id } })}
            activeOpacity={0.8}
          >
            <View style={styles.cardTop}>
              <View style={[styles.avatar, { backgroundColor: H_LIGHT }]}>
                <Text style={[styles.initial, { color: H_COLOR }]}>{d.name.replace("Dr. ", "").charAt(0)}</Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.docName}>{d.name}</Text>
                <Text style={styles.docSpec}>{d.specialization}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: d.status === "active" ? "#EAF9F0" : Colors.border }]}>
                <View style={[styles.statusDot, { backgroundColor: d.status === "active" ? Colors.success : Colors.textMuted }]} />
                <Text style={[styles.statusText, { color: d.status === "active" ? Colors.success : Colors.textMuted }]}>{d.status}</Text>
              </View>
            </View>
            <View style={styles.cardMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="card-outline" size={13} color={Colors.textMuted} />
                <Text style={styles.metaText}>{d.licenseNo}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="people-outline" size={13} color={Colors.textMuted} />
                <Text style={styles.metaText}>{d.patientsCount} patients</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={13} color={Colors.textMuted} />
                <Text style={styles.metaText}>Since {d.joinDate}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", color: Colors.text },
  sub: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 2 },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  addBtnText: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.white },
  searchWrap: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 20, backgroundColor: Colors.white, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 2, marginBottom: 4, borderWidth: 1.5, borderColor: Colors.border },
  searchInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", color: Colors.text, paddingVertical: 12 },
  filters: { flexDirection: "row", gap: 8, paddingHorizontal: 20, marginBottom: 4 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border },
  filterText: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  scroll: { flex: 1 },
  empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 16, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  card: { backgroundColor: Colors.white, borderRadius: 18, padding: 16, gap: 12, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  initial: { fontSize: 20, fontFamily: "Inter_700Bold" },
  cardInfo: { flex: 1 },
  docName: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.text },
  docSpec: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontFamily: "Inter_600SemiBold", textTransform: "capitalize" },
  cardMeta: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted },
});
