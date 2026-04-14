import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Colors from "@/constants/colors";

interface Props {
  title: string;
  action?: string;
  actionText?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, action, actionText, onAction }: Props) {
  const displayAction = action || actionText;
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {displayAction && (
        <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
          <Text style={styles.action}>{displayAction}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  action: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.teal,
  },
});
