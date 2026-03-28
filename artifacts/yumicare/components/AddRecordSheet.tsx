import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import type { TimelineEntry } from "@/context/AppContext";

const TYPES: { type: TimelineEntry["type"]; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { type: "visit", label: "Visit", icon: "person-outline" },
  { type: "lab", label: "Lab", icon: "flask-outline" },
  { type: "ultrasound", label: "Ultrasound", icon: "scan-outline" },
  { type: "medication", label: "Medication", icon: "medical-outline" },
  { type: "symptom", label: "Symptom", icon: "alert-circle-outline" },
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function AddRecordSheet({ visible, onClose }: Props) {
  const { addTimelineEntry } = useApp();
  const [type, setType] = useState<TimelineEntry["type"]>("visit");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");

  const handleSave = async () => {
    if (!title.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addTimelineEntry({
      type,
      title: title.trim(),
      details: details.trim(),
      date: new Date().toISOString().split("T")[0] as string,
      doctor: "Self-reported",
    });
    setTitle("");
    setDetails("");
    setType("visit");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>Add Health Record</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>Record Type</Text>
            <View style={styles.typeRow}>
              {TYPES.map((t) => (
                <TouchableOpacity
                  key={t.type}
                  style={[styles.typeChip, type === t.type && styles.typeChipActive]}
                  onPress={() => setType(t.type)}
                  activeOpacity={0.75}
                >
                  <Ionicons
                    name={t.icon}
                    size={16}
                    color={type === t.type ? Colors.white : Colors.textSecondary}
                  />
                  <Text
                    style={[styles.typeChipLabel, type === t.type && styles.typeChipLabelActive]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Routine Checkup"
              placeholderTextColor={Colors.textMuted}
            />

            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={details}
              onChangeText={setDetails}
              placeholder="Add notes or observations..."
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.saveBtn, !title.trim() && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={!title.trim()}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-circle" size={18} color={Colors.white} />
              <Text style={styles.saveBtnText}>Save Record</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textSecondary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  typeChipActive: {
    backgroundColor: Colors.teal,
    borderColor: Colors.teal,
  },
  typeChipLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
  },
  typeChipLabelActive: {
    color: Colors.white,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.text,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  saveBtn: {
    backgroundColor: Colors.teal,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
    marginBottom: 32,
  },
  saveBtnDisabled: {
    backgroundColor: Colors.tealMid,
  },
  saveBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
  },
});
