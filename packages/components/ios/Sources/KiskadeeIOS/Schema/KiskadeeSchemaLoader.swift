import Foundation

public enum KiskadeeSchemaError: Error, LocalizedError, Equatable {
    case missingSwitchComponent
    case missingSwitchVariant(String)
    case missingSwitchMode(String)
    case missingSwitchElement(String)
    case missingPalette(element: String, role: String)
    case missingColor(element: String, role: String, intent: String, emphasis: String)
    case missingScale(element: String, scale: String)
    case unsupportedColor(String)

    public var errorDescription: String? {
        switch self {
        case .missingSwitchComponent:
            return "The schema does not include components.switch."
        case let .missingSwitchVariant(variant):
            return "The schema does not include switch variant '\(variant)'."
        case let .missingSwitchMode(mode):
            return "The schema does not include switch mode '\(mode)'."
        case let .missingSwitchElement(element):
            return "The schema does not include switch element '\(element)'."
        case let .missingPalette(element, role):
            return "Switch element '\(element)' does not include palette role '\(role)'."
        case let .missingColor(element, role, intent, emphasis):
            return "Switch element '\(element)' is missing \(role).\(intent).\(emphasis)."
        case let .missingScale(element, scale):
            return "Switch element '\(element)' is missing scale '\(scale)'."
        case let .unsupportedColor(color):
            return "Unsupported Kiskadee color value '\(color)'."
        }
    }
}

public enum KiskadeeSchemaLoader {
    public static func load(from data: Data) throws -> KiskadeeSchema {
        let decoder = JSONDecoder()
        return try decoder.decode(KiskadeeSchema.self, from: data)
    }

    public static func load(from url: URL) throws -> KiskadeeSchema {
        try load(from: Data(contentsOf: url))
    }
}
