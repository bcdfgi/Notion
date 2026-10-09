'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Link } from '@tiptap/extension-link';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Code } from '@tiptap/extension-code';
import { Underline } from '@tiptap/extension-underline';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Highlight from '@tiptap/extension-highlight';
import CodeBlock from '@tiptap/extension-code-block';
import { ReactNodeViewRenderer } from '@tiptap/react';

// Menus and extensions
import { SlashCommands, plusMenuItems } from './SlashCommands';
import { SlashCommandList } from './SlashCommandList';
import BlockActionMenu from './BlockActionMenu';
import { DateExtension } from './DateExtension';
import { InlineMathExtension } from './InlineMathExtension';
import { ColumnGroup, Column } from './ColumnsExtension';
import { Details, DetailsSummary, DetailsContent } from './ToggleExtension';
import { TableOfContentsExtension } from './TableOfContentExtension';
import { BlockEquationExtension } from './AdvancedNodes';
import { ImageBlock } from './AddImage';
import { VideoExtension } from './VideoExtension';
import { BookmarkExtension } from './BookmarkExtension';
import { EmbedExtension } from './EmbedExtension';
import { PageMention } from './PageMention';
import { CodeBlockComponent } from './CodeBlock';

export default function RowEditor({ initialContent, onChange, userEmail = "User" }) {
    const isUpdatingRef = useRef(false);
    const containerRef = useRef(null);

    // Hover handle states
    const [handlePos, setHandlePos] = useState({ top: -100, opacity: 0 });
    const [showPlusMenu, setShowPlusMenu] = useState(false);
    const [showBlockMenu, setShowBlockMenu] = useState(false);
    const plusMenuRef = useRef(null);
    const blockMenuRef = useRef(null);

    const updateHandlePosition = useCallback((targetElement) => {
        if (!containerRef.current || !targetElement) return;
        const containerRect = containerRef.current.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        setHandlePos({
            top: targetRect.top - containerRect.top + 2,
            opacity: 1,
        });
    }, []);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                code: false,
                codeBlock: false,
                link: false,
                underline: false,
                heading: {
                    levels: [1, 2, 3, 4],
                },
            }),
            DateExtension,
            InlineMathExtension,
            CodeBlock.extend({
                addAttributes() {
                    return {
                        ...this.parent?.(),
                        language: {
                            default: 'Plain Text',
                            parseHTML: (el) => el.getAttribute('data-language') || 'Plain Text',
                            renderHTML: (attrs) => ({ 'data-language': attrs.language }),
                        },
                        caption: {
                            default: '',
                            parseHTML: (el) => el.getAttribute('data-caption') || '',
                            renderHTML: (attrs) => ({ 'data-caption': attrs.caption }),
                        },
                        wrap: {
                            default: false,
                            parseHTML: (el) => el.getAttribute('data-wrap') === 'true',
                            renderHTML: (attrs) => ({ 'data-wrap': attrs.wrap ? 'true' : 'false' }),
                        },
                    };
                },
                addNodeView() {
                    return ReactNodeViewRenderer(CodeBlockComponent);
                },
            }),
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
            TaskList,
            TaskItem.configure({ nested: true }),
            Underline,
            TextStyle,
            Color,
            Highlight.configure({ multicolor: true }),
            Code,
            ColumnGroup,
            Column,
            Details,
            DetailsSummary,
            DetailsContent,
            TableOfContentsExtension,
            BlockEquationExtension,
            ImageBlock,
            VideoExtension,
            BookmarkExtension,
            EmbedExtension,
            PageMention,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { class: 'text-blue-500 underline cursor-pointer' },
            }),
            Placeholder.configure({
                placeholder: "Press '/' for commands...",
            }),
            SlashCommands,
        ],
        content: initialContent || { type: 'doc', content: [{ type: 'paragraph' }] },
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'tiptap prose prose-slate max-w-none focus:outline-none min-h-[350px] text-[14px] text-slate-800 caret-blue-500 py-3',
            },
        },
        onUpdate: ({ editor }) => {
            isUpdatingRef.current = true;
            onChange(editor.getJSON());
            setTimeout(() => {
                isUpdatingRef.current = false;
            }, 100);
        },
        onSelectionUpdate: ({ editor }) => {
            if (!editor.view) return;
            const { selection } = editor.state;
            let node = editor.view.domAtPos(selection.from).node;
            const editorRoot = editor.view.dom;
            while (node && node.parentNode !== editorRoot) {
                node = node.parentNode;
            }
            if (node instanceof HTMLElement) {
                updateHandlePosition(node);
            }
        },
    });

    // Detect hovered block inside this editor
    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const element = document.elementFromPoint(e.clientX, e.clientY);
        const block = element?.closest('.tiptap > *');
        if (block) {
            updateHandlePosition(block);
        }
    };

    // Close popups on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (plusMenuRef.current && !plusMenuRef.current.contains(e.target)) {
                setShowPlusMenu(false);
            }
            if (blockMenuRef.current && !blockMenuRef.current.contains(e.target)) {
                setShowBlockMenu(false);
            }
        };

        if (showPlusMenu || showBlockMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showPlusMenu, showBlockMenu]);

    // Synchronize content if row selection changes
    useEffect(() => {
        if (!editor || isUpdatingRef.current) return;
        const currentJson = JSON.stringify(editor.getJSON());
        const incomingJson = JSON.stringify(
            initialContent || { type: 'doc', content: [{ type: 'paragraph' }] }
        );
        if (currentJson !== incomingJson) {
            editor.commands.setContent(
                initialContent || { type: 'doc', content: [{ type: 'paragraph' }] },
                false
            );
        }
    }, [initialContent, editor]);

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="w-full relative group/roweditor mt-2"
        >
            {/* Hover Action Handle (+ and 6-dots) */}
            <div
                className="absolute -left-12 flex items-center gap-0.5 z-40 transition-opacity duration-150"
                style={{
                    top: `${handlePos.top}px`,
                    opacity: handlePos.opacity,
                    pointerEvents: handlePos.opacity ? 'auto' : 'none',
                }}
            >
                {/* Plus (+) Button & Menu */}
                <div ref={plusMenuRef} className="relative">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowPlusMenu((prev) => !prev);
                            setShowBlockMenu(false);
                        }}
                        className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-colors"
                        title="Add a block below"
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>

                    {showPlusMenu && (
                        <div className="absolute left-0 top-full mt-1 z-50">
                            <SlashCommandList
                                items={plusMenuItems}
                                command={(item) => {
                                    if (item.command && editor) {
                                        const { from, to } = editor.state.selection;
                                        item.command({ editor, range: { from, to } });
                                    }
                                    setShowPlusMenu(false);
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* 6-dots Drag/Block Menu Button & Menu */}
                <div ref={blockMenuRef} className="relative">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowBlockMenu((prev) => !prev);
                            setShowPlusMenu(false);
                        }}
                        className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                        title="Drag to move or click for options"
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="9" cy="6" r="2" /><circle cx="9" cy="12" r="2" /><circle cx="9" cy="18" r="2" />
                            <circle cx="15" cy="6" r="2" /><circle cx="15" cy="12" r="2" /><circle cx="15" cy="18" r="2" />
                        </svg>
                    </button>

                    {showBlockMenu && (
                        <div className="absolute left-0 top-full mt-1 z-50">
                            <BlockActionMenu
                                editor={editor}
                                userEmail={userEmail}
                                onClose={() => setShowBlockMenu(false)}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* TipTap Editor Content */}
            <EditorContent editor={editor} />
        </div>
    );
}