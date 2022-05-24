Limitations

- Gradient border - is rare in design systems, with Microsoft's Fluent as the main adept, but neither the Web and Android versions of Fluent use this feature, which should indicate an equal understanding of the limitations of each platform, being applied only on Windows 11, and for that reason we chose not to support gradient borders. If the gradient border becomes popular or the native features of each platform allow it more easily, we can review this feature in the future.
- Transitions - between states are not customizable. We may review this in the future.

Experience

- Focus - Design systems created for mobile devices usually don't care about focus (like Material and iOS), in these cases instead of just removing this feature, we chose to keep at least the native experience of each platform. The complete removal of this feature to strictly adhere to its design system may be reviewed in the future
- Warning - It is not a consensus to have a warning button in most design systems, but it appears with some frequency, for now the warning state will remain, but it will be reviewed in the future. Other styles like info and help, which we can find in some UI Kits, are even rarer than warning, for these cases we recommend using variants of the button to cover these styles. If Info and Help become more popular, we may revise their additions to the default style states.
- Help / Info - are states that we can find in some UI Kits but in general they are even less used than warning, for these cases we recommend using button variants to cover these styles. If Info and Help become more popular, we may revise their additions to the default style states.

Legacy

- Visited - This state is definitely not used as much anymore, especially in recent projects, but as in the button we have the flat state that supports link, and we decided to keep the visited state to cover the widest possible variety of states.