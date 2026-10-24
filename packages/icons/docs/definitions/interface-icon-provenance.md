# Interface Icon Provenance

The first Web adapter set is pinned through package manifests and the workspace lockfile.
Kiskadee maps a curated semantic subset; it does not copy or claim ownership of the upstream
catalogs.

| Family ID | Upstream package or service | Version/variants | License |
| --- | --- | --- | --- |
| `lucide` | `lucide-react` | `1.27.0`; Kiskadee `thin`, `regular`, `bold` stroke profiles | ISC |
| `fluent-system` | `@fluentui/react-icons` | `2.0.334`, Regular | MIT |
| `material-symbols` | Google Fonts Material Symbols | Outlined, FILL 0/1, weight 400, grade 0, optical size 24 | Apache-2.0 |
| `carbon` | `@carbon/icons-react` | `11.85.0`, standard | Apache-2.0 |
| `iconoir` | `iconoir-react` | `7.11.1`, Regular | MIT |
| `phosphor` | `@phosphor-icons/react` | `2.1.10`; Thin, Regular, Fill, Duotone | MIT |
| `font-awesome-classic` | `@fortawesome/free-solid-svg-icons` | `7.3.1`, Classic Free Solid | CC-BY-4.0 and MIT |

Primary sources:

- [Lucide](https://lucide.dev)
- [Fluent UI System Icons](https://github.com/microsoft/fluentui-system-icons)
- [Material Symbols](https://developers.google.com/fonts/docs/material_symbols)
- [Carbon Icons](https://carbondesignsystem.com/elements/icons/code/)
- [Iconoir](https://iconoir.com)
- [Phosphor](https://phosphoricons.com)
- [Font Awesome SVG icons](https://docs.fontawesome.com/web/add-icons/)
- [SF Symbols](https://developer.apple.com/sf-symbols/)

The libraries are optional peers of `@kiskadee/icons`. The package's build environment installs
all of them to validate adapters; a consumer installs only the selected static family, or all
families when opting into the broad lazy catalog.

Fluent, Phosphor, and Font Awesome adapters import the documented per-glyph subpaths exposed by
their packages. Font Awesome definitions are rendered by Kiskadee's small presentation-only SVG
adapter, so selecting that family does not add Font Awesome's React runtime or global library.

Iconoir Solid and Font Awesome Classic Free Regular remain partial relative to the canonical
contract. Kiskadee requires complete canonical coverage for every exposed official variant, so
both remain deferred. No visual fallback fills their missing concepts.

The canonical `radio-selected` mapping uses `CircleSmallIcon`, `CircleSmallFilled`, `DotMark`,
`Circle`, `DotIcon`, `faCircle`, and Material Symbols `circle` for Lucide, Fluent, Carbon, Iconoir,
Phosphor, Font Awesome, and Material respectively. Iconoir, Font Awesome, and Material apply
mapping-local fill or optical defaults in generated adapters; no CSS pseudo-element supplies the
radio dot.

The canonical `cart` CP-I concept uses `ShoppingCartIcon`, `CartRegular`, `ShoppingCart`, `Cart`,
`ShoppingCartIcon`, `faCartShopping`, and Material Symbols `shopping_cart` for those same families.
It remains consumer-provided content: adding complete family coverage does not promote it to the
limited Essential Icon catalog.

The canonical `lock` concept uses `LockKeyholeIcon`, `LockClosedRegular`, `Locked`, `Lock`,
`LockSimpleIcon`, `faLock`, and Material Symbols `lock` for Lucide, Fluent, Carbon, Iconoir,
Phosphor, Font Awesome, and Material respectively. All mappings are fixed in RTL, use the pinned
upstream releases above, and cover every exposed family variant without artwork substitution.

The canonical `eye` / `eye-off` concepts map to the following pinned upstream artwork. Both are
`fixed` in RTL and retain all exposed variants; no rendering fallback substitutes another family.

| Family | `eye` | `eye-off` |
| --- | --- | --- |
| Lucide | `EyeIcon` | `EyeOffIcon` |
| Fluent System | `EyeRegular` | `EyeOffRegular` |
| Material Symbols | `visibility` | `visibility_off` |
| Carbon | `View` | `ViewOff` |
| Iconoir | `Eye` | `EyeClosed` |
| Phosphor | `EyeIcon` | `EyeSlashIcon` |
| Font Awesome Classic | `faEye` | `faEyeSlash` |

The Material ligatures belong to the shared outlined font subset for both FILL variants. Iconoir's
concealed concept uses its native closed-eye glyph rather than synthetic slash artwork. These
canonical additions do not extend the Essential Icon map or select artwork inside TextField.

The common meeting-action concepts use the pinned native exports below. Every exposed variant
shares its family's semantic mappings and keeps fixed RTL direction. These remain generic
interface concepts; the Button Showcase's meeting bar is an application composition.

| Canonical concept | Lucide | Fluent System | Carbon | Iconoir | Phosphor | Font Awesome Classic | Material Symbols |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `record` | `CircleDotIcon` | `RecordRegular` | `Recording` | `Circle` with mapping-local fill | `RecordIcon` | `faCircleDot` | `radio_button_checked` |
| `chat` | `MessageCircleIcon` | `ChatRegular` | `Chat` | `ChatBubble` | `ChatCircleIcon` | `faComment` | `chat_bubble` |
| `users` | `UsersIcon` | `PeopleRegular` | `UserMultiple` | `Group` | `UsersIcon` | `faUserGroup` | `group` |
| `hand` | `HandIcon` | `HandRightRegular` | `TouchInteraction` | `OpenSelectHandGesture` | `HandPalmIcon` | `faHand` | `front_hand` |
| `grid` | `Grid2X2Icon` | `GridRegular` | `Grid` | `ViewGrid` | `GridFourIcon` | `faTableCellsLarge` | `grid_view` |
| `ellipsis` | `EllipsisIcon` | `MoreHorizontalRegular` | `OverflowMenuHorizontal` | `MoreHoriz` | `DotsThreeIcon` | `faEllipsis` | `more_horiz` |
| `video` | `VideoIcon` | `VideoRegular` | `Video` | `VideoCamera` | `VideoCameraIcon` | `faVideo` | `videocam` |
| `mic` | `MicIcon` | `MicRegular` | `Microphone` | `Microphone` | `MicrophoneIcon` | `faMicrophone` | `mic` |
| `screen-share` | `ScreenShareIcon` | `ShareScreenStartRegular` | `Screen` | `UploadDataWindow` | `ScreencastIcon` | `faArrowUpFromBracket` | `present_to_all` |
| `phone-hangup` | `PhoneOffIcon` | `CallEndRegular` | `PhoneOff` | `PhoneXmark` | `PhoneDisconnectIcon` | `faPhoneSlash` | `call_end` |

Family language differs deliberately: Carbon's hand is a touch gesture; screen sharing can use
a monitor, broadcast display, or upward sharing tray; ending a call can use a lowered handset,
a slash, or a dismissal mark. These native approximations preserve the action concept without
mixing families or drawing synthetic artwork. The consuming Button's visible label supplies the
specific operation. Iconoir's recording dot uses its native circle with mapping-local fill;
Fluent's `RecordRegular` uses a ring and center dot, distinct from the essential menu-radio dot.
