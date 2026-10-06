import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useState, useRef, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const InlineMathComponent = ({ node, updateAttributes, selected }) => {
    // Open editor popover if newly created (latex is empty)
    const [isEditing, setIsEditing] = useState(!node.attrs.latex);
    const [val, setVal] = useState(node.attrs.latex || '');

    const previewRef = useRef(null);
    const popoverRef = useRef(null);
    const inputRef = useRef(null);

    // Render KaTeX live preview whenever value changes
    useEffect(() => {
        if (previewRef.current && val.trim()) {
            katex.render(val, previewRef.current, {
                throwOnError: false,
                displayMode: false,
            });
        }
    }, [val, isEditing]);

    // Handle outside clicks to close the popover and commit
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target)) {
                finishEditing();
            }
        };

        if (isEditing) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isEditing, val]);

    const finishEditing = () => {
        const finalVal = val.trim();
        updateAttributes({ latex: finalVal });
        setIsEditing(false);
    };

    return (
        <NodeViewWrapper as="span" className="relative inline-block align-baseline mx-0.5 select-none">
            {/* The Equation Pill / Badge */}
            {val.trim() ? (
                <span
                    onClick={() => {
                        setIsEditing(true);
                        setTimeout(() => inputRef.current?.focus(), 50);
                    }}
                    className={`inline-flex items-center px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                        isEditing
                            ? 'bg-[#E8F3FA] text-[#0B6E99] ring-1 ring-[#0B6E99]/30'
                            : 'hover:bg-stone-100 text-slate-900'
                    }`}
                >
                    <span ref={previewRef} />
                </span>
            ) : (
                /* Empty state: √x New equation */
                <span
                    onClick={() => {
                        setIsEditing(true);
                        setTimeout(() => inputRef.current?.focus(), 50);
                    }}
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-sm cursor-pointer transition-colors font-serif ${
                        isEditing
                            ? 'bg-[#E8F3FA] text-[#0B6E99] ring-1 ring-[#0B6E99]/30'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                    }`}
                >
                    <span className="font-sans font-medium text-xs text-stone-400">√x</span>
                    <span className="text-[13px] text-stone-600">New equation</span>
                </span>
            )}

            {/* Notion Floating Input Popover */}
            {isEditing && (
                <div
                    ref={popoverRef}
                    className="absolute left-0 top-full mt-1.5 z-50 flex items-center bg-white rounded-xl shadow-[0_6px_24px_rgba(0,0,0,0.12)] border border-gray-200/90 px-3 py-1.5 min-w-[320px] max-w-[460px] animate-in fade-in zoom-in-95 duration-100"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <input
                        ref={inputRef}
                        type="text"
                        autoFocus
                        value={val}
                        placeholder="E = mc^2"
                        onChange={(e) => {
                            setVal(e.target.value);
                            updateAttributes({ latex: e.target.value });
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                finishEditing();
                            } else if (e.key === 'Escape') {
                                e.preventDefault();
                                finishEditing();
                            }
                        }}
                        className="flex-1 bg-transparent text-[13px] text-slate-800 placeholder:text-gray-400 focus:outline-none pr-3 font-mono"
                    />

                    {/* Blue "Done ↵" Button */}
                    <button
                        type="button"
                        onClick={finishEditing}
                        className="flex items-center gap-1 bg-[#2383E2] hover:bg-[#1B6FBF] text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow-sm transition-colors cursor-pointer select-none"
                    >
                        Done
                        <svg
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polyline points="9 10 4 15 9 20" />
                            <path d="M20 4v7a4 4 0 0 1-4 4H4" />
                        </svg>
                    </button>
                </div>
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
                default: '',
                parseHTML: (element) => element.getAttribute('data-latex') || '',
                renderHTML: (attributes) => ({ 'data-latex': attributes.latex || '' }),
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
        return ReactNodeViewRenderer(InlineMathComponent);
    },
});