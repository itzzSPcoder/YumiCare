import React, { useRef, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useApp, type ChatMessage } from "@/context/AppContext";

export default function MessagesScreen() {
  const router = useRouter();
  const { patient, currentUser, getConversation, sendChatMessage } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const scrollRef = useRef<ScrollView>(null);
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [holdTimer, setHoldTimer] = useState<ReturnType<typeof setInterval> | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const patientId = patient?.id ?? currentUser?.id ?? "pat-001";
  const doctorId = "doc-001";
  const conversationKey = `${doctorId}_${patientId}`;
  const messages = getConversation(doctorId, patientId);
  const doctorName = patient?.primaryDoctor ?? "Dr. Priya Sharma";

  const send = () => {
    if (!text.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sendChatMessage({
      conversationKey,
      from: "patient",
      fromId: patientId,
      type: "text",
      text: text.trim(),
      time: new Date().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }),
    });
    setText("");
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const startRecording = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRecording(true);
    setRecordingSeconds(0);
    const t = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    setHoldTimer(t);
  };

  const stopRecording = () => {
    if (holdTimer) clearInterval(holdTimer);
    setHoldTimer(null);
    if (recordingSeconds < 1) { setIsRecording(false); setRecordingSeconds(0); return; }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const dur = `0:${String(recordingSeconds).padStart(2, "0")}`;
    sendChatMessage({
      conversationKey,
      from: "patient",
      fromId: patientId,
      type: "voice",
      duration: dur,
      time: new Date().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }),
    });
    setIsRecording(false);
    setRecordingSeconds(0);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const sendMedia = (type: "image" | "video") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      type === "image" ? "Send Image" : "Send Video",
      "In production this opens your gallery. Sending a sample now.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send",
          onPress: () => {
            sendChatMessage({
              conversationKey,
              from: "patient",
              fromId: patientId,
              type,
              mediaLabel: type === "image" ? "photo.jpg" : "video.mp4",
              time: new Date().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }),
            });
            setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
          },
        },
      ],
    );
  };

  const renderMsg = (msg: ChatMessage) => {
    const isPatient = msg.from === "patient";
    return (
      <View key={msg.id} style={[styles.msgRow, isPatient && styles.msgRowRight]}>
        {!isPatient && (
          <View style={styles.doctorAvatar}>
            <Ionicons name="medical" size={14} color={Colors.white} />
          </View>
        )}
        <View style={[styles.bubble, isPatient ? styles.bubblePatient : styles.bubbleDoctor, { maxWidth: "74%" }]}>
          {msg.type === "text" && (
            <Text style={[styles.bubbleText, isPatient && styles.bubbleTextPatient]}>{msg.text}</Text>
          )}
          {msg.type === "voice" && (
            <View style={styles.voiceRow}>
              <TouchableOpacity style={[styles.playBtn, isPatient && { backgroundColor: "rgba(255,255,255,0.25)" }]}>
                <Ionicons name="play" size={13} color={Colors.white} />
              </TouchableOpacity>
              <View style={styles.waveform}>
                {[5, 10, 15, 8, 12, 16, 9, 5, 11, 7, 13, 9].map((h, i) => (
                  <View key={i} style={[styles.bar, { height: h, backgroundColor: "rgba(255,255,255,0.7)" }]} />
                ))}
              </View>
              <Text style={styles.durText}>{msg.duration}</Text>
            </View>
          )}
          {msg.type === "image" && (
            <View style={styles.mediaBox}>
              <View style={styles.imgPreview}>
                <Ionicons name="image" size={30} color={isPatient ? Colors.teal : Colors.purple} />
              </View>
              <Text style={[styles.mediaFileName, isPatient && { color: "rgba(255,255,255,0.9)" }]}>{msg.mediaLabel}</Text>
            </View>
          )}
          {msg.type === "video" && (
            <View style={styles.mediaBox}>
              <View style={styles.videoPreview}>
                <Ionicons name="videocam" size={28} color={isPatient ? Colors.teal : Colors.purple} />
                <Ionicons name="play-circle" size={22} color={Colors.white} style={{ position: "absolute" }} />
              </View>
              <Text style={[styles.mediaFileName, isPatient && { color: "rgba(255,255,255,0.9)" }]}>{msg.mediaLabel}</Text>
            </View>
          )}
          <Text style={[styles.timeText, isPatient && { color: "rgba(255,255,255,0.65)" }]}>{msg.time}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.headerAvatar}>
            <Ionicons name="medical" size={16} color={Colors.white} />
          </View>
          <View>
            <Text style={styles.headerName}>{doctorName}</Text>
            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Obstetrics & Gynecology</Text>
            </View>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
      >
        <View style={styles.dateChip}>
          <Text style={styles.dateChipText}>Today</Text>
        </View>
        {messages.map(renderMsg)}
      </ScrollView>

      {isRecording && (
        <View style={styles.recordingBar}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingText}>
            Recording {String(Math.floor(recordingSeconds / 60)).padStart(2, "0")}:{String(recordingSeconds % 60).padStart(2, "0")}
          </Text>
          <Text style={styles.recordingHint}>Release to send</Text>
        </View>
      )}

      <View style={[styles.inputBar, { paddingBottom: Platform.OS === "web" ? 24 : insets.bottom + 8 }]}>
        <TouchableOpacity style={styles.attachBtn} onPress={() => sendMedia("image")} activeOpacity={0.8}>
          <Ionicons name="image-outline" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.attachBtn} onPress={() => sendMedia("video")} activeOpacity={0.8}>
          <Ionicons name="videocam-outline" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={`Message ${doctorName}...`}
          placeholderTextColor={Colors.textMuted}
          multiline
          maxLength={1000}
        />
        {text.trim() ? (
          <TouchableOpacity style={styles.sendBtn} onPress={send} activeOpacity={0.8}>
            <Ionicons name="send" size={18} color={Colors.white} />
          </TouchableOpacity>
        ) : (
          <Pressable
            style={[styles.micBtn, isRecording && styles.micBtnActive]}
            onPressIn={startRecording}
            onPressOut={stopRecording}
          >
            <Ionicons name={isRecording ? "radio-button-on" : "mic-outline"} size={20} color={Colors.white} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  headerInfo: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  headerAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.teal, alignItems: "center", justifyContent: "center" },
  headerName: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.text },
  onlineBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
  onlineText: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  dateChip: { alignSelf: "center", backgroundColor: Colors.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4 },
  dateChipText: { fontSize: 11, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  msgRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  msgRowRight: { alignSelf: "flex-end", flexDirection: "row-reverse" },
  doctorAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.teal, alignItems: "center", justifyContent: "center" },
  bubble: { borderRadius: 18, padding: 12, gap: 4 },
  bubbleDoctor: { backgroundColor: Colors.white, borderBottomLeftRadius: 4 },
  bubblePatient: { backgroundColor: Colors.teal, borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.text, lineHeight: 20 },
  bubbleTextPatient: { color: Colors.white },
  timeText: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.textMuted, alignSelf: "flex-end" },
  voiceRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  playBtn: { width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.teal, alignItems: "center", justifyContent: "center" },
  waveform: { flexDirection: "row", alignItems: "center", gap: 2 },
  bar: { width: 3, borderRadius: 2 },
  durText: { fontSize: 11, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.75)" },
  mediaBox: { gap: 6, minWidth: 160 },
  imgPreview: { height: 80, backgroundColor: Colors.tealLight, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  videoPreview: { height: 80, backgroundColor: Colors.tealLight, borderRadius: 10, alignItems: "center", justifyContent: "center", position: "relative" },
  mediaFileName: { fontSize: 12, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.85)" },
  recordingBar: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: Colors.dangerLight, paddingHorizontal: 20, paddingVertical: 10, borderTopWidth: 1, borderTopColor: Colors.danger + "30" },
  recordingDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.danger },
  recordingText: { flex: 1, fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.danger },
  recordingHint: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.danger + "CC" },
  inputBar: { flexDirection: "row", alignItems: "flex-end", gap: 8, backgroundColor: Colors.white, paddingHorizontal: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.border },
  attachBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: Colors.background },
  input: { flex: 1, backgroundColor: Colors.background, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.text, maxHeight: 100, borderWidth: 1, borderColor: Colors.border },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.teal, alignItems: "center", justifyContent: "center" },
  micBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.teal, alignItems: "center", justifyContent: "center" },
  micBtnActive: { backgroundColor: Colors.danger },
});
