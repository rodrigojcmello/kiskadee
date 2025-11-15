// Static registry for Kiskadee template assets used by the showcase
// Replace or regenerate this file to expose your templates via dynamic import.
// Example of how to add entries (when files are placed under app/(data)/build):
// export const coreMaps = {
//   'ios-26-apple': () => import('@/app/(data)/build/ios-26-apple/classNamesMap.core.json')
// } as const;
//
// export const paletteMaps = {
//   'ios-26-apple|ios|light': () => import('@/app/(data)/build/ios-26-apple/classNamesMap.ios.light.json'),
//   'ios-26-apple|ios|dark': () => import('@/app/(data)/build/ios-26-apple/classNamesMap.ios.dark.json')
// } as const;
//
// export const paletteIndex = {
//   'ios-26-apple': {
//     segments: ['ios'],
//     themesBySegment: { ios: ['light', 'dark'] }
//   }
// } as const;
//
// export const templateMeta = {
//   'ios-26-apple': { displayName: 'iOS 26 — Apple' }
// } as const;

export const coreMaps = {
  'ios-26-apple': () => import('./build/ios-26-apple/classNamesMap.json'),
  'ios-26-kiskadee': () => import('./build/ios-26-kiskadee/classNamesMap.json'),
  'material-design-3-google': () => import('./build/material-design-3-google/classNamesMap.json')
} as const;

export const paletteMaps = {
  // ios-26-apple palettes
  'ios-26-apple|ios|light': () => import('./build/ios-26-apple/classNamesMap.ios.light.json'),
  // ios-26-kiskadee palettes
  'ios-26-kiskadee|ios|light': () => import('./build/ios-26-kiskadee/classNamesMap.ios.light.json'),
  'ios-26-kiskadee|ios|dark': () => import('./build/ios-26-kiskadee/classNamesMap.ios.dark.json'),
  'ios-26-kiskadee|ios|darker': () => import('./build/ios-26-kiskadee/classNamesMap.ios.darker.json'),
  // material-design-3-google palettes
  'material-design-3-google|material|light': () => import('./build/material-design-3-google/classNamesMap.material.light.json')
} as const;

export const paletteIndex = {
  'ios-26-apple': {
    segments: ['ios'],
    themesBySegment: { ios: ['light'] }
  },
  'ios-26-kiskadee': {
    segments: ['ios'],
    themesBySegment: { ios: ['light', 'dark', 'darker'] }
  },
  'material-design-3-google': {
    segments: ['material'],
    themesBySegment: { material: ['light'] }
  }
} as const;

export const templateMeta = {
  'ios-26-apple': { displayName: 'iOS 26 — Apple' },
  'ios-26-kiskadee': { displayName: 'iOS 26 — Kiskadee' },
  'material-design-3-google': { displayName: 'Material Design 3 — Google' }
} as const;
