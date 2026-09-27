// ToggleExtension.js
import { Node, mergeAttributes } from '@tiptap/core';

export const DetailsSummary = Node.create({
    name: 'detailsSummary',
    content: 'inline*',
    defining: true,
    addAttributes() {
        return {
            level: {
                default: 1,
                parseHTML: (el) => parseInt(el.getAttribute('data-level') || '1', 10),
                renderHTML: (attrs) => ({ 'data-level': attrs.level }),
            },
        };
    },
    parseHTML() {
        return [{ tag: 'summary' }];
    },
    renderHTML({ HTMLAttributes }) {
        const level = HTMLAttributes['data-level'] || 1;
        const sizeClasses = {
            1: 'text-2xl font-bold text-slate-800',
            2: 'text-xl font-semibold text-slate-800',
            3: 'text-lg font-medium text-slate-800',
        }[level];

        return [
            'summary',
            mergeAttributes(HTMLAttributes, {
                class: `cursor-pointer list-none flex items-center gap-2 select-none hover:bg-gray-50 rounded px-1 py-0.5 ${sizeClasses}`,
            }),
            0,
        ];
    },
});

export const DetailsContent = Node.create({
    name: 'detailsContent',
    content: 'block+',
    defining: true,
    parseHTML() {
        return [{ tag: 'div[data-type="details-content"]' }];
    },
    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'details-content', class: 'pl-6 pt-1' }), 0];
    },
});

export const Details = Node.create({
    name: 'details',
    group: 'block',
    content: 'detailsSummary detailsContent',
    defining: true,
    isolating: true,
    parseHTML() {
        return [{ tag: 'details' }];
    },
    renderHTML({ HTMLAttributes }) {
        return ['details', mergeAttributes(HTMLAttributes, { class: 'my-2 group/toggle' }), 0];
    },
    addCommands() {
        return {
            insertToggleHeading: (level = 1) => ({ commands }) => {
                return commands.insertContent({
                    type: 'details',
                    content: [
                        {
                            type: 'detailsSummary',
                            attrs: { level },
                            content: [{ type: 'text', text: `Toggle Heading ${level}` }],
                        },
                        {
                            type: 'detailsContent',
                            content: [{ type: 'paragraph' }],
                        },
                    ],
                });
            },
        };
    },
});