import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";

const ROLE_COLOR: Record<string, string> = {
  patient: Colors.teal,
  doctor: "#5B8FF9",
  hospital: Colors.purple,
  admin: "#E67E22",
};

const TAB2: Record<string, { title: string; icon: keyof typeof Ionicons.glyphMap }> = {
  patient: { title: "Timeline", icon: "time-outline" },
  doctor: { title: "Patients", icon: "people-outline" },
  hospital: { title: "Doctors", icon: "medical-outline" },
  admin: { title: "Hospitals", icon: "business-outline" },
};

const TAB3: Record<string, { title: string; icon: keyof typeof Ionicons.glyphMap }> = {
  patient: { title: "Records", icon: "folder-outline" },
  doctor: { title: "Messages", icon: "chatbubbles-outline" },
  hospital: { title: "Patients", icon: "people-outline" },
  admin: { title: "Reports", icon: "bar-chart-outline" },
};

export default function TabLayout() {
  const isDark = useColorScheme() === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";
  const { role } = useApp();
  const activeColor = ROLE_COLOR[role ?? "patient"] ?? Colors.teal;
  const r = role ?? "patient";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: Colors.textMuted,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : isDark ? "#000" : Colors.white,
          borderTopWidth: isWeb ? 1 : 0,
          borderTopColor: Colors.border,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={100} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.white }]} />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) =>
            isIOS ? <SymbolView name="house" tintColor={color} size={24} /> : <Ionicons name="home-outline" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="timeline"
        options={{
          title: TAB2[r]?.title ?? "Timeline",
          tabBarIcon: ({ color }) => <Ionicons name={TAB2[r]?.icon ?? "time-outline"} size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: TAB3[r]?.title ?? "Records",
          tabBarIcon: ({ color }) => <Ionicons name={TAB3[r]?.icon ?? "folder-outline"} size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) =>
            isIOS ? <SymbolView name="person" tintColor={color} size={24} /> : <Ionicons name="person-outline" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
