import { css } from '@stitches/core';
import { useEffect, useState } from 'react';

const durationMap = new Map<number, string>();
const timingFunctionMap = new Map<string, string>();

export const useTransition = (
  timingFunction: string,
  duration: number
): (string | undefined)[] => {
  const [timingFunctionClass, setTimingFunctionClass] = useState<
    string | undefined
  >(timingFunctionMap.get(timingFunction));

  const [durationClass, setDurationClass] = useState<string | undefined>(
    durationMap.get(duration)
  );

  useEffect(() => {
    if (timingFunctionMap.has(timingFunction)) {
      setTimingFunctionClass(timingFunctionMap.get(timingFunction));
    } else {
      const style = css({
        transitionTimingFunction: timingFunction,
      })().className;
      timingFunctionMap.set(timingFunction, style);
      setTimingFunctionClass(style);
    }
  }, [timingFunction]);

  useEffect(() => {
    if (durationMap.has(duration)) {
      setDurationClass(durationMap.get(duration));
    } else {
      const style = css({
        transitionDuration: `${duration}s`,
      })().className;
      durationMap.set(duration, style);
      setDurationClass(style);
    }
  }, [duration]);

  console.log({ durationClass, timingFunctionClass });

  return [durationClass, timingFunctionClass];
};
