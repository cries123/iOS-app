import { router, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import { useRef, useState } from "react";
import { Alert, Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";
import { Backdrop } from "../../components/Backdrop";
import { SHARE_CARD_HEIGHT, SHARE_CARD_WIDTH, ShareCard } from "../../components/ShareCard";
import { GradientButton, IconButton } from "../../components/ui";
import { useAppStore } from "../../lib/store";
import { colors, fonts } from "../../theme";

export default function Share() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const decode = useAppStore((s) => s.history.find((d) => d.id === id));
  const insets = useSafeAreaInsets();
  const cardRef = useRef<View>(null);
  const [busy, setBusy] = useState(false);

  const close = () => (router.canGoBack() ? router.back() : router.replace("/"));

  const share = async () => {
    if (!cardRef.current) return;
    setBusy(true);
    try {
      // Story size: 1080 x 1920.
      const uri = await captureRef(cardRef, {
        format: "png",
        quality: 1,
        width: 1080,
        height: 1920,
      });
      if (Platform.OS === "web" || !(await Sharing.isAvailableAsync())) {
        Alert.alert("Sharing isn't available here", "Open Decode on your phone to share to your story.");
        return;
      }
      await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: "Share your Decode" });
    } catch {
      Alert.alert("Couldn't make the image", "Try again in a moment.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Backdrop intensity={0.6} />
      <View style={[styles.content, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.header}>
          <IconButton icon="close" label="Close" onPress={close} />
          <Text style={styles.title}>Share to your story</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.cardWrap}>
          {decode ? (
            <View style={styles.frame}>
              <ShareCard ref={cardRef} decode={decode} />
            </View>
          ) : (
            <Text style={styles.missing}>{"This decode isn't here anymore."}</Text>
          )}
        </View>

        <GradientButton title="Share" icon="share-outline" onPress={share} loading={busy} disabled={!decode} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, paddingHorizontal: 20, gap: 18 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { color: colors.text, fontFamily: fonts.displayBold, fontSize: 18 },
  cardWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: SHARE_CARD_HEIGHT,
    minWidth: SHARE_CARD_WIDTH,
  },
  frame: {
    borderRadius: 33,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    boxShadow: "0 20px 60px rgba(165, 75, 255, 0.35)",
  },
  missing: { color: colors.textSecondary, fontFamily: fonts.bodyMedium, fontSize: 16 },
});
