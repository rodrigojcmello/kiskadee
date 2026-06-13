import Foundation
import SwiftUI

public enum KiskadeeThemeMode: String, Equatable {
    case light
    case dark
}

public enum KiskadeeEmphasis: String, Equatable {
    case high
    case medium
    case low
    case lowest

    var schemaKey: String {
        switch self {
        case .high:
            return "high"
        case .medium:
            return "medium"
        case .low:
            return "low"
        case .lowest:
            return "lowest"
        }
    }
}

public struct KiskadeeTheme: Equatable {
    public let schema: KiskadeeSchema
    public let segment: String
    public let mode: KiskadeeThemeMode
    public let scale: String
    public let intent: String
    public let emphasis: KiskadeeEmphasis

    public init(
        schema: KiskadeeSchema,
        segment: String = "default",
        mode: KiskadeeThemeMode = .light,
        scale: String = "s:md:1",
        intent: String = "neutral",
        emphasis: KiskadeeEmphasis = .medium
    ) {
        self.schema = schema
        self.segment = segment
        self.mode = mode
        self.scale = scale
        self.intent = intent
        self.emphasis = emphasis
    }
}

enum KiskadeeInteractionState: String {
    case rest
    case pressed
    case disabled
}
