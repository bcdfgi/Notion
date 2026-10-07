// DatabaseExtension.js
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import DatabaseBlock from './DatabaseBlock';

const DEFAULT_PROPERTIES = [
    { id: 'prop-title', name: 'Name', type: 'title' },
    { id: 'prop-created', name: 'Created', type: 'date' },
    { id: 'prop-tags', name: 'Tags', type: 'select', options: [] },
];

export const DatabaseExtension = Node.create({
    name: 'databaseBlock',
    group: 'block',
    atom: false,        // <-- MUST BE FALSE so ProseMirror does not lock child inputs
    selectable: false,  // <-- Prevents ProseMirror NodeSelection from hijacking clicks
    draggable: false,

    addAttributes() {
        return {
            title: { default: 'Untitled database' },
            activeViewId: { default: 'view-1' },
            views: {
                default: [{ id: 'view-1', name: 'Table', type: 'table' }],
                parseHTML: element => {
                    const raw = element.getAttribute('data-views');
                    if (!raw) return [{ id: 'view-1', name: 'Table', type: 'table' }];
                    try { return JSON.parse(decodeURIComponent(raw)); } catch { return [{ id: 'view-1', name: 'Table', type: 'table' }]; }
                },
                renderHTML: attributes => ({
                    'data-views': encodeURIComponent(JSON.stringify(attributes.views || [])),
                }),
            },
            properties: {
                default: DEFAULT_PROPERTIES,
                parseHTML: element => {
                    const raw = element.getAttribute('data-properties');
                    if (!raw) return DEFAULT_PROPERTIES;
                    try { return JSON.parse(decodeURIComponent(raw)); } catch { return DEFAULT_PROPERTIES; }
                },
                renderHTML: attributes => ({
                    'data-properties': encodeURIComponent(JSON.stringify(attributes.properties || DEFAULT_PROPERTIES)),
                }),
            },
            rows: {
                default: [],
                parseHTML: element => {
                    const raw = element.getAttribute('data-rows');
                    if (!raw) return [];
                    try { return JSON.parse(decodeURIComponent(raw)); } catch { return []; }
                },
                renderHTML: attributes => ({
                    'data-rows': encodeURIComponent(JSON.stringify(attributes.rows || [])),
                }),
            },
        };
    },

    parseHTML() {
        return [{ tag: 'div[data-database-block]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes(HTMLAttributes, { 'data-database-block': '' }),
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(DatabaseBlock, {
            stopEvent: () => true, // Stops ProseMirror from intercepting any keyboard or mouse events
        });
    },

    addCommands() {
        return {
            insertDatabase: (attrs = {}) => ({ commands }) => {
                const initialType = attrs.initialType || 'table';
                const initialName = initialType.charAt(0).toUpperCase() + initialType.slice(1);
                return commands.insertContent({
                    type: this.name,
                    attrs: {
                        title: attrs.title || 'Untitled database',
                        activeViewId: 'view-1',
                        views: [{ id: 'view-1', name: initialName, type: initialType }],
                        properties: DEFAULT_PROPERTIES,
                        rows: [],
                        ...attrs,
                    },
                });
            },
        };
    },
});