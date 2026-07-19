import type { StaticPrimitiveTonalColorAsset } from '@kiskadee/core';

// Promoted from the approved Fluent tonal artifact:
// docs/design-systems/fluent-2-microsoft/colors/generated/colors/yr.orange.v1.json
export default {
  kind: 'static',
  functionalReferences: {
    light: {
      subtle: 4,
      vivid: 24
    },
    dark: {
      subtle: 4,
      vivid: 40
    }
  },
  scales: {
    light: {
      0: '#ffffff',
      1: '#fff9f7',
      2: '#fff4ef',
      3: '#ffeee7',
      4: '#ffe8df',
      5: '#ffe2d7',
      6: '#ffdccf',
      7: '#ffd6c6',
      8: '#ffcfbc',
      9: '#ffc8b3',
      10: '#ffc2a9',
      12: '#ffb89b',
      14: '#ffaa89',
      16: '#ff9d75',
      18: '#ff9163',
      20: '#ff834d',
      22: '#ff7230',
      24: '#f7630c',
      26: '#f05e00',
      28: '#e55900',
      30: '#d95400',
      35: '#cb4e00',
      40: '#bd4905',
      45: '#ae450c',
      50: '#9d4012',
      55: '#8d3c15',
      60: '#7f3817',
      65: '#6f3217',
      70: '#602d17',
      75: '#532715',
      80: '#452111',
      85: '#3a1b0d',
      90: '#301408',
      95: '#280d03',
      99: '#010000',
      100: '#000000'
    },
    dark: {
      0: '#000000',
      1: '#0f0402',
      2: '#1b0a04',
      3: '#220f07',
      4: '#28140c',
      5: '#2d170f',
      6: '#331b11',
      7: '#381d12',
      8: '#3c2014',
      9: '#412214',
      10: '#462415',
      12: '#4f2716',
      14: '#572915',
      16: '#5e2b15',
      18: '#642d14',
      20: '#692e13',
      22: '#6f3012',
      24: '#743111',
      26: '#7b330f',
      28: '#81340e',
      30: '#87360c',
      35: '#9a3c09',
      40: '#a5430f',
      45: '#ae4b1b',
      50: '#b75426',
      55: '#c05e31',
      60: '#c8663b',
      65: '#cf6e44',
      70: '#d7774e',
      75: '#e68962',
      80: '#f49d79',
      85: '#ffb292',
      90: '#ffcbb5',
      95: '#ffe6dc',
      99: '#fffaf8',
      100: '#ffffff'
    }
  }
} as const satisfies StaticPrimitiveTonalColorAsset;
