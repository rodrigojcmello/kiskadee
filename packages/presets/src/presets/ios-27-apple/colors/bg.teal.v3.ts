import type { StaticPrimitiveTonalColorAsset } from '@kiskadee/core';

// Promoted from the approved iOS 27 tonal artifact:
// docs/design-systems/ios-27-apple/colors/generated/colors/bg.teal.v3.json
export default {
  kind: 'static',
  functionalReferences: {
    light: {
      subtle: 4,
      vivid: 20
    },
    dark: {
      subtle: 5,
      vivid: 65
    }
  },
  scales: {
    dark: {
      '0': '#000000',
      '1': '#00080d',
      '2': '#001116',
      '3': '#00171e',
      '4': '#001c24',
      '5': '#002028',
      '6': '#00242d',
      '7': '#002832',
      '8': '#002b35',
      '9': '#002e39',
      '10': '#00313d',
      '12': '#003644',
      '14': '#003b49',
      '16': '#003e4d',
      '18': '#004252',
      '20': '#004555',
      '22': '#004859',
      '24': '#004b5d',
      '26': '#004f61',
      '28': '#005265',
      '30': '#00566a',
      '35': '#006277',
      '40': '#006b82',
      '45': '#00738c',
      '50': '#007d97',
      '55': '#0086a3',
      '60': '#008fad',
      '65': '#0097b7',
      '70': '#22a0bf',
      '75': '#45b1cf',
      '80': '#64c2de',
      '85': '#80d2ec',
      '90': '#a2e2f6',
      '95': '#d4f1fb',
      '99': '#f6fdff',
      '100': '#ffffff'
    },
    light: {
      '0': '#ffffff',
      '1': '#f4fcff',
      '2': '#eafaff',
      '3': '#e1f6fd',
      '4': '#d8f3fc',
      '5': '#cfeffb',
      '6': '#c5ecfa',
      '7': '#bbe9f9',
      '8': '#ade6f8',
      '9': '#9fe3f8',
      '10': '#8fdff9',
      '12': '#74dbfb',
      '14': '#57d4f8',
      '16': '#40cdf2',
      '18': '#28c6ed',
      '20': '#00c0e8',
      '22': '#00b5da',
      '24': '#00acd0',
      '26': '#00a4c6',
      '28': '#009cbc',
      '30': '#0093b2',
      '35': '#0089a7',
      '40': '#00809c',
      '45': '#007791',
      '50': '#006c84',
      '55': '#006278',
      '60': '#00596d',
      '65': '#004f61',
      '70': '#004555',
      '75': '#003c4a',
      '80': '#00323f',
      '85': '#002a35',
      '90': '#00212a',
      '95': '#001a21',
      '99': '#000001',
      '100': '#000000'
    }
  }
} as const satisfies StaticPrimitiveTonalColorAsset;
