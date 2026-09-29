// AdvancedNodes.jsx
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// Notion-style Block Equation Component
const BlockEquationComponent = ({ node, updateAttributes }) => {
    const rawLatex = node.attrs.latex || '';
    const [isEditing, setIsEditing] = useState(!rawLatex); // automatically open editor if empty
    const [latex, setLatex] = useState(rawLatex);
    const popoverRef = useRef(null);
    const textareaRef = useRef(null);

    // Keep local state in sync if node attributes change
    useEffect(() => {
        setLatex(node.attrs.latex || '');
    }, [node.attrs.latex]);

    // Auto-focus and resize textarea on edit open
    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
            adjustHeight();
        }
    }, [isEditing]);

    // Close when clicking outside the editor popover and block
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target)) {
                handleSave();
            }
        };

        if (isEditing) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isEditing, latex]);

    const adjustHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.max(56, textareaRef.current.scrollHeight)}px`;
        }
    };

    const handleSave = () => {
        updateAttributes({ latex: latex.trim() });
        setIsEditing(false);
    };

    // Render LaTeX using KaTeX safely
    const renderedMath = useMemo(() => {
        const contentToRender = (isEditing ? latex : rawLatex).trim();
        if (!contentToRender) return null;

        try {
            return katex.renderToString(contentToRender, {
                displayMode: true,
                throwOnError: false,
            });
        } catch {
            return null;
        }
    }, [latex, rawLatex, isEditing]);

    return (
        <NodeViewWrapper className="relative my-2 select-none group font-sans">
            {/* --- Block Area --- */}
            <div
                onClick={() => setIsEditing(true)}
                className={`w-full min-h-[44px] py-2 px-3 rounded-md cursor-pointer transition-all flex items-center justify-center ${
                    isEditing
                        ? 'bg-[#ebf3ff] ring-1 ring-blue-200'
                        : rawLatex
                            ? 'hover:bg-gray-100/70'
                            : 'bg-[#f4f4f3] hover:bg-[#ebebe9]'
                }`}
            >
                {/* When LaTeX is present: show the rendered equation */}
                {rawLatex || (isEditing && latex) ? (
                    <div
                        className="overflow-x-auto text-slate-900 py-1"
                        dangerouslySetInnerHTML={{ __html: renderedMath || latex }}
                    />
                ) : (
                    /* Empty Placeholder (Notion Style) */
                    <div className="w-full flex items-center gap-2.5 text-gray-400 select-none py-1 px-2">
                        <span className="font-serif font-bold text-xs tracking-tight text-gray-400 border border-gray-300 rounded px-1 py-0.5 leading-none">
                            T<sub className="text-[9px]">E</sub>X
                        </span>
                        <span className="text-sm font-normal text-gray-400">
                            Add a TeX equation
                        </span>
                    </div>
                )}
            </div>

            {/* --- Notion Floating Editor Popover --- */}
            {isEditing && (
                <div
                    ref={popoverRef}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute left-0 top-[calc(100%+6px)] z-50 w-full max-w-md bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200/90 p-3 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-100"
                >
                    <div className="flex items-start justify-between gap-3">
                        <textarea
                            ref={textareaRef}
                            value={latex}
                            rows={2}
                            placeholder="Type a TeX formula..."
                            onChange={(e) => {
                                setLatex(e.target.value);
                                adjustHeight();
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey || !e.shiftKey)) {
                                    e.preventDefault();
                                    handleSave();
                                }
                                if (e.key === 'Escape') {
                                    setLatex(rawLatex);
                                    setIsEditing(false);
                                }
                            }}
                            className="flex-1 bg-transparent resize-none text-[13px] font-mono leading-relaxed text-slate-800 placeholder-gray-400 border-none outline-none p-1 focus:ring-0"
                        />

                        {/* Notion Done Button */}
                        <button
                            type="button"
                            onClick={handleSave}
                            className="shrink-0 px-2.5 py-1 text-xs font-medium text-white bg-[#2383e2] hover:bg-[#1a73e8] active:bg-[#155fc0] rounded-md shadow-sm transition-colors flex items-center gap-1.5"
                        >
                            <span>Done</span>
                            <span className="text-[10px] opacity-80">↵</span>
                        </button>
                    </div>
                </div>
            )}
        </NodeViewWrapper>
    );
};

export const BlockEquationExtension = Node.create({
    name: 'blockEquation',
    group: 'block',
    atom: true,
    addAttributes() {
        return {
            latex: { default: '' },
        };
    },
    parseHTML() {
        return [{ tag: 'div[data-type="block-equation"]' }];
    },
    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'block-equation' })];
    },
    addNodeView() {
        return ReactNodeViewRenderer(BlockEquationComponent);
    },
});

// Interactive Button Component
const ButtonBlockComponent = ({ node, updateAttributes }) => {
    const [isEditing, setIsEditing] = useState(false);
    const label = node.attrs.label || 'Click me';

    return (
        <NodeViewWrapper className="my-2 inline-block">
            {isEditing ? (
                <div className="flex items-center gap-1.5 p-1 bg-white border border-gray-200 rounded shadow-md">
                    <input
                        defaultValue={label}
                        className="text-xs px-2 py-1 border border-gray-200 rounded outline-none"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                updateAttributes({ label: e.currentTarget.value });
                                setIsEditing(false);
                            }
                        }}
                    />
                </div>
            ) : (
                <button
                    type="button"
                    onDoubleClick={() => setIsEditing(true)}
                    onClick={() => alert(`Automation fired: ${label}`)}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors border border-blue-200"
                >
                    <span>◉</span>
                    <span>{label}</span>
                </button>
            )}
        </NodeViewWrapper>
    );
};

export const ButtonBlockExtension = Node.create({
    name: 'buttonBlock',
    group: 'block',
    atom: true,
    addAttributes() {
        return { label: { default: 'Run Automation' } };
    },
    parseHTML() {
        return [{ tag: 'div[data-type="button-block"]' }];
    },
    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'button-block' })];
    },
    addNodeView() {
        return ReactNodeViewRenderer(ButtonBlockComponent);
    },
});