'use client';
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useState, useEffect, useRef } from 'react';
import PageIcon from './PageIcon';
import { FileText } from 'lucide-react';

const PageMentionComponent = ({ node, editor }) => {
    const { pageId, title, icon } = node.attrs;
    const isMountedRef = useRef(false);


    const [pageInfo, setPageInfo] = useState(() => {
        if (!pageId) return { title: title || 'Untitled', icon };

        const pool = (typeof window !== 'undefined' && Array.isArray(window.__NOTION_PAGES__))
            ? window.__NOTION_PAGES__
            : (editor?.storage?.pageMention?.pages || []);

        const cleanTargetId = String(pageId).trim();
        const found = pool.find((p) => String(p._id?.$oid || p._id || p.id || '').trim() === cleanTargetId);

        return {
            title: found?.title || (title && title !== 'Untitled' ? title : 'Untitled'),
            icon: found?.icon !== undefined ? found.icon : icon,
        };
    });

    useEffect(() => {
        isMountedRef.current = true;

        const handlePagesUpdated = (e) => {
            if (!isMountedRef.current || !Array.isArray(e.detail) || !pageId) return;

            const cleanTargetId = String(pageId).trim();
            const found = e.detail.find((p) => String(p._id?.$oid || p._id || p.id || '').trim() === cleanTargetId);

            if (found) {
                setPageInfo({
                    title: found.title || 'Untitled',
                    icon: found.icon,
                });
            }
        };

        window.addEventListener('notion:pages-updated', handlePagesUpdated);

        return () => {
            isMountedRef.current = false;
            window.removeEventListener('notion:pages-updated', handlePagesUpdated);
        };
    }, [pageId]);

    const displayTitle = pageInfo.title || title || 'Untitled';
    const displayIcon = pageInfo.icon !== undefined ? pageInfo.icon : icon;

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
                className="page-mention-pill inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-gray-100/90 hover:bg-gray-200/90 dark:bg-[#2F2F2F] dark:hover:bg-[#383838] text-slate-800 dark:text-[#EBEBEB] font-medium text-xs border border-gray-200/70 dark:border-[#3a3a3a] transition-colors cursor-pointer select-none"
            >
                <span className="shrink-0 flex items-center justify-center text-[13px] leading-none">
                    {renderIcon()}
                </span>
                <span className="underline underline-offset-2 decoration-gray-300 dark:decoration-gray-600 hover:decoration-slate-800 dark:hover:decoration-slate-200 truncate max-w-[200px]">
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

                    const rawIcon = element.getAttribute('data-page-icon');
                    let parsedIcon = null;
                    if (rawIcon) {
                        try {
                            parsedIcon = JSON.parse(decodeURIComponent(rawIcon));
                        } catch {
                            try {
                                parsedIcon = JSON.parse(rawIcon);
                            } catch {
                                parsedIcon = rawIcon;
                            }
                        }
                    }

                    return {
                        pageId,
                        title: element.getAttribute('data-page-title') || 'Untitled',
                        icon: parsedIcon,
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