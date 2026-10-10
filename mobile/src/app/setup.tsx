import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Backdrop } from "../components/Backdrop";
import { GradientButton, IconButton, Pill, SectionLabel } from "../components/ui";
import { DecodeError, decodeConversation } from "../lib/api";
import { newId } from "../lib/format";
import { useAppStore, useFreeDecodesLeft } from "../lib/store";
import { RELATIONSHIPS, type Relationship, type UserSide } from "../lib/types";
import { colors, fonts, gradients, radius } from "../theme";

export default function Setup() {
  const insets = useSafeAreaInsets();
  const pending = useAppStore((s) => s.pending);
  const isPro = useAppStore((s) => s.isPro);
  const addDecode = useAppStore((s) => s.addDecode);
  const recordFreeDecode = useAppStore((s) => s.recordFreeDecode);
  const freeLeft = useFreeDecodesLeft();

  const [relationship, setRelationship] = useState<Relationship>("crush");
  const [userSide, setUserSide] = useState<UserSide>("right");
  const [question, setQuestion] = useState("");
  const [decoding, setDecoding] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  const decode = async () => {
    if (!isPro && freeLeft === 0) {
      router.push("/paywall");
      return;
    }
    setDecoding(true);
    try {
      const result = await decodeConversation({ screenshots: pending, relationship, userSide, question });
      if (!result.is_conversation) {
        Alert.alert("That's not a chat", result.summary || "Pick screenshots of a text conversation.");
        return;
      }
      const id = newId();
      addDecode({ id, createdAt: Date.now(), relationship, result });
      if (!isPro) recordFreeDecode();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      router.replace({ pathname: "/result/[id]", params: { id } });
    } catch (error) {
      const message = error instanceof DecodeError ? error.message : "Something went wrong. Try again.";
      Alert.alert("Couldn't decode", message);
    } finally {
      setDecoding(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Backdrop intensity={0.7} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28, paddingHorizontal: 20, gap: 26 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <IconButton icon="chevron-back" label="Back" onPress={() => router.back()} />
            <Text style={styles.title}>Set it up</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {pending.map((shot, i) => (
              <View key={shot.uri} style={styles.thumbWrap}>
                <Image source={{ uri: shot.uri }} style={styles.thumb} resizeMode="cover" />
                <View style={styles.thumbBadge}>
                  <Text style={styles.thumbBadgeText}>{i + 1}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={{ gap: 14 }}>
            <SectionLabel>Who is this?</SectionLabel>
            <View style={styles.chips}>
              {RELATIONSHIPS.map((r) => (
                <Pill
                  key={r.value}
                  label={`${r.emoji}  ${r.label}`}
                  selected={relationship === r.value}
                  onPress={() => setRelationship(r.value)}
                />
              ))}
            </View>
          </View>

          <View style={{ gap: 14 }}>
            <SectionLabel>Which side are your texts on?</SectionLabel>
            <View style={styles.sides}>
              {(["left", "right"] as const).map((side) => (
                <SideOption key={side} side={side} selected={userSide === side} onPress={() => setUserSide(side)} />
              ))}
            </View>
          </View>

          <View style={{ gap: 14 }}>
            <SectionLabel>Anything specific?</SectionLabel>
            <TextInput
              value={question}
              onChangeText={setQuestion}
              placeholder="e.g. do they actually like me?"
              placeholderTextColor={colors.textTertiary}
              style={[styles.input, inputFocused && styles.inputFocused]}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              maxLength={300}
              multiline
            />
          </View>

          <GradientButton title="Decode it" icon="sparkles" onPress={decode} disabled={pending.length === 0} />
        </ScrollView>
      </KeyboardAvoidingView>

      {decoding && <DecodingOverlay />}
    </View>
  );
}

function SideOption({ side, selected, onPress }: { side: UserSide; selected: boolean; onPress: () => void }) {
  const mine = { alignSelf: side === "right" ? "flex-end" : "flex-start" } as const;
  const theirs = { alignSelf: side === "right" ? "flex-start" : "flex-end" } as const;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`My texts are on the ${side}`}
      style={[styles.side, selected && styles.sideSelected]}
    >
      <View style={[styles.sideBubble, theirs, { backgroundColor: colors.theirBubble, width: "55%" }]} />
      <View style={[styles.sideBubble, mine, { backgroundColor: selected ? colors.pink : "rgba(255,255,255,0.25)", width: "65%" }]} />
      <View style={[styles.sideBubble, theirs, { backgroundColor: colors.theirBubble, width: "40%" }]} />
      <Text style={styles.sideLabel}>{side === "right" ? "Right" : "Left"}</Text>
    </Pressable>
  );
}

const LINES = [
  "Reading the subtext…",
  "Checking who double-texted…",
  "Measuring reply times…",
  "Analyzing that “haha”…",
  "Consulting the group chat…",
  "Overthinking so you don't have to…",
];

function DecodingOverlay() {
  const [index, setIndex] = useState(0);
  const [pulse] = useState(() => new Animated.Value(0));
  const [spin] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % LINES.length), 2200);
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    const spinLoop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 3200, easing: Easing.linear, useNativeDriver: true }),
    );
    pulseLoop.start();
    spinLoop.start();
    return () => {
      clearInterval(timer);
      pulseLoop.stop();
      spinLoop.stop();
    };
  }, [pulse, spin]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.08] });
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <View style={[StyleSheet.absoluteFill, styles.overlay]}>
      <Backdrop intensity={1.4} />
      <Animated.View style={[styles.orbWrap, { transform: [{ scale }] }]}>
        <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate }] }]}>
          <LinearGradient colors={gradients.sunset} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.orb} />
        </Animated.View>
        <View style={styles.orbCore}>
          <Ionicons name="chatbubble-ellipses" size={44} color={colors.pink} />
        </View>
      </Animated.View>
      <Text style={styles.overlayLine}>{LINES[index]}</Text>
      <Text style={styles.overlayHint}>This takes about 15 seconds</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { color: colors.text, fontFamily: fonts.displayBold, fontSize: 19 },
  thumbWrap: { borderRadius: radius.md, overflow: "hidden", borderWidth: 1, borderColor: colors.border },
  thumb: { width: 92, height: 170 },
  thumbBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(10,6,18,0.75)",
    alignItems: "center",
    justifyContent: "center",
  },
  thumbBadgeText: { color: "#fff", fontFamily: fonts.bodyBold, fontSize: 12 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  sides: { flexDirection: "row", gap: 12 },
  side: {
    flex: 1,
    gap: 7,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  sideSelected: { borderColor: colors.pink, backgroundColor: "rgba(255,61,127,0.1)" },
  sideBubble: { height: 14, borderRadius: 7 },
  sideLabel: { color: colors.text, fontFamily: fonts.bodyBold, fontSize: 15, textAlign: "center", marginTop: 4 },
  input: {
    minHeight: 54,
    color: colors.text,
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    outlineWidth: 0,
  },
  inputFocused: { borderColor: colors.pink },
  overlay: { alignItems: "center", justifyContent: "center", gap: 22, backgroundColor: colors.bg },
  orbWrap: {
    width: 140,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 60px rgba(255, 61, 127, 0.55)",
    borderRadius: 70,
  },
  orb: { width: 140, height: 140, borderRadius: 70 },
  orbCore: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  overlayLine: { color: colors.text, fontFamily: fonts.displayBold, fontSize: 22 },
  overlayHint: { color: colors.textTertiary, fontFamily: fonts.bodyMedium, fontSize: 13.5 },
});
