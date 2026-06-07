/** biome-ignore-all lint/a11y/noSvgWithoutTitle: decorative icon receives its accessible name from the control. */
/** biome-ignore-all lint/correctness/useUniqueElementIds: static icon asset mirrors exported SVG ids. */
import type { SVGProps } from 'react';

export function IconMoon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#clip0_201_76448)">
        <path
          d="M20.4102 17.9141C13.9531 17.9141 9.94531 14.0234 9.94531 7.77734C9.94531 5.99609 10.2383 4.42578 10.6719 3.58203C10.8477 3.24219 10.8828 3.07812 10.8828 2.84375C10.8828 2.45703 10.5195 2 10.0273 2C9.93359 2 9.71094 2.03516 9.38281 2.16406C5.04688 3.92188 2 8.49219 2 13.4141C2 20.5273 7.16797 25.707 14.2812 25.707C19.3789 25.707 23.5156 23.0352 25.4141 18.6523C25.5547 18.3477 25.5781 18.0898 25.5781 17.9609C25.5781 17.4805 25.168 17.1523 24.8047 17.1523C24.6172 17.1523 24.4766 17.1641 24.1953 17.2695C23.2461 17.6562 21.8164 17.9141 20.4102 17.9141ZM3.83984 13.332C3.83984 9.6875 5.73828 6.21875 8.77344 4.30859C8.39844 5.39844 8.19922 6.60547 8.19922 7.94141C8.19922 15.2656 12.6641 19.625 20.1406 19.625C21.3477 19.625 22.3672 19.4844 23.3398 19.1445C21.5586 22.0859 18.125 23.8789 14.3516 23.8789C8.26953 23.8789 3.83984 19.4492 3.83984 13.332Z"
          fill="currentColor"
          fillOpacity="0.85"
        />
      </g>
      <defs>
        <clipPath id="clip0_201_76448">
          <rect width="23.5781" height="23.7539" fill="white" transform="translate(2 2)" />
        </clipPath>
      </defs>
    </svg>
  );
}
