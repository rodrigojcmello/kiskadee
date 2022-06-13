Limitations

- **Gradient border** is rare in design systems, with Microsoft's Fluent being one of the big adherents, but neither 
  the Web and Android versions of Fluent use this feature, which should indicate an equal understanding of the 
  limitations  of each platform, being applied only on Windows 11, and for that reason we chose not to support 
  gradient borders. If the gradient border becomes popular or the native features of each platform allow it more 
  easily, we may review this feature in the future.
- **Focus** in Carbon Design System would need an extra layer to support its blue border for focus state, we 
  chose not to support this feature for simplicity and performance reasons. And its official web library is used border 
  property, but we disagreed with this approach, boarders shouldn't be used for focus state.
- **Transitions** between states are not customizable. We may review this in the future.

Experience

- **Warning** - It is not a consensus to have a warning button in most design systems, but it appears with some  
  frequency, for now the warning state will remain, but it will be reviewed in the future.
- **Secondary / Help / Info** are states that can be found in some UI kits or Design Systems, but in general they are 
  even less used than the warning state, for these cases it is recommended to create a new theme and override it in 
  scope  of the button. If any of these states become popular, we will review their adoption in the standard states.
- **Minimum width** - not all design systems specifies a minimum width for buttons, in this case we chose to keep 
  the minimum width as 100px.
- **Icons** - Few documentations refer to icons on buttons, in these cases, instead of not supporting icons or being 
  limited to bad examples from the documentation itself, we chose to keep the use of icons free, except when the 
  documentation clearly condemns the use, such as Carbon .

Themes

- **Native focus** - Design systems created for mobile devices usually don't care about focus (like iOS 15), in 
  these cases instead  of just removing this feature, we chose to keep at least the native experience of each 
  platform. The complete removal of this feature to strictly adhere to its design system may be reviewed in the future.

