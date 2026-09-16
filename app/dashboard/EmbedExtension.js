import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useState, useEffect, useRef } from 'react';

export function getEmbedDetails(url) {
    if (!url) return null;

    // --- CLEAN IFRAME SNIPPETS IF USER PASTES <iframe src="..."> ---
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
        // If it's already an embed URL (e.g. copied from 'Embed a map' tab)
        if (url.includes('/maps/embed') || url.includes('output=embed')) {
            return {
                type: 'maps',
                src: url,
                height: '420px',
                title: 'Google Map',
                originalUrl: url,
            };
        }

        let searchQuery = '';

        // Extract coordinates or place names
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
            height: '420px',
            title: searchQuery || 'Google Map',
            originalUrl: url,
        };
    }

    // --- FIGMA ---
    if (url.includes('figma.com/file/') || url.includes('figma.com/design/') || url.includes('figma.com/proto/')) {
        const figmaFileMatch = url.match(/figma\.com\/(?:file|design)\/[a-zA-Z0-9]+\/([^/?]+)/);
        const title = figmaFileMatch
            ? decodeURIComponent(figmaFileMatch[1].replace(/[-_]/g, ' '))
            : 'Figma Design';

        return {
            type: 'figma',
            src: `https://www.figma.com/embed?embed_host=notion&url=${encodeURIComponent(url)}`,
            height: '450px',
            title: title,
            originalUrl: url
        };
    }

    // --- YOUTUBE ---
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch) {
        return { type: 'iframe', src: `https://www.youtube.com/embed/${ytMatch[1]}`, height: '360px' };
    }

    // --- SPOTIFY ---
    const spotifyMatch = url.match(/spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/);
    if (spotifyMatch) {
        return { type: 'iframe', src: `https://open.spotify.com/embed/${spotifyMatch[1]}/${spotifyMatch[2]}`, height: '152px' };
    }

    // --- LOOM ---
    const loomMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
    if (loomMatch) {
        return { type: 'iframe', src: `https://www.loom.com/embed/${loomMatch[1]}`, height: '360px' };
    }

    return { type: 'bookmark' };
}

const EmbedComponent = ({ node, updateAttributes, deleteNode }) => {
    const { src, embedType } = node.attrs;
    const [inputUrl, setInputUrl] = useState('');
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);

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
                body: JSON.stringify({ url: src })
            })
                .then(res => res.json())
                .then(data => {
                    setMeta(data);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [src, embedInfo?.type]);

    // Handle form submit with unshortening for maps.app.goo.gl
    const handleEmbedSubmit = async (e) => {
        e?.preventDefault();
        let trimmed = inputUrl.trim();
        if (!trimmed) return;

        // If user pasted an iframe tag
        if (trimmed.includes('<iframe') && trimmed.includes('src=')) {
            const srcMatch = trimmed.match(/src=["']([^"']+)["']/);
            if (srcMatch) trimmed = srcMatch[1];
        }

        // If user pasted a shortened Google Maps share link
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
    };

    if (!src) {
        const placeholders = {
            maps: 'Paste Google Maps link or embed code...',
            youtube: 'https://www.youtube.com/watch?v=...',
            spotify: 'https://open.spotify.com/...',
            figma: 'https://www.figma.com/design/...',
            default: 'Paste any link (Maps, YouTube, Figma, Spotify)...'
        };

        const titles = {
            maps: 'Embed Map',
            youtube: 'Embed Video',
            spotify: 'Embed Audio',
            figma: 'Embed Figma',
            default: 'Embed link'
        };

        const footers = {
            maps: 'Works with Google Maps places, links, and share embeds',
            youtube: 'Works with YouTube videos and shorts',
            spotify: 'Works with Spotify tracks, albums, and playlists',
            figma: 'Works with public Figma files and prototypes',
            default: 'Works with web links, YouTube, Maps, Spotify, and Figma'
        };

        const typeKey = embedType || 'default';

        return (
            <NodeViewWrapper className="my-4 not-prose">
                <div className="relative max-w-sm rounded-2xl border border-gray-200/80 bg-white p-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all">
                    <button
                        type="button"
                        onClick={deleteNode}
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
                            placeholder={placeholders[typeKey] || placeholders.default}
                            disabled={loading}
                            className="w-full px-3.5 py-2 text-sm text-slate-800 placeholder-gray-400 bg-white border border-blue-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                        />

                        <button
                            type="submit"
                            disabled={!inputUrl.trim() || loading}
                            className="w-full py-2.5 px-4 bg-[#3B82F6] hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium rounded-xl shadow-sm transition-all active:scale-[0.99]"
                        >
                            {loading ? 'Resolving link...' : (titles[typeKey] || titles.default)}
                        </button>
                    </form>

                    <p className="mt-3 text-center text-xs text-gray-500 font-normal select-none">
                        {footers[typeKey] || footers.default}
                    </p>
                </div>
            </NodeViewWrapper>
        );
    }

    return (
        <NodeViewWrapper className="my-4 not-prose">
            {/* FIGMA EMBED */}
            {embedInfo?.type === 'figma' ? (
                <div className="relative group border border-gray-200/90 rounded-xl overflow-hidden shadow-sm bg-white">
                    <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#FBFBFA] border-b border-gray-100">
                        <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-md bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-600">
                                F
                            </div>
                            <div className="flex flex-col">
                                <a
                                    href={embedInfo.originalUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs font-semibold text-slate-800 hover:underline capitalize"
                                >
                                    {embedInfo.title || 'Figma Design'}
                                </a>
                                <span className="text-[10px] text-gray-400">Interactive Figma Embed</span>
                            </div>
                        </div>
                        <a
                            href={embedInfo.originalUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-blue-500 hover:underline pr-6"
                        >
                            Open in Figma
                        </a>
                    </div>

                    <iframe
                        src={embedInfo.src}
                        className="w-full"
                        style={{ height: embedInfo.height || '450px' }}
                        allowFullScreen
                    />

                    <button
                        type="button"
                        onClick={deleteNode}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-white/90 text-gray-400 hover:text-red-500 rounded p-1 text-xs shadow transition-all"
                    >
                        ✕
                    </button>
                </div>
            ) : embedInfo?.type === 'maps' ? (
                /* GOOGLE MAPS EMBED */
                <div className="relative group border border-gray-200/90 rounded-xl overflow-hidden shadow-sm bg-white">
                    <iframe
                        src={embedInfo.src}
                        className="w-full"
                        style={{ height: embedInfo.height || '400px' }}
                        allowFullScreen
                        loading="lazy"
                    />

                    <button
                        type="button"
                        onClick={deleteNode}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-white/90 text-gray-500 hover:text-red-500 rounded p-1 text-xs shadow transition-all z-10"
                    >
                        ✕
                    </button>
                </div>
            ) : embedInfo?.type === 'iframe' ? (
                /* YOUTUBE / SPOTIFY / LOOM */
                <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm w-full group">
                    <iframe
                        src={embedInfo.src}
                        className="w-full"
                        style={{ height: embedInfo.height || '360px' }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                    <button
                        type="button"
                        onClick={deleteNode}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-white/90 text-gray-600 hover:text-red-500 rounded p-1 text-xs shadow transition-all"
                    >
                        ✕
                    </button>
                </div>
            ) : (
                /* WEB BOOKMARK */
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
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-embed-url]',
                getAttrs: (dom) => ({
                    src: dom.getAttribute('data-embed-url'),
                    embedType: dom.getAttribute('data-embed-type') || 'default',
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