import type { DecorationSchema } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { convertElementDecorationsToStyleKeys } from './convertElementDecorationsToStyleKeys';

describe('convertElementDecorationsToStyleKeys', () => {
  describe('textFont style key generation', () => {
    it('should generate the textFont style key for a semantic font token', () => {
      const decoration: DecorationSchema = { textFont: 'body' };
      const styleKey = convertElementDecorationsToStyleKeys(decoration)[0];

      expect(styleKey).toEqual('textFont__body');
    });
  });

  describe('textItalic style key generation', () => {
    it('generates the textItalic__true style key when italic is enabled', () => {
      const decoration: DecorationSchema = { textItalic: true };
      const styleKey = convertElementDecorationsToStyleKeys(decoration)[0];

      expect(styleKey).toEqual('textItalic__true');
    });

    it('generates the textItalic__false style key when italic is disabled', () => {
      const decoration: DecorationSchema = { textItalic: false };
      const styleKey = convertElementDecorationsToStyleKeys(decoration)[0];

      expect(styleKey).toEqual('textItalic__false');
    });
  });

  describe('textWeight style key generation', () => {
    it('generates the textWeight__thin style key for thin font weight', () => {
      const decoration: DecorationSchema = { textWeight: 'thin' };
      const styleKey = convertElementDecorationsToStyleKeys(decoration)[0];

      expect(styleKey).toEqual('textWeight__thin');
    });

    it('generates the textWeight__extraLight style key for extraLight font weight', () => {
      const decoration: DecorationSchema = { textWeight: 'extraLight' };
      const styleKey = convertElementDecorationsToStyleKeys(decoration)[0];

      expect(styleKey).toEqual('textWeight__extraLight');
    });

    it('generates the textWeight__light style key for light font weight', () => {
      const decoration: DecorationSchema = { textWeight: 'light' };
      const styleKey = convertElementDecorationsToStyleKeys(decoration)[0];

      expect(styleKey).toEqual('textWeight__light');
    });

    it('generates the textWeight__normal style key for normal font weight', () => {
      const decoration: DecorationSchema = { textWeight: 'normal' };
      const styleKey = convertElementDecorationsToStyleKeys(decoration)[0];

      expect(styleKey).toEqual('textWeight__normal');
    });

    it('generates the textWeight__medium style key for medium font weight', () => {
      const decoration: DecorationSchema = { textWeight: 'medium' };
      const styleKey = convertElementDecorationsToStyleKeys(decoration)[0];

      expect(styleKey).toEqual('textWeight__medium');
    });

    it('generates the textWeight__semiBold style key for semiBold font weight', () => {
      const decoration: DecorationSchema = { textWeight: 'semiBold' };
      const styleKey = convertElementDecorationsToStyleKeys(decoration)[0];

      expect(styleKey).toEqual('textWeight__semiBold');
    });

    it('generates the textWeight__bold style key for bold font weight', () => {
      const decoration: DecorationSchema = { textWeight: 'bold' };
      const styleKey = convertElementDecorationsToStyleKeys(decoration)[0];

      expect(styleKey).toEqual('textWeight__bold');
    });

    it('generates the textWeight__extraBold style key for extraBold font weight', () => {
      const decoration: DecorationSchema = { textWeight: 'extraBold' };
      const styleKey = convertElementDecorationsToStyleKeys(decoration)[0];

      expect(styleKey).toEqual('textWeight__extraBold');
    });

    it('generates the textWeight__black style key for black font weight', () => {
      const decoration: DecorationSchema = { textWeight: 'black' };
      const styleKey = convertElementDecorationsToStyleKeys(decoration)[0];

      expect(styleKey).toEqual('textWeight__black');
    });
  });

  describe('textLineType style key generation', () => {
    it('generates the textLineType__none style key for none line type', () => {
      const decoration: DecorationSchema = { textLineType: 'none' };
      const styleKey = convertElementDecorationsToStyleKeys(decoration)[0];

      expect(styleKey).toEqual('textLineType__none');
    });

    it('generates the textLineType__underline style key for underline line type', () => {
      const decoration: DecorationSchema = { textLineType: 'underline' };
      const styleKey = convertElementDecorationsToStyleKeys(decoration)[0];

      expect(styleKey).toEqual('textLineType__underline');
    });

    it('generates the textLineType__lineThrough style key for lineThrough line type', () => {
      const decoration: DecorationSchema = { textLineType: 'lineThrough' };
      const styleKey = convertElementDecorationsToStyleKeys(decoration)[0];

      expect(styleKey).toEqual('textLineType__lineThrough');
    });
  });

  describe('textAlign style key generation', () => {
    it('generates the textAlign__left style key for left text alignment', () => {
      const decoration: DecorationSchema = { textAlign: 'left' };
      const styleKey = convertElementDecorationsToStyleKeys(decoration)[0];

      expect(styleKey).toEqual('textAlign__left');
    });

    it('generates the textAlign__center style key for center text alignment', () => {
      const decoration: DecorationSchema = { textAlign: 'center' };
      const styleKey = convertElementDecorationsToStyleKeys(decoration)[0];

      expect(styleKey).toEqual('textAlign__center');
    });

    it('generates the textAlign__right style key for right text alignment', () => {
      const decoration: DecorationSchema = { textAlign: 'right' };
      const styleKey = convertElementDecorationsToStyleKeys(decoration)[0];

      expect(styleKey).toEqual('textAlign__right');
    });
  });

  describe('borderStyle style key generation', () => {
    it('generates the borderStyle__none style key for none border style', () => {
      const decoration: DecorationSchema = { borderStyle: 'none' };
      const styleKey = convertElementDecorationsToStyleKeys(decoration)[0];

      expect(styleKey).toEqual('borderStyle__none');
    });

    it('generates the borderStyle__dotted style key for dotted border style', () => {
      const decoration: DecorationSchema = { borderStyle: 'dotted' };
      const styleKey = convertElementDecorationsToStyleKeys(decoration)[0];

      expect(styleKey).toEqual('borderStyle__dotted');
    });

    it('generates the borderStyle__dashed style key for dashed border style', () => {
      const decoration: DecorationSchema = { borderStyle: 'dashed' };
      const styleKey = convertElementDecorationsToStyleKeys(decoration)[0];

      expect(styleKey).toEqual('borderStyle__dashed');
    });

    it('generates the borderStyle__solid style key for solid border style', () => {
      const decoration: DecorationSchema = { borderStyle: 'solid' };
      const styleKey = convertElementDecorationsToStyleKeys(decoration)[0];

      expect(styleKey).toEqual('borderStyle__solid');
    });
  });
});
