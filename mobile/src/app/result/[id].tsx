import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Backdrop } from "../../components/Backdrop";
import { EffortBar, FlagRow, Locked, TranslationBubbles } from "../../components/ResultParts";
import { ScoreRing } from "../../components/ScoreRing";
import { Card, IconButton } from "../../components/ui";
import { useAppStore } from "../../lib/store";
import { relationshipInfo, TONE_EMOJI, type Reply } from "../../lib/types";
import { colors, fonts, gradients, radius } from "../../theme";

export default function Result() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const decode = useAppStore((s) => s.history.find((d) => d.id === id));
  const isPro = useAppStore((s) => s.isPro);
  const insets = useSafeAreaInsets();

  if (!decode) {
    return (
      <View style={[styles.screen, styles.missing]}>
        <Backdrop />
        <Text style={styles.missingText}>{"This decode isn't here anymore."}</Text>
        <IconButton icon="close" label="Close" onPress={() => router.replace("/")} />
      </View>
    );
  }

  const { result } = decode;
  const rel = relationshipInfo(decode.relationship);
  const unlock = () => router.push("/paywall");
  const goBack = () => (router.canGoBack() ? router.back() : router.replace("/"));

  return (
    <View style={styles.screen}>
      <Backdrop />
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 40, paddingHorizontal: 20, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <IconButton icon="chevron-back" label="Back" onPress={goBack} />
          <Text style={styles.headerTitle}>
            {rel.emoji} {rel.label}
          </Text>
          <IconButton
            icon="share-outline"
            label="Share"
            onPress={() => router.push({ pathname: "/share/[id]", params: { id: decode.id } })}
          />
        </View>

        <View style={styles.hero}>
          <ScoreRing score={result.interest_score} size={214} stroke={17} />
          <Text style={styles.verdict}>{result.verdict}</Text>
          <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.vibe}>
            <Text style={styles.vibeText}>{result.vibe}</Text>
          </LinearGradient>
        </View>

        {result.safety_note !== "" && (
          <Card title="Real talk" emoji="💗" style={styles.safety}>
            <Text style={styles.body}>{result.safety_note}</Text>
          </Card>
        )}

        <Card title="The read" emoji="🔍">
          <Text style={styles.body}>{result.summary}</Text>
        </Card>

        <Card title="Who's carrying" emoji="⚖️">
          <EffortBar you={result.effort.you} them={result.effort.them} />
        </Card>

        <Locked locked={!isPro} onUnlock={unlock}>
          <Card title="What they meant" emoji="💬">
            {result.translations.length === 0 ? (
              <Text style={styles.muted}>Nothing hidden here. They said what they meant.</Text>
            ) : (
              result.translations.map((t, i) => <TranslationBubbles key={i} quote={t.quote} meaning={t.meaning} />)
            )}
          </Card>
        </Locked>

        <Locked locked={!isPro} onUnlock={unlock}>
          <Card title="Flags" emoji="🚩">
            {result.green_flags.length === 0 && result.red_flags.length === 0 && (
              <Text style={styles.muted}>No flags either way.</Text>
            )}
            {result.green_flags.map((f, i) => (
              <FlagRow key={`g${i}`} flag={f} kind="green" />
            ))}
            {result.red_flags.map((f, i) => (
              <FlagRow key={`r${i}`} flag={f} kind="red" />
            ))}
          </Card>
        </Locked>

        <Locked locked={!isPro} onUnlock={unlock}>
          <Card title="What to send back" emoji="✍️">
            {result.replies.map((reply, i) => (
              <ReplyRow key={i} reply={reply} />
            ))}
          </Card>
        </Locked>

        <Locked locked={!isPro} onUnlock={unlock}>
          <Card title="Your next move" emoji="🎯">
            <Text style={[styles.body, styles.nextMove]}>{result.next_move}</Text>
          </Card>
        </Locked>

        <Pressable
          onPress={() => router.push({ pathname: "/share/[id]", params: { id: decode.id } })}
          style={({ pressed }) => [styles.shareCta, { opacity: pressed ? 0.85 : 1 }]}
          accessibilityRole="button"
        >
          <Ionicons name="share-outline" size={18} color={colors.text} />
          <Text style={styles.shareCtaText}>Share to your story</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function ReplyRow({ reply }: { reply: Reply }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await Clipboard.setStringAsync(reply.text);
    Haptics.selectionAsync().catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <Pressable onPress={copy} style={({ pressed }) => [styles.reply, { opacity: pressed ? 0.85 : 1 }]} accessibilityRole="button" accessibilityHint="Copies this reply">
      <Text style={styles.replyEmoji}>{TONE_EMOJI[reply.tone] ?? "💬"}</Text>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.replyTone}>{reply.tone}</Text>
        <Text style={styles.replyText}>{reply.text}</Text>
      </View>
      <Ionicons name={copied ? "checkmark" : "copy-outline"} size={18} color={copied ? colors.mint : colors.textTertiary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  missing: { alignItems: "center", justifyContent: "center", gap: 16 },
  missingText: { color: colors.textSecondary, fontFamily: fonts.bodyMedium, fontSize: 16 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { color: colors.text, fontFamily: fonts.displayBold, fontSize: 18 },
  hero: { alignItems: "center", gap: 14, paddingVertical: 12 },
  verdict: { color: colors.text, fontFamily: fonts.display, fontSize: 31, lineHeight: 35, textAlign: "center", paddingHorizontal: 10 },
  vibe: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.pill },
  vibeText: { color: "#fff", fontFamily: fonts.bodyBold, fontSize: 14.5 },
  safety: { borderColor: colors.coral, borderWidth: 1.5, backgroundColor: "rgba(255,90,106,0.08)" },
  body: { color: "rgba(255,255,255,0.9)", fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  muted: { color: colors.textSecondary, fontFamily: fonts.body, fontSize: 15 },
  nextMove: { fontFamily: fonts.bodySemibold, color: colors.text },
  reply: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  replyEmoji: { fontSize: 22 },
  replyTone: { color: colors.textTertiary, fontFamily: fonts.bodyBold, fontSize: 11.5, letterSpacing: 1, textTransform: "uppercase" },
  replyText: { color: colors.text, fontFamily: fonts.bodyMedium, fontSize: 15.5 },
  shareCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 54,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    marginTop: 8,
  },
  shareCtaText: { color: colors.text, fontFamily: fonts.bodyBold, fontSize: 16 },
});
