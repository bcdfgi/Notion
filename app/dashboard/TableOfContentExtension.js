// TableOfContentsExtension.jsx
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useMemo } from 'react';

const TableOfContentsComponent = ({ editor }) => {
    const headings = useMemo(() => {
        const items = [];
        editor.state.doc.descendants((node, pos) => {
            if (node.type.name === 'heading') {
                items.push({
                    id: `heading-${pos}`,
                    level: node.attrs.level,
                    text: node.textContent,
                    pos,
                });
            }
        });
        return items;
    }, [editor.state.doc]);

    const scrollToHeading = (pos) => {
        editor.commands.setTextSelection(pos);
        const resolved = editor.view.domAtPos(pos);
        if (resolved?.node) {
            const el = resolved.node instanceof HTMLElement ? resolved.node : resolved.node.parentElement;
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    return (
        <NodeViewWrapper className="my-4 p-3 bg-gray-50/70 border border-gray-100 rounded-lg text-sm">
            <div className="font-semibold text-xs text-gray-500 uppercase tracking-wider mb-2">
                Table of Contents
            </div>
            {headings.length === 0 ? (
                <div className="text-xs text-gray-400 italic">No headings in document yet</div>
            ) : (
                <div className="space-y-1">
                    {headings.map((h, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => scrollToHeading(h.pos)}
                            style={{ paddingLeft: `${(h.level - 1) * 14}px` }}
                            className="block w-full text-left text-slate-600 hover:text-blue-600 hover:underline truncate py-0.5 text-xs"
                        >
                            {h.text || 'Untitled Heading'}
                        </button>
                    ))}
                </div>
            )}
        </NodeViewWrapper>
    );
};

export const TableOfContentsExtension = Node.create({
    name: 'tableOfContents',
    group: 'block',
    atom: true,
    selectable: true,
    draggable: true,
    parseHTML() {
        return [{ tag: 'div[data-type="toc"]' }];
    },
    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'toc' })];
    },
    addNodeView() {
        return ReactNodeViewRenderer(TableOfContentsComponent);
    },
});