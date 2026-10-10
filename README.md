# Decode

**What did they *actually* mean?** Drop in screenshots of a conversation with a crush, situationship, ex, friend or group chat. Decode gives an interest score, a verdict, who's carrying the conversation, red and green flags, what their messages really meant, and replies you can send back.

For ages 13+. Built for the TikTok loop: every result makes a 9:16 share card for stories.

## What's here

```
ios/      SwiftUI app (iOS 17+): onboarding, screenshot picker, results, share card, paywall
server/   Cloudflare Worker that sends screenshots to Claude and returns structured JSON
```

**How a decode works:**
1. The app shrinks the screenshots and sends them to the server.
2. The server asks Claude (`claude-opus-5-5`) for a structured read of the conversation and checks the result.
3. The app shows the score, verdict, vibe and effort split for free. The flags, translations, replies and next move are blurred until the user subscribes to Pro.

**Pricing:** free users get 2 decodes a day. Pro is $4.99 a week or $29.99 a year (placeholder prices).

**Privacy:** screenshots are never stored by Decode. The server doesn't log them, and the app keeps only the results on the device.

**Safety:** the prompt flags signs of grooming, pressure for nudes, sextortion, abuse or self-harm. In those cases the app shows a "Real talk" card that isn't behind the paywall, and it never suggests manipulative replies.

## Run it

### 1. Server (any computer with Node 20+)

```bash
cd server
npm install
cp .dev.vars.example .dev.vars   # then put your Claude API key in .dev.vars
npm run dev                      # http://localhost:8787
npm test                         # unit tests
```

Get an API key at https://platform.claude.com. Each decode costs roughly a few cents.

### 2. iOS app (Mac with Xcode 16+)

```bash
brew install xcodegen
cd ios
xcodegen                         # creates Decode.xcodeproj
open Decode.xcodeproj
```

Pick an iPhone simulator and press Run. While `npm run dev` is running, the simulator reaches the server at `localhost:8787`.

Subscriptions work in the simulator through `Decode.storekit`, so you don't need App Store Connect for testing. Manage test purchases under **Debug → StoreKit → Manage Transactions**.

### 3. Deploy the server

```bash
cd server
npx wrangler login
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put APP_TOKEN        # make up a long random string
npm run deploy
```

Then in `ios/Decode/App/Config.swift`:
- set `serverURL` to the `https://decode-server.<you>.workers.dev` URL
- set `appToken` to the same `APP_TOKEN` value

## Before the App Store

- **App Store Connect setup:**
  - Change the bundle ID (`com.example.decode` in `ios/project.yml`) to your own.
  - Create the two subscriptions in App Store Connect with matching product IDs. They're listed in `Config.proProductIDs` and `Decode.storekit`.
- **Legal pages:** replace `Config.privacyURL` and `Config.termsURL` with your own pages. Apple requires working links on the paywall.
- **Age rating:** set the rating to 13+ in App Store Connect.
- **Harden the server before launch:**
  - Swap the shared `APP_TOKEN` for [App Attest](https://developer.apple.com/documentation/devicecheck/establishing-your-app-s-integrity) and add per-device rate limits.
  - Today the free-tier limit is only enforced in the app, so someone who extracts the token could call the server directly.
- **Launch content:** make the TikTok and Instagram content ("I put my ex's texts into this app…").
