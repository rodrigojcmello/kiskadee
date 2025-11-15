// Static CSS registry for serving styles from Next public/ directory
// Each entry maps a template to optional core/effects CSS and a palette map by "segment|theme".
// The URLs here are served directly from packages/showcase/public/build/**

export const cssPaths = {
  'ios-26-apple': {
    core: '/build/ios-26-apple/core.kiskadee.css',
    effects: '/build/ios-26-apple/effects.kiskadee.css',
    palettes: {
      'ios|light': '/build/ios-26-apple/ios.light.kiskadee.css'
    }
  },
  'ios-26-kiskadee': {
    core: '/build/ios-26-kiskadee/core.kiskadee.css',
    effects: '/build/ios-26-kiskadee/effects.kiskadee.css',
    palettes: {
      'ios|light': '/build/ios-26-kiskadee/ios.light.kiskadee.css',
      'ios|dark': '/build/ios-26-kiskadee/ios.dark.kiskadee.css',
      'ios|darker': '/build/ios-26-kiskadee/ios.darker.kiskadee.css'
    }
  },
  'material-design-3-google': {
    core: '/build/material-design-3-google/core.kiskadee.css',
    effects: '/build/material-design-3-google/effects.kiskadee.css',
    palettes: {
      'material|light': '/build/material-design-3-google/material.light.kiskadee.css'
    }
  }
} as const;

export type CssRegistry = typeof cssPaths;
