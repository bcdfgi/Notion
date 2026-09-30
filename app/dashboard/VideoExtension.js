'use client';
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useState, useRef, useEffect } from 'react';
import {
    MoreHorizontal,
    Trash2,
    RefreshCw,
    X,
    Play,
    MessageSquareText,
    ExternalLink,
    Link as LinkIcon,
    CopyPlus,
} from 'lucide-react';

const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

function getVideoEmbedUrl(url) {
    if (!url) return null;

    // YouTube
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch) {
        return { type: 'iframe', src: `https://www.youtube.com/embed/${ytMatch[1]}` };
    }

    // Loom
    const loomMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
    if (loomMatch) {
        return { type: 'iframe', src: `https://www.loom.com/embed/${loomMatch[1]}` };
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
        return { type: 'iframe', src: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
    }

    // Direct video file (mp4, webm, etc.) or blob / data URL
    return { type: 'video', src: url };
}

const VideoBlockComponent = (props) => {
    const { node, updateAttributes, editor, deleteNode } = props;
    const { src } = node.attrs;
    const caption = node.attrs.caption || '';

    const [showPopover, setShowPopover] = useState(!src);
    const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'link'
    const [linkInput, setLinkInput] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const [searchAction, setSearchAction] = useState('');
    const [showCaption, setShowCaption] = useState(Boolean(caption));

    const fileInputRef = useRef(null);
    const popoverRef = useRef(null);
    const captionInputRef = useRef(null);

    // Close popover and menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(e.target) &&
                !e.target.closest('.video-placeholder-row')
            ) {
                if (src) {
                    setShowPopover(false);
                }
            }
            if (!e.target.closest('.video-action-menu') && !e.target.closest('.video-menu-btn')) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [src]);

    const handleFileSelect = (file) => {
        if (!file.type.startsWith('video/')) {
            setErrorMessage('Please select a valid video file.');
            return;
        }

        if (file.size > MAX_VIDEO_SIZE) {
            const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
            setErrorMessage(`File is ${sizeInMb}MB. Maximum limit is 50MB.`);
            return;
        }

        setErrorMessage('');
        const reader = new FileReader();
        reader.onload = (e) => {
            updateAttributes({ src: e.target?.result });
            setShowPopover(false);
        };
        reader.readAsDataURL(file);
    };

    const handleLinkSubmit = (e) => {
        e.preventDefault();
        const trimmed = linkInput.trim();
        if (!trimmed) return;
        updateAttributes({ src: trimmed });
        setShowPopover(false);
        setLinkInput('');
    };

    // --- Action Handlers ---
    const handleViewOriginal = () => {
        setShowMenu(false);
        if (!src) return;
        window.open(src, '_blank', 'noopener,noreferrer');
    };

    const handleCopyLinkToOriginal = async () => {
        setShowMenu(false);
        if (!src) return;
        try {
            await navigator.clipboard.writeText(src);
        } catch (err) {
            console.error('Failed to copy link', err);
        }
    };

    const handleCopyLinkToBlock = async () => {
        setShowMenu(false);
        try {
            await navigator.clipboard.writeText(window.location.href);
        } catch (err) {
            console.error('Failed to copy block link', err);
        }
    };

    const handleDuplicate = () => {
        setShowMenu(false);
        if (editor) {
            const { selection } = editor.state;
            editor
                .chain()
                .focus()
                .insertContentAt(selection.to, {
                    type: 'videoBlock',
                    attrs: { ...node.attrs },
                })
                .run();
        }
    };

    const handleToggleCaption = () => {
        setShowMenu(false);
        setShowCaption(true);
        setTimeout(() => {
            captionInputRef.current?.focus();
        }, 50);
    };

    const embed = getVideoEmbedUrl(src);

    // --- RENDER 1: VIDEO ALREADY EMBEDDED ---
    if (src) {
        return (
            <NodeViewWrapper className="my-4 not-prose relative group/video flex flex-col items-center w-full select-none">
                <div className="relative w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-black">
                    {embed.type === 'iframe' ? (
                        <iframe
                            src={embed.src}
                            className="w-full aspect-video"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
                        <video
                            src={embed.src}
                            controls
                            className="w-full max-h-[500px] object-contain mx-auto"
                        />
                    )}

                    {/* Top right floating options button */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover/video:opacity-100 transition-opacity z-20">
                        <button
                            type="button"
                            contentEditable={false}
                            onClick={() => setShowMenu((prev) => !prev)}
                            className="video-menu-btn p-1 bg-white/90 hover:bg-white text-gray-700 rounded-md shadow-sm border border-gray-200 transition-colors backdrop-blur-xs"
                            title="Video options"
                        >
                            <MoreHorizontal size={16} />
                        </button>
                    </div>

                    {/* --- Notion Video Context Menu --- */}
                    {showMenu && (
                        <div
                            contentEditable={false}
                            className="video-action-menu absolute right-2 top-10 w-60 bg-white rounded-xl shadow-2xl border border-gray-200 p-1.5 z-30 text-slate-700 animate-in fade-in zoom-in-95 duration-75 select-none"
                        >
                            {/* Search Header */}
                            <div className="px-2 py-1 mb-1 border-b border-gray-100">
                                <input
                                    type="text"
                                    value={searchAction}
                                    onChange={(e) => setSearchAction(e.target.value)}
                                    placeholder="Search actions..."
                                    className="w-full text-xs bg-gray-50 rounded px-2 py-1 outline-none text-slate-800 placeholder:text-gray-400"
                                />
                            </div>

                            <div className="px-2 py-0.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                                Video
                            </div>

                            {/* Replace */}
                            <button
                                type="button"
                                onClick={() => {
                                    setShowMenu(false);
                                    setShowPopover(true);
                                }}
                                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded hover:bg-gray-100 transition-colors"
                            >
                                <RefreshCw size={14} className="text-gray-500" />
                                <span>Replace</span>
                            </button>

                            {/* Caption */}
                            <button
                                type="button"
                                onClick={handleToggleCaption}
                                className="w-full flex items-center justify-between px-2 py-1.5 text-xs rounded hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <MessageSquareText size={14} className="text-gray-500" />
                                    <span>Caption</span>
                                </div>
                                <span className="text-[10px] text-gray-400 font-mono">⌘⌥M</span>
                            </button>

                            {/* View original */}
                            <button
                                type="button"
                                onClick={handleViewOriginal}
                                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded hover:bg-gray-100 transition-colors"
                            >
                                <ExternalLink size={14} className="text-gray-500" />
                                <span>View original</span>
                            </button>

                            <div className="h-px bg-gray-100 my-1" />

                            {/* Copy link to original */}
                            <button
                                type="button"
                                onClick={handleCopyLinkToOriginal}
                                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded hover:bg-gray-100 transition-colors"
                            >
                                <LinkIcon size={14} className="text-gray-500" />
                                <span>Copy link to original</span>
                            </button>



                            {/* Duplicate */}
                            <button
                                type="button"
                                onClick={handleDuplicate}
                                className="w-full flex items-center justify-between px-2 py-1.5 text-xs rounded hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <CopyPlus size={14} className="text-gray-500" />
                                    <span>Duplicate</span>
                                </div>
                                <span className="text-[10px] text-gray-400 font-mono">⌘D</span>
                            </button>

                            {/* Delete */}
                            <button
                                type="button"
                                onClick={deleteNode}
                                className="w-full flex items-center justify-between px-2 py-1.5 text-xs text-red-600 rounded hover:bg-red-50 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <Trash2 size={14} />
                                    <span>Delete</span>
                                </div>
                                <span className="text-[10px] text-red-400 font-mono">Del</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Notion Caption Field */}
                {showCaption && (
                    <div className="mt-2 w-full px-1">
                        <input
                            ref={captionInputRef}
                            type="text"
                            value={caption}
                            contentEditable={true}
                            suppressContentEditableWarning
                            placeholder="Write a caption..."
                            onChange={(e) => updateAttributes({ caption: e.target.value })}
                            onKeyDown={(e) => e.stopPropagation()}
                            className="w-full text-center text-xs text-gray-600 bg-transparent border-none outline-none placeholder:text-gray-400 focus:text-slate-900 select-text"
                        />
                    </div>
                )}

                {/* Replace Popover over existing video */}
                {showPopover && (
                    <div
                        ref={popoverRef}
                        contentEditable={false}
                        className="absolute top-2 left-6 z-40 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 p-3 animate-in fade-in zoom-in-95 duration-100"
                    >
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
                            <div className="flex items-center gap-4 text-xs font-medium">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setErrorMessage('');
                                        setActiveTab('upload');
                                    }}
                                    className={`pb-1 relative transition-colors ${
                                        activeTab === 'upload'
                                            ? 'text-slate-900 font-semibold'
                                            : 'text-gray-400 hover:text-slate-600'
                                    }`}
                                >
                                    Upload
                                    {activeTab === 'upload' && (
                                        <div className="absolute -bottom-[9px] left-0 right-0 h-[2px] bg-slate-900 rounded-full" />
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setErrorMessage('');
                                        setActiveTab('link');
                                    }}
                                    className={`pb-1 relative transition-colors ${
                                        activeTab === 'link'
                                            ? 'text-slate-900 font-semibold'
                                            : 'text-gray-400 hover:text-slate-600'
                                    }`}
                                >
                                    Link
                                    {activeTab === 'link' && (
                                        <div className="absolute -bottom-[9px] left-0 right-0 h-[2px] bg-slate-900 rounded-full" />
                                    )}
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowPopover(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        {activeTab === 'upload' && (
                            <div className="space-y-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="video/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileSelect(file);
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full py-2 bg-[#2383E2] hover:bg-[#1a70c5] text-white text-xs font-medium rounded-lg shadow-sm transition-colors"
                                >
                                    Choose a video
                                </button>
                                {errorMessage && (
                                    <p className="text-[11px] text-red-500 text-center">{errorMessage}</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'link' && (
                            <form onSubmit={handleLinkSubmit} className="space-y-2">
                                <input
                                    type="url"
                                    autoFocus
                                    value={linkInput}
                                    onChange={(e) => setLinkInput(e.target.value)}
                                    placeholder="Paste video link (YouTube, Loom, etc.)..."
                                    className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-500"
                                />
                                <button
                                    type="submit"
                                    className="w-full py-1.5 bg-[#2383E2] hover:bg-[#1a70c5] text-white rounded-lg text-xs font-medium transition-colors"
                                >
                                    Embed video
                                </button>
                            </form>
                        )}
                    </div>
                )}
            </NodeViewWrapper>
        );
    }

    // --- RENDER 2: EMPTY NOTION PLACEHOLDER ---
    return (
        <NodeViewWrapper className="my-3 select-none relative not-prose">
            <div
                onClick={() => setShowPopover(true)}
                className="video-placeholder-row w-full flex items-center gap-2.5 px-4 py-3 rounded-md bg-[#F7F6F5] hover:bg-[#EFEFEF] text-slate-500 hover:text-slate-700 cursor-pointer transition-colors"
            >
                <div className="w-5 h-5 flex items-center justify-center rounded border border-gray-400 text-gray-500">
                    <Play size={10} className="fill-current ml-0.5" />
                </div>
                <span className="text-xs font-normal text-slate-600">Embed or upload a video</span>
            </div>

            {showPopover && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-transparent"
                        onClick={() => setShowPopover(false)}
                    />
                    <div
                        ref={popoverRef}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute left-6 top-1 mt-1 w-80 bg-white rounded-xl shadow-2xl border border-gray-200/90 p-3 z-50 animate-in fade-in zoom-in-95 duration-100"
                    >
                        <div className="flex items-center gap-4 border-b border-gray-100 pb-2 mb-3 text-xs font-medium">
                            <button
                                type="button"
                                onClick={() => {
                                    setErrorMessage('');
                                    setActiveTab('upload');
                                }}
                                className={`pb-1 transition-colors relative ${
                                    activeTab === 'upload'
                                        ? 'text-slate-900 font-semibold'
                                        : 'text-gray-400 hover:text-slate-600'
                                }`}
                            >
                                Upload
                                {activeTab === 'upload' && (
                                    <div className="absolute -bottom-[9px] left-0 right-0 h-[2px] bg-slate-900 rounded-full" />
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setErrorMessage('');
                                    setActiveTab('link');
                                }}
                                className={`pb-1 transition-colors relative ${
                                    activeTab === 'link'
                                        ? 'text-slate-900 font-semibold'
                                        : 'text-gray-400 hover:text-slate-600'
                                }`}
                            >
                                Link
                                {activeTab === 'link' && (
                                    <div className="absolute -bottom-[9px] left-0 right-0 h-[2px] bg-slate-900 rounded-full" />
                                )}
                            </button>
                        </div>

                        {activeTab === 'upload' && (
                            <div className="space-y-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="video/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            e.target.value = '';
                                            handleFileSelect(file);
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full py-2 px-3 bg-[#2383E2] hover:bg-[#1a70c5] text-white text-xs font-medium rounded-lg shadow-sm transition-colors"
                                >
                                    Choose a video
                                </button>

                                {errorMessage ? (
                                    <p className="text-[11px] text-red-500 text-center">{errorMessage}</p>
                                ) : (
                                    <p className="text-[10px] text-gray-400 text-center">
                                        The maximum size per file is 50MB.
                                    </p>
                                )}
                            </div>
                        )}

                        {activeTab === 'link' && (
                            <form onSubmit={handleLinkSubmit} className="space-y-2">
                                <input
                                    type="url"
                                    autoFocus
                                    value={linkInput}
                                    onChange={(e) => setLinkInput(e.target.value)}
                                    placeholder="Paste video link (YouTube, Loom, etc.)..."
                                    className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                                <button
                                    type="submit"
                                    className="w-full py-1.5 bg-[#2383E2] hover:bg-[#1a70c5] text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
                                >
                                    Embed video
                                </button>
                            </form>
                        )}
                    </div>
                </>
            )}
        </NodeViewWrapper>
    );
};

export const VideoExtension = Node.create({
    name: 'videoBlock',
    group: 'block',
    atom: true,

    addAttributes() {
        return {
            src: {
                default: null,
            },
            caption: {
                default: '',
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="video-block"]',
                getAttrs: (dom) => ({
                    src: dom.getAttribute('data-src') || null,
                    caption: dom.getAttribute('data-caption') || '',
                }),
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes(HTMLAttributes, {
                'data-type': 'video-block',
                'data-src': HTMLAttributes.src || '',
                'data-caption': HTMLAttributes.caption || '',
            }),
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(VideoBlockComponent);
    },
});