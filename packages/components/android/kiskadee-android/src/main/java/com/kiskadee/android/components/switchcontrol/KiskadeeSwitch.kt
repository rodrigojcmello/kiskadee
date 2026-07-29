package com.kiskadee.android.components.switchcontrol

import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.snap
import androidx.compose.animation.core.spring
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.awaitEachGesture
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicText
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.input.pointer.changedToUpIgnoreConsumed
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.input.pointer.positionChange
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.disabled
import androidx.compose.ui.semantics.onClick
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kiskadee.android.R
import com.kiskadee.android.theme.KiskadeeSwitchResolvedStyle
import com.kiskadee.android.theme.KiskadeeSwitchResolver
import com.kiskadee.android.theme.KiskadeeTheme
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlin.math.abs
import kotlin.math.max
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
    interactionLocked: Boolean = false,
    interactionCooldownMillis: Long = 0L,
) {
    var isPressed by remember { mutableStateOf(false) }
    var dragOffset by remember { mutableStateOf<Float?>(null) }
    var gestureStartChecked by remember { mutableStateOf<Boolean?>(null) }
    var gestureChecked by remember { mutableStateOf<Boolean?>(null) }
    var hasChangedCurrentGesture by remember { mutableStateOf(false) }
    var isCoolingDown by remember { mutableStateOf(false) }
    var showsActivationFeedback by remember { mutableStateOf(false) }
    var cooldownJob by remember { mutableStateOf<Job?>(null) }
    var activationFeedbackJob by remember { mutableStateOf<Job?>(null) }

    val scope = rememberCoroutineScope()
    val currentChecked by rememberUpdatedState(checked)
    val currentOnCheckedChange by rememberUpdatedState(onCheckedChange)
    val visualChecked = gestureChecked ?: checked
    val density = LocalDensity.current

    fun currentInteractionValue(): Boolean {
        return gestureChecked ?: currentChecked
    }

    fun startInteractionCooldown() {
        cooldownJob?.cancel()

        if (interactionCooldownMillis <= 0) {
            isCoolingDown = false
            return
        }

        isCoolingDown = true
        cooldownJob = scope.launch {
            delay(interactionCooldownMillis)
            isCoolingDown = false
        }
    }

    fun resetInteraction(startsCooldown: Boolean = false) {
        val shouldStartCooldown = startsCooldown && hasChangedCurrentGesture

        isPressed = false
        dragOffset = null
        gestureStartChecked = null
        gestureChecked = null
        hasChangedCurrentGesture = false

        if (shouldStartCooldown) {
            startInteractionCooldown()
        }
    }

    fun canStartInteraction(): Boolean {
        return enabled && !interactionLocked && !isCoolingDown
    }

    fun triggerActivationFeedback() {
        activationFeedbackJob?.cancel()

        showsActivationFeedback = true
        activationFeedbackJob = scope.launch {
            delay(ACTIVATION_FEEDBACK_DURATION_MILLIS)
            showsActivationFeedback = false
        }
    }

    fun commitInteraction(nextValue: Boolean, startsCooldown: Boolean = true): Boolean {
        if (!enabled || interactionLocked) {
            return false
        }

        if (nextValue == currentInteractionValue()) {
            return false
        }

        if (gestureStartChecked != null) {
            hasChangedCurrentGesture = true
            gestureChecked = nextValue
        }

        currentOnCheckedChange(nextValue)

        if (startsCooldown) {
            startInteractionCooldown()
        }

        return true
    }

    fun toggle() {
        if (!canStartInteraction()) {
            return
        }

        triggerActivationFeedback()
        commitInteraction(!currentInteractionValue())
    }

    fun commitIfDragReachedExtreme(offset: Float, style: KiskadeeSwitchResolvedStyle) {
        if (gestureStartChecked == null) {
            return
        }

        val travel = thumbTravel(style)
        if (travel <= 0f) {
            return
        }

        val nextValue = when {
            offset <= 0f -> false
            offset >= travel -> true
            else -> null
        }

        if (nextValue != null && commitInteraction(nextValue, startsCooldown = false)) {
            dragOffset = if (nextValue) travel else 0f
        }
    }

    DisposableEffect(Unit) {
        onDispose {
            cooldownJob?.cancel()
            activationFeedbackJob?.cancel()
        }
    }

    LaunchedEffect(enabled, interactionLocked) {
        if (!enabled || interactionLocked) {
            resetInteraction()
        }
    }

    LaunchedEffect(interactionCooldownMillis) {
        if (interactionCooldownMillis <= 0) {
            cooldownJob?.cancel()
            isCoolingDown = false
        }
    }

    val resolvedStyle = remember(theme, visualChecked, isPressed, enabled) {
        runCatching {
            KiskadeeSwitchResolver.resolve(
                theme = theme,
                isOn = visualChecked,
                isPressed = isPressed,
                isEnabled = enabled,
            )
        }
    }

    resolvedStyle.fold(
        onSuccess = { style ->
            val densityValue = density.density
            val gestureModifier = Modifier.pointerInput(
                enabled,
                interactionLocked,
                isCoolingDown,
                visualChecked,
                style,
                densityValue,
            ) {
                awaitEachGesture {
                    val down = awaitFirstDown(requireUnconsumed = false)

                    if (!canStartInteraction()) {
                        resetInteraction()

                        var pointerReleased = false
                        while (!pointerReleased) {
                            val event = awaitPointerEvent()
                            pointerReleased = event.changes.any { change ->
                                change.id == down.id && change.changedToUpIgnoreConsumed()
                            }
                        }

                        return@awaitEachGesture
                    }

                    val startChecked = currentInteractionValue()
                    val travel = thumbTravel(style)
                    var totalDragX = 0f
                    var totalDragY = 0f

                    gestureStartChecked = startChecked
                    hasChangedCurrentGesture = false
                    isPressed = true
                    triggerActivationFeedback()

                    while (true) {
                        val event = awaitPointerEvent()
                        val change = event.changes.firstOrNull { it.id == down.id }
                            ?: event.changes.firstOrNull()
                            ?: continue

                        if (change.changedToUpIgnoreConsumed()) {
                            break
                        }

                        val positionChange = change.positionChange()
                        if (positionChange != Offset.Zero) {
                            totalDragX += positionChange.x
                            totalDragY += positionChange.y

                            val nextOffset = clampThumbOffset(
                                (if (startChecked) travel else 0f) + totalDragX / densityValue,
                                style,
                            )

                            dragOffset = nextOffset
                            commitIfDragReachedExtreme(nextOffset, style)
                            change.consume()
                        }
                    }

                    if (!enabled || interactionLocked) {
                        resetInteraction()
                        return@awaitEachGesture
                    }

                    if (max(abs(totalDragX), abs(totalDragY)) < TAP_MOVEMENT_THRESHOLD_PX) {
                        commitInteraction(!currentInteractionValue(), startsCooldown = false)
                        resetInteraction(startsCooldown = true)
                        return@awaitEachGesture
                    }

                    val finalOffset = clampThumbOffset(
                        (if (startChecked) travel else 0f) + totalDragX / densityValue,
                        style,
                    )
                    commitInteraction(finalOffset >= travel / 2f, startsCooldown = false)
                    resetInteraction(startsCooldown = true)
                }
            }

            Row(
                modifier = modifier
                    .semantics(mergeDescendants = true) {
                        role = Role.Switch
                        stateDescription = if (visualChecked) "On" else "Off"

                        if (!enabled) {
                            disabled()
                        }

                        onClick {
                            if (!canStartInteraction()) {
                                false
                            } else {
                                toggle()
                                true
                            }
                        }
                    }
                    .then(gestureModifier),
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
                    checked = visualChecked,
                    dragOffset = dragOffset,
                    style = style,
                    showsIcon = showsIcon,
                    showsActivationFeedback = showsActivationFeedback,
                )
            }
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
private fun KiskadeeSwitchControl(
    checked: Boolean,
    dragOffset: Float?,
    style: KiskadeeSwitchResolvedStyle,
    showsIcon: Boolean,
    showsActivationFeedback: Boolean,
) {
    val trackShape = RoundedCornerShape(style.trackRadius.dp)
    val targetThumbOffset = dragOffset ?: if (checked) thumbTravel(style) else 0f
    val animatedThumbOffset by animateDpAsState(
        targetValue = targetThumbOffset.dp,
        animationSpec = if (dragOffset == null) thumbMotionSpec() else snap(),
    )
    val renderedThumbOffset = if (dragOffset == null) animatedThumbOffset else targetThumbOffset.dp

    Box(
        modifier = Modifier.size(width = style.trackWidth.dp, height = style.trackHeight.dp),
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .clip(trackShape)
                .background(style.trackColor)
                .border(
                    border = BorderStroke(style.trackBorderWidth.dp, style.trackBorderColor),
                    shape = trackShape,
                ),
        )

        KiskadeeSwitchThumb(
            checked = checked,
            style = style,
            showsIcon = showsIcon,
            showsActivationFeedback = showsActivationFeedback,
            modifier = Modifier.offset(
                x = style.trackPaddingLeft.dp + renderedThumbOffset,
                y = thumbVerticalOffset(style).dp,
            ),
        )
    }
}

@Composable
private fun KiskadeeSwitchThumb(
    checked: Boolean,
    style: KiskadeeSwitchResolvedStyle,
    showsIcon: Boolean,
    showsActivationFeedback: Boolean,
    modifier: Modifier = Modifier,
) {
    val targetThumbWidth = if (checked) style.thumbWidth else style.thumbRestWidth
    val targetThumbHeight = if (checked) style.thumbHeight else style.thumbRestHeight
    val thumbWidth by animateDpAsState(
        targetValue = targetThumbWidth.dp,
        animationSpec = thumbMotionSpec(),
    )
    val thumbHeight by animateDpAsState(
        targetValue = targetThumbHeight.dp,
        animationSpec = thumbMotionSpec(),
    )
    val thumbRadius = min(style.thumbRadius, min(thumbWidth.value, thumbHeight.value) / 2f).dp

    Box(
        modifier = modifier.size(width = style.thumbWidth.dp, height = style.thumbHeight.dp),
        contentAlignment = Alignment.Center,
    ) {
        KiskadeeSwitchActivationFeedback(
            style = style,
            thumbWidth = thumbWidth,
            thumbHeight = thumbHeight,
            thumbRadius = thumbRadius.value,
            visible = showsActivationFeedback,
        )

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
private fun KiskadeeSwitchActivationFeedback(
    style: KiskadeeSwitchResolvedStyle,
    thumbWidth: androidx.compose.ui.unit.Dp,
    thumbHeight: androidx.compose.ui.unit.Dp,
    thumbRadius: Float,
    visible: Boolean,
) {
    val color = style.activationFeedbackColor ?: return
    val size = style.activationFeedbackSize

    if (size <= 0f) {
        return
    }

    val alpha by animateFloatAsState(
        targetValue = if (visible) 1f else 0f,
        animationSpec = spring(
            dampingRatio = Spring.DampingRatioNoBouncy,
            stiffness = Spring.StiffnessMedium,
        ),
    )
    val feedbackShape = RoundedCornerShape((thumbRadius + size / 2f).dp)

    Box(
        modifier = Modifier
            .size(width = thumbWidth + size.dp, height = thumbHeight + size.dp)
            .alpha(alpha)
            .border(
                border = BorderStroke(size.dp, color.copy(alpha = style.activationFeedbackOpacity)),
                shape = feedbackShape,
            ),
    )
}

@Composable
private fun KiskadeeSwitchIcon(
    checked: Boolean,
    color: Color,
    width: Float,
    height: Float,
) {
    Image(
        painter = painterResource(
            id = if (checked) {
                R.drawable.kiskadee_lucide_check
            } else {
                R.drawable.kiskadee_lucide_minus
            },
        ),
        contentDescription = null,
        modifier = Modifier.size(width = width.dp, height = height.dp),
        contentScale = ContentScale.Fit,
        colorFilter = ColorFilter.tint(color),
    )
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

private fun thumbTravel(style: KiskadeeSwitchResolvedStyle): Float {
    return max(0f, style.trackWidth - style.trackPaddingLeft - style.trackPaddingRight - style.thumbWidth)
}

private fun thumbVerticalOffset(style: KiskadeeSwitchResolvedStyle): Float {
    val availableHeight = style.trackHeight - style.trackPaddingTop - style.trackPaddingBottom

    return style.trackPaddingTop + max(0f, availableHeight - style.thumbHeight) / 2f
}

private fun clampThumbOffset(offset: Float, style: KiskadeeSwitchResolvedStyle): Float {
    return min(max(0f, offset), thumbTravel(style))
}

private fun <T> thumbMotionSpec() = spring<T>(
    dampingRatio = Spring.DampingRatioNoBouncy,
    stiffness = Spring.StiffnessMedium,
)

private const val ACTIVATION_FEEDBACK_DURATION_MILLIS = 140L
private const val TAP_MOVEMENT_THRESHOLD_PX = 1f
