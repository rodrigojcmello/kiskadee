package com.kiskadee.android.showcase

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
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
import androidx.compose.ui.unit.dp
import com.kiskadee.android.components.switchcontrol.KiskadeeSwitch
import com.kiskadee.android.components.switchcontrol.KiskadeeSwitchSchemaValidator
import com.kiskadee.android.schema.KiskadeeSchemaLoader
import com.kiskadee.android.theme.KiskadeeTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val themeResult = runCatching {
            val schema = KiskadeeSchemaLoader.loadFromAsset(
                context = this,
                assetName = "material-3-google-switch.kiskadee-android.json",
            )
            KiskadeeTheme(schema).also(KiskadeeSwitchSchemaValidator::validate)
        }

        setContentView(
            ComposeView(this).apply {
                setContent {
                    ShowcaseApp(themeResult)
                }
            },
        )
    }
}

@Composable
private fun ShowcaseApp(themeResult: Result<KiskadeeTheme>) {
    MaterialTheme {
        Surface(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.White),
            color = Color.White,
        ) {
            val theme = themeResult.getOrNull()

            if (theme == null) {
                Text(
                    text = themeResult.exceptionOrNull()?.message ?: "Unable to load Kiskadee schema.",
                    color = Color(0xFFB3261E),
                    modifier = Modifier.padding(28.dp),
                )
            } else {
                ShowcaseContent(theme)
            }
        }
    }
}

@Composable
private fun ShowcaseContent(theme: KiskadeeTheme) {
    var mainSwitch by remember { mutableStateOf(false) }
    var iconSwitch by remember { mutableStateOf(true) }

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

        KiskadeeSwitch(
            checked = mainSwitch,
            onCheckedChange = { mainSwitch = it },
            label = "Material switch",
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
