import React, { useRef, useState } from "react";
import {
  Alert,
  Image,
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
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useApp, type ChatMessage } from "@/context/AppContext";

export default function DoctorChatScreen() {
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const { doctorPatients, doctorProfile, getConversation, sendChatMessage } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const scrollRef = useRef<ScrollView>(null);
  const patient = doctorPatients.find((p) => p.id === patientId) ?? doctorPatients[0];
  const doctorId = doctorProfile?.id ?? "doc-001";
  const pId = patient?.id ?? patientId ?? "pat-001";
  const conversationKey = `${doctorId}_${pId}`;
  const messages = getConversation(doctorId, pId);
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [holdTimer, setHoldTimer] = useState<ReturnType<typeof setInterval> | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const sendText = () => {
    if (!text.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sendChatMessage({
      conversationKey,
      from: "doctor",
      fromId: doctorId,
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
    if (recordingSeconds < 1) {
      setIsRecording(false);
      setRecordingSeconds(0);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const dur = `0:${String(recordingSeconds).padStart(2, "0")}`;
    sendChatMessage({
      conversationKey,
      from: "doctor",
      fromId: doctorId,
      type: "voice",
      duration: dur,
      time: new Date().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }),
    });
    setIsRecording(false);
    setRecordingSeconds(0);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const sendAttachment = (type: "image" | "video") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      type === "image" ? "Send Image" : "Send Video",
      "In production this would open your camera roll. Sending a sample now.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send Sample",
          onPress: () => {
            sendChatMessage({
              conversationKey,
              from: "doctor",
              fromId: doctorId,
              type,
              mediaLabel: type === "image" ? "clinical_photo.jpg" : "examination_video.mp4",
              time: new Date().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }),
            });
            setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
          },
        },
      ]
    );
  };

  const renderMessage = (msg: ChatMessage) => {
    const isDoctor = msg.from === "doctor";
    return (
      <View key={msg.id} style={[styles.msgRow, isDoctor && styles.msgRowRight]}>
        {!isDoctor && (
          <View style={styles.msgAvatar}>
            <Text style={styles.msgAvatarText}>{patient?.name?.charAt(0) ?? "P"}</Text>
          </View>
        )}
        <View style={[styles.bubble, isDoctor ? styles.bubbleDoctor : styles.bubblePatient, { maxWidth: "72%" }]}>
          {msg.type === "text" && (
            <Text style={[styles.bubbleText, isDoctor && styles.bubbleTextDoctor]}>{msg.text}</Text>
          )}
          {msg.type === "voice" && (
            <View style={styles.voiceBubble}>
              <TouchableOpacity style={styles.playBtn} activeOpacity={0.8}>
                <Ionicons name="play" size={14} color={isDoctor ? Colors.white : Colors.purple} />
              </TouchableOpacity>
              <View style={styles.voiceWave}>
                {[4, 8, 12, 6, 10, 14, 8, 4, 10, 6].map((h, i) => (
                  <View
                    key={i}
                    style={[styles.waveLine, {
                      height: h,
                      backgroundColor: isDoctor ? "rgba(255,255,255,0.7)" : Colors.purple,
                    }]}
                  />
                ))}
              </View>
              <Text style={[styles.voiceDur, isDoctor && { color: "rgba(255,255,255,0.8)" }]}>
                {msg.duration}
              </Text>
            </View>
          )}
          {msg.type === "image" && (
            <View style={styles.mediaBubble}>
              <View style={styles.mediaPreview}>
                <Ionicons name="image" size={28} color={isDoctor ? Colors.white : Colors.purple} />
              </View>
              <Text style={[styles.mediaName, isDoctor && { color: "rgba(255,255,255,0.9)" }]}>
                {msg.mediaLabel}
              </Text>
              <TouchableOpacity style={styles.mediaBtn}>
                <Ionicons name="download-outline" size={14} color={isDoctor ? Colors.white : Colors.purple} />
              </TouchableOpacity>
            </View>
          )}
          {msg.type === "video" && (
            <View style={styles.mediaBubble}>
              <View style={[styles.mediaPreview, { backgroundColor: isDoctor ? "rgba(255,255,255,0.15)" : Colors.purpleLight }]}>
                <Ionicons name="videocam" size={28} color={isDoctor ? Colors.white : Colors.purple} />
                <View style={styles.playOverlay}>
                  <Ionicons name="play-circle" size={24} color={Colors.white} />
                </View>
              </View>
              <Text style={[styles.mediaName, isDoctor && { color: "rgba(255,255,255,0.9)" }]}>
                {msg.mediaLabel}
              </Text>
            </View>
          )}
          <Text style={[styles.msgTime, isDoctor && styles.msgTimeDoctor]}>{msg.time}</Text>
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
        <TouchableOpacity
          style={styles.headerInfo}
          onPress={() => router.push({ pathname: "/patient-detail", params: { id: patient.id } })}
          activeOpacity={0.8}
        >
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>{patient.name.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.headerName}>{patient.name}</Text>
            <Text style={styles.headerSub}>Week {patient.pregnancyWeek} · Patient</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.ultrasoundBtn}
          onPress={() => router.push({ pathname: "/ultrasound-upload", params: { patientId: patient.id } })}
          activeOpacity={0.8}
        >
          <Ionicons name="scan-outline" size={20} color={Colors.teal} />
        </TouchableOpacity>
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
        {messages.map(renderMessage)}
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
        <TouchableOpacity style={styles.attachBtn} onPress={() => sendAttachment("image")} activeOpacity={0.8}>
          <Ionicons name="image-outline" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.attachBtn} onPress={() => sendAttachment("video")} activeOpacity={0.8}>
          <Ionicons name="videocam-outline" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>

        {text.trim() ? (
          <>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="Reply to patient..."
              placeholderTextColor={Colors.textMuted}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={sendText} activeOpacity={0.8}>
              <Ionicons name="send" size={18} color={Colors.white} />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="Reply to patient..."
              placeholderTextColor={Colors.textMuted}
              multiline
              maxLength={1000}
            />
            <Pressable
              style={[styles.micBtn, isRecording && styles.micBtnActive]}
              onPressIn={startRecording}
              onPressOut={stopRecording}
            >
              <Ionicons name={isRecording ? "radio-button-on" : "mic-outline"} size={20} color={Colors.white} />
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 10,
  },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  headerInfo: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.purpleLight,
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatarText: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.purple },
  headerName: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.text },
  headerSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  ultrasoundBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.tealLight,
    alignItems: "center",
    justifyContent: "center",
  },
  dateChip: { alignSelf: "center", backgroundColor: Colors.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  dateChipText: { fontSize: 11, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  msgRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  msgRowRight: { alignSelf: "flex-end", flexDirection: "row-reverse" },
  msgAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.purpleLight,
    alignItems: "center",
    justifyContent: "center",
  },
  msgAvatarText: { fontSize: 13, fontFamily: "Inter_700Bold", color: Colors.purple },
  bubble: { borderRadius: 18, padding: 12, gap: 4 },
  bubblePatient: { backgroundColor: Colors.white, borderBottomLeftRadius: 4 },
  bubbleDoctor: { backgroundColor: Colors.purple, borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.text, lineHeight: 20 },
  bubbleTextDoctor: { color: Colors.white },
  msgTime: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.textMuted, alignSelf: "flex-end" },
  msgTimeDoctor: { color: "rgba(255,255,255,0.6)" },
  voiceBubble: { flexDirection: "row", alignItems: "center", gap: 8 },
  playBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  voiceWave: { flexDirection: "row", alignItems: "center", gap: 3 },
  waveLine: { width: 3, borderRadius: 2, backgroundColor: Colors.purple },
  voiceDur: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.textMuted },
  mediaBubble: { gap: 6, minWidth: 180 },
  mediaPreview: {
    height: 80,
    backgroundColor: Colors.purpleLight,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  playOverlay: { position: "absolute" },
  mediaName: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.textSecondary },
  mediaBtn: { alignSelf: "flex-end" },
  recordingBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.dangerLight,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.danger + "30",
  },
  recordingDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.danger },
  recordingText: { flex: 1, fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.danger },
  recordingHint: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.danger + "CC" },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  attachBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: Colors.background,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.purple,
    alignItems: "center",
    justifyContent: "center",
  },
  micBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.purple,
    alignItems: "center",
    justifyContent: "center",
  },
  micBtnActive: { backgroundColor: Colors.danger },
});
