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
                default: [
                    { id: 'view-1', name: 'Table', type: 'table' }
                ],
            },
            rows: {
                default: [], // Starts completely empty like Notion
            },
        };
    },

    parseHTML() {
        return [{ tag: 'div[data-database-block]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-database-block': '' })];
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
                        activeViewId: 'view-1',
                        views: [{ id: 'view-1', name: initialName, type: initialType }],
                        rows: [],
                        ...attrs
                    },
                });
            },
        };
    },
});