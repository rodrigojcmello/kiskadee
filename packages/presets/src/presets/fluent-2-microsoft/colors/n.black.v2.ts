import type { StaticPrimitiveTonalColorAsset } from '@kiskadee/core';

// Promoted from the approved Fluent tonal artifact:
// docs/design-systems/fluent-2-microsoft/colors/generated/colors/n.black.v2.json
export default {
  kind: 'static',
  functionalReferences: {
    light: {
      subtle: 4,
      vivid: 85
    },
    dark: {
      subtle: 4,
      vivid: 90
    }
  },
  scales: {
    light: {
      0: '#ffffff',
      1: '#f9fbff',
      2: '#f4f6fe',
      3: '#eef2fc',
      4: '#e9edfa',
      5: '#e4e9f5',
      6: '#e0e5f1',
      7: '#dce0ed',
      8: '#d6dbe7',
      9: '#d2d6e2',
      10: '#cdd1de',
      12: '#c6cbd7',
      14: '#bec2ce',
      16: '#b6bac6',
      18: '#aeb2be',
      20: '#a7abb6',
      22: '#9ea2ae',
      24: '#979ba6',
      26: '#8f939e',
      28: '#888c97',
      30: '#80848f',
      35: '#777b86',
      40: '#6f737e',
      45: '#676a75',
      50: '#5d616b',
      55: '#545862',
      60: '#4c4f59',
      65: '#434650',
      70: '#3a3d47',
      75: '#32353f',
      80: '#292c35',
      85: '#21242d',
      90: '#1a1d25',
      95: '#13161e',
      99: '#000001',
      100: '#000000'
    },
    dark: {
      0: '#000000',
      1: '#05060d',
      2: '#0b0d15',
      3: '#11131c',
      4: '#151821',
      5: '#191c25',
      6: '#1d1f28',
      7: '#21242d',
      8: '#232730',
      9: '#262a33',
      10: '#292c35',
      12: '#2e313a',
      14: '#32353f',
      16: '#353842',
      18: '#383b45',
      20: '#3b3e48',
      22: '#3e414b',
      24: '#41444e',
      26: '#444751',
      28: '#474b55',
      30: '#4b4e58',
      35: '#555965',
      40: '#5d616c',
      45: '#656973',
      50: '#6d717c',
      55: '#767a85',
      60: '#7e828d',
      65: '#858994',
      70: '#8d919c',
      75: '#9ea2ae',
      80: '#b0b4c0',
      85: '#c1c5d1',
      90: '#d2d6e3',
      95: '#e7ebf8',
      99: '#fafbff',
      100: '#ffffff'
    }
  }
} as const satisfies StaticPrimitiveTonalColorAsset;
