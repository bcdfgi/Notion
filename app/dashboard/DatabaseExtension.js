import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import DatabaseBlock from './DatabaseBlock';

export const DatabaseExtension = Node.create({
    name: 'databaseBlock',
    group: 'block',
    atom: true,

    addAttributes() {
        return {
            title: { default: 'Untitled' },
            activeViewId: { default: 'view-1' },
            views: {
                default: [{ id: 'view-1', name: 'Table', type: 'table' }],
                parseHTML: element => {
                    const raw = element.getAttribute('data-views');
                    if (!raw) return [{ id: 'view-1', name: 'Table', type: 'table' }];
                    try {
                        return JSON.parse(decodeURIComponent(raw));
                    } catch {
                        return [{ id: 'view-1', name: 'Table', type: 'table' }];
                    }
                },
                renderHTML: attributes => ({
                    'data-views': encodeURIComponent(JSON.stringify(attributes.views || [])),
                }),
            },
            rows: {
                default: [],
                parseHTML: element => {
                    const raw = element.getAttribute('data-rows');
                    if (!raw) return [];
                    try {
                        return JSON.parse(decodeURIComponent(raw));
                    } catch {
                        return [];
                    }
                },
                renderHTML: attributes => ({
                    'data-rows': encodeURIComponent(JSON.stringify(attributes.rows || [])),
                }),
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-database-block]',
                getAttrs: dom => ({
                    title: dom.getAttribute('data-title') || 'Untitled',
                    activeViewId: dom.getAttribute('data-active-view-id') || 'view-1',
                }),
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes(HTMLAttributes, {
                'data-database-block': '',
                'data-title': HTMLAttributes.title,
                'data-active-view-id': HTMLAttributes.activeViewId,
            }),
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(DatabaseBlock);
    },

    addCommands() {
        return {
            insertDatabase: (attrs = {}) => ({ commands }) => {
                const initialType = attrs.initialType || 'table';
                const initialName = initialType.charAt(0).toUpperCase() + initialType.slice(1);
                return commands.insertContent({
                    type: this.name,
                    attrs: {
                        title: attrs.title || 'Untitled',
                        activeViewId: 'view-1',
                        views: [{ id: 'view-1', name: initialName, type: initialType }],
                        rows: [],
                        ...attrs,
                    },
                });
            },
        };
    },
});