import type { StaticPrimitiveTonalColorAsset } from '@kiskadee/core';

// Promoted from the approved iOS 27 tonal artifact:
// docs/design-systems/ios-27-apple/colors/generated/colors/n.black.v1.json
export default {
  kind: 'static',
  functionalReferences: {
    light: {
      subtle: 4,
      vivid: 90
    },
    dark: {
      subtle: 5,
      vivid: 95
    }
  },
  scales: {
    dark: {
      '0': '#000000',
      '1': '#070708',
      '2': '#0e0e0f',
      '3': '#141415',
      '4': '#18181a',
      '5': '#1c1c1e',
      '6': '#1f2022',
      '7': '#232426',
      '8': '#262729',
      '9': '#292a2c',
      '10': '#2c2c2e',
      '12': '#303033',
      '14': '#353537',
      '16': '#38383b',
      '18': '#3b3b3e',
      '20': '#3e3e41',
      '22': '#424244',
      '24': '#444447',
      '26': '#47474a',
      '28': '#4b4b4d',
      '30': '#4e4e51',
      '35': '#59595b',
      '40': '#616164',
      '45': '#69696c',
      '50': '#717174',
      '55': '#7a7a7d',
      '60': '#818184',
      '65': '#89898c',
      '70': '#919194',
      '75': '#a2a2a5',
      '80': '#b4b4b6',
      '85': '#c5c5c7',
      '90': '#d6d6d8',
      '95': '#ebebed',
      '99': '#fbfbfc',
      '100': '#ffffff'
    },
    light: {
      '0': '#ffffff',
      '1': '#fbfbfb',
      '2': '#f6f6f7',
      '3': '#f2f2f3',
      '4': '#ededef',
      '5': '#e9e9ea',
      '6': '#e5e5e6',
      '7': '#e0e0e2',
      '8': '#dbdbdd',
      '9': '#d6d6d8',
      '10': '#d1d1d4',
      '12': '#cacacd',
      '14': '#c2c2c4',
      '16': '#bababc',
      '18': '#b2b2b5',
      '20': '#aaaaad',
      '22': '#a2a2a5',
      '24': '#9b9b9e',
      '26': '#939396',
      '28': '#8b8b8e',
      '30': '#848487',
      '35': '#7b7b7e',
      '40': '#737376',
      '45': '#6a6a6d',
      '50': '#606063',
      '55': '#57585a',
      '60': '#4f4f52',
      '65': '#464649',
      '70': '#3d3d40',
      '75': '#353537',
      '80': '#2c2c2e',
      '85': '#242427',
      '90': '#1c1c1e',
      '95': '#161618',
      '99': '#000001',
      '100': '#000000'
    }
  }
} as const satisfies StaticPrimitiveTonalColorAsset;
