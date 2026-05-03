import { describe, expect, it } from 'vitest';
import { type BuildStyleKeyParams, buildStyleKey } from './buildStyleKey.ts';

describe('buildStyleKey', () => {
  describe('selected control via controlState + interactionState', () => {
    it('generates non-ref key for selected:rest', () => {
      const key = buildStyleKey({
        propertyName: 'boxColor',
        value: '[1,2,3,1]',
        controlState: true,
        interactionState: 'rest'
      });
      expect(key).toBe('boxColor--selected:rest__[1,2,3,1]');
    });

    it('generates ref key for selected:hover', () => {
      const key = buildStyleKey({
        propertyName: 'boxColor',
        value: '[2,3,4,1]',
        controlState: true,
        interactionState: 'hover',
        isRef: true
      });
      expect(key).toBe('boxColor==selected:hover__[2,3,4,1]');
    });

    it('allows isRef=true with selected:rest (parent-selected rest) and generates ==selected:rest', () => {
      const key = buildStyleKey({
        propertyName: 'boxColor',
        value: '[1,1,1,1]',
        controlState: true,
        interactionState: 'rest',
        isRef: true
      });
      expect(key).toBe('boxColor==selected:rest__[1,1,1,1]');
    });

    it('throws when controlState=true with disabled', () => {
      let caught: unknown;
      try {
        buildStyleKey({
          propertyName: 'boxColor',
          value: '[1,1,1,1]',
          controlState: true,
          interactionState: 'disabled'
        } as any);
      } catch (err) {
        caught = err;
      }
      expect(caught).toBeInstanceOf(Error);
      const msg = (caught as Error).message;
      expect(msg).toMatch(/is not supported when controlState=true/);
    });

    it("throws when controlState=true with interactionState 'selected'", () => {
      let caught: unknown;
      try {
        buildStyleKey({
          propertyName: 'boxColor',
          value: '[1,1,1,1]',
          controlState: true,
          interactionState: 'selected'
        });
      } catch (err) {
        caught = err;
      }
      expect(caught).toBeInstanceOf(Error);
      const msg = (caught as Error).message;
      expect(msg).toMatch(/interactionState 'selected' is redundant/);
    });
  });
  describe('Successful operation', () => {
    describe('decoration keys (no suffix)', () => {
      it('serializes a number value', () => {
        const opts: BuildStyleKeyParams = { propertyName: 'width', value: 10 };
        expect(buildStyleKey(opts)).toBe('width__10');
      });

      it('serializes a string value', () => {
        const opts: BuildStyleKeyParams = { propertyName: 'label', value: 'hello' };
        expect(buildStyleKey(opts)).toBe('label__hello');
      });

      it('serializes a boolean value', () => {
        const opts: BuildStyleKeyParams = { propertyName: 'visible', value: true };
        expect(buildStyleKey(opts)).toBe('visible__true');
      });

      it('serializes an array value', () => {
        const arr = [1, 2, 3];
        const opts: BuildStyleKeyParams = { propertyName: 'list', value: arr };
        expect(buildStyleKey(opts)).toBe('list__[1,2,3]');
      });
    });

    describe('shadow keys (interactionState only)', () => {
      it('appends --rest suffix for rest state', () => {
        const opts: BuildStyleKeyParams = {
          propertyName: 'shadow',
          interactionState: 'rest',
          value: [10, 5, 3]
        };
        expect(buildStyleKey(opts)).toBe('shadow__[10,5,3]');
      });

      it('appends --hover suffix for hover state', () => {
        const opts: BuildStyleKeyParams = {
          propertyName: 'shadow',
          interactionState: 'hover',
          value: [0, 0, 0]
        };
        expect(buildStyleKey(opts)).toBe('shadow--hover__[0,0,0]');
      });
    });

    describe('color keys (interactionState + isRef)', () => {
      it('hover + isRef=true uses == separator', () => {
        const opts: BuildStyleKeyParams = {
          propertyName: 'color',
          interactionState: 'hover',
          isRef: true,
          value: '#fff'
        };
        expect(buildStyleKey(opts)).toBe('color==hover__#fff');
      });

      it('hover + isRef=false does not use == separator', () => {
        const opts: BuildStyleKeyParams = {
          propertyName: 'color',
          interactionState: 'hover',
          isRef: false,
          value: '#000'
        };
        expect(buildStyleKey(opts)).toBe('color--hover__#000');
      });
    });

    describe('scale keys (size + optional breakpoint)', () => {
      it('size only produces ++{size} separator', () => {
        const opts: BuildStyleKeyParams = {
          propertyName: 'fontSize',
          size: 's:lg:1',
          value: 16
        };
        expect(buildStyleKey(opts)).toBe('fontSize++s:lg:1__16');
      });

      it('size + breakpoint produces ++{size}::{breakpoint}', () => {
        const opts: BuildStyleKeyParams = {
          propertyName: 'fontSize',
          size: 's:lg:1',
          breakpoint: 'bp:sm:1',
          value: 24
        };
        expect(buildStyleKey(opts)).toBe('fontSize++s:lg:1::bp:sm:1__24');
      });
    });
  });

  describe('Error handling', () => {
    it('should throw when isRef=true without interactionState', () => {
      const opts: BuildStyleKeyParams = {
        propertyName: 'background',
        value: 'red',
        isRef: true
      };
      expect(() => buildStyleKey(opts)).toThrowError(
        "buildStyleKey: when isRef=true you must supply a non-'rest' interaction state (got undefined)"
      );
    });

    it("should throw when isRef=true and interactionState is 'rest'", () => {
      const opts: BuildStyleKeyParams = {
        propertyName: 'color',
        interactionState: 'rest',
        isRef: true,
        value: '#ffffff'
      };
      expect(() => buildStyleKey(opts)).toThrowError(
        "buildStyleKey: when isRef=true you must supply a non-'rest' interaction state (got rest)"
      );
    });

    it('no interactionState + isRef=true throws error', () => {
      const opts: BuildStyleKeyParams = {
        propertyName: 'color',
        value: '#abc',
        isRef: true
      };
      expect(() => buildStyleKey(opts)).toThrowError(
        "buildStyleKey: when isRef=true you must supply a non-'rest' interaction state (got undefined)"
      );
    });
  });
});
