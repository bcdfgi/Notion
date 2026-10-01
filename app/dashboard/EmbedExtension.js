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
    X,
    ExternalLink
} from 'lucide-react';

export function getEmbedDetails(url) {
    if (!url) return null;

    if (url.includes('<iframe') && url.includes('src=')) {
        const srcMatch = url.match(/src=["']([^"']+)["']/);
        if (srcMatch) url = srcMatch[1];
    }

    // --- GOOGLE MAPS ---
    if (
        url.includes('google.com/maps') ||
        url.includes('maps.google.com') ||
        url.includes('maps.app.goo.gl') ||
        url.includes('goo.gl/maps')
    ) {
        if (url.includes('/maps/embed') || url.includes('output=embed')) {
            return {
                type: 'maps',
                label: 'Google Maps',
                src: url,
                title: 'Google Map',
                originalUrl: url,
                defaultHeight: 420,
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
            label: 'Google Maps',
            src: embedSrc,
            title: searchQuery || 'Google Map',
            originalUrl: url,
            defaultHeight: 420,
        };
    }

    // --- FIGMA ---
    if (url.includes('figma.com')) {
        let finalSrc = url;
        if (!url.includes('figma.com/embed')) {
            finalSrc = `https://www.figma.com/embed?embed_host=notion&url=${encodeURIComponent(url)}`;
        }

        const figmaFileMatch = url.match(/figma\.com\/(?:file|design|proto|board)\/[a-zA-Z0-9]+\/([^/?]+)/);
        const title = figmaFileMatch
            ? decodeURIComponent(figmaFileMatch[1].replace(/[-_]/g, ' '))
            : 'Figma Design';

        return {
            type: 'figma',
            label: 'Figma',
            src: finalSrc,
            title: title,
            originalUrl: url,
            defaultHeight: 450,
        };
    }

    // --- SPOTIFY ---
    const spotifyMatch = url.match(/spotify\.com\/(track|album|playlist|episode|artist|show)\/([a-zA-Z0-9]+)/);
    if (spotifyMatch) {
        const itemType = spotifyMatch[1];
        // Tracks and individual episodes use 152px compact layout; playlists/albums/shows use 352px
        const defaultHeight = (itemType === 'track' || itemType === 'episode') ? 152 : 352;

        return {
            type: 'spotify',
            label: 'Spotify',
            src: `https://open.spotify.com/embed/${spotifyMatch[1]}/${spotifyMatch[2]}?utm_source=generator`,
            title: 'Spotify Audio',
            originalUrl: url,
            defaultHeight,
        };
    }

    // --- LOOM ---
    const loomMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
    if (loomMatch) {
        return {
            type: 'iframe',
            label: 'Loom',
            src: `https://www.loom.com/embed/${loomMatch[1]}`,
            title: 'Loom Video',
            originalUrl: url,
            defaultHeight: 360,
        };
    }

    return { type: 'bookmark', label: 'Web Bookmark', originalUrl: url };
}

const EmbedComponent = ({ node, updateAttributes, deleteNode, editor, getPos }) => {
    const { src, embedType, width = 100, height, align = 'center', caption = '' } = node.attrs;
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

    const embedInfo = getEmbedDetails(src);
    const activeHeight = height || embedInfo?.defaultHeight || 420;

    const dragInfo = useRef({
        startX: 0,
        startY: 0,
        startW: 100,
        startH: activeHeight,
        parentWidth: 1,
        handle: null,
    });

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
                const minH = embedInfo?.type === 'spotify' ? 152 : 160;
                const nextHeight = Math.max(minH, Math.min(1000, Math.round(startH + dy)));
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
    }, [updateAttributes, embedInfo?.type]);

    const startResize = (e, handle) => {
        e.preventDefault();
        e.stopPropagation();

        const parentEl = wrapperRef.current?.parentElement || document.body;
        const parentWidth = parentEl.getBoundingClientRect().width || 800;

        dragInfo.current = {
            startX: e.clientX,
            startY: e.clientY,
            startW: Number(width) || 100,
            startH: Number(activeHeight),
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

    const isInteractiveEmbed = ['maps', 'figma', 'spotify', 'iframe'].includes(embedInfo?.type);

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
        ...(embedInfo?.type !== 'spotify'
            ? [
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
            ]
            : []),
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
        const getPlaceholder = () => {
            if (embedType === 'spotify') return 'Paste Spotify track, album, or playlist link...';
            if (embedType === 'figma') return 'Paste Figma design or prototype link...';
            return 'Paste Google Maps, Spotify, or Figma link...';
        };

        const getTitle = () => {
            if (isReplacing) return `Replace ${embedInfo?.label || 'Embed'}`;
            if (embedType === 'spotify') return 'Embed Spotify';
            if (embedType === 'figma') return 'Embed Figma';
            return 'Embed Map or Link';
        };

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
                            placeholder={getPlaceholder()}
                            disabled={loading}
                            className="w-full px-3.5 py-2 text-sm text-slate-800 placeholder-gray-400 bg-white border border-blue-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                        />

                        <button
                            type="submit"
                            disabled={!inputUrl.trim() || loading}
                            className="w-full py-2.5 px-4 bg-[#3B82F6] hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium rounded-xl shadow-sm transition-all active:scale-[0.99]"
                        >
                            {loading ? 'Resolving link...' : getTitle()}
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
                        <span className="font-semibold text-sm">{embedInfo?.title || 'Embed Preview'}</span>
                        <div className="flex items-center gap-2">
                            {embedInfo?.originalUrl && (
                                <a
                                    href={embedInfo.originalUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1 hover:bg-white/20 rounded-lg text-white transition-colors flex items-center gap-1 text-xs"
                                >
                                    <ExternalLink size={16} /> Open original
                                </a>
                            )}
                            <button
                                onClick={() => setIsFullScreen(false)}
                                className="p-1 hover:bg-white/20 rounded-lg text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
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
                {/* --- NOTION FLOATING ACTION BAR --- */}
                {isInteractiveEmbed && (
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

                        {/* Full Screen (Maps & Figma) */}
                        {embedInfo?.type !== 'spotify' && (
                            <button
                                type="button"
                                onClick={() => setIsFullScreen(true)}
                                className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-slate-800 transition-colors"
                                title="Full screen (Space)"
                            >
                                <Maximize2 size={15} />
                            </button>
                        )}

                        {/* More Menu (...) */}
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
                )}

                {/* --- NOTION MORE DROPDOWN MENU --- */}
                {showMoreMenu && (
                    <div
                        ref={menuRef}
                        className="absolute right-2 top-11 z-40 w-64 bg-white rounded-xl shadow-2xl border border-gray-200/90 py-1.5 text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-100"
                    >
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
                            {embedInfo?.label || 'Embed'}
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

                {/* --- EMBED CONTAINERS (Maps, Figma, Spotify) --- */}
                {embedInfo?.type === 'maps' ? (
                    <div
                        className="relative rounded-xl border border-gray-200/90 shadow-sm bg-white overflow-hidden"
                        style={{ height: `${activeHeight}px` }}
                    >
                        <iframe
                            src={embedInfo.src}
                            className={`w-full h-full border-0 ${isDragging ? 'pointer-events-none' : 'pointer-events-auto'}`}
                            allowFullScreen
                            loading="lazy"
                        />
                    </div>
                ) : embedInfo?.type === 'figma' ? (
                    <div
                        className="relative rounded-xl overflow-hidden border border-gray-200/90 shadow-sm bg-[#FBFBFA] flex flex-col w-full"
                        style={{ height: `${activeHeight}px` }}
                    >
                        <div className="flex items-center justify-between px-3.5 py-2 bg-white border-b border-gray-100 shrink-0 select-none">
                            <div className="flex items-center gap-2">
                                <span className="w-4 h-4 rounded bg-purple-100 text-purple-600 font-bold text-[10px] flex items-center justify-center">
                                    F
                                </span>
                                <span className="text-xs font-semibold text-slate-700 truncate max-w-[200px]">
                                    {embedInfo.title || 'Figma Design'}
                                </span>
                            </div>
                            <a
                                href={embedInfo.originalUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-blue-500 hover:underline mr-24"
                            >
                                Open in Figma
                            </a>
                        </div>
                        <iframe
                            src={embedInfo.src}
                            className={`w-full flex-1 border-0 ${isDragging ? 'pointer-events-none' : 'pointer-events-auto'}`}
                            allow="fullscreen; clipboard-read; clipboard-write"
                            allowFullScreen
                            loading="lazy"
                        />
                    </div>
                ) : embedInfo?.type === 'spotify' ? (
                    /* --- SPOTIFY CLEAN NOTION EMBED CONTAINER --- */
                    <div
                        className="relative rounded-[12px] overflow-hidden w-full transition-all"
                        style={{ height: `${activeHeight}px` }}
                    >
                        <iframe
                            src={embedInfo.src}
                            className={`w-full h-full border-0 rounded-[12px] ${isDragging ? 'pointer-events-none' : 'pointer-events-auto'}`}
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                            style={{ borderRadius: '12px' }}
                        />
                    </div>
                ) : embedInfo?.type === 'iframe' ? (
                    <div
                        className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm w-full"
                        style={{ height: `${activeHeight}px` }}
                    >
                        <iframe
                            src={embedInfo.src}
                            className={`w-full h-full border-0 ${isDragging ? 'pointer-events-none' : 'pointer-events-auto'}`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                ) : (
                    /* --- BOOKMARK FALLBACK --- */
                    <div className="relative group border border-gray-200 rounded-lg overflow-hidden hover:bg-gray-50 transition flex max-w-2xl bg-white shadow-sm">
                        {loading ? (
                            <div className="p-4 text-xs text-gray-400 animate-pulse">Loading preview...</div>
                        ) : (
                            <>
                                <a href={src} target="_blank" rel="noopener noreferrer" className="flex flex-1 p-3.5 justify-between min-w-0">
                                    <div className="flex flex-col justify-between pr-3 overflow-hidden">
                                        <div className="font-semibold text-sm text-slate-800 truncate">
                                            {meta?.title || src}
                                        </div>
                                        <p className="text-xs text-slate-500 line-clamp-2 my-1">
                                            {meta?.description || 'No description available'}
                                        </p>
                                        <span className="text-[11px] text-slate-400 truncate">{src}</span>
                                    </div>
                                    {meta?.image && (
                                        <div
                                            className="w-28 h-20 bg-cover bg-center rounded shrink-0 border border-gray-100"
                                            style={{ backgroundImage: `url(${meta.image})` }}
                                        />
                                    )}
                                </a>
                                <button
                                    type="button"
                                    onClick={deleteNode}
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-white text-gray-400 hover:text-red-500 rounded p-1 text-xs shadow-sm border border-gray-200 transition-all"
                                >
                                    ✕
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* --- EDITABLE CAPTION --- */}
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

                {/* --- NOTION RESIZE HANDLES --- */}
                {isInteractiveEmbed && (
                    <>
                        {/* Left edge handle (Width Resize) */}
                        <div
                            onMouseDown={(e) => startResize(e, 'left')}
                            className={`absolute -left-2.5 top-0 bottom-0 w-5 flex items-center justify-center cursor-ew-resize z-20 transition-opacity ${
                                isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}
                        >
                            <div className="w-1.5 h-12 bg-gray-400/80 hover:bg-blue-500 rounded-full shadow transition-colors" />
                        </div>

                        {/* Right edge handle (Width Resize) */}
                        <div
                            onMouseDown={(e) => startResize(e, 'right')}
                            className={`absolute -right-2.5 top-0 bottom-0 w-5 flex items-center justify-center cursor-ew-resize z-20 transition-opacity ${
                                isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}
                        >
                            <div className="w-1.5 h-12 bg-gray-400/80 hover:bg-blue-500 rounded-full shadow transition-colors" />
                        </div>

                        {/* Bottom bar handle (Only for Maps and Figma; Spotify uses its dedicated embed height) */}
                        {embedInfo?.type !== 'spotify' && (
                            <div
                                onMouseDown={(e) => startResize(e, 'bottom')}
                                className={`absolute -bottom-2.5 left-0 right-0 h-5 flex items-center justify-center cursor-ns-resize z-20 transition-opacity ${
                                    isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                }`}
                            >
                                <div className="w-16 h-1.5 bg-gray-400/80 hover:bg-blue-500 rounded-full shadow transition-colors" />
                            </div>
                        )}
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
                default: null,
                parseHTML: (element) => parseInt(element.getAttribute('data-height'), 10) || null,
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
                    height: parseInt(dom.getAttribute('data-height'), 10) || null,
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