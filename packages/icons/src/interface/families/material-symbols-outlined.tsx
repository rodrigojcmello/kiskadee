// Generated from metadata/interface-families.json. Do not edit manually.
import { defineIconFamily } from '../defineIconFamily.ts';
import {
  createMaterialSymbolGlyph,
  prepareMaterialSymbolsOutlined
} from '../materialSymbols.tsx';
import type { CompleteCanonicalGlyphMap } from '../types.ts';

const materialLigatures = ["account_tree","add","assignment_turned_in","bedtime","block","call_end","cancel","chat_bubble","check","check_circle","circle","close","dark_mode","dashboard","delete","drag_indicator","drive_file_move","edit","favorite","format_align_center","format_align_left","format_align_right","format_bold","format_italic","format_list_bulleted","format_list_numbered","format_strikethrough","format_underlined","front_hand","grid_view","group","home","keyboard_arrow_down","keyboard_arrow_left","keyboard_arrow_right","keyboard_arrow_up","light_mode","link","lock","mail","menu","mic","more_horiz","notifications","pause","person","play_arrow","present_to_all","progress_activity","radio_button_checked","redo","remove","rocket_launch","search","send","sentiment_dissatisfied","sentiment_satisfied","settings","share","shopping_cart","swap_horiz","table_view","thumb_up","undo","videocam","visibility","visibility_off","volume_down","volume_off","volume_up"] as const;

const glyphMap = {
    "align-center": createMaterialSymbolGlyph("format_align_center", {}),
    "align-left": createMaterialSymbolGlyph("format_align_left", {}),
    "align-right": createMaterialSymbolGlyph("format_align_right", {}),
    "arrow-left-right": createMaterialSymbolGlyph("swap_horiz", {}),
    "ban": createMaterialSymbolGlyph("block", {}),
    "bell": createMaterialSymbolGlyph("notifications", {}),
    "bold": createMaterialSymbolGlyph("format_bold", {}),
    "cart": createMaterialSymbolGlyph("shopping_cart", {}),
    "chat": { glyph: createMaterialSymbolGlyph("chat_bubble", {}), direction: 'fixed' },
    "check": createMaterialSymbolGlyph("check", {}),
    "chevron-down": createMaterialSymbolGlyph("keyboard_arrow_down", {}),
    "chevron-up": createMaterialSymbolGlyph("keyboard_arrow_up", {}),
    "chevron-end": { glyph: createMaterialSymbolGlyph("keyboard_arrow_right", {}), direction: 'mirror' },
    "chevron-left": { glyph: createMaterialSymbolGlyph("keyboard_arrow_left", {}), direction: 'mirror' },
    "circle-check": createMaterialSymbolGlyph("check_circle", {}),
    "circle-x": createMaterialSymbolGlyph("cancel", {}),
    "clipboard-check": createMaterialSymbolGlyph("assignment_turned_in", {}),
    "close": createMaterialSymbolGlyph("close", {}),
    "dashboard": createMaterialSymbolGlyph("dashboard", {}),
    "ellipsis": { glyph: createMaterialSymbolGlyph("more_horiz", {}), direction: 'fixed' },
    "eye": { glyph: createMaterialSymbolGlyph("visibility", {}), direction: 'fixed' },
    "eye-off": { glyph: createMaterialSymbolGlyph("visibility_off", {}), direction: 'fixed' },
    "folder-move": { glyph: createMaterialSymbolGlyph("drive_file_move", {}), direction: 'mirror' },
    "frown": createMaterialSymbolGlyph("sentiment_dissatisfied", {}),
    "git-branch": createMaterialSymbolGlyph("account_tree", {}),
    "grid": { glyph: createMaterialSymbolGlyph("grid_view", {}), direction: 'fixed' },
    "grip-vertical": createMaterialSymbolGlyph("drag_indicator", {}),
    "hand": { glyph: createMaterialSymbolGlyph("front_hand", {}), direction: 'fixed' },
    "heart": createMaterialSymbolGlyph("favorite", {}),
    "home": createMaterialSymbolGlyph("home", {}),
    "italic": createMaterialSymbolGlyph("format_italic", {}),
    "link": createMaterialSymbolGlyph("link", {}),
    "list": createMaterialSymbolGlyph("format_list_bulleted", {}),
    "list-ordered": createMaterialSymbolGlyph("format_list_numbered", {}),
    "loader-circle": createMaterialSymbolGlyph("progress_activity", {}),
    "lock": { glyph: createMaterialSymbolGlyph("lock", {}), direction: 'fixed' },
    "mail": createMaterialSymbolGlyph("mail", {}),
    "menu": createMaterialSymbolGlyph("menu", {}),
    "mic": { glyph: createMaterialSymbolGlyph("mic", {}), direction: 'fixed' },
    "minus": createMaterialSymbolGlyph("remove", {}),
    "moon": createMaterialSymbolGlyph("dark_mode", {}),
    "moon-star": createMaterialSymbolGlyph("bedtime", {}),
    "pause": createMaterialSymbolGlyph("pause", {}),
    "pencil": createMaterialSymbolGlyph("edit", {}),
    "phone-hangup": { glyph: createMaterialSymbolGlyph("call_end", {}), direction: 'fixed' },
    "play": createMaterialSymbolGlyph("play_arrow", {}),
    "plus": createMaterialSymbolGlyph("add", {}),
    "record": { glyph: createMaterialSymbolGlyph("radio_button_checked", {}), direction: 'fixed' },
    "redo": { glyph: createMaterialSymbolGlyph("redo", {}), direction: 'mirror' },
    "radio-selected": createMaterialSymbolGlyph("circle", {"style":{"transform":"scale(0.5)","transformOrigin":"center"}}),
    "rocket": createMaterialSymbolGlyph("rocket_launch", {}),
    "screen-share": { glyph: createMaterialSymbolGlyph("present_to_all", {}), direction: 'fixed' },
    "search": createMaterialSymbolGlyph("search", {}),
    "send": { glyph: createMaterialSymbolGlyph("send", {}), direction: 'mirror' },
    "settings": createMaterialSymbolGlyph("settings", {}),
    "share": createMaterialSymbolGlyph("share", {}),
    "smile": createMaterialSymbolGlyph("sentiment_satisfied", {}),
    "spreadsheet": createMaterialSymbolGlyph("table_view", {}),
    "strikethrough": createMaterialSymbolGlyph("format_strikethrough", {}),
    "sun": createMaterialSymbolGlyph("light_mode", {}),
    "thumbs-up": createMaterialSymbolGlyph("thumb_up", {}),
    "trash": createMaterialSymbolGlyph("delete", {}),
    "underline": createMaterialSymbolGlyph("format_underlined", {}),
    "undo": { glyph: createMaterialSymbolGlyph("undo", {}), direction: 'mirror' },
    "user": createMaterialSymbolGlyph("person", {}),
    "users": { glyph: createMaterialSymbolGlyph("group", {}), direction: 'fixed' },
    "video": { glyph: createMaterialSymbolGlyph("videocam", {}), direction: 'fixed' },
    "volume-high": createMaterialSymbolGlyph("volume_up", {}),
    "volume-low": createMaterialSymbolGlyph("volume_down", {}),
    "volume-muted": createMaterialSymbolGlyph("volume_off", {})
} satisfies CompleteCanonicalGlyphMap;

export const materialSymbolsIconFamily = defineIconFamily({
  id: "material-symbols",
  label: "Material Symbols Outlined",
  defaultVariant: "fill-0",
  variants: {
    "fill-0": {
      label: "Fill 0",
      glyphs: glyphMap,
      rendererProps: {"fill":0},
      prepare: () => prepareMaterialSymbolsOutlined(materialLigatures)
    },
    "fill-1": {
      label: "Fill 1",
      glyphs: glyphMap,
      rendererProps: {"fill":1},
      prepare: () => prepareMaterialSymbolsOutlined(materialLigatures)
    }
  }
});
