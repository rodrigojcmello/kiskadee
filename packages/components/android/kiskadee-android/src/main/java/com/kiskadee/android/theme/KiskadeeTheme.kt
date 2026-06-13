package com.kiskadee.android.theme

import com.kiskadee.android.schema.KiskadeeSchema

public enum class KiskadeeThemeMode(public val schemaKey: String) {
    LIGHT("light"),
    DARK("dark"),
}

public enum class KiskadeeEmphasis(public val schemaKey: String) {
    HIGH("high"),
    MEDIUM("medium"),
    LOW("low"),
    LOWEST("lowest"),
}

public data class KiskadeeTheme(
    val schema: KiskadeeSchema,
    val segment: String = "default",
    val mode: KiskadeeThemeMode = KiskadeeThemeMode.LIGHT,
    val scale: String = "s:md:1",
    val intent: String = "neutral",
    val emphasis: KiskadeeEmphasis = KiskadeeEmphasis.MEDIUM,
)

internal enum class KiskadeeInteractionState {
    REST,
    PRESSED,
    DISABLED,
}
