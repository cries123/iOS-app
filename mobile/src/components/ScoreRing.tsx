import { useEffect, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { colors, fonts, gradients } from "../theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  score: number;
  size?: number;
  stroke?: number;
  /** Off for thumbnails and image capture, where the ring should be drawn complete. */
  animated?: boolean;
  showLabel?: boolean;
}

export function ScoreRing({ score, size = 200, stroke = 16, animated = true, showLabel = true }: Props) {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const target = Math.max(0, Math.min(100, score)) / 100;
  const [progress] = useState(() => new Animated.Value(animated ? 0 : target));
  const id = `ring-${size}`;

  useEffect(() => {
    if (!animated) return;
    Animated.timing(progress, {
      toValue: target,
      duration: 1300,
      delay: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [animated, progress, target]);

  const dashOffset = progress.interpolate({ inputRange: [0, 1], outputRange: [circumference, 0] });

  return (
    <View
      style={{ width: size, height: size }}
      accessible
      accessibilityLabel={`Interest score ${score} out of 100`}
    >
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            {gradients.sunset.map((color, i) => (
              <Stop key={color} offset={i / (gradients.sunset.length - 1)} stopColor={color} />
            ))}
          </LinearGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <Text style={[styles.score, { fontSize: size * 0.3, lineHeight: size * 0.34 }]}>{score}</Text>
        {showLabel && <Text style={[styles.label, { fontSize: Math.max(9, size * 0.058) }]}>INTEREST</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  score: { color: colors.text, fontFamily: fonts.display },
  label: { color: colors.textTertiary, fontFamily: fonts.bodyBold, letterSpacing: 2 },
});
