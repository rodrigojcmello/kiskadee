package com.kiskadee.android.schema

import androidx.compose.ui.graphics.Color
import org.json.JSONArray
import org.json.JSONObject

public sealed interface KiskadeeColorToken {
    public data class Hex(val value: String) : KiskadeeColorToken
    public data class Hsla(
        val hue: Double,
        val saturation: Double,
        val lightness: Double,
        val alpha: Double,
    ) : KiskadeeColorToken
    public data class Ref(val token: KiskadeeColorToken) : KiskadeeColorToken
}

public fun KiskadeeColorToken.toComposeColor(): Color {
    return when (this) {
        is KiskadeeColorToken.Hex -> parseHexColor(value)
        is KiskadeeColorToken.Hsla -> {
            val rgba = rgbaFromHsla(
                hue = hue,
                saturation = saturation / 100,
                lightness = lightness / 100,
                alpha = alpha,
            )

            Color(
                red = rgba.red.toFloat(),
                green = rgba.green.toFloat(),
                blue = rgba.blue.toFloat(),
                alpha = rgba.alpha.toFloat(),
            )
        }
        is KiskadeeColorToken.Ref -> token.toComposeColor()
    }
}

internal fun colorTokenFrom(rawValue: Any?): KiskadeeColorToken {
    return when (rawValue) {
        is String -> KiskadeeColorToken.Hex(rawValue)
        is JSONArray -> {
            if (rawValue.length() != 4) {
                throw KiskadeeSchemaException("Expected HSL color arrays to contain four values.")
            }

            KiskadeeColorToken.Hsla(
                hue = rawValue.getDouble(0),
                saturation = rawValue.getDouble(1),
                lightness = rawValue.getDouble(2),
                alpha = rawValue.getDouble(3),
            )
        }
        is JSONObject -> {
            if (!rawValue.has("ref")) {
                throw KiskadeeSchemaException("Expected a Kiskadee color ref object.")
            }

            KiskadeeColorToken.Ref(colorTokenFrom(rawValue.opt("ref")))
        }
        else -> throw KiskadeeSchemaException("Expected a Kiskadee color token.")
    }
}

private fun parseHexColor(hex: String): Color {
    val normalized = hex.trim().removePrefix("#")
    if (normalized.length != 6 && normalized.length != 8) {
        throw KiskadeeSchemaException("Unsupported Kiskadee color value '$hex'.")
    }

    val rawValue = normalized.toLongOrNull(radix = 16)
        ?: throw KiskadeeSchemaException("Unsupported Kiskadee color value '$hex'.")

    val red: Int
    val green: Int
    val blue: Int
    val alpha: Int

    if (normalized.length == 8) {
        red = ((rawValue and 0xFF00_0000L) shr 24).toInt()
        green = ((rawValue and 0x00FF_0000L) shr 16).toInt()
        blue = ((rawValue and 0x0000_FF00L) shr 8).toInt()
        alpha = (rawValue and 0x0000_00FFL).toInt()
    } else {
        red = ((rawValue and 0xFF_0000L) shr 16).toInt()
        green = ((rawValue and 0x00_FF00L) shr 8).toInt()
        blue = (rawValue and 0x00_00FFL).toInt()
        alpha = 255
    }

    return Color(
        red = red / 255f,
        green = green / 255f,
        blue = blue / 255f,
        alpha = alpha / 255f,
    )
}

private fun rgbaFromHsla(
    hue: Double,
    saturation: Double,
    lightness: Double,
    alpha: Double,
): RgbaColor {
    val normalizedHue = ((hue % 360) + 360) % 360 / 360

    if (saturation <= 0) {
        return RgbaColor(lightness, lightness, lightness, alpha)
    }

    val q = if (lightness < 0.5) {
        lightness * (1 + saturation)
    } else {
        lightness + saturation - lightness * saturation
    }
    val p = 2 * lightness - q

    return RgbaColor(
        red = hueToRgb(p, q, normalizedHue + 1.0 / 3.0),
        green = hueToRgb(p, q, normalizedHue),
        blue = hueToRgb(p, q, normalizedHue - 1.0 / 3.0),
        alpha = alpha,
    )
}

private fun hueToRgb(p: Double, q: Double, rawT: Double): Double {
    var t = rawT
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1.0 / 6.0) return p + (q - p) * 6 * t
    if (t < 1.0 / 2.0) return q
    if (t < 2.0 / 3.0) return p + (q - p) * (2.0 / 3.0 - t) * 6

    return p
}

private data class RgbaColor(
    val red: Double,
    val green: Double,
    val blue: Double,
    val alpha: Double,
)
