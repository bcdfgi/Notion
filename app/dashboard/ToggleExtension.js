// ToggleExtension.js
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import React from 'react';

// Notion-style Toggle Component
const ToggleHeadingComponent = ({ node, updateAttributes }) => {
    const isOpen = node.attrs.open ?? true;
    const level = node.attrs.level ?? 1;

    const toggleOpen = (e) => {
        e.preventDefault();
        e.stopPropagation();
        updateAttributes({ open: !isOpen });
    };

    return (
        <NodeViewWrapper
            as="div"
            className="notion-toggle-wrapper my-2 relative"
            data-open={isOpen ? 'true' : 'false'}
            data-level={level}
        >
            {/* Notion Caret (Button floats over the heading row) */}
            <button
                type="button"
                contentEditable={false}
                onClick={toggleOpen}
                className="notion-toggle-btn absolute left-0 top-1 w-6 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors select-none cursor-pointer z-10"
                aria-label="Toggle collapse"
            >
                <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className={`w-3.5 h-3.5 transition-transform duration-100 ease-out ${
                        isOpen ? 'rotate-90 text-gray-700' : 'rotate-0 text-gray-500'
                    }`}
                >
                    <path d="M8 5v14l11-7z" />
                </svg>
            </button>

            {/* ProseMirror Content Outlet */}
            <NodeViewContent className={`notion-toggle-inner ${isOpen ? 'is-open' : 'is-closed'}`} />
        </NodeViewWrapper>
    );
};

export const DetailsSummary = Node.create({
    name: 'detailsSummary',
    group: 'block',
    content: 'inline*',
    defining: true,
    isolating: true,

    parseHTML() {
        return [{ tag: 'div[data-type="details-summary"]' }, { tag: 'summary' }];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes(HTMLAttributes, {
                'data-type': 'details-summary',
                class: 'toggle-summary-heading pl-7 outline-none font-bold text-slate-800 tracking-tight cursor-text',
            }),
            0,
        ];
    },
});

export const DetailsContent = Node.create({
    name: 'detailsContent',
    group: 'block',
    content: 'block+',
    defining: true,
    isolating: true,

    parseHTML() {
        return [{ tag: 'div[data-type="details-content"]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes(HTMLAttributes, {
                'data-type': 'details-content',
                class: 'toggle-body-content pl-7 pt-1 font-normal text-base text-slate-800 outline-none',
            }),
            0,
        ];
    },
});

export const Details = Node.create({
    name: 'details',
    group: 'block',
    content: 'detailsSummary detailsContent',
    defining: true,
    isolating: true,

    addAttributes() {
        return {
            open: {
                default: true,
                parseHTML: (el) => el.getAttribute('data-open') !== 'false',
                renderHTML: (attrs) => ({ 'data-open': attrs.open ? 'true' : 'false' }),
            },
            level: {
                default: 1,
                parseHTML: (el) => parseInt(el.getAttribute('data-level') || '1', 10),
                renderHTML: (attrs) => ({ 'data-level': attrs.level }),
            },
        };
    },

    parseHTML() {
        return [{ tag: 'div[data-type="notion-toggle"]' }, { tag: 'details' }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'notion-toggle' }), 0];
    },

    addNodeView() {
        return ReactNodeViewRenderer(ToggleHeadingComponent);
    },

    addKeyboardShortcuts() {
        return {
            // Pressing Enter in the heading drops cursor directly into the body
            Enter: ({ editor }) => {
                const { state } = editor;
                const { $from } = state.selection;

                if ($from.parent.type.name === 'detailsSummary') {
                    const detailsNode = $from.node(-1);
                    if (detailsNode && detailsNode.type.name === 'details') {
                        // Position of the detailsContent
                        const contentPos = $from.after();
                        return editor.chain().focus(contentPos + 1).run();
                    }
                }
                return false;
            },
        };
    },

    addCommands() {
        return {
            insertToggleHeading:
                (level = 1) =>
                    ({ chain }) => {
                        return chain()
                            .insertContent({
                                type: 'details',
                                attrs: { open: true, level },
                                content: [
                                    {
                                        type: 'detailsSummary',
                                        content: [{ type: 'text', text: `Heading ${level}` }],
                                    },
                                    {
                                        type: 'detailsContent',
                                        content: [{ type: 'paragraph' }],
                                    },
                                ],
                            })
                            .focus()
                            .run();
                    },
        };
    },
});