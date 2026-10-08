'use client';
import React, { useEffect, useRef } from 'react';
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

// Import your custom extensions
import { SlashCommands } from './SlashCommands';
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

export default function RowEditor({ initialContent, onChange }) {
    const isUpdatingRef = useRef(false);

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
            // SlashCommands enabled here
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
    });

    // Sync content if row changes externally
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
            className="w-full mt-2"
            onKeyDown={(e) => e.stopPropagation()}
            onKeyUp={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
        >
            <EditorContent editor={editor} />
        </div>
    );
}