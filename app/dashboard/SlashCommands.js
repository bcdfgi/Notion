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
        title: 'Bullet List',
        description: 'Create a simple bulleted list',
        icon: '•',
        group: 'Basic blocks',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleBulletList().run();
        },
    },
    {
        title: 'Task List',
        description: 'Track tasks with a to-do list',
        icon: '☑',
        group: 'Basic blocks',
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleTaskList().run();
        },
    },

    // --- Media ---
    {
        title: 'Web Bookmark / Embed',
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
                            component.updateProps(props);
                            if (!props.clientRect) return;

                            popup[0]?.setProps({
                                getReferenceClientRect: props.clientRect,
                            });
                        },

                        onKeyDown(props) {
                            if (props.event.key === 'Escape') {
                                popup[0]?.hide();
                                return true;
                            }
                            return component.ref?.onKeyDown(props);
                        },

                        onExit() {
                            popup?.[0]?.destroy();
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