import { describe, expect, it } from 'vitest';
import { defineMenuTree, validateMenuTree } from './MenuTree.ts';

describe('MenuTree', () => {
  it('accepts recursive groups, radio choices, checkboxes, and submenus with stable IDs', () => {
    const tree = defineMenuTree({
      id: 'actions',
      title: 'Actions',
      items: [
        {
          type: 'group',
          id: 'edit',
          label: 'Edit',
          items: [{ type: 'item', id: 'copy', label: 'Copy' }]
        },
        {
          type: 'group',
          id: 'sharing',
          items: [
            {
              type: 'submenu',
              id: 'share',
              label: 'Share',
              items: [
                {
                  type: 'checkbox-group',
                  id: 'notifications',
                  items: [
                    {
                      type: 'checkbox',
                      id: 'notify',
                      label: 'Notify people',
                      defaultControlState: true
                    }
                  ]
                },
                {
                  type: 'radio-group',
                  id: 'access',
                  items: [{ type: 'radio', id: 'private', label: 'Private', value: 'private' }]
                }
              ]
            }
          ]
        }
      ]
    });

    expect(tree.title).toBe('Actions');
  });

  it('reports duplicate IDs across recursive pages', () => {
    const issues = validateMenuTree({
      id: 'actions',
      title: 'Actions',
      items: [
        {
          type: 'group',
          id: 'actions-group',
          items: [
            { type: 'item', id: 'duplicate', label: 'Copy' },
            {
              type: 'submenu',
              id: 'share',
              label: 'Share',
              items: [
                {
                  type: 'group',
                  id: 'share-actions',
                  items: [{ type: 'item', id: 'duplicate', label: 'Copy link' }]
                }
              ]
            }
          ]
        }
      ]
    });

    expect(issues).toContain(
      'menuTree.items[0].items[1].items[0].items[0].id: duplicate id "duplicate"'
    );
  });

  it('rejects commands and selections assigned to the wrong group kind', () => {
    const issues = validateMenuTree({
      id: 'invalid',
      title: 'Invalid',
      items: [
        {
          type: 'checkbox-group',
          id: 'preferences',
          items: [{ type: 'item', id: 'copy', label: 'Copy' }]
        }
      ]
    } as never);

    expect(issues).toContain('menuTree.items[0].items[0].type: expected checkbox');
  });
});
