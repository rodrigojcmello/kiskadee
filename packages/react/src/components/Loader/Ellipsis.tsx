import type { FC } from 'react';
import { css, keyframes } from '@stitches/core';

const ellipsisKF1 = keyframes({
  from: {
    transform: 'scale(0)',
  },
  to: {
    transform: 'scale(1)',
  },
});

const ellipsisKF2 = keyframes({
  from: {
    transform: 'translate(0, 0)',
  },
  to: {
    transform: 'translate(24px, 0)',
  },
});

const ellipsisKF3 = keyframes({
  from: {
    transform: 'scale(1)',
  },
  to: {
    transform: 'scale(0)',
  },
});

const loader = css({
  display: 'inline-block',
  position: 'relative',
  width: '80px',
  height: '80px',
  '& div': {
    position: 'absolute',
    top: '33px',
    width: '13px',
    height: '13px',
    borderRadius: '50%',
    background: '#fff',
    animationTimingFunction: 'cubic-bezier(0, 1, 1, 0)',
  },
  '& div:nth-child(1)': {
    left: '8px',
    animation: `${ellipsisKF1} 0.6s infinite`,
  },
  '& div:nth-child(2)': {
    left: '8px',
    animation: `${ellipsisKF2} 0.6s infinite`,
  },
  '& div:nth-child(3)': {
    left: '32px',
    animation: `${ellipsisKF2} 0.6s infinite`,
  },
  '& div:nth-child(4)': {
    left: '56px',
    animation: `${ellipsisKF3} 0.6s infinite`,
  },
})();

export const EllipsisLoader: FC = () => {
  return (
    <div className={loader.className}>
      <div />
      <div />
      <div />
      <div />
    </div>
  );
};
