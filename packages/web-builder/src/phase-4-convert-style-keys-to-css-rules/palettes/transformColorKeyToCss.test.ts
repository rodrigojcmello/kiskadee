import { describe, expect, it } from 'vitest';
import {
  ERROR_INVALID_KEY_FORMAT,
  ERROR_REF_REQUIRE_STATE,
  transformColorKeyToCss
} from './transformColorKeyToCss';

const className = 'abc';

describe('transformColorKeyToCss', () => {
  // -----------------------------------------------------------------------------------------------
  // inline (-- styleKeys)
  // -----------------------------------------------------------------------------------------------
  describe('inline (-- styleKeys)', () => {
    describe('Success operation', () => {
      describe('base (rest is implicit)', () => {
        it('forceState=false', () => {
          const force = false as const;
          const styleKey = 'textColor__[120,50,50,1]';
          const result = transformColorKeyToCss(styleKey, className, force);
          expect(result).toEqual('.abc { color: #40BF40 }');
        });
        it('forceState=true', () => {
          const force = true as const;
          const styleKey = 'textColor__[120,50,50,1]';
          const result = transformColorKeyToCss(styleKey, className, force);
          expect(result).toEqual('.abc { color: #40BF40 }');
        });
      });

      describe('hover', () => {
        it('forceState=false', () => {
          const force = false as const;
          const result = transformColorKeyToCss(
            'boxColor--hover__[240,50,50,0.5]',
            className,
            force
          );
          expect(result).toEqual('.abc:hover { background: #4040BF80 }');
        });
        it('forceState=true', () => {
          const force = true as const;
          const result = transformColorKeyToCss(
            'boxColor--hover__[240,50,50,0.5]',
            className,
            force
          );
          // expects both :hover and forced class (.-h) gated by activator (.-a) applied to the same element (i.e. .abc.-h.-a)
          expect(result).toEqual('.abc:hover, .abc.-h.-a { background: #4040BF80 }');
        });
      });

      describe('selected:hover', () => {
        it('forceState=false', () => {
          const force = false as const;
          const result = transformColorKeyToCss(
            'boxColor--selected:hover__[240,50,50,0.5]',
            className,
            force
          );
          expect(result).toEqual('.abc:hover.-s { background: #4040BF80 }');
        });
        it('forceState=true', () => {
          const force = true as const;
          const result = transformColorKeyToCss(
            'boxColor--selected:hover__[240,50,50,0.5]',
            className,
            force
          );
          // native selector must NOT include activator (-a); forced selector remains gated by activator (-a)
          expect(result).toEqual('.abc:hover.-s, .abc.-s.-h.-a { background: #4040BF80 }');
        });
      });

      describe('disabled (forced branch always present)', () => {
        it('forceState=false', () => {
          const force = false as const;
          const result = transformColorKeyToCss(
            'boxColor--disabled__[240,50,50,0.5]',
            className,
            force
          );
          expect(result).toEqual('.abc.-d.-a { background: #4040BF80 }');
        });
        it('forceState=true', () => {
          const force = true as const;
          const result = transformColorKeyToCss(
            'boxColor--disabled__[240,50,50,0.5]',
            className,
            force
          );
          expect(result).toEqual('.abc.-d.-a { background: #4040BF80 }');
        });
      });
    });

    describe('Error handling', () => {
      it('should throw if the style key format is invalid', () => {
        const fn = (): string => transformColorKeyToCss('invalidKey', className);
        expect(fn).toThrowError(ERROR_INVALID_KEY_FORMAT);
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
          const result = transformColorKeyToCss(
            'boxColor==hover__[240,50,50,0.5]',
            className,
            force
          );
          expect(result).toEqual('.-i:hover .abc { background: #4040BF80 }');
        });
        it('forceState=true', () => {
          const force = true as const;
          const result = transformColorKeyToCss(
            'boxColor==hover__[240,50,50,0.5]',
            className,
            force
          );
          // expects both parent :hover and forced parent class (.-h) to be combined as selectors
          expect(result).toEqual('.-i:hover .abc, .-a.-h .abc { background: #4040BF80 }');
        });
      });

      describe('==focus', () => {
        it('forceState=false', () => {
          const force = false as const;
          const result = transformColorKeyToCss('textColor==focus__[0,0,0,0.3]', className, force);
          expect(result).toEqual('.-i:focus-visible .abc { color: #0000004D }');
        });
        it('forceState=true', () => {
          const force = true as const;
          const result = transformColorKeyToCss('textColor==focus__[0,0,0,0.3]', className, force);
          expect(result).toEqual('.-i:focus-visible .abc, .-a.-f .abc { color: #0000004D }');
        });
      });

      describe('==selected:rest', () => {
        it('forceState=true (forced class for non-native selected)', () => {
          const force = true as const;
          const result = transformColorKeyToCss(
            'textColor==selected:rest__[0,0,0,1]',
            className,
            force
          );
          expect(result).toEqual('.-a.-s .abc { color: #000 }');
        });
      });

      describe('==selected:hover', () => {
        it('forceState=false', () => {
          const force = false as const;
          const result = transformColorKeyToCss(
            'boxColor==selected:hover__[240,50,50,0.5]',
            className,
            force
          );
          expect(result).toEqual('.-i:hover.-s .abc { background: #4040BF80 }');
        });
        it('forceState=true', () => {
          const force = true as const;
          const result = transformColorKeyToCss(
            'boxColor==selected:hover__[240,50,50,0.5]',
            className,
            force
          );
          // parent gets interactive anchor -i for native, activator -a only for forced branch
          expect(result).toEqual('.-i:hover.-s .abc, .-a.-s.-h .abc { background: #4040BF80 }');
        });
      });

      describe('==disabled (forced branch always present)', () => {
        it('forceState=false', () => {
          const force = false as const;
          const result = transformColorKeyToCss(
            'textColor==disabled__[0,0,0,0.3]',
            className,
            force
          );
          expect(result).toEqual('.-a.-d .abc { color: #0000004D }');
        });
        it('forceState=true', () => {
          const force = true as const;
          const result = transformColorKeyToCss(
            'textColor==disabled__[0,0,0,0.3]',
            className,
            force
          );
          expect(result).toEqual('.-a.-d .abc { color: #0000004D }');
        });
      });
    });

    describe('Error handling', () => {
      it('should throw if "==" is used without a state', () => {
        const key = 'boxColor==__[240,50,50,0.5]';
        const fn = (): string => transformColorKeyToCss(key, className);
        expect(fn).toThrowError(ERROR_REF_REQUIRE_STATE);
      });

      it('should throw when using unsupported state "visited"', () => {
        const key = 'boxColor==visited__[240,50,50,0.5]';
        const fn = (): string => transformColorKeyToCss(key, className);
        expect(fn).toThrowError(ERROR_REF_REQUIRE_STATE);
      });
    });
  });
});
