import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";

export default function TabLayout() {
  const isDark = useColorScheme() === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";
  const { role } = useApp();
  const isDoctor = role === "doctor";
  const activeColor = isDoctor ? Colors.purple : Colors.teal;

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
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
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
            isIOS ? (
              <SymbolView name="house" tintColor={color} size={24} />
            ) : (
              <Ionicons name="home-outline" size={22} color={color} />
            ),
        }}
      />

      <Tabs.Screen
        name="timeline"
        options={{
          title: isDoctor ? "Patients" : "Timeline",
          tabBarIcon: ({ color }) =>
            isDoctor ? (
              isIOS ? (
                <SymbolView name="person.2" tintColor={color} size={24} />
              ) : (
                <Ionicons name="people-outline" size={22} color={color} />
              )
            ) : isIOS ? (
              <SymbolView name="clock" tintColor={color} size={24} />
            ) : (
              <Ionicons name="time-outline" size={22} color={color} />
            ),
        }}
      />

      <Tabs.Screen
        name="records"
        options={{
          title: isDoctor ? "Messages" : "Records",
          tabBarIcon: ({ color }) =>
            isDoctor ? (
              isIOS ? (
                <SymbolView name="message" tintColor={color} size={24} />
              ) : (
                <Ionicons name="chatbubbles-outline" size={22} color={color} />
              )
            ) : isIOS ? (
              <SymbolView name="folder" tintColor={color} size={24} />
            ) : (
              <Ionicons name="folder-outline" size={22} color={color} />
            ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="person" tintColor={color} size={24} />
            ) : (
              <Ionicons name="person-outline" size={22} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}
