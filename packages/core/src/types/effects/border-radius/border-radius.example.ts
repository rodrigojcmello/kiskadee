import type { ElementEffects } from '../index.ts';

// Example usage of the borderRadius effect schema following the same style as shadow.example.ts
// This demonstrates:
// - Numeric values per interaction state (rest/hover/pressed/focus)
// - A nested `selected` sub-map with its own states
// - An optional CSS transition configuration
// - A responsive example for `hover` using size tokens compatible with `scales`
const borderRadiusEffect: ElementEffects = {
  borderRadius: {
    rounded: {
      // Base, non-selected states
      rest: 20,
      hover: {
        // Responsive values by size token (same convention as `scales`)
        's:sm:1': 24,
        's:md:1': 22,
        's:lg:1': 20
      },
      pressed: 16,
      focus: 20,

      // Control/selected (boolean) variant with its own interaction states
      selected: {
        // MD3-like: round -> square on selection
        rest: 0,
        hover: 4,
        pressed: 0,
        focus: 0
      }
    }
  }
};

console.log(borderRadiusEffect);
