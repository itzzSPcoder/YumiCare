import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";
import Colors from "@/constants/colors";

interface Props {
  week: number;
  totalWeeks?: number;
}

export function PregnancyProgress({ week, totalWeeks = 40 }: Props) {
  const progress = useSharedValue(0);
  const percent = Math.min(week / totalWeeks, 1);
  const trimester = week <= 13 ? "1st Trimester" : week <= 27 ? "2nd Trimester" : "3rd Trimester";
  const weeksLeft = totalWeeks - week;

  useEffect(() => {
    progress.value = withTiming(percent, { duration: 900 });
  }, [percent]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.label}>Pregnancy Progress</Text>
          <Text style={styles.trimester}>{trimester}</Text>
        </View>
        <View style={styles.weekBadge}>
          <Text style={styles.weekNum}>{week}</Text>
          <Text style={styles.weekLabel}>weeks</Text>
        </View>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, barStyle]} />
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>{weeksLeft} weeks remaining</Text>
        <Text style={styles.footerText}>{Math.round(percent * 100)}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: Colors.textMuted,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  trimester: {
    fontSize: 18,
    color: Colors.text,
    fontFamily: "Inter_700Bold",
    marginTop: 2,
  },
  weekBadge: {
    backgroundColor: Colors.tealLight,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: "center",
  },
  weekNum: {
    fontSize: 28,
    color: Colors.teal,
    fontFamily: "Inter_700Bold",
    lineHeight: 32,
  },
  weekLabel: {
    fontSize: 11,
    color: Colors.teal,
    fontFamily: "Inter_500Medium",
  },
  track: {
    height: 10,
    backgroundColor: Colors.tealLight,
    borderRadius: 5,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: Colors.teal,
    borderRadius: 5,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  footerText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Inter_400Regular",
  },
});
