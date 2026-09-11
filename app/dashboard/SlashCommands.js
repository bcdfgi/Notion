import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import { SlashCommandList } from './SlashCommandList';

export const slashItems = [
    // --- Basic blocks ---
    {
        title: 'Heading 1',
        description: 'Big section heading',
        icon: 'H1',
        group: 'Basic blocks',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
        },
    },
    {
        title: 'Heading 2',
        description: 'Medium section heading',
        icon: 'H2',
        group: 'Basic blocks',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
        },
    },
    {
        title: 'Heading 3',
        description: 'Small section heading',
        icon: 'H3',
        group: 'Basic blocks',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run();
        },
    },
    {
        title: 'Heading 4',
        description: 'Extra small section heading',
        icon: 'H4',
        group: 'Basic blocks',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setNode('heading', { level: 4 }).run();
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
        title: 'Toggle List',
        description: 'Create a toggle list',
        icon: '☑',
        group: 'Basic blocks',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleTaskList().run();
        },
    },
    {
        title:'Page',
        description:'Embed a sub page inside this page',
        icon: '📄',
        group:'Basic blocks',

    },
    {
        title:'CallOut',
        description:'Make writing stand out',
        icon: '📄',
        group:'Basic blocks',

    },
    {
        title: 'Quote',
        description: 'Creates a quote',
        icon: '“ ”',
        group: 'Basic blocks',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleBlockquote().run();
        },
    },
    {
        title: 'Divider',
        description: 'Creates a divider',
        icon: '⸺',
        group: 'Basic blocks',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setHorizontalRule().run();
        },
    },
    {
        title: 'Table',
        description: 'Creates a table',
        icon: '▦',
        group: 'Basic blocks',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
        },
    },
    {
        title:'Link to a Page',
        description:'creates a link to a page',
        icon: '📄',
        group:'Basic blocks',

    },

    // --- Media ---
    {
        title:'Image',
        description:'Inserts a image',
        icon:'🖼️',
        group: 'Media',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setEmbed({src:null,embedType:'default'}).run();

        },
    },
    {
        title:'Video',
        description:'Inserts a video',
        icon:'🎥',
        group: 'Media',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setEmbed({src:null,embedType:'default'}).run();
        },
    },
    {
        title:'Code',
        description:'Inserts a code',
        icon:'</>',
        group: 'Media',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleCode().run();

        },

    },
    {
        title:'File',
        description:'Inserts a file',
        icon:'🗋',
        group: 'Media',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleCode().run();
        },
    },
    {
        title: 'Web Bookmark',
        description: 'Embed any link or web card',
        icon: '🔗',
        group: 'Media',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setEmbed({ src: null, embedType: 'default' }).run();
        },
    },
    // ---- Database ---
    {
        title:'Table View',
        description:'Creates a table view',
        icon:'⊞',
        group:'Database',
    },
    {
        title:'Board View',
        description:'Creates a board view',
        icon:'❚❚❚',
        group:'Database',
    },
    {
        title:'Gallery View',
        description:'Creates a Gallery view',
        icon:'⊞',
        group:'Database',
    },
    {
        title:'List View',
        description:'Creates a List view',
        icon:'☷',
        group:'Database',
    },
    {
        title:'Feed View',
        description:'Creates a Feed view',
        icon:'🗎',
        group:'Database',
    },
    {
        title:'Dashboard View',
        description:'Creates a Dashboard view',
        icon:'◫',
        group:'Database',
    },
    {
        title:'Calendar View',
        description:'Creates a Calendar view',
        icon:'🗓️',
        group:'Database',
    },
    {
        title:'Timeline View',
        description:'Creates a Timeline view',
        icon:'⊶',
        group:'Database',
    },
    {
        title:'Map View',
        description:'Creates a Map view',
        icon:'⌖',
        group:'Database',
    },
    {
        title:'Vertical bar Chart',
        description:'Creates a vertical bar chart',
        icon:'📊',
        group:'Database',
    },
    {
        title:'Horizontal bar Chart',
        description:'Creates a horizontal bar chart',
        icon:'☰',
        group:'Database',
    },
    {
        title:'Line Chart',
        description:'Creates a Line chart',
        icon:'📈',
        group:'Database',
    },
    {
        title:'Donut Chart',
        description:'Creates a Donut Chart',
        icon:'⭘',
        group:'Database',
    },
    {
        title:'Number Chart',
        description:'Creates a Number Chart',
        icon:'#',
        group:'Database',
    },
    {
        title:'Form',
        description:'Create a Form',
        icon:'📝️',
        group:'Database',
    },
    {
        title:'Database Inline',
        description:'Adds an inline database to this page',
        icon:'⛃',
        group:'Database',
    },
    {
        title:'Database Full Page',
        description:'Adds a new database as a new sub page',
        icon:'⛁',
        group:'Database',
    },
    {
        title:'Linked view of a different data source',
        description:'Adds a view of an existing data source to this page',
        icon:'⛁↗',
        group:'Database',
    },
    //---Advanced Blocks---

    {
        title:'Table of Contents',
        description:'Shows an outline of your page',
        icon:'☰',
        group:'Advanced Blocks',
    },
    {
        title:'Block Equation',
        description:'Displays a standalone math equation',
        icon:'∑',
        group:'Advanced Blocks',
    },
    {
        title:'Button',
        description:'Runs custom automation with a click',
        icon:'◉',
        group:'Advanced Blocks',
    },
    {
        title:'Breadcrumb',
        description:'Shows the current page location',
        icon:'🍞',
        group:'Advanced Blocks',
    },
    {
        title:'Tabs',
        description:'Organize content in tabs',
        icon:'🗂️',
        group:'Advanced Blocks',
    },
    {
        title:'Synced Blocks',
        description:'Sync content across pages',
        icon:'⇄',
        group:'Advanced Blocks',
    },
    {
        title:'Toggle Heading 1',
        description:'Hide content in a large heading',
        icon:'▶',
        group:'Advanced Blocks',
    },
    {
        title:'Toggle Heading 2',
        description:'Hide content in a medium heading',
        icon:'▶',
        group:'Advanced Blocks',
    },
    {
        title:'Toggle Heading 3',
        description:'Hide content in a small heading',
        icon:'▶',
        group:'Advanced Blocks',
    },
    {
        title:'2 Columns',
        description:'Creates a 2 column block',
        icon:'❚️❚️',
        group:'Advanced Blocks',
    },
    {
        title:'3 Columns',
        description:'Creates a 3 column block',
        icon:'❚️❚️❚️',
        group:'Advanced Blocks',
    },
    {
        title:'4 Columns',
        description:'Creates a 4 column block',
        icon:'❚️❚️❚️❚️',
        group:'Advanced Blocks',
    },
    {
        title:'5 Columns',
        description:'Creates a 5 column block',
        icon:'❚️❚️❚️❚️❚️',
        group:'Advanced Blocks',
    },

    //---Inline---
    {
        title:'Mention a person',
        description:'Ping someone so that they get a notification',
        icon:'👤',
        group:'Inline',
    },
    {
        title:'Mention a page or data source',
        description:'Mention a page or data source and place in text',
        icon:'@',
        group:'Inline',
    },
    {
        title:'Date or Reminder',
        description:'Mention a date or reminder in text',
        icon:'📅',
        group:'Inline',
    },
    {
        title:'Emoji',
        description:'Search for an emoji to place in text',
        icon:'☺',
        group:'Inline',
    },
    {
        title:'Inline Equation',
        description:'Adds mathematical symbols in text',
        icon:'🗓️',
        group:'Inline',
    },





    // --- Embeds ---
    {
        title:'Embed',
        description:'For PDFs, Google Maps and more',
        icon:'⧉',
        group:'Embeds',
    },
    {
        title:'HTML',
        description:'Upload or link an HTML file',
        icon:'<>',
        group:'Embeds',
    },
    {
        title:'Replit',
        description:'Embed a replit',
        icon: '⚡',
        group:'Embeds',

    },

    {
        title: 'Google Maps',
        description: 'Embed an interactive Google Map',
        icon: '📍',
        group: 'Embeds',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setEmbed({ src: null, embedType: 'maps' }).run();
        },
    },
    {
        title: 'Figma',
        description: 'Embed an interactive Figma file',
        icon: '🎨',
        group: 'Embeds',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setEmbed({ src: null, embedType: 'figma' }).run();
        },
    },

    {
        title: 'Spotify',
        description: 'Embed Spotify song or playlist',
        icon: '🎵',
        group: 'Embeds',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setEmbed({ src: null, embedType: 'spotify' }).run();
        },
    },
    {
        title: 'Youtube',
        description: 'Embed a youtube video',
        icon: '🎬',
        group: 'Embeds',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setEmbed({ src: null, embedType: 'youtube' }).run();
        },
    },

    //---Import---
    {
        title:'CSV',
        description:'Bring Data from CSV into Notion file',
        icon: '▦',
        group:'Import',

    },
    {
        title:'Text and Markdown',
        description:'Brings Data from Text and Markdown into Notion',
        icon: '¶',
        group:'Import',

    },
    {
        title:'PDF',
        description:'Bring data from PDF into Notion',
        icon: 'pdf',
        group:'Import',

    },

    //---Turn into---
    {
        title:'Text',
        description:'Just start writing with plain text',
        icon: 'T',
        group:'Turn into',

    },

    {
        title: 'Heading 1',
        description: 'Big section heading',
        icon: 'H1',
        group: 'Turn into',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
        },
    },
    {
        title: 'Heading 2',
        description: 'Medium section heading',
        icon: 'H2',
        group: 'Turn into',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
        },
    },
    {
        title: 'Heading 3',
        description: 'Small section heading',
        icon: 'H3',
        group: 'Turn into',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run();
        },
    },
    {
        title: 'Heading 4',
        description: 'Extra small section heading',
        icon: 'H4',
        group: 'Turn into',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setNode('heading', { level: 4 }).run();
        },
    },

    {
        title:'Page',
        description:'Embed a sub page inside this page',
        icon: '📄',
        group:'Turn into',

    },
    {
        title:'Page in',
        icon: '📄',
        group:'Turn into',

    },
    {
        title: 'Bullet List',
        description: 'Create a simple bulleted list',
        icon: '•',
        group: 'Turn into',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleBulletList().run();
        },
    },
    {
        title: 'Numbered List',
        description: 'Create a simple numbered list',
        icon: '1.',
        group: 'Turn into',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleOrderedList().run();
        },
    },
    {
        title: 'Todo List',
        description: 'Track tasks with a to-do list',
        icon: '☑',
        group: 'Turn into',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleTaskList().run();
        },
    },
    {
        title: 'Quote',
        description: 'Creates a quote',
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


    {
        title:'Block Equation',
        description:'Displays a standalone math equation',
        icon:'∑',
        group:'Turn into',
    },



    {
        title:'Synced Blocks',
        description:'Sync content across pages',
        icon:'⇄',
        group:'Turn into',
    },
    {
        title:'Toggle Heading 1',
        description:'Hide content in a large heading',
        icon:'▶',
        group:'Turn into',
    },
    {
        title:'Toggle Heading 2',
        description:'Hide content in a medium heading',
        icon:'▶',
        group:'Turn into',
    },
    {
        title:'Toggle Heading 3',
        description:'Hide content in a small heading',
        icon:'▶',
        group:'Turn into',
    },
    {
        title:'2 Columns',
        description:'Creates a 2 column block',
        icon:'❚️❚️',
        group:'Turn into',
    },
    {
        title:'3 Columns',
        description:'Creates a 3 column block',
        icon:'❚️❚️❚️',
        group:'Turn into',
    },
    {
        title:'4 Columns',
        description:'Creates a 4 column block',
        icon:'❚️❚️❚️❚️',
        group:'Turn into',
    },
    {
        title:'5 Columns',
        description:'Creates a 5 column block',
        icon:'❚️❚️❚️❚️❚️',
        group:'Turn into',
    },

    //--- Action ---
    {
        title:'Copy Link to block',
        description:'Copies Link to Block',
        icon:'⎘',
        group:'Actions',
    },
    {
        title:'Duplicate',
        description:'Creates a duplicate',
        icon:'⧉',
        group:'Actions',
    },
    {
        title:'Move to',
        description:'Moves the block',
        icon:'↳',
        group:'Actions',
    },
    {
        title:'Delete',
        description:'Deletes a block',
        icon:'🗑',
        group:'Actions',
    },

    //---Text color---
    {
        title:'Default text',
        icon:'⚫',
        group:'Text color'
    },
    {
        title:'Gray Text',
        icon:'🔘',
        group:'Text color'
    },

    {
        title:'Brown text',
        icon:'🟤',
        group:'Text color'
    },
    {
        title:'Orange text',
        icon:'🟠',
        group:'Text color'
    },
    {
        title:'Yellow text',
        icon:'🟡',
        group:'Text color'
    },
    {
        title:'Green text',
        icon:'🟢',
        group:'Text color'
    },
    {
        title:'Blue text',
        icon:'🔵',
        group:'Text color'
    },
    {
        title:'Purple text',
        icon:'🟣',
        group:'Text color'
    },
    {
        title:'Pink text',
        icon:'🩷',
        group:'Text color'
    },
    {
        title:'Red text',
        icon:'🔴',
        group:'Text color'
    },
    //---Background color---
    {
        title:'Default Background',
        icon:'⚪',
        group:'Background color'
    },
    {
        title:'Gray Background',
        icon:'🔘',
        group:'Background color'
    },

    {
        title:'Brown Background',
        icon:'🟤',
        group:'Background color'
    },
    {
        title:'Orange Background',
        icon:'🟠',
        group:'Background color'
    },
    {
        title:'Yellow Background',
        icon:'🟡',
        group:'Background color'
    },
    {
        title:'Green Background',
        icon:'🟢',
        group:'Background color'
    },
    {
        title:'Blue Background',
        icon:'🔵',
        group:'Background color'
    },
    {
        title:'Purple Background',
        icon:'🟣',
        group:'Background color'
    },
    {
        title:'Pink Background',
        icon:'🩷',
        group:'Background color'
    },
    {
        title:'Red Background',
        icon:'🔴',
        group:'Background color'
    },





];

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
                    props.command({ editor, range });
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

                            popup = tippy('body', {
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