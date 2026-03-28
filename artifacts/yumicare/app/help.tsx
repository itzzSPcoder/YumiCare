import React, { useState } from "react";
import {
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

const FAQS = [
  {
    q: "How does the QR emergency access work?",
    a: "Your QR code contains only your encrypted patient ID. When scanned by a verified doctor using the YumiCare app, they gain time-limited access to your critical health information. Every access is logged.",
  },
  {
    q: "Can I control which doctors see my records?",
    a: "Yes. Your primary doctor has full access by default. Secondary doctors require your approval. Emergency doctors receive limited, time-restricted access automatically.",
  },
  {
    q: "Is my medical data safe?",
    a: "All data is encrypted using AES-256 standard. We follow HIPAA-compliant protocols. Your data is never sold or shared without your explicit consent.",
  },
  {
    q: "How do I add a new medical record?",
    a: "Go to the Timeline tab and tap the '+' button. You can add visit notes, lab results, medications, or symptoms.",
  },
  {
    q: "What happens if I lose my phone?",
    a: "Your data is securely stored in the cloud. Log in on any device with your credentials and enable biometric lock for added security.",
  },
];

export default function HelpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contactCards}>
          {[
            { icon: "call-outline" as const, label: "Call Support", sub: "+91 1800-YUMICARE", color: Colors.teal, bg: Colors.tealLight },
            { icon: "chatbubble-outline" as const, label: "Live Chat", sub: "Avg. response: 2 min", color: Colors.purple, bg: Colors.purpleLight },
          ].map((c, i) => (
            <TouchableOpacity key={i} style={[styles.contactCard, { backgroundColor: c.bg }]} activeOpacity={0.8}>
              <Ionicons name={c.icon} size={22} color={c.color} />
              <Text style={[styles.contactLabel, { color: c.color }]}>{c.label}</Text>
              <Text style={styles.contactSub}>{c.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqList}>
            {FAQS.map((faq, i) => (
              <View key={i} style={[styles.faqItem, i > 0 && styles.divider]}>
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setOpenFaq(openFaq === i ? null : i);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.faqQ}>{faq.q}</Text>
                  <Ionicons
                    name={openFaq === i ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={Colors.textMuted}
                  />
                </TouchableOpacity>
                {openFaq === i && (
                  <Text style={styles.faqAnswer}>{faq.a}</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Links</Text>
          {[
            { icon: "document-text-outline" as const, label: "Privacy Policy" },
            { icon: "shield-outline" as const, label: "Terms of Service" },
            { icon: "star-outline" as const, label: "Rate YumiCare" },
            { icon: "share-outline" as const, label: "Share with a Friend" },
          ].map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.linkRow, i > 0 && styles.divider]}
              activeOpacity={0.75}
            >
              <View style={styles.linkIcon}>
                <Ionicons name={item.icon} size={17} color={Colors.teal} />
              </View>
              <Text style={styles.linkLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.versionBox}>
          <Text style={styles.versionText}>YumiCare v1.0.0</Text>
          <Text style={styles.versionSub}>Secure Maternal Healthcare Platform</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  title: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text },
  contactCards: { flexDirection: "row", gap: 12 },
  contactCard: { flex: 1, borderRadius: 18, padding: 18, alignItems: "center", gap: 6 },
  contactLabel: { fontSize: 14, fontFamily: "Inter_700Bold" },
  contactSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted, textAlign: "center" },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text, marginBottom: 12 },
  faqList: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  divider: { borderTopWidth: 1, borderTopColor: Colors.border },
  faqItem: { padding: 16 },
  faqQuestion: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  faqQ: { flex: 1, fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text, lineHeight: 20 },
  faqAnswer: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textSecondary, lineHeight: 20, marginTop: 10 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.text, marginBottom: 12 },
  linkRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  linkIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.tealLight,
    alignItems: "center",
    justifyContent: "center",
  },
  linkLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium", color: Colors.text },
  versionBox: { alignItems: "center", gap: 4 },
  versionText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.textMuted },
  versionSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMuted },
});
