import SwiftUI

public struct KiskadeeSwitch: View {
    @Binding private var isOn: Bool

    private let label: String?
    private let theme: KiskadeeTheme
    private let isDisabled: Bool
    private let showsIcon: Bool

    @State private var isPressed = false

    public init(
        isOn: Binding<Bool>,
        label: String? = nil,
        theme: KiskadeeTheme,
        isDisabled: Bool = false,
        showsIcon: Bool = false
    ) {
        self._isOn = isOn
        self.label = label
        self.theme = theme
        self.isDisabled = isDisabled
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
        .gesture(pressGesture)
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
        ZStack {
            RoundedRectangle(cornerRadius: style.trackRadius, style: .continuous)
                .fill(style.trackColor)
                .overlay {
                    RoundedRectangle(cornerRadius: style.trackRadius, style: .continuous)
                        .stroke(style.trackBorderColor, lineWidth: style.trackBorderWidth)
                }

            HStack(spacing: 0) {
                if isOn {
                    Spacer(minLength: 0)
                }

                thumbCarrier(style: style)

                if !isOn {
                    Spacer(minLength: 0)
                }
            }
            .padding(.top, style.trackPaddingTop)
            .padding(.trailing, style.trackPaddingRight)
            .padding(.bottom, style.trackPaddingBottom)
            .padding(.leading, style.trackPaddingLeft)
        }
        .frame(width: style.trackWidth, height: style.trackHeight)
        .animation(.spring(response: 0.22, dampingFraction: 0.86), value: isOn)
        .animation(.easeOut(duration: 0.12), value: isPressed)
    }

    private func thumbCarrier(style: KiskadeeSwitchResolvedStyle) -> some View {
        let thumbWidth = isOn || isPressed ? style.thumbWidth : style.thumbRestWidth
        let thumbHeight = isOn || isPressed ? style.thumbHeight : style.thumbRestHeight
        let radius = min(style.thumbRadius, min(thumbWidth, thumbHeight) / 2)

        return ZStack {
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

    private var pressGesture: some Gesture {
        DragGesture(minimumDistance: 0)
            .onChanged { _ in
                guard !isDisabled else { return }
                isPressed = true
            }
            .onEnded { _ in
                guard !isDisabled else {
                    isPressed = false
                    return
                }

                toggle()
            }
    }

    private func toggle() {
        guard !isDisabled else { return }

        withAnimation(.spring(response: 0.22, dampingFraction: 0.86)) {
            isOn.toggle()
            isPressed = false
        }
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
