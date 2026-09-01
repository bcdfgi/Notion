import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useState, useEffect, useRef } from 'react';

function getEmbedDetails(url) {
    if (!url) return null;

    if (url.includes('google.com/maps') || url.includes('maps.google.com')) {
        let embedSrc = url;
        if (!url.includes('/embed')) {
            embedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(url)}&output=embed`;
        }
        return { type: 'iframe', src: embedSrc, height: '360px' };
    }

    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch) {
        return { type: 'iframe', src: `https://www.youtube.com/embed/${ytMatch[1]}` };
    }

    const spotifyMatch = url.match(/spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/);
    if (spotifyMatch) {
        return { type: 'iframe', src: `https://open.spotify.com/embed/${spotifyMatch[1]}/${spotifyMatch[2]}`, height: '152px' };
    }

    const loomMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
    if (loomMatch) {
        return { type: 'iframe', src: `https://www.loom.com/embed/${loomMatch[1]}` };
    }

    if (url.includes('figma.com/file/') || url.includes('figma.com/design/')) {
        return { type: 'iframe', src: `https://www.figma.com/embed?embed_host=notion&url=${encodeURIComponent(url)}`, height: '450px' };
    }

    return { type: 'bookmark' };
}

const EmbedComponent = ({ node, updateAttributes, deleteNode }) => {
    const { src, embedType } = node.attrs;
    const [inputUrl, setInputUrl] = useState('');
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const inputRef = useRef(null);

    const embedInfo = getEmbedDetails(src);

    useEffect(() => {
        if (!src && inputRef.current) {
            inputRef.current.focus();
        }
    }, [src]);

    useEffect(() => {
        if (src && embedInfo?.type === 'bookmark') {
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
        } else {
            setLoading(false);
        }
    }, [src]);

    const handleEmbedSubmit = (e) => {
        e?.preventDefault();
        const trimmed = inputUrl.trim();
        if (trimmed) {
            updateAttributes({ src: trimmed });
        }
    };

    if (!src) {
        const placeholders = {
            maps: 'https://www.google.com/maps/...',
            youtube: 'https://www.youtube.com/watch?v=...',
            spotify: 'https://open.spotify.com/...',
            figma: 'https://www.figma.com/file/...',
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
            maps: 'Works with places on Google Maps',
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
                            className="w-full px-3.5 py-2 text-sm text-slate-800 placeholder-gray-400 bg-white border border-blue-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />

                        <button
                            type="submit"
                            disabled={!inputUrl.trim()}
                            className="w-full py-2.5 px-4 bg-[#3B82F6] hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium rounded-xl shadow-sm transition-all active:scale-[0.99]"
                        >
                            {titles[typeKey] || titles.default}
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
            {embedInfo?.type === 'iframe' ? (
                <div className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm w-full group">
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