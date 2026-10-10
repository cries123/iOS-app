import Foundation

enum Config {
    /// Where the Decode server runs. `localhost` works in the simulator while `npm run dev` is running
    /// in `server/`. Replace with your deployed Worker URL (https://decode-server.<you>.workers.dev).
    static let serverURL = URL(string: "http://localhost:8787")!

    /// Must match the server's APP_TOKEN secret (`server/.dev.vars` locally).
    static let appToken = "dev-token"

    /// Free users get this many decodes per day; Pro is unlimited.
    static let freeDecodesPerDay = 2

    static let maxScreenshots = 6

    /// Must match the product IDs in App Store Connect and `Decode.storekit`.
    static let proProductIDs: Set<String> = ["com.example.decode.pro.weekly", "com.example.decode.pro.yearly"]

    // Apple requires working links to these on the paywall. Replace before submitting.
    static let termsURL = URL(string: "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/")!
    static let privacyURL = URL(string: "https://example.com/privacy")!
}
