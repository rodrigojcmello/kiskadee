import Foundation
import SwiftUI

public indirect enum KiskadeeColorToken: Decodable, Equatable {
    case hex(String)
    case hsla(hue: Double, saturation: Double, lightness: Double, alpha: Double)
    case ref(KiskadeeColorToken)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()

        if let value = try? container.decode(String.self) {
            self = .hex(value)
            return
        }

        if let values = try? container.decode([Double].self) {
            guard values.count == 4 else {
                throw DecodingError.dataCorruptedError(
                    in: container,
                    debugDescription: "Expected HSL color arrays to contain four values."
                )
            }

            self = .hsla(
                hue: values[0],
                saturation: values[1],
                lightness: values[2],
                alpha: values[3]
            )
            return
        }

        if let value = try? container.decode(KiskadeeColorRef.self) {
            self = .ref(value.ref)
            return
        }

        throw DecodingError.dataCorruptedError(
            in: container,
            debugDescription: "Expected a Kiskadee color token."
        )
    }

    public func swiftUIColor() throws -> Color {
        switch self {
        case let .hex(value):
            return try Self.color(hex: value)
        case let .hsla(hue, saturation, lightness, alpha):
            let rgba = Self.rgbaFromHsla(
                hue: hue,
                saturation: saturation / 100,
                lightness: lightness / 100,
                alpha: alpha
            )
            return Color(
                .sRGB,
                red: rgba.red,
                green: rgba.green,
                blue: rgba.blue,
                opacity: rgba.alpha
            )
        case let .ref(token):
            return try token.swiftUIColor()
        }
    }

    private static func color(hex: String) throws -> Color {
        var normalized = hex.trimmingCharacters(in: .whitespacesAndNewlines)
        if normalized.hasPrefix("#") {
            normalized.removeFirst()
        }

        guard normalized.count == 6 || normalized.count == 8 else {
            throw KiskadeeSchemaError.unsupportedColor(hex)
        }

        var rawValue: UInt64 = 0
        guard Scanner(string: normalized).scanHexInt64(&rawValue) else {
            throw KiskadeeSchemaError.unsupportedColor(hex)
        }

        let red: Double
        let green: Double
        let blue: Double
        let alpha: Double

        if normalized.count == 8 {
            red = Double((rawValue & 0xFF00_0000) >> 24) / 255
            green = Double((rawValue & 0x00FF_0000) >> 16) / 255
            blue = Double((rawValue & 0x0000_FF00) >> 8) / 255
            alpha = Double(rawValue & 0x0000_00FF) / 255
        } else {
            red = Double((rawValue & 0xFF_0000) >> 16) / 255
            green = Double((rawValue & 0x00_FF00) >> 8) / 255
            blue = Double(rawValue & 0x00_00FF) / 255
            alpha = 1
        }

        return Color(.sRGB, red: red, green: green, blue: blue, opacity: alpha)
    }

    private static func rgbaFromHsla(
        hue: Double,
        saturation: Double,
        lightness: Double,
        alpha: Double
    ) -> (red: Double, green: Double, blue: Double, alpha: Double) {
        let normalizedHue = ((hue.truncatingRemainder(dividingBy: 360)) + 360)
            .truncatingRemainder(dividingBy: 360) / 360

        guard saturation > 0 else {
            return (lightness, lightness, lightness, alpha)
        }

        let q = lightness < 0.5
            ? lightness * (1 + saturation)
            : lightness + saturation - lightness * saturation
        let p = 2 * lightness - q

        return (
            hueToRgb(p: p, q: q, t: normalizedHue + 1 / 3),
            hueToRgb(p: p, q: q, t: normalizedHue),
            hueToRgb(p: p, q: q, t: normalizedHue - 1 / 3),
            alpha
        )
    }

    private static func hueToRgb(p: Double, q: Double, t: Double) -> Double {
        var t = t
        if t < 0 { t += 1 }
        if t > 1 { t -= 1 }
        if t < 1 / 6 { return p + (q - p) * 6 * t }
        if t < 1 / 2 { return q }
        if t < 2 / 3 { return p + (q - p) * (2 / 3 - t) * 6 }
        return p
    }
}

private struct KiskadeeColorRef: Decodable {
    let ref: KiskadeeColorToken
}
