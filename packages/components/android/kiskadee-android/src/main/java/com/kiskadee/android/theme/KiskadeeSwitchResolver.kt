package com.kiskadee.android.theme

import androidx.compose.ui.graphics.Color
import com.kiskadee.android.schema.KiskadeeColorRoleSchema
import com.kiskadee.android.schema.KiskadeeColorStateSet
import com.kiskadee.android.schema.KiskadeeColorToken
import com.kiskadee.android.schema.KiskadeeElementPaletteSchema
import com.kiskadee.android.schema.KiskadeeElementSchema
import com.kiskadee.android.schema.KiskadeeJsonValue
import com.kiskadee.android.schema.KiskadeeSchemaException
import com.kiskadee.android.schema.numberValue
import com.kiskadee.android.schema.objectValue
import com.kiskadee.android.schema.toComposeColor

internal data class KiskadeeSwitchResolvedStyle(
    val trackWidth: Float,
    val trackHeight: Float,
    val trackRadius: Float,
    val trackBorderWidth: Float,
    val trackPaddingTop: Float,
    val trackPaddingRight: Float,
    val trackPaddingBottom: Float,
    val trackPaddingLeft: Float,
    val trackColor: Color,
    val trackBorderColor: Color,
    val thumbWidth: Float,
    val thumbHeight: Float,
    val thumbRestWidth: Float,
    val thumbRestHeight: Float,
    val thumbRadius: Float,
    val thumbColor: Color,
    val labelColor: Color?,
    val labelTextSize: Float?,
    val labelLineHeight: Float?,
    val labelMarginLeft: Float,
    val labelMarginRight: Float,
    val iconColor: Color?,
    val iconWidth: Float?,
    val iconHeight: Float?,
)

internal object KiskadeeSwitchResolver {
    fun resolve(
        theme: KiskadeeTheme,
        isOn: Boolean,
        isPressed: Boolean,
        isEnabled: Boolean,
    ): KiskadeeSwitchResolvedStyle {
        val elements = switchElements(theme)
        val state = when {
            !isEnabled -> KiskadeeInteractionState.DISABLED
            isPressed -> KiskadeeInteractionState.PRESSED
            else -> KiskadeeInteractionState.REST
        }
        val radiusMode = switchRadiusMode(theme)

        val track = element("e2", elements)
        val thumb = element("e3", elements)
        val label = elements["e4"]
        val icon = elements["e6"]
        val thumbWidth = numberScale(thumb, "boxWidth", theme, "e3")
        val thumbHeight = numberScale(thumb, "boxHeight", theme, "e3")

        return KiskadeeSwitchResolvedStyle(
            trackWidth = numberScale(track, "boxWidth", theme, "e2"),
            trackHeight = numberScale(track, "boxHeight", theme, "e2"),
            trackRadius = radiusScale(track, theme, radiusMode, "e2"),
            trackBorderWidth = numberScale(track, "borderWidth", theme, "e2"),
            trackPaddingTop = numberScale(track, "paddingTop", theme, "e2"),
            trackPaddingRight = numberScale(track, "paddingRight", theme, "e2"),
            trackPaddingBottom = numberScale(track, "paddingBottom", theme, "e2"),
            trackPaddingLeft = numberScale(track, "paddingLeft", theme, "e2"),
            trackColor = color(track, "boxColor", theme, "e2", isOn, state),
            trackBorderColor = color(track, "borderColor", theme, "e2", isOn, state),
            thumbWidth = thumbWidth,
            thumbHeight = thumbHeight,
            thumbRestWidth = thumbShrinkScale(thumb, "boxWidth", theme, thumbWidth),
            thumbRestHeight = thumbShrinkScale(thumb, "boxHeight", theme, thumbHeight),
            thumbRadius = radiusScale(thumb, theme, radiusMode, "e3"),
            thumbColor = color(thumb, "boxColor", theme, "e3", isOn, state),
            labelColor = label?.let { color(it, "textColor", theme, "e4", selected = false, state = state) },
            labelTextSize = label?.let { numberScale(it, "textSize", theme, "e4") },
            labelLineHeight = label?.let { numberScale(it, "textHeight", theme, "e4") },
            labelMarginLeft = label?.let { optionalNumberScale(it, "marginLeft", theme) } ?: 0f,
            labelMarginRight = label?.let { optionalNumberScale(it, "marginRight", theme) } ?: 0f,
            iconColor = icon?.let { color(it, "textColor", theme, "e6", isOn, state) },
            iconWidth = icon?.let { numberScale(it, "boxWidth", theme, "e6") },
            iconHeight = icon?.let { numberScale(it, "boxHeight", theme, "e6") },
        )
    }

    private fun switchElements(theme: KiskadeeTheme): Map<String, KiskadeeElementSchema> {
        val switchSchema = theme.schema.components.switch
            ?: throw KiskadeeSchemaException("The schema does not include components.switch.")

        val variantName = switchSchema.options?.variant ?: "standard"
        val variant = switchSchema.variants[variantName]
            ?: throw KiskadeeSchemaException("The schema does not include switch variant '$variantName'.")

        val modeName = variant.options?.mode ?: "base"
        val mode = variant.modes[modeName]
            ?: throw KiskadeeSchemaException("The schema does not include switch mode '$modeName'.")

        return mode.elements
    }

    private fun switchRadiusMode(theme: KiskadeeTheme): String {
        return theme.schema.components.switch?.options?.radius
            ?: theme.schema.global?.radius
            ?: "pill"
    }

    private fun element(
        name: String,
        elements: Map<String, KiskadeeElementSchema>,
    ): KiskadeeElementSchema {
        return elements[name]
            ?: throw KiskadeeSchemaException("The schema does not include switch element '$name'.")
    }

    private fun color(
        element: KiskadeeElementSchema,
        role: String,
        theme: KiskadeeTheme,
        elementName: String,
        selected: Boolean,
        state: KiskadeeInteractionState,
    ): Color {
        val palette = element.palettes?.get(theme.segment)?.get(theme.mode.schemaKey)
            ?: throw KiskadeeSchemaException("Switch element '$elementName' does not include palette role '$role'.")
        val roleSchema = colorRole(role, palette)
            ?: throw KiskadeeSchemaException("Switch element '$elementName' does not include palette role '$role'.")
        val byIntent = roleSchema[theme.intent] ?: roleSchema["neutral"] ?: roleSchema.values.firstOrNull()
        val states = byIntent?.get(theme.emphasis.schemaKey)
            ?: byIntent?.get("medium")
            ?: byIntent?.values?.firstOrNull()
            ?: throw missingColor(elementName, role, theme)
        val token = resolveColorToken(states, selected, state)
            ?: throw missingColor(elementName, role, theme)

        return token.toComposeColor()
    }

    private fun colorRole(
        role: String,
        palette: KiskadeeElementPaletteSchema,
    ): KiskadeeColorRoleSchema? {
        return when (role) {
            "boxColor" -> palette.boxColor
            "borderColor" -> palette.borderColor
            "textColor" -> palette.textColor
            else -> null
        }
    }

    private fun resolveColorToken(
        states: KiskadeeColorStateSet,
        selected: Boolean,
        state: KiskadeeInteractionState,
    ): KiskadeeColorToken? {
        if (selected) {
            return when (state) {
                KiskadeeInteractionState.DISABLED -> states.selected?.disabled
                    ?: states.disabled
                    ?: states.selected?.rest
                KiskadeeInteractionState.PRESSED -> states.selected?.pressed ?: states.selected?.rest
                KiskadeeInteractionState.REST -> states.selected?.rest
            }
        }

        return when (state) {
            KiskadeeInteractionState.DISABLED -> states.disabled ?: states.rest
            KiskadeeInteractionState.PRESSED -> states.pressed ?: states.rest
            KiskadeeInteractionState.REST -> states.rest
        }
    }

    private fun numberScale(
        element: KiskadeeElementSchema,
        scaleName: String,
        theme: KiskadeeTheme,
        elementName: String,
    ): Float {
        val value = element.scales?.get(scaleName)
        val number = value?.let { numberFrom(it, theme.scale) }
            ?: throw KiskadeeSchemaException("Switch element '$elementName' is missing scale '$scaleName'.")

        return number.toFloat()
    }

    private fun optionalNumberScale(
        element: KiskadeeElementSchema,
        scaleName: String,
        theme: KiskadeeTheme,
    ): Float? {
        return element.scales?.get(scaleName)?.let { numberFrom(it, theme.scale)?.toFloat() }
    }

    private fun radiusScale(
        element: KiskadeeElementSchema,
        theme: KiskadeeTheme,
        radiusMode: String,
        elementName: String,
    ): Float {
        val value = element.scales?.get("borderRadius")
            ?: throw KiskadeeSchemaException("Switch element '$elementName' is missing scale 'borderRadius'.")

        value.objectValue?.let { objectValue ->
            val modeValue = objectValue[radiusMode] ?: objectValue["pill"] ?: objectValue.values.firstOrNull()
            val number = modeValue?.let { numberFrom(it, theme.scale) }
            if (number != null) {
                return number.toFloat()
            }
        }

        val number = numberFrom(value, theme.scale)
            ?: throw KiskadeeSchemaException("Switch element '$elementName' is missing scale 'borderRadius'.")

        return number.toFloat()
    }

    private fun thumbShrinkScale(
        element: KiskadeeElementSchema,
        scaleName: String,
        theme: KiskadeeTheme,
        fallback: Float,
    ): Float {
        val value = element.effects
            ?.get("thumbShrink")
            ?.objectValue
            ?.get("rest")
            ?.objectValue
            ?.get(scaleName)

        return value?.let { numberFrom(it, theme.scale)?.toFloat() } ?: fallback
    }

    private fun numberFrom(value: KiskadeeJsonValue, scale: String): Double? {
        value.numberValue?.let { return it }

        val objectValue = value.objectValue ?: return null
        val normalizedScale = normalizedScale(scale)

        return objectValue[scale]?.numberValue
            ?: objectValue[normalizedScale]?.numberValue
            ?: objectValue["s:$normalizedScale"]?.numberValue
            ?: objectValue["all"]?.numberValue
            ?: objectValue.values.firstNotNullOfOrNull { it.numberValue }
    }

    private fun normalizedScale(scale: String): String {
        return if (scale.startsWith("s:")) scale.drop(2) else scale
    }

    private fun missingColor(
        elementName: String,
        role: String,
        theme: KiskadeeTheme,
    ): KiskadeeSchemaException {
        return KiskadeeSchemaException(
            "Switch element '$elementName' is missing $role.${theme.intent}.${theme.emphasis.schemaKey}.",
        )
    }
}
