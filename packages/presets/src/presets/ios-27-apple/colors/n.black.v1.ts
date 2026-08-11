import type { StaticPrimitiveTonalColorAsset } from '@kiskadee/core';

// Promoted from the approved iOS 27 tonal artifact:
// docs/design-systems/ios-27-apple/colors/generated/colors/n.black.v1.json
export default {
  kind: 'static',
  functionalReferences: {
    light: {
      subtle: 4,
      vivid: 99
    },
    dark: {
      subtle: 5,
      vivid: 99
    }
  },
  scales: {
    dark: {
      '0': '#000000',
      '1': '#070707',
      '2': '#0e0e0e',
      '3': '#141414',
      '4': '#191919',
      '5': '#1d1d1d',
      '6': '#202020',
      '7': '#242424',
      '8': '#272727',
      '9': '#2a2a2a',
      '10': '#2d2d2d',
      '12': '#313131',
      '14': '#353535',
      '16': '#383838',
      '18': '#3c3c3c',
      '20': '#3f3f3f',
      '22': '#424242',
      '24': '#454545',
      '26': '#484848',
      '28': '#4b4b4b',
      '30': '#4f4f4f',
      '35': '#5a5a5a',
      '40': '#626262',
      '45': '#6a6a6a',
      '50': '#727272',
      '55': '#7b7b7b',
      '60': '#828282',
      '65': '#8a8a8a',
      '70': '#929292',
      '75': '#a3a3a3',
      '80': '#b4b4b4',
      '85': '#c5c5c5',
      '90': '#d7d7d7',
      '95': '#ebebeb',
      '99': '#fbfbfb',
      '100': '#ffffff'
    },
    light: {
      '0': '#ffffff',
      '1': '#fbfbfb',
      '2': '#f6f6f6',
      '3': '#f2f2f2',
      '4': '#ededed',
      '5': '#e9e9e9',
      '6': '#e5e5e5',
      '7': '#e0e0e0',
      '8': '#dbdbdb',
      '9': '#d6d6d6',
      '10': '#d1d1d1',
      '12': '#cbcbcb',
      '14': '#c2c2c2',
      '16': '#bababa',
      '18': '#b3b3b3',
      '20': '#ababab',
      '22': '#a3a3a3',
      '24': '#9b9b9b',
      '26': '#939393',
      '28': '#8c8c8c',
      '30': '#848484',
      '35': '#7b7b7b',
      '40': '#737373',
      '45': '#6b6b6b',
      '50': '#616161',
      '55': '#585858',
      '60': '#4f4f4f',
      '65': '#464646',
      '70': '#3d3d3d',
      '75': '#353535',
      '80': '#2c2c2c',
      '85': '#252525',
      '90': '#1d1d1d',
      '95': '#161616',
      '99': '#010101',
      '100': '#000000'
    }
  }
} as const satisfies StaticPrimitiveTonalColorAsset;
