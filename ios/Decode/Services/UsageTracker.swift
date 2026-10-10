import Foundation
import Observation

/// Counts free decodes per calendar day.
@MainActor
@Observable
final class UsageTracker {
    private static let dayKey = "usage.day"
    private static let countKey = "usage.count"

    private let defaults: UserDefaults
    private(set) var usedToday: Int

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        let isToday = defaults.string(forKey: Self.dayKey) == Self.today()
        self.usedToday = isToday ? defaults.integer(forKey: Self.countKey) : 0
    }

    var remainingFree: Int {
        max(0, Config.freeDecodesPerDay - currentCount())
    }

    func recordDecode() {
        usedToday = currentCount() + 1
        defaults.set(Self.today(), forKey: Self.dayKey)
        defaults.set(usedToday, forKey: Self.countKey)
    }

    /// Resets the count if the day rolled over while the app was open.
    private func currentCount() -> Int {
        defaults.string(forKey: Self.dayKey) == Self.today() ? usedToday : 0
    }

    private static func today() -> String {
        let components = Calendar.current.dateComponents([.year, .month, .day], from: .now)
        return "\(components.year ?? 0)-\(components.month ?? 0)-\(components.day ?? 0)"
    }
}
