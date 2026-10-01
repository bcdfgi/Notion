import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useState, useEffect, useRef } from 'react';
import {
    Maximize2,
    MoreHorizontal,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Type,
    RefreshCw,
    Copy,
    Trash2,
    CopyPlus,
    X
} from 'lucide-react';

export function getEmbedDetails(url) {
    if (!url) return null;

    if (url.includes('<iframe') && url.includes('src=')) {
        const srcMatch = url.match(/src=["']([^"']+)["']/);
        if (srcMatch) url = srcMatch[1];
    }

    if (
        url.includes('google.com/maps') ||
        url.includes('maps.google.com') ||
        url.includes('maps.app.goo.gl') ||
        url.includes('goo.gl/maps')
    ) {
        if (url.includes('/maps/embed') || url.includes('output=embed')) {
            return {
                type: 'maps',
                src: url,
                title: 'Google Map',
                originalUrl: url,
            };
        }

        let searchQuery = '';
        const atCoordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        const dataCoordMatch = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
        const placeMatch = url.match(/\/place\/([^/@?]+)/);
        const qParamMatch = url.match(/[?&]q=([^&]+)/);

        if (placeMatch) {
            searchQuery = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
        } else if (qParamMatch) {
            searchQuery = decodeURIComponent(qParamMatch[1].replace(/\+/g, ' '));
        } else if (dataCoordMatch) {
            searchQuery = `${dataCoordMatch[1]},${dataCoordMatch[2]}`;
        } else if (atCoordMatch) {
            searchQuery = `${atCoordMatch[1]},${atCoordMatch[2]}`;
        } else {
            searchQuery = url;
        }

        const embedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(searchQuery)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

        return {
            type: 'maps',
            src: embedSrc,
            title: searchQuery || 'Google Map',
            originalUrl: url,
        };
    }

    if (url.includes('figma.com/file/') || url.includes('figma.com/design/') || url.includes('figma.com/proto/')) {
        const figmaFileMatch = url.match(/figma\.com\/(?:file|design)\/[a-zA-Z0-9]+\/([^/?]+)/);
        const title = figmaFileMatch
            ? decodeURIComponent(figmaFileMatch[1].replace(/[-_]/g, ' '))
            : 'Figma Design';

        return {
            type: 'figma',
            src: `https://www.figma.com/embed?embed_host=notion&url=${encodeURIComponent(url)}`,
            title: title,
            originalUrl: url,
        };
    }

    const spotifyMatch = url.match(/spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/);
    if (spotifyMatch) {
        return { type: 'iframe', src: `https://open.spotify.com/embed/${spotifyMatch[1]}/${spotifyMatch[2]}`, defaultHeight: 152 };
    }

    const loomMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
    if (loomMatch) {
        return { type: 'iframe', src: `https://www.loom.com/embed/${loomMatch[1]}`, defaultHeight: 360 };
    }

    return { type: 'bookmark' };
}

const EmbedComponent = ({ node, updateAttributes, deleteNode, editor, getPos }) => {
    const { src, embedType, width = 100, height = 420, align = 'center', caption = '' } = node.attrs;
    const [inputUrl, setInputUrl] = useState('');
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Notion Action Bars & Menus
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [showAlignSubmenu, setShowAlignSubmenu] = useState(false);
    const [actionSearch, setActionSearch] = useState('');
    const [isReplacing, setIsReplacing] = useState(false);
    const [showCaptionInput, setShowCaptionInput] = useState(Boolean(caption));
    const [isFullScreen, setIsFullScreen] = useState(false);

    const inputRef = useRef(null);
    const menuRef = useRef(null);
    const wrapperRef = useRef(null);
    const dragInfo = useRef({
        startX: 0,
        startY: 0,
        startW: 100,
        startH: 420,
        parentWidth: 1,
        handle: null,
    });

    const embedInfo = getEmbedDetails(src);

    useEffect(() => {
        if (!src && inputRef.current) {
            inputRef.current.focus();
        }
    }, [src]);

    useEffect(() => {
        if (src && embedInfo?.type === 'bookmark') {
            setLoading(true);
            fetch('/api/oembed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: src }),
            })
                .then((res) => res.json())
                .then((data) => {
                    setMeta(data);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [src, embedInfo?.type]);

    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMoreMenu(false);
                setShowAlignSubmenu(false);
            }
        };
        if (showMoreMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showMoreMenu]);

    // Live Resizing Handler
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!dragInfo.current.handle) return;
            const { startX, startY, startW, startH, parentWidth, handle } = dragInfo.current;

            if (handle === 'bottom') {
                const dy = e.clientY - startY;
                const nextHeight = Math.max(160, Math.min(1000, Math.round(startH + dy)));
                updateAttributes({ height: nextHeight });
            } else if (handle === 'right') {
                const dx = e.clientX - startX;
                const deltaPct = (dx / parentWidth) * 100;
                const nextWidth = Math.max(25, Math.min(100, Math.round(startW + deltaPct)));
                updateAttributes({ width: nextWidth });
            } else if (handle === 'left') {
                const dx = startX - e.clientX;
                const deltaPct = (dx / parentWidth) * 100;
                const nextWidth = Math.max(25, Math.min(100, Math.round(startW + deltaPct)));
                updateAttributes({ width: nextWidth });
            }
        };

        const handleMouseUp = () => {
            if (dragInfo.current.handle) {
                dragInfo.current.handle = null;
                setIsDragging(false);
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [updateAttributes]);

    const startResize = (e, handle) => {
        e.preventDefault();
        e.stopPropagation();

        const parentEl = wrapperRef.current?.parentElement || document.body;
        const parentWidth = parentEl.getBoundingClientRect().width || 800;

        dragInfo.current = {
            startX: e.clientX,
            startY: e.clientY,
            startW: Number(width) || 100,
            startH: Number(height) || 420,
            parentWidth,
            handle,
        };

        setIsDragging(true);
        document.body.style.cursor = handle === 'bottom' ? 'ns-resize' : 'ew-resize';
        document.body.style.userSelect = 'none';
    };

    const handleEmbedSubmit = async (e) => {
        e?.preventDefault();
        let trimmed = inputUrl.trim();
        if (!trimmed) return;

        if (trimmed.includes('<iframe') && trimmed.includes('src=')) {
            const srcMatch = trimmed.match(/src=["']([^"']+)["']/);
            if (srcMatch) trimmed = srcMatch[1];
        }

        if (trimmed.includes('maps.app.goo.gl') || trimmed.includes('goo.gl/maps')) {
            setLoading(true);
            try {
                const res = await fetch('/api/unshorten', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: trimmed }),
                });
                const data = await res.json();
                if (data?.expandedUrl) {
                    trimmed = data.expandedUrl;
                }
            } catch (err) {
                console.error('Error unshortening URL:', err);
            } finally {
                setLoading(false);
            }
        }

        updateAttributes({ src: trimmed });
        setIsReplacing(false);
    };

    const handleDuplicate = () => {
        if (!editor || typeof getPos !== 'function') return;
        const pos = getPos();
        editor.chain().insertContentAt(pos + node.nodeSize, node.toJSON()).focus().run();
        setShowMoreMenu(false);
    };

    const handleCopyOriginalLink = () => {
        const link = embedInfo?.originalUrl || src;
        if (link) {
            navigator.clipboard.writeText(link);
        }
        setShowMoreMenu(false);
    };

    // Filter menu options based on search input
    const menuActions = [
        {
            id: 'replace',
            label: 'Replace',
            icon: <RefreshCw size={15} />,
            action: () => {
                setIsReplacing(true);
                setShowMoreMenu(false);
            },
        },
        {
            id: 'caption',
            label: 'Caption',
            shortcut: '⌥⌘M',
            icon: <Type size={15} />,
            action: () => {
                setShowCaptionInput((prev) => !prev);
                setShowMoreMenu(false);
            },
        },
        {
            id: 'align',
            label: 'Align',
            icon: <AlignCenter size={15} />,
            hasSubmenu: true,
            action: () => setShowAlignSubmenu((prev) => !prev),
        },
        {
            id: 'fullscreen',
            label: 'Full screen',
            shortcut: 'Space',
            icon: <Maximize2 size={15} />,
            action: () => {
                setIsFullScreen(true);
                setShowMoreMenu(false);
            },
        },
        {
            id: 'copy-link',
            label: 'Copy link to original',
            icon: <Copy size={15} />,
            action: handleCopyOriginalLink,
        },
        {
            id: 'duplicate',
            label: 'Duplicate',
            shortcut: '⌘D',
            icon: <CopyPlus size={15} />,
            action: handleDuplicate,
        },
        {
            id: 'delete',
            label: 'Delete',
            shortcut: 'Del',
            icon: <Trash2 size={15} />,
            danger: true,
            action: () => {
                deleteNode();
                setShowMoreMenu(false);
            },
        },
    ];

    const filteredActions = menuActions.filter((item) =>
        item.label.toLowerCase().includes(actionSearch.toLowerCase())
    );

    if (!src || isReplacing) {
        return (
            <NodeViewWrapper className="my-4 not-prose w-full">
                <div className="relative max-w-sm rounded-2xl border border-gray-200/80 bg-white p-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all">
                    <button
                        type="button"
                        onClick={() => {
                            if (isReplacing) setIsReplacing(false);
                            else deleteNode();
                        }}
                        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xs"
                    >
                        ✕
                    </button>

                    <form onSubmit={handleEmbedSubmit} className="space-y-3 pt-1">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputUrl}
                            onChange={(e) => setInputUrl(e.target.value)}
                            placeholder="Paste Google Maps link or embed code..."
                            disabled={loading}
                            className="w-full px-3.5 py-2 text-sm text-slate-800 placeholder-gray-400 bg-white border border-blue-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                        />

                        <button
                            type="submit"
                            disabled={!inputUrl.trim() || loading}
                            className="w-full py-2.5 px-4 bg-[#3B82F6] hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium rounded-xl shadow-sm transition-all active:scale-[0.99]"
                        >
                            {loading ? 'Resolving link...' : isReplacing ? 'Replace Map' : 'Embed Map'}
                        </button>
                    </form>
                </div>
            </NodeViewWrapper>
        );
    }

    const alignmentClasses =
        align === 'left' ? 'mr-auto' : align === 'right' ? 'ml-auto' : 'mx-auto';

    return (
        <NodeViewWrapper className="my-4 not-prose w-full block clear-both">
            {isDragging && <div className="fixed inset-0 z-[9999] bg-transparent pointer-events-auto" />}

            {/* FULLSCREEN MODAL */}
            {isFullScreen && (
                <div className="fixed inset-0 z-[100] bg-black/80 flex flex-col p-6 backdrop-blur-sm animate-in fade-in duration-150">
                    <div className="flex justify-between items-center text-white pb-3">
                        <span className="font-semibold text-sm">{embedInfo?.title || 'Google Maps Preview'}</span>
                        <button
                            onClick={() => setIsFullScreen(false)}
                            className="p-1 hover:bg-white/20 rounded-lg text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div className="flex-1 rounded-xl overflow-hidden bg-white shadow-2xl">
                        <iframe src={embedInfo.src} className="w-full h-full border-0" allowFullScreen />
                    </div>
                </div>
            )}

            <div
                ref={wrapperRef}
                style={{ width: `${width}%` }}
                className={`relative group transition-[width] duration-75 max-w-full ${alignmentClasses}`}
            >
                {/* --- NOTION FLOATING ACTION BAR (Top Right of Map) --- */}
                <div className="absolute top-2.5 right-2.5 z-30 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 backdrop-blur-sm shadow-md border border-gray-200/80 rounded-lg flex items-center p-0.5 gap-0.5 select-none">
                    {/* Caption Toggle */}
                    <button
                        type="button"
                        onClick={() => setShowCaptionInput((prev) => !prev)}
                        className={`p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-slate-800 transition-colors ${
                            showCaptionInput ? 'bg-gray-100 text-blue-600' : ''
                        }`}
                        title="Caption (⌥⌘M)"
                    >
                        <Type size={15} />
                    </button>

                    {/* Alignment Quick Cycle */}
                    <button
                        type="button"
                        onClick={() => {
                            const nextAlign = align === 'center' ? 'left' : align === 'left' ? 'right' : 'center';
                            updateAttributes({ align: nextAlign });
                        }}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-slate-800 transition-colors"
                        title={`Align: ${align}`}
                    >
                        {align === 'left' ? <AlignLeft size={15} /> : align === 'right' ? <AlignRight size={15} /> : <AlignCenter size={15} />}
                    </button>

                    {/* Full Screen */}
                    <button
                        type="button"
                        onClick={() => setIsFullScreen(true)}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-slate-800 transition-colors"
                        title="Full screen (Space)"
                    >
                        <Maximize2 size={15} />
                    </button>

                    {/* More Menu (...) with Notion-like Tooltip */}
                    <div className="relative group/more">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMoreMenu((prev) => !prev);
                                setShowAlignSubmenu(false);
                            }}
                            className={`p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-slate-800 transition-colors ${
                                showMoreMenu ? 'bg-gray-100 text-slate-900' : ''
                            }`}
                        >
                            <MoreHorizontal size={15} />
                        </button>

                        <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover/more:block z-50 whitespace-nowrap rounded bg-stone-900 px-2 py-0.5 text-[11px] font-medium text-white shadow-md">
                            More
                        </div>
                    </div>
                </div>

                {/* --- NOTION MORE DROPDOWN MENU --- */}
                {showMoreMenu && (
                    <div
                        ref={menuRef}
                        className="absolute right-2 top-11 z-40 w-64 bg-white rounded-xl shadow-2xl border border-gray-200/90 py-1.5 text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-100"
                    >
                        {/* Search actions input */}
                        <div className="px-2 pt-1 pb-1.5 border-b border-gray-100">
                            <input
                                type="text"
                                value={actionSearch}
                                onChange={(e) => setActionSearch(e.target.value)}
                                placeholder="Search actions..."
                                autoFocus
                                className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded-md text-xs placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                            />
                        </div>

                        <div className="px-3 pt-2 pb-1 text-[11px] font-medium text-gray-400">
                            Google Maps
                        </div>

                        <div className="py-1">
                            {filteredActions.map((item) => (
                                <div key={item.id} className="relative">
                                    <button
                                        type="button"
                                        onClick={item.action}
                                        className={`w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition-colors text-left ${
                                            item.danger ? 'text-red-600 hover:bg-red-50' : 'text-slate-700'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span className={item.danger ? 'text-red-500' : 'text-gray-500'}>
                                                {item.icon}
                                            </span>
                                            <span className="font-medium text-[13px]">{item.label}</span>
                                        </div>

                                        {item.shortcut && (
                                            <span className="text-[10px] text-gray-400 font-sans tracking-wide">
                                                {item.shortcut}
                                            </span>
                                        )}

                                        {item.hasSubmenu && (
                                            <span className="text-gray-400 text-[10px]">›</span>
                                        )}
                                    </button>

                                    {/* Inline Alignment Flyout Submenu */}
                                    {item.id === 'align' && showAlignSubmenu && (
                                        <div className="bg-gray-50 border-y border-gray-100 px-3 py-1 flex items-center justify-around my-0.5">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    updateAttributes({ align: 'left' });
                                                    setShowAlignSubmenu(false);
                                                    setShowMoreMenu(false);
                                                }}
                                                className={`p-1.5 rounded hover:bg-white flex items-center gap-1 text-xs ${
                                                    align === 'left' ? 'text-blue-600 font-semibold' : 'text-gray-600'
                                                }`}
                                            >
                                                <AlignLeft size={14} /> Left
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    updateAttributes({ align: 'center' });
                                                    setShowAlignSubmenu(false);
                                                    setShowMoreMenu(false);
                                                }}
                                                className={`p-1.5 rounded hover:bg-white flex items-center gap-1 text-xs ${
                                                    align === 'center' ? 'text-blue-600 font-semibold' : 'text-gray-600'
                                                }`}
                                            >
                                                <AlignCenter size={14} /> Center
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    updateAttributes({ align: 'right' });
                                                    setShowAlignSubmenu(false);
                                                    setShowMoreMenu(false);
                                                }}
                                                className={`p-1.5 rounded hover:bg-white flex items-center gap-1 text-xs ${
                                                    align === 'right' ? 'text-blue-600 font-semibold' : 'text-gray-600'
                                                }`}
                                            >
                                                <AlignRight size={14} /> Right
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- GOOGLE MAP EMBED CONTAINER --- */}
                {embedInfo?.type === 'maps' && (
                    <div
                        className="relative rounded-xl border border-gray-200/90 shadow-sm bg-white overflow-hidden"
                        style={{ height: `${height}px` }}
                    >
                        <iframe
                            src={embedInfo.src}
                            className={`w-full h-full border-0 ${isDragging ? 'pointer-events-none' : 'pointer-events-auto'}`}
                            allowFullScreen
                            loading="lazy"
                        />
                    </div>
                )}

                {/* --- EDITABLE CAPTION (Notion-style) --- */}
                {showCaptionInput && (
                    <div className="mt-1.5 text-center">
                        <input
                            type="text"
                            value={caption}
                            onChange={(e) => updateAttributes({ caption: e.target.value })}
                            placeholder="Write a caption..."
                            className="w-full text-center text-xs text-gray-500 placeholder-gray-300 bg-transparent border-0 focus:outline-none focus:placeholder-gray-400 py-0.5"
                        />
                    </div>
                )}

                {/* --- NOTION-STYLE RESIZE HANDLES --- */}
                {embedInfo?.type === 'maps' && (
                    <>
                        {/* Left edge handle */}
                        <div
                            onMouseDown={(e) => startResize(e, 'left')}
                            className={`absolute -left-2.5 top-0 bottom-0 w-5 flex items-center justify-center cursor-ew-resize z-20 transition-opacity ${
                                isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}
                        >
                            <div className="w-1.5 h-12 bg-gray-400/80 hover:bg-blue-500 rounded-full shadow transition-colors" />
                        </div>

                        {/* Right edge handle */}import { Node, mergeAttributes } from '@tiptap/core';
                        import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
                        import React, { useState, useEffect, useRef } from 'react';
                        import {
                            Maximize2,
                            MoreHorizontal,
                            AlignLeft,
                            AlignCenter,
                            AlignRight,
                            Type,
                            RefreshCw,
                            Copy,
                            Trash2,
                            CopyPlus,
                            X
                        } from 'lucide-react';

                        export function getEmbedDetails(url) {
                            if (!url) return null;

                            if (url.includes('<iframe') && url.includes('src=')) {
                            const srcMatch = url.match(/src=["']([^"']+)["']/);
                            if (srcMatch) url = srcMatch[1];
                        }

                            if (
                            url.includes('google.com/maps') ||
                            url.includes('maps.google.com') ||
                            url.includes('maps.app.goo.gl') ||
                            url.includes('goo.gl/maps')
                            ) {
                            if (url.includes('/maps/embed') || url.includes('output=embed')) {
                            return {
                            type: 'maps',
                            src: url,
                            title: 'Google Map',
                            originalUrl: url,
                        };
                        }

                            let searchQuery = '';
                            const atCoordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
                            const dataCoordMatch = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
                            const placeMatch = url.match(/\/place\/([^/@?]+)/);
                            const qParamMatch = url.match(/[?&]q=([^&]+)/);

                            if (placeMatch) {
                            searchQuery = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
                        } else if (qParamMatch) {
                            searchQuery = decodeURIComponent(qParamMatch[1].replace(/\+/g, ' '));
                        } else if (dataCoordMatch) {
                            searchQuery = `${dataCoordMatch[1]},${dataCoordMatch[2]}`;
                        } else if (atCoordMatch) {
                            searchQuery = `${atCoordMatch[1]},${atCoordMatch[2]}`;
                        } else {
                            searchQuery = url;
                        }

                            const embedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(searchQuery)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

                            return {
                            type: 'maps',
                            src: embedSrc,
                            title: searchQuery || 'Google Map',
                            originalUrl: url,
                        };
                        }

                            if (url.includes('figma.com/file/') || url.includes('figma.com/design/') || url.includes('figma.com/proto/')) {
                            const figmaFileMatch = url.match(/figma\.com\/(?:file|design)\/[a-zA-Z0-9]+\/([^/?]+)/);
                            const title = figmaFileMatch
                            ? decodeURIComponent(figmaFileMatch[1].replace(/[-_]/g, ' '))
                            : 'Figma Design';

                            return {
                            type: 'figma',
                            src: `https://www.figma.com/embed?embed_host=notion&url=${encodeURIComponent(url)}`,
                            title: title,
                            originalUrl: url,
                        };
                        }

                            const spotifyMatch = url.match(/spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/);
                            if (spotifyMatch) {
                            return { type: 'iframe', src: `https://open.spotify.com/embed/${spotifyMatch[1]}/${spotifyMatch[2]}`, defaultHeight: 152 };
                        }

                            const loomMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
                            if (loomMatch) {
                            return { type: 'iframe', src: `https://www.loom.com/embed/${loomMatch[1]}`, defaultHeight: 360 };
                        }

                            return { type: 'bookmark' };
                        }

                        const EmbedComponent = ({ node, updateAttributes, deleteNode, editor, getPos }) => {
                            const { src, embedType, width = 100, height = 420, align = 'center', caption = '' } = node.attrs;
                            const [inputUrl, setInputUrl] = useState('');
                            const [meta, setMeta] = useState(null);
                            const [loading, setLoading] = useState(false);
                            const [isDragging, setIsDragging] = useState(false);

                            // Notion Action Bars & Menus
                            const [showMoreMenu, setShowMoreMenu] = useState(false);
                            const [showAlignSubmenu, setShowAlignSubmenu] = useState(false);
                            const [actionSearch, setActionSearch] = useState('');
                            const [isReplacing, setIsReplacing] = useState(false);
                            const [showCaptionInput, setShowCaptionInput] = useState(Boolean(caption));
                            const [isFullScreen, setIsFullScreen] = useState(false);

                            const inputRef = useRef(null);
                            const menuRef = useRef(null);
                            const wrapperRef = useRef(null);
                            const dragInfo = useRef({
                            startX: 0,
                            startY: 0,
                            startW: 100,
                            startH: 420,
                            parentWidth: 1,
                            handle: null,
                        });

                            const embedInfo = getEmbedDetails(src);

                            useEffect(() => {
                            if (!src && inputRef.current) {
                            inputRef.current.focus();
                        }
                        }, [src]);

                            useEffect(() => {
                            if (src && embedInfo?.type === 'bookmark') {
                            setLoading(true);
                            fetch('/api/oembed', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ url: src }),
                        })
                            .then((res) => res.json())
                            .then((data) => {
                            setMeta(data);
                            setLoading(false);
                        })
                            .catch(() => setLoading(false));
                        }
                        }, [src, embedInfo?.type]);

                            // Close menu on outside click
                            useEffect(() => {
                            const handleClickOutside = (e) => {
                            if (menuRef.current && !menuRef.current.contains(e.target)) {
                            setShowMoreMenu(false);
                            setShowAlignSubmenu(false);
                        }
                        };
                            if (showMoreMenu) {
                            document.addEventListener('mousedown', handleClickOutside);
                        }
                            return () => document.removeEventListener('mousedown', handleClickOutside);
                        }, [showMoreMenu]);

                            // Live Resizing Handler
                            useEffect(() => {
                            const handleMouseMove = (e) => {
                            if (!dragInfo.current.handle) return;
                            const { startX, startY, startW, startH, parentWidth, handle } = dragInfo.current;

                            if (handle === 'bottom') {
                            const dy = e.clientY - startY;
                            const nextHeight = Math.max(160, Math.min(1000, Math.round(startH + dy)));
                            updateAttributes({ height: nextHeight });
                        } else if (handle === 'right') {
                            const dx = e.clientX - startX;
                            const deltaPct = (dx / parentWidth) * 100;
                            const nextWidth = Math.max(25, Math.min(100, Math.round(startW + deltaPct)));
                            updateAttributes({ width: nextWidth });
                        } else if (handle === 'left') {
                            const dx = startX - e.clientX;
                            const deltaPct = (dx / parentWidth) * 100;
                            const nextWidth = Math.max(25, Math.min(100, Math.round(startW + deltaPct)));
                            updateAttributes({ width: nextWidth });
                        }
                        };

                            const handleMouseUp = () => {
                            if (dragInfo.current.handle) {
                            dragInfo.current.handle = null;
                            setIsDragging(false);
                            document.body.style.cursor = '';
                            document.body.style.userSelect = '';
                        }
                        };

                            window.addEventListener('mousemove', handleMouseMove);
                            window.addEventListener('mouseup', handleMouseUp);

                            return () => {
                            window.removeEventListener('mousemove', handleMouseMove);
                            window.removeEventListener('mouseup', handleMouseUp);
                        };
                        }, [updateAttributes]);

                            const startResize = (e, handle) => {
                            e.preventDefault();
                            e.stopPropagation();

                            const parentEl = wrapperRef.current?.parentElement || document.body;
                            const parentWidth = parentEl.getBoundingClientRect().width || 800;

                            dragInfo.current = {
                            startX: e.clientX,
                            startY: e.clientY,
                            startW: Number(width) || 100,
                            startH: Number(height) || 420,
                            parentWidth,
                            handle,
                        };

                            setIsDragging(true);
                            document.body.style.cursor = handle === 'bottom' ? 'ns-resize' : 'ew-resize';
                            document.body.style.userSelect = 'none';
                        };

                            const handleEmbedSubmit = async (e) => {
                            e?.preventDefault();
                            let trimmed = inputUrl.trim();
                            if (!trimmed) return;

                            if (trimmed.includes('<iframe') && trimmed.includes('src=')) {
                            const srcMatch = trimmed.match(/src=["']([^"']+)["']/);
                            if (srcMatch) trimmed = srcMatch[1];
                        }

                            if (trimmed.includes('maps.app.goo.gl') || trimmed.includes('goo.gl/maps')) {
                            setLoading(true);
                            try {
                            const res = await fetch('/api/unshorten', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ url: trimmed }),
                        });
                            const data = await res.json();
                            if (data?.expandedUrl) {
                            trimmed = data.expandedUrl;
                        }
                        } catch (err) {
                            console.error('Error unshortening URL:', err);
                        } finally {
                            setLoading(false);
                        }
                        }

                            updateAttributes({ src: trimmed });
                            setIsReplacing(false);
                        };

                            const handleDuplicate = () => {
                            if (!editor || typeof getPos !== 'function') return;
                            const pos = getPos();
                            editor.chain().insertContentAt(pos + node.nodeSize, node.toJSON()).focus().run();
                            setShowMoreMenu(false);
                        };

                            const handleCopyOriginalLink = () => {
                            const link = embedInfo?.originalUrl || src;
                            if (link) {
                            navigator.clipboard.writeText(link);
                        }
                            setShowMoreMenu(false);
                        };

                            // Filter menu options based on search input
                            const menuActions = [
                        {
                            id: 'replace',
                            label: 'Replace',
                            icon: <RefreshCw size={15} />,
                        action: () => {
                    setIsReplacing(true);
                    setShowMoreMenu(false);
                },
                },
                {
                    id: 'caption',
                    label: 'Caption',
                    shortcut: '⌥⌘M',
                    icon: <Type size={15} />,
            action: () => {
            setShowCaptionInput((prev) => !prev);
            setShowMoreMenu(false);
            },
            },
            {
            id: 'align',
            label: 'Align',
            icon: <AlignCenter size={15} />,
            hasSubmenu: true,
            action: () => setShowAlignSubmenu((prev) => !prev),
            },
            {
            id: 'fullscreen',
            label: 'Full screen',
            shortcut: 'Space',
            icon: <Maximize2 size={15} />,
            action: () => {
            setIsFullScreen(true);
            setShowMoreMenu(false);
            },
            },
            {
            id: 'copy-link',
            label: 'Copy link to original',
            icon: <Copy size={15} />,
            action: handleCopyOriginalLink,
            },
            {
            id: 'duplicate',
            label: 'Duplicate',
            shortcut: '⌘D',
            icon: <CopyPlus size={15} />,
            action: handleDuplicate,
            },
            {
            id: 'delete',
            label: 'Delete',
            shortcut: 'Del',
            icon: <Trash2 size={15} />,
            danger: true,
            action: () => {
            deleteNode();
            setShowMoreMenu(false);
            },
            },
            ];

            const filteredActions = menuActions.filter((item) =>
            item.label.toLowerCase().includes(actionSearch.toLowerCase())
            );

            if (!src || isReplacing) {
            return (
            <NodeViewWrapper className="my-4 not-prose w-full">
                <div className="relative max-w-sm rounded-2xl border border-gray-200/80 bg-white p-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all">
                    <button
                        type="button"
                        onClick={() => {
                            if (isReplacing) setIsReplacing(false);
                            else deleteNode();
                        }}
                        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xs"
                    >
                        ✕
                    </button>

                    <form onSubmit={handleEmbedSubmit} className="space-y-3 pt-1">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputUrl}
                            onChange={(e) => setInputUrl(e.target.value)}
                            placeholder="Paste Google Maps link or embed code..."
                            disabled={loading}
                            className="w-full px-3.5 py-2 text-sm text-slate-800 placeholder-gray-400 bg-white border border-blue-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                        />

                        <button
                            type="submit"
                            disabled={!inputUrl.trim() || loading}
                            className="w-full py-2.5 px-4 bg-[#3B82F6] hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium rounded-xl shadow-sm transition-all active:scale-[0.99]"
                        >
                            {loading ? 'Resolving link...' : isReplacing ? 'Replace Map' : 'Embed Map'}
                        </button>
                    </form>
                </div>
            </NodeViewWrapper>
            );
            }

            const alignmentClasses =
            align === 'left' ? 'mr-auto' : align === 'right' ? 'ml-auto' : 'mx-auto';

            return (
            <NodeViewWrapper className="my-4 not-prose w-full block clear-both">
                {isDragging && <div className="fixed inset-0 z-[9999] bg-transparent pointer-events-auto" />}

                {/* FULLSCREEN MODAL */}
                {isFullScreen && (
                    <div className="fixed inset-0 z-[100] bg-black/80 flex flex-col p-6 backdrop-blur-sm animate-in fade-in duration-150">
                        <div className="flex justify-between items-center text-white pb-3">
                            <span className="font-semibold text-sm">{embedInfo?.title || 'Google Maps Preview'}</span>
                            <button
                                onClick={() => setIsFullScreen(false)}
                                className="p-1 hover:bg-white/20 rounded-lg text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 rounded-xl overflow-hidden bg-white shadow-2xl">
                            <iframe src={embedInfo.src} className="w-full h-full border-0" allowFullScreen />
                        </div>
                    </div>
                )}

                <div
                    ref={wrapperRef}
                    style={{ width: `${width}%` }}
                    className={`relative group transition-[width] duration-75 max-w-full ${alignmentClasses}`}
                >
                    {/* --- NOTION FLOATING ACTION BAR (Top Right of Map) --- */}
                    <div className="absolute top-2.5 right-2.5 z-30 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 backdrop-blur-sm shadow-md border border-gray-200/80 rounded-lg flex items-center p-0.5 gap-0.5 select-none">
                        {/* Caption Toggle */}
                        <button
                            type="button"
                            onClick={() => setShowCaptionInput((prev) => !prev)}
                            className={`p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-slate-800 transition-colors ${
                                showCaptionInput ? 'bg-gray-100 text-blue-600' : ''
                            }`}
                            title="Caption (⌥⌘M)"
                        >
                            <Type size={15} />
                        </button>

                        {/* Alignment Quick Cycle */}
                        <button
                            type="button"
                            onClick={() => {
                                const nextAlign = align === 'center' ? 'left' : align === 'left' ? 'right' : 'center';
                                updateAttributes({ align: nextAlign });
                            }}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-slate-800 transition-colors"
                            title={`Align: ${align}`}
                        >
                            {align === 'left' ? <AlignLeft size={15} /> : align === 'right' ? <AlignRight size={15} /> : <AlignCenter size={15} />}
                        </button>

                        {/* Full Screen */}
                        <button
                            type="button"
                            onClick={() => setIsFullScreen(true)}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-slate-800 transition-colors"
                            title="Full screen (Space)"
                        >
                            <Maximize2 size={15} />
                        </button>

                        {/* More Menu (...) with Notion-like Tooltip */}
                        <div className="relative group/more">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMoreMenu((prev) => !prev);
                                    setShowAlignSubmenu(false);
                                }}
                                className={`p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-slate-800 transition-colors ${
                                    showMoreMenu ? 'bg-gray-100 text-slate-900' : ''
                                }`}
                            >
                                <MoreHorizontal size={15} />
                            </button>

                            <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover/more:block z-50 whitespace-nowrap rounded bg-stone-900 px-2 py-0.5 text-[11px] font-medium text-white shadow-md">
                                More
                            </div>
                        </div>
                    </div>

                    {/* --- NOTION MORE DROPDOWN MENU --- */}
                    {showMoreMenu && (
                        <div
                            ref={menuRef}
                            className="absolute right-2 top-11 z-40 w-64 bg-white rounded-xl shadow-2xl border border-gray-200/90 py-1.5 text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-100"
                        >
                            {/* Search actions input */}
                            <div className="px-2 pt-1 pb-1.5 border-b border-gray-100">
                                <input
                                    type="text"
                                    value={actionSearch}
                                    onChange={(e) => setActionSearch(e.target.value)}
                                    placeholder="Search actions..."
                                    autoFocus
                                    className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded-md text-xs placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                                />
                            </div>

                            <div className="px-3 pt-2 pb-1 text-[11px] font-medium text-gray-400">
                                Google Maps
                            </div>

                            <div className="py-1">
                                {filteredActions.map((item) => (
                                    <div key={item.id} className="relative">
                                        <button
                                            type="button"
                                            onClick={item.action}
                                            className={`w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition-colors text-left ${
                                                item.danger ? 'text-red-600 hover:bg-red-50' : 'text-slate-700'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5">
                                            <span className={item.danger ? 'text-red-500' : 'text-gray-500'}>
                                                {item.icon}
                                            </span>
                                                <span className="font-medium text-[13px]">{item.label}</span>
                                            </div>

                                            {item.shortcut && (
                                                <span className="text-[10px] text-gray-400 font-sans tracking-wide">
                                                {item.shortcut}
                                            </span>
                                            )}

                                            {item.hasSubmenu && (
                                                <span className="text-gray-400 text-[10px]">›</span>
                                            )}
                                        </button>

                                        {/* Inline Alignment Flyout Submenu */}
                                        {item.id === 'align' && showAlignSubmenu && (
                                            <div className="bg-gray-50 border-y border-gray-100 px-3 py-1 flex items-center justify-around my-0.5">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        updateAttributes({ align: 'left' });
                                                        setShowAlignSubmenu(false);
                                                        setShowMoreMenu(false);
                                                    }}
                                                    className={`p-1.5 rounded hover:bg-white flex items-center gap-1 text-xs ${
                                                        align === 'left' ? 'text-blue-600 font-semibold' : 'text-gray-600'
                                                    }`}
                                                >
                                                    <AlignLeft size={14} /> Left
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        updateAttributes({ align: 'center' });
                                                        setShowAlignSubmenu(false);
                                                        setShowMoreMenu(false);
                                                    }}
                                                    className={`p-1.5 rounded hover:bg-white flex items-center gap-1 text-xs ${
                                                        align === 'center' ? 'text-blue-600 font-semibold' : 'text-gray-600'
                                                    }`}
                                                >
                                                    <AlignCenter size={14} /> Center
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        updateAttributes({ align: 'right' });
                                                        setShowAlignSubmenu(false);
                                                        setShowMoreMenu(false);
                                                    }}
                                                    className={`p-1.5 rounded hover:bg-white flex items-center gap-1 text-xs ${
                                                        align === 'right' ? 'text-blue-600 font-semibold' : 'text-gray-600'
                                                    }`}
                                                >
                                                    <AlignRight size={14} /> Right
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* --- GOOGLE MAP EMBED CONTAINER --- */}
                    {embedInfo?.type === 'maps' && (
                        <div
                            className="relative rounded-xl border border-gray-200/90 shadow-sm bg-white overflow-hidden"
                            style={{ height: `${height}px` }}
                        >
                            <iframe
                                src={embedInfo.src}
                                className={`w-full h-full border-0 ${isDragging ? 'pointer-events-none' : 'pointer-events-auto'}`}
                                allowFullScreen
                                loading="lazy"
                            />
                        </div>
                    )}

                    {/* --- EDITABLE CAPTION (Notion-style) --- */}
                    {showCaptionInput && (
                        <div className="mt-1.5 text-center">
                            <input
                                type="text"
                                value={caption}
                                onChange={(e) => updateAttributes({ caption: e.target.value })}
                                placeholder="Write a caption..."
                                className="w-full text-center text-xs text-gray-500 placeholder-gray-300 bg-transparent border-0 focus:outline-none focus:placeholder-gray-400 py-0.5"
                            />
                        </div>
                    )}

                    {/* --- NOTION-STYLE RESIZE HANDLES --- */}
                    {embedInfo?.type === 'maps' && (
                        <>
                            {/* Left edge handle */}
                            <div
                                onMouseDown={(e) => startResize(e, 'left')}
                                className={`absolute -left-2.5 top-0 bottom-0 w-5 flex items-center justify-center cursor-ew-resize z-20 transition-opacity ${
                                    isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                }`}
                            >
                                <div className="w-1.5 h-12 bg-gray-400/80 hover:bg-blue-500 rounded-full shadow transition-colors" />
                            </div>

                            {/* Right edge handle */}
                            <div
                                onMouseDown={(e) => startResize(e, 'right')}
                                className={`absolute -right-2.5 top-0 bottom-0 w-5 flex items-center justify-center cursor-ew-resize z-20 transition-opacity ${
                                    isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                }`}
                            >
                                <div className="w-1.5 h-12 bg-gray-400/80 hover:bg-blue-500 rounded-full shadow transition-colors" />
                            </div>

                            {/* Bottom bar handle */}
                            <div
                                onMouseDown={(e) => startResize(e, 'bottom')}
                                className={`absolute -bottom-2.5 left-0 right-0 h-5 flex items-center justify-center cursor-ns-resize z-20 transition-opacity ${
                                    isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                }`}
                            >
                                <div className="w-16 h-1.5 bg-gray-400/80 hover:bg-blue-500 rounded-full shadow transition-colors" />
                            </div>
                        </>
                    )}
                </div>
            </NodeViewWrapper>
            );
            };

            export const EmbedExtension = Node.create({
            name: 'embedBlock',
            group: 'block',
            atom: true,

            addAttributes() {
            return {
            src: { default: null },
            embedType: { default: 'default' },
            width: {
            default: 100,
            parseHTML: (element) => parseFloat(element.getAttribute('data-width')) || 100,
            renderHTML: (attributes) => ({
            'data-width': attributes.width,
        }),
        },
            height: {
            default: 420,
            parseHTML: (element) => parseInt(element.getAttribute('data-height'), 10) || 420,
            renderHTML: (attributes) => ({
            'data-height': attributes.height,
        }),
        },
            align: {
            default: 'center',
            parseHTML: (element) => element.getAttribute('data-align') || 'center',
            renderHTML: (attributes) => ({
            'data-align': attributes.align,
        }),
        },
            caption: {
            default: '',
            parseHTML: (element) => element.getAttribute('data-caption') || '',
            renderHTML: (attributes) => ({
            'data-caption': attributes.caption,
        }),
        },
        };
        },

            parseHTML() {
            return [
        {
            tag: 'div[data-embed-url]',
            getAttrs: (dom) => ({
            src: dom.getAttribute('data-embed-url'),
            embedType: dom.getAttribute('data-embed-type') || 'default',
            width: parseFloat(dom.getAttribute('data-width')) || 100,
            height: parseInt(dom.getAttribute('data-height'), 10) || 420,
            align: dom.getAttribute('data-align') || 'center',
            caption: dom.getAttribute('data-caption') || '',
        }),
        },
            ];
        },

            renderHTML({ HTMLAttributes }) {
            return [
            'div',
            mergeAttributes(HTMLAttributes, {
            'data-embed-url': HTMLAttributes.src,
            'data-embed-type': HTMLAttributes.embedType,
            'data-width': HTMLAttributes.width,
            'data-height': HTMLAttributes.height,
            'data-align': HTMLAttributes.align,
            'data-caption': HTMLAttributes.caption,
        }),
            ];
        },

            addNodeView() {
            return ReactNodeViewRenderer(EmbedComponent);
        },

            addCommands() {
            return {
            setEmbed: (options = {}) => ({ commands }) => {
            return commands.insertContent({
            type: this.name,
            attrs: options,
        });
        },
        };
        },
        });
                        <div
                            onMouseDown={(e) => startResize(e, 'right')}
                            className={`absolute -right-2.5 top-0 bottom-0 w-5 flex items-center justify-center cursor-ew-resize z-20 transition-opacity ${
                                isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}
                        >
                            <div className="w-1.5 h-12 bg-gray-400/80 hover:bg-blue-500 rounded-full shadow transition-colors" />
                        </div>

                        {/* Bottom bar handle */}
                        <div
                            onMouseDown={(e) => startResize(e, 'bottom')}
                            className={`absolute -bottom-2.5 left-0 right-0 h-5 flex items-center justify-center cursor-ns-resize z-20 transition-opacity ${
                                isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}
                        >
                            <div className="w-16 h-1.5 bg-gray-400/80 hover:bg-blue-500 rounded-full shadow transition-colors" />
                        </div>
                    </>
                )}
            </div>
        </NodeViewWrapper>
    );
};

export const EmbedExtension = Node.create({
    name: 'embedBlock',
    group: 'block',
    atom: true,

    addAttributes() {
        return {
            src: { default: null },
            embedType: { default: 'default' },
            width: {
                default: 100,
                parseHTML: (element) => parseFloat(element.getAttribute('data-width')) || 100,
                renderHTML: (attributes) => ({
                    'data-width': attributes.width,
                }),
            },
            height: {
                default: 420,
                parseHTML: (element) => parseInt(element.getAttribute('data-height'), 10) || 420,
                renderHTML: (attributes) => ({
                    'data-height': attributes.height,
                }),
            },
            align: {
                default: 'center',
                parseHTML: (element) => element.getAttribute('data-align') || 'center',
                renderHTML: (attributes) => ({
                    'data-align': attributes.align,
                }),
            },
            caption: {
                default: '',
                parseHTML: (element) => element.getAttribute('data-caption') || '',
                renderHTML: (attributes) => ({
                    'data-caption': attributes.caption,
                }),
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-embed-url]',
                getAttrs: (dom) => ({
                    src: dom.getAttribute('data-embed-url'),
                    embedType: dom.getAttribute('data-embed-type') || 'default',
                    width: parseFloat(dom.getAttribute('data-width')) || 100,
                    height: parseInt(dom.getAttribute('data-height'), 10) || 420,
                    align: dom.getAttribute('data-align') || 'center',
                    caption: dom.getAttribute('data-caption') || '',
                }),
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes(HTMLAttributes, {
                'data-embed-url': HTMLAttributes.src,
                'data-embed-type': HTMLAttributes.embedType,
                'data-width': HTMLAttributes.width,
                'data-height': HTMLAttributes.height,
                'data-align': HTMLAttributes.align,
                'data-caption': HTMLAttributes.caption,
            }),
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(EmbedComponent);
    },

    addCommands() {
        return {
            setEmbed: (options = {}) => ({ commands }) => {
                return commands.insertContent({
                    type: this.name,
                    attrs: options,
                });
            },
        };
    },
});