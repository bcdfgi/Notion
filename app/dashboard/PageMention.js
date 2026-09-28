'use client';
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useEffect, useState } from 'react';
import PageIcon from './PageIcon';
import { FileText } from 'lucide-react';
import { getPageById } from '../actions';

const PageMentionComponent = ({ node }) => {
    const rawPageId = node.attrs.pageId;
    const targetId = String(rawPageId?.$oid || rawPageId || '');
    const initialTitle = node.attrs.title;
    const initialIcon = node.attrs.icon;

    const [title, setTitle] = useState(() => {
        if (initialTitle && initialTitle !== 'Untitled') return initialTitle;
        if (typeof window !== 'undefined' && Array.isArray(window.__NOTION_PAGES__)) {
            const found = window.__NOTION_PAGES__.find(p => String(p._id) === targetId);
            if (found && found.title) return found.title;
        }
        return initialTitle || 'Untitled';
    });

    const [icon, setIcon] = useState(() => {
        if (initialIcon) return initialIcon;
        if (typeof window !== 'undefined' && Array.isArray(window.__NOTION_PAGES__)) {
            const found = window.__NOTION_PAGES__.find(p => String(p._id) === targetId);
            if (found) return found.icon;
        }
        return null;
    });

    useEffect(() => {
        if (!targetId) return;

        let isSubscribed = true;

        // 1. Try resolving from workspace cache
        const checkCache = () => {
            if (typeof window !== 'undefined' && Array.isArray(window.__NOTION_PAGES__)) {
                const found = window.__NOTION_PAGES__.find(p => String(p._id) === targetId);
                if (found && found.title) {
                    setTitle(found.title);
                    setIcon(found.icon || null);
                    return true;
                }
            }
            return false;
        };

        if (checkCache()) return;

        // 2. Fallback: Query the database directly for this page
        getPageById(targetId).then((res) => {
            if (isSubscribed && res && res.title) {
                setTitle(res.title);
                setIcon(res.icon || null);
            }
        });

        const handleUpdate = (e) => {
            const list = e.detail;
            if (Array.isArray(list)) {
                const found = list.find(p => String(p._id) === targetId);
                if (found && found.title && isSubscribed) {
                    setTitle(found.title);
                    setIcon(found.icon || null);
                }
            }
        };

        window.addEventListener('notion:pages-updated', handleUpdate);
        return () => {
            isSubscribed = false;
            window.removeEventListener('notion:pages-updated', handleUpdate);
        };
    }, [targetId]);

    return (
        <NodeViewWrapper as="span" className="inline-block align-baseline mx-0.5">
            <span
                data-page-id={targetId}
                contentEditable={false}
                className="page-mention-pill inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200/80 text-stone-800 font-medium text-xs border border-stone-200/60 transition-colors cursor-pointer select-none"
            >
                <span className="shrink-0 flex items-center justify-center text-[13px] leading-none">
                    {icon ? (
                        <PageIcon icon={icon} size={14} />
                    ) : (
                        <FileText size={14} className="text-stone-400" />
                    )}
                </span>
                <span className="underline underline-offset-2 decoration-stone-300 hover:decoration-stone-800 truncate max-w-[200px]">
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
    atom: true,

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
                        return JSON.parse(raw);
                    } catch {
                        return raw;
                    }
                },
                renderHTML: (attributes) => ({
                    'data-page-icon':
                        typeof attributes.icon === 'object' && attributes.icon !== null
                            ? JSON.stringify(attributes.icon)
                            : attributes.icon,
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