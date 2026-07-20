package com.kiskadee.android.showcase

import android.content.Context
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.kiskadee.android.components.switchcontrol.KiskadeeSwitch
import com.kiskadee.android.components.switchcontrol.KiskadeeSwitchSchemaValidator
import com.kiskadee.android.schema.KiskadeeSchemaLoader
import com.kiskadee.android.theme.KiskadeeTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContentView(
            ComposeView(this).apply {
                setContent {
                    ShowcaseApp()
                }
            },
        )
    }
}

@Composable
private fun ShowcaseApp() {
    val context = LocalContext.current
    var selectedPreset by remember { mutableStateOf(ShowcaseSwitchPreset.materialGoogle) }
    val themeResult = remember(context, selectedPreset.id) {
        loadTheme(context, selectedPreset)
    }

    MaterialTheme {
        Surface(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.White),
            color = Color.White,
        ) {
            ShowcaseContent(
                selectedPreset = selectedPreset,
                onPresetSelected = { selectedPreset = it },
                themeResult = themeResult,
            )
        }
    }
}

@Composable
private fun ShowcaseContent(
    selectedPreset: ShowcaseSwitchPreset,
    onPresetSelected: (ShowcaseSwitchPreset) -> Unit,
    themeResult: Result<KiskadeeTheme>,
) {
    val theme = themeResult.getOrNull()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(28.dp),
        verticalArrangement = Arrangement.Top,
    ) {
        Text(
            text = "Kiskadee Android",
            color = Color(0xFF1D1B20),
            style = MaterialTheme.typography.headlineSmall,
        )

        Spacer(modifier = Modifier.height(28.dp))

        PresetPicker(
            selectedPreset = selectedPreset,
            onPresetSelected = onPresetSelected,
        )

        Spacer(modifier = Modifier.height(28.dp))

        if (theme == null) {
            Text(
                text = themeResult.exceptionOrNull()?.message ?: "Unable to load Kiskadee schema.",
                color = Color(0xFFB3261E),
            )
        } else {
            SwitchExamples(theme)
        }
    }
}

@Composable
private fun PresetPicker(
    selectedPreset: ShowcaseSwitchPreset,
    onPresetSelected: (ShowcaseSwitchPreset) -> Unit,
) {
    var expanded by remember { mutableStateOf(false) }

    Column {
        Text(
            text = "Preset",
            color = Color(0xFF5F5E62),
            style = MaterialTheme.typography.labelMedium,
        )

        Spacer(modifier = Modifier.height(8.dp))

        Box {
            OutlinedButton(
                onClick = { expanded = true },
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text(selectedPreset.title)
            }

            DropdownMenu(
                expanded = expanded,
                onDismissRequest = { expanded = false },
            ) {
                ShowcaseSwitchPreset.all.forEach { preset ->
                    DropdownMenuItem(
                        text = { Text(preset.title) },
                        onClick = {
                            expanded = false
                            onPresetSelected(preset)
                        },
                    )
                }
            }
        }
    }
}

@Composable
private fun SwitchExamples(theme: KiskadeeTheme) {
    var mainSwitch by remember { mutableStateOf(false) }
    var iconSwitch by remember { mutableStateOf(true) }
    var cooldownSwitch by remember { mutableStateOf(false) }
    var lockedSwitch by remember { mutableStateOf(true) }

    Column(verticalArrangement = Arrangement.Top) {
        KiskadeeSwitch(
            checked = mainSwitch,
            onCheckedChange = { mainSwitch = it },
            label = "Default",
            theme = theme,
        )

        Spacer(modifier = Modifier.height(28.dp))

        KiskadeeSwitch(
            checked = iconSwitch,
            onCheckedChange = { iconSwitch = it },
            label = "With icon",
            theme = theme,
            showsIcon = true,
        )

        Spacer(modifier = Modifier.height(28.dp))

        KiskadeeSwitch(
            checked = cooldownSwitch,
            onCheckedChange = { cooldownSwitch = it },
            label = "Cooldown",
            theme = theme,
            interactionCooldownMillis = 3_000,
        )

        Spacer(modifier = Modifier.height(28.dp))

        KiskadeeSwitch(
            checked = lockedSwitch,
            onCheckedChange = { lockedSwitch = it },
            label = "Interaction locked",
            theme = theme,
            interactionLocked = true,
        )

        Spacer(modifier = Modifier.height(28.dp))

        KiskadeeSwitch(
            checked = false,
            onCheckedChange = {},
            label = "Disabled off",
            theme = theme,
            enabled = false,
        )

        Spacer(modifier = Modifier.height(28.dp))

        KiskadeeSwitch(
            checked = true,
            onCheckedChange = {},
            label = "Disabled on",
            theme = theme,
            enabled = false,
            showsIcon = true,
        )
    }
}

private fun loadTheme(
    context: Context,
    preset: ShowcaseSwitchPreset,
): Result<KiskadeeTheme> {
    return runCatching {
        val schema = KiskadeeSchemaLoader.loadFromAsset(
            context = context,
            assetName = preset.assetName,
        )

        KiskadeeTheme(schema).also(KiskadeeSwitchSchemaValidator::validate)
    }
}

private data class ShowcaseSwitchPreset(
    val id: String,
    val title: String,
    val assetName: String,
) {
    companion object {
        val materialGoogle = ShowcaseSwitchPreset(
            id = "material-3-google",
            title = "Material Design 3 by Google",
            assetName = "material-3-google-switch.schema.json",
        )

        val all = listOf(
            ShowcaseSwitchPreset(
                id = "carbon-ibm",
                title = "Carbon by IBM",
                assetName = "carbon-ibm-switch.schema.json",
            ),
            ShowcaseSwitchPreset(
                id = "fluent-2-microsoft",
                title = "Fluent 2 by Microsoft",
                assetName = "fluent-2-microsoft-switch.schema.json",
            ),
            ShowcaseSwitchPreset(
                id = "ios-27-apple",
                title = "iOS 27 by Apple",
                assetName = "ios-27-apple-switch.schema.json",
            ),
            materialGoogle,
            ShowcaseSwitchPreset(
                id = "material-3-kiskadee",
                title = "Material Design 3 by Kiskadee",
                assetName = "material-3-kiskadee-switch.schema.json",
            ),
        )
    }
}
