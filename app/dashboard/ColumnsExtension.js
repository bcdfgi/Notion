import { Node, mergeAttributes } from '@tiptap/core';

export const Column = Node.create({
    name: 'column',
    content: 'block+',
    defining: true,
    isolating: true,

    parseHTML() {
        return [{ tag: 'div[data-type="column"]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes(HTMLAttributes, {
                'data-type': 'column',
                class: 'notion-column flex-1 min-w-0',
            }),
            0,
        ];
    },
});

export const ColumnGroup = Node.create({
    name: 'columnGroup',
    group: 'block',
    content: 'column+',
    defining: true,
    isolating: true,

    addAttributes() {
        return {
            columns: {
                default: 2,
                parseHTML: (el) => parseInt(el.getAttribute('data-columns') || '2', 10),
                renderHTML: (attrs) => ({ 'data-columns': attrs.columns }),
            },
        };
    },

    parseHTML() {
        return [{ tag: 'div[data-type="column-group"]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes(HTMLAttributes, {
                'data-type': 'column-group',
                class: 'notion-column-group my-3',
                'data-columns': HTMLAttributes['data-columns'] || 2,
            }),
            0,
        ];
    },

    addCommands() {
        return {
            setColumns:
                (count = 2) =>
                    ({ commands }) => {
                        const columns = Array.from({ length: count }, () => ({
                            type: 'column',
                            content: [{ type: 'paragraph' }],
                        }));
                        return commands.insertContent({
                            type: 'columnGroup',
                            attrs: { columns: count },
                            content: columns,
                        });
                    },
        };
    },
});