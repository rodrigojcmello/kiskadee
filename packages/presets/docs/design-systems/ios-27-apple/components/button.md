# iOS 27 Apple Button Evidence

Source:

- [iOS and iPadOS 27 Community — Buttons](https://www.figma.com/design/GeO2lMY65IAFczDmjs6oei/iOS-and-iPadOS-27--Community-?node-id=507-24673)
  - file key: `GeO2lMY65IAFczDmjs6oei`;
  - page/node: `507:24673`;
  - inspected component sets include `Button - Content Area` (`40:58696`),
    `Button - Liquid Glass - Text` (`5473:21667`), and
    `Button - Liquid Glass - Symbol` (`5522:11866`).

## Color Bindings

The inspected Button components bind their authored states to variables from the central `Colors`
collection rather than defining independent component color ramps. Relevant bindings include:

- `Accents/Blue` for the standard tinted action;
- `Accents/Red` and `Miscellaneous/Buttons/BG - Destructive` for destructive actions;
- `Grays/White` for foregrounds over vivid fills;
- `Fills/Tertiary` and `Labels/Tertiary` for disabled presentation;
- `Labels - Vibrant - Controls/Primary` and `Labels - Vibrant - Controls/Tertiary` for Liquid Glass
  content.

Some Liquid Glass layers also contain authored material/effect paints. Those values are evidence of
the visual material, not primitive color-family seeds, and are not promoted as literal colors into
the current Kiskadee Button schema.

## Current Kiskadee Status

The existing Button schema was renamed with the preset so the repository continues to build, but
its visual mapping has not yet been re-authored from this iOS 27 source. The next color phase will:

1. generate the Kiskadee tonal system from the documented Apple system-color seeds;
2. establish a source-to-tonal mapping;
3. apply only resolved primitive/semantic references to the Button schema;
4. record any Liquid Glass or cross-platform adaptations separately.
