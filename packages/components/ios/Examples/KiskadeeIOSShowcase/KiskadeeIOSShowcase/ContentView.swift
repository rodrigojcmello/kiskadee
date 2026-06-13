import KiskadeeIOS
import SwiftUI

struct ContentView: View {
    @StateObject private var schemaStore = ShowcaseSchemaStore()
    @State private var mainSwitch = false
    @State private var iconSwitch = true

    var body: some View {
        NavigationStack {
            ZStack(alignment: .topLeading) {
                if let theme = schemaStore.theme {
                    VStack(alignment: .leading, spacing: 28) {
                        KiskadeeSwitch(
                            isOn: $mainSwitch,
                            label: "Material switch",
                            theme: theme
                        )

                        KiskadeeSwitch(
                            isOn: $iconSwitch,
                            label: "With icon",
                            theme: theme,
                            showsIcon: true
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

                        Spacer()
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(28)
                } else {
                    Text(schemaStore.errorMessage ?? "Loading schema")
                        .font(.callout)
                        .foregroundStyle(schemaStore.errorMessage == nil ? Color.secondary : Color.red)
                        .padding(28)
                }
            }
            .navigationTitle("Kiskadee iOS")
        }
    }
}

@MainActor
final class ShowcaseSchemaStore: ObservableObject {
    @Published private(set) var theme: KiskadeeTheme?
    @Published private(set) var errorMessage: String?

    init() {
        load()
    }

    private func load() {
        do {
            guard let url = Bundle.main.url(
                forResource: "material-3-google-switch.schema",
                withExtension: "json"
            ) else {
                throw ShowcaseSchemaError.missingFixture
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
    case missingFixture

    var errorDescription: String? {
        "The Material switch schema fixture was not found in the app bundle."
    }
}
