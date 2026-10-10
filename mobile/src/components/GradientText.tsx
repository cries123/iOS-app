import { useState } from "react";
import { StyleSheet, Text, View, type TextStyle } from "react-native";
import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from "react-native-svg";
import { fonts, gradients } from "../theme";

interface Props {
  children: string;
  size: number;
  colors?: readonly string[];
  fontFamily?: string;
  style?: TextStyle;
}

/**
 * Single-line text filled with a gradient. An invisible copy of the text sizes the box,
 * then an SVG paints the gradient text on top, so it works on iOS, Android and web.
 */
export function GradientText({ children, size, colors = gradients.sunset, fontFamily = fonts.display, style }: Props) {
  const [box, setBox] = useState<{ width: number; height: number } | null>(null);
  const id = `gt-${children.length}-${size}`;

  return (
    <View accessible accessibilityRole="header" accessibilityLabel={children}>
      <Text
        style={[{ fontSize: size, fontFamily, lineHeight: size * 1.15 }, style, styles.hidden]}
        onLayout={(e) => setBox({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
        numberOfLines={1}
      >
        {children}
      </Text>
      {box && (
        <Svg width={box.width} height={box.height} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="1" y2="0.4">
              {colors.map((color, i) => (
                <Stop key={color + i} offset={i / Math.max(1, colors.length - 1)} stopColor={color} />
              ))}
            </LinearGradient>
          </Defs>
          <SvgText
            fill={`url(#${id})`}
            fontSize={size}
            fontFamily={fontFamily}
            x={0}
            y={box.height / 2 + size * 0.36}
          >
            {children}
          </SvgText>
        </Svg>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hidden: { opacity: 0 },
});
