import UIKit

struct DecodeAPI {
    enum APIError: LocalizedError {
        case server(String)
        case offline
        case unreadableImage
        case badResponse

        var errorDescription: String? {
            switch self {
            case .server(let message): return message
            case .offline: return "Couldn't reach Decode. Check your connection and try again."
            case .unreadableImage: return "One of those screenshots couldn't be read. Try picking it again."
            case .badResponse: return "Something went wrong. Try again."
            }
        }
    }

    private struct RequestBody: Encodable {
        struct ImagePayload: Encodable {
            let media_type: String
            let data: String
        }

        let images: [ImagePayload]
        let relationship: String
        let user_side: String
        let question: String?
    }

    private struct ErrorBody: Decodable {
        let error: String
    }

    var baseURL = Config.serverURL
    var session = URLSession.shared

    func decode(
        screenshots: [UIImage],
        relationship: Relationship,
        userSide: UserSide,
        question: String
    ) async throws -> DecodeResult {
        let images = try screenshots.map { image in
            guard let jpeg = image.preparedForUpload() else { throw APIError.unreadableImage }
            return RequestBody.ImagePayload(media_type: "image/jpeg", data: jpeg.base64EncodedString())
        }
        let trimmedQuestion = question.trimmingCharacters(in: .whitespacesAndNewlines)
        let body = RequestBody(
            images: images,
            relationship: relationship.rawValue,
            user_side: userSide.rawValue,
            question: trimmedQuestion.isEmpty ? nil : String(trimmedQuestion.prefix(300))
        )

        var request = URLRequest(url: baseURL.appending(path: "v1/decode"))
        request.httpMethod = "POST"
        request.timeoutInterval = 120
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(Config.appToken, forHTTPHeaderField: "X-Decode-Token")
        request.httpBody = try JSONEncoder().encode(body)

        let data: Data
        let response: URLResponse
        do {
            (data, response) = try await session.data(for: request)
        } catch {
            throw APIError.offline
        }

        guard let http = response as? HTTPURLResponse else { throw APIError.badResponse }
        guard (200..<300).contains(http.statusCode) else {
            if let errorBody = try? JSONDecoder().decode(ErrorBody.self, from: data) {
                throw APIError.server(errorBody.error)
            }
            throw APIError.badResponse
        }

        do {
            return try DecodeResult.decoder.decode(DecodeResult.self, from: data)
        } catch {
            throw APIError.badResponse
        }
    }
}

extension UIImage {
    /// Downscales to the size Claude's vision model works at and re-encodes as JPEG.
    func preparedForUpload(maxDimension: CGFloat = 1568) -> Data? {
        let pixelSize = CGSize(width: size.width * scale, height: size.height * scale)
        let longest = max(pixelSize.width, pixelSize.height)
        guard longest > 0 else { return nil }

        let ratio = min(1, maxDimension / longest)
        let target = CGSize(width: (pixelSize.width * ratio).rounded(), height: (pixelSize.height * ratio).rounded())
        let format = UIGraphicsImageRendererFormat.default()
        format.scale = 1
        let resized = UIGraphicsImageRenderer(size: target, format: format).image { _ in
            draw(in: CGRect(origin: .zero, size: target))
        }
        return resized.jpegData(compressionQuality: 0.8)
    }
}
