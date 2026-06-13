import Foundation
import SwiftUI

struct KiskadeeSwitchResolvedStyle {
    let trackWidth: CGFloat
    let trackHeight: CGFloat
    let trackRadius: CGFloat
    let trackBorderWidth: CGFloat
    let trackPaddingTop: CGFloat
    let trackPaddingRight: CGFloat
    let trackPaddingBottom: CGFloat
    let trackPaddingLeft: CGFloat
    let trackColor: Color
    let trackBorderColor: Color
    let thumbWidth: CGFloat
    let thumbHeight: CGFloat
    let thumbRestWidth: CGFloat
    let thumbRestHeight: CGFloat
    let thumbRadius: CGFloat
    let thumbColor: Color
    let labelColor: Color?
    let labelTextSize: CGFloat?
    let labelLineHeight: CGFloat?
    let labelMarginLeft: CGFloat
    let labelMarginRight: CGFloat
    let iconColor: Color?
    let iconWidth: CGFloat?
    let iconHeight: CGFloat?
    let activationFeedbackColor: Color?
    let activationFeedbackOpacity: Double
    let activationFeedbackSize: CGFloat
}

enum KiskadeeSwitchResolver {
    static func resolve(
        theme: KiskadeeTheme,
        isOn: Bool,
        isPressed: Bool,
        isDisabled: Bool
    ) throws -> KiskadeeSwitchResolvedStyle {
        let elements = try switchElements(theme: theme)
        let state: KiskadeeInteractionState = isDisabled ? .disabled : isPressed ? .pressed : .rest
        let radiusMode = switchRadiusMode(theme: theme)

        let track = try element("e2", in: elements)
        let thumb = try element("e3", in: elements)
        let label = elements["e4"]
        let icon = elements["e6"]
        let activationFeedback = resolveActivationFeedback(theme: theme)

        return KiskadeeSwitchResolvedStyle(
            trackWidth: try numberScale(track, "boxWidth", theme: theme, elementName: "e2"),
            trackHeight: try numberScale(track, "boxHeight", theme: theme, elementName: "e2"),
            trackRadius: try radiusScale(track, theme: theme, radiusMode: radiusMode, elementName: "e2"),
            trackBorderWidth: try numberScale(track, "borderWidth", theme: theme, elementName: "e2"),
            trackPaddingTop: try numberScale(track, "paddingTop", theme: theme, elementName: "e2"),
            trackPaddingRight: try numberScale(track, "paddingRight", theme: theme, elementName: "e2"),
            trackPaddingBottom: try numberScale(track, "paddingBottom", theme: theme, elementName: "e2"),
            trackPaddingLeft: try numberScale(track, "paddingLeft", theme: theme, elementName: "e2"),
            trackColor: try color(
                track,
                role: "boxColor",
                theme: theme,
                elementName: "e2",
                selected: isOn,
                state: state
            ),
            trackBorderColor: try color(
                track,
                role: "borderColor",
                theme: theme,
                elementName: "e2",
                selected: isOn,
                state: state
            ),
            thumbWidth: try numberScale(thumb, "boxWidth", theme: theme, elementName: "e3"),
            thumbHeight: try numberScale(thumb, "boxHeight", theme: theme, elementName: "e3"),
            thumbRestWidth: thumbShrinkScale(
                thumb,
                "boxWidth",
                theme: theme,
                fallback: try numberScale(thumb, "boxWidth", theme: theme, elementName: "e3")
            ),
            thumbRestHeight: thumbShrinkScale(
                thumb,
                "boxHeight",
                theme: theme,
                fallback: try numberScale(thumb, "boxHeight", theme: theme, elementName: "e3")
            ),
            thumbRadius: try radiusScale(thumb, theme: theme, radiusMode: radiusMode, elementName: "e3"),
            thumbColor: try color(
                thumb,
                role: "boxColor",
                theme: theme,
                elementName: "e3",
                selected: isOn,
                state: state
            ),
            labelColor: try label.map {
                try color(
                    $0,
                    role: "textColor",
                    theme: theme,
                    elementName: "e4",
                    selected: false,
                    state: state
                )
            },
            labelTextSize: try label.map {
                try numberScale($0, "textSize", theme: theme, elementName: "e4")
            },
            labelLineHeight: try label.map {
                try numberScale($0, "textHeight", theme: theme, elementName: "e4")
            },
            labelMarginLeft: label.flatMap {
                try? numberScale($0, "marginLeft", theme: theme, elementName: "e4")
            } ?? 0,
            labelMarginRight: label.flatMap {
                try? numberScale($0, "marginRight", theme: theme, elementName: "e4")
            } ?? 0,
            iconColor: try icon.map {
                try color(
                    $0,
                    role: "textColor",
                    theme: theme,
                    elementName: "e6",
                    selected: isOn,
                    state: state
                )
            },
            iconWidth: try icon.map {
                try numberScale($0, "boxWidth", theme: theme, elementName: "e6")
            },
            iconHeight: try icon.map {
                try numberScale($0, "boxHeight", theme: theme, elementName: "e6")
            },
            activationFeedbackColor: activationFeedback.color,
            activationFeedbackOpacity: activationFeedback.opacity,
            activationFeedbackSize: activationFeedback.size
        )
    }

    private static func switchElements(theme: KiskadeeTheme) throws -> [String: KiskadeeElementSchema] {
        guard let switchSchema = theme.schema.components.switch else {
            throw KiskadeeSchemaError.missingSwitchComponent
        }

        let variantName = switchSchema.options?.variant ?? "standard"
        guard let variant = switchSchema.variants[variantName] else {
            throw KiskadeeSchemaError.missingSwitchVariant(variantName)
        }

        let modeName = variant.options?.mode ?? "base"
        guard let mode = variant.modes[modeName] else {
            throw KiskadeeSchemaError.missingSwitchMode(modeName)
        }

        return mode.elements
    }

    private static func switchRadiusMode(theme: KiskadeeTheme) -> String {
        theme.schema.components.switch?.options?.radius
            ?? theme.schema.global?.radius
            ?? "pill"
    }

    private static func element(
        _ name: String,
        in elements: [String: KiskadeeElementSchema]
    ) throws -> KiskadeeElementSchema {
        guard let element = elements[name] else {
            throw KiskadeeSchemaError.missingSwitchElement(name)
        }

        return element
    }

    private static func color(
        _ element: KiskadeeElementSchema,
        role: String,
        theme: KiskadeeTheme,
        elementName: String,
        selected: Bool,
        state: KiskadeeInteractionState
    ) throws -> Color {
        guard
            let palette = element.palettes?[theme.segment]?[theme.mode.rawValue],
            let roleSchema = colorRole(role, in: palette)
        else {
            throw KiskadeeSchemaError.missingPalette(element: elementName, role: role)
        }

        let byIntent = roleSchema[theme.intent] ?? roleSchema["neutral"] ?? roleSchema.values.first
        guard let states = byIntent?[theme.emphasis.schemaKey] ?? byIntent?["medium"] ?? byIntent?.values.first else {
            throw KiskadeeSchemaError.missingColor(
                element: elementName,
                role: role,
                intent: theme.intent,
                emphasis: theme.emphasis.schemaKey
            )
        }

        let token = resolveColorToken(states: states, selected: selected, state: state)
        guard let token else {
            throw KiskadeeSchemaError.missingColor(
                element: elementName,
                role: role,
                intent: theme.intent,
                emphasis: theme.emphasis.schemaKey
            )
        }

        return try token.swiftUIColor()
    }

    private static func colorRole(
        _ role: String,
        in palette: KiskadeeElementPaletteSchema
    ) -> KiskadeeColorRoleSchema? {
        switch role {
        case "boxColor":
            return palette.boxColor
        case "borderColor":
            return palette.borderColor
        case "textColor":
            return palette.textColor
        default:
            return nil
        }
    }

    private static func resolveColorToken(
        states: KiskadeeColorStateSet,
        selected: Bool,
        state: KiskadeeInteractionState
    ) -> KiskadeeColorToken? {
        if selected {
            switch state {
            case .disabled:
                return states.selected?.disabled ?? states.disabled ?? states.selected?.rest
            case .pressed:
                return states.selected?.pressed ?? states.selected?.rest
            case .rest:
                return states.selected?.rest
            }
        }

        switch state {
        case .disabled:
            return states.disabled ?? states.rest
        case .pressed:
            return states.pressed ?? states.rest
        case .rest:
            return states.rest
        }
    }

    private static func numberScale(
        _ element: KiskadeeElementSchema,
        _ scaleName: String,
        theme: KiskadeeTheme,
        elementName: String
    ) throws -> CGFloat {
        guard let value = element.scales?[scaleName],
              let number = number(from: value, scale: theme.scale)
        else {
            throw KiskadeeSchemaError.missingScale(element: elementName, scale: scaleName)
        }

        return CGFloat(number)
    }

    private static func radiusScale(
        _ element: KiskadeeElementSchema,
        theme: KiskadeeTheme,
        radiusMode: String,
        elementName: String
    ) throws -> CGFloat {
        guard let value = element.scales?["borderRadius"] else {
            throw KiskadeeSchemaError.missingScale(element: elementName, scale: "borderRadius")
        }

        if let object = value.objectValue,
           let modeValue = object[radiusMode] ?? object["pill"] ?? object.values.first,
           let number = number(from: modeValue, scale: theme.scale) {
            return CGFloat(number)
        }

        guard let number = number(from: value, scale: theme.scale) else {
            throw KiskadeeSchemaError.missingScale(element: elementName, scale: "borderRadius")
        }

        return CGFloat(number)
    }

    private static func thumbShrinkScale(
        _ element: KiskadeeElementSchema,
        _ scaleName: String,
        theme: KiskadeeTheme,
        fallback: CGFloat
    ) -> CGFloat {
        guard
            let thumbShrink = element.effects?["thumbShrink"]?.objectValue,
            let rest = thumbShrink["rest"]?.objectValue,
            let value = rest[scaleName],
            let number = number(from: value, scale: theme.scale)
        else {
            return fallback
        }

        return CGFloat(number)
    }

    private static func resolveActivationFeedback(
        theme: KiskadeeTheme
    ) -> (color: Color?, opacity: Double, size: CGFloat) {
        guard
            let effect = theme.schema.components.switch?.effects?.activationFeedback,
            let tone = activationFeedbackTone(effect: effect, theme: theme),
            let color = try? tone.color.swiftUIColor()
        else {
            return (nil, 0, 0)
        }

        return (
            color,
            tone.opacity,
            activationFeedbackSize(effect: effect, theme: theme)
        )
    }

    private static func activationFeedbackTone(
        effect: KiskadeeActivationFeedbackEffectSchema,
        theme: KiskadeeTheme
    ) -> KiskadeeActivationFeedbackToneSchema? {
        guard
            let toneSet = theme.schema.themeTokens?
                .palettes?[theme.segment]?[theme.mode.rawValue]?
                .effects?.activationFeedback
                ?? theme.schema.themeTokens?
                .palettes?["default"]?[theme.mode.rawValue]?
                .effects?.activationFeedback
                ?? theme.schema.themeTokens?
                .palettes?[theme.segment]?["light"]?
                .effects?.activationFeedback
        else {
            return nil
        }

        let toneName = effect.visual?.tone?.byEmphasis?[theme.emphasis.schemaKey]
            ?? effect.visual?.tone?.defaultTone
            ?? "subtle"

        return toneSet.tone[toneName]
            ?? toneSet.tone["subtle"]
            ?? toneSet.tone.values.first
    }

    private static func activationFeedbackSize(
        effect: KiskadeeActivationFeedbackEffectSchema,
        theme: KiskadeeTheme
    ) -> CGFloat {
        let profileName = effect.profile ?? "halo"
        let profile = effect.profiles?[profileName]
            ?? effect.profiles?["halo"]
            ?? effect.profiles?.values.first

        guard
            let value = profile?.size,
            let number = number(from: value, scale: theme.scale)
        else {
            return 0
        }

        return CGFloat(number)
    }

    private static func number(from value: KiskadeeJSONValue, scale: String) -> Double? {
        if let number = value.numberValue {
            return number
        }

        guard let object = value.objectValue else {
            return nil
        }

        return object[scale]?.numberValue
            ?? object[normalizedScale(scale)]?.numberValue
            ?? object["s:\(normalizedScale(scale))"]?.numberValue
            ?? object["all"]?.numberValue
            ?? object.values.compactMap(\.numberValue).first
    }

    private static func normalizedScale(_ scale: String) -> String {
        scale.hasPrefix("s:") ? String(scale.dropFirst(2)) : scale
    }
}
