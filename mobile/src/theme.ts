/**
 * "Afterglow": a deep plum night with a sunset gradient running through it.
 * Warm-to-cool gradients read as playful and premium, and pop on a story.
 */
export const colors = {
  bg: "#0A0612",
  bgRaised: "#140B22",
  surface: "rgba(255,255,255,0.055)",
  surfaceStrong: "rgba(255,255,255,0.09)",
  border: "rgba(255,255,255,0.09)",

  text: "#FFFFFF",
  textSecondary: "rgba(255,255,255,0.66)",
  textTertiary: "rgba(255,255,255,0.42)",

  sunset: "#FF8A4C",
  pink: "#FF3D7F",
  violet: "#A54BFF",
  lilac: "#C9B6FF",
  mint: "#3DF5B0",
  coral: "#FF5A6A",

  theirBubble: "#2A2236",
} as const;

export const gradients = {
  /** Buttons and highlights. */
  primary: ["#FF3D7F", "#A54BFF"] as const,
  /** Score ring, wordmark, share card. */
  sunset: ["#FF8A4C", "#FF3D7F", "#A54BFF"] as const,
  /** Page backdrop. */
  night: ["#1B0B30", "#0A0612"] as const,
};

export const fonts = {
  display: "BricolageGrotesque_800ExtraBold",
  displayBold: "BricolageGrotesque_700Bold",
  body: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  bodySemibold: "Inter_600SemiBold",
  bodyBold: "Inter_700Bold",
} as const;

export const radius = { sm: 12, md: 18, lg: 24, xl: 32, pill: 999 } as const;

export const space = { xs: 6, sm: 10, md: 16, lg: 24, xl: 32 } as const;
