import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useState } from 'react';

const DatePill = ({ node, updateAttributes }) => {
    const [isEditing, setIsEditing] = useState(false);
    const formatted = node.attrs.date
        ? new Date(node.attrs.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Select date';

    return (
        <NodeViewWrapper as="span" className="inline-block mx-0.5 align-middle">
            {isEditing ? (
                <input
                    type="date"
                    autoFocus
                    defaultValue={node.attrs.date || new Date().toISOString().split('T')[0]}
                    onBlur={(e) => {
                        updateAttributes({ date: e.target.value });
                        setIsEditing(false);
                    }}
                    className="text-xs border border-blue-400 rounded px-1 py-0.5 outline-none bg-white shadow-sm"
                />
            ) : (
                <span
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 cursor-pointer select-none transition-colors"
                >
                    📅 <span>{formatted}</span>
                </span>
            )}
        </NodeViewWrapper>
    );
};

export const DateExtension = Node.create({
    name: 'dateMention',
    group: 'inline',
    inline: true,
    selectable: true,
    atom: true,

    addAttributes() {
        return {
            date: {
                default: new Date().toISOString().split('T')[0],
                parseHTML: (element) => element.getAttribute('data-date'),
                renderHTML: (attributes) => ({ 'data-date': attributes.date }),
            },
        };
    },

    parseHTML() {
        return [{ tag: 'span[data-date]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(HTMLAttributes)];
    },

    addNodeView() {
        return ReactNodeViewRenderer(DatePill);
    },
});