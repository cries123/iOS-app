import SwiftUI

struct ScoreRing: View {
    let score: Int
    var lineWidth: CGFloat = 16
    var fontSize: CGFloat = 56
    @State private var progress: Double

    /// Pass `animated: false` when rendering to an image, where animations never run.
    init(score: Int, lineWidth: CGFloat = 16, fontSize: CGFloat = 56, animated: Bool = true) {
        self.score = score
        self.lineWidth = lineWidth
        self.fontSize = fontSize
        _progress = State(initialValue: animated ? 0 : Double(score) / 100)
    }

    var body: some View {
        ZStack {
            Circle()
                .stroke(Color.white.opacity(0.1), lineWidth: lineWidth)
            Circle()
                .trim(from: 0, to: progress)
                .stroke(
                    AngularGradient(colors: [Theme.accent2, Theme.accent, Theme.accent2], center: .center),
                    style: StrokeStyle(lineWidth: lineWidth, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))
            VStack(spacing: 0) {
                Text("\(score)")
                    .font(.system(size: fontSize, weight: .black, design: .rounded))
                    .foregroundStyle(.white)
                Text("INTEREST")
                    .font(.system(size: max(9, fontSize * 0.2), weight: .bold, design: .rounded))
                    .tracking(1.5)
                    .foregroundStyle(.white.opacity(0.6))
            }
        }
        .padding(lineWidth / 2)
        .onAppear {
            withAnimation(.spring(duration: 1.2, bounce: 0.2).delay(0.15)) {
                progress = Double(score) / 100
            }
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Interest score \(score) out of 100")
    }
}

struct Card<Content: View>: View {
    var title: String?
    var systemImage: String?
    @ViewBuilder var content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            if let title {
                Label {
                    Text(title)
                } icon: {
                    if let systemImage { Image(systemName: systemImage) }
                }
                .font(.subheadline.weight(.bold))
                .foregroundStyle(.white.opacity(0.7))
                .textCase(.uppercase)
            }
            content
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(18)
        .background(Theme.card, in: RoundedRectangle(cornerRadius: 22, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 22, style: .continuous).stroke(Theme.cardBorder))
    }
}

struct Pill: View {
    let text: String
    var isSelected = false

    var body: some View {
        Text(text)
            .font(.subheadline.weight(.semibold))
            .padding(.horizontal, 14)
            .padding(.vertical, 8)
            .background {
                Capsule().fill(isSelected ? AnyShapeStyle(Theme.gradient) : AnyShapeStyle(Theme.card))
            }
            .overlay(Capsule().stroke(isSelected ? Color.clear : Theme.cardBorder))
            .foregroundStyle(.white)
    }
}

struct EffortBar: View {
    let you: Int
    let them: Int

    var body: some View {
        VStack(spacing: 8) {
            GeometryReader { geo in
                HStack(spacing: 4) {
                    Capsule()
                        .fill(Theme.accent)
                        .frame(width: max(10, (geo.size.width - 4) * CGFloat(you) / 100))
                    Capsule()
                        .fill(Theme.accent2)
                }
            }
            .frame(height: 14)
            HStack {
                Text("You \(you)%").foregroundStyle(Theme.accent)
                Spacer()
                Text("Them \(them)%").foregroundStyle(Theme.accent2)
            }
            .font(.footnote.weight(.bold))
        }
    }
}

struct PrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.headline)
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 18)
            .background(Theme.gradient, in: Capsule())
            .scaleEffect(configuration.isPressed ? 0.97 : 1)
            .opacity(configuration.isPressed ? 0.9 : 1)
            .animation(.easeOut(duration: 0.15), value: configuration.isPressed)
    }
}
