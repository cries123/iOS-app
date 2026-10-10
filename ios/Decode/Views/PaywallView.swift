import StoreKit
import SwiftUI

struct PaywallView: View {
    @Environment(Store.self) private var store
    @Environment(\.dismiss) private var dismiss

    @State private var selectedID: Product.ID?
    @State private var isPurchasing = false
    @State private var errorMessage: String?

    private let features: [(icon: String, text: String)] = [
        ("quote.bubble.fill", "What every message actually meant"),
        ("flag.fill", "Red flags and green flags"),
        ("paperplane.fill", "Replies you can copy and send"),
        ("infinity", "Unlimited decodes"),
    ]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 28) {
                    VStack(spacing: 10) {
                        Text("Decode Pro")
                            .font(.system(size: 40, weight: .black, design: .rounded))
                            .foregroundStyle(Theme.gradient)
                        Text("Stop overthinking. Know what they meant.")
                            .font(.headline)
                            .foregroundStyle(.white.opacity(0.75))
                            .multilineTextAlignment(.center)
                    }
                    .padding(.top, 12)

                    VStack(alignment: .leading, spacing: 16) {
                        ForEach(features.indices, id: \.self) { index in
                            let feature = features[index]
                            Label {
                                Text(feature.text).foregroundStyle(.white)
                            } icon: {
                                Image(systemName: feature.icon).foregroundStyle(Theme.accent)
                            }
                            .font(.headline)
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)

                    productList

                    Button {
                        Task { await purchaseSelected() }
                    } label: {
                        if isPurchasing {
                            ProgressView().tint(.white)
                        } else {
                            Text("Continue")
                        }
                    }
                    .buttonStyle(PrimaryButtonStyle())
                    .disabled(selectedProduct == nil || isPurchasing)

                    VStack(spacing: 10) {
                        Text("Cancel anytime in Settings. Subscriptions renew automatically until cancelled.")
                            .font(.caption)
                            .foregroundStyle(.white.opacity(0.5))
                            .multilineTextAlignment(.center)
                        HStack(spacing: 18) {
                            Button("Restore") { Task { await store.restore() } }
                            Link("Terms", destination: Config.termsURL)
                            Link("Privacy", destination: Config.privacyURL)
                        }
                        .font(.footnote.weight(.semibold))
                        .foregroundStyle(.white.opacity(0.7))
                    }
                }
                .padding(24)
            }
            .background(Theme.background.ignoresSafeArea())
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "xmark")
                            .foregroundStyle(.white.opacity(0.6))
                    }
                    .accessibilityLabel("Close")
                }
            }
        }
        .onChange(of: store.isPro) { _, isPro in
            if isPro { dismiss() }
        }
        .alert(
            "Purchase failed",
            isPresented: Binding(get: { errorMessage != nil }, set: { if !$0 { errorMessage = nil } })
        ) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(errorMessage ?? "")
        }
    }

    /// Defaults to the most expensive plan (yearly), which is the best value per week.
    private var selectedProduct: Product? {
        store.products.first { $0.id == selectedID } ?? store.products.last
    }

    @ViewBuilder
    private var productList: some View {
        if store.products.isEmpty {
            if store.hasLoadedProducts {
                Text("Plans aren't available right now. Try again later.")
                    .font(.callout)
                    .foregroundStyle(.white.opacity(0.6))
            } else {
                ProgressView()
            }
        } else {
            VStack(spacing: 12) {
                ForEach(store.products) { product in
                    ProductRow(
                        product: product,
                        isSelected: product.id == selectedProduct?.id,
                        isBestValue: product.id == store.products.last?.id && store.products.count > 1
                    )
                    .onTapGesture { selectedID = product.id }
                }
            }
        }
    }

    private func purchaseSelected() async {
        guard let product = selectedProduct else { return }
        isPurchasing = true
        defer { isPurchasing = false }
        do {
            _ = try await store.purchase(product)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

private struct ProductRow: View {
    let product: Product
    let isSelected: Bool
    let isBestValue: Bool

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 8) {
                    Text(product.displayName)
                        .font(.headline)
                        .foregroundStyle(.white)
                    if isBestValue {
                        Text("BEST VALUE")
                            .font(.caption2.weight(.black))
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(Theme.gradient, in: Capsule())
                            .foregroundStyle(.white)
                    }
                }
                if product.subscription?.subscriptionPeriod.unit == .year {
                    Text("Just \((product.price / 52).formatted(product.priceFormatStyle)) per week")
                        .font(.footnote)
                        .foregroundStyle(.white.opacity(0.6))
                }
            }
            Spacer()
            Text("\(product.displayPrice)/\(product.periodLabel)")
                .font(.headline)
                .foregroundStyle(.white)
        }
        .padding(18)
        .background(Theme.card, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .stroke(isSelected ? AnyShapeStyle(Theme.gradient) : AnyShapeStyle(Theme.cardBorder), lineWidth: isSelected ? 2.5 : 1)
        )
        .contentShape(Rectangle())
    }
}
