'use client';
import React, { useState, useRef, useCallback } from 'react';
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { ImageIcon, AlertCircle } from 'lucide-react';

const MAX_FILE_SIZE = 1024 * 1024; // 1 MB (1,048,576 bytes)

const ImageBlockView = (props) => {
    const { node, updateAttributes, editor } = props;
    const [activeTab, setActiveTab] = useState('upload');
    const [linkInput, setLinkInput] = useState('');
    const [showPopover, setShowPopover] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const fileInputRef = useRef(null);

    // Resizing state
    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef(null);

    const src = node?.attrs?.src;
    const widthPercent = Number(node?.attrs?.width) || 100;
    const alignment = node?.attrs?.alignment || 'center';

    // Keep a synchronous ref of the current width to prevent closure lag during drag
    const currentWidthRef = useRef(widthPercent);
    currentWidthRef.current = widthPercent;

    const commitImage = (imageSrc, altText = '') => {
        setShowPopover(false);
        setErrorMessage('');

        updateAttributes({
            src: imageSrc,
            alt: altText || 'Embedded image',
            width: 100,
        });

        if (editor) {
            editor.view.dispatch(editor.state.tr.scrollIntoView());
            editor.commands.focus();
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        e.target.value = '';

        if (!file.type.startsWith('image/')) {
            setErrorMessage('Please select a valid image file (PNG, JPG, WebP, GIF).');
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);
            setErrorMessage(`Image is ${sizeInMb} MB. Maximum allowed size is 1.00 MB.`);
            return;
        }

        setErrorMessage('');

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1200;
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height = Math.round((MAX_WIDTH / width) * height);
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const compressed = canvas.toDataURL('image/jpeg', 0.85);
                commitImage(compressed, file.name);
            };
            img.src = event.target?.result;
        };
        reader.readAsDataURL(file);
    };

    const handleEmbedLink = (e) => {
        e.preventDefault();
        if (linkInput.trim()) {
            commitImage(linkInput.trim(), 'Embedded image');
        }
    };

    // --- Notion Drag Resizing Logic ---
    const startResize = useCallback((e, direction) => {
        e.preventDefault();
        e.stopPropagation();

        setIsResizing(true);
        const startX = e.clientX;
        const initialWidth = currentWidthRef.current;

        // Find the full editor width container
        const parentWidth =
            containerRef.current?.closest('.tiptap')?.clientWidth ||
            containerRef.current?.parentElement?.clientWidth ||
            700;

        const onMouseMove = (moveEvent) => {
            moveEvent.preventDefault();
            const deltaX = moveEvent.clientX - startX;
            const multiplier = direction === 'right' ? 1 : -1;

            // Calculate change in percentage of content area
            const deltaPercent = ((deltaX * 2 * multiplier) / parentWidth) * 100;
            const targetWidth = Math.min(100, Math.max(20, Math.round(initialWidth + deltaPercent)));

            currentWidthRef.current = targetWidth;

            // Direct DOM update for 60fps instant visual response
            if (containerRef.current) {
                containerRef.current.style.width = `${targetWidth}%`;
            }
        };

        const onMouseUp = () => {
            setIsResizing(false);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);

            // Persist the final calculated width to the document schema
            updateAttributes({ width: currentWidthRef.current });

            if (editor) {
                editor.commands.focus();
            }
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }, [updateAttributes, editor]);

    // RENDER: Image with Notion Resizing Handles
    if (src && typeof src === 'string' && src.trim() !== '') {
        const alignClass =
            alignment === 'left' ? 'justify-start' :
                alignment === 'right' ? 'justify-end' : 'justify-center';

        return (
            <NodeViewWrapper className={`my-4 flex ${alignClass} w-full select-none`}>
                <div
                    ref={containerRef}
                    style={{ width: `${widthPercent}%` }}
                    className="relative group/image flex items-center justify-center"
                >
                    <img
                        src={src}
                        alt={node.attrs.alt || 'Embedded image'}
                        className={`rounded-md w-full h-auto object-cover pointer-events-none select-none ${
                            isResizing ? 'ring-2 ring-blue-500' : ''
                        }`}
                    />

                    {/* Notion Left Resizing Handle */}
                    <div
                        contentEditable={false}
                        onMouseDown={(e) => startResize(e, 'left')}
                        className={`absolute -left-2.5 top-1/2 -translate-y-1/2 w-3 h-12 rounded-full cursor-ew-resize opacity-0 group-hover/image:opacity-100 transition-opacity z-30 flex items-center justify-center ${
                            isResizing ? '!opacity-100' : ''
                        }`}
                        title="Drag to resize"
                    >
                        <div className="w-1.5 h-10 bg-white/95 rounded-full shadow-md border border-gray-300 hover:bg-white hover:scale-105 transition-all flex items-center justify-center">
                            <div className="w-0.5 h-3 bg-gray-400 rounded-full" />
                        </div>
                    </div>

                    {/* Notion Right Resizing Handle */}
                    <div
                        contentEditable={false}
                        onMouseDown={(e) => startResize(e, 'right')}
                        className={`absolute -right-2.5 top-1/2 -translate-y-1/2 w-3 h-12 rounded-full cursor-ew-resize opacity-0 group-hover/image:opacity-100 transition-opacity z-30 flex items-center justify-center ${
                            isResizing ? '!opacity-100' : ''
                        }`}
                        title="Drag to resize"
                    >
                        <div className="w-1.5 h-10 bg-white/95 rounded-full shadow-md border border-gray-300 hover:bg-white hover:scale-105 transition-all flex items-center justify-center">
                            <div className="w-0.5 h-3 bg-gray-400 rounded-full" />
                        </div>
                    </div>
                </div>
            </NodeViewWrapper>
        );
    }

    // RENDER: Placeholder Upload Menu
    return (
        <NodeViewWrapper className="my-3 select-none relative block">
            <div
                onClick={() => {
                    setErrorMessage('');
                    setShowPopover(true);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-3 rounded-md bg-[#F7F6F5] hover:bg-[#EFEFEF] text-slate-500 hover:text-slate-700 cursor-pointer transition-colors"
            >
                <ImageIcon size={18} className="text-gray-400" />
                <span className="text-xs font-medium">Add an image</span>
            </div>

            {showPopover && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-transparent"
                        onClick={() => {
                            setShowPopover(false);
                            setErrorMessage('');
                        }}
                    />

                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute left-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200/90 p-3 z-50 animate-in fade-in zoom-in-95 duration-100"
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
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full py-2 px-3 border border-gray-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-xs"
                                >
                                    Upload file
                                </button>

                                {errorMessage ? (
                                    <div className="flex items-start gap-1.5 p-2 bg-red-50 border border-red-200 rounded-md text-red-600 text-[11px] leading-tight font-medium">
                                        <AlertCircle size={14} className="shrink-0 mt-0.5" />
                                        <span>{errorMessage}</span>
                                    </div>
                                ) : (
                                    <p className="text-[10px] text-gray-400 text-center">
                                        The maximum size per file is 1MB.
                                    </p>
                                )}
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
    // Set to false so ProseMirror does not cancel custom mouse drag handlers:
    draggable: false,

    addAttributes() {
        return {
            src: {
                default: null,
            },
            alt: {
                default: '',
            },
            width: {
                default: 100,
                parseHTML: (el) => parseInt(el.getAttribute('data-width') || '100', 10),
                renderHTML: (attrs) => ({ 'data-width': attrs.width }),
            },
            alignment: {
                default: 'center',
                parseHTML: (el) => el.getAttribute('data-alignment') || 'center',
                renderHTML: (attrs) => ({ 'data-alignment': attrs.alignment }),
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
                    width: parseInt(dom.getAttribute('data-width') || '100', 10),
                    alignment: dom.getAttribute('data-alignment') || 'center',
                }),
            },
            {
                tag: 'img[data-type="image-block"]',
                getAttrs: (dom) => ({
                    src: dom.getAttribute('src') || null,
                    alt: dom.getAttribute('alt') || '',
                    width: parseInt(dom.getAttribute('data-width') || '100', 10),
                    alignment: dom.getAttribute('data-alignment') || 'center',
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
                'data-width': HTMLAttributes.width || 100,
                'data-alignment': HTMLAttributes.alignment || 'center',
            }),
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(ImageBlockView);
    },
});