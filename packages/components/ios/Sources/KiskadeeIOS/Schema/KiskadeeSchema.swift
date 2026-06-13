import Foundation

public struct KiskadeeSchema: Decodable, Equatable {
    public let name: String
    public let prefix: String?
    public let version: [Int]?
    public let author: String?
    public let global: KiskadeeGlobalSchema?
    public let themeTokens: KiskadeeThemeTokensSchema?
    public let components: KiskadeeComponentsSchema
}

public struct KiskadeeGlobalSchema: Decodable, Equatable {
    public let radius: String?
    public let fonts: KiskadeeFontsSchema?
    public let effects: KiskadeeActivationFeedbackEffectsSchema?
}

public struct KiskadeeFontsSchema: Decodable, Equatable {
    public let body: [String]?
    public let heading: [String]?
}

public struct KiskadeeThemeTokensSchema: Decodable, Equatable {
    public let palettes: [String: [String: KiskadeeThemeTokenPaletteSchema]]?
}

public struct KiskadeeThemeTokenPaletteSchema: Decodable, Equatable {
    public let effects: KiskadeeThemeTokenEffectsSchema?
}

public struct KiskadeeThemeTokenEffectsSchema: Decodable, Equatable {
    public let activationFeedback: KiskadeeActivationFeedbackToneSetSchema?
}

public struct KiskadeeActivationFeedbackToneSetSchema: Decodable, Equatable {
    public let tone: [String: KiskadeeActivationFeedbackToneSchema]
}

public struct KiskadeeActivationFeedbackToneSchema: Decodable, Equatable {
    public let color: KiskadeeColorToken
    public let opacity: Double
}

public struct KiskadeeComponentsSchema: Decodable, Equatable {
    public let `switch`: KiskadeeSwitchComponentSchema?
}

public struct KiskadeeSwitchComponentSchema: Decodable, Equatable {
    public let effects: KiskadeeActivationFeedbackEffectsSchema?
    public let options: KiskadeeSwitchOptionsSchema?
    public let variants: [String: KiskadeeSwitchVariantSchema]
}

public struct KiskadeeActivationFeedbackEffectsSchema: Decodable, Equatable {
    public let activationFeedback: KiskadeeActivationFeedbackEffectSchema?
}

public struct KiskadeeActivationFeedbackEffectSchema: Decodable, Equatable {
    public let profile: String?
    public let origin: String?
    public let visual: KiskadeeActivationFeedbackVisualSchema?
    public let profiles: [String: KiskadeeActivationFeedbackProfileSchema]?
}

public struct KiskadeeActivationFeedbackVisualSchema: Decodable, Equatable {
    public let layer: String?
    public let paint: String?
    public let tone: KiskadeeActivationFeedbackToneSelectionSchema?
}

public struct KiskadeeActivationFeedbackToneSelectionSchema: Decodable, Equatable {
    public let defaultTone: String?
    public let byEmphasis: [String: String]?

    private enum CodingKeys: String, CodingKey {
        case defaultTone = "default"
        case byEmphasis
    }
}

public struct KiskadeeActivationFeedbackProfileSchema: Decodable, Equatable {
    public let size: KiskadeeJSONValue?
}

public struct KiskadeeSwitchOptionsSchema: Decodable, Equatable {
    public let variant: String?
    public let radius: String?
}

public struct KiskadeeSwitchVariantSchema: Decodable, Equatable {
    public let options: KiskadeeSwitchVariantOptionsSchema?
    public let modes: [String: KiskadeeSwitchModeSchema]
}

public struct KiskadeeSwitchVariantOptionsSchema: Decodable, Equatable {
    public let mode: String?
}

public struct KiskadeeSwitchModeSchema: Decodable, Equatable {
    public let elements: [String: KiskadeeElementSchema]
}

public struct KiskadeeElementSchema: Decodable, Equatable {
    public let name: String
    public let scales: [String: KiskadeeJSONValue]?
    public let effects: [String: KiskadeeJSONValue]?
    public let palettes: [String: [String: KiskadeeElementPaletteSchema]]?
}

public struct KiskadeeElementPaletteSchema: Decodable, Equatable {
    public let boxColor: KiskadeeColorRoleSchema?
    public let borderColor: KiskadeeColorRoleSchema?
    public let textColor: KiskadeeColorRoleSchema?
}

public typealias KiskadeeColorRoleSchema = [String: [String: KiskadeeColorStateSet]]

public struct KiskadeeColorStateSet: Decodable, Equatable {
    public let rest: KiskadeeColorToken?
    public let hover: KiskadeeColorToken?
    public let focus: KiskadeeColorToken?
    public let pressed: KiskadeeColorToken?
    public let disabled: KiskadeeColorToken?
    public let selected: KiskadeeSelectedColorStateSet?
}

public struct KiskadeeSelectedColorStateSet: Decodable, Equatable {
    public let rest: KiskadeeColorToken?
    public let hover: KiskadeeColorToken?
    public let focus: KiskadeeColorToken?
    public let pressed: KiskadeeColorToken?
    public let disabled: KiskadeeColorToken?
}
