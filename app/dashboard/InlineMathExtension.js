import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useState, useRef, useEffect } from 'react';
import katex from 'katex';

const MathComponent = ({ node, updateAttributes }) => {
    const [isEditing, setIsEditing] = useState(!node.attrs.latex);
    const [val, setVal] = useState(node.attrs.latex || 'E=mc^2');
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current && !isEditing) {
            katex.render(node.attrs.latex || 'E=mc^2', containerRef.current, {
                throwOnError: false,
                displayMode: false,
            });
        }
    }, [node.attrs.latex, isEditing]);

    return (
        <NodeViewWrapper as="span" className="inline-block mx-1 align-baseline">
            {isEditing ? (
                <input
                    type="text"
                    autoFocus
                    value={val}
                    onChange={(e) => setVal(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            updateAttributes({ latex: val });
                            setIsEditing(false);
                        }
                    }}
                    onBlur={() => {
                        updateAttributes({ latex: val });
                        setIsEditing(false);
                    }}
                    placeholder="LaTeX string..."
                    className="text-xs font-mono border border-blue-400 rounded px-1.5 py-0.5 outline-none bg-blue-50/40 text-blue-900 shadow-sm"
                />
            ) : (
                <span
                    onClick={() => setIsEditing(true)}
                    ref={containerRef}
                    className="px-1.5 py-0.5 rounded bg-stone-100 hover:bg-stone-200 cursor-pointer font-serif text-sm transition-colors"
                />
            )}
        </NodeViewWrapper>
    );
};

export const InlineMathExtension = Node.create({
    name: 'inlineMath',
    group: 'inline',
    inline: true,
    selectable: true,
    atom: true,

    addAttributes() {
        return {
            latex: {
                default: 'E=mc^2',
                parseHTML: (element) => element.getAttribute('data-latex'),
                renderHTML: (attributes) => ({ 'data-latex': attributes.latex }),
            },
        };
    },

    parseHTML() {
        return [{ tag: 'span[data-latex]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(HTMLAttributes)];
    },

    addNodeView() {
        return ReactNodeViewRenderer(MathComponent);
    },
});