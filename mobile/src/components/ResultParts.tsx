import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Flag } from "../lib/types";
import { colors, fonts, gradients, radius } from "../theme";

export function EffortBar({ you, them }: { you: number; them: number }) {
  return (
    <View style={{ gap: 10 }}>
      <View style={styles.effortTrack}>
        <LinearGradient
          colors={[colors.sunset, colors.pink]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.effortSegment, { flex: Math.max(you, 4) }]}
        />
        <LinearGradient
          colors={[colors.violet, "#6B5BFF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.effortSegment, { flex: Math.max(them, 4) }]}
        />
      </View>
      <View style={styles.effortLabels}>
        <Text style={[styles.effortLabel, { color: colors.pink }]}>You · {you}%</Text>
        <Text style={[styles.effortLabel, { color: colors.lilac }]}>Them · {them}%</Text>
      </View>
    </View>
  );
}

/** Their message in a grey bubble, then the translation in ours. Reads like an iMessage reply. */
export function TranslationBubbles({ quote, meaning }: { quote: string; meaning: string }) {
  return (
    <View style={{ gap: 6 }}>
      <View style={styles.theirBubble}>
        <Text style={styles.theirText}>{quote}</Text>
      </View>
      <LinearGradient
        colors={gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.ourBubble}
      >
        <Text style={styles.meaningLabel}>WHAT THEY MEANT</Text>
        <Text style={styles.ourText}>{meaning}</Text>
      </LinearGradient>
    </View>
  );
}

export function FlagRow({ flag, kind }: { flag: Flag; kind: "red" | "green" }) {
  const color = kind === "red" ? colors.coral : colors.mint;
  return (
    <View style={styles.flagRow}>
      <View style={[styles.flagDot, { backgroundColor: color, boxShadow: `0 0 12px ${color}` }]} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[styles.flagTitle, { color }]}>{flag.title}</Text>
        <Text style={styles.flagDetail}>{flag.detail}</Text>
      </View>
    </View>
  );
}

/** Blurs premium content for free users, with an unlock button on top. */
export function Locked({ locked, onUnlock, children }: { locked: boolean; onUnlock: () => void; children: ReactNode }) {
  if (!locked) return <>{children}</>;
  return (
    <View style={styles.lockedWrap}>
      <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        {children}
      </View>
      <BlurView intensity={28} tint="dark" style={[StyleSheet.absoluteFill, styles.lockedBlur]}>
        <Pressable onPress={onUnlock} accessibilityRole="button" style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.96 : 1 }] }]}>
          <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.unlock}>
            <Ionicons name="lock-closed" size={15} color="#fff" />
            <Text style={styles.unlockText}>Unlock the full read</Text>
          </LinearGradient>
        </Pressable>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  effortTrack: { flexDirection: "row", height: 14, gap: 4 },
  effortSegment: { borderRadius: 7 },
  effortLabels: { flexDirection: "row", justifyContent: "space-between" },
  effortLabel: { fontFamily: fonts.bodyBold, fontSize: 13.5 },

  theirBubble: {
    alignSelf: "flex-start",
    maxWidth: "85%",
    backgroundColor: colors.theirBubble,
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  theirText: { color: colors.text, fontFamily: fonts.bodyMedium, fontSize: 15.5 },
  ourBubble: {
    alignSelf: "flex-end",
    maxWidth: "88%",
    borderRadius: 20,
    borderBottomRightRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 3,
  },
  meaningLabel: { color: "rgba(255,255,255,0.75)", fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 1.2 },
  ourText: { color: "#fff", fontFamily: fonts.bodySemibold, fontSize: 15.5 },

  flagRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  flagDot: { width: 10, height: 10, borderRadius: 5, marginTop: 5 },
  flagTitle: { fontFamily: fonts.bodyBold, fontSize: 15.5 },
  flagDetail: { color: colors.textSecondary, fontFamily: fonts.body, fontSize: 14.5, lineHeight: 20 },

  lockedWrap: { borderRadius: radius.lg, overflow: "hidden" },
  lockedBlur: { alignItems: "center", justifyContent: "center", borderRadius: radius.lg, overflow: "hidden" },
  unlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: radius.pill,
    boxShadow: "0 8px 22px rgba(255, 61, 127, 0.45)",
  },
  unlockText: { color: "#fff", fontFamily: fonts.bodyBold, fontSize: 15 },
});
