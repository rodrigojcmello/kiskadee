# Button activation feedback clipping

Contained feedback uses native `overflow: hidden` on the Button. This follows the rendered
`border-radius`, including intermediate values during radius transitions, without clipping the
Button border. Overflow feedback profiles retain `overflow: visible`.

Web Builder publishes `--k-af-overflow` from the profile and `--k-af-clip: none`. The structural
fallback for that clip is also `none`. Do not derive a root clip path from the target `--k-bdr`:
the token can change immediately while the actual border radius is still interpolating, causing
corners of the border to disappear during preset or radius changes. Focus outline behavior and
feedback profile timing remain independent of this native clipping mechanism.
