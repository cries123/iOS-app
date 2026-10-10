import SwiftUI

struct OnboardingView: View {
    var onContinue: () -> Void

    private let steps: [(emoji: String, text: String)] = [
        ("📸", "Screenshot the chat"),
        ("🧠", "Decode reads between the lines"),
        ("👀", "Find out what they actually meant"),
    ]

    var body: some View {
        ZStack {
            Theme.background.ignoresSafeArea()
            Circle()
                .fill(Theme.accent.opacity(0.25))
                .blur(radius: 90)
                .offset(x: -120, y: -260)
            Circle()
                .fill(Theme.accent2.opacity(0.25))
                .blur(radius: 90)
                .offset(x: 140, y: 220)

            VStack(alignment: .leading, spacing: 32) {
                Spacer()
                VStack(alignment: .leading, spacing: 10) {
                    Text("Decode")
                        .font(.system(size: 56, weight: .black, design: .rounded))
                        .foregroundStyle(Theme.gradient)
                    Text("What did they *actually* mean?")
                        .font(.title2.weight(.semibold))
                        .foregroundStyle(.white)
                }

                VStack(alignment: .leading, spacing: 18) {
                    ForEach(steps.indices, id: \.self) { index in
                        let step = steps[index]
                        HStack(spacing: 14) {
                            Text(step.emoji).font(.title)
                            Text(step.text).font(.headline).foregroundStyle(.white.opacity(0.9))
                        }
                    }
                }

                Spacer()

                VStack(spacing: 14) {
                    Button("I'm 13 or older. Let's go", action: onContinue)
                        .buttonStyle(PrimaryButtonStyle())
                    Text("Screenshots are analyzed by AI and never saved on Decode's servers. Results are for fun, not a substitute for actually talking to people.")
                        .font(.caption)
                        .foregroundStyle(.white.opacity(0.5))
                        .multilineTextAlignment(.center)
                }
            }
            .padding(24)
        }
    }
}

#Preview {
    OnboardingView {}
}
