import { describe, expect, it } from 'vitest';
import {
  ERROR_INVALID_NUMERIC_KEY_FORMAT,
  ERROR_REF_REQUIRE_STATE_NUMERIC,
  transformBorderRadiusKeyToCss
} from './transformBorderRadiusKeyToCss.ts';

const className = 'abc';

describe('transformBorderRadiusKeyToCss', () => {
  describe('emission policy', () => {
    it('emits token-only border-radius declarations when configured', () => {
      const out = transformBorderRadiusKeyToCss('borderRadiusRounded__20', className, false, {
        styleEmissionPolicy: {
          borderRadiusEmission: 'token',
          borderColorEmission: 'direct',
          borderWidthEmission: 'direct',
          paddingEmission: 'direct',
          shadowEmission: 'direct'
        }
      });

      expect(out).toEqual('.abc { --k-bdr: 20px }');
    });

    it('keeps mirrored border-radius declarations when configured', () => {
      const out = transformBorderRadiusKeyToCss('borderRadiusRounded__20', className, false, {
        styleEmissionPolicy: {
          borderRadiusEmission: 'mirrored',
          borderColorEmission: 'direct',
          borderWidthEmission: 'direct',
          paddingEmission: 'direct',
          shadowEmission: 'direct'
        }
      });

      expect(out).toEqual('.abc { --k-bdr: 20px; border-radius: 20px }');
    });
  });

  // -----------------------------------------------------------------------------------------------
  // responsive (++ styleKeys)
  // -----------------------------------------------------------------------------------------------
  describe('responsive (++ styleKeys)', () => {
    describe('Success operation', () => {
      describe('base without state (no breakpoint)', () => {
        it('forceState=false', () => {
          const force = false as const;
          const key = 'borderRadiusRounded++s:md:1__18';
          const out = transformBorderRadiusKeyToCss(key, className, force);
          expect(out).toEqual('.abc { --k-bdr: 18px; border-radius: 18px }');
        });
        it('forceState=true', () => {
          const force = true as const;
          const key = 'borderRadiusRounded++s:md:1__18';
          const out = transformBorderRadiusKeyToCss(key, className, force);
          expect(out).toEqual('.abc { --k-bdr: 18px; border-radius: 18px }');
        });
      });

      describe('base with breakpoint', () => {
        it('forceState=false', () => {
          const force = false as const;
          const key = 'borderRadiusRounded++s:md:1::bp:lg:2__18';
          const out = transformBorderRadiusKeyToCss(key, className, force);
          expect(out).toEqual(
            '@media (min-width: 1312px) { .abc { --k-bdr: 18px; border-radius: 18px } }'
          );
        });
        it('forceState=true', () => {
          const force = true as const;
          const key = 'borderRadiusRounded++s:md:1::bp:lg:2__18';
          const out = transformBorderRadiusKeyToCss(key, className, force);
          expect(out).toEqual(
            '@media (min-width: 1312px) { .abc { --k-bdr: 18px; border-radius: 18px } }'
          );
        });
      });

      describe('another size token (s:sm:1)', () => {
        it('forceState=false', () => {
          const force = false as const;
          const key = 'borderRadiusRounded++s:sm:1__12';
          const out = transformBorderRadiusKeyToCss(key, className, force);
          expect(out).toEqual('.abc { --k-bdr: 12px; border-radius: 12px }');
        });
        it('forceState=true', () => {
          const force = true as const;
          const key = 'borderRadiusRounded++s:sm:1__12';
          const out = transformBorderRadiusKeyToCss(key, className, force);
          expect(out).toEqual('.abc { --k-bdr: 12px; border-radius: 12px }');
        });
      });

      describe('inline -- :hover with size (no breakpoint)', () => {
        it('forceState=false', () => {
          const force = false as const;
          const key = 'borderRadiusRounded--hover++s:md:1__22';
          const out = transformBorderRadiusKeyToCss(key, className, force);
          expect(out).toEqual('.abc:hover { --k-bdr: 22px; border-radius: 22px }');
        });
        it('forceState=true', () => {
          const force = true as const;
          const key = 'borderRadiusRounded--hover++s:md:1__22';
          const out = transformBorderRadiusKeyToCss(key, className, force);
          expect(out).toEqual('.abc:hover, .abc.-h.-a { --k-bdr: 22px; border-radius: 22px }');
        });
      });

      describe('inline -- selected:hover with size (no breakpoint)', () => {
        it('forceState=false', () => {
          const force = false as const;
          const key = 'borderRadiusRounded--selected:hover++s:md:1__6';
          const out = transformBorderRadiusKeyToCss(key, className, force);
          // TODO: deveria ter o "-a"?!
          expect(out).toEqual('.abc:hover.-s { --k-bdr: 6px; border-radius: 6px }');
        });
        it('forceState=true', () => {
          const force = true as const;
          const key = 'borderRadiusRounded--selected:hover++s:md:1__6';
          const out = transformBorderRadiusKeyToCss(key, className, force);
          // TODO: deveria ter o "-a"?!
          expect(out).toEqual('.abc:hover.-s, .abc.-s.-h.-a { --k-bdr: 6px; border-radius: 6px }');
        });
      });

      describe('inline -- selected:hover with size+breakpoint', () => {
        it('forceState=false', () => {
          const force = false as const;
          const key = 'borderRadiusRounded--selected:hover++s:lg:1::bp:lg:2__4';
          const out = transformBorderRadiusKeyToCss(key, className, force);
          expect(out).toEqual(
            '@media (min-width: 1312px) { .abc:hover.-s { --k-bdr: 4px; border-radius: 4px } }'
          );
        });
        it('forceState=true', () => {
          const force = true as const;
          const key = 'borderRadiusRounded--selected:hover++s:lg:1::bp:lg:2__4';
          const out = transformBorderRadiusKeyToCss(key, className, force);
          expect(out).toEqual(
            '@media (min-width: 1312px) { .abc:hover.-s, .abc.-s.-h.-a { --k-bdr: 4px; border-radius: 4px } }'
          );
        });
      });

      describe('inline -- focus with size+breakpoint', () => {
        it('forceState=false', () => {
          const force = false as const;
          const key = 'borderRadiusRounded--focus++s:lg:1::bp:md:3__18';
          const out = transformBorderRadiusKeyToCss(key, className, force);
          expect(out).toEqual(
            '@media (min-width: 1024px) { .abc:focus-visible { --k-bdr: 18px; border-radius: 18px } }'
          );
        });
        it('forceState=true', () => {
          const force = true as const;
          const key = 'borderRadiusRounded--focus++s:lg:1::bp:md:3__18';
          const out = transformBorderRadiusKeyToCss(key, className, force);
          expect(out).toEqual(
            '@media (min-width: 1024px) { .abc:focus-visible, .abc.-f.-a { --k-bdr: 18px; border-radius: 18px } }'
          );
        });
      });

      describe('inline -- pressed with size (no breakpoint)', () => {
        it('forceState=false', () => {
          const force = false as const;
          const key = 'borderRadiusRounded--pressed++s:sm:1__14';
          const out = transformBorderRadiusKeyToCss(key, className, force);
          expect(out).toEqual('.abc:active { --k-bdr: 14px; border-radius: 14px }');
        });
        it('forceState=true', () => {
          const force = true as const;
          const key = 'borderRadiusRounded--pressed++s:sm:1__14';
          const out = transformBorderRadiusKeyToCss(key, className, force);
          expect(out).toEqual('.abc:active, .abc.-p.-a { --k-bdr: 14px; border-radius: 14px }');
        });
      });
    });

    describe('Error handling', () => {
      it('should throw on invalid numeric value for responsive key', () => {
        const fn = (): string =>
          transformBorderRadiusKeyToCss('borderRadiusRounded++s:md:1__not-a-number', className);
        expect(fn).toThrowError(ERROR_INVALID_NUMERIC_KEY_FORMAT);
      });

      it('should throw on invalid breakpoint token', () => {
        const fn = (): string =>
          transformBorderRadiusKeyToCss('borderRadiusRounded++s:md:1::bp:oops__10', className);
        expect(fn).toThrow();
      });
    });
  });

  // -----------------------------------------------------------------------------------------------
  // inline (-- styleKeys)
  // -----------------------------------------------------------------------------------------------
  describe('inline (-- styleKeys)', () => {
    describe('Success operation', () => {
      describe('base (rest is implicit)', () => {
        it('forceState=false', () => {
          const force = false as const;
          const key = 'borderRadiusRounded__20';
          const out = transformBorderRadiusKeyToCss(key, className, force);
          expect(out).toEqual('.abc { --k-bdr: 20px; border-radius: 20px }');
        });
        it('forceState=true', () => {
          const force = true as const;
          const key = 'borderRadiusRounded__20';
          const out = transformBorderRadiusKeyToCss(key, className, force);
          expect(out).toEqual('.abc { --k-bdr: 20px; border-radius: 20px }');
        });
      });

      describe('hover', () => {
        it('forceState=false', () => {
          const force = false as const;
          const key = 'borderRadiusRounded--hover__24';
          const out = transformBorderRadiusKeyToCss(key, className, force);
          expect(out).toEqual('.abc:hover { --k-bdr: 24px; border-radius: 24px }');
        });
        it('forceState=true', () => {
          const force = true as const;
          const key = 'borderRadiusRounded--hover__24';
          const out = transformBorderRadiusKeyToCss(key, className, force);
          expect(out).toEqual('.abc:hover, .abc.-h.-a { --k-bdr: 24px; border-radius: 24px }');
        });
      });

      describe('selected:hover', () => {
        it('forceState=false', () => {
          const force = false as const;
          const key = 'borderRadiusRounded--selected:hover__12';
          const out = transformBorderRadiusKeyToCss(key, className, force);
          expect(out).toEqual('.abc:hover.-s { --k-bdr: 12px; border-radius: 12px }');
        });
        it('forceState=true', () => {
          const force = true as const;
          const key = 'borderRadiusRounded--selected:hover__12';
          const out = transformBorderRadiusKeyToCss(key, className, force);
          expect(out).toEqual(
            '.abc:hover.-s, .abc.-s.-h.-a { --k-bdr: 12px; border-radius: 12px }'
          );
        });
      });

      describe('disabled (forced branch always present)', () => {
        it('forceState=false', () => {
          const force = false as const;
          const key = 'borderRadiusRounded--disabled__10';
          const out = transformBorderRadiusKeyToCss(key, className, force);
          expect(out).toEqual('.abc.-d.-a { --k-bdr: 10px; border-radius: 10px }');
        });
        it('forceState=true', () => {
          const force = true as const;
          const key = 'borderRadiusRounded--disabled__10';
          const out = transformBorderRadiusKeyToCss(key, className, force);
          expect(out).toEqual('.abc.-d.-a { --k-bdr: 10px; border-radius: 10px }');
        });
      });
    });

    describe('Error handling', () => {
      it('should throw if the numeric format is invalid', () => {
        const fn = (): string =>
          transformBorderRadiusKeyToCss('borderRadiusRounded--hover__not-a-number', className);
        expect(fn).toThrowError(ERROR_INVALID_NUMERIC_KEY_FORMAT);
      });
    });
  });

  // -----------------------------------------------------------------------------------------------
  // reference (== styleKeys)
  // -----------------------------------------------------------------------------------------------
  describe('reference (== styleKeys)', () => {
    describe('Success operation', () => {
      describe('==hover', () => {
        it('forceState=false', () => {
          const force = false as const;
          const key = 'borderRadiusRounded==hover__12';
          const out = transformBorderRadiusKeyToCss(key, className, force);
          expect(out).toEqual('.-i:hover .abc { --k-bdr: 12px; border-radius: 12px }');
        });
        it('forceState=true', () => {
          const force = true as const;
          const key = 'borderRadiusRounded==hover__12';
          const out = transformBorderRadiusKeyToCss(key, className, force);
          expect(out).toEqual(
            '.-i:hover .abc, .-a.-h .abc { --k-bdr: 12px; border-radius: 12px }'.replace(
              ' \\.',
              ' .'
            )
          );
        });
      });

      describe('==focus', () => {
        it('forceState=false', () => {
          const force = false as const;
          const key = 'borderRadiusRounded==focus__6';
          const out = transformBorderRadiusKeyToCss(key, className, force);
          expect(out).toEqual('.-i:focus-visible .abc { --k-bdr: 6px; border-radius: 6px }');
        });
        it('forceState=true', () => {
          const force = true as const;
          const key = 'borderRadiusRounded==focus__6';
          const out = transformBorderRadiusKeyToCss(key, className, force);
          expect(out).toEqual(
            '.-i:focus-visible .abc, .-a.-f .abc { --k-bdr: 6px; border-radius: 6px }'
          );
        });
      });

      describe('==selected:hover', () => {
        it('forceState=false', () => {
          const force = false as const;
          const key = 'borderRadiusRounded==selected:hover__8';
          const out = transformBorderRadiusKeyToCss(key, className, force);
          expect(out).toEqual('.-i:hover.-s .abc { --k-bdr: 8px; border-radius: 8px }');
        });
        it('forceState=true', () => {
          const force = true as const;
          const key = 'borderRadiusRounded==selected:hover__8';
          const out = transformBorderRadiusKeyToCss(key, className, force);
          expect(out).toEqual(
            '.-i:hover.-s .abc, .-a.-s.-h .abc { --k-bdr: 8px; border-radius: 8px }'.replace(
              ' \\.',
              ' .'
            )
          );
        });
      });

      describe('==disabled (forced branch always present)', () => {
        it('forceState=false', () => {
          const force = false as const;
          const key = 'borderRadiusRounded==disabled__14';
          const out = transformBorderRadiusKeyToCss(key, className, force);
          expect(out).toEqual(
            '.-a.-d .abc { --k-bdr: 14px; border-radius: 14px }'.replace(' \\.', ' .')
          );
        });
        it('forceState=true', () => {
          const force = true as const;
          const key = 'borderRadiusRounded==disabled__14';
          const out = transformBorderRadiusKeyToCss(key, className, force);
          expect(out).toEqual('.-a.-d .abc { --k-bdr: 14px; border-radius: 14px }');
        });
      });

      describe('responsive ==hover (no breakpoint)', () => {
        it('forceState=false', () => {
          const force = false as const;
          const key = 'borderRadiusRounded==hover++s:md:1__14';
          const out = transformBorderRadiusKeyToCss(key, className, force);
          expect(out).toEqual(
            '.-i:hover .abc { --k-bdr: 14px; border-radius: 14px }'.replace(' \\.', ' .')
          );
        });
        it('forceState=true', () => {
          const force = true as const;
          const key = 'borderRadiusRounded==hover++s:md:1__14';
          const out = transformBorderRadiusKeyToCss(key, className, force);
          expect(out).toEqual('.-i:hover .abc, .-a.-h .abc { --k-bdr: 14px; border-radius: 14px }');
        });
      });

      describe('responsive ==hover with breakpoint', () => {
        it('forceState=false', () => {
          const force = false as const;
          const key = 'borderRadiusRounded==hover++s:md:1::bp:lg:2__16';
          const out = transformBorderRadiusKeyToCss(key, className, force);
          expect(out).toEqual(
            '@media (min-width: 1312px) { .-i:hover .abc { --k-bdr: 16px; border-radius: 16px } }'
          );
        });
        it('forceState=true', () => {
          const force = true as const;
          const key = 'borderRadiusRounded==hover++s:md:1::bp:lg:2__16';
          const out = transformBorderRadiusKeyToCss(key, className, force);
          expect(out).toEqual(
            '@media (min-width: 1312px) { .-i:hover .abc, .-a.-h \\.abc { --k-bdr: 16px; border-radius: 16px } }'.replace(
              ' \\.',
              ' .'
            )
          );
        });
      });

      describe('responsive ==focus with breakpoint', () => {
        it('forceState=false', () => {
          const force = false as const;
          const key = 'borderRadiusRounded==focus++s:lg:1::bp:md:2__10';
          const out = transformBorderRadiusKeyToCss(key, className, force);
          expect(out).toEqual(
            '@media (min-width: 768px) { .-i:focus-visible .abc { --k-bdr: 10px; border-radius: 10px } }'
          );
        });
        it('forceState=true', () => {
          const force = true as const;
          const key = 'borderRadiusRounded==focus++s:lg:1::bp:md:2__10';
          const out = transformBorderRadiusKeyToCss(key, className, force);
          expect(out).toEqual(
            '@media (min-width: 768px) { .-i:focus-visible .abc, .-a.-f .abc { --k-bdr: 10px; border-radius: 10px } }'.replace(
              ' \\.',
              ' .'
            )
          );
        });
      });

      describe('responsive ==selected:focus with breakpoint', () => {
        it('forceState=false', () => {
          const force = false as const;
          const key = 'borderRadiusRounded==selected:focus++s:sm:1::bp:md:2__8';
          const out = transformBorderRadiusKeyToCss(key, className, force);
          expect(out).toEqual(
            '@media (min-width: 768px) { .-i:focus-visible.-s .abc { --k-bdr: 8px; border-radius: 8px } }'
          );
        });
        it('forceState=true', () => {
          const force = true as const;
          const key = 'borderRadiusRounded==selected:focus++s:sm:1::bp:md:2__8';
          const out = transformBorderRadiusKeyToCss(key, className, force);
          expect(out).toEqual(
            '@media (min-width: 768px) { .-i:focus-visible.-s .abc, .-a.-s.-f .abc { --k-bdr: 8px; border-radius: 8px } }'
          );
        });
      });
    });

    describe('Error handling', () => {
      it('should throw if "==" is used without a state', () => {
        const fn = (): string =>
          transformBorderRadiusKeyToCss('borderRadiusRounded==__10', className);
        expect(fn).toThrowError(ERROR_REF_REQUIRE_STATE_NUMERIC);
      });

      it('should throw when using an unsupported state token', () => {
        const fn = (): string =>
          transformBorderRadiusKeyToCss('borderRadiusRounded==visited__10', className);
        expect(fn).toThrowError(ERROR_REF_REQUIRE_STATE_NUMERIC);
      });
    });
  });
});
