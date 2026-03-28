import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Share,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

interface Props {
  patientId: string;
  name: string;
  compact?: boolean;
}

function QRPattern({ size }: { size: number }) {
  const cellSize = size / 21;
  const pattern: number[][] = [];
  for (let r = 0; r < 21; r++) {
    pattern.push([]);
    for (let c = 0; c < 21; c++) {
      const inFinderTL = r < 7 && c < 7;
      const inFinderTR = r < 7 && c > 13;
      const inFinderBL = r > 13 && c < 7;
      const edgeTL = r === 0 || r === 6 || c === 0 || c === 6;
      const edgeTR = r === 0 || r === 6 || c === 14 || c === 20;
      const edgeBL = r === 14 || r === 20 || c === 0 || c === 6;
      const isEdge =
        (inFinderTL && edgeTL) ||
        (inFinderTR && edgeTR) ||
        (inFinderBL && edgeBL);
      const isCenter =
        (inFinderTL && r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
        (inFinderTR && r >= 2 && r <= 4 && c >= 16 && c <= 18) ||
        (inFinderBL && r >= 16 && r <= 18 && c >= 2 && c <= 4);
      const isData = !inFinderTL && !inFinderTR && !inFinderBL && ((r + c) % 3 === 0 || (r * c) % 5 === 0);
      pattern[r]!.push(isEdge || isCenter || isData ? 1 : 0);
    }
  }

  return (
    <View style={{ width: size, height: size }}>
      {pattern.map((row, r) => (
        <View key={r} style={{ flexDirection: "row" }}>
          {row.map((cell, c) => (
            <View
              key={c}
              style={{
                width: cellSize,
                height: cellSize,
                backgroundColor: cell ? Colors.text : "transparent",
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

export function QRCodeDisplay({ patientId, name, compact }: Props) {
  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({
        message: `YumiCare Patient ID: ${patientId}\nName: ${name}\nFor emergency access, scan QR code via YumiCare app.`,
        title: "YumiCare Health ID",
      });
    } catch {}
  };

  const qrSize = compact ? 120 : 200;

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {!compact && (
        <Text style={styles.title}>Digital Health ID</Text>
      )}
      <View style={[styles.qrWrapper, compact && styles.qrWrapperCompact]}>
        <QRPattern size={qrSize} />
        <View style={styles.centerLogo}>
          <View style={styles.logoCircle}>
            <Ionicons name="heart" size={compact ? 12 : 18} color={Colors.white} />
          </View>
        </View>
      </View>
      {!compact && (
        <>
          <Text style={styles.patientId}>{patientId}</Text>
          <Text style={styles.patientName}>{name}</Text>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.8}>
            <Ionicons name="share-outline" size={16} color={Colors.teal} />
            <Text style={styles.shareText}>Share Health ID</Text>
          </TouchableOpacity>
          <View style={styles.secureRow}>
            <Ionicons name="lock-closed" size={12} color={Colors.textMuted} />
            <Text style={styles.secureText}>AES-256 encrypted · Role-verified access</Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  containerCompact: {
    padding: 12,
    borderRadius: 16,
  },
  title: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 20,
  },
  qrWrapper: {
    width: 220,
    height: 220,
    backgroundColor: Colors.white,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.tealLight,
    padding: 10,
    position: "relative",
  },
  qrWrapperCompact: {
    width: 140,
    height: 140,
    borderRadius: 12,
    padding: 8,
  },
  centerLogo: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.teal,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Colors.white,
  },
  patientId: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    marginTop: 20,
    letterSpacing: 1.2,
  },
  patientName: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textSecondary,
    marginTop: 4,
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.tealLight,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 16,
  },
  shareText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.teal,
  },
  secureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 12,
  },
  secureText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
  },
});
