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

    // --- Media ---
    {
        title:'Image',
        description:'Inserts an image',
        icon:'🖼️',
        group: 'Media',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setEmbed({src:null,embedType:'default'}).run();

        },
    },
    {
        title:'Video',
        description:'Inserts an video',
        icon:'🎥',
        group: 'Media',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setEmbed({src:null,embedType:'default'}).run();
        },
    },
    {
        title:'Code',
        description:'Inserts an code',
        icon:'</>',
        group: 'Media',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleCode().run();

        },

    },
    {
        title:'File',
        description:'Inserts an file',
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


    // --- Embeds ---
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
        title: 'YouTube',
        description: 'Embed a YouTube video player',
        icon: '▶',
        group: 'Embeds',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setEmbed({ src: null, embedType: 'youtube' }).run();
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
        title: 'Figma',
        description: 'Embed an interactive Figma file',
        icon: '🎨',
        group: 'Embeds',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setEmbed({ src: null, embedType: 'figma' }).run();
        },
    },
];

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