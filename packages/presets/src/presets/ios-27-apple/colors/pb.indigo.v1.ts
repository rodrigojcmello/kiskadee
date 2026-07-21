import type { StaticPrimitiveTonalColorAsset } from '@kiskadee/core';

// Promoted from the approved iOS 27 tonal artifact:
// docs/design-systems/ios-27-apple/colors/generated/colors/pb.indigo.v1.json
export default {
  kind: 'static',
  functionalReferences: {
    light: {
      subtle: 4,
      vivid: 40
    },
    dark: {
      subtle: 2,
      vivid: 65
    }
  },
  scales: {
    dark: {
      '0': '#000000',
      '1': '#06002a',
      '2': '#0d003e',
      '3': '#13004d',
      '4': '#17005a',
      '5': '#1c0065',
      '6': '#1f006f',
      '7': '#220277',
      '8': '#25067c',
      '9': '#270b81',
      '10': '#291085',
      '12': '#2d168d',
      '14': '#301c93',
      '16': '#332098',
      '18': '#35249d',
      '20': '#3727a1',
      '22': '#3a2aa5',
      '24': '#3c2ea9',
      '26': '#3f32ad',
      '28': '#4135b2',
      '30': '#453ab6',
      '35': '#4e46c5',
      '40': '#5550ce',
      '45': '#5c58d7',
      '50': '#6361e0',
      '55': '#6b6be9',
      '60': '#7273f0',
      '65': '#797bf7',
      '70': '#8184fe',
      '75': '#9399ff',
      '80': '#a7afff',
      '85': '#bbc2ff',
      '90': '#cfd5ff',
      '95': '#e8ebff',
      '99': '#fafbff',
      '100': '#ffffff'
    },
    light: {
      '0': '#ffffff',
      '1': '#fafaff',
      '2': '#f4f6ff',
      '3': '#eff1ff',
      '4': '#e9ecff',
      '5': '#e4e7ff',
      '6': '#dfe3ff',
      '7': '#dadeff',
      '8': '#d3d8ff',
      '9': '#cdd3ff',
      '10': '#c8ceff',
      '12': '#bfc6ff',
      '14': '#b5bcff',
      '16': '#abb3ff',
      '18': '#a3aaff',
      '20': '#9aa0ff',
      '22': '#9096ff',
      '24': '#878cff',
      '26': '#7f82ff',
      '28': '#7777ff',
      '30': '#706cff',
      '35': '#675efd',
      '40': '#6155f5',
      '45': '#5949ea',
      '50': '#513cde',
      '55': '#4930d2',
      '60': '#4324c7',
      '65': '#3c14ba',
      '70': '#3500ab',
      '75': '#2d0097',
      '80': '#260081',
      '85': '#1f006e',
      '90': '#18005b',
      '95': '#12004a',
      '99': '#000002',
      '100': '#000000'
    }
  }
} as const satisfies StaticPrimitiveTonalColorAsset;
