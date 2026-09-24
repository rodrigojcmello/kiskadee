import type { StaticPrimitiveTonalColorAsset } from '@kiskadee/core';

// Generated from colors/pb.indigo.v1.json by @kiskadee/tonal-scale@0.19.0.
export default {
  kind: 'static',
  classification: {
    classifier: 'munsell-oklch-v1',
    referenceHex: '#8a3ffc',
    sector: 'purple-blue',
    positionInSector: 0.8858690329276094
  },
  functionalReferences: {
    light: {
      subtle: 4,
      medium: 14,
      vivid: 35
    },
    dark: {
      subtle: 3,
      medium: 16,
      vivid: 50
    }
  },
  scales: {
    light: {
      '0': '#ffffff',
      '1': '#fbfaff',
      '2': '#f7f5ff',
      '3': '#f3f0ff',
      '4': '#eeeaff',
      '5': '#eae5ff',
      '6': '#e6e0ff',
      '7': '#e2dbff',
      '8': '#ddd4ff',
      '9': '#d9ceff',
      '10': '#d5c9ff',
      '12': '#cec0ff',
      '14': '#c7b5ff',
      '16': '#bfaaff',
      '18': '#b9a1ff',
      '20': '#b296ff',
      '22': '#ab8aff',
      '24': '#a57fff',
      '26': '#9f72ff',
      '28': '#9966ff',
      '30': '#9357ff',
      '35': '#8a3ffc',
      '40': '#8537f6',
      '45': '#7d28ed',
      '50': '#7412e1',
      '55': '#6a00d1',
      '60': '#6000bf',
      '65': '#5600ab',
      '70': '#4b0097',
      '75': '#410085',
      '80': '#370072',
      '85': '#2e0061',
      '90': '#250050',
      '95': '#1c0041',
      '99': '#000001',
      '100': '#000000'
    },
    dark: {
      '0': '#000000',
      '1': '#0d0023',
      '2': '#160036',
      '3': '#1e0043',
      '4': '#24004e',
      '5': '#290058',
      '6': '#2e0061',
      '7': '#32006a',
      '8': '#360071',
      '9': '#3a0078',
      '10': '#3e007e',
      '12': '#44008a',
      '14': '#490094',
      '16': '#4e009c',
      '18': '#5200a4',
      '20': '#5600ab',
      '22': '#5900b2',
      '24': '#5d00b9',
      '26': '#6100c0',
      '28': '#6500c8',
      '30': '#6900d0',
      '35': '#7617e3',
      '40': '#7d28ed',
      '45': '#8435f5',
      '50': '#8a3ffc',
      '55': '#9253ff',
      '60': '#9761ff',
      '65': '#9d6eff',
      '70': '#a37aff',
      '75': '#b092ff',
      '80': '#bea9ff',
      '85': '#cdbeff',
      '90': '#dcd2ff',
      '95': '#eee9ff',
      '99': '#fcfbff',
      '100': '#ffffff'
    }
  }
} as const satisfies StaticPrimitiveTonalColorAsset;
