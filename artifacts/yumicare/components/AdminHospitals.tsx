import React, { useState } from "react";
import {
  Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";

const ADMIN_COLOR = "#E67E22";
const ADMIN_LIGHT = "#FEF5E7";

export default function AdminHospitals() {
  const { allHospitals, allDoctors, allUsers } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 80;
  const [search, setSearch] = useState("");

  const filtered = allHospitals.filter((h) =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View>
          <Text style={styles.title}>Hospitals</Text>
          <Text style={styles.sub}>{allHospitals.length} registered · Admin view</Text>
        </View>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: ADMIN_COLOR }]} onPress={() => router.push("/add-hospital")} activeOpacity={0.8}>
          <Ionicons name="add" size={20} color={Colors.white} />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search hospitals..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ padding: 20, paddingBottom: bottomPad, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {filtered.map((h) => {
          const docCount = allDoctors.filter((d) => d.hospitalId === h.id).length;
          const patCount = allUsers.filter((u) => u.role === "patient" && u.createdBy?.startsWith("doc-")).length;
          return (
            <TouchableOpacity
              key={h.id}
              style={styles.card}
              onPress={() => router.push({ pathname: "/hospital-detail", params: { id: h.id } })}
              activeOpacity={0.8}
            >
              <View style={styles.cardTop}>
                <View style={[styles.avatar, { backgroundColor: ADMIN_LIGHT }]}>
                  <Ionicons name="business" size={22} color={ADMIN_COLOR} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{h.name}</Text>
                  <Text style={styles.cardCity}>{h.city}</Text>
                </View>
                <View style={styles.activeBadge}>
                  <View style={styles.activeDot} />
                  <Text style={styles.activeText}>Active</Text>
                </View>
              </View>
              <View style={styles.cardMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="medical-outline" size={13} color={Colors.textMuted} />
                  <Text style={styles.metaText}>{docCount} Doctors</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="people-outline" size={13} color={Colors.textMuted} />
                  <Text style={styles.metaText}>{h.patients} Patients</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="bed-outline" size={13} color={Colors.textMuted} />
                  <Text style={styles.metaText}>{h.beds} Beds</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="ribbon-outline" size={13} color={Colors.success} />
                  <Text style={[styles.metaText, { color: Colors.success }]}>{h.accreditation}</Text>
                </View>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.footerEmail}>{h.email}</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
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
  addBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  addBtnText: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.white },
  searchWrap: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 20, backgroundColor: Colors.white, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 2, marginBottom: 4, borderWidth: 1.5, borderColor: Colors.border },
  searchInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", color: Colors.text, paddingVertical: 12 },
  scroll: { flex: 1 },
  card: { backgroundColor: Colors.white, borderRadius: 18, padding: 16, gap: 10, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.text },
  cardCity: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  activeBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#EAF9F0", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
  activeText: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: Colors.success },
  cardMeta: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingTop: 4 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 10 },
  footerEmail: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textSecondary },
});
