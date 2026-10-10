import SwiftUI

enum Theme {
    static let background = Color(red: 0.05, green: 0.04, blue: 0.09)
    static let card = Color.white.opacity(0.06)
    static let cardBorder = Color.white.opacity(0.08)
    static let accent = Color(red: 1.0, green: 0.27, blue: 0.55)
    static let accent2 = Color(red: 0.55, green: 0.36, blue: 1.0)
    static let danger = Color(red: 1.0, green: 0.36, blue: 0.36)
    static let good = Color(red: 0.3, green: 0.85, blue: 0.55)

    static let gradient = LinearGradient(
        colors: [accent, accent2],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
}
