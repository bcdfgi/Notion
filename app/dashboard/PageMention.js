import { Node, mergeAttributes } from '@tiptap/core';

export const PageMention = Node.create({
    name: 'pageMention',
    group: 'inline',
    inline: true,
    atom: true,
    selectable: true,
    draggable: false,

    addAttributes() {
        return {
            pageId: {
                default: null,
                parseHTML: el => el.getAttribute('data-page-id') || null,
                renderHTML: attrs => {
                    if (!attrs.pageId) return {};
                    return { 'data-page-id': attrs.pageId };
                },
            },
            title: {
                default: 'Untitled',
                parseHTML: el => el.getAttribute('data-page-title') || el.innerText?.replace('📄', '').trim() || 'Untitled',
                renderHTML: attrs => ({ 'data-page-title': attrs.title || 'Untitled' }),
            },
            icon: {
                default: null,
                parseHTML: el => {
                    const raw = el.getAttribute('data-page-icon');
                    if (!raw) return null;
                    try { return JSON.parse(raw); } catch { return raw; }
                },
                renderHTML: attrs => {
                    if (!attrs.icon) return {};
                    return {
                        'data-page-icon': typeof attrs.icon === 'object' ? JSON.stringify(attrs.icon) : attrs.icon,
                    };
                },
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'span[data-page-id]',
            },
        ];
    },

    renderHTML({ node, HTMLAttributes }) {
        const title = node?.attrs?.title || HTMLAttributes['data-page-title'] || 'Untitled';
        const pageId = node?.attrs?.pageId || HTMLAttributes['data-page-id'] || '';

        return [
            'span',
            mergeAttributes(HTMLAttributes, {
                'data-page-id': pageId,
                'data-page-title': title,
                contenteditable: 'false',
                class: 'page-mention-pill inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium text-xs border border-stone-200 cursor-pointer select-none mx-0.5 align-baseline',
            }),
            ['span', { class: 'text-stone-400 select-none' }, '📄'],
            ['span', { class: 'underline underline-offset-2 decoration-stone-300' }, title],
        ];
    },
});