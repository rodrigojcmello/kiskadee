/** @vitest-environment jsdom */
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HeadlessAccordion as Accordion, type AccordionProps } from './Accordion.tsx';

afterEach(cleanup);
function Fixture(props: AccordionProps) {
  return (
    <Accordion {...props}>
      <Accordion.Item value="a">
        <Accordion.Header>Alpha</Accordion.Header>
        <Accordion.Panel>
          <input aria-label="Draft" defaultValue="kept" />
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="b">
        <Accordion.Header>Beta</Accordion.Header>
        <Accordion.Panel>Second panel</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="c" disabled>
        <Accordion.Header>Disabled</Accordion.Header>
        <Accordion.Panel>Disabled content</Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
describe('Accordion semantics', () => {
  it('starts closed, opens one item, and permits closing all', () => {
    const view = render(<Fixture />);
    const a = view.getByRole('button', { name: 'Alpha' });
    const b = view.getByRole('button', { name: 'Beta' });
    expect(a.getAttribute('aria-expanded')).toBe('false');
    expect(a.hasAttribute('aria-pressed')).toBe(false);
    expect(a.closest('h3')).not.toBeNull();
    fireEvent.click(a);
    expect(a.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(b);
    expect(a.getAttribute('aria-expanded')).toBe('false');
    expect(b.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(b);
    expect(b.getAttribute('aria-expanded')).toBe('false');
  });
  it('allows multiple open items and retains child state', () => {
    const view = render(<Fixture multiple />);
    fireEvent.click(view.getByRole('button', { name: 'Alpha' }));
    const input = view.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'edited' } });
    fireEvent.click(view.getByRole('button', { name: 'Beta' }));
    expect(view.getByRole('button', { name: 'Alpha' }).getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(view.getByRole('button', { name: 'Alpha' }));
    expect(view.queryByRole('textbox')).toBeNull();
    expect(input.isConnected).toBe(true);
    fireEvent.click(view.getByRole('button', { name: 'Alpha' }));
    expect((view.getByRole('textbox') as HTMLInputElement).value).toBe('edited');
  });
  it('reports controlled changes without changing the controlled state', () => {
    const changed = vi.fn();
    const view = render(<Fixture expandedItems={['a']} onExpandedItemsChange={changed} />);
    fireEvent.click(view.getByRole('button', { name: 'Beta' }));
    expect(changed).toHaveBeenCalledWith(['b']);
    expect(view.getByRole('button', { name: 'Alpha' }).getAttribute('aria-expanded')).toBe('true');
    view.rerender(<Fixture expandedItems={['b']} onExpandedItemsChange={changed} />);
    expect(view.getByRole('button', { name: 'Beta' }).getAttribute('aria-expanded')).toBe('true');
  });
  it('honors item/group disabled and interaction locking without losing expansion', () => {
    const changed = vi.fn();
    const view = render(
      <Fixture defaultExpandedItems={['a']} interactionLocked onExpandedItemsChange={changed} />
    );
    const a = view.getByRole('button', { name: 'Alpha' }) as HTMLButtonElement;
    fireEvent.click(a);
    expect(a.disabled).toBe(false);
    fireEvent.click(view.getByRole('button', { name: 'Disabled' }));
    expect(changed).not.toHaveBeenCalled();
    view.rerender(
      <Fixture disabled defaultExpandedItems={['a']} onExpandedItemsChange={changed} />
    );
    expect(a.disabled).toBe(true);
    expect(a.getAttribute('aria-expanded')).toBe('true');
  });
  it('moves focus back before a controlled panel becomes inaccessible', () => {
    const view = render(<Fixture expandedItems={['a']} />);
    view.getByRole('textbox').focus();
    view.rerender(<Fixture expandedItems={[]} />);
    const trigger = view.getByRole('button', { name: 'Alpha' });
    expect(document.activeElement).toBe(trigger);
    const panel = document.getElementById(trigger.getAttribute('aria-controls')!);
    expect(panel?.hidden).toBe(true);
    expect(panel?.hasAttribute('inert')).toBe(true);
    expect(panel?.getAttribute('aria-labelledby')).toBe(trigger.id);
    expect(panel?.getAttribute('role')).toBeNull();
  });
  it('normalizes duplicates and single-mode controlled input', () => {
    const view = render(<Fixture expandedItems={['a', 'a', 'b']} />);
    expect(view.getByRole('button', { name: 'Beta' }).getAttribute('aria-expanded')).toBe('false');
  });
  it('keeps nested groups and IDs independent', () => {
    const view = render(
      <Accordion defaultExpandedItems={['same']}>
        <Accordion.Item value="same">
          <Accordion.Header>Outer</Accordion.Header>
          <Accordion.Panel>
            <Fixture />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    );
    fireEvent.click(view.getByRole('button', { name: 'Alpha' }));
    expect(view.getByRole('button', { name: 'Outer' }).getAttribute('aria-expanded')).toBe('true');
    const ids = [...view.container.querySelectorAll('[id]')].map((node) => node.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('allows consumer event cancellation without toggling', () => {
    const view = render(
      <Accordion>
        <Accordion.Item value="a">
          <Accordion.Header onClick={(event) => event.preventDefault()}>Cancelled</Accordion.Header>
          <Accordion.Panel>Body</Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    );
    const trigger = view.getByRole('button');
    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('type')).toBe('button');
  });
});
