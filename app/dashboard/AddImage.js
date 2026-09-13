'use client';
import React, { useState, useRef } from 'react';
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { ImageIcon } from 'lucide-react';

const ImageBlockView = (props) => {
    const { node, updateAttributes, editor } = props;
    const [activeTab, setActiveTab] = useState('upload');
    const [linkInput, setLinkInput] = useState('');
    const [showPopover, setShowPopover] = useState(false);
    const fileInputRef = useRef(null);

    const src = node?.attrs?.src;

    const commitImage = (imageSrc, altText = '') => {
        setShowPopover(false);

        // 1. Update the node attribute
        updateAttributes({
            src: imageSrc,
            alt: altText || 'Embedded image',
        });

        // 2. Dispatch a minimal doc change so TipTap fires onUpdate and auto-saves
        if (editor) {
            editor.view.dispatch(editor.state.tr.scrollIntoView());
            editor.commands.focus();
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 900;
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height = (MAX_WIDTH / width) * height;
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const compressed = canvas.toDataURL('image/jpeg', 0.65);
                commitImage(compressed, file.name);
            };
        };
    };

    const handleEmbedLink = (e) => {
        e.preventDefault();
        if (linkInput.trim()) {
            commitImage(linkInput.trim(), 'Embedded image');
        }
    };

    if (src && typeof src === 'string' && src.trim() !== '') {
        return (
            <NodeViewWrapper className="my-4 relative group block">
                <img
                    src={src}
                    alt={node.attrs.alt || 'Embedded image'}
                    className="rounded-lg max-w-full h-auto shadow-sm block select-none pointer-events-auto"
                />
            </NodeViewWrapper>
        );
    }

    return (
        <NodeViewWrapper className="my-3 select-none relative block">
            <div
                onClick={() => setShowPopover(true)}
                className="w-full flex items-center gap-2.5 px-4 py-3 rounded-md bg-[#F7F6F5] hover:bg-[#EFEFEF] text-slate-500 hover:text-slate-700 cursor-pointer transition-colors"
            >
                <ImageIcon size={18} className="text-gray-400" />
                <span className="text-xs font-medium">Add an image</span>
            </div>

            {showPopover && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowPopover(false)}
                    />
                    <div className="absolute left-4 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200/80 p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                        <div className="flex items-center gap-4 border-b border-gray-100 pb-2 mb-3 text-xs font-medium">
                            <button
                                type="button"
                                onClick={() => setActiveTab('upload')}
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
                                onClick={() => setActiveTab('link')}
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
                            <div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full py-2 px-3 border border-gray-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-gray-50 transition-colors shadow-xs"
                                >
                                    Upload file
                                </button>
                                <p className="text-[10px] text-gray-400 text-center mt-2">
                                    The maximum size per file is 1MB.
                                </p>
                            </div>
                        )}

                        {activeTab === 'link' && (
                            <form onSubmit={handleEmbedLink} className="space-y-2">
                                <input
                                    type="url"
                                    value={linkInput}
                                    onChange={(e) => setLinkInput(e.target.value)}
                                    placeholder="Paste image link..."
                                    autoFocus
                                    className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                                <button
                                    type="submit"
                                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
                                >
                                    Embed image
                                </button>
                            </form>
                        )}
                    </div>
                </>
            )}
        </NodeViewWrapper>
    );
};

export const ImageBlock = Node.create({
    name: 'imageBlock',
    group: 'block',
    atom: true,
    selectable: true,
    draggable: true,

    addAttributes() {
        return {
            src: {
                default: null,
            },
            alt: {
                default: '',
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="image-block"]',
                getAttrs: (dom) => ({
                    src: dom.getAttribute('data-src') || dom.getAttribute('src') || null,
                    alt: dom.getAttribute('data-alt') || dom.getAttribute('alt') || '',
                }),
            },
            {
                tag: 'img[data-type="image-block"]',
                getAttrs: (dom) => ({
                    src: dom.getAttribute('src') || null,
                    alt: dom.getAttribute('alt') || '',
                }),
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes(HTMLAttributes, {
                'data-type': 'image-block',
                'data-src': HTMLAttributes.src || '',
            }),
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(ImageBlockView);
    },
});