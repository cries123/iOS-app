import SwiftUI

struct SavedResultView: View {
    let saved: SavedDecode

    var body: some View {
        if let result = saved.result {
            ResultView(result: result, relationship: saved.relationship)
        } else {
            ContentUnavailableView("Couldn't open this decode", systemImage: "exclamationmark.bubble")
                .background(Theme.background.ignoresSafeArea())
        }
    }
}

struct ResultView: View {
    let result: DecodeResult
    let relationship: Relationship

    @Environment(Store.self) private var store
    @State private var showPaywall = false
    @State private var shareImage: UIImage?
    @State private var copiedReply: String?

    var body: some View {
        ScrollView {
            VStack(spacing: 18) {
                if result.isConversation {
                    hero
                    if !result.safetyNote.isEmpty { safetyCard }
                    Card(title: "The read", systemImage: "text.magnifyingglass") {
                        Text(result.summary)
                            .font(.body)
                            .foregroundStyle(.white.opacity(0.9))
                    }
                    Card(title: "Who's carrying", systemImage: "scalemass") {
                        EffortBar(you: result.effort.you, them: result.effort.them)
                    }
                    locked(translationsCard)
                    locked(flagsCard)
                    locked(repliesCard)
                    locked(nextMoveCard)
                } else {
                    ContentUnavailableView {
                        Label("That's not a chat", systemImage: "questionmark.bubble")
                    } description: {
                        Text(result.summary)
                    }
                }
            }
            .padding(20)
        }
        .background(Theme.background.ignoresSafeArea())
        .navigationTitle("\(relationship.emoji) \(relationship.label)")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                if let shareImage, result.isConversation {
                    ShareLink(
                        item: Image(uiImage: shareImage),
                        message: Text(shareMessage),
                        preview: SharePreview("My Decode", image: Image(uiImage: shareImage))
                    ) {
                        Image(systemName: "square.and.arrow.up")
                    }
                }
            }
        }
        .sheet(isPresented: $showPaywall) { PaywallView() }
        .task {
            shareImage = ShareCardView.render(result: result, relationship: relationship)
        }
    }

    private var shareMessage: String {
        "Decode says my \(relationship.label.lowercased()) is \(result.interestScore)% interested 👀"
    }

    private var hero: some View {
        VStack(spacing: 16) {
            ScoreRing(score: result.interestScore)
                .frame(width: 200, height: 200)
            Text(result.verdict)
                .font(.system(size: 28, weight: .heavy, design: .rounded))
                .multilineTextAlignment(.center)
                .foregroundStyle(.white)
            Pill(text: result.vibe, isSelected: true)
            if let shareImage {
                ShareLink(
                    item: Image(uiImage: shareImage),
                    message: Text(shareMessage),
                    preview: SharePreview("My Decode", image: Image(uiImage: shareImage))
                ) {
                    Label("Share to story", systemImage: "camera.filters")
                        .font(.subheadline.weight(.bold))
                }
                .padding(.top, 4)
            }
        }
        .padding(.vertical, 12)
    }

    private var safetyCard: some View {
        Card(title: "Real talk", systemImage: "heart.text.square") {
            Text(result.safetyNote)
                .foregroundStyle(.white)
        }
        .overlay(RoundedRectangle(cornerRadius: 22, style: .continuous).stroke(Theme.danger, lineWidth: 1.5))
    }

    private var translationsCard: some View {
        Card(title: "What they meant", systemImage: "quote.bubble") {
            if result.translations.isEmpty {
                Text("Nothing hidden here. They said what they meant.")
                    .foregroundStyle(.white.opacity(0.7))
            }
            ForEach(result.translations, id: \.self) { translation in
                VStack(alignment: .leading, spacing: 6) {
                    Text("“\(translation.quote)”")
                        .font(.callout.weight(.semibold))
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(Theme.accent2.opacity(0.25), in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                        .foregroundStyle(.white)
                    Text("→ \(translation.meaning)")
                        .font(.callout)
                        .foregroundStyle(.white.opacity(0.85))
                }
                .padding(.vertical, 4)
            }
        }
    }

    private var flagsCard: some View {
        Card(title: "Flags", systemImage: "flag") {
            if result.redFlags.isEmpty && result.greenFlags.isEmpty {
                Text("No flags either way.")
                    .foregroundStyle(.white.opacity(0.7))
            }
            ForEach(result.greenFlags, id: \.self) { flag in
                FlagRow(flag: flag, color: Theme.good, emoji: "🟢")
            }
            ForEach(result.redFlags, id: \.self) { flag in
                FlagRow(flag: flag, color: Theme.danger, emoji: "🚩")
            }
        }
    }

    private var repliesCard: some View {
        Card(title: "What to send back", systemImage: "paperplane") {
            ForEach(result.replies, id: \.self) { reply in
                Button {
                    UIPasteboard.general.string = reply.text
                    copiedReply = reply.text
                } label: {
                    HStack(alignment: .top, spacing: 10) {
                        Text(reply.toneEmoji)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(reply.tone.capitalized)
                                .font(.caption.weight(.bold))
                                .foregroundStyle(.white.opacity(0.55))
                            Text(reply.text)
                                .foregroundStyle(.white)
                                .multilineTextAlignment(.leading)
                        }
                        Spacer()
                        Image(systemName: copiedReply == reply.text ? "checkmark" : "doc.on.doc")
                            .foregroundStyle(copiedReply == reply.text ? Theme.good : .white.opacity(0.5))
                    }
                    .padding(12)
                    .background(Color.white.opacity(0.05), in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                }
                .buttonStyle(.plain)
            }
        }
    }

    private var nextMoveCard: some View {
        Card(title: "Your next move", systemImage: "arrow.forward.circle") {
            Text(result.nextMove)
                .font(.body.weight(.semibold))
                .foregroundStyle(.white)
        }
    }

    /// Free users see a blurred teaser of the premium sections.
    @ViewBuilder
    private func locked<Content: View>(_ content: Content) -> some View {
        if store.isPro {
            content
        } else {
            content
                .blur(radius: 7)
                .allowsHitTesting(false)
                .accessibilityHidden(true)
                .overlay {
                    Button {
                        showPaywall = true
                    } label: {
                        Label("Unlock the full read", systemImage: "lock.fill")
                            .font(.subheadline.weight(.bold))
                            .padding(.horizontal, 18)
                            .padding(.vertical, 12)
                            .background(Theme.gradient, in: Capsule())
                            .foregroundStyle(.white)
                    }
                }
        }
    }
}

private struct FlagRow: View {
    let flag: DecodeResult.Flag
    let color: Color
    let emoji: String

    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            Text(emoji)
            VStack(alignment: .leading, spacing: 2) {
                Text(flag.title)
                    .font(.callout.weight(.bold))
                    .foregroundStyle(color)
                Text(flag.detail)
                    .font(.callout)
                    .foregroundStyle(.white.opacity(0.85))
            }
        }
        .padding(.vertical, 2)
    }
}
