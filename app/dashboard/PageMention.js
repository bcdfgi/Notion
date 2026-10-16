'use client';
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useState, useEffect, useMemo } from 'react';
import PageIcon from './PageIcon';
import { FileText } from 'lucide-react';

const PageMentionComponent = ({ node, editor }) => {
    const { pageId, title, icon } = node.attrs;

    // 1. Maintain local state for the live pages list from window or editor storage
    const [pagesList, setPagesList] = useState(() => {
        if (typeof window !== 'undefined' && Array.isArray(window.__NOTION_PAGES__)) {
            return window.__NOTION_PAGES__;
        }
        return editor?.storage?.pageMention?.pages || [];
    });

    useEffect(() => {
        const handlePagesUpdated = (e) => {
            if (Array.isArray(e.detail)) {
                setPagesList(e.detail);
            }
        };

        window.addEventListener('notion:pages-updated', handlePagesUpdated);
        return () => window.removeEventListener('notion:pages-updated', handlePagesUpdated);
    }, []);

    // 2. Resolve target page from pages list
    const matchedPage = useMemo(() => {
        if (!pageId || !Array.isArray(pagesList)) return null;
        const cleanTargetId = String(pageId).trim();
        return pagesList.find((p) => {
            const pId = String(p._id?.$oid || p._id || p.id || '').trim();
            return pId === cleanTargetId;
        });
    }, [pagesList, pageId]);

    // 3. Prefer matched page's current title and icon; fallback to stored attrs
    const displayTitle = matchedPage?.title || (title && title !== 'Untitled' ? title : null) || 'Untitled';
    const displayIcon = matchedPage?.icon !== undefined ? matchedPage.icon : icon;

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

    addAttributes() {
        return {
            pageId: {
                default: null,
                parseHTML: (element) => element.getAttribute('data-page-id') || null,
                renderHTML: (attributes) => {
                    if (!attributes.pageId) return {};
                    return { 'data-page-id': attributes.pageId };
                },
            },
            title: {
                default: 'Untitled',
                parseHTML: (element) => element.getAttribute('data-page-title') || 'Untitled',
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
                getAttrs: (element) => {
                    const pageId = element.getAttribute('data-page-id');
                    if (!pageId || pageId === 'null' || pageId === 'undefined') {
                        return false;
                    }
                    return {
                        pageId,
                        title: element.getAttribute('data-page-title') || 'Untitled',
                    };
                },
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