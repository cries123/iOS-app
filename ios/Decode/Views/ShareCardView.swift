import SwiftUI

/// The 9:16 card people post to their stories. Rendered to an image, never shown directly.
struct ShareCardView: View {
    let result: DecodeResult
    let relationship: Relationship

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color(red: 0.14, green: 0.05, blue: 0.22), Theme.background],
                startPoint: .top,
                endPoint: .bottom
            )
            Circle()
                .fill(Theme.accent.opacity(0.4))
                .frame(width: 300, height: 300)
                .blur(radius: 90)
                .offset(x: -110, y: -230)
            Circle()
                .fill(Theme.accent2.opacity(0.4))
                .frame(width: 300, height: 300)
                .blur(radius: 90)
                .offset(x: 120, y: 230)

            VStack(spacing: 26) {
                Text("\(relationship.emoji) my \(relationship.label.lowercased())")
                    .font(.system(size: 20, weight: .bold, design: .rounded))
                    .foregroundStyle(.white.opacity(0.8))

                ScoreRing(score: result.interestScore, lineWidth: 18, fontSize: 64, animated: false)
                    .frame(width: 230, height: 230)

                Text(result.verdict)
                    .font(.system(size: 30, weight: .heavy, design: .rounded))
                    .multilineTextAlignment(.center)
                    .foregroundStyle(.white)
                    .minimumScaleFactor(0.6)
                    .lineLimit(3)

                Pill(text: result.vibe, isSelected: true)

                Spacer()

                Text("decoded with **Decode**")
                    .font(.system(size: 15, weight: .medium, design: .rounded))
                    .foregroundStyle(.white.opacity(0.7))
            }
            .padding(.top, 70)
            .padding(.bottom, 40)
            .padding(.horizontal, 30)
        }
        .frame(width: 360, height: 640)
        .environment(\.colorScheme, .dark)
    }

    @MainActor
    static func render(result: DecodeResult, relationship: Relationship) -> UIImage? {
        let renderer = ImageRenderer(content: ShareCardView(result: result, relationship: relationship))
        renderer.scale = 3 // 1080 x 1920, story size
        return renderer.uiImage
    }
}

#Preview {
    ShareCardView(
        result: DecodeResult(
            isConversation: true,
            interestScore: 78,
            verdict: "They're shy, not uninterested",
            vibe: "Lowkey invested",
            summary: "",
            effort: .init(you: 45, them: 55),
            redFlags: [],
            greenFlags: [],
            translations: [],
            replies: [],
            nextMove: "",
            safetyNote: ""
        ),
        relationship: .crush
    )
}
