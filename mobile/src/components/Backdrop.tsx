import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { colors, gradients } from "../theme";

interface Glow {
  color: string;
  size: number;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  opacity?: number;
}

function GlowOrb({ color, size, opacity = 0.55, ...position }: Glow) {
  const id = `glow-${color.replace("#", "")}-${size}`;
  return (
    <View pointerEvents="none" style={[styles.orb, { width: size, height: size }, position]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={color} stopOpacity={opacity} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

/** The night-sky gradient with two soft sunset glows behind every screen. */
export function Backdrop({ intensity = 1 }: { intensity?: number }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient colors={gradients.night} style={StyleSheet.absoluteFill} />
      <GlowOrb color={colors.pink} size={420} top={-160} left={-160} opacity={0.42 * intensity} />
      <GlowOrb color={colors.violet} size={460} top={260} right={-220} opacity={0.36 * intensity} />
      <GlowOrb color={colors.sunset} size={360} bottom={-180} left={-120} opacity={0.22 * intensity} />
    </View>
  );
}

const styles = StyleSheet.create({
  orb: { position: "absolute" },
});
