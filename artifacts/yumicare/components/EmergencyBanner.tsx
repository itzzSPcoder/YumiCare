import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Colors from "@/constants/colors";

export function EmergencyBanner() {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push("/emergency")}
      activeOpacity={0.85}
    >
      <View style={styles.leftRow}>
        <View style={styles.pulsingDot} />
        <View style={styles.iconWrap}>
          <Ionicons name="shield-checkmark" size={20} color={Colors.white} />
        </View>
        <View>
          <Text style={styles.title}>Emergency Access</Text>
          <Text style={styles.sub}>Tap to view emergency health card</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.danger,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.white,
    position: "absolute",
    left: 0,
    top: 0,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 14,
    color: Colors.white,
    fontFamily: "Inter_700Bold",
  },
  sub: {
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
});
