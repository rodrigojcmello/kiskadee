export default function createCssClass(
  name: string,
  property: string,
  value: string,
): string {
  return `
    .${name} {
      ${property}: ${value};
    }
  `;
}
