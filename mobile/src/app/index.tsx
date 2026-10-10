import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient as SvgGradient, Rect, Stop } from "react-native-svg";
import { Backdrop } from "../components/Backdrop";
import { GradientText } from "../components/GradientText";
import { ScoreRing } from "../components/ScoreRing";
import { SectionLabel } from "../components/ui";
import { config } from "../lib/config";
import { timeAgo } from "../lib/format";
import { useAppStore, useFreeDecodesLeft } from "../lib/store";
import { relationshipInfo, type SavedDecode } from "../lib/types";
import { useHydrated } from "../lib/useHydrated";
import { colors, fonts, gradients, radius } from "../theme";

export default function Home() {
  const hydrated = useHydrated();
  const hasOnboarded = useAppStore((s) => s.hasOnboarded);
  const history = useAppStore((s) => s.history);
  const isPro = useAppStore((s) => s.isPro);
  const setPending = useAppStore((s) => s.setPending);
  const freeLeft = useFreeDecodesLeft();
  const insets = useSafeAreaInsets();
  const [picking, setPicking] = useState(false);

  if (!hydrated) return <View style={styles.screen} />;
  if (!hasOnboarded) return <Redirect href="/onboarding" />;

  const pick = async () => {
    if (!isPro && freeLeft === 0) {
      router.push("/paywall");
      return;
    }
    setPicking(true);
    try {
      const picked = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        selectionLimit: config.maxScreenshots,
        orderedSelection: true,
        quality: 1,
      });
      if (picked.canceled || picked.assets.length === 0) return;
      setPending(picked.assets.slice(0, config.maxScreenshots).map(({ uri, width, height }) => ({ uri, width, height })));
      router.push("/setup");
    } catch {
      Alert.alert("Couldn't open your photos", "Check that Decode has photo access in Settings.");
    } finally {
      setPicking(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Backdrop />
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32, paddingHorizontal: 20, gap: 28 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <GradientText size={34}>decode</GradientText>
          {isPro ? (
            <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.proBadge}>
              <Text style={styles.proBadgeText}>PRO</Text>
            </LinearGradient>
          ) : (
            <Pressable onPress={() => router.push("/paywall")} style={styles.goPro} accessibilityRole="button">
              <Ionicons name="sparkles" size={14} color={colors.lilac} />
              <Text style={styles.goProText}>Go Pro</Text>
            </Pressable>
          )}
        </View>

        <View style={{ gap: 10 }}>
          <Text style={styles.headline}>What did they{"\n"}actually mean?</Text>
          <Text style={styles.subhead}>Drop in screenshots of any chat. Get the real read in seconds.</Text>
        </View>

        <DropZone onPress={pick} loading={picking} caption={isPro ? `Up to ${config.maxScreenshots} screenshots · unlimited` : freeLeft === 1 ? "1 free decode left today" : `${freeLeft} free decodes left today`} />

        {history.length > 0 ? (
          <View style={{ gap: 12 }}>
            <SectionLabel>Past decodes</SectionLabel>
            {history.map((decode) => (
              <HistoryRow key={decode.id} decode={decode} />
            ))}
          </View>
        ) : (
          <HowItWorks />
        )}
      </ScrollView>
    </View>
  );
}

function DropZone({ onPress, loading, caption }: { onPress: () => void; loading: boolean; caption: string }) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel="Pick chat screenshots"
      onLayout={(e) => setSize(e.nativeEvent.layout)}
      style={({ pressed }) => [styles.dropZone, { transform: [{ scale: pressed ? 0.98 : 1 }] }]}
    >
      {size.width > 0 && (
        <Svg width={size.width} height={size.height} style={StyleSheet.absoluteFill}>
          <Defs>
            <SvgGradient id="drop" x1="0" y1="0" x2="1" y2="1">
              {gradients.sunset.map((c, i) => (
                <Stop key={c} offset={i / 2} stopColor={c} />
              ))}
            </SvgGradient>
          </Defs>
          <Rect
            x={1}
            y={1}
            width={size.width - 2}
            height={size.height - 2}
            rx={radius.xl}
            fill="rgba(255,255,255,0.04)"
            stroke="url(#drop)"
            strokeWidth={2}
            strokeDasharray="10 8"
          />
        </Svg>
      )}

      <View style={styles.bubbleStack}>
        <View style={[styles.miniBubble, styles.miniTheirs]}>
          <Text style={styles.miniText}>haha maybe</Text>
        </View>
        <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.miniBubble, styles.miniOurs]}>
          <Text style={styles.miniText}>translation: yes, ask again 😏</Text>
        </LinearGradient>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <View style={styles.dropCta}>
          <Ionicons name="images" size={20} color={colors.text} />
          <Text style={styles.dropTitle}>Pick chat screenshots</Text>
        </View>
      )}
      <Text style={styles.dropCaption}>{caption}</Text>
    </Pressable>
  );
}

function HistoryRow({ decode }: { decode: SavedDecode }) {
  const rel = relationshipInfo(decode.relationship);
  return (
    <Pressable
      onPress={() => router.push({ pathname: "/result/[id]", params: { id: decode.id } })}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.8 : 1 }]}
      accessibilityRole="button"
    >
      <ScoreRing score={decode.result.interest_score} size={54} stroke={5} animated={false} showLabel={false} />
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={styles.rowTitle} numberOfLines={2}>
          {decode.result.verdict}
        </Text>
        <Text style={styles.rowMeta}>
          {rel.emoji} {rel.label} · {timeAgo(decode.createdAt)}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
    </Pressable>
  );
}

function HowItWorks() {
  const steps = [
    { emoji: "📸", title: "Screenshot the chat", detail: "Crush, situationship, ex, group chat: anything." },
    { emoji: "🧠", title: "We read between the lines", detail: "Reply times, double texts, that suspicious “lol”." },
    { emoji: "💬", title: "Know what to send back", detail: "Interest score, red flags, and replies that hit." },
  ];
  return (
    <View style={{ gap: 12 }}>
      <SectionLabel>How it works</SectionLabel>
      {steps.map((step) => (
        <View key={step.title} style={styles.row}>
          <View style={styles.stepEmoji}>
            <Text style={{ fontSize: 22 }}>{step.emoji}</Text>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.rowTitle}>{step.title}</Text>
            <Text style={styles.rowMeta}>{step.detail}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  goPro: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: "rgba(165,75,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(201,182,255,0.35)",
  },
  goProText: { color: colors.lilac, fontFamily: fonts.bodyBold, fontSize: 14 },
  proBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
  proBadgeText: { color: "#fff", fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 1.5 },
  headline: { color: colors.text, fontFamily: fonts.display, fontSize: 38, lineHeight: 42 },
  subhead: { color: colors.textSecondary, fontFamily: fonts.bodyMedium, fontSize: 16, lineHeight: 23 },

  dropZone: { borderRadius: radius.xl, paddingVertical: 30, paddingHorizontal: 20, alignItems: "center", gap: 18 },
  bubbleStack: { width: "100%", gap: 6, paddingHorizontal: 8 },
  miniBubble: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 18 },
  miniTheirs: { alignSelf: "flex-start", backgroundColor: colors.theirBubble, borderBottomLeftRadius: 5 },
  miniOurs: { alignSelf: "flex-end", borderBottomRightRadius: 5 },
  miniText: { color: "#fff", fontFamily: fonts.bodySemibold, fontSize: 14.5 },
  dropCta: { flexDirection: "row", alignItems: "center", gap: 10 },
  dropTitle: { color: colors.text, fontFamily: fonts.displayBold, fontSize: 21 },
  dropCaption: { color: colors.textTertiary, fontFamily: fonts.bodySemibold, fontSize: 13.5, marginTop: -8 },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  rowTitle: { color: colors.text, fontFamily: fonts.bodyBold, fontSize: 15.5 },
  rowMeta: { color: colors.textTertiary, fontFamily: fonts.bodyMedium, fontSize: 13 },
  stepEmoji: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceStrong,
  },
});
