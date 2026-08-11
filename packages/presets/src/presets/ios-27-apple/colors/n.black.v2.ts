import type { StaticPrimitiveTonalColorAsset } from '@kiskadee/core';

// Promoted from the approved iOS 27 tonal artifact:
// docs/design-systems/ios-27-apple/colors/generated/colors/n.black.v2.json
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
      '1': '#060608',
      '2': '#0d0d0f',
      '3': '#131315',
      '4': '#18181a',
      '5': '#1c1c1e',
      '6': '#202022',
      '7': '#242426',
      '8': '#272729',
      '9': '#2a2a2c',
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
      '30': '#4e4e50',
      '35': '#59595b',
      '40': '#616163',
      '45': '#69696b',
      '50': '#717173',
      '55': '#7a7a7c',
      '60': '#818184',
      '65': '#89898c',
      '70': '#919194',
      '75': '#a2a2a5',
      '80': '#b4b4b6',
      '85': '#c5c5c8',
      '90': '#d6d6d9',
      '95': '#ebebee',
      '99': '#fbfbfc',
      '100': '#ffffff'
    },
    light: {
      '0': '#ffffff',
      '1': '#fbfbfc',
      '2': '#f6f6f8',
      '3': '#f2f2f4',
      '4': '#ededf0',
      '5': '#e9e9eb',
      '6': '#e4e4e7',
      '7': '#e0e0e3',
      '8': '#dbdbdd',
      '9': '#d6d6d9',
      '10': '#d1d1d4',
      '12': '#cacacd',
      '14': '#c2c2c5',
      '16': '#bababc',
      '18': '#b2b2b5',
      '20': '#aaaaad',
      '22': '#a2a2a5',
      '24': '#9b9b9d',
      '26': '#939395',
      '28': '#8b8c8e',
      '30': '#848487',
      '35': '#7b7b7e',
      '40': '#737375',
      '45': '#6a6a6d',
      '50': '#616163',
      '55': '#58585a',
      '60': '#4f4f52',
      '65': '#464648',
      '70': '#3d3d3f',
      '75': '#353537',
      '80': '#2c2c2e',
      '85': '#242426',
      '90': '#1c1c1e',
      '95': '#161618',
      '99': '#000001',
      '100': '#000000'
    }
  }
} as const satisfies StaticPrimitiveTonalColorAsset;
