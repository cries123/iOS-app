import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { ComponentProps, ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { colors, fonts, gradients, radius, space } from "../theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

export function GradientButton({
  title,
  icon,
  onPress,
  disabled,
  loading,
  style,
}: {
  title: string;
  icon?: IconName;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!(disabled || loading) }}
      style={({ pressed }) => [
        styles.buttonShadow,
        { opacity: disabled ? 0.45 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
        style,
      ]}
    >
      <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.button}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            {icon && <Ionicons name={icon} size={20} color="#fff" />}
            <Text style={styles.buttonText}>{title}</Text>
          </>
        )}
      </LinearGradient>
    </Pressable>
  );
}

export function Card({
  title,
  emoji,
  children,
  style,
}: {
  title?: string;
  emoji?: string;
  children: ReactNode;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.card, style]}>
      {title && (
        <View style={styles.cardHeader}>
          {emoji && <Text style={styles.cardEmoji}>{emoji}</Text>}
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
      )}
      {children}
    </View>
  );
}

export function Pill({
  label,
  selected,
  onPress,
  style,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}) {
  const content = selected ? (
    <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.pill}>
      <Text style={styles.pillText}>{label}</Text>
    </LinearGradient>
  ) : (
    <View style={[styles.pill, styles.pillIdle]}>
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );

  if (!onPress) return <View style={style}>{content}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      style={({ pressed }) => [style, { transform: [{ scale: pressed ? 0.96 : 1 }] }]}
    >
      {content}
    </Pressable>
  );
}

export function IconButton({ icon, onPress, label }: { icon: IconName; onPress: () => void; label: string }) {
  return (
    <Pressable onPress={onPress} accessibilityLabel={label} hitSlop={10} style={styles.iconButton}>
      <Ionicons name={icon} size={20} color={colors.text} />
    </Pressable>
  );
}

export function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

const styles = StyleSheet.create({
  buttonShadow: {
    borderRadius: radius.pill,
    boxShadow: "0 10px 28px rgba(255, 61, 127, 0.4)",
  },
  button: {
    height: 58,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: space.lg,
  },
  buttonText: { color: "#fff", fontFamily: fonts.bodyBold, fontSize: 17, letterSpacing: 0.2 },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    padding: 18,
    gap: 12,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardEmoji: { fontSize: 16 },
  cardTitle: {
    color: colors.textSecondary,
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.pill,
    alignItems: "center",
  },
  pillIdle: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
  },
  pillText: { color: colors.text, fontFamily: fonts.bodySemibold, fontSize: 15 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceStrong,
  },
  sectionLabel: { color: colors.text, fontFamily: fonts.displayBold, fontSize: 20 },
});
