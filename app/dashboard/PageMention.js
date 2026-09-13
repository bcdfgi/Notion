import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React from 'react';
import PageIcon from './PageIcon';
import { FileText } from 'lucide-react';

const PageMentionComponent = ({ node }) => {
    const { pageId, title, icon } = node.attrs;

    return (
        <NodeViewWrapper as="span" className="inline-block align-baseline mx-0.5">
            <span
                data-page-id={pageId}
                contentEditable={false}
                className="page-mention-pill inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-gray-100/80 hover:bg-gray-200/80 text-slate-800 font-medium text-xs border border-gray-200/60 transition-colors cursor-pointer select-none"
            >
                <span className="shrink-0 flex items-center justify-center text-[13px] leading-none">
                    {icon ? (
                        <PageIcon icon={icon} size={13} />
                    ) : (
                        <FileText size={13} className="text-gray-400" />
                    )}
                </span>
                <span className="underline underline-offset-2 decoration-gray-300 hover:decoration-slate-800 truncate max-w-[200px]">
                    {title || 'Untitled'}
                </span>
            </span>
        </NodeViewWrapper>
    );
};

export const PageMention = Node.create({
    name: 'pageMention',
    group: 'inline',
    inline: true,
    atom: true, // Non-editable single token (like an emoji or mention)

    addAttributes() {
        return {
            pageId: {
                default: null,
                parseHTML: (element) => element.getAttribute('data-page-id'),
                renderHTML: (attributes) => ({
                    'data-page-id': attributes.pageId,
                }),
            },
            title: {
                default: 'Untitled',
                parseHTML: (element) => element.getAttribute('data-page-title'),
                renderHTML: (attributes) => ({
                    'data-page-title': attributes.title,
                }),
            },
            icon: {
                default: null,
                parseHTML: (element) => element.getAttribute('data-page-icon'),
                renderHTML: (attributes) => ({
                    'data-page-icon': attributes.icon,
                }),
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

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(HTMLAttributes)];
    },

    addNodeView() {
        return ReactNodeViewRenderer(PageMentionComponent);
    },
});