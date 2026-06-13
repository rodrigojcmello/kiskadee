import KiskadeeIOS
import SwiftUI

struct ContentView: View {
    @StateObject private var schemaStore = ShowcaseSchemaStore()
    @State private var mainSwitch = false
    @State private var iconSwitch = true
    @State private var cooldownSwitch = false

    var body: some View {
        NavigationStack {
            ZStack(alignment: .topLeading) {
                VStack(alignment: .leading, spacing: 28) {
                    presetPicker

                    if let theme = schemaStore.theme {
                        switchExamples(theme: theme)
                    } else {
                        Text(schemaStore.errorMessage ?? "Loading schema")
                            .font(.callout)
                            .foregroundStyle(schemaStore.errorMessage == nil ? Color.secondary : Color.red)
                    }

                    Spacer()
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(28)
            }
            .navigationTitle("Kiskadee iOS")
        }
    }

    private var selectedPresetBinding: Binding<String> {
        Binding(
            get: { schemaStore.selectedPresetID },
            set: { schemaStore.selectPreset(id: $0) }
        )
    }

    private var presetPicker: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Preset")
                .font(.caption)
                .foregroundStyle(.secondary)

            Picker("Preset", selection: selectedPresetBinding) {
                ForEach(ShowcaseSwitchPreset.all) { preset in
                    Text(preset.title).tag(preset.id)
                }
            }
            .pickerStyle(.menu)
        }
    }

    private func switchExamples(theme: KiskadeeTheme) -> some View {
        VStack(alignment: .leading, spacing: 28) {
            KiskadeeSwitch(
                isOn: $mainSwitch,
                label: "Default",
                theme: theme
            )

            KiskadeeSwitch(
                isOn: $iconSwitch,
                label: "With icon",
                theme: theme,
                showsIcon: true
            )

            KiskadeeSwitch(
                isOn: $cooldownSwitch,
                label: "Cooldown",
                theme: theme,
                interactionCooldown: 3
            )

            KiskadeeSwitch(
                isOn: .constant(false),
                label: "Disabled off",
                theme: theme,
                isDisabled: true
            )

            KiskadeeSwitch(
                isOn: .constant(true),
                label: "Disabled on",
                theme: theme,
                isDisabled: true,
                showsIcon: true
            )
        }
    }
}

private struct ShowcaseSwitchPreset: Identifiable, Hashable {
    let id: String
    let title: String
    let resourceName: String

    static let materialGoogle = ShowcaseSwitchPreset(
        id: "material-3-google",
        title: "Material Design 3 by Google",
        resourceName: "material-3-google-switch.schema"
    )

    static let all = [
        ShowcaseSwitchPreset(
            id: "carbon-ibm",
            title: "Carbon by IBM",
            resourceName: "carbon-ibm-switch.schema"
        ),
        ShowcaseSwitchPreset(
            id: "fluent-2-microsoft",
            title: "Fluent 2 by Microsoft",
            resourceName: "fluent-2-microsoft-switch.schema"
        ),
        ShowcaseSwitchPreset(
            id: "ios-26-apple",
            title: "iOS 26 by Apple",
            resourceName: "ios-26-apple-switch.schema"
        ),
        materialGoogle,
        ShowcaseSwitchPreset(
            id: "material-3-kiskadee",
            title: "Material Design 3 by Kiskadee",
            resourceName: "material-3-kiskadee-switch.schema"
        )
    ]
}

@MainActor
final class ShowcaseSchemaStore: ObservableObject {
    @Published private(set) var theme: KiskadeeTheme?
    @Published private(set) var errorMessage: String?
    @Published private(set) var selectedPresetID: String

    init() {
        let initialPreset = ShowcaseSwitchPreset.materialGoogle
        self.selectedPresetID = initialPreset.id
        load(preset: initialPreset)
    }

    func selectPreset(id: String) {
        guard let preset = ShowcaseSwitchPreset.all.first(where: { $0.id == id }) else {
            return
        }

        guard selectedPresetID != preset.id else {
            return
        }

        selectedPresetID = preset.id
        load(preset: preset)
    }

    private func load(preset: ShowcaseSwitchPreset) {
        theme = nil
        errorMessage = nil

        do {
            guard let url = Bundle.main.url(
                forResource: preset.resourceName,
                withExtension: "json"
            ) else {
                throw ShowcaseSchemaError.missingFixture(preset.title)
            }

            let schema = try KiskadeeSchemaLoader.load(from: url)
            let theme = KiskadeeTheme(schema: schema)
            try KiskadeeSwitchSchemaValidator.validate(theme: theme)
            self.theme = theme
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

private enum ShowcaseSchemaError: Error, LocalizedError {
    case missingFixture(String)

    var errorDescription: String? {
        switch self {
        case let .missingFixture(presetTitle):
            return "The \(presetTitle) switch schema fixture was not found in the app bundle."
        }
    }
}
