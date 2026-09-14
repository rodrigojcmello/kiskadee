// Version 2.4.2's export map omits its declaration entry. Limit this bridge to the API used by
// build-only CSS partitioning; no dependency types or code are exposed to browser consumers.
declare module '@bramus/specificity' {
  const Specificity: {
    calculate(selector: string): Array<{ value: { a: number; b: number; c: number } }>;
  };
  export default Specificity;
}
