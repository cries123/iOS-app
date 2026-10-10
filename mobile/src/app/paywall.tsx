import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Backdrop } from "../components/Backdrop";
import { GradientText } from "../components/GradientText";
import { GradientButton, IconButton } from "../components/ui";
import { config } from "../lib/config";
import { PLANS, purchase, restorePurchases, type Plan } from "../lib/purchases";
import { colors, fonts, gradients, radius } from "../theme";

const FEATURES = [
  { icon: "chatbubbles" as const, text: "What every message actually meant" },
  { icon: "flag" as const, text: "Red flags and green flags" },
  { icon: "paper-plane" as const, text: "Replies you can copy and send" },
  { icon: "infinite" as const, text: "Unlimited decodes" },
];

export default function Paywall() {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<Plan["id"]>("yearly");
  const [busy, setBusy] = useState(false);

  const close = () => (router.canGoBack() ? router.back() : router.replace("/"));

  const buy = async () => {
    const plan = PLANS.find((p) => p.id === selected);
    if (!plan) return;
    setBusy(true);
    try {
      if (await purchase(plan)) close();
    } catch {
      Alert.alert("Purchase failed", "Nothing was charged. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  };

  const restore = async () => {
    const restored = await restorePurchases();
    if (restored) close();
    else Alert.alert("Nothing to restore", "We couldn't find an active Decode Pro subscription on this Apple ID.");
  };

  return (
    <View style={styles.screen}>
      <Backdrop intensity={1.4} />
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24, paddingHorizontal: 22, gap: 26 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <IconButton icon="close" label="Close" onPress={close} />
        </View>

        <View style={styles.hero}>
          <GradientText size={46}>decode pro</GradientText>
          <Text style={styles.subtitle}>See the full read on every chat.</Text>
        </View>

        <View style={styles.features}>
          {FEATURES.map((f) => (
            <View key={f.text} style={styles.feature}>
              <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.featureIcon}>
                <Ionicons name={f.icon} size={17} color="#fff" />
              </LinearGradient>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        <View style={{ gap: 12 }}>
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} selected={plan.id === selected} onPress={() => setSelected(plan.id)} />
          ))}
        </View>

        <View style={{ gap: 14 }}>
          <GradientButton title={selected === "yearly" ? "Start 3-day free trial" : "Continue"} onPress={buy} loading={busy} />
          <Text style={styles.fine}>
            {selected === "yearly"
              ? "3 days free, then $29.99/year. Cancel anytime in Settings."
              : "$4.99/week. Cancel anytime in Settings."}{" "}
            Subscriptions renew automatically until cancelled.
          </Text>
          <View style={styles.links}>
            <Text style={styles.link} onPress={restore}>
              Restore
            </Text>
            <Text style={styles.link} onPress={() => Linking.openURL(config.termsUrl)}>
              Terms
            </Text>
            <Text style={styles.link} onPress={() => Linking.openURL(config.privacyUrl)}>
              Privacy
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function PlanCard({ plan, selected, onPress }: { plan: Plan; selected: boolean; onPress: () => void }) {
  const inner = (
    <View style={[styles.plan, selected && styles.planSelectedInner]}>
      <View style={[styles.radio, selected && styles.radioOn]}>{selected && <View style={styles.radioDot} />}</View>
      <View style={{ flex: 1, gap: 3 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={styles.planName}>{plan.name}</Text>
          {plan.badge && (
            <LinearGradient colors={gradients.sunset} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.badge}>
              <Text style={styles.badgeText}>{plan.badge}</Text>
            </LinearGradient>
          )}
        </View>
        <Text style={styles.planDetail}>{plan.detail}</Text>
      </View>
      <Text style={styles.planPrice}>
        {plan.price}
        <Text style={styles.planPeriod}>/{plan.period}</Text>
      </Text>
    </View>
  );

  return (
    <Pressable onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected }}>
      {selected ? (
        <LinearGradient colors={gradients.sunset} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.planBorder}>
          {inner}
        </LinearGradient>
      ) : (
        <View style={[styles.planBorder, { backgroundColor: colors.border }]}>{inner}</View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row" },
  hero: { alignItems: "center", gap: 8 },
  subtitle: { color: colors.textSecondary, fontFamily: fonts.bodyMedium, fontSize: 17 },
  features: { gap: 14, paddingHorizontal: 4 },
  feature: { flexDirection: "row", alignItems: "center", gap: 14 },
  featureIcon: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  featureText: { color: colors.text, fontFamily: fonts.bodySemibold, fontSize: 16.5 },
  planBorder: { borderRadius: radius.lg, padding: 1.5 },
  plan: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 18,
    borderRadius: radius.lg - 1.5,
    backgroundColor: colors.bgRaised,
  },
  planSelectedInner: { backgroundColor: "#1E0F2E" },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.textTertiary, alignItems: "center", justifyContent: "center" },
  radioOn: { borderColor: colors.pink },
  radioDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: colors.pink },
  planName: { color: colors.text, fontFamily: fonts.bodyBold, fontSize: 17 },
  planDetail: { color: colors.textTertiary, fontFamily: fonts.bodyMedium, fontSize: 13.5 },
  planPrice: { color: colors.text, fontFamily: fonts.displayBold, fontSize: 20 },
  planPeriod: { color: colors.textTertiary, fontFamily: fonts.bodyMedium, fontSize: 13 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  badgeText: { color: "#fff", fontFamily: fonts.bodyBold, fontSize: 10.5, letterSpacing: 0.8 },
  fine: { color: colors.textTertiary, fontFamily: fonts.body, fontSize: 12, lineHeight: 17, textAlign: "center" },
  links: { flexDirection: "row", justifyContent: "center", gap: 26 },
  link: { color: colors.textSecondary, fontFamily: fonts.bodySemibold, fontSize: 13.5 },
});
