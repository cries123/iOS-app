import SwiftData
import SwiftUI

@main
struct DecodeApp: App {
    @State private var store = Store()
    @State private var usage = UsageTracker()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(store)
                .environment(usage)
                .preferredColorScheme(.dark)
                .tint(Theme.accent)
                .task { await store.start() }
        }
        .modelContainer(for: SavedDecode.self)
    }
}

struct RootView: View {
    @AppStorage("hasOnboarded") private var hasOnboarded = false

    var body: some View {
        if hasOnboarded {
            HomeView()
        } else {
            OnboardingView { hasOnboarded = true }
        }
    }
}
