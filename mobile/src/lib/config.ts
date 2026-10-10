export const config = {
  /**
   * The Decode server (see server/). For Expo Go on your phone, use your deployed Worker URL
   * (https://decode-server.<you>.workers.dev) - your phone can't reach `localhost` on another machine.
   */
  serverUrl: process.env.EXPO_PUBLIC_DECODE_SERVER_URL ?? "http://localhost:8787",

  /** Must match the server's APP_TOKEN secret. */
  appToken: process.env.EXPO_PUBLIC_DECODE_APP_TOKEN ?? "dev-token",

  freeDecodesPerDay: 2,
  maxScreenshots: 6,

  termsUrl: "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/",
  privacyUrl: "https://example.com/privacy",
};
