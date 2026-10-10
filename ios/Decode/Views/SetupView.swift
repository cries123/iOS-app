import SwiftData
import SwiftUI

/// After picking screenshots: say who it is and which side you're on, then decode.
struct SetupView: View {
    let screenshots: [UIImage]

    @Environment(\.modelContext) private var modelContext
    @Environment(Store.self) private var store
    @Environment(UsageTracker.self) private var usage

    @State private var relationship: Relationship = .crush
    @State private var userSide: UserSide = .right
    @State private var question = ""
    @State private var isDecoding = false
    @State private var errorMessage: String?
    @State private var showPaywall = false
    @State private var finished: SavedDecode?

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 28) {
                thumbnails

                section("Who is this?") {
                    LazyVGrid(columns: [GridItem(.adaptive(minimum: 140), spacing: 10)], spacing: 10) {
                        ForEach(Relationship.allCases) { option in
                            Button {
                                relationship = option
                            } label: {
                                Pill(text: "\(option.emoji) \(option.label)", isSelected: relationship == option)
                                    .frame(maxWidth: .infinity)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }

                section("Which side are your messages on?") {
                    Picker("Your side", selection: $userSide) {
                        ForEach(UserSide.allCases) { side in
                            Text(side.label).tag(side)
                        }
                    }
                    .pickerStyle(.segmented)
                    Text("On iPhone your own texts are usually on the right.")
                        .font(.footnote)
                        .foregroundStyle(.white.opacity(0.5))
                }

                section("Anything specific? (optional)") {
                    TextField("e.g. do they actually like me?", text: $question, axis: .vertical)
                        .lineLimit(1...3)
                        .padding(14)
                        .background(Theme.card, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
                }

                Button {
                    Task { await decode() }
                } label: {
                    Label("Decode it", systemImage: "sparkles")
                }
                .buttonStyle(PrimaryButtonStyle())
                .disabled(isDecoding)
            }
            .padding(20)
        }
        .background(Theme.background.ignoresSafeArea())
        .navigationTitle("Set it up")
        .navigationBarTitleDisplayMode(.inline)
        .navigationBarBackButtonHidden(isDecoding)
        .overlay {
            if isDecoding {
                DecodingView()
                    .transition(.opacity)
            }
        }
        .animation(.easeInOut, value: isDecoding)
        .navigationDestination(item: $finished) { saved in
            SavedResultView(saved: saved)
        }
        .sheet(isPresented: $showPaywall) { PaywallView() }
        .alert(
            "Couldn't decode",
            isPresented: Binding(get: { errorMessage != nil }, set: { if !$0 { errorMessage = nil } })
        ) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(errorMessage ?? "")
        }
    }

    private var thumbnails: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                ForEach(screenshots.indices, id: \.self) { index in
                    Image(uiImage: screenshots[index])
                        .resizable()
                        .scaledToFill()
                        .frame(width: 90, height: 160)
                        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                        .overlay(RoundedRectangle(cornerRadius: 14, style: .continuous).stroke(Theme.cardBorder))
                }
            }
        }
    }

    private func section<Content: View>(_ title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.headline)
                .foregroundStyle(.white)
            content()
        }
    }

    private func decode() async {
        guard store.isPro || usage.remainingFree > 0 else {
            showPaywall = true
            return
        }

        isDecoding = true
        defer { isDecoding = false }

        do {
            let result = try await DecodeAPI().decode(
                screenshots: screenshots,
                relationship: relationship,
                userSide: userSide,
                question: question
            )
            let resultData = try DecodeResult.encoder.encode(result)
            let saved = SavedDecode(relationship: relationship, resultData: resultData)
            modelContext.insert(saved)
            if !store.isPro {
                usage.recordDecode()
            }
            UINotificationFeedbackGenerator().notificationOccurred(.success)
            finished = saved
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

struct DecodingView: View {
    @State private var index = 0

    private let lines = [
        "Reading the subtext…",
        "Checking who double-texted…",
        "Measuring reply times…",
        "Analyzing that 'haha'…",
        "Consulting the group chat…",
        "Overthinking so you don't have to…",
    ]

    var body: some View {
        ZStack {
            Theme.background.opacity(0.97).ignoresSafeArea()
            VStack(spacing: 24) {
                ProgressView()
                    .controlSize(.large)
                    .tint(Theme.accent)
                Text(lines[index])
                    .font(.title3.weight(.bold))
                    .foregroundStyle(.white)
                    .id(index)
                    .transition(.asymmetric(insertion: .move(edge: .bottom).combined(with: .opacity), removal: .opacity))
            }
        }
        .task {
            while !Task.isCancelled {
                try? await Task.sleep(for: .seconds(2.2))
                withAnimation(.easeInOut) {
                    index = (index + 1) % lines.count
                }
            }
        }
    }
}
