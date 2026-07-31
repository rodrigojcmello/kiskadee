// Generated from packages/icons/assets and metadata/icons.json. Do not edit manually.
import type { IconProps } from '../../Icon.types.ts';

export type RedditIconConstruction = 'contained' | 'mark';
export type RedditIconPresentation = 'brand' | 'brandFlat' | 'monochrome';

export type RedditIconProps = IconProps & (
  | {
      construction?: 'contained';
      presentation?: 'brand' | 'brandFlat';
    }
  | {
      construction: 'mark';
      presentation?: 'brand' | 'monochrome';
    }
);

const DEFAULT_PRESENTATIONS: Record<RedditIconConstruction, RedditIconPresentation> = {"contained":"brand","mark":"brand"};

export function RedditIcon({
  construction = 'contained',
  presentation,
  ...props
}: RedditIconProps) {
  const resolvedConstruction = construction as RedditIconConstruction;
  const resolvedPresentation =
    presentation ?? DEFAULT_PRESENTATIONS[resolvedConstruction];

  if (resolvedConstruction === 'contained' && resolvedPresentation === 'brand') {
    return (
      <svg width="1em" height="1em" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
      viewBox="-40.421052631579 -40.421052631579 336.842105263158 336.842105263158" enableBackground="new 0 0 256 256" xmlSpace="preserve" aria-hidden="true" focusable="false" {...props}>
      <path fill="#FF4500" d="M128,0L128,0C57.3,0,0,57.3,0,128l0,0c0,35.4,14.3,67.4,37.5,90.5l-24.4,24.4c-4.8,4.8-1.4,13.1,5.4,13.1H128
      l0,0c70.7,0,128-57.3,128-128l0,0C256,57.3,198.7,0,128,0z"/>
      <g>
      <radialGradient id="SVGID_1_" cx="981.0251" cy="1.811" r="127.45" fx="981.0251" fy="-7.319" gradientTransform="matrix(0.47 0 0 -0.41 -260.07 108.3)" gradientUnits="userSpaceOnUse">
      <stop  offset="0" stopColor="#FEFFFF"/>
      <stop  offset="0.4" stopColor="#FEFFFF"/>
      <stop  offset="0.51" stopColor="#F9FCFC"/>
      <stop  offset="0.62" stopColor="#EDF3F5"/>
      <stop  offset="0.7" stopColor="#DEE9EC"/>
      <stop  offset="0.72" stopColor="#D8E4E8"/>
      <stop  offset="0.76" stopColor="#CCD8DF"/>
      <stop  offset="0.8" stopColor="#C8D5DD"/>
      <stop  offset="0.83" stopColor="#CCD6DE"/>
      <stop  offset="0.85" stopColor="#D8DBE2"/>
      <stop  offset="0.88" stopColor="#EDE3E9"/>
      <stop  offset="0.9" stopColor="#FFEBEF"/>
      </radialGradient>
      <circle fill="url(#SVGID_1_)" cx="200.6" cy="123.7" r="29.9"/>
      <radialGradient id="SVGID_00000036246770641878814990000005919777119678409602_" cx="672.2592" cy="1.811" r="127.45" fx="672.2592" fy="-7.319" gradientTransform="matrix(0.47 0 0 -0.41 -260.07 108.3)" gradientUnits="userSpaceOnUse">
      <stop  offset="0" stopColor="#FEFFFF"/>
      <stop  offset="0.4" stopColor="#FEFFFF"/>
      <stop  offset="0.51" stopColor="#F9FCFC"/>
      <stop  offset="0.62" stopColor="#EDF3F5"/>
      <stop  offset="0.7" stopColor="#DEE9EC"/>
      <stop  offset="0.72" stopColor="#D8E4E8"/>
      <stop  offset="0.76" stopColor="#CCD8DF"/>
      <stop  offset="0.8" stopColor="#C8D5DD"/>
      <stop  offset="0.83" stopColor="#CCD6DE"/>
      <stop  offset="0.85" stopColor="#D8DBE2"/>
      <stop  offset="0.88" stopColor="#EDE3E9"/>
      <stop  offset="0.9" stopColor="#FFEBEF"/>
      </radialGradient>
      <circle fill="url(#SVGID_00000036246770641878814990000005919777119678409602_)" cx="55.4" cy="123.7" r="29.9"/>
      <radialGradient id="SVGID_00000018938084004212545110000003812637463316940965_" cx="830.6751" cy="-224.6845" r="384.44" gradientTransform="matrix(0.47 0 0 -0.33 -260.07 25.03)" gradientUnits="userSpaceOnUse">
      <stop  offset="0" stopColor="#FEFFFF"/>
      <stop  offset="0.4" stopColor="#FEFFFF"/>
      <stop  offset="0.51" stopColor="#F9FCFC"/>
      <stop  offset="0.62" stopColor="#EDF3F5"/>
      <stop  offset="0.7" stopColor="#DEE9EC"/>
      <stop  offset="0.72" stopColor="#D8E4E8"/>
      <stop  offset="0.76" stopColor="#CCD8DF"/>
      <stop  offset="0.8" stopColor="#C8D5DD"/>
      <stop  offset="0.83" stopColor="#CCD6DE"/>
      <stop  offset="0.85" stopColor="#D8DBE2"/>
      <stop  offset="0.88" stopColor="#EDE3E9"/>
      <stop  offset="0.9" stopColor="#FFEBEF"/>
      </radialGradient>
      <ellipse fill="url(#SVGID_00000018938084004212545110000003812637463316940965_)" cx="128.1" cy="149.3" rx="85.3" ry="64"/>
      <path fill="#842123" d="M102.8,143.1c-0.5,10.8-7.7,14.8-16.1,14.8s-14.8-5.6-14.3-16.4s7.7-18,16.1-18S103.3,132.3,102.8,143.1z"/>
      <path fill="#842123" d="M183.6,141.5c0.5,10.8-5.9,16.4-14.3,16.4s-15.6-3.9-16.1-14.8c-0.5-10.8,5.9-19.6,14.3-19.6
      S183.1,130.6,183.6,141.5L183.6,141.5z"/>
      <radialGradient id="SVGID_00000100358442326342623590000001008359023910400391_" cx="-2957.2551" cy="173.4222" r="32.12" gradientTransform="matrix(-0.47 0 0 0.69 -1224.63 31.31)" gradientUnits="userSpaceOnUse">
      <stop  offset="0" stopColor="#FF6600"/>
      <stop  offset="0.5" stopColor="#FF4500"/>
      <stop  offset="0.7" stopColor="#FC4301"/>
      <stop  offset="0.82" stopColor="#F43F07"/>
      <stop  offset="0.92" stopColor="#E53812"/>
      <stop  offset="1" stopColor="#D4301F"/>
      </radialGradient>
      <path fill="url(#SVGID_00000100358442326342623590000001008359023910400391_)" d="M153.3,144.1c0.5,10.1,7.2,13.8,15,13.8
      s13.8-5.5,13.4-15.7c-0.5-10.1-7.2-16.8-15-16.8S152.8,133.9,153.3,144.1z"/>
      <radialGradient id="SVGID_00000101795553196247918750000016558665307898727865_" cx="745.2351" cy="173.4222" r="32.12" gradientTransform="matrix(0.47 0 0 0.69 -260.07 31.31)" gradientUnits="userSpaceOnUse">
      <stop  offset="0" stopColor="#FF6600"/>
      <stop  offset="0.5" stopColor="#FF4500"/>
      <stop  offset="0.7" stopColor="#FC4301"/>
      <stop  offset="0.82" stopColor="#F43F07"/>
      <stop  offset="0.92" stopColor="#E53812"/>
      <stop  offset="1" stopColor="#D4301F"/>
      </radialGradient>
      <path fill="url(#SVGID_00000101795553196247918750000016558665307898727865_)" d="M102.8,144.1c-0.5,10.1-7.2,13.8-15,13.8
      s-13.8-5.5-13.3-15.7c0.5-10.1,7.2-16.8,15-16.8S103.3,133.9,102.8,144.1z"/>
      <path fill="#BBCFDA" d="M128.1,165.1c-10.6,0-20.7,0.5-30.1,1.4c-1.6,0.2-2.6,1.8-2,3.2c5.2,12.3,17.6,21,32.1,21s26.8-8.6,32.1-21
      c0.6-1.5-0.4-3.1-2-3.2C148.8,165.6,138.7,165.1,128.1,165.1z"/>
      <path fill="#FFFFFF" d="M128.1,167.5c-10.6,0-20.7,0.5-30,1.5c-1.6,0.2-2.6,1.8-2,3.3c5.2,12.5,17.6,21.3,32,21.3s26.8-8.8,32-21.3
      c0.6-1.5-0.4-3.1-2-3.3C148.7,168,138.6,167.5,128.1,167.5L128.1,167.5z"/>
      <radialGradient id="SVGID_00000129915728043071345700000001618660102739666578_" cx="826.4651" cy="-508.4764" r="113.26" gradientTransform="matrix(0.47 0 0 -0.31 -260.07 37.28)" gradientUnits="userSpaceOnUse">
      <stop  offset="0" stopColor="#172E35"/>
      <stop  offset="0.29" stopColor="#0E1C21"/>
      <stop  offset="0.73" stopColor="#030708"/>
      <stop  offset="1" stopColor="#000000"/>
      </radialGradient>
      <path fill="url(#SVGID_00000129915728043071345700000001618660102739666578_)" d="M128.1,166.2c-10.4,0-20.3,0.5-29.5,1.4
      c-1.6,0.2-2.6,1.8-2,3.2c5.2,12.3,17.3,21,31.5,21s26.3-8.6,31.5-21c0.6-1.5-0.4-3.1-2-3.2C148.4,166.8,138.5,166.2,128.1,166.2z"
      />
      <radialGradient id="SVGID_00000132773094689987568360000004811110407827195799_" cx="926.3451" cy="277.9019" r="99.42" gradientTransform="matrix(0.47 0 0 -0.47 -260.07 164.72)" gradientUnits="userSpaceOnUse">
      <stop  offset="0" stopColor="#FEFFFF"/>
      <stop  offset="0.4" stopColor="#FEFFFF"/>
      <stop  offset="0.51" stopColor="#F9FCFC"/>
      <stop  offset="0.62" stopColor="#EDF3F5"/>
      <stop  offset="0.7" stopColor="#DEE9EC"/>
      <stop  offset="0.72" stopColor="#D8E4E8"/>
      <stop  offset="0.76" stopColor="#CCD8DF"/>
      <stop  offset="0.8" stopColor="#C8D5DD"/>
      <stop  offset="0.83" stopColor="#CCD6DE"/>
      <stop  offset="0.85" stopColor="#D8DBE2"/>
      <stop  offset="0.88" stopColor="#EDE3E9"/>
      <stop  offset="0.9" stopColor="#FFEBEF"/>
      </radialGradient>
      <circle fill="url(#SVGID_00000132773094689987568360000004811110407827195799_)" cx="174.8" cy="55.5" r="21.2"/>
      <radialGradient id="SVGID_00000093173154653334829310000007940785063173693333_" cx="884.9151" cy="177.5619" r="81.49" gradientTransform="matrix(0.47 0 0 -0.47 -260.07 168.5)" gradientUnits="userSpaceOnUse">
      <stop  offset="0.48" stopColor="#7A9299"/>
      <stop  offset="0.67" stopColor="#172E35"/>
      <stop  offset="0.75" stopColor="#000000"/>
      <stop  offset="0.82" stopColor="#172E35"/>
      </radialGradient>
      <path fill="url(#SVGID_00000093173154653334829310000007940785063173693333_)" d="M127.8,88c-2.5,0-4.6-1.1-4.6-2.7
      c0-19,15.4-34.4,34.4-34.4c2.5,0,4.6,2.1,4.6,4.6s-2.1,4.6-4.6,4.6c-13.9,0-25.2,11.3-25.2,25.2C132.4,87,130.3,88,127.8,88z"/>
      <path fill="#FF6101" d="M97.3,149.1c0,3.9-4.2,5.7-9.3,5.7s-9.3-1.8-9.3-5.7s4.2-7.1,9.3-7.1S97.3,145.1,97.3,149.1z"/>
      <path fill="#FF6101" d="M177.5,149.1c0,3.9-4.2,5.7-9.3,5.7s-9.3-1.8-9.3-5.7s4.2-7.1,9.3-7.1S177.5,145.1,177.5,149.1z"/>
      <ellipse fill="#FFC49C" cx="94.4" cy="134.8" rx="3.3" ry="3.6"/>
      <ellipse fill="#FFC49C" cx="173.3" cy="134.8" rx="3.3" ry="3.6"/>
      </g>
      </svg>
    );
  }

  if (resolvedConstruction === 'contained' && resolvedPresentation === 'brandFlat') {
    return (
      <svg width="1em" height="1em" id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="-40.421052631579 -40.421052631579 336.842105263158 336.842105263158" aria-hidden="true" focusable="false" {...props}>
      <defs>
      </defs>
      <path strokeWidth="0px" fill="#ff4500" d="m128,0h0C57.31,0,0,57.31,0,128h0c0,35.35,14.33,67.35,37.49,90.51l-24.38,24.38c-4.84,4.84-1.41,13.11,5.43,13.11h109.46s0,0,0,0c70.69,0,128-57.31,128-128h0C256,57.31,198.69,0,128,0Z"/>
      <path fill="#fff" strokeWidth="0px" d="m154.04,60.36c2.22,9.41,10.67,16.42,20.76,16.42,11.78,0,21.33-9.55,21.33-21.33s-9.55-21.33-21.33-21.33c-10.3,0-18.89,7.3-20.89,17.01-17.25,1.85-30.72,16.48-30.72,34.21,0,.04,0,.07,0,.11-18.76.79-35.89,6.13-49.49,14.56-5.05-3.91-11.39-6.24-18.27-6.24-16.51,0-29.89,13.38-29.89,29.89,0,11.98,7.04,22.3,17.21,27.07.99,34.7,38.8,62.61,85.31,62.61s84.37-27.94,85.31-62.67c10.09-4.8,17.07-15.09,17.07-27,0-16.51-13.38-29.89-29.89-29.89-6.85,0-13.16,2.31-18.2,6.19-13.72-8.49-31.04-13.83-49.99-14.54,0-.03,0-.05,0-.08,0-12.7,9.44-23.24,21.68-24.97Zm-81.54,82.27c.5-10.84,7.7-19.16,16.07-19.16s14.77,8.79,14.27,19.63c-.5,10.84-6.75,14.78-15.13,14.78s-15.71-4.41-15.21-15.25Zm95.06-19.16c8.38,0,15.58,8.32,16.07,19.16.5,10.84-6.84,15.25-15.21,15.25s-14.63-3.93-15.13-14.78c-.5-10.84,5.89-19.63,14.27-19.63Zm-9.96,44.24c1.57.16,2.57,1.79,1.96,3.25-5.15,12.31-17.31,20.96-31.5,20.96s-26.34-8.65-31.5-20.96c-.61-1.46.39-3.09,1.96-3.25,9.2-.93,19.15-1.44,29.54-1.44s20.33.51,29.54,1.44Z"/>
      </svg>
    );
  }

  if (resolvedConstruction === 'mark' && resolvedPresentation === 'brand') {
    return (
      <svg width="1em" height="1em" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
      viewBox="11.636363636364 11.636363636364 232.727272727273 232.727272727273" enableBackground="new 0 0 256 256" xmlSpace="preserve" aria-hidden="true" focusable="false" {...props}>
      <g>
      <radialGradient id="SVGID_1_" cx="1398.1552" cy="1.811" r="127.45" fx="1398.1552" fy="-7.319" gradientTransform="matrix(0.47 0 0 -0.41 -457.82 108.3)" gradientUnits="userSpaceOnUse">
      <stop  offset="0" stopColor="#FEFFFF"/>
      <stop  offset="0.4" stopColor="#FEFFFF"/>
      <stop  offset="0.51" stopColor="#F9FCFC"/>
      <stop  offset="0.62" stopColor="#EDF3F5"/>
      <stop  offset="0.7" stopColor="#DEE9EC"/>
      <stop  offset="0.72" stopColor="#D8E4E8"/>
      <stop  offset="0.76" stopColor="#CCD8DF"/>
      <stop  offset="0.8" stopColor="#C8D5DD"/>
      <stop  offset="0.83" stopColor="#CCD6DE"/>
      <stop  offset="0.85" stopColor="#D8DBE2"/>
      <stop  offset="0.88" stopColor="#EDE3E9"/>
      <stop  offset="0.9" stopColor="#FFEBEF"/>
      </radialGradient>
      <circle fill="url(#SVGID_1_)" cx="200.6" cy="123.7" r="29.9"/>
      <radialGradient id="SVGID_00000034073163968956867740000008452879218124006305_" cx="1089.3892" cy="1.811" r="127.45" fx="1089.3892" fy="-7.319" gradientTransform="matrix(0.47 0 0 -0.41 -457.82 108.3)" gradientUnits="userSpaceOnUse">
      <stop  offset="0" stopColor="#FEFFFF"/>
      <stop  offset="0.4" stopColor="#FEFFFF"/>
      <stop  offset="0.51" stopColor="#F9FCFC"/>
      <stop  offset="0.62" stopColor="#EDF3F5"/>
      <stop  offset="0.7" stopColor="#DEE9EC"/>
      <stop  offset="0.72" stopColor="#D8E4E8"/>
      <stop  offset="0.76" stopColor="#CCD8DF"/>
      <stop  offset="0.8" stopColor="#C8D5DD"/>
      <stop  offset="0.83" stopColor="#CCD6DE"/>
      <stop  offset="0.85" stopColor="#D8DBE2"/>
      <stop  offset="0.88" stopColor="#EDE3E9"/>
      <stop  offset="0.9" stopColor="#FFEBEF"/>
      </radialGradient>
      <circle fill="url(#SVGID_00000034073163968956867740000008452879218124006305_)" cx="55.4" cy="123.7" r="29.9"/>
      <radialGradient id="SVGID_00000120517025620417944270000013944930190746270629_" cx="1247.8051" cy="-224.6845" r="384.44" gradientTransform="matrix(0.47 0 0 -0.33 -457.82 25.03)" gradientUnits="userSpaceOnUse">
      <stop  offset="0" stopColor="#FEFFFF"/>
      <stop  offset="0.4" stopColor="#FEFFFF"/>
      <stop  offset="0.51" stopColor="#F9FCFC"/>
      <stop  offset="0.62" stopColor="#EDF3F5"/>
      <stop  offset="0.7" stopColor="#DEE9EC"/>
      <stop  offset="0.72" stopColor="#D8E4E8"/>
      <stop  offset="0.76" stopColor="#CCD8DF"/>
      <stop  offset="0.8" stopColor="#C8D5DD"/>
      <stop  offset="0.83" stopColor="#CCD6DE"/>
      <stop  offset="0.85" stopColor="#D8DBE2"/>
      <stop  offset="0.88" stopColor="#EDE3E9"/>
      <stop  offset="0.9" stopColor="#FFEBEF"/>
      </radialGradient>
      <ellipse fill="url(#SVGID_00000120517025620417944270000013944930190746270629_)" cx="128.1" cy="149.3" rx="85.3" ry="64"/>
      <path fill="#842123" d="M102.8,143.1c-0.5,10.8-7.7,14.8-16.1,14.8s-14.8-5.6-14.3-16.4s7.7-18,16.1-18S103.3,132.3,102.8,143.1z"/>
      <path fill="#842123" d="M183.6,141.5c0.5,10.8-5.9,16.4-14.3,16.4s-15.6-3.9-16.1-14.8c-0.5-10.8,5.9-19.6,14.3-19.6
      S183.1,130.6,183.6,141.5L183.6,141.5z"/>
      <radialGradient id="SVGID_00000061459207078496181010000007638701097681060527_" cx="-2540.135" cy="173.4222" r="32.12" gradientTransform="matrix(-0.47 0 0 0.69 -1026.88 31.31)" gradientUnits="userSpaceOnUse">
      <stop  offset="0" stopColor="#FF6600"/>
      <stop  offset="0.5" stopColor="#FF4500"/>
      <stop  offset="0.7" stopColor="#FC4301"/>
      <stop  offset="0.82" stopColor="#F43F07"/>
      <stop  offset="0.92" stopColor="#E53812"/>
      <stop  offset="1" stopColor="#D4301F"/>
      </radialGradient>
      <path fill="url(#SVGID_00000061459207078496181010000007638701097681060527_)" d="M153.3,144.1c0.5,10.1,7.2,13.8,15,13.8
      s13.8-5.5,13.4-15.7c-0.5-10.1-7.2-16.8-15-16.8S152.8,133.9,153.3,144.1z"/>
      <radialGradient id="SVGID_00000171689499686163893410000005350462902406775484_" cx="1162.3551" cy="173.4222" r="32.12" gradientTransform="matrix(0.47 0 0 0.69 -457.82 31.31)" gradientUnits="userSpaceOnUse">
      <stop  offset="0" stopColor="#FF6600"/>
      <stop  offset="0.5" stopColor="#FF4500"/>
      <stop  offset="0.7" stopColor="#FC4301"/>
      <stop  offset="0.82" stopColor="#F43F07"/>
      <stop  offset="0.92" stopColor="#E53812"/>
      <stop  offset="1" stopColor="#D4301F"/>
      </radialGradient>
      <path fill="url(#SVGID_00000171689499686163893410000005350462902406775484_)" d="M102.8,144.1c-0.5,10.1-7.2,13.8-15,13.8
      s-13.8-5.5-13.3-15.7c0.5-10.1,7.2-16.8,15-16.8S103.3,133.9,102.8,144.1z"/>
      <path fill="#BBCFDA" d="M128.1,165.1c-10.6,0-20.7,0.5-30.1,1.4c-1.6,0.2-2.6,1.8-2,3.2c5.2,12.3,17.6,21,32.1,21s26.8-8.6,32.1-21
      c0.6-1.5-0.4-3.1-2-3.2C148.8,165.6,138.7,165.1,128.1,165.1z"/>
      <path fill="#FFFFFF" d="M128.1,167.5c-10.6,0-20.7,0.5-30,1.5c-1.6,0.2-2.6,1.8-2,3.3c5.2,12.5,17.6,21.3,32,21.3s26.8-8.8,32-21.3
      c0.6-1.5-0.4-3.1-2-3.3C148.7,168,138.6,167.5,128.1,167.5L128.1,167.5z"/>
      <radialGradient id="SVGID_00000111162758833404389820000010694057165658696362_" cx="1243.5851" cy="-508.4764" r="113.26" gradientTransform="matrix(0.47 0 0 -0.31 -457.82 37.28)" gradientUnits="userSpaceOnUse">
      <stop  offset="0" stopColor="#172E35"/>
      <stop  offset="0.29" stopColor="#0E1C21"/>
      <stop  offset="0.73" stopColor="#030708"/>
      <stop  offset="1" stopColor="#000000"/>
      </radialGradient>
      <path fill="url(#SVGID_00000111162758833404389820000010694057165658696362_)" d="M128.1,166.2c-10.4,0-20.3,0.5-29.5,1.4
      c-1.6,0.2-2.6,1.8-2,3.2c5.2,12.3,17.3,21,31.5,21s26.3-8.6,31.5-21c0.6-1.5-0.4-3.1-2-3.2C148.4,166.8,138.5,166.2,128.1,166.2z"
      />
      <radialGradient id="SVGID_00000115506751441978176340000013677520462892572331_" cx="1343.4751" cy="277.9019" r="99.42" gradientTransform="matrix(0.47 0 0 -0.47 -457.82 164.72)" gradientUnits="userSpaceOnUse">
      <stop  offset="0" stopColor="#FEFFFF"/>
      <stop  offset="0.4" stopColor="#FEFFFF"/>
      <stop  offset="0.51" stopColor="#F9FCFC"/>
      <stop  offset="0.62" stopColor="#EDF3F5"/>
      <stop  offset="0.7" stopColor="#DEE9EC"/>
      <stop  offset="0.72" stopColor="#D8E4E8"/>
      <stop  offset="0.76" stopColor="#CCD8DF"/>
      <stop  offset="0.8" stopColor="#C8D5DD"/>
      <stop  offset="0.83" stopColor="#CCD6DE"/>
      <stop  offset="0.85" stopColor="#D8DBE2"/>
      <stop  offset="0.88" stopColor="#EDE3E9"/>
      <stop  offset="0.9" stopColor="#FFEBEF"/>
      </radialGradient>
      <circle fill="url(#SVGID_00000115506751441978176340000013677520462892572331_)" cx="174.8" cy="55.5" r="21.2"/>
      <radialGradient id="SVGID_00000067943941069120041560000016533010558350408839_" cx="1302.0352" cy="177.5619" r="81.49" gradientTransform="matrix(0.47 0 0 -0.47 -457.82 168.5)" gradientUnits="userSpaceOnUse">
      <stop  offset="0.48" stopColor="#7A9299"/>
      <stop  offset="0.67" stopColor="#172E35"/>
      <stop  offset="0.75" stopColor="#000000"/>
      <stop  offset="0.82" stopColor="#172E35"/>
      </radialGradient>
      <path fill="url(#SVGID_00000067943941069120041560000016533010558350408839_)" d="M127.8,88c-2.5,0-4.6-1.1-4.6-2.7
      c0-19,15.4-34.4,34.4-34.4c2.5,0,4.6,2.1,4.6,4.6s-2.1,4.6-4.6,4.6c-13.9,0-25.2,11.3-25.2,25.2C132.4,87,130.3,88,127.8,88z"/>
      <path fill="#FF6101" d="M97.3,149.1c0,3.9-4.2,5.7-9.3,5.7s-9.3-1.8-9.3-5.7s4.2-7.1,9.3-7.1S97.3,145.1,97.3,149.1z"/>
      <path fill="#FF6101" d="M177.5,149.1c0,3.9-4.2,5.7-9.3,5.7s-9.3-1.8-9.3-5.7s4.2-7.1,9.3-7.1S177.5,145.1,177.5,149.1z"/>
      <ellipse fill="#FFC49C" cx="94.4" cy="134.8" rx="3.3" ry="3.6"/>
      <ellipse fill="#FFC49C" cx="173.3" cy="134.8" rx="3.3" ry="3.6"/>
      </g>
      </svg>
    );
  }

  if (resolvedConstruction === 'mark' && resolvedPresentation === 'monochrome') {
    return (
      <svg width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" viewBox="11.636363636364 11.636363636364 232.727272727273 232.727272727273" aria-hidden="true" focusable="false" {...props}>
      <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="m154.04,60.36c2.22,9.41,10.67,16.42,20.76,16.42,11.78,0,21.33-9.55,21.33-21.33s-9.55-21.33-21.33-21.33c-10.3,0-18.89,7.3-20.89,17.01-17.25,1.85-30.72,16.48-30.72,34.21,0,.04,0,.07,0,.11-18.76.79-35.89,6.13-49.49,14.56-5.05-3.91-11.39-6.24-18.27-6.24-16.51,0-29.89,13.38-29.89,29.89,0,11.98,7.04,22.3,17.21,27.07.99,34.7,38.8,62.61,85.31,62.61s84.37-27.94,85.31-62.67c10.09-4.8,17.07-15.09,17.07-27,0-16.51-13.38-29.89-29.89-29.89-6.85,0-13.16,2.31-18.2,6.19-13.72-8.49-31.04-13.83-49.99-14.54,0-.03,0-.05,0-.08,0-12.7,9.44-23.24,21.68-24.97Zm-81.54,82.27c.5-10.84,7.7-19.16,16.07-19.16s14.77,8.79,14.27,19.63c-.5,10.84-6.75,14.78-15.13,14.78s-15.71-4.41-15.21-15.25Zm95.06-19.16c8.38,0,15.58,8.32,16.07,19.16.5,10.84-6.84,15.25-15.21,15.25s-14.63-3.93-15.13-14.78c-.5-10.84,5.89-19.63,14.27-19.63Zm-9.96,44.24c1.57.16,2.57,1.79,1.96,3.25-5.15,12.31-17.31,20.96-31.5,20.96s-26.34-8.65-31.5-20.96c-.61-1.46.39-3.09,1.96-3.25,9.2-.93,19.15-1.44,29.54-1.44s20.33.51,29.54,1.44Z"/>
      </svg>
    );
  }

  throw new Error(
    `Unsupported RedditIcon construction/presentation: ${resolvedConstruction}.${String(resolvedPresentation)}`
  );
}
