package com.kiskadee.android.schema

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

public object KiskadeeSchemaLoader {
    public fun load(json: String): KiskadeeSchema {
        return parseSchema(JSONObject(json))
    }

    public fun loadFromAsset(context: Context, assetName: String): KiskadeeSchema {
        val json = context.assets.open(assetName).bufferedReader().use { it.readText() }
        return load(json)
    }

    private fun parseSchema(root: JSONObject): KiskadeeSchema {
        return KiskadeeSchema(
            name = root.getString("name"),
            prefix = root.optionalString("prefix"),
            version = root.optionalArray("version")?.toList { value -> (value as Number).toInt() },
            author = root.optionalString("author"),
            global = root.optionalObject("global")?.let(::parseGlobal),
            themeTokens = root.optionalObject("themeTokens")?.let(::parseThemeTokens),
            components = parseComponents(root.getJSONObject("components")),
        )
    }

    private fun parseGlobal(root: JSONObject): KiskadeeGlobalSchema {
        return KiskadeeGlobalSchema(
            radius = root.optionalString("radius"),
            fonts = root.optionalObject("fonts")?.let(::parseFonts),
            effects = root.optionalObject("effects")?.let(::parseActivationFeedbackEffects),
        )
    }

    private fun parseFonts(root: JSONObject): KiskadeeFontsSchema {
        return KiskadeeFontsSchema(
            body = root.optionalArray("body")?.toList { value -> value as String },
            heading = root.optionalArray("heading")?.toList { value -> value as String },
        )
    }

    private fun parseThemeTokens(root: JSONObject): KiskadeeThemeTokensSchema {
        return KiskadeeThemeTokensSchema(
            palettes = root.optionalObject("palettes")?.toMap { _, segmentValue ->
                (segmentValue as JSONObject).toMap { _, modeValue ->
                    parseThemeTokenPalette(modeValue as JSONObject)
                }
            },
        )
    }

    private fun parseThemeTokenPalette(root: JSONObject): KiskadeeThemeTokenPaletteSchema {
        return KiskadeeThemeTokenPaletteSchema(
            effects = root.optionalObject("effects")?.let(::parseThemeTokenEffects),
        )
    }

    private fun parseThemeTokenEffects(root: JSONObject): KiskadeeThemeTokenEffectsSchema {
        return KiskadeeThemeTokenEffectsSchema(
            activationFeedback = root.optionalObject("activationFeedback")
                ?.let(::parseActivationFeedbackToneSet),
        )
    }

    private fun parseActivationFeedbackToneSet(root: JSONObject): KiskadeeActivationFeedbackToneSetSchema {
        return KiskadeeActivationFeedbackToneSetSchema(
            tone = root.getJSONObject("tone").toMap { _, value ->
                parseActivationFeedbackTone(value as JSONObject)
            },
        )
    }

    private fun parseActivationFeedbackTone(root: JSONObject): KiskadeeActivationFeedbackToneSchema {
        return KiskadeeActivationFeedbackToneSchema(
            color = colorTokenFrom(root.opt("color")),
            opacity = root.getDouble("opacity"),
        )
    }

    private fun parseComponents(root: JSONObject): KiskadeeComponentsSchema {
        return KiskadeeComponentsSchema(
            switch = root.optionalObject("switch")?.let(::parseSwitchComponent),
        )
    }

    private fun parseSwitchComponent(root: JSONObject): KiskadeeSwitchComponentSchema {
        return KiskadeeSwitchComponentSchema(
            effects = root.optionalObject("effects")?.let(::parseActivationFeedbackEffects),
            options = root.optionalObject("options")?.let(::parseSwitchOptions),
            variants = root.getJSONObject("variants").toMap { _, value ->
                parseSwitchVariant(value as JSONObject)
            },
        )
    }

    private fun parseActivationFeedbackEffects(root: JSONObject): KiskadeeActivationFeedbackEffectsSchema {
        return KiskadeeActivationFeedbackEffectsSchema(
            activationFeedback = root.optionalObject("activationFeedback")
                ?.let(::parseActivationFeedbackEffect),
        )
    }

    private fun parseActivationFeedbackEffect(root: JSONObject): KiskadeeActivationFeedbackEffectSchema {
        return KiskadeeActivationFeedbackEffectSchema(
            profile = root.optionalString("profile"),
            origin = root.optionalString("origin"),
            visual = root.optionalObject("visual")?.let(::parseActivationFeedbackVisual),
            profiles = root.optionalObject("profiles")?.toMap { _, value ->
                parseActivationFeedbackProfile(value as JSONObject)
            },
        )
    }

    private fun parseActivationFeedbackVisual(root: JSONObject): KiskadeeActivationFeedbackVisualSchema {
        return KiskadeeActivationFeedbackVisualSchema(
            layer = root.optionalString("layer"),
            paint = root.optionalString("paint"),
            tone = root.optionalObject("tone")?.let(::parseActivationFeedbackToneSelection),
        )
    }

    private fun parseActivationFeedbackToneSelection(
        root: JSONObject,
    ): KiskadeeActivationFeedbackToneSelectionSchema {
        return KiskadeeActivationFeedbackToneSelectionSchema(
            defaultTone = root.optionalString("default"),
            byEmphasis = root.optionalObject("byEmphasis")?.toMap { _, value -> value as String },
        )
    }

    private fun parseActivationFeedbackProfile(root: JSONObject): KiskadeeActivationFeedbackProfileSchema {
        return KiskadeeActivationFeedbackProfileSchema(
            size = root.optionalJsonValue("size"),
        )
    }

    private fun parseSwitchOptions(root: JSONObject): KiskadeeSwitchOptionsSchema {
        return KiskadeeSwitchOptionsSchema(
            variant = root.optionalString("variant"),
            radius = root.optionalString("radius"),
        )
    }

    private fun parseSwitchVariant(root: JSONObject): KiskadeeSwitchVariantSchema {
        return KiskadeeSwitchVariantSchema(
            options = root.optionalObject("options")?.let(::parseSwitchVariantOptions),
            modes = root.getJSONObject("modes").toMap { _, value ->
                parseSwitchMode(value as JSONObject)
            },
        )
    }

    private fun parseSwitchVariantOptions(root: JSONObject): KiskadeeSwitchVariantOptionsSchema {
        return KiskadeeSwitchVariantOptionsSchema(
            mode = root.optionalString("mode"),
        )
    }

    private fun parseSwitchMode(root: JSONObject): KiskadeeSwitchModeSchema {
        return KiskadeeSwitchModeSchema(
            elements = root.getJSONObject("elements").toMap { _, value ->
                parseElement(value as JSONObject)
            },
        )
    }

    private fun parseElement(root: JSONObject): KiskadeeElementSchema {
        return KiskadeeElementSchema(
            name = root.getString("name"),
            scales = root.optionalObject("scales")?.toMap { _, value -> jsonValueFrom(value) },
            effects = root.optionalObject("effects")?.toMap { _, value -> jsonValueFrom(value) },
            palettes = root.optionalObject("palettes")?.toMap { _, segmentValue ->
                (segmentValue as JSONObject).toMap { _, modeValue ->
                    parsePalette(modeValue as JSONObject)
                }
            },
        )
    }

    private fun parsePalette(root: JSONObject): KiskadeeElementPaletteSchema {
        return KiskadeeElementPaletteSchema(
            boxColor = root.optionalObject("boxColor")?.let(::parseColorRole),
            borderColor = root.optionalObject("borderColor")?.let(::parseColorRole),
            textColor = root.optionalObject("textColor")?.let(::parseColorRole),
        )
    }

    private fun parseColorRole(root: JSONObject): KiskadeeColorRoleSchema {
        return root.toMap { _, intentValue ->
            (intentValue as JSONObject).toMap { _, emphasisValue ->
                parseColorStateSet(emphasisValue as JSONObject)
            }
        }
    }

    private fun parseColorStateSet(root: JSONObject): KiskadeeColorStateSet {
        return KiskadeeColorStateSet(
            rest = root.optionalColorToken("rest"),
            hover = root.optionalColorToken("hover"),
            focus = root.optionalColorToken("focus"),
            pressed = root.optionalColorToken("pressed"),
            disabled = root.optionalColorToken("disabled"),
            selected = root.optionalObject("selected")?.let(::parseSelectedColorStateSet),
        )
    }

    private fun parseSelectedColorStateSet(root: JSONObject): KiskadeeSelectedColorStateSet {
        return KiskadeeSelectedColorStateSet(
            rest = root.optionalColorToken("rest"),
            hover = root.optionalColorToken("hover"),
            focus = root.optionalColorToken("focus"),
            pressed = root.optionalColorToken("pressed"),
            disabled = root.optionalColorToken("disabled"),
        )
    }
}

private fun JSONObject.optionalString(name: String): String? {
    return if (has(name) && !isNull(name)) getString(name) else null
}

private fun JSONObject.optionalObject(name: String): JSONObject? {
    return if (has(name) && !isNull(name)) getJSONObject(name) else null
}

private fun JSONObject.optionalArray(name: String): JSONArray? {
    return if (has(name) && !isNull(name)) getJSONArray(name) else null
}

private fun JSONObject.optionalJsonValue(name: String): KiskadeeJsonValue? {
    return if (has(name) && !isNull(name)) jsonValueFrom(opt(name)) else null
}

private fun JSONObject.optionalColorToken(name: String): KiskadeeColorToken? {
    return if (has(name) && !isNull(name)) colorTokenFrom(opt(name)) else null
}
