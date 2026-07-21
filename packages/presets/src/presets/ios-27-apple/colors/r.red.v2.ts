import type { StaticPrimitiveTonalColorAsset } from '@kiskadee/core';

// Promoted from the approved iOS 27 tonal artifact:
// docs/design-systems/ios-27-apple/colors/generated/colors/r.red.v2.json
export default {
  kind: 'static',
  functionalReferences: {
    light: {
      subtle: 4,
      vivid: 28
    },
    dark: {
      subtle: 3,
      vivid: 65
    }
  },
  scales: {
    dark: {
      '0': '#000000',
      '1': '#190002',
      '2': '#270005',
      '3': '#320007',
      '4': '#3a000a',
      '5': '#42000c',
      '6': '#49000f',
      '7': '#4f0011',
      '8': '#550013',
      '9': '#5b0015',
      '10': '#600016',
      '12': '#69001a',
      '14': '#71001c',
      '16': '#77001e',
      '18': '#7e0020',
      '20': '#830022',
      '22': '#890024',
      '24': '#8e0026',
      '26': '#940028',
      '28': '#9a002a',
      '30': '#a1002c',
      '35': '#b40734',
      '40': '#be1c3c',
      '45': '#c72843',
      '50': '#d0344b',
      '55': '#d94154',
      '60': '#e14b5c',
      '65': '#ec5967',
      '70': '#f05f6c',
      '75': '#ff747e',
      '80': '#ff9498',
      '85': '#ffb0b1',
      '90': '#ffc9c9',
      '95': '#ffe5e5',
      '99': '#fffafa',
      '100': '#ffffff'
    },
    light: {
      '0': '#ffffff',
      '1': '#fff9f9',
      '2': '#fff3f3',
      '3': '#ffeded',
      '4': '#ffe7e7',
      '5': '#ffe1e1',
      '6': '#ffdbdb',
      '7': '#ffd4d5',
      '8': '#ffcdcd',
      '9': '#ffc6c6',
      '10': '#ffbfbf',
      '12': '#ffb4b5',
      '14': '#ffa6a9',
      '16': '#ff999c',
      '18': '#ff8c91',
      '20': '#ff7c85',
      '22': '#ff6b77',
      '24': '#ff586a',
      '26': '#ff3f5d',
      '28': '#ff2d55',
      '30': '#f40749',
      '35': '#e50043',
      '40': '#d6003e',
      '45': '#c70039',
      '50': '#b60033',
      '55': '#a6002e',
      '60': '#970029',
      '65': '#870024',
      '70': '#77001f',
      '75': '#69001a',
      '80': '#590014',
      '85': '#4b0010',
      '90': '#3e000b',
      '95': '#320007',
      '99': '#010000',
      '100': '#000000'
    }
  }
} as const satisfies StaticPrimitiveTonalColorAsset;
