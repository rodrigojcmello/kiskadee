export function extractCssClassName(cssRule: string): string | null {
  // Regex to extract class selector optionally inside @media block, ignoring pseudo selectors
  // 1. Optional @media block: @media ... { ... }
  // 2. Extract the class name starting with dot, capturing valid characters until pseudo selectors or whitespace/newline
  // 3. Consider classes with special characters like --, __, [] etc.

  // First, remove @media blocks if present, extract inner css rule(s)
  // Because the input can be just a single class rule or inside a media query

  // Match @media block with a class rule inside and capture that class selector
  const mediaRegex = /@media[^{]*\{([^{}]*\{[^{}]*\})\s*\}/s;
  let innerRule = cssRule;

  const mediaMatch = mediaRegex.exec(cssRule);
  if (mediaMatch) {
    innerRule = mediaMatch[1].trim();
  }

  // Extract class selector by stopping at pseudo selectors (":hover", ":focus", etc) or whitespace
  // Class selector can have characters valid in CSS class names including brackets
  // Matches something starting with dot, then anything except pseudo selectors and spaces, until we find : or { or space
  // For example: .shadow--hover__[4,4,4,[0,0,0,0.5]]

  // We'll extract everything after "." up to the first ':' or whitespace or '{'
  const classNameRegex = /^\s*\.([^\s:{]+)(?=:|{|\s|$)/;

  const classMatch = classNameRegex.exec(innerRule);
  if (classMatch) {
    return classMatch[1];
  }

  return null;
}

// Examples to test:
// console.log(
//   extractCssClassName(
//     '.shadow--hover__[4,4,4,[0,0,0,0.5]]:hover { box-shadow: 4px 4px 4px #00000080; }'
//   )
// );
// Output: shadow--hover__[4,4,4,[0,0,0,0.5]]

// console.log(
//   extractCssClassName('@media (max-width: 600px) { .my-class__test:hover { color: red; } }')
// );
// Output: my-class__test
