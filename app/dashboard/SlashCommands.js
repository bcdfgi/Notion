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
        description: 'Capture a quote or callout block',
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
                content: [{ type: 'paragraph', content: [{ type: 'text', text: '💡 Note: ' }] }]
            }).run();
        },
    },
    {
        title: 'Link to a Page',
        description: 'Link an existing page in this workspace',
        icon: '↗',
        group: 'Basic blocks',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).run();
            window.dispatchEvent(new CustomEvent('notion:open-page-linker'));
        },
    },

    // --- Media ---
    {
        title: 'Image',
        description: 'Inserts an image embed',
        icon: '🖼️',
        group: 'Media',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setEmbed({ src: null, embedType: 'default' }).run();
        },
    },
    {
        title: 'Video',
        description: 'Inserts a video',
        icon: '🎥',
        group: 'Media',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setEmbed({ src: null, embedType: 'default' }).run();
        },
    },
    {
        title: 'Code Block',
        description: 'Insert a code snippet block',
        icon: '</>',
        group: 'Media',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
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
    },];

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
//     //---Text color---
//     {
//         title:'Default text',
//         icon:'⚫',
//         group:'Text color'
//     },
//     {
//         title:'Gray Text',
//         icon:'🔘',
//         group:'Text color'
//     },
//
//     {
//         title:'Brown text',
//         icon:'🟤',
//         group:'Text color'
//     },
//     {
//         title:'Orange text',
//         icon:'🟠',
//         group:'Text color'
//     },
//     {
//         title:'Yellow text',
//         icon:'🟡',
//         group:'Text color'
//     },
//     {
//         title:'Green text',
//         icon:'🟢',
//         group:'Text color'
//     },
//     {
//         title:'Blue text',
//         icon:'🔵',
//         group:'Text color'
//     },
//     {
//         title:'Purple text',
//         icon:'🟣',
//         group:'Text color'
//     },
//     {
//         title:'Pink text',
//         icon:'🩷',
//         group:'Text color'
//     },
//     {
//         title:'Red text',
//         icon:'🔴',
//         group:'Text color'
//     },
//     //---Background color---
//     {
//         title:'Default Background',
//         icon:'⚪',
//         group:'Background color'
//     },
//     {
//         title:'Gray Background',
//         icon:'🔘',
//         group:'Background color'
//     },
//
//     {
//         title:'Brown Background',
//         icon:'🟤',
//         group:'Background color'
//     },
//     {
//         title:'Orange Background',
//         icon:'🟠',
//         group:'Background color'
//     },
//     {
//         title:'Yellow Background',
//         icon:'🟡',
//         group:'Background color'
//     },
//     {
//         title:'Green Background',
//         icon:'🟢',
//         group:'Background color'
//     },
//     {
//         title:'Blue Background',
//         icon:'🔵',
//         group:'Background color'
//     },
//     {
//         title:'Purple Background',
//         icon:'🟣',
//         group:'Background color'
//     },
//     {
//         title:'Pink Background',
//         icon:'🩷',
//         group:'Background color'
//     },
//     {
//         title:'Red Background',
//         icon:'🔴',
//         group:'Background color'
//     },
//
//
//
//
//
// ];
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