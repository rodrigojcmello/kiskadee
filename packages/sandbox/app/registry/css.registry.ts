// Static CSS registry for serving styles from Next public/ directory
// Each entry maps a template to optional core/effects CSS and a palette map by "segment|theme".
// The URLs here are served directly from packages/sandbox/public/build/**

export const cssPaths = {
  'ios-26-apple': {
    core: '/build/ios-26-apple/kiskadee.css',
    effects: '/build/ios-26-apple/effects.css',
    palettes: {
      'ios|light': '/build/ios-26-apple/ios.light.css'
    }
  },
  'ios-26-kiskadee': {
    core: '/build/ios-26-kiskadee/kiskadee.css',
    effects: '/build/ios-26-kiskadee/effects.css',
    palettes: {
      'ios|light': '/build/ios-26-kiskadee/ios.light.css',
      'ios|dark': '/build/ios-26-kiskadee/ios.dark.css',
      'ios|darker': '/build/ios-26-kiskadee/ios.darker.css'
    }
  },
  'material-design-3-google': {
    core: '/build/material-design-3-google/kiskadee.css',
    effects: '/build/material-design-3-google/effects.css',
    palettes: {
      'material|light': '/build/material-design-3-google/material.light.css'
    }
  }
} as const;

export type CssRegistry = typeof cssPaths;
