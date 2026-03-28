import React, { useState } from "react";
import {
  Platform,
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

interface Message {
  id: string;
  from: "doctor" | "patient";
  text: string;
  time: string;
}

const INITIAL_MESSAGES: Message[] = [
  { id: "1", from: "doctor", text: "Hello Aisha! Your latest blood work looks good. Hemoglobin is slightly low — please continue your iron supplements.", time: "10:32 AM" },
  { id: "2", from: "patient", text: "Thank you doctor. Should I be concerned about the glucose level?", time: "10:45 AM" },
  { id: "3", from: "doctor", text: "The glucose of 128 on the screening is borderline. Let's do a full 3-hour GTT at your next visit. In the meantime, reduce refined sugars.", time: "11:02 AM" },
  { id: "4", from: "patient", text: "Understood. Also, I've been feeling mild swelling in my feet. Is that normal?", time: "11:15 AM" },
  { id: "5", from: "doctor", text: "Some swelling is normal at 24 weeks. Elevate your feet when resting and reduce sodium intake. Call me if it worsens suddenly or if you notice facial swelling.", time: "11:28 AM" },
];

export default function MessagesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [text, setText] = useState("");

  const send = () => {
    if (!text.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMessages((prev) => [
      ...prev,
      { id: String(Date.now()), from: "patient", text: text.trim(), time: "Now" },
    ]);
    setText("");
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
            <Text style={styles.headerName}>Dr. Priya Sharma</Text>
            <Text style={styles.headerSub}>Obstetrics & Gynecology</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.dateLabel}>
          <Text style={styles.dateLabelText}>Today</Text>
        </View>
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[styles.msgRow, msg.from === "patient" && styles.msgRowRight]}
          >
            {msg.from === "doctor" && (
              <View style={styles.msgAvatar}>
                <Ionicons name="medical" size={14} color={Colors.white} />
              </View>
            )}
            <View style={[styles.bubble, msg.from === "patient" ? styles.bubblePatient : styles.bubbleDoctor]}>
              <Text style={[styles.bubbleText, msg.from === "patient" && styles.bubbleTextPatient]}>{msg.text}</Text>
              <Text style={[styles.bubbleTime, msg.from === "patient" && styles.bubbleTimePatient]}>{msg.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.inputBar, { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 8 }]}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          placeholderTextColor={Colors.textMuted}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
          onPress={send}
          disabled={!text.trim()}
          activeOpacity={0.8}
        >
          <Ionicons name="send" size={18} color={Colors.white} />
        </TouchableOpacity>
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
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.teal,
    alignItems: "center",
    justifyContent: "center",
  },
  headerName: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.text },
  headerSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted },
  dateLabel: { alignItems: "center", marginVertical: 4 },
  dateLabelText: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.textMuted, backgroundColor: Colors.border, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  msgRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, maxWidth: "85%" },
  msgRowRight: { alignSelf: "flex-end", flexDirection: "row-reverse" },
  msgAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.teal,
    alignItems: "center",
    justifyContent: "center",
  },
  bubble: {
    borderRadius: 18,
    padding: 12,
    maxWidth: "100%",
    gap: 4,
  },
  bubbleDoctor: { backgroundColor: Colors.white, borderBottomLeftRadius: 4 },
  bubblePatient: { backgroundColor: Colors.teal, borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.text, lineHeight: 20 },
  bubbleTextPatient: { color: Colors.white },
  bubbleTime: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.textMuted, alignSelf: "flex-end" },
  bubbleTimePatient: { color: "rgba(255,255,255,0.7)" },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.teal,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { backgroundColor: Colors.tealMid },
});
