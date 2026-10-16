'use client';
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useState, useEffect, useMemo } from 'react';
import PageIcon from './PageIcon';
import { FileText } from 'lucide-react';

const PageMentionComponent = ({ node, editor }) => {
    const { pageId, title, icon } = node.attrs;
    const [pagesCache, setPagesCache] = useState(() => {
        return typeof window !== 'undefined' && window.__NOTION_PAGES__ ? window.__NOTION_PAGES__ : [];
    });

    // Listen for the pages update event dispatched by Dashboard
    useEffect(() => {
        const handlePagesUpdated = (e) => {
            if (Array.isArray(e.detail)) {
                setPagesCache(e.detail);
            }
        };

        window.addEventListener('notion:pages-updated', handlePagesUpdated);
        return () => window.removeEventListener('notion:pages-updated', handlePagesUpdated);
    }, []);

    // 1. Look up live page from cache or editor storage
    const livePage = useMemo(() => {
        const pagesList =
            pagesCache.length > 0
                ? pagesCache
                : editor?.storage?.pageMention?.pages ||
                (typeof window !== 'undefined' ? window.__NOTION_PAGES__ : []) ||
                [];
        return pagesList.find((p) => String(p._id || p.id) === String(pageId));
    }, [pagesCache, editor, pageId]);

    // 2. Use live values if found, fallback to stored node attributes
    const displayTitle = livePage?.title || title || 'Untitled';
    const displayIcon = livePage?.icon !== undefined ? livePage.icon : icon;

    const renderIcon = () => {
        if (!displayIcon) {
            return <FileText size={13} className="text-gray-400" />;
        }
        if (typeof displayIcon === 'string') {
            return <span className="text-[13px] leading-none">{displayIcon}</span>;
        }
        if (displayIcon.type === 'emoji' && displayIcon.value) {
            return <span className="text-[13px] leading-none">{displayIcon.value}</span>;
        }
        if (displayIcon.emoji) {
            return <span className="text-[13px] leading-none">{displayIcon.emoji}</span>;
        }
        return <PageIcon icon={displayIcon} size={13} />;
    };

    return (
        <NodeViewWrapper as="span" className="inline-block align-baseline mx-0.5">
            <span
                data-page-id={pageId}
                data-page-title={displayTitle}
                contentEditable={false}
                className="page-mention-pill inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-gray-100/90 hover:bg-gray-200/90 text-slate-800 font-medium text-xs border border-gray-200/70 transition-colors cursor-pointer select-none"
            >
                <span className="shrink-0 flex items-center justify-center text-[13px] leading-none">
                    {renderIcon()}
                </span>
                <span className="underline underline-offset-2 decoration-gray-300 hover:decoration-slate-800 truncate max-w-[200px]">
                    {displayTitle}
                </span>
            </span>
        </NodeViewWrapper>
    );
};

export const PageMention = Node.create({
    name: 'pageMention',
    group: 'inline',
    inline: true,
    atom: true,

    addStorage() {
        return {
            pages: [],
        };
    },

    addAttributes() {
        return {
            pageId: {
                default: null,
                parseHTML: (element) => element.getAttribute('data-page-id'),
                renderHTML: (attributes) => {
                    if (!attributes.pageId) return {};
                    return { 'data-page-id': attributes.pageId };
                },
            },
            title: {
                default: 'Untitled',
                parseHTML: (element) =>
                    element.getAttribute('data-page-title') ||
                    element.innerText?.trim() ||
                    'Untitled',
                renderHTML: (attributes) => ({
                    'data-page-title': attributes.title || 'Untitled',
                }),
            },
            icon: {
                default: null,
                parseHTML: (element) => {
                    const raw = element.getAttribute('data-page-icon');
                    if (!raw) return null;
                    try {
                        return JSON.parse(decodeURIComponent(raw));
                    } catch {
                        try {
                            return JSON.parse(raw);
                        } catch {
                            return raw;
                        }
                    }
                },
                renderHTML: (attributes) => {
                    if (!attributes.icon) return {};
                    const serialized =
                        typeof attributes.icon === 'object' && attributes.icon !== null
                            ? encodeURIComponent(JSON.stringify(attributes.icon))
                            : attributes.icon;
                    return { 'data-page-icon': serialized };
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

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(HTMLAttributes, { class: 'page-mention-node' })];
    },

    addNodeView() {
        return ReactNodeViewRenderer(PageMentionComponent);
    },
});