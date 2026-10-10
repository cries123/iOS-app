import { LinearGradient } from "expo-linear-gradient";
import { forwardRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { relationshipInfo, type SavedDecode } from "../lib/types";
import { colors, fonts, gradients, radius } from "../theme";
import { Backdrop } from "./Backdrop";
import { GradientText } from "./GradientText";
import { ScoreRing } from "./ScoreRing";

export const SHARE_CARD_WIDTH = 330;
export const SHARE_CARD_HEIGHT = (SHARE_CARD_WIDTH * 16) / 9;

/** The 9:16 card people post to their story. Captured to an image with react-native-view-shot. */
export const ShareCard = forwardRef<View, { decode: SavedDecode }>(function ShareCard({ decode }, ref) {
  const { result } = decode;
  const rel = relationshipInfo(decode.relationship);
  const topQuote = result.translations[0];

  return (
    <View ref={ref} collapsable={false} style={styles.card}>
      <Backdrop intensity={1.3} />
      <View style={styles.content}>
        <Text style={styles.kicker}>
          {rel.emoji} my {rel.label.toLowerCase()} is…
        </Text>

        <ScoreRing score={result.interest_score} size={190} stroke={15} animated={false} />

        <Text style={styles.verdict} numberOfLines={3}>
          {result.verdict}
        </Text>

        <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.vibe}>
          <Text style={styles.vibeText}>{result.vibe}</Text>
        </LinearGradient>

        {topQuote && (
          <View style={styles.quote}>
            <Text style={styles.quoteText} numberOfLines={2}>
              “{topQuote.quote}”
            </Text>
            <Text style={styles.quoteMeaning} numberOfLines={2}>
              → {topQuote.meaning}
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>decoded with</Text>
          <GradientText size={20}>decode</GradientText>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    width: SHARE_CARD_WIDTH,
    height: SHARE_CARD_HEIGHT,
    borderRadius: radius.xl,
    overflow: "hidden",
    backgroundColor: colors.bg,
  },
  content: { flex: 1, alignItems: "center", paddingTop: 44, paddingBottom: 26, paddingHorizontal: 26, gap: 18 },
  kicker: { color: colors.textSecondary, fontFamily: fonts.bodySemibold, fontSize: 16 },
  verdict: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 32,
    textAlign: "center",
  },
  vibe: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.pill },
  vibeText: { color: "#fff", fontFamily: fonts.bodyBold, fontSize: 14 },
  quote: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: radius.md,
    padding: 14,
    gap: 4,
  },
  quoteText: { color: colors.text, fontFamily: fonts.bodySemibold, fontSize: 14.5 },
  quoteMeaning: { color: colors.lilac, fontFamily: fonts.bodyMedium, fontSize: 13.5 },
  footer: { marginTop: "auto", flexDirection: "row", alignItems: "center", gap: 6 },
  footerText: { color: colors.textTertiary, fontFamily: fonts.bodyMedium, fontSize: 13 },
});
