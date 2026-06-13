import Foundation
import SwiftUI

public struct KiskadeeSwitch: View {
    @Binding private var isOn: Bool

    private let label: String?
    private let theme: KiskadeeTheme
    private let isDisabled: Bool
    private let isInteractionLocked: Bool
    private let interactionCooldown: TimeInterval
    private let showsIcon: Bool

    @State private var isPressed = false
    @State private var dragOffset: CGFloat?
    @State private var gestureStartIsOn: Bool?
    @State private var hasChangedCurrentGesture = false
    @State private var isCoolingDown = false
    @State private var showsActivationFeedback = false
    @State private var cooldownTask: Task<Void, Never>?
    @State private var activationFeedbackTask: Task<Void, Never>?

    public init(
        isOn: Binding<Bool>,
        label: String? = nil,
        theme: KiskadeeTheme,
        isDisabled: Bool = false,
        isInteractionLocked: Bool = false,
        interactionCooldown: TimeInterval = 0,
        showsIcon: Bool = false
    ) {
        self._isOn = isOn
        self.label = label
        self.theme = theme
        self.isDisabled = isDisabled
        self.isInteractionLocked = isInteractionLocked
        self.interactionCooldown = max(0, interactionCooldown)
        self.showsIcon = showsIcon
    }

    public var body: some View {
        switch Result(catching: {
            try KiskadeeSwitchResolver.resolve(
                theme: theme,
                isOn: isOn,
                isPressed: isPressed,
                isDisabled: isDisabled
            )
        }) {
        case let .success(style):
            content(style: style)
        case let .failure(error):
            Text(error.localizedDescription)
                .font(.caption)
                .foregroundStyle(.red)
        }
    }

    private func content(style: KiskadeeSwitchResolvedStyle) -> some View {
        HStack(spacing: 0) {
            if let label {
                Text(label)
                    .font(.system(size: style.labelTextSize ?? 14))
                    .lineSpacing(lineSpacing(style: style))
                    .foregroundStyle(style.labelColor ?? .primary)
                    .padding(.leading, style.labelMarginLeft)
                    .padding(.trailing, style.labelMarginRight)
            }

            switchControl(style: style)
        }
        .fixedSize(horizontal: false, vertical: true)
        .contentShape(Rectangle())
        .gesture(switchGesture(style: style))
        .opacity(isDisabled ? 0.96 : 1)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(label ?? "Switch")
        .accessibilityValue(isOn ? "On" : "Off")
        .accessibilityAddTraits(isOn ? [.isSelected] : [])
        .accessibilityAction {
            toggle()
        }
    }

    private func switchControl(style: KiskadeeSwitchResolvedStyle) -> some View {
        ZStack(alignment: .topLeading) {
            track(style: style)

            thumbCarrier(style: style)
                .offset(
                    x: style.trackPaddingLeft + thumbOffset(style: style),
                    y: thumbVerticalOffset(style: style)
                )
        }
        .frame(width: style.trackWidth, height: style.trackHeight)
        .animation(.spring(response: 0.22, dampingFraction: 0.86), value: isOn)
        .animation(.easeOut(duration: 0.12), value: isPressed)
        .animation(.easeOut(duration: 0.12), value: showsActivationFeedback)
    }

    private func track(style: KiskadeeSwitchResolvedStyle) -> some View {
        RoundedRectangle(cornerRadius: style.trackRadius, style: .continuous)
            .fill(style.trackColor)
            .overlay {
                RoundedRectangle(cornerRadius: style.trackRadius, style: .continuous)
                    .stroke(style.trackBorderColor, lineWidth: style.trackBorderWidth)
            }
            .frame(width: style.trackWidth, height: style.trackHeight)
    }

    @ViewBuilder
    private func activationFeedbackHalo(
        style: KiskadeeSwitchResolvedStyle,
        thumbWidth: CGFloat,
        thumbHeight: CGFloat,
        thumbRadius: CGFloat
    ) -> some View {
        if let color = style.activationFeedbackColor, style.activationFeedbackSize > 0 {
            let size = style.activationFeedbackSize

            RoundedRectangle(cornerRadius: thumbRadius + size / 2, style: .continuous)
                .stroke(color.opacity(style.activationFeedbackOpacity), lineWidth: size)
                .frame(width: thumbWidth + size, height: thumbHeight + size)
                .opacity(showsActivationFeedback ? 1 : 0)
                .allowsHitTesting(false)
        }
    }

    private func thumbCarrier(style: KiskadeeSwitchResolvedStyle) -> some View {
        let thumbWidth = isOn ? style.thumbWidth : style.thumbRestWidth
        let thumbHeight = isOn ? style.thumbHeight : style.thumbRestHeight
        let radius = min(style.thumbRadius, min(thumbWidth, thumbHeight) / 2)

        return ZStack {
            activationFeedbackHalo(
                style: style,
                thumbWidth: thumbWidth,
                thumbHeight: thumbHeight,
                thumbRadius: radius
            )

            RoundedRectangle(cornerRadius: radius, style: .continuous)
                .fill(style.thumbColor)
                .frame(width: thumbWidth, height: thumbHeight)

            if showsIcon, let iconColor = style.iconColor {
                Image(systemName: isOn ? "checkmark" : "minus")
                    .font(.system(size: iconSize(style: style), weight: .bold))
                    .foregroundStyle(iconColor)
            }
        }
        .frame(width: style.thumbWidth, height: style.thumbHeight)
    }

    private func switchGesture(style: KiskadeeSwitchResolvedStyle) -> some Gesture {
        DragGesture(minimumDistance: 0)
            .onChanged { value in
                guard beginOrContinueGesture() else { return }

                isPressed = true

                let nextOffset = projectedThumbOffset(from: value, style: style)
                dragOffset = nextOffset
                commitIfDragReachedExtreme(nextOffset, style: style)
            }
            .onEnded { value in
                guard !isDisabled && !isInteractionLocked else {
                    resetInteraction()
                    return
                }

                if isTap(value) {
                    _ = commitInteraction(!isOn, startsCooldown: false)
                    resetInteraction(startsCooldown: true)
                    return
                }

                let finalOffset = projectedThumbOffset(from: value, style: style)
                let shouldBeOn = finalOffset >= thumbTravel(style: style) / 2
                _ = commitInteraction(shouldBeOn, startsCooldown: false)
                resetInteraction(startsCooldown: true)
            }
    }

    private func toggle() {
        guard canStartInteraction else { return }

        triggerActivationFeedback()
        _ = commitInteraction(!isOn)
    }

    @discardableResult
    private func commitInteraction(_ nextValue: Bool, startsCooldown: Bool = true) -> Bool {
        guard !isDisabled && !isInteractionLocked else { return false }
        guard nextValue != isOn else { return false }

        if gestureStartIsOn != nil {
            hasChangedCurrentGesture = true
        }

        withAnimation(.spring(response: 0.22, dampingFraction: 0.86)) {
            isOn = nextValue
        }

        if startsCooldown {
            startInteractionCooldown()
        }

        return true
    }

    private func resetInteraction(startsCooldown: Bool = false) {
        let shouldStartCooldown = startsCooldown && hasChangedCurrentGesture

        isPressed = false
        dragOffset = nil
        gestureStartIsOn = nil
        hasChangedCurrentGesture = false

        if shouldStartCooldown {
            startInteractionCooldown()
        }
    }

    private var canStartInteraction: Bool {
        !isDisabled && !isInteractionLocked && !isCoolingDown
    }

    private func beginOrContinueGesture() -> Bool {
        if isDisabled || isInteractionLocked {
            resetInteraction()
            return false
        }

        guard gestureStartIsOn != nil else {
            guard !isCoolingDown else { return false }
            gestureStartIsOn = isOn
            hasChangedCurrentGesture = false
            triggerActivationFeedback()

            return true
        }

        return true
    }

    private func commitIfDragReachedExtreme(_ offset: CGFloat, style: KiskadeeSwitchResolvedStyle) {
        guard gestureStartIsOn != nil else { return }
        let travel = thumbTravel(style: style)
        guard travel > 0 else { return }

        let nextValue: Bool?
        if offset <= 0 {
            nextValue = false
        } else if offset >= travel {
            nextValue = true
        } else {
            nextValue = nil
        }

        guard let nextValue, nextValue != isOn else { return }

        if commitInteraction(nextValue, startsCooldown: false) {
            dragOffset = nextValue ? travel : 0
        }
    }

    private func startInteractionCooldown() {
        cooldownTask?.cancel()

        guard interactionCooldown > 0 else {
            isCoolingDown = false
            return
        }

        isCoolingDown = true
        cooldownTask = Task { @MainActor in
            let nanoseconds = UInt64(interactionCooldown * 1_000_000_000)
            try? await Task.sleep(nanoseconds: nanoseconds)

            if !Task.isCancelled {
                isCoolingDown = false
            }
        }
    }

    private func triggerActivationFeedback() {
        activationFeedbackTask?.cancel()

        showsActivationFeedback = true
        activationFeedbackTask = Task { @MainActor in
            try? await Task.sleep(nanoseconds: 140_000_000)

            if !Task.isCancelled {
                showsActivationFeedback = false
            }
        }
    }

    private func projectedThumbOffset(from value: DragGesture.Value, style: KiskadeeSwitchResolvedStyle) -> CGFloat {
        clampThumbOffset(
            ((gestureStartIsOn ?? isOn) ? thumbTravel(style: style) : 0) + value.translation.width,
            style: style
        )
    }

    private func thumbOffset(style: KiskadeeSwitchResolvedStyle) -> CGFloat {
        dragOffset ?? (isOn ? thumbTravel(style: style) : 0)
    }

    private func thumbTravel(style: KiskadeeSwitchResolvedStyle) -> CGFloat {
        max(0, style.trackWidth - style.trackPaddingLeft - style.trackPaddingRight - style.thumbWidth)
    }

    private func thumbVerticalOffset(style: KiskadeeSwitchResolvedStyle) -> CGFloat {
        let availableHeight = style.trackHeight - style.trackPaddingTop - style.trackPaddingBottom

        return style.trackPaddingTop + max(0, availableHeight - style.thumbHeight) / 2
    }

    private func clampThumbOffset(_ offset: CGFloat, style: KiskadeeSwitchResolvedStyle) -> CGFloat {
        min(max(0, offset), thumbTravel(style: style))
    }

    private func isTap(_ value: DragGesture.Value) -> Bool {
        max(abs(value.translation.width), abs(value.translation.height)) < 1
    }

    private func iconSize(style: KiskadeeSwitchResolvedStyle) -> CGFloat {
        min(style.iconWidth ?? 16, style.iconHeight ?? 16) * 0.72
    }

    private func lineSpacing(style: KiskadeeSwitchResolvedStyle) -> CGFloat {
        guard let textSize = style.labelTextSize,
              let lineHeight = style.labelLineHeight
        else {
            return 0
        }

        return max(0, lineHeight - textSize)
    }
}

public enum KiskadeeSwitchSchemaValidator {
    public static func validate(theme: KiskadeeTheme) throws {
        _ = try KiskadeeSwitchResolver.resolve(
            theme: theme,
            isOn: false,
            isPressed: false,
            isDisabled: false
        )
        _ = try KiskadeeSwitchResolver.resolve(
            theme: theme,
            isOn: true,
            isPressed: false,
            isDisabled: true
        )
    }
}
