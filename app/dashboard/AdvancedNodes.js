// AdvancedNodes.jsx
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useState } from 'react';

// Block Equation Component
const BlockEquationComponent = ({ node, updateAttributes }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [latex, setLatex] = useState(node.attrs.latex || 'E = mc^2');

    return (
        <NodeViewWrapper className="my-3 flex justify-center">
            {isEditing ? (
                <div className="flex gap-2 p-2 border border-gray-200 rounded-lg bg-white shadow-sm w-full max-w-md">
                    <input
                        value={latex}
                        onChange={(e) => setLatex(e.target.value)}
                        className="flex-1 text-sm font-mono border-none outline-none px-2"
                        placeholder="LaTeX formula..."
                    />
                    <button
                        onClick={() => {
                            updateAttributes({ latex });
                            setIsEditing(false);
                        }}
                        className="px-2.5 py-1 text-xs bg-blue-500 text-white rounded font-medium"
                    >
                        Done
                    </button>
                </div>
            ) : (
                <div
                    onClick={() => setIsEditing(true)}
                    className="cursor-pointer px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg font-mono text-base hover:bg-gray-100 transition-colors"
                >
                    {node.attrs.latex || 'E = mc^2'}
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
            latex: { default: 'E = mc^2' },
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