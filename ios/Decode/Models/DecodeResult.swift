import Foundation

/// The server's analysis of a conversation. Mirrors `DecodeResultSchema` in `server/src/schema.ts`.
struct DecodeResult: Codable, Hashable {
    struct Effort: Codable, Hashable {
        var you: Int
        var them: Int
    }

    struct Flag: Codable, Hashable {
        var title: String
        var detail: String
    }

    struct Translation: Codable, Hashable {
        var quote: String
        var meaning: String
    }

    struct Reply: Codable, Hashable {
        var tone: String
        var text: String

        var toneEmoji: String {
            switch tone {
            case "chill": return "😌"
            case "flirty": return "😏"
            case "bold": return "🔥"
            case "funny": return "😂"
            case "honest": return "🫶"
            default: return "💬"
            }
        }
    }

    var isConversation: Bool
    var interestScore: Int
    var verdict: String
    var vibe: String
    var summary: String
    var effort: Effort
    var redFlags: [Flag]
    var greenFlags: [Flag]
    var translations: [Translation]
    var replies: [Reply]
    var nextMove: String
    var safetyNote: String

    static let decoder: JSONDecoder = {
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        return decoder
    }()

    static let encoder: JSONEncoder = {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        return encoder
    }()
}

enum Relationship: String, CaseIterable, Identifiable, Codable {
    case crush
    case talkingStage = "talking_stage"
    case situationship
    case partner
    case ex
    case friend
    case groupChat = "group_chat"
    case other

    var id: String { rawValue }

    var label: String {
        switch self {
        case .crush: return "Crush"
        case .talkingStage: return "Talking stage"
        case .situationship: return "Situationship"
        case .partner: return "Partner"
        case .ex: return "Ex"
        case .friend: return "Friend"
        case .groupChat: return "Group chat"
        case .other: return "Other"
        }
    }

    var emoji: String {
        switch self {
        case .crush: return "🥺"
        case .talkingStage: return "👀"
        case .situationship: return "🌀"
        case .partner: return "💞"
        case .ex: return "💀"
        case .friend: return "🫂"
        case .groupChat: return "💬"
        case .other: return "🤔"
        }
    }
}

enum UserSide: String, CaseIterable, Identifiable {
    case right
    case left

    var id: String { rawValue }

    var label: String {
        switch self {
        case .right: return "Right"
        case .left: return "Left"
        }
    }
}
