import Observation
import StoreKit

/// Loads the Pro subscriptions and tracks whether the user has an active one.
@MainActor
@Observable
final class Store {
    private(set) var products: [Product] = []
    private(set) var isPro = false
    private(set) var hasLoadedProducts = false

    private var updatesTask: Task<Void, Never>?

    func start() async {
        if updatesTask == nil {
            // Renewals, refunds and purchases made on other devices arrive here.
            updatesTask = Task { [weak self] in
                for await update in Transaction.updates {
                    if case .verified(let transaction) = update {
                        await transaction.finish()
                    }
                    await self?.refreshEntitlements()
                }
            }
        }
        await loadProducts()
        await refreshEntitlements()
    }

    func loadProducts() async {
        do {
            products = try await Product.products(for: Config.proProductIDs).sorted { $0.price < $1.price }
        } catch {
            products = []
        }
        hasLoadedProducts = true
    }

    /// Returns true if the purchase completed.
    func purchase(_ product: Product) async throws -> Bool {
        let result = try await product.purchase()
        switch result {
        case .success(.verified(let transaction)):
            await transaction.finish()
            await refreshEntitlements()
            return true
        case .success(.unverified):
            return false
        case .userCancelled, .pending:
            return false
        @unknown default:
            return false
        }
    }

    func restore() async {
        try? await AppStore.sync()
        await refreshEntitlements()
    }

    func refreshEntitlements() async {
        var active = false
        for await entitlement in Transaction.currentEntitlements {
            if case .verified(let transaction) = entitlement,
               Config.proProductIDs.contains(transaction.productID),
               transaction.revocationDate == nil {
                active = true
            }
        }
        isPro = active
    }
}

extension Product {
    var periodLabel: String {
        guard let period = subscription?.subscriptionPeriod else { return "" }
        switch period.unit {
        case .day: return "day"
        case .week: return "week"
        case .month: return "month"
        case .year: return "year"
        @unknown default: return ""
        }
    }
}
