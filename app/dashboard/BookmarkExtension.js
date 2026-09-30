'use client';
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useState, useRef, useEffect } from 'react';
import { Bookmark, MoreHorizontal, Trash2, ExternalLink, Copy, RefreshCw } from 'lucide-react';

const BookmarkBlockComponent = (props) => {
    const { node, updateAttributes, deleteNode } = props;
    const { url, title, description, image, favicon } = node.attrs;

    const [showPopover, setShowPopover] = useState(!url);
    const [inputUrl, setInputUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const popoverRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-focus input when popover opens
    useEffect(() => {
        if (showPopover) {
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [showPopover]);

    // Handle clicks outside popover and context menu
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(e.target) &&
                !e.target.closest('.bookmark-placeholder-row')
            ) {
                if (url) setShowPopover(false);
            }
            if (!e.target.closest('.bookmark-action-menu') && !e.target.closest('.bookmark-menu-btn')) {
                setShowMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [url]);

    const handleCreateBookmark = async (e) => {
        e?.preventDefault();
        let targetUrl = inputUrl.trim();
        if (!targetUrl) return;

        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
            targetUrl = `https://${targetUrl}`;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/oembed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: targetUrl }),
            });
            const data = await res.json();

            updateAttributes({
                url: targetUrl,
                title: data?.title || targetUrl,
                description: data?.description || '',
                image: data?.image || '',
                favicon: data?.favicon || '',
            });
        } catch {
            updateAttributes({
                url: targetUrl,
                title: targetUrl,
                description: '',
                image: '',
                favicon: '',
            });
        } finally {
            setLoading(false);
            setShowPopover(false);
            setInputUrl('');
        }
    };

    // --- RENDER 1: VISUAL BOOKMARK CARD ---
    if (url) {
        let domain = '';
        try {
            domain = new URL(url).hostname;
        } catch {
            domain = url;
        }

        return (
            <NodeViewWrapper className="my-3 not-prose select-none relative group/bookmark">
                <div className="relative flex items-stretch justify-between w-full max-w-3xl rounded-md border border-neutral-200/80 bg-white hover:bg-neutral-50/60 transition-colors overflow-hidden shadow-xs">
                    {/* Left text & metadata */}
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex flex-col justify-between p-3.5 min-w-0 pr-4"
                    >
                        <div className="space-y-1 overflow-hidden">
                            <h4 className="text-sm font-medium text-slate-800 truncate">
                                {title || url}
                            </h4>
                            {description && (
                                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                    {description}
                                </p>
                            )}
                        </div>

                        {/* Favicon & domain */}
                        <div className="flex items-center gap-1.5 pt-2 text-[11px] text-slate-400 truncate">
                            {favicon ? (
                                <img src={favicon} alt="" className="w-3.5 h-3.5 rounded-xs shrink-0" />
                            ) : (
                                <Bookmark size={12} className="shrink-0 text-slate-400" />
                            )}
                            <span className="truncate">{domain}</span>
                        </div>
                    </a>

                    {/* Right preview thumbnail image */}
                    {image && (
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-48 sm:w-56 shrink-0 relative bg-neutral-100 border-l border-neutral-200/60 overflow-hidden block"
                        >
                            <img
                                src={image}
                                alt="Preview"
                                className="w-full h-full object-cover select-none pointer-events-none"
                            />
                        </a>
                    )}

                    {/* Top right floating options button */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover/bookmark:opacity-100 transition-opacity z-20">
                        <button
                            type="button"
                            contentEditable={false}
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu((prev) => !prev);
                            }}
                            className="bookmark-menu-btn p-1 bg-white/90 hover:bg-white text-gray-700 rounded-md shadow-sm border border-gray-200 transition-colors backdrop-blur-xs"
                            title="Bookmark options"
                        >
                            <MoreHorizontal size={15} />
                        </button>
                    </div>

                    {/* Context menu */}
                    {showMenu && (
                        <div
                            contentEditable={false}
                            className="bookmark-action-menu absolute right-2 top-9 w-44 bg-white rounded-xl shadow-2xl border border-gray-200 p-1.5 z-30 text-slate-700 animate-in fade-in zoom-in-95 duration-75 select-none"
                        >
                            <button
                                type="button"
                                onClick={() => {
                                    setShowMenu(false);
                                    setInputUrl(url);
                                    setShowPopover(true);
                                }}
                                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded hover:bg-gray-100 transition-colors"
                            >
                                <RefreshCw size={13} className="text-gray-500" />
                                <span>Change link</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    navigator.clipboard.writeText(url);
                                    setShowMenu(false);
                                }}
                                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded hover:bg-gray-100 transition-colors"
                            >
                                <Copy size={13} className="text-gray-500" />
                                <span>Copy link</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    window.open(url, '_blank', 'noopener,noreferrer');
                                    setShowMenu(false);
                                }}
                                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded hover:bg-gray-100 transition-colors"
                            >
                                <ExternalLink size={13} className="text-gray-500" />
                                <span>Open in new tab</span>
                            </button>

                            <div className="h-px bg-gray-100 my-1" />

                            <button
                                type="button"
                                onClick={deleteNode}
                                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-red-600 rounded hover:bg-red-50 transition-colors"
                            >
                                <Trash2 size={13} />
                                <span>Delete</span>
                            </button>
                        </div>
                    )}
                </div>
            </NodeViewWrapper>
        );
    }

    // --- RENDER 2: EMPTY PLACEHOLDER WITH POPUP (Notion style) ---
    return (
        <NodeViewWrapper className="my-2.5 not-prose select-none relative">
            {/* The grey banner placeholder */}
            <div
                onClick={() => setShowPopover(true)}
                className="bookmark-placeholder-row w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-md bg-[#F7F6F5] hover:bg-[#EFEFEF] text-slate-500 hover:text-slate-700 cursor-pointer transition-colors"
            >
                <Bookmark size={16} className="text-gray-400 shrink-0" />
                <span className="text-xs font-normal text-slate-600">Add a web bookmark</span>
            </div>

            {/* Notion floating popup */}
            {showPopover && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-transparent"
                        onClick={() => setShowPopover(false)}
                    />
                    <div
                        ref={popoverRef}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute left-6 top-full mt-1.5 w-76 bg-white rounded-xl shadow-2xl border border-gray-200/90 p-3 z-50 animate-in fade-in zoom-in-95 duration-100 select-none"
                    >
                        <form onSubmit={handleCreateBookmark} className="space-y-2.5">
                            {/* Blue focused border text input */}
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputUrl}
                                onChange={(e) => setInputUrl(e.target.value)}
                                placeholder="Paste in https://..."
                                disabled={loading}
                                className="w-full px-2.5 py-1.5 text-xs text-slate-800 placeholder-gray-400 bg-white border border-blue-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs disabled:opacity-50"
                            />

                            {/* Solid Blue Button */}
                            <button
                                type="submit"
                                disabled={!inputUrl.trim() || loading}
                                className="w-full py-1.5 px-3 bg-[#2383E2] hover:bg-[#1a70c5] disabled:opacity-50 text-white text-xs font-medium rounded-lg shadow-sm transition-colors text-center"
                            >
                                {loading ? 'Fetching bookmark...' : 'Create bookmark'}
                            </button>
                        </form>

                        {/* Helper caption text */}
                        <p className="mt-2 text-center text-[11px] text-gray-400 select-none">
                            Create a visual bookmark from a link.
                        </p>
                    </div>
                </>
            )}
        </NodeViewWrapper>
    );
};

export const BookmarkExtension = Node.create({
    name: 'bookmarkBlock',
    group: 'block',
    atom: true,

    addAttributes() {
        return {
            url: { default: null },
            title: { default: '' },
            description: { default: '' },
            image: { default: '' },
            favicon: { default: '' },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="bookmark-block"]',
                getAttrs: (dom) => ({
                    url: dom.getAttribute('data-url') || null,
                    title: dom.getAttribute('data-title') || '',
                    description: dom.getAttribute('data-description') || '',
                    image: dom.getAttribute('data-image') || '',
                    favicon: dom.getAttribute('data-favicon') || '',
                }),
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes(HTMLAttributes, {
                'data-type': 'bookmark-block',
                'data-url': HTMLAttributes.url || '',
                'data-title': HTMLAttributes.title || '',
                'data-description': HTMLAttributes.description || '',
                'data-image': HTMLAttributes.image || '',
                'data-favicon': HTMLAttributes.favicon || '',
            }),
        ];
    },
    addNodeView() {
        return ReactNodeViewRenderer(BookmarkBlockComponent);
    },
});