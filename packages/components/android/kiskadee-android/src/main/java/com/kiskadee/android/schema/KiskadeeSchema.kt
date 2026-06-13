package com.kiskadee.android.schema

public data class KiskadeeSchema(
    val name: String,
    val prefix: String?,
    val version: List<Int>?,
    val author: String?,
    val global: KiskadeeGlobalSchema?,
    val themeTokens: KiskadeeThemeTokensSchema?,
    val components: KiskadeeComponentsSchema,
)

public data class KiskadeeGlobalSchema(
    val radius: String?,
    val fonts: KiskadeeFontsSchema?,
    val effects: KiskadeeActivationFeedbackEffectsSchema?,
)

public data class KiskadeeFontsSchema(
    val body: List<String>?,
    val heading: List<String>?,
)

public data class KiskadeeThemeTokensSchema(
    val palettes: Map<String, Map<String, KiskadeeThemeTokenPaletteSchema>>?,
)

public data class KiskadeeThemeTokenPaletteSchema(
    val effects: KiskadeeThemeTokenEffectsSchema?,
)

public data class KiskadeeThemeTokenEffectsSchema(
    val activationFeedback: KiskadeeActivationFeedbackToneSetSchema?,
)

public data class KiskadeeActivationFeedbackToneSetSchema(
    val tone: Map<String, KiskadeeActivationFeedbackToneSchema>,
)

public data class KiskadeeActivationFeedbackToneSchema(
    val color: KiskadeeColorToken,
    val opacity: Double,
)

public data class KiskadeeComponentsSchema(
    val switch: KiskadeeSwitchComponentSchema?,
)

public data class KiskadeeSwitchComponentSchema(
    val effects: KiskadeeActivationFeedbackEffectsSchema?,
    val options: KiskadeeSwitchOptionsSchema?,
    val variants: Map<String, KiskadeeSwitchVariantSchema>,
)

public data class KiskadeeActivationFeedbackEffectsSchema(
    val activationFeedback: KiskadeeActivationFeedbackEffectSchema?,
)

public data class KiskadeeActivationFeedbackEffectSchema(
    val profile: String?,
    val origin: String?,
    val visual: KiskadeeActivationFeedbackVisualSchema?,
    val profiles: Map<String, KiskadeeActivationFeedbackProfileSchema>?,
)

public data class KiskadeeActivationFeedbackVisualSchema(
    val layer: String?,
    val paint: String?,
    val tone: KiskadeeActivationFeedbackToneSelectionSchema?,
)

public data class KiskadeeActivationFeedbackToneSelectionSchema(
    val defaultTone: String?,
    val byEmphasis: Map<String, String>?,
)

public data class KiskadeeActivationFeedbackProfileSchema(
    val size: KiskadeeJsonValue?,
)

public data class KiskadeeSwitchOptionsSchema(
    val variant: String?,
    val radius: String?,
)

public data class KiskadeeSwitchVariantSchema(
    val options: KiskadeeSwitchVariantOptionsSchema?,
    val modes: Map<String, KiskadeeSwitchModeSchema>,
)

public data class KiskadeeSwitchVariantOptionsSchema(
    val mode: String?,
)

public data class KiskadeeSwitchModeSchema(
    val elements: Map<String, KiskadeeElementSchema>,
)

public data class KiskadeeElementSchema(
    val name: String,
    val scales: Map<String, KiskadeeJsonValue>?,
    val effects: Map<String, KiskadeeJsonValue>?,
    val palettes: Map<String, Map<String, KiskadeeElementPaletteSchema>>?,
)

public data class KiskadeeElementPaletteSchema(
    val boxColor: KiskadeeColorRoleSchema?,
    val borderColor: KiskadeeColorRoleSchema?,
    val textColor: KiskadeeColorRoleSchema?,
)

public typealias KiskadeeColorRoleSchema = Map<String, Map<String, KiskadeeColorStateSet>>

public data class KiskadeeColorStateSet(
    val rest: KiskadeeColorToken?,
    val hover: KiskadeeColorToken?,
    val focus: KiskadeeColorToken?,
    val pressed: KiskadeeColorToken?,
    val disabled: KiskadeeColorToken?,
    val selected: KiskadeeSelectedColorStateSet?,
)

public data class KiskadeeSelectedColorStateSet(
    val rest: KiskadeeColorToken?,
    val hover: KiskadeeColorToken?,
    val focus: KiskadeeColorToken?,
    val pressed: KiskadeeColorToken?,
    val disabled: KiskadeeColorToken?,
)

public class KiskadeeSchemaException(message: String) : IllegalArgumentException(message)
