import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
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
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";

const GOAL_KICKS = 10;
const GOAL_MINUTES = 120;

export default function KickCounterScreen() {
  const router = useRouter();
  const { patient, kickSessions, addKickSession } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 16 : insets.top;

  const [kicks, setKicks] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<string>("");

  const patientId = patient?.id ?? "pat-001";
  const history = kickSessions.filter(s => s.patientId === patientId).slice(0, 10);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startTracking = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsTracking(true);
    setKicks(0);
    setElapsedSec(0);
    startTimeRef.current = new Date().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" });
    timerRef.current = setInterval(() => setElapsedSec(s => s + 1), 1000);
  };

  const recordKick = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newKicks = kicks + 1;
    setKicks(newKicks);
    if (newKicks >= GOAL_KICKS) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (timerRef.current) clearInterval(timerRef.current);
      const durMin = Math.round(elapsedSec / 60);
      addKickSession({
        patientId,
        date: new Date().toISOString().split("T")[0]!,
        startTime: startTimeRef.current,
        kicks: newKicks,
        durationMinutes: durMin,
        completed: true,
      });
      Alert.alert("🎉 Goal Reached!", `${GOAL_KICKS} kicks in ${durMin} minutes. Great job!`, [
        { text: "Done", onPress: () => { setIsTracking(false); setKicks(0); setElapsedSec(0); } },
      ]);
    }
  };

  const stopTracking = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const durMin = Math.round(elapsedSec / 60);
    if (kicks > 0) {
      addKickSession({
        patientId,
        date: new Date().toISOString().split("T")[0]!,
        startTime: startTimeRef.current,
        kicks,
        durationMinutes: durMin,
        completed: kicks >= GOAL_KICKS,
      });
    }
    setIsTracking(false);
    setKicks(0);
    setElapsedSec(0);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const progress = Math.min(kicks / GOAL_KICKS, 1);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kick Counter</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 20 }} showsVerticalScrollIndicator={false}>
        {/* Info */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={18} color={Colors.teal} />
          <Text style={styles.infoText}>Count {GOAL_KICKS} baby movements within {GOAL_MINUTES / 60} hours. Contact your doctor if you don't feel {GOAL_KICKS} movements in that time.</Text>
        </View>

        {/* Counter */}
        <View style={styles.counterCard}>
          {!isTracking ? (
            <TouchableOpacity style={styles.startBtn} onPress={startTracking} activeOpacity={0.85}>
              <Ionicons name="play-circle" size={60} color={Colors.white} />
              <Text style={styles.startText}>Start Counting</Text>
              <Text style={styles.startSub}>Tap when you feel baby move</Text>
            </TouchableOpacity>
          ) : (
            <>
              <Text style={styles.timerText}>{formatTime(elapsedSec)}</Text>
              <TouchableOpacity style={styles.kickBtn} onPress={recordKick} activeOpacity={0.7}>
                <View style={[styles.kickBtnInner, { transform: [{ scale: 1 + (kicks % 2) * 0.02 }] }]}>
                  <Ionicons name="footsteps" size={56} color={Colors.white} />
                </View>
              </TouchableOpacity>
              <View style={styles.kickCountRow}>
                <Text style={styles.kickCount}>{kicks}</Text>
                <Text style={styles.kickGoal}>/ {GOAL_KICKS} kicks</Text>
              </View>
              {/* Progress bar */}
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: progress >= 1 ? Colors.success : Colors.teal }]} />
              </View>
              <Text style={styles.progressText}>
                {progress >= 1 ? "🎉 Goal reached!" : `${GOAL_KICKS - kicks} more kicks to go`}
              </Text>
              <TouchableOpacity style={styles.stopBtn} onPress={stopTracking} activeOpacity={0.8}>
                <Ionicons name="stop-circle-outline" size={20} color={Colors.danger} />
                <Text style={styles.stopText}>Stop Session</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* History */}
        {history.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Recent Sessions</Text>
            <View style={styles.historyList}>
              {history.map((s, i) => (
                <View key={s.id} style={[styles.historyRow, i > 0 && styles.divider]}>
                  <View style={[styles.historyIcon, { backgroundColor: s.completed ? Colors.successLight : Colors.warningLight }]}>
                    <Ionicons name={s.completed ? "checkmark-circle" : "alert-circle"} size={18} color={s.completed ? Colors.success : Colors.warning} />
                  </View>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyDate}>{s.date} at {s.startTime}</Text>
                    <Text style={styles.historyStat}>{s.kicks} kicks in {s.durationMinutes} min</Text>
                  </View>
                  <View style={[styles.historyBadge, { backgroundColor: s.completed ? Colors.successLight : Colors.warningLight }]}>
                    <Text style={[styles.historyBadgeText, { color: s.completed ? Colors.success : Colors.warning }]}>{s.completed ? "Goal met" : "Incomplete"}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center", shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text },
  infoCard: { flexDirection: "row", gap: 10, backgroundColor: Colors.tealLight, borderRadius: 14, padding: 14, borderLeftWidth: 4, borderLeftColor: Colors.teal },
  infoText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.text, lineHeight: 18 },
  counterCard: { backgroundColor: Colors.white, borderRadius: 24, padding: 30, alignItems: "center", gap: 16, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 3 },
  startBtn: { alignItems: "center", gap: 10, backgroundColor: Colors.teal, borderRadius: 20, padding: 40, width: "100%" },
  startText: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.white },
  startSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)" },
  timerText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.textMuted },
  kickBtn: { marginVertical: 8 },
  kickBtnInner: { width: 140, height: 140, borderRadius: 70, backgroundColor: Colors.teal, alignItems: "center", justifyContent: "center", shadowColor: Colors.teal, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 6 },
  kickCountRow: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  kickCount: { fontSize: 48, fontFamily: "Inter_700Bold", color: Colors.text },
  kickGoal: { fontSize: 16, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  progressBar: { width: "100%", height: 8, backgroundColor: Colors.border, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4 },
  progressText: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.textSecondary },
  stopBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, backgroundColor: Colors.dangerLight, marginTop: 8 },
  stopText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.danger },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.text, marginBottom: 10 },
  historyList: { backgroundColor: Colors.white, borderRadius: 18, overflow: "hidden", shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  historyRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  divider: { borderTopWidth: 1, borderTopColor: Colors.border },
  historyIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  historyInfo: { flex: 1 },
  historyDate: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.text },
  historyStat: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted, marginTop: 1 },
  historyBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  historyBadgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
});
