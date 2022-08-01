import type { FC } from 'react';
import { css, keyframes } from '@stitches/core';

const time = 600;

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
    transform: 'translate(15px, 0)',
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
  display: 'flex',
  alignItems: 'center',
  position: 'absolute',
  width: '38px',
  height: '8px',
  '& div': {
    position: 'absolute',
    top: '0px',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    animationTimingFunction: 'cubic-bezier(0, 1, 1, 0)',
  },
  '& div:nth-child(1)': {
    left: '0px',
    animation: `${ellipsisKF1} ${time}ms infinite`,
  },
  '& div:nth-child(2)': {
    left: '0px',
    animation: `${ellipsisKF2} ${time}ms infinite`,
  },
  '& div:nth-child(3)': {
    left: '15px',
    animation: `${ellipsisKF2} ${time}ms infinite`,
  },
  '& div:nth-child(4)': {
    left: '30px',
    animation: `${ellipsisKF3} ${time}ms infinite`,
  },
})();

export const EllipsisLoader: FC = () => {
  return (
    <div className={loader.className}>
      <div className={'spinner'} />
      <div className={'spinner'} />
      <div className={'spinner'} />
      <div className={'spinner'} />
    </div>
  );
};
