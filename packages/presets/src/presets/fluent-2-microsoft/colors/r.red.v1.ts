import type { StaticPrimitiveTonalColorAsset } from '@kiskadee/core';

// Promoted from the approved Fluent tonal artifact:
// docs/design-systems/fluent-2-microsoft/colors/generated/colors/r.red.v1.json
export default {
  kind: 'static',
  functionalReferences: {
    light: {
      subtle: 4,
      vivid: 45
    },
    dark: {
      subtle: 3,
      vivid: 40
    }
  },
  scales: {
    light: {
      0: '#ffffff',
      1: '#fff9f8',
      2: '#fff4f2',
      3: '#ffedeb',
      4: '#ffe7e4',
      5: '#ffe1de',
      6: '#ffdbd7',
      7: '#ffd5d0',
      8: '#ffcdc8',
      9: '#ffc7c0',
      10: '#ffc0b9',
      12: '#ffb5ad',
      14: '#ffa89f',
      16: '#ff9a91',
      18: '#ff8d84',
      20: '#ff7f75',
      22: '#ff6e65',
      24: '#fa615a',
      26: '#f35651',
      28: '#ec4c48',
      30: '#e4413f',
      35: '#da3334',
      40: '#d0252b',
      45: '#c50f1f',
      50: '#b70419',
      55: '#a60a18',
      60: '#951219',
      65: '#811819',
      70: '#6e1b1a',
      75: '#5e1b19',
      80: '#4c1917',
      85: '#3e1614',
      90: '#32110f',
      95: '#290b09',
      99: '#010000',
      100: '#000000'
    },
    dark: {
      0: '#000000',
      1: '#130303',
      2: '#1e0706',
      3: '#260d0b',
      4: '#2c1210',
      5: '#321513',
      6: '#381816',
      7: '#3e1a18',
      8: '#431c1a',
      9: '#491e1b',
      10: '#4e1f1c',
      12: '#57211e',
      14: '#60221f',
      16: '#69211f',
      18: '#71201e',
      20: '#742422',
      22: '#7b2321',
      24: '#802523',
      26: '#862624',
      28: '#8d2624',
      30: '#942625',
      35: '#a82929',
      40: '#b6302f',
      45: '#be3836',
      50: '#c7423e',
      55: '#d04d47',
      60: '#d8564f',
      65: '#df5f57',
      70: '#e76860',
      75: '#f67c73',
      80: '#ff958b',
      85: '#ffb0a8',
      90: '#ffc9c3',
      95: '#ffe6e3',
      99: '#fffaf9',
      100: '#ffffff'
    }
  }
} as const satisfies StaticPrimitiveTonalColorAsset;
