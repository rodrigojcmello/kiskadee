package com.kiskadee.android.components.switchcontrol

import androidx.compose.animation.core.animateDpAsState
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.selection.toggleable
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicText
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kiskadee.android.theme.KiskadeeSwitchResolvedStyle
import com.kiskadee.android.theme.KiskadeeSwitchResolver
import com.kiskadee.android.theme.KiskadeeTheme
import kotlin.math.min

@Composable
public fun KiskadeeSwitch(
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
    theme: KiskadeeTheme,
    modifier: Modifier = Modifier,
    label: String? = null,
    enabled: Boolean = true,
    showsIcon: Boolean = false,
) {
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val resolvedStyle = remember(theme, checked, isPressed, enabled) {
        runCatching {
            KiskadeeSwitchResolver.resolve(
                theme = theme,
                isOn = checked,
                isPressed = isPressed,
                isEnabled = enabled,
            )
        }
    }

    resolvedStyle.fold(
        onSuccess = { style ->
            KiskadeeSwitchContent(
                checked = checked,
                onCheckedChange = onCheckedChange,
                style = style,
                modifier = modifier,
                label = label,
                enabled = enabled,
                showsIcon = showsIcon,
                isPressed = isPressed,
                interactionSource = interactionSource,
            )
        },
        onFailure = { error ->
            BasicText(
                text = error.message ?: "Invalid Kiskadee switch schema.",
                modifier = modifier,
                style = TextStyle(color = Color.Red, fontSize = 12.sp),
            )
        },
    )
}

@Composable
private fun KiskadeeSwitchContent(
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
    style: KiskadeeSwitchResolvedStyle,
    modifier: Modifier,
    label: String?,
    enabled: Boolean,
    showsIcon: Boolean,
    isPressed: Boolean,
    interactionSource: MutableInteractionSource,
) {
    Row(
        modifier = modifier.toggleable(
            value = checked,
            enabled = enabled,
            role = Role.Switch,
            interactionSource = interactionSource,
            indication = null,
            onValueChange = onCheckedChange,
        ),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        if (label != null) {
            BasicText(
                text = label,
                modifier = Modifier.padding(
                    start = style.labelMarginLeft.dp,
                    end = style.labelMarginRight.dp,
                ),
                style = TextStyle(
                    color = style.labelColor ?: Color.Unspecified,
                    fontSize = (style.labelTextSize ?: 14f).sp,
                    lineHeight = (style.labelLineHeight ?: style.labelTextSize ?: 20f).sp,
                ),
            )
        }

        KiskadeeSwitchControl(
            checked = checked,
            isPressed = isPressed,
            style = style,
            showsIcon = showsIcon,
        )
    }
}

@Composable
private fun KiskadeeSwitchControl(
    checked: Boolean,
    isPressed: Boolean,
    style: KiskadeeSwitchResolvedStyle,
    showsIcon: Boolean,
) {
    val trackShape = RoundedCornerShape(style.trackRadius.dp)

    Box(
        modifier = Modifier
            .size(width = style.trackWidth.dp, height = style.trackHeight.dp)
            .clip(trackShape)
            .background(style.trackColor)
            .border(
                border = BorderStroke(style.trackBorderWidth.dp, style.trackBorderColor),
                shape = trackShape,
            )
            .padding(
                start = style.trackPaddingLeft.dp,
                top = style.trackPaddingTop.dp,
                end = style.trackPaddingRight.dp,
                bottom = style.trackPaddingBottom.dp,
            ),
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(0.dp),
        ) {
            KiskadeeSwitchThumb(
                checked = checked,
                isPressed = isPressed,
                style = style,
                showsIcon = showsIcon,
                modifier = Modifier.align(if (checked) Alignment.CenterEnd else Alignment.CenterStart),
            )
        }
    }
}

@Composable
private fun KiskadeeSwitchThumb(
    checked: Boolean,
    isPressed: Boolean,
    style: KiskadeeSwitchResolvedStyle,
    showsIcon: Boolean,
    modifier: Modifier = Modifier,
) {
    val targetThumbWidth = if (checked || isPressed) style.thumbWidth else style.thumbRestWidth
    val targetThumbHeight = if (checked || isPressed) style.thumbHeight else style.thumbRestHeight
    val thumbWidth by animateDpAsState(targetThumbWidth.dp)
    val thumbHeight by animateDpAsState(targetThumbHeight.dp)
    val thumbRadius = min(style.thumbRadius, min(thumbWidth.value, thumbHeight.value) / 2f).dp

    Box(
        modifier = modifier.size(width = style.thumbWidth.dp, height = style.thumbHeight.dp),
        contentAlignment = Alignment.Center,
    ) {
        Box(
            modifier = Modifier
                .size(width = thumbWidth, height = thumbHeight)
                .clip(RoundedCornerShape(thumbRadius))
                .background(style.thumbColor),
        )

        if (showsIcon && style.iconColor != null) {
            KiskadeeSwitchIcon(
                checked = checked,
                color = style.iconColor,
                width = style.iconWidth ?: 16f,
                height = style.iconHeight ?: 16f,
            )
        }
    }
}

@Composable
private fun KiskadeeSwitchIcon(
    checked: Boolean,
    color: Color,
    width: Float,
    height: Float,
) {
    Canvas(modifier = Modifier.size(width = width.dp, height = height.dp)) {
        val strokeWidth = 2.dp.toPx()

        if (checked) {
            drawLine(
                color = color,
                start = Offset(size.width * 0.24f, size.height * 0.52f),
                end = Offset(size.width * 0.42f, size.height * 0.70f),
                strokeWidth = strokeWidth,
                cap = StrokeCap.Round,
            )
            drawLine(
                color = color,
                start = Offset(size.width * 0.42f, size.height * 0.70f),
                end = Offset(size.width * 0.78f, size.height * 0.30f),
                strokeWidth = strokeWidth,
                cap = StrokeCap.Round,
            )
        } else {
            drawLine(
                color = color,
                start = Offset(size.width * 0.28f, size.height * 0.50f),
                end = Offset(size.width * 0.72f, size.height * 0.50f),
                strokeWidth = strokeWidth,
                cap = StrokeCap.Round,
            )
        }
    }
}

public object KiskadeeSwitchSchemaValidator {
    public fun validate(theme: KiskadeeTheme) {
        KiskadeeSwitchResolver.resolve(
            theme = theme,
            isOn = false,
            isPressed = false,
            isEnabled = true,
        )
        KiskadeeSwitchResolver.resolve(
            theme = theme,
            isOn = true,
            isPressed = false,
            isEnabled = false,
        )
    }
}
