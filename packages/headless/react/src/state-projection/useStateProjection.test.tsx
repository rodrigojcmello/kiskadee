/** @vitest-environment jsdom */
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { mergeStateProjectionSlotProps, useStateProjection } from './useStateProjection.ts';

type TestSlot = 'e1' | 'e2' | 'e3';
type TestState = 'focused' | 'filled' | 'status';

describe('useStateProjection', () => {
  it('projects active classes on the default rule target with activator and interactive classes', () => {
    const { result } = renderHook(() =>
      useStateProjection<TestSlot, TestState>({
        classNames: {
          e1: 'root',
          e2: 'label'
        },
        states: {
          focused: true,
          filled: false
        },
        target: 'e1',
        activatorClassName: '-a',
        interactiveClassName: '-i',
        projections: {
          focused: {
            className: '-f'
          },
          filled: {
            className: '-v'
          }
        }
      })
    );

    expect(result.current.slotProps.e1?.className).toBe('root -i -f -a');
    expect(result.current.slotProps.e2?.className).toBe('label');
  });

  it('supports per-rule targets, attributes, and resolver values', () => {
    const { result } = renderHook(() =>
      useStateProjection<TestSlot, TestState>({
        states: {
          focused: true,
          status: 'warning'
        },
        target: 'e1',
        projections: {
          focused: {
            target: 'e2',
            attribute: 'data-focused'
          },
          status: {
            target: 'e3',
            className: (value, context) => `${context.state}-${value}`,
            attribute: {
              name: 'data-status',
              value: (value) => String(value)
            }
          }
        }
      })
    );

    expect(result.current.slotProps.e2?.['data-focused']).toBe('');
    expect(result.current.slotProps.e3?.className).toBe('status-warning');
    expect(result.current.slotProps.e3?.['data-status']).toBe('warning');
  });

  it('uses custom active-state predicates', () => {
    const { result } = renderHook(() =>
      useStateProjection<TestSlot, TestState>({
        states: {
          status: 'rest'
        },
        target: 'e1',
        projections: {
          status: {
            className: '-status',
            when: (value) => value === 'active'
          }
        }
      })
    );

    expect(result.current.slotProps.e1).toBeUndefined();
  });

  it('merges slot props by appending classes and letting later attributes win', () => {
    const merged = mergeStateProjectionSlotProps<TestSlot>(
      {
        e1: {
          className: 'root',
          'data-state': 'first'
        }
      },
      {
        e1: {
          className: '-f',
          'data-state': 'second'
        },
        e2: {
          className: 'label'
        }
      }
    );

    expect(merged.e1).toEqual({
      className: 'root -f',
      'data-state': 'second'
    });
    expect(merged.e2).toEqual({
      className: 'label'
    });
  });
});
