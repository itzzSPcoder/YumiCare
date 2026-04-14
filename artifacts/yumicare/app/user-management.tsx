import React, { useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";

const ROLE_CONFIG: Record<string, { color: string; bg: string; icon: string }> = {
  admin: { color: "#E67E22", bg: "#FEF5E7", icon: "shield-checkmark-outline" },
  hospital: { color: Colors.purple, bg: Colors.purpleLight, icon: "business-outline" },
  doctor: { color: "#5B8FF9", bg: "#EEF3FF", icon: "medical-outline" },
  patient: { color: Colors.teal, bg: Colors.tealLight, icon: "person-outline" },
};

export default function UserManagementScreen() {
  const router = useRouter();
  const { allUsers, toggleUserActive, resetUserPassword } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 16 : insets.top;

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const filtered = allUsers.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const roleCounts = {
    all: allUsers.length,
    admin: allUsers.filter(u => u.role === "admin").length,
    hospital: allUsers.filter(u => u.role === "hospital").length,
    doctor: allUsers.filter(u => u.role === "doctor").length,
    patient: allUsers.filter(u => u.role === "patient").length,
  };

  const handleToggle = (userId: string, name: string, isActive: boolean) => {
    Alert.alert(
      isActive ? "Deactivate User" : "Reactivate User",
      `${isActive ? "Deactivate" : "Reactivate"} ${name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: isActive ? "Deactivate" : "Reactivate", style: isActive ? "destructive" : "default", onPress: () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); toggleUserActive(userId); } },
      ],
    );
  };

  const handleResetPassword = (userId: string, name: string) => {
    Alert.alert("Reset Password", `Generate a new password for ${name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          const newPass = resetUserPassword(userId);
          Alert.alert("✅ Password Reset", `New password for ${name}:\n\n${newPass}\n\nPlease share securely.`);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Management</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 16 }} showsVerticalScrollIndicator={false}>
        {/* Role stats */}
        <View style={styles.statsRow}>
          {Object.entries(roleCounts).filter(([k]) => k !== "all").map(([role, count]) => {
            const cfg = ROLE_CONFIG[role]!;
            return (
              <TouchableOpacity key={role} style={[styles.statCard, roleFilter === role && { borderColor: cfg.color, borderWidth: 2 }]} onPress={() => setRoleFilter(roleFilter === role ? "all" : role)}>
                <View style={[styles.statIcon, { backgroundColor: cfg.bg }]}>
                  <Ionicons name={cfg.icon as any} size={16} color={cfg.color} />
                </View>
                <Text style={[styles.statVal, { color: cfg.color }]}>{count}</Text>
                <Text style={styles.statLabel}>{role.charAt(0).toUpperCase() + role.slice(1)}s</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
          <TextInput style={styles.searchInput} value={search} onChangeText={setSearch} placeholder="Search users..." placeholderTextColor={Colors.textMuted} />
          {!!search && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* User list */}
        <View style={styles.userList}>
          {filtered.map((user, i) => {
            const cfg = ROLE_CONFIG[user.role]!;
            return (
              <View key={user.id} style={[styles.userRow, i > 0 && styles.divider]}>
                <View style={[styles.userAvatar, { backgroundColor: cfg.bg }]}>
                  <Ionicons name={cfg.icon as any} size={18} color={cfg.color} />
                </View>
                <View style={styles.userInfo}>
                  <View style={styles.userNameRow}>
                    <Text style={styles.userName}>{user.name}</Text>
                    {!user.isActive && <View style={styles.inactiveBadge}><Text style={styles.inactiveText}>Inactive</Text></View>}
                  </View>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  <View style={styles.userMeta}>
                    <View style={[styles.rolePill, { backgroundColor: cfg.bg }]}>
                      <Text style={[styles.rolePillText, { color: cfg.color }]}>{user.role}</Text>
                    </View>
                    <Text style={styles.userDate}>Joined {new Date(user.createdAt).toLocaleDateString("en", { month: "short", year: "numeric" })}</Text>
                    {user.lastLogin && <Text style={styles.userDate}>Last: {new Date(user.lastLogin).toLocaleDateString("en", { month: "short", day: "numeric" })}</Text>}
                  </View>
                </View>
                <View style={styles.userActions}>
                  {user.role !== "admin" && (
                    <>
                      <TouchableOpacity style={styles.actionBtn} onPress={() => handleToggle(user.id, user.name, user.isActive)}>
                        <Ionicons name={user.isActive ? "pause-circle-outline" : "play-circle-outline"} size={22} color={user.isActive ? Colors.warning : Colors.success} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionBtn} onPress={() => handleResetPassword(user.id, user.name)}>
                        <Ionicons name="key-outline" size={20} color={Colors.textSecondary} />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center", shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, backgroundColor: Colors.white, borderRadius: 14, padding: 12, alignItems: "center", gap: 4, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 1, borderWidth: 1.5, borderColor: "transparent" },
  statIcon: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  statVal: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  searchBox: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: Colors.white, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1.5, borderColor: Colors.border },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.text },
  userList: { backgroundColor: Colors.white, borderRadius: 18, overflow: "hidden", shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  userRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  divider: { borderTopWidth: 1, borderTopColor: Colors.border },
  userAvatar: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  userInfo: { flex: 1, gap: 3 },
  userNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  userName: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.text },
  userEmail: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  userMeta: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  rolePill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  rolePillText: { fontSize: 9, fontFamily: "Inter_700Bold", textTransform: "uppercase" },
  userDate: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  inactiveBadge: { backgroundColor: Colors.dangerLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  inactiveText: { fontSize: 9, fontFamily: "Inter_700Bold", color: Colors.danger },
  userActions: { gap: 4 },
  actionBtn: { padding: 4 },
});
