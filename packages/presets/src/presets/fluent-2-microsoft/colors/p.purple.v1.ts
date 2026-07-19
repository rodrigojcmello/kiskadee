import type { StaticPrimitiveTonalColorAsset } from '@kiskadee/core';

// Promoted from the approved Fluent tonal artifact:
// docs/design-systems/fluent-2-microsoft/colors/generated/colors/p.purple.v1.json
export default {
  kind: 'static',
  functionalReferences: {
    light: {
      subtle: 4,
      vivid: 35
    },
    dark: {
      subtle: 3,
      vivid: 40
    }
  },
  scales: {
    light: {
      0: '#ffffff',
      1: '#fff8fe',
      2: '#fef2fc',
      3: '#fdecf9',
      4: '#fbe6f6',
      5: '#f9e0f4',
      6: '#f8daf2',
      7: '#f7d4f0',
      8: '#f6ccee',
      9: '#f6c5ec',
      10: '#f7bcec',
      12: '#faaded',
      14: '#fe99ee',
      16: '#fb8bea',
      18: '#f582e4',
      20: '#ee77de',
      22: '#e76cd7',
      24: '#e062d0',
      26: '#d958c9',
      28: '#d14ec2',
      30: '#ca43ba',
      35: '#c239b3',
      40: '#b431a6',
      45: '#a82d9a',
      50: '#982b8c',
      55: '#882a7e',
      60: '#7a2971',
      65: '#6b2762',
      70: '#5c2455',
      75: '#4f2149',
      80: '#411d3c',
      85: '#361832',
      90: '#2c1228',
      95: '#240b20',
      99: '#010000',
      100: '#000000'
    },
    dark: {
      0: '#000000',
      1: '#10030e',
      2: '#1b0719',
      3: '#230d20',
      4: '#291125',
      5: '#2e152b',
      6: '#341730',
      7: '#3b1736',
      8: '#41183c',
      9: '#481742',
      10: '#481e42',
      12: '#51204b',
      14: '#5a1f53',
      16: '#602059',
      18: '#65225d',
      20: '#6c2064',
      22: '#702267',
      24: '#75236c',
      26: '#7b2371',
      28: '#812377',
      30: '#87247c',
      35: '#99268d',
      40: '#a62d99',
      45: '#ad35a0',
      50: '#b63fa8',
      55: '#bf4ab1',
      60: '#c753b8',
      65: '#ce5cbf',
      70: '#d566c6',
      75: '#e47ad5',
      80: '#f28fe3',
      85: '#fda6ee',
      90: '#f7c7ee',
      95: '#fbe5f6',
      99: '#fff9fe',
      100: '#ffffff'
    }
  }
} as const satisfies StaticPrimitiveTonalColorAsset;
