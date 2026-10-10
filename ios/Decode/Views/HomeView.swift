import PhotosUI
import SwiftData
import SwiftUI

struct HomeView: View {
    @Environment(Store.self) private var store
    @Environment(UsageTracker.self) private var usage
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \SavedDecode.createdAt, order: .reverse) private var history: [SavedDecode]

    @State private var pickerItems: [PhotosPickerItem] = []
    @State private var screenshots: [UIImage] = []
    @State private var isLoadingPhotos = false
    @State private var showSetup = false
    @State private var showPaywall = false
    @State private var loadError: String?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 28) {
                    header
                    pickerCard
                    if !history.isEmpty {
                        historySection
                    }
                }
                .padding(20)
            }
            .background(Theme.background.ignoresSafeArea())
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) { proBadge }
            }
            .navigationDestination(isPresented: $showSetup) {
                SetupView(screenshots: screenshots)
            }
            .navigationDestination(for: SavedDecode.self) { saved in
                SavedResultView(saved: saved)
            }
            .sheet(isPresented: $showPaywall) { PaywallView() }
            .onChange(of: pickerItems) { _, items in
                guard !items.isEmpty else { return }
                Task { await loadScreenshots(items) }
            }
            .alert(
                "Couldn't load screenshots",
                isPresented: Binding(get: { loadError != nil }, set: { if !$0 { loadError = nil } })
            ) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(loadError ?? "")
            }
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Decode")
                .font(.system(size: 44, weight: .black, design: .rounded))
                .foregroundStyle(Theme.gradient)
            Text("Drop the screenshots. We'll tell you what they really meant.")
                .font(.headline)
                .foregroundStyle(.white.opacity(0.7))
        }
        .padding(.top, 8)
    }

    private var pickerCard: some View {
        PhotosPicker(
            selection: $pickerItems,
            maxSelectionCount: Config.maxScreenshots,
            selectionBehavior: .ordered,
            matching: .images
        ) {
            VStack(spacing: 14) {
                if isLoadingPhotos {
                    ProgressView().controlSize(.large)
                } else {
                    Image(systemName: "text.bubble.fill")
                        .font(.system(size: 44))
                        .foregroundStyle(Theme.gradient)
                }
                Text("Pick chat screenshots")
                    .font(.title3.weight(.bold))
                    .foregroundStyle(.white)
                Text(freeLabel)
                    .font(.footnote.weight(.semibold))
                    .foregroundStyle(.white.opacity(0.55))
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 40)
            .background(Theme.card, in: RoundedRectangle(cornerRadius: 28, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 28, style: .continuous)
                    .strokeBorder(Theme.gradient, style: StrokeStyle(lineWidth: 2, dash: [8, 6]))
            )
        }
        .disabled(isLoadingPhotos)
    }

    private var freeLabel: String {
        if store.isPro { return "Up to \(Config.maxScreenshots) at once · Pro" }
        let left = usage.remainingFree
        return left == 1 ? "1 free decode left today" : "\(left) free decodes left today"
    }

    private var historySection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Past decodes")
                .font(.title3.weight(.bold))
                .foregroundStyle(.white)
            ForEach(history) { saved in
                NavigationLink(value: saved) {
                    HistoryRow(saved: saved)
                }
                .buttonStyle(.plain)
                .contextMenu {
                    Button("Delete", systemImage: "trash", role: .destructive) {
                        modelContext.delete(saved)
                    }
                }
            }
        }
    }

    @ViewBuilder
    private var proBadge: some View {
        if store.isPro {
            Text("PRO")
                .font(.caption.weight(.black))
                .padding(.horizontal, 10)
                .padding(.vertical, 5)
                .background(Theme.gradient, in: Capsule())
        } else {
            Button("Go Pro") { showPaywall = true }
                .font(.subheadline.weight(.bold))
        }
    }

    private func loadScreenshots(_ items: [PhotosPickerItem]) async {
        isLoadingPhotos = true
        defer {
            isLoadingPhotos = false
            pickerItems = []
        }

        var images: [UIImage] = []
        for item in items {
            guard let data = try? await item.loadTransferable(type: Data.self),
                  let image = UIImage(data: data) else {
                loadError = "One of those screenshots couldn't be opened. Try again."
                return
            }
            images.append(image)
        }
        screenshots = images
        showSetup = true
    }
}

private struct HistoryRow: View {
    let saved: SavedDecode

    var body: some View {
        HStack(spacing: 14) {
            if let result = saved.result {
                ScoreRing(score: result.interestScore, lineWidth: 5, fontSize: 18, animated: false)
                    .frame(width: 56, height: 56)
                VStack(alignment: .leading, spacing: 4) {
                    Text(result.verdict)
                        .font(.headline)
                        .foregroundStyle(.white)
                        .lineLimit(2)
                        .multilineTextAlignment(.leading)
                    Text("\(saved.relationship.emoji) \(saved.relationship.label) · \(saved.createdAt.formatted(.relative(presentation: .named)))")
                        .font(.footnote)
                        .foregroundStyle(.white.opacity(0.55))
                }
            } else {
                Text("This decode couldn't be opened.")
                    .foregroundStyle(.white.opacity(0.55))
            }
            Spacer()
            Image(systemName: "chevron.right")
                .foregroundStyle(.white.opacity(0.3))
        }
        .padding(14)
        .background(Theme.card, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
    }
}
