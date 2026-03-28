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
import type { Notification } from "@/context/AppContext";

const TYPE_CONFIG: Record<Notification["type"], { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
  alert: { icon: "alert-circle-outline", color: Colors.warning, bg: Colors.warningLight },
  info: { icon: "information-circle-outline", color: Colors.teal, bg: Colors.tealLight },
  success: { icon: "checkmark-circle-outline", color: Colors.success, bg: Colors.successLight },
  request: { icon: "person-add-outline", color: Colors.purple, bg: Colors.purpleLight },
};

export default function NotificationsScreen() {
  const { notifications, markNotificationRead } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {unread.length > 0 && (
          <View>
            <Text style={styles.groupLabel}>New</Text>
            <View style={styles.group}>
              {unread.map((n, i) => {
                const cfg = TYPE_CONFIG[n.type];
                return (
                  <TouchableOpacity
                    key={n.id}
                    style={[styles.notifRow, i > 0 && styles.divider, !n.read && styles.unreadRow]}
                    onPress={() => markNotificationRead(n.id)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.notifIcon, { backgroundColor: cfg.bg }]}>
                      <Ionicons name={cfg.icon} size={20} color={cfg.color} />
                    </View>
                    <View style={styles.notifContent}>
                      <View style={styles.notifTitleRow}>
                        <Text style={styles.notifTitle}>{n.title}</Text>
                        {!n.read && <View style={styles.unreadDot} />}
                      </View>
                      <Text style={styles.notifBody}>{n.body}</Text>
                      <Text style={styles.notifTime}>{n.time}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {read.length > 0 && (
          <View>
            <Text style={styles.groupLabel}>Earlier</Text>
            <View style={styles.group}>
              {read.map((n, i) => {
                const cfg = TYPE_CONFIG[n.type];
                return (
                  <View
                    key={n.id}
                    style={[styles.notifRow, i > 0 && styles.divider]}
                  >
                    <View style={[styles.notifIcon, { backgroundColor: cfg.bg, opacity: 0.7 }]}>
                      <Ionicons name={cfg.icon} size={20} color={cfg.color} />
                    </View>
                    <View style={styles.notifContent}>
                      <Text style={[styles.notifTitle, { color: Colors.textSecondary }]}>{n.title}</Text>
                      <Text style={styles.notifBody}>{n.body}</Text>
                      <Text style={styles.notifTime}>{n.time}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {notifications.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={48} color={Colors.tealMid} />
            <Text style={styles.emptyTitle}>All caught up</Text>
            <Text style={styles.emptySub}>No new notifications</Text>
          </View>
        )}
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
  groupLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  group: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  notifRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 14 },
  unreadRow: { backgroundColor: Colors.tealLight + "60" },
  divider: { borderTopWidth: 1, borderTopColor: Colors.border },
  notifIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  notifContent: { flex: 1 },
  notifTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 3 },
  notifTitle: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.text, flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.teal },
  notifBody: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textSecondary, lineHeight: 18, marginBottom: 4 },
  notifTime: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  empty: { alignItems: "center", paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text },
  emptySub: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textMuted },
});
