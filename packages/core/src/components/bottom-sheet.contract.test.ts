import { describe, expect, it } from 'vitest';
import { validateBottomSheetComponentContract } from './bottom-sheet.ts';

function createBottomSheet() {
  return {
    options: {
      initialHeight: 'standard',
      swipeBehavior: 'expand-dismiss',
      pageTransition: 'slide',
      itemLayout: 'centered',
      centeredIcons: 'hide',
      groupSeparators: true
    },
    effects: {
      shadow: {
        e2: {
          kind: 'outer',
          states: { rest: 's:md:1' },
          fixedLevels: ['s:md:1']
        }
      }
    },
    elements: {
      e1: { name: 'scrim' },
      e2: { name: 'surface' },
      e3: { name: 'handle' },
      e4: { name: 'header' },
      e5: { name: 'title', typography: { 's:all': 'body-medium' } },
      e6: { name: 'body' },
      e7: { name: 'item' },
      e8: { name: 'icon', iconSize: { 's:all': 's:md:1' } },
      e9: { name: 'label', typography: { 's:all': 'body-medium' } },
      e10: { name: 'description', typography: { 's:all': 'body-small' } },
      e11: { name: 'trailing', iconSize: { 's:all': 's:md:1' } },
      e12: { name: 'separator', separator: { 's:all': 'subtle' } },
      e13: { name: 'end-text', typography: { 's:all': 'body-small' } },
      e14: { name: 'group-label', typography: { 's:all': 'body-small' } },
      e15: { name: 'checkmark', iconSize: { 's:all': 's:md:1' } }
    }
  };
}

describe('BottomSheet component contract', () => {
  it('accepts the independent element and option vocabulary', () => {
    expect(validateBottomSheetComponentContract(createBottomSheet())).toEqual([]);
  });

  it('requires every declared BottomSheet element', () => {
    const bottomSheet = createBottomSheet() as any;
    delete bottomSheet.elements.e12;

    expect(validateBottomSheetComponentContract(bottomSheet)).toContain(
      'components.bottomSheet.elements.e12: required element'
    );
  });

  it('rejects overloaded or unsupported height names', () => {
    const bottomSheet = createBottomSheet() as any;
    bottomSheet.options.initialHeight = 'expanded';

    expect(validateBottomSheetComponentContract(bottomSheet)).toContain(
      'components.bottomSheet.options.initialHeight: unsupported value'
    );
  });

  it('requires groupSeparators to be boolean when declared', () => {
    const bottomSheet = createBottomSheet() as any;
    bottomSheet.options.groupSeparators = 'hide';

    expect(validateBottomSheetComponentContract(bottomSheet)).toContain(
      'components.bottomSheet.options.groupSeparators: expected boolean'
    );
  });

  it('keeps BottomSheet intents independent from Dropdown', () => {
    const bottomSheet = createBottomSheet() as any;
    bottomSheet.elements.e7.palettes = {
      default: {
        light: {
          onSubtle: {
            boxColor: {
              primary: { medium: { rest: 'var(--color)' } }
            }
          }
        }
      }
    };

    expect(validateBottomSheetComponentContract(bottomSheet)).toContain(
      'components.bottomSheet.elements.e7.palettes.default.light.onSubtle.boxColor.primary: unrecognized BottomSheet intent'
    );
  });
});
