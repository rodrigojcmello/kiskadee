# Fluent 2 Microsoft follow-up

## Next decision

- [x] Use Composition A (Dark Blue Highest D18/D10) for the selected Showcase canvas and example Cards, with a neutral left reference in the Button comparison.

| Segment | Current Highest Card | Current companion | Dark-track status |
| --- | --- | --- | --- |
| Microsoft, blue.v1 | D18 `#133d68` | D10 `#142d48` | Composition A |
| Teams, purple.v2 | L60 `#424590` | L65 `#3b3e7d` | Neither |

The proposed Microsoft L70/L80 trial also has no identical D stops (`#123f6b` / `#142e49`).
The existing Medium pair already uses the correct D10/D9 stops. The Blue Highest pair now uses D18/D10 for the visual trial. The Teams pair remains pending.
The measured Button backdrop is another coupled decision: Microsoft Blue L50 `#0064b4`
matches D40, while the Teams Light vivid anchor `#5b5fc7` has no D equivalent. Applying the
same track switch to their shared formula changes Teams. The existing formula was retained.

## Outstanding tonal mappings

- [ ] Review the 79 source coordinates below when this preset is next revised. Each Light tone lacks an exact match in the same Dark family. Record the choice of an existing Dark tone or a retained exception for each approved change.

| Family | Affected producers | Source positions and values |
| --- | --- | --- |
| black.v1 | badge | L5 `#e9e9e9`, L6 `#e5e5e5` |
| black.v1 | badge, button | L12 `#cbcbcb`, L65 `#464646` |
| black.v1 | badge, button, progress | L14 `#c2c2c2` |
| black.v1 | button | L4 `#ededed`, L10 `#d1d1d1`, L85 `#252525` |
| black.v1 | button, select, textField | L8 `#dbdbdb` |
| blue.v1 | badge | L5 `#daebff` |
| blue.v1 | badge, button | L12 `#a4cfff` |
| blue.v1 | badge, button, progress | L14 `#94c7ff` |
| blue.v1 | badge | L65 `#0d477e` |
| blue.v1 | badge, global.foregrounds | L6 `#d3e7ff` |
| blue.v1 | button | L4 `#e1efff`, L10 `#b1d5ff` |
| blue.v1 | switch | L60 `#045091` |
| blue.v1 | global.foregrounds | L2 `#f1f7ff` |
| blue.v1 | icon, select, textField | L8 `#c1deff` |
| blue.v1 | switch | L70 `#123f6b`, L80 `#142e49` |
| blue.v2 | button | L24 `#00a7e9` |
| blue.v2 | button, switch | L20 `#2fb8f9` |
| blue.v2 | global.foregrounds | L14 `#78cdff` |
| blue.v2 | switch | L22 `#0eaff3` |
| green.v1 | badge | L5 `#dbf0d9`, L65 `#155513` |
| green.v1 | badge, button | L12 `#a1dd9c` |
| green.v1 | badge, button, progress | L14 `#91d78c` |
| green.v1 | badge, global.foregrounds | L6 `#d4edd2` |
| green.v1 | button | L4 `#e2f3e0`, L8 `#c3e7c0`, L10 `#afe2ab` |
| green.v1 | global.foregrounds | L2 `#f0faef` |
| green.v1 | switch | L45 `#107c10` |
| green.v2 | button | L20 `#55c850`, L24 `#38b835` |
| orange.v1 | badge | L5 `#ffe2d7`, L12 `#ffb89b`, L65 `#6f3217` |
| orange.v1 | badge, global.foregrounds | L6 `#ffdccf` |
| orange.v1 | badge, progress | L14 `#ffaa89` |
| orange.v1 | global.foregrounds | L2 `#fff4ef` |
| purple.v1 | badge | L5 `#f9e0f4`, L12 `#faaded`, L14 `#fe99ee`, L65 `#6b2762` |
| purple.v1 | badge, global.foregrounds | L6 `#f8daf2` |
| purple.v1 | global.foregrounds | L2 `#fef2fc` |
| purple.v2 | badge | L5 `#e3e8ff` |
| purple.v2 | badge, button | L12 `#bec6ff` |
| purple.v2 | badge, button, progress | L14 `#b4bdff` |
| purple.v2 | badge, container, switch | L65 `#3b3e7d` |
| purple.v2 | badge, global.foregrounds | L6 `#dee3ff` |
| purple.v2 | button | L4 `#e9ecff`, L10 `#c7ceff`, L45 `#5b5fc7` |
| purple.v2 | container | L60 `#424590` |
| purple.v2 | global.foregrounds | L2 `#f4f6ff` |
| purple.v2 | icon, select, textField | L8 `#d2d8ff` |
| purple.v2 | switch | L55 `#494ca1`, L75 `#2d315a` |
| purple.v3 | button | L24 `#a08ae2` |
| purple.v3 | button, switch | L20 `#af9cef` |
| purple.v3 | global.foregrounds | L14 `#c6b5ff` |
| purple.v3 | switch | L22 `#a793e9` |
| red.v1 | badge | L5 `#ffe1de`, L65 `#811819` |
| red.v1 | badge, button | L12 `#ffb5ad` |
| red.v1 | badge, button, progress | L14 `#ffa89f` |
| red.v1 | badge, global.foregrounds | L6 `#ffdbd7` |
| red.v1 | button | L4 `#ffe7e4`, L8 `#ffcdc8`, L10 `#ffc0b9` |
| red.v1 | global.foregrounds | L2 `#fff4f2` |
| red.v2 | button | L20 `#fa8379`, L24 `#ec6f67` |
| yellow.v1 | global.foregrounds | L2 `#fdf5ea`, L6 `#f6e2c4` |

## Explicit theme links

The following authored references request Light in a Dark or Darker destination. Each row represents a distinct reference across its segments and states. Preserve its semantic role and state when reviewing a destination-theme counterpart. A change to these serialized links also needs the usual artifact synchronization in a subsequent authorized batch.

| Authored reference | Consumers |
| --- | --- |
| `contour:neutral.standard.light.onVivid.medium` | components.card |
| `fg:blue.deep.light.onSubtle.high.rest` | components.button |
| `fg:blue.deep.light.onVivid.high.pending` | components.button |
| `fg:blue.deep.light.onVivid.high.rest` | components.button |
| `fg:blue.standard.light.onSubtle.high` | components.button, components.switch |
| `fg:blue.standard.light.onSubtle.high.hover` | components.button, components.switch |
| `fg:blue.standard.light.onSubtle.high.pending` | components.button |
| `fg:blue.standard.light.onSubtle.high.pressed` | components.button, components.switch |
| `fg:blue.standard.light.onSubtle.high.rest` | components.button, components.switch |
| `fg:green.deep.light.onVivid.high.pending` | components.button |
| `fg:green.standard.light.onSubtle.high` | components.button |
| `fg:green.standard.light.onSubtle.high.hover` | components.button |
| `fg:green.standard.light.onSubtle.high.pending` | components.button |
| `fg:green.standard.light.onSubtle.high.pressed` | components.button |
| `fg:green.standard.light.onSubtle.high.rest` | components.switch |
| `fg:neutral.standard.light.onSubtle.high` | components.button, components.switch |
| `fg:neutral.standard.light.onSubtle.high.hover` | components.button |
| `fg:neutral.standard.light.onSubtle.high.pending` | components.button |
| `fg:neutral.standard.light.onSubtle.high.pressed` | components.button |
| `fg:neutral.standard.light.onSubtle.high.rest` | components.button |
| `fg:neutral.standard.light.onSubtle.medium.rest` | components.switch |
| `fg:neutral.standard.light.onVivid.high` | components.button, components.switch |
| `fg:neutral.standard.light.onVivid.high.disabled` | components.button |
| `fg:neutral.standard.light.onVivid.high.pending` | components.button |
| `fg:neutral.standard.light.onVivid.high.pressed` | components.button |
| `fg:neutral.standard.light.onVivid.high.rest` | components.button, components.switch |
| `fg:neutral.standard.light.onVivid.medium` | components.textField |
| `fg:red.deep.light.onVivid.high.pending` | components.button |
| `fg:red.standard.light.onSubtle.high` | components.button, components.switch |
| `fg:red.standard.light.onSubtle.high.hover` | components.button |
| `fg:red.standard.light.onSubtle.high.pending` | components.button |
| `fg:red.standard.light.onSubtle.high.pressed` | components.button |

Related follow-up: [Dark and Darker emphasis names](../dark-card-surface-emphasis.md).

[Workspace tonal origin audit](../tonal-track-origin.md)
