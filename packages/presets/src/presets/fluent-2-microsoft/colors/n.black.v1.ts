import type { StaticPrimitiveTonalColorAsset } from '@kiskadee/core';

// Promoted from the approved Fluent tonal artifact:
// docs/design-systems/fluent-2-microsoft/colors/generated/colors/n.black.v1.json
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
      1: '#f9fbfe',
      2: '#f5f6fb',
      3: '#f0f2f7',
      4: '#ebedf3',
      5: '#e6e9f0',
      6: '#e2e5ec',
      7: '#dde0e8',
      8: '#d8dbe3',
      9: '#d3d6df',
      10: '#ced1db',
      12: '#c7cbd5',
      14: '#bec2cc',
      16: '#b6bac5',
      18: '#afb2be',
      20: '#a7abb6',
      22: '#9ea2ae',
      24: '#969ba7',
      26: '#8f939f',
      28: '#878c98',
      30: '#808491',
      35: '#777b88',
      40: '#6f737f',
      45: '#666a77',
      50: '#5c616d',
      55: '#535864',
      60: '#4b4f5b',
      65: '#424651',
      70: '#393d48',
      75: '#31353f',
      80: '#292c36',
      85: '#21242d',
      90: '#1b1d22',
      95: '#151618',
      99: '#000001',
      100: '#000000'
    },
    dark: {
      0: '#000000',
      1: '#060708',
      2: '#0d0e10',
      3: '#131416',
      4: '#17181b',
      5: '#1b1c21',
      6: '#1d2026',
      7: '#21242d',
      8: '#232730',
      9: '#262a33',
      10: '#292c35',
      12: '#2d313b',
      14: '#31353f',
      16: '#353843',
      18: '#383b46',
      20: '#3b3e49',
      22: '#3e414d',
      24: '#414450',
      26: '#444753',
      28: '#474b56',
      30: '#4a4e5a',
      35: '#555965',
      40: '#5d616d',
      45: '#646975',
      50: '#6d717d',
      55: '#767a86',
      60: '#7d828e',
      65: '#858996',
      70: '#8d919d',
      75: '#9ea2ae',
      80: '#b0b4bf',
      85: '#c1c5cf',
      90: '#d3d6df',
      95: '#e9ebf2',
      99: '#fafbfe',
      100: '#ffffff'
    }
  }
} as const satisfies StaticPrimitiveTonalColorAsset;
