import Foundation
import SwiftData

/// A past decode, kept on-device only. Screenshots are never saved; just the results.
@Model
final class SavedDecode {
    var createdAt: Date
    var relationshipRaw: String
    var resultData: Data

    /// `resultData` is a `DecodeResult` encoded with `DecodeResult.encoder`.
    init(relationship: Relationship, resultData: Data, createdAt: Date = .now) {
        self.createdAt = createdAt
        self.relationshipRaw = relationship.rawValue
        self.resultData = resultData
    }

    var relationship: Relationship {
        Relationship(rawValue: relationshipRaw) ?? .other
    }

    var result: DecodeResult? {
        try? DecodeResult.decoder.decode(DecodeResult.self, from: resultData)
    }
}
