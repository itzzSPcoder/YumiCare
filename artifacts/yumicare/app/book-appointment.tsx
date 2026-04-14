import React, { useState } from "react";
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

const VISIT_TYPES = [
  { key: "routine", label: "Routine Checkup", icon: "checkmark-circle-outline" as const, color: Colors.teal },
  { key: "ultrasound", label: "Ultrasound", icon: "scan-outline" as const, color: Colors.purple },
  { key: "lab", label: "Lab Work", icon: "flask-outline" as const, color: "#5B8FF9" },
  { key: "follow-up", label: "Follow-up", icon: "refresh-outline" as const, color: Colors.warning },
  { key: "emergency", label: "Emergency", icon: "alert-circle-outline" as const, color: Colors.danger },
];

const TIME_SLOTS = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM"];

function getNext30Days(): { date: string; day: string; dayNum: number; month: string; isWeekend: boolean }[] {
  const days: any[] = [];
  const now = new Date();
  for (let i = 1; i <= 30; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const dayOfWeek = d.getDay();
    days.push({
      date: d.toISOString().split("T")[0],
      day: d.toLocaleString("en", { weekday: "short" }),
      dayNum: d.getDate(),
      month: d.toLocaleString("en", { month: "short" }),
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    });
  }
  return days;
}

export default function BookAppointmentScreen() {
  const router = useRouter();
  const { patient, addAppointment } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 16 : insets.top;

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const dates = getNext30Days();
  const doctorName = patient?.primaryDoctor ?? "Dr. Priya Sharma";
  const patientId = patient?.id ?? "pat-001";
  const patientName = patient?.name ?? "Patient";

  const handleBook = () => {
    if (!selectedType || !selectedDate || !selectedTime) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addAppointment({
      patientId,
      patientName,
      doctorId: "doc-001",
      doctorName,
      hospitalId: "hosp-001",
      date: selectedDate,
      time: selectedTime,
      type: selectedType as any,
      status: "upcoming",
    });
    Alert.alert(
      "✅ Appointment Booked!",
      `${VISIT_TYPES.find(v => v.key === selectedType)?.label} with ${doctorName}\n${selectedDate} at ${selectedTime}`,
      [{ text: "Done", onPress: () => router.back() }],
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Step indicator */}
      <View style={styles.stepsRow}>
        {[1, 2, 3].map(s => (
          <View key={s} style={[styles.stepDot, s <= step && styles.stepDotActive]} />
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 16 }} showsVerticalScrollIndicator={false}>
        {step === 1 && (
          <>
            <Text style={styles.stepTitle}>What type of visit?</Text>
            <View style={styles.typeGrid}>
              {VISIT_TYPES.map(t => (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.typeCard, selectedType === t.key && { borderColor: t.color, borderWidth: 2, backgroundColor: t.color + "10" }]}
                  onPress={() => { Haptics.selectionAsync(); setSelectedType(t.key); }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.typeIcon, { backgroundColor: t.color + "20" }]}>
                    <Ionicons name={t.icon} size={24} color={t.color} />
                  </View>
                  <Text style={[styles.typeLabel, selectedType === t.key && { color: t.color, fontFamily: "Inter_700Bold" }]}>{t.label}</Text>
                  {selectedType === t.key && <Ionicons name="checkmark-circle" size={20} color={t.color} style={{ position: "absolute", top: 10, right: 10 }} />}
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.nextBtn, !selectedType && styles.nextBtnDisabled]}
              onPress={() => selectedType && setStep(2)}
              disabled={!selectedType}
              activeOpacity={0.85}
            >
              <Text style={styles.nextBtnText}>Choose Date →</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.stepTitle}>Select a date</Text>
            <View style={styles.dateGrid}>
              {dates.filter(d => !d.isWeekend).map(d => (
                <TouchableOpacity
                  key={d.date}
                  style={[styles.dateCard, selectedDate === d.date && styles.dateCardActive]}
                  onPress={() => { Haptics.selectionAsync(); setSelectedDate(d.date); }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dateDay, selectedDate === d.date && styles.dateDayActive]}>{d.day}</Text>
                  <Text style={[styles.dateNum, selectedDate === d.date && styles.dateNumActive]}>{d.dayNum}</Text>
                  <Text style={[styles.dateMonth, selectedDate === d.date && styles.dateMonthActive]}>{d.month}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.nextBtn, !selectedDate && styles.nextBtnDisabled]}
              onPress={() => selectedDate && setStep(3)}
              disabled={!selectedDate}
              activeOpacity={0.85}
            >
              <Text style={styles.nextBtnText}>Choose Time →</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 3 && (
          <>
            <Text style={styles.stepTitle}>Pick a time slot</Text>
            <View style={styles.timeGrid}>
              {TIME_SLOTS.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.timeSlot, selectedTime === t && styles.timeSlotActive]}
                  onPress={() => { Haptics.selectionAsync(); setSelectedTime(t); }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.timeText, selectedTime === t && styles.timeTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedType && selectedDate && selectedTime && (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Appointment Summary</Text>
                <View style={styles.summaryRow}>
                  <Ionicons name="medical-outline" size={16} color={Colors.teal} />
                  <Text style={styles.summaryText}>{doctorName}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Ionicons name="calendar-outline" size={16} color={Colors.purple} />
                  <Text style={styles.summaryText}>{selectedDate}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Ionicons name="time-outline" size={16} color="#5B8FF9" />
                  <Text style={styles.summaryText}>{selectedTime}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Ionicons name="clipboard-outline" size={16} color={Colors.warning} />
                  <Text style={styles.summaryText}>{VISIT_TYPES.find(v => v.key === selectedType)?.label}</Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[styles.bookBtn, !selectedTime && styles.nextBtnDisabled]}
              onPress={handleBook}
              disabled={!selectedTime}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-circle" size={22} color={Colors.white} />
              <Text style={styles.bookBtnText}>Confirm Booking</Text>
            </TouchableOpacity>
          </>
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
  stepsRow: { flexDirection: "row", justifyContent: "center", gap: 8, paddingBottom: 12 },
  stepDot: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border },
  stepDotActive: { backgroundColor: Colors.teal },
  stepTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.text },
  typeGrid: { gap: 12 },
  typeCard: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: Colors.white, borderRadius: 16, padding: 18, borderWidth: 1.5, borderColor: Colors.border, position: "relative" },
  typeIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  typeLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.text },
  dateGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  dateCard: { width: "14%", backgroundColor: Colors.white, borderRadius: 14, padding: 10, alignItems: "center", gap: 2, borderWidth: 1.5, borderColor: Colors.border, minWidth: 58 },
  dateCardActive: { backgroundColor: Colors.teal, borderColor: Colors.teal },
  dateDay: { fontSize: 10, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  dateDayActive: { color: "rgba(255,255,255,0.8)" },
  dateNum: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.text },
  dateNumActive: { color: Colors.white },
  dateMonth: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  dateMonthActive: { color: "rgba(255,255,255,0.8)" },
  timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  timeSlot: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.border },
  timeSlotActive: { backgroundColor: Colors.teal, borderColor: Colors.teal },
  timeText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.text },
  timeTextActive: { color: Colors.white },
  summaryCard: { backgroundColor: Colors.white, borderRadius: 18, padding: 18, gap: 10, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  summaryTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.text, marginBottom: 4 },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  summaryText: { fontSize: 14, fontFamily: "Inter_500Medium", color: Colors.text },
  nextBtn: { backgroundColor: Colors.teal, borderRadius: 16, padding: 18, alignItems: "center" },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.white },
  bookBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: Colors.teal, borderRadius: 16, padding: 18 },
  bookBtnText: { fontSize: 17, fontFamily: "Inter_700Bold", color: Colors.white },
});
