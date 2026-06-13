import Foundation

public struct KiskadeeSchema: Decodable, Equatable {
    public let name: String
    public let prefix: String?
    public let version: [Int]?
    public let author: String?
    public let global: KiskadeeGlobalSchema?
    public let components: KiskadeeComponentsSchema
}

public struct KiskadeeGlobalSchema: Decodable, Equatable {
    public let radius: String?
    public let fonts: KiskadeeFontsSchema?
}

public struct KiskadeeFontsSchema: Decodable, Equatable {
    public let body: [String]?
    public let heading: [String]?
}

public struct KiskadeeComponentsSchema: Decodable, Equatable {
    public let `switch`: KiskadeeSwitchComponentSchema?
}

public struct KiskadeeSwitchComponentSchema: Decodable, Equatable {
    public let options: KiskadeeSwitchOptionsSchema?
    public let variants: [String: KiskadeeSwitchVariantSchema]
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
