import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Backdrop } from "../components/Backdrop";
import { GradientText } from "../components/GradientText";
import { GradientButton } from "../components/ui";
import { useAppStore } from "../lib/store";
import { colors, fonts, gradients } from "../theme";

const DEMO = [
  { theirs: "lol sure", meaning: "Interested, playing it cool" },
  { theirs: "omg i'm sooo busy this week", meaning: "Ask about next week. Seriously." },
];

export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  const start = () => {
    completeOnboarding();
    router.replace("/");
  };

  return (
    <View style={styles.screen}>
      <Backdrop intensity={1.3} />
      <View style={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 20 }]}>
        <GradientText size={44}>decode</GradientText>

        <View style={styles.demo}>
          {DEMO.map((item, i) => (
            <View key={item.theirs} style={[styles.pair, { transform: [{ rotate: i % 2 ? "1.5deg" : "-1.5deg" }] }]}>
              <View style={styles.theirs}>
                <Text style={styles.theirsText}>{item.theirs}</Text>
              </View>
              <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ours}>
                <Text style={styles.oursLabel}>WHAT THEY MEANT</Text>
                <Text style={styles.oursText}>{item.meaning}</Text>
              </LinearGradient>
            </View>
          ))}
        </View>

        <View style={{ gap: 12 }}>
          <Text style={styles.headline}>Stop overthinking{"\n"}their texts.</Text>
          <Text style={styles.subhead}>
            Screenshot any chat. Decode reads between the lines and tells you what they actually meant, and what
            to send back.
          </Text>
        </View>

        <View style={{ gap: 14 }}>
          <GradientButton title="I'm 13 or older. Let's go" icon="arrow-forward" onPress={start} />
          <Text style={styles.fine}>
            Screenshots are analyzed by AI and never saved on our servers. Results are for fun, not a substitute
            for actually talking to people.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: "space-between" },
  demo: { gap: 22, paddingVertical: 8 },
  pair: { gap: 6 },
  theirs: {
    alignSelf: "flex-start",
    backgroundColor: colors.theirBubble,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 22,
    borderBottomLeftRadius: 6,
  },
  theirsText: { color: colors.text, fontFamily: fonts.bodyMedium, fontSize: 17 },
  ours: {
    alignSelf: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 22,
    borderBottomRightRadius: 6,
    gap: 3,
    boxShadow: "0 10px 30px rgba(255, 61, 127, 0.35)",
  },
  oursLabel: { color: "rgba(255,255,255,0.75)", fontFamily: fonts.bodyBold, fontSize: 10.5, letterSpacing: 1.2 },
  oursText: { color: "#fff", fontFamily: fonts.bodySemibold, fontSize: 17 },
  headline: { color: colors.text, fontFamily: fonts.display, fontSize: 36, lineHeight: 40 },
  subhead: { color: colors.textSecondary, fontFamily: fonts.bodyMedium, fontSize: 16.5, lineHeight: 24 },
  fine: { color: colors.textTertiary, fontFamily: fonts.body, fontSize: 12, lineHeight: 17, textAlign: "center" },
});
