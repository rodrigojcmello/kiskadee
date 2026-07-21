import type { StaticPrimitiveTonalColorAsset } from '@kiskadee/core';

// Promoted from the approved iOS 27 tonal artifact:
// docs/design-systems/ios-27-apple/colors/generated/colors/yr.orange.v1.json
export default {
  kind: 'static',
  functionalReferences: {
    light: {
      subtle: 4,
      vivid: 18
    },
    dark: {
      subtle: 4,
      vivid: 65
    }
  },
  scales: {
    dark: {
      '0': '#000000',
      '1': '#110400',
      '2': '#1c0900',
      '3': '#240e00',
      '4': '#2b1200',
      '5': '#311500',
      '6': '#361800',
      '7': '#3b1b00',
      '8': '#411d00',
      '9': '#451f00',
      '10': '#482200',
      '12': '#4f2500',
      '14': '#562900',
      '16': '#5c2c00',
      '18': '#602f00',
      '20': '#643100',
      '22': '#693300',
      '24': '#6d3600',
      '26': '#723800',
      '28': '#773b00',
      '30': '#7c3e00',
      '35': '#8c4700',
      '40': '#984d00',
      '45': '#a35300',
      '50': '#ae5a00',
      '55': '#bb6100',
      '60': '#c66700',
      '65': '#d16d00',
      '70': '#d9761c',
      '75': '#e8893e',
      '80': '#f69d5b',
      '85': '#feb37e',
      '90': '#fdccac',
      '95': '#fee7d7',
      '99': '#fffaf7',
      '100': '#ffffff'
    },
    light: {
      '0': '#ffffff',
      '1': '#fffaf6',
      '2': '#fff4ed',
      '3': '#ffeee4',
      '4': '#fee9da',
      '5': '#fde3d2',
      '6': '#fddeca',
      '7': '#fdd8bf',
      '8': '#fcd1b4',
      '9': '#fccba9',
      '10': '#fcc49e',
      '12': '#feba8b',
      '14': '#ffad71',
      '16': '#ffa058',
      '18': '#ff8d28',
      '20': '#fc881a',
      '22': '#f37f00',
      '24': '#e77900',
      '26': '#dc7300',
      '28': '#d16d00',
      '30': '#c66700',
      '35': '#b96000',
      '40': '#ad5900',
      '45': '#a15300',
      '50': '#934b00',
      '55': '#864400',
      '60': '#7a3d00',
      '65': '#6c3600',
      '70': '#5f2e00',
      '75': '#542800',
      '80': '#472100',
      '85': '#3b1b00',
      '90': '#301400',
      '95': '#260f00',
      '99': '#010000',
      '100': '#000000'
    }
  }
} as const satisfies StaticPrimitiveTonalColorAsset;
