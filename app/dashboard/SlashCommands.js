import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import { SlashCommandList } from './SlashCommandList';

export const slashItems = [
    // --- Basic blocks ---
    {
        title: 'Text',
        description: 'Normal plain text paragraph',
        icon: 'T',
        group: 'Basic blocks',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setParagraph().run();
        },
    },
    {
        title: 'Heading 1',
        description: 'Big section heading',
        icon: 'H1',
        group: 'Basic blocks',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleHeading({ level: 1 }).run();
        },
    },
    {
        title: 'Heading 2',
        description: 'Medium section heading',
        icon: 'H2',
        group: 'Basic blocks',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleHeading({ level: 2 }).run();
        },
    },
    {
        title: 'Heading 3',
        description: 'Small section heading',
        icon: 'H3',
        group: 'Basic blocks',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleHeading({ level: 3 }).run();
        },
    },
    {
        title: 'Heading 4',
        description: 'Extra small section heading',
        icon: 'H4',
        group: 'Basic blocks',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleHeading({ level: 4 }).run();
        },
    },
    {
        title: 'Bullet List',
        description: 'Create a simple bulleted list',
        icon: '•',
        group: 'Basic blocks',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleBulletList().run();
        },
    },
    {
        title: 'Numbered List',
        description: 'Create a simple numbered list',
        icon: '1.',
        group: 'Basic blocks',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleOrderedList().run();
        },
    },
    {
        title: 'Todo List',
        description: 'Track tasks with a to-do list',
        icon: '☑',
        group: 'Basic blocks',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleTaskList().run();
        },
    },
    {
        title: 'Quote',
        description: 'Capture a quote',
        icon: '“ ”',
        group: 'Basic blocks',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleBlockquote().run();
        },
    },
    {
        title: 'Divider',
        description: 'Visually divide sections',
        icon: '⸺',
        group: 'Basic blocks',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setHorizontalRule().run();
        },
    },
    {
        title: 'Table',
        description: 'Insert a simple 3x3 table',
        icon: '▦',
        group: 'Basic blocks',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
        },
    },
    {
        title: 'Callout',
        description: 'Make writing stand out',
        icon: '💡',
        group: 'Basic blocks',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).insertContent({
                type: 'blockquote',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: "💡" }] }]
            }).run();
        },
    },
    {
        title: 'Link to a Page',
        description: 'Link an existing page in this workspace',
        icon: '↗',
        group: 'Basic blocks',
        command: ({ editor, range }) => {
            if (range) {
                editor.chain().focus().deleteRange(range).run();
            }
            // Save the exact cursor position before opening the modal
            window.__PAGE_LINK_POS__ = editor.state.selection.from;
            window.dispatchEvent(new CustomEvent('notion:open-page-linker'));
        },
    },

    //---Advanced Blocks
    {
        title: 'Table of Contents',
        description: 'Shows an outline of your page',
        icon: '☰',
        group: 'Advanced Blocks',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).insertContent({ type: 'tableOfContents' }).run();
        },
    },
    {
        title: 'Block Equation',
        description: 'Displays a standalone math equation',
        icon: '∑',
        group: 'Advanced Blocks',
        command: ({ editor, range }) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .insertContent({
                    type: 'blockEquation',
                    attrs: { latex: '' },
                })
                .run();
        },
    },

    {
        title: 'Toggle Heading 1',
        description: 'Large section heading with a collapsible toggle',
        icon: '▶',
        group: 'Advanced Blocks',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).insertToggleHeading(1).run();
        },
    },
    {
        title: 'Toggle Heading 2',
        description: 'Medium section heading with a collapsible toggle',
        icon: '▶',
        group: 'Advanced Blocks',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).insertToggleHeading(2).run();
        },
    },
    {
        title: 'Toggle Heading 3',
        description: 'Small section heading with a collapsible toggle',
        icon: '▶',
        group: 'Advanced Blocks',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).insertToggleHeading(3).run();
        },
    },
    {
        title: '2 Columns',
        description: 'Creates a 2 column block',
        icon: '❚️❚️',
        group: 'Advanced Blocks',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setColumns(2).run();
        },
    },
    {
        title: '3 Columns',
        description: 'Creates a 3 column block',
        icon: '❚️❚️❚️',
        group: 'Advanced Blocks',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setColumns(3).run();
        },
    },
    {
        title: '4 Columns',
        description: 'Creates a 4 column block',
        icon: '❚️❚️❚️❚️',
        group: 'Advanced Blocks',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setColumns(4).run();
        },
    },
    {
        title: '5 Columns',
        description: 'Creates a 5 column block',
        icon: '❚️❚️❚️❚️❚️',
        group: 'Advanced Blocks',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setColumns(5).run();
        },
    },

    // --- Media ---
    {
        title: 'Image',
        description: 'Upload an image or embed with a link',
        icon: '🖼️',
        group: 'Media',
        command: ({ editor, range }) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .insertContent({
                    type: 'imageBlock',
                    attrs: { src: null },
                })
                .run();
        },
    },


    {
        title: 'Video',
        description: 'Embed or upload a video',
        icon: '🎥',
        group: 'Media',
        command: ({ editor, range }) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .insertContent({
                    type: 'videoBlock',
                    attrs: { src: null },
                })
                .run();
        },
    },
    {
        title: 'Code Block',
        description: 'Insert a code snippet block',
        icon: '</>',
        group: 'Media',
        command: ({ editor, range }) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .setCodeBlock()
                .run();
        },
    },
    {
        title: 'Web Bookmark',
        description: 'Embed any link or web card',
        icon: '🔗',
        group: 'Media',
        command: ({ editor, range }) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .insertContent({
                    type: 'bookmarkBlock',
                    attrs: { url: null },
                })
                .run();
        },
    },
    // --- Embeds---

    {
        title: 'Google Maps',
        description: 'Embed an interactive Google Map',
        icon: '📍',
        group: 'Embeds',
        command: ({ editor, range }) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .setEmbed({ src: null, embedType: 'maps' })
                .run();
        },
    },
    {
        title: 'Figma',
        description: 'Embed an interactive Figma file',
        icon: '🎨',
        group: 'Embeds',
        command: ({ editor, range }) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .setEmbed({ src: null, embedType: 'figma' })
                .run();
        },
    },
    {
        title: 'Spotify',
        description: 'Embed an interactive spotify playlist',
        icon: '🎶',
        group: 'Embeds',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setEmbed({ src: null, embedType: 'spotify' }).run();
        },
    },
    // -----Databases----
    {
        title: 'Table View',
        description: 'Creates a table database',
        icon: '⊞',
        group: 'Database',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).insertDatabase({ initialType: 'table' }).run();
        },
    },
    {
        title: 'Board View',
        description: 'Creates a Kanban board database',
        icon: '❚❚❚',
        group: 'Database',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).insertDatabase({ initialType: 'board' }).run();
        },
    },
    {
        title: 'Gallery View',
        description: 'Creates a visual gallery database',
        icon: '⊞',
        group: 'Database',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).insertDatabase({ initialType: 'gallery' }).run();
        },
    },
    {
        title: 'List View',
        description: 'Creates a list database',
        icon: '☷',
        group: 'Database',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).insertDatabase({ initialType: 'list' }).run();
        },
    },
    {
        title: 'Calendar View',
        description: 'Creates a monthly calendar view',
        icon: '🗓️',
        group: 'Database',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).insertDatabase({ initialType: 'calendar' }).run();
        },
    },
    // ---Database Inline
    {
        title: 'Date or Reminder',
        description: 'Mention a date or reminder in text',
        icon: '📅',
        group: 'Inline',
        command: ({ editor, range }) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .insertContent({
                    type: 'dateMention',
                    attrs: { date: new Date().toISOString().split('T')[0] },
                })
                .insertContent(' ')
                .run();
        },
    },
    {
        title: 'Emoji',
        description: 'Search for an emoji to place in text',
        icon: '☺',
        group: 'Inline',
        command: ({ editor, range }) => {
            if (range) {
                editor.chain().focus().deleteRange(range).run();
            }
            window.dispatchEvent(new CustomEvent('notion:open-inline-emoji'));
        },
    },
    {
        title: 'Inline Equation',
        description: 'Adds mathematical symbols in text',
        icon: '√x',
        group: 'Inline',
        command: ({ editor, range }) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .insertContent({
                    type: 'inlineMath',
                    attrs: { latex: 'f(x)' },
                })
                .insertContent(' ')
                .run();
        },
    },


    // ---- Import ---
    {
        title: 'CSV',
        description: 'Bring Data from CSV into Notion file',
        icon: '▦',
        group: 'Import',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).run();
            window.dispatchEvent(new CustomEvent('notion:trigger-import', { detail: { type: 'csv' } }));
        },
    },
    {
        title: 'Text and Markdown',
        description: 'Brings Data from Text and Markdown into Notion',
        icon: '¶',
        group: 'Import',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).run();
            window.dispatchEvent(new CustomEvent('notion:trigger-import', { detail: { type: 'markdown' } }));
        },
    },
    {
        title: 'PDF',
        description: 'Bring data from PDF into Notion',
        icon: '📄',
        group: 'Import',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).run();
            window.dispatchEvent(new CustomEvent('notion:trigger-import', { detail: { type: 'pdf' } }));
        },
    },



    // --- Turn into ---
    {
        title: 'Text',
        description: 'Turn block into regular text',
        icon: 'T',
        group: 'Turn into',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).clearNodes().setParagraph().run();
        },
    },
    {
        title: 'Heading 1',
        description: 'Turn into Heading 1',
        icon: 'H1',
        group: 'Turn into',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).clearNodes().setNode('heading', { level: 1 }).run();
        },
    },
    {
        title: 'Heading 2',
        description: 'Turn into Heading 2',
        icon: 'H2',
        group: 'Turn into',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).clearNodes().setNode('heading', { level: 2 }).run();
        },
    },
    {
        title: 'Heading 3',
        description: 'Turn into Heading 3',
        icon: 'H3',
        group: 'Turn into',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).clearNodes().setNode('heading', { level: 3 }).run();
        },
    },
    {
        title: 'Bullet List',
        description: 'Turn into a bulleted list',
        icon: '•',
        group: 'Turn into',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleBulletList().run();
        },
    },
    {
        title: 'Numbered List',
        description: 'Turn into a numbered list',
        icon: '1.',
        group: 'Turn into',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleOrderedList().run();
        },
    },
    {
        title: 'Todo List',
        description: 'Turn into a to-do list',
        icon: '☑',
        group: 'Turn into',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleTaskList().run();
        },
    },
    {
        title: 'Quote',
        description: 'Turn into a quote block',
        icon: '“ ”',
        group: 'Turn into',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleBlockquote().run();
        },
    },
    {
        title:'CallOut',
        description:'Make Writing stand out',
        icon: '📄',
        group:'Turn into',

    },
    {
        title: 'Divider',
        description: 'Creates a divider',
        icon: '⸺',
        group: 'Turn into',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setHorizontalRule().run();
        },
    },
    {
        title: 'Table',
        description: 'Creates a table',
        icon: '▦',
        group: 'Turn into',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
        },
    },
    // --- Text color ---
    {
        title: 'Default text',
        icon: '⚫',
        group: 'Text color',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).unsetColor().run();
        },
    },
    {
        title: 'Gray Text',
        icon: '🔘',
        group: 'Text color',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setColor('#787774').run();
        },
    },
    {
        title: 'Brown Text',
        icon: '🟤',
        group: 'Text color',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setColor('#9F6B53').run();
        },
    },
    {
        title: 'Orange Text',
        icon: '🟠',
        group: 'Text color',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setColor('#D9730D').run();
        },
    },
    {
        title: 'Yellow Text',
        icon: '🟡',
        group: 'Text color',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setColor('#CB912F').run();
        },
    },
    {
        title: 'Green Text',
        icon: '🟢',
        group: 'Text color',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setColor('#448361').run();
        },
    },
    {
        title: 'Blue Text',
        icon: '🔵',
        group: 'Text color',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setColor('#337EA9').run();
        },
    },
    {
        title: 'Purple Text',
        icon: '🟣',
        group: 'Text color',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setColor('#9065B0').run();
        },
    },
    {
        title: 'Pink Text',
        icon: '🩷',
        group: 'Text color',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setColor('#C14C8A').run();
        },
    },
    {
        title: 'Red Text',
        icon: '🔴',
        group: 'Text color',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setColor('#D44C47').run();
        },
    },

    // --- Background color ---
    {
        title: 'Default Background',
        icon: '⚪',
        group: 'Background color',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).unsetHighlight().run();
        },
    },
    {
        title: 'Gray Background',
        icon: '🔘',
        group: 'Background color',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setHighlight({ color: '#F1F1EF' }).run();
        },
    },
    {
        title: 'Brown Background',
        icon: '🟤',
        group: 'Background color',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setHighlight({ color: '#F4EEEE' }).run();
        },
    },
    {
        title: 'Orange Background',
        icon: '🟠',
        group: 'Background color',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setHighlight({ color: '#FBECDD' }).run();
        },
    },
    {
        title: 'Yellow Background',
        icon: '🟡',
        group: 'Background color',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setHighlight({ color: '#FBF3DB' }).run();
        },
    },
    {
        title: 'Green Background',
        icon: '🟢',
        group: 'Background color',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setHighlight({ color: '#EDF3EC' }).run();
        },
    },
    {
        title: 'Blue Background',
        icon: '🔵',
        group: 'Background color',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setHighlight({ color: '#E7F3F8' }).run();
        },
    },
    {
        title: 'Purple Background',
        icon: '🟣',
        group: 'Background color',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setHighlight({ color: '#F4EEF8' }).run();
        },
    },
    {
        title: 'Pink Background',
        icon: '🩷',
        group: 'Background color',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setHighlight({ color: '#F9EEF3' }).run();
        },
    },
    {
        title: 'Red Background',
        icon: '🔴',
        group: 'Background color',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setHighlight({ color: '#FDEBEC' }).run();
        },
    },


];


    // {
    //     title:'Block Equation',
    //     description:'Displays a standalone math equation',
    //     icon:'∑',
    //     group:'Turn into',
    // },
    //
    //
    //
    // {
    //     title:'Synced Blocks',
    //     description:'Sync content across pages',
    //     icon:'⇄',
    //     group:'Turn into',
    // },
    // {
    //     title:'Toggle Heading 1',
    //     description:'Hide content in a large heading',
    //     icon:'▶',
    //     group:'Turn into',
    // },
    // {
    //     title:'Toggle Heading 2',
    //     description:'Hide content in a medium heading',
    //     icon:'▶',
    //     group:'Turn into',
    // },
    // {
    //     title:'Toggle Heading 3',
    //     description:'Hide content in a small heading',
    //     icon:'▶',
    //     group:'Turn into',
    // },
    // {
    //     title:'2 Columns',
    //     description:'Creates a 2 column block',
    //     icon:'❚️❚️',
    //     group:'Turn into',
    // },
    // {
    //     title:'3 Columns',
    //     description:'Creates a 3 column block',
    //     icon:'❚️❚️❚️',
    //     group:'Turn into',
    // },
    // {
    //     title:'4 Columns',
    //     description:'Creates a 4 column block',
    //     icon:'❚️❚️❚️❚️',
    //     group:'Turn into',
    // },
    // {
    //     title:'5 Columns',
    //     description:'Creates a 5 column block',
    //     icon:'❚️❚️❚️❚️❚️',
    //     group:'Turn into',
    // },

// ---- Database ---
// {
//     title:'Table View',
//         description:'Creates a table view',
//     icon:'⊞',
//     group:'Database',
// },
// {
//     title:'Board View',
//         description:'Creates a board view',
//     icon:'❚❚❚',
//     group:'Database',
// },
// {
//     title:'Gallery View',
//         description:'Creates a Gallery view',
//     icon:'⊞',
//     group:'Database',
// },
// {
//     title:'List View',
//         description:'Creates a List view',
//     icon:'☷',
//     group:'Database',
// },
// {
//     title:'Feed View',
//         description:'Creates a Feed view',
//     icon:'🗎',
//     group:'Database',
// },
// {
//     title:'Dashboard View',
//         description:'Creates a Dashboard view',
//     icon:'◫',
//     group:'Database',
// },
// {
//     title:'Calender View',
//         description:'Creates a Calender view',
//     icon:'🗓️',
//     group:'Database',
// },
// {
//     title:'Timeline View',
//         description:'Creates a Timeline view',
//     icon:'⊶',
//     group:'Database',
// },
// {
//     title:'Map View',
//         description:'Creates a Map view',
//     icon:'⌖',
//     group:'Database',
// },
// {
//     title:'Vertical bar Chart',
//         description:'Creates a vertical bar chart ',
//     icon:'📊',
//     group:'Database',
// },
// {
//     title:'Horizontal bar Chart',
//         description:'Creates a horizontal bar chart ',
//     icon:'☰',
//     group:'Database',
// },
// {
//     title:'Linear Chart',
//         description:'Creates a Linear chart',
//     icon:'📈',
//     group:'Database',
// },
// {
//     title:'Donut Chart',
//         description:'Creates a Donut Chart',
//     icon:'⭘',
//     group:'Database',
// },
// {
//     title:'Number Chart',
//         description:'Creates a Number Chart',
//     icon:'#',
//     group:'Database',
// },
// {
//     title:'Form',
//         description:'Create a Form',
//     icon:'📝️',
//     group:'Database',
// },
// {
//     title:'Database Inline',
//         description:'Adds a newline database to this page ',
//     icon:'⛃',
//     group:'Database',
// },
// {
//     title:'Database Full Page',
//         description:'Adds a new database as a new sub page',
//     icon:'⛁',
//     group:'Database',
// },
// {
//     title:'Linked view of a different data source',
//         description:'Adds a view of an existing data source to this page ',
//     icon:'⛁↗',
//     group:'Database',
// },
// //---Advanced Blocks---
//
// {
//     title:'Table of Contents',
//         description:'Shows an outline of your page ',
//     icon:'☰',
//     group:'Advanced Blocks',
// },
// {
//     title:'Block Equation',
//         description:'Displays a standalone math equation',
//     icon:'∑',
//     group:'Advanced Blocks',
// },
// {
//     title:'Button',
//         description:'Runs custom automation with a click ',
//     icon:'◉',
//     group:'Advanced Blocks',
// },
// {
//     title:'Breadcrumb',
//         description:'Shows the current page location ',
//     icon:'🍞',
//     group:'Advanced Blocks',
// },
// {
//     title:'Tabs',
//         description:'Organize content in tabs ',
//     icon:'🗂️',
//     group:'Advanced Blocks',
// },
// {
//     title:'Synced Blocks',
//         description:'Sync content across pages',
//     icon:'⇄',
//     group:'Advanced Blocks',
// },
// {
//     title:'Toggle Heading 1',
//         description:'Hide content in a large heading ',
//     icon:'▶',
//     group:'Advanced Blocks',
// },
// {
//     title:'Toggle Heading 2',
//         description:'Hide content in a medium heading ',
//     icon:'▶',
//     group:'Advanced Blocks',
// },
// {
//     title:'Toggle Heading 3',
//         description:'Hide content in a small heading ',
//     icon:'▶',
//     group:'Advanced Blocks',
// },
// {
//     title:'2 Columns',
//         description:'Creates a 2 column block ',
//     icon:'❚️❚️',
//     group:'Advanced Blocks',
// },
// {
//     title:'3 Columns',
//         description:'Creates a 3 column block ',
//     icon:'❚️❚️❚️',
//     group:'Advanced Blocks',
// },
// {
//     title:'4 Columns',
//         description:'Creates a 4 column block ',
//     icon:'❚️❚️❚️❚️',
//     group:'Advanced Blocks',
// },
// {
//     title:'5 Columns',
//         description:'Creates a 5 column block ',
//     icon:'❚️❚️❚️❚️❚️',
//     group:'Advanced Blocks',
// },
// {
//     title:'Mention a person',
//         description:'Ping someone so that they get a notification ',
//     icon:'👤',
//     group:'Inline',
// },
// {
//     title:'Mention a page or data source',
//         description:'Mention a page or data source and place in text ',
//     icon:'@',
//     group:'Inline',
// },
// {
//     title:'Date or Reminder',
//         description:'Mention a date or reminder in text ',
//     icon:'📅',
//     group:'Inline',
// },
// {
//     title:'Emoji',
//         description:'Search for an emoji to place in text ',
//     icon:'☺',
//     group:'Inline',
// },
// {
//     title:'Inline Equation',
//         description:'Adds mathematical symbols in text ',
//     icon:'🗓️',
//     group:'Inline',
// },

//
//
// ];


//     //--- Action ---
//     {
//         title:'Copy Link to block',
//         description:'Copies Link to Block',
//         icon:'⎘',
//         group:'Actions',
//     },
//     {
//         title:'Duplicate',
//         description:'Creates a duplicate',
//         icon:'⧉',
//         group:'Actions',
//     },
//     {
//         title:'Move to',
//         description:'Moves the block',
//         icon:'↳',
//         group:'Actions',
//     },
//     {
//         title:'Delete',
//         description:'Deletes a block',
//         icon:'🗑',
//         group:'Actions',
//     },
//
//
const EXCLUDED_GROUPS = ['Turn into', 'Text color', 'Background color', 'Actions'];

export const plusMenuItems = slashItems.filter(
    (item) => !EXCLUDED_GROUPS.includes(item.group)
);

export const SlashCommands = Extension.create({
    name: 'slashCommands',

    addOptions() {
        return {
            suggestion: {
                char: '/',
                command: ({ editor, range, props }) => {
                    props.command?.({ editor, range });
                },
                items: ({ query }) => {
                    return slashItems.filter((item) =>
                        item.title.toLowerCase().includes(query.toLowerCase())
                    );
                },
                render: () => {
                    let component;
                    let popup;

                    return {
                        onStart: (props) => {
                            component = new ReactRenderer(SlashCommandList, {
                                props,
                                editor: props.editor,
                            });

                            if (!props.clientRect) return;

                            popup = tippy(document.body, {
                                getReferenceClientRect: props.clientRect,
                                appendTo: () => document.body,
                                content: component.element,
                                showOnCreate: true,
                                interactive: true,
                                trigger: 'manual',
                                placement: 'bottom-start',
                            });
                        },

                        onUpdate(props) {
                            component?.updateProps(props);
                            if (!props.clientRect) return;

                            if (popup && popup[0] && !popup[0].state.isDestroyed) {
                                popup[0].setProps({
                                    getReferenceClientRect: props.clientRect,
                                });
                            }
                        },

                        onKeyDown(props) {
                            if (props.event.key === 'Escape') {
                                if (popup && popup[0] && !popup[0].state.isDestroyed) {
                                    popup[0].hide();
                                }
                                return true;
                            }
                            return component?.ref?.onKeyDown(props);
                        },

                        onExit() {
                            if (popup && popup[0] && !popup[0].state.isDestroyed) {
                                popup[0].destroy();
                            }
                            component?.destroy();
                        },
                    };
                },
            },
        };
    },

    addProseMirrorPlugins() {
        return [
            Suggestion({
                editor: this.editor,
                ...this.options.suggestion,
            }),
        ];
    },
});