'use client';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import {
    ImageIcon,
    AlertCircle,
    MoreHorizontal,
    RefreshCw,
    Copy,
    Download,
    MessageSquareText,
    ChevronRight,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Link as LinkIcon,
    Maximize2,
    ExternalLink,
    Trash2,
    CopyPlus,
    X,
    Crop,
    FileText,
} from 'lucide-react';
import PageIcon from './PageIcon';

const MAX_FILE_SIZE = 1024 * 1024; // 1 MB

const ImageBlockView = (props) => {
    const { node, updateAttributes, editor, deleteNode } = props;
    const [activeTab, setActiveTab] = useState('upload');
    const [linkInput, setLinkInput] = useState('');
    const [showPopover, setShowPopover] = useState(false);
    const [showReplaceModal, setShowReplaceModal] = useState(false);
    const [showLinkPopover, setShowLinkPopover] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const fileInputRef = useRef(null);
    const replaceInputRef = useRef(null);

    // Resizing state
    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef(null);

    // Action Menu state
    const [showMenu, setShowMenu] = useState(false);
    const [showMoreSubmenu, setShowMoreSubmenu] = useState(false);
    const [showAlignSubmenu, setShowAlignSubmenu] = useState(false);
    const [searchAction, setSearchAction] = useState('');
    const [showCaption, setShowCaption] = useState(Boolean(node.attrs.caption));
    const [isFullScreen, setIsFullScreen] = useState(false);

    // Available Notion Pages
    const [pages, setPages] = useState(() => {
        if (typeof window !== 'undefined' && window.__NOTION_PAGES__) {
            return window.__NOTION_PAGES__;
        }
        return [];
    });

    useEffect(() => {
        const handlePagesUpdate = (e) => {
            if (e.detail) setPages(e.detail);
        };
        window.addEventListener('notion:pages-updated', handlePagesUpdate);
        return () => window.removeEventListener('notion:pages-updated', handlePagesUpdate);
    }, []);

    // Crop Modal State
    const [isCropping, setIsCropping] = useState(false);
    const [cropRect, setCropRect] = useState({ x: 5, y: 5, width: 90, height: 90 });
    const cropImgRef = useRef(null);
    const cropBoxRef = useRef(null);

    const src = node?.attrs?.src;
    const widthPercent = Number(node?.attrs?.width) || 100;
    const alignment = node?.attrs?.alignment || 'center';
    const alt = node?.attrs?.alt || '';
    const caption = node?.attrs?.caption || '';
    const link = node?.attrs?.link || '';
    const pageId = node?.attrs?.pageId || '';

    const currentWidthRef = useRef(widthPercent);
    currentWidthRef.current = widthPercent;

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.image-action-menu') && !e.target.closest('.image-menu-btn')) {
                setShowMenu(false);
                setShowMoreSubmenu(false);
                setShowAlignSubmenu(false);
            }
            if (!e.target.closest('.image-link-popover') && !e.target.closest('.link-trigger-btn')) {
                setShowLinkPopover(false);
            }
        };
        if (showMenu || showLinkPopover) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showMenu, showLinkPopover]);

    const commitImage = (imageSrc, altText = '') => {
        setShowPopover(false);
        setShowReplaceModal(false);
        setErrorMessage('');
        setLinkInput('');

        updateAttributes({
            src: imageSrc,
            alt: altText || 'Embedded image',
        });

        if (editor) {
            editor.view.dispatch(editor.state.tr.scrollIntoView());
            editor.commands.focus();
        }
    };

    const processFile = (file) => {
        if (!file.type.startsWith('image/')) {
            setErrorMessage('Please select a valid image file.');
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

    // --- Image Click Destination ---
    const handleImageClick = (e) => {
        if (isResizing) return;

        if (pageId) {
            e.preventDefault();
            e.stopPropagation();
            // Trigger internal page navigation
            const pillTarget = document.createElement('div');
            pillTarget.setAttribute('data-page-id', pageId);
            const clickEvt = new MouseEvent('click', { bubbles: true, cancelable: true });
            document.querySelector('.tiptap')?.dispatchEvent(clickEvt) ||
            window.dispatchEvent(new CustomEvent('notion:navigate-page', { detail: { pageId } }));
        } else if (link) {
            window.open(link, '_blank', 'noopener,noreferrer');
        }
    };

    // --- Actions ---
    const handleCopyImage = async () => {
        setShowMenu(false);
        try {
            const response = await fetch(src);
            const blob = await response.blob();
            await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
        } catch {
            await navigator.clipboard.writeText(src);
        }
    };

    const handleDownload = () => {
        setShowMenu(false);
        const a = document.createElement('a');
        a.href = src;
        a.download = alt || 'image.jpg';
        a.click();
    };

    const handleDuplicate = () => {
        setShowMenu(false);
        if (editor) {
            const { selection } = editor.state;
            editor.chain().focus().insertContentAt(selection.to, {
                type: 'imageBlock',
                attrs: { ...node.attrs },
            }).run();
        }
    };

    const handleCopyLinkToBlock = () => {
        setShowMenu(false);
        navigator.clipboard.writeText(window.location.href);
    };

    const handleOpenLinkPopover = () => {
        setShowMenu(false);
        setShowMoreSubmenu(false);
        setShowAlignSubmenu(false);
        setSearchQuery(link || '');
        setShowLinkPopover(true);
    };

    const handleSaveUrl = (urlToSave) => {
        let finalUrl = urlToSave.trim();
        if (finalUrl && !finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
            finalUrl = `https://${finalUrl}`;
        }
        updateAttributes({ link: finalUrl, pageId: '' });
        setShowLinkPopover(false);
    };

    const handleSelectInternalPage = (targetPage) => {
        updateAttributes({
            pageId: targetPage._id,
            link: '',
        });
        setShowLinkPopover(false);
    };

    const handleRemoveLink = () => {
        updateAttributes({ link: '', pageId: '' });
        setShowLinkPopover(false);
    };

    const handleEditAltText = () => {
        const text = window.prompt('Enter alternative text (alt text):', alt || '');
        if (text !== null) {
            updateAttributes({ alt: text.trim() });
        }
        setShowMenu(false);
        setShowMoreSubmenu(false);
        setShowAlignSubmenu(false);
    };

    // --- Crop Execution ---
    const handleSaveCrop = () => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const naturalW = img.naturalWidth;
            const naturalH = img.naturalHeight;

            const cropPixelX = (cropRect.x / 100) * naturalW;
            const cropPixelY = (cropRect.y / 100) * naturalH;
            const cropPixelW = (cropRect.width / 100) * naturalW;
            const cropPixelH = (cropRect.height / 100) * naturalH;

            canvas.width = Math.max(1, Math.round(cropPixelW));
            canvas.height = Math.max(1, Math.round(cropPixelH));

            const ctx = canvas.getContext('2d');
            ctx.drawImage(
                img,
                cropPixelX,
                cropPixelY,
                cropPixelW,
                cropPixelH,
                0,
                0,
                canvas.width,
                canvas.height
            );

            const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
            updateAttributes({ src: croppedDataUrl });
            setIsCropping(false);
        };
        img.src = src;
    };

    const startCropDrag = (e, handleType) => {
        e.preventDefault();
        e.stopPropagation();

        const startMouseX = e.clientX;
        const startMouseY = e.clientY;
        const initialCrop = { ...cropRect };

        const bounds = cropBoxRef.current?.parentElement?.getBoundingClientRect();
        if (!bounds) return;

        const onMouseMove = (moveEvent) => {
            const deltaXPercent = ((moveEvent.clientX - startMouseX) / bounds.width) * 100;
            const deltaYPercent = ((moveEvent.clientY - startMouseY) / bounds.height) * 100;

            let { x, y, width, height } = initialCrop;

            if (handleType === 'nw') {
                const newX = Math.max(0, Math.min(x + width - 10, x + deltaXPercent));
                const newY = Math.max(0, Math.min(y + height - 10, y + deltaYPercent));
                width += x - newX;
                height += y - newY;
                x = newX;
                y = newY;
            } else if (handleType === 'ne') {
                const newY = Math.max(0, Math.min(y + height - 10, y + deltaYPercent));
                width = Math.min(100 - x, Math.max(10, width + deltaXPercent));
                height += y - newY;
                y = newY;
            } else if (handleType === 'sw') {
                const newX = Math.max(0, Math.min(x + width - 10, x + deltaXPercent));
                width += x - newX;
                height = Math.min(100 - y, Math.max(10, height + deltaYPercent));
                x = newX;
            } else if (handleType === 'se') {
                width = Math.min(100 - x, Math.max(10, width + deltaXPercent));
                height = Math.min(100 - y, Math.max(10, height + deltaYPercent));
            } else if (handleType === 'top') {
                const newY = Math.max(0, Math.min(y + height - 10, y + deltaYPercent));
                height += y - newY;
                y = newY;
            } else if (handleType === 'bottom') {
                height = Math.min(100 - y, Math.max(10, height + deltaYPercent));
            } else if (handleType === 'left') {
                const newX = Math.max(0, Math.min(x + width - 10, x + deltaXPercent));
                width += x - newX;
                x = newX;
            } else if (handleType === 'right') {
                width = Math.min(100 - x, Math.max(10, width + deltaXPercent));
            } else if (handleType === 'move') {
                x = Math.max(0, Math.min(100 - width, x + deltaXPercent));
                y = Math.max(0, Math.min(100 - height, y + deltaYPercent));
            }

            setCropRect({ x, y, width, height });
        };

        const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    // --- Drag Resizing ---
    const startResize = useCallback((e, direction) => {
        e.preventDefault();
        e.stopPropagation();

        setIsResizing(true);
        const startX = e.clientX;
        const initialWidth = currentWidthRef.current;

        const parentWidth =
            containerRef.current?.closest('.tiptap')?.clientWidth ||
            containerRef.current?.parentElement?.clientWidth ||
            700;

        const onMouseMove = (moveEvent) => {
            moveEvent.preventDefault();
            const deltaX = moveEvent.clientX - startX;
            const multiplier = direction === 'right' ? 1 : -1;
            const deltaPercent = ((deltaX * 2 * multiplier) / parentWidth) * 100;
            const targetWidth = Math.min(100, Math.max(20, Math.round(initialWidth + deltaPercent)));

            currentWidthRef.current = targetWidth;
            if (containerRef.current) {
                containerRef.current.style.width = `${targetWidth}%`;
            }
        };

        const onMouseUp = () => {
            setIsResizing(false);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            updateAttributes({ width: currentWidthRef.current });
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }, [updateAttributes]);

    // Filter pages for Notion Link search
    const filteredPages = pages.filter((p) =>
        (p.title || 'Untitled').toLowerCase().includes(searchQuery.toLowerCase().trim())
    );

    // Linked page object if connected to internal page
    const linkedPageObj = pages.find((p) => String(p._id) === String(pageId));

    // RENDER: Image with Notion Action Menu & Resizing
    if (src && typeof src === 'string' && src.trim() !== '') {
        return (
            <NodeViewWrapper
                data-page-id={pageId || undefined}
                className={`my-4 flex flex-col ${
                    alignment === 'left'
                        ? 'items-start'
                        : alignment === 'right'
                            ? 'items-end'
                            : 'items-center'
                } w-full select-none relative group/imageWrapper`}
            >
                <div
                    ref={containerRef}
                    style={{ width: `${widthPercent}%` }}
                    className="relative group/image flex flex-col items-center"
                >
                    {/* Clickable Image or Link Wrapped */}
                    <div
                        onClick={handleImageClick}
                        className={`relative w-full overflow-hidden rounded-md ${
                            link || pageId ? 'cursor-pointer' : ''
                        }`}
                    >
                        <img
                            src={src}
                            alt={alt}
                            className={`rounded-md w-full h-auto object-cover select-none ${
                                isResizing ? 'ring-2 ring-blue-500' : ''
                            }`}
                        />

                        {/* Top-Right Notion Options Button */}
                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover/image:opacity-100 transition-opacity z-20">
                            <button
                                type="button"
                                contentEditable={false}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMenu((prev) => !prev);
                                    setShowMoreSubmenu(false);
                                    setShowAlignSubmenu(false);
                                }}
                                className="image-menu-btn p-1 bg-white/90 hover:bg-white text-gray-700 rounded-md shadow-sm border border-gray-200 transition-colors backdrop-blur-xs"
                                title="Image options"
                            >
                                <MoreHorizontal size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Resizing Handles */}
                    <div
                        contentEditable={false}
                        onMouseDown={(e) => startResize(e, 'left')}
                        className={`absolute -left-2.5 top-1/2 -translate-y-1/2 w-3 h-12 cursor-ew-resize opacity-0 group-hover/image:opacity-100 transition-opacity z-20 flex items-center justify-center ${
                            isResizing ? '!opacity-100' : ''
                        }`}
                    >
                        <div className="w-1.5 h-10 bg-white/95 rounded-full shadow-md border border-gray-300 flex items-center justify-center">
                            <div className="w-0.5 h-3 bg-gray-400 rounded-full" />
                        </div>
                    </div>

                    <div
                        contentEditable={false}
                        onMouseDown={(e) => startResize(e, 'right')}
                        className={`absolute -right-2.5 top-1/2 -translate-y-1/2 w-3 h-12 cursor-ew-resize opacity-0 group-hover/image:opacity-100 transition-opacity z-20 flex items-center justify-center ${
                            isResizing ? '!opacity-100' : ''
                        }`}
                    >
                        <div className="w-1.5 h-10 bg-white/95 rounded-full shadow-md border border-gray-300 flex items-center justify-center">
                            <div className="w-0.5 h-3 bg-gray-400 rounded-full" />
                        </div>
                    </div>

                    {/* Caption Field */}
                    {showCaption && (
                        <div className="mt-2 w-full px-1">
                            <input
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

                    {/* --- Notion Image Context Menu --- */}
                    {showMenu && (
                        <div
                            contentEditable={false}
                            className="image-action-menu absolute right-2 top-9 w-60 bg-white rounded-xl shadow-2xl border border-gray-200 p-1.5 z-50 text-slate-700 animate-in fade-in zoom-in-95 duration-75 select-none"
                        >
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
                                Image
                            </div>

                            {/* Replace */}
                            <button
                                type="button"
                                onClick={() => {
                                    setShowMenu(false);
                                    setActiveTab('upload');
                                    setErrorMessage('');
                                    setShowReplaceModal(true);
                                }}
                                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded hover:bg-gray-100 transition-colors"
                            >
                                <RefreshCw size={14} className="text-gray-500" />
                                <span>Replace</span>
                            </button>

                            {/* Copy Image */}
                            <button
                                type="button"
                                onClick={handleCopyImage}
                                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded hover:bg-gray-100 transition-colors"
                            >
                                <Copy size={14} className="text-gray-500" />
                                <span>Copy image</span>
                            </button>

                            {/* Download */}
                            <button
                                type="button"
                                onClick={handleDownload}
                                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded hover:bg-gray-100 transition-colors"
                            >
                                <Download size={14} className="text-gray-500" />
                                <span>Download</span>
                            </button>

                            {/* Caption */}
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCaption((prev) => !prev);
                                    setShowMenu(false);
                                }}
                                className="w-full flex items-center justify-between px-2 py-1.5 text-xs rounded hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <MessageSquareText size={14} className="text-gray-500" />
                                    <span>Caption</span>
                                </div>
                            </button>

                            {/* More Options Nested Trigger */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowMoreSubmenu((prev) => !prev);
                                        setShowAlignSubmenu(false);
                                    }}
                                    className="w-full flex items-center justify-between px-2 py-1.5 text-xs rounded hover:bg-gray-100 transition-colors"
                                >
                                    <span className="pl-5 text-slate-700">More options</span>
                                    <ChevronRight size={14} className="text-gray-400" />
                                </button>

                                {showMoreSubmenu && (
                                    <div className="absolute right-full top-0 mr-1 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 p-1.5 z-50 animate-in fade-in duration-75">
                                        {/* Crop Image */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowMenu(false);
                                                setShowMoreSubmenu(false);
                                                setCropRect({ x: 5, y: 5, width: 90, height: 90 });
                                                setIsCropping(true);
                                            }}
                                            className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded hover:bg-gray-100 transition-colors"
                                        >
                                            <Crop size={14} className="text-gray-500" />
                                            <span>Crop image</span>
                                        </button>

                                        {/* Align Trigger */}
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setShowAlignSubmenu((prev) => !prev)}
                                                className="w-full flex items-center justify-between px-2 py-1.5 text-xs rounded hover:bg-gray-100 transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <AlignCenter size={14} className="text-gray-500" />
                                                    <span>Align</span>
                                                </div>
                                                <ChevronRight size={14} className="text-gray-400" />
                                            </button>

                                            {showAlignSubmenu && (
                                                <div className="absolute right-full top-0 mr-1 w-32 bg-white rounded-lg shadow-xl border border-gray-200 p-1 z-50">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            updateAttributes({ alignment: 'left' });
                                                            setShowMenu(false);
                                                            setShowMoreSubmenu(false);
                                                            setShowAlignSubmenu(false);
                                                        }}
                                                        className={`w-full flex items-center gap-2 px-2 py-1 text-xs rounded hover:bg-gray-100 ${
                                                            alignment === 'left' ? 'font-semibold text-blue-600' : ''
                                                        }`}
                                                    >
                                                        <AlignLeft size={13} />
                                                        <span>Left</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            updateAttributes({ alignment: 'center' });
                                                            setShowMenu(false);
                                                            setShowMoreSubmenu(false);
                                                            setShowAlignSubmenu(false);
                                                        }}
                                                        className={`w-full flex items-center gap-2 px-2 py-1 text-xs rounded hover:bg-gray-100 ${
                                                            alignment === 'center' ? 'font-semibold text-blue-600' : ''
                                                        }`}
                                                    >
                                                        <AlignCenter size={13} />
                                                        <span>Center</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            updateAttributes({ alignment: 'right' });
                                                            setShowMenu(false);
                                                            setShowMoreSubmenu(false);
                                                            setShowAlignSubmenu(false);
                                                        }}
                                                        className={`w-full flex items-center gap-2 px-2 py-1 text-xs rounded hover:bg-gray-100 ${
                                                            alignment === 'right' ? 'font-semibold text-blue-600' : ''
                                                        }`}
                                                    >
                                                        <AlignRight size={13} />
                                                        <span>Right</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Add link to image trigger */}
                                        <button
                                            type="button"
                                            onClick={handleOpenLinkPopover}
                                            className="link-trigger-btn w-full flex items-center justify-between px-2 py-1.5 text-xs rounded hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <LinkIcon size={14} className="text-gray-500" />
                                                <span>{link || pageId ? 'Edit link' : 'Add link to image'}</span>
                                            </div>
                                            <span className="text-[10px] text-gray-400">⌘K</span>
                                        </button>

                                        {/* Alt text */}
                                        <button
                                            type="button"
                                            onClick={handleEditAltText}
                                            className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded hover:bg-gray-100 transition-colors"
                                        >
                                            <span className="font-mono text-[11px] font-bold text-gray-500">ALT</span>
                                            <span>Alt text</span>
                                        </button>

                                        {/* Full screen */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsFullScreen(true);
                                                setShowMenu(false);
                                                setShowMoreSubmenu(false);
                                            }}
                                            className="w-full flex items-center justify-between px-2 py-1.5 text-xs rounded hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Maximize2 size={14} className="text-gray-500" />
                                                <span>Full screen</span>
                                            </div>
                                            <span className="text-[10px] text-gray-400">Space</span>
                                        </button>

                                        {/* View original */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                window.open(src, '_blank');
                                                setShowMenu(false);
                                                setShowMoreSubmenu(false);
                                            }}
                                            className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded hover:bg-gray-100 transition-colors"
                                        >
                                            <ExternalLink size={14} className="text-gray-500" />
                                            <span>View original</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="h-px bg-gray-100 my-1" />

                            {/* Copy link to block */}
                            <button
                                type="button"
                                onClick={handleCopyLinkToBlock}
                                className="w-full flex items-center justify-between px-2 py-1.5 text-xs rounded hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <LinkIcon size={14} className="text-gray-500" />
                                    <span>Copy link to block</span>
                                </div>
                                <span className="text-[10px] text-gray-400">⌘^L</span>
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
                                <span className="text-[10px] text-gray-400">⌘D</span>
                            </button>

                            {/* Delete */}
                            <button
                                type="button"
                                onClick={() => deleteNode()}
                                className="w-full flex items-center justify-between px-2 py-1.5 text-xs text-red-600 rounded hover:bg-red-50 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <Trash2 size={14} />
                                    <span>Delete</span>
                                </div>
                                <span className="text-[10px] text-red-400">Del</span>
                            </button>
                        </div>
                    )}

                    {/* --- Notion "Paste link or search pages" Popover --- */}
                    {showLinkPopover && (
                        <div
                            contentEditable={false}
                            className="image-link-popover absolute left-2 bottom-full mb-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200/90 p-2.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                        >
                            {/* Input Form */}
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (searchQuery.trim()) {
                                        handleSaveUrl(searchQuery);
                                    }
                                }}
                                className="relative mb-2"
                            >
                                <input
                                    type="text"
                                    autoFocus
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Paste link or search pages"
                                    className="w-full px-3 py-1.5 border border-blue-500 rounded-lg text-xs outline-none shadow-xs text-slate-800 placeholder:text-gray-400"
                                />
                            </form>

                            {/* Existing Link Notice with Remove Option */}
                            {(link || pageId) && (
                                <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 text-[11px]">
                                    <span className="text-gray-500 truncate max-w-[200px]">
                                        Linked to:{' '}
                                        <strong className="text-slate-800 font-medium">
                                            {pageId ? linkedPageObj?.title || 'Notion Page' : link}
                                        </strong>
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleRemoveLink}
                                        className="text-red-500 hover:text-red-700 flex items-center gap-1 font-medium transition-colors"
                                    >
                                        <Trash2 size={12} />
                                        Remove link
                                    </button>
                                </div>
                            )}

                            {/* Workspace Subpages List */}
                            <div className="px-1 py-1 text-[11px] font-semibold text-gray-400">
                                {searchQuery ? 'Matching pages' : 'Recents'}
                            </div>

                            <div className="max-h-48 overflow-y-auto space-y-0.5">
                                {filteredPages.length > 0 ? (
                                    filteredPages.map((p) => (
                                        <button
                                            key={p._id}
                                            type="button"
                                            onClick={() => handleSelectInternalPage(p)}
                                            className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-lg hover:bg-gray-100 transition-colors text-left ${
                                                String(pageId) === String(p._id)
                                                    ? 'bg-blue-50 text-blue-600 font-medium'
                                                    : 'text-slate-700'
                                            }`}
                                        >
                                            {p.icon ? (
                                                <PageIcon icon={p.icon} size={15} />
                                            ) : (
                                                <FileText size={15} className="text-gray-400 shrink-0" />
                                            )}
                                            <span className="truncate">{p.title || 'Untitled'}</span>
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-2 py-3 text-center text-xs text-gray-400">
                                        Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-[10px]">Enter</kbd> to link to external URL
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* --- Replace Popover --- */}
                    {showReplaceModal && (
                        <>
                            <div
                                className="fixed inset-0 z-40 bg-transparent"
                                onClick={() => {
                                    setShowReplaceModal(false);
                                    setErrorMessage('');
                                }}
                            />
                            <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-2 top-9 w-80 bg-white rounded-xl shadow-2xl border border-gray-200/90 p-3 z-50 animate-in fade-in zoom-in-95 duration-100"
                            >
                                <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
                                    <div className="flex items-center gap-4 text-xs font-medium">
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
                                    <button
                                        type="button"
                                        onClick={() => setShowReplaceModal(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>

                                {activeTab === 'upload' && (
                                    <div className="space-y-2">
                                        <input
                                            ref={replaceInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    e.target.value = '';
                                                    processFile(file);
                                                }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => replaceInputRef.current?.click()}
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
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            if (linkInput.trim()) commitImage(linkInput.trim(), 'Embedded image');
                                        }}
                                        className="space-y-2"
                                    >
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
                </div>

                {/* --- Notion Crop Image Modal --- */}
                {isCropping && (
                    <div
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none"
                        onClick={() => setIsCropping(false)}
                    >
                        <div
                            className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                                <div className="w-16" />
                                <span className="font-semibold text-sm text-slate-800">Crop image</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsCropping(false)}
                                        className="px-2.5 py-1 text-xs text-slate-600 hover:bg-gray-100 rounded transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSaveCrop}
                                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded shadow-xs transition-colors"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>

                            <div className="relative p-6 bg-[#FAFAFA] flex items-center justify-center overflow-hidden max-h-[70vh]">
                                <div className="relative inline-block max-w-full">
                                    <img
                                        ref={cropImgRef}
                                        src={src}
                                        alt={alt}
                                        className="max-h-[55vh] max-w-full object-contain pointer-events-none select-none block"
                                    />

                                    <div
                                        className="absolute inset-0 pointer-events-none"
                                        style={{
                                            boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.45)`,
                                            clipPath: `polygon(
                                                0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%,
                                                ${cropRect.x}% ${cropRect.y}%, 
                                                ${cropRect.x + cropRect.width}% ${cropRect.y}%, 
                                                ${cropRect.x + cropRect.width}% ${cropRect.y + cropRect.height}%, 
                                                ${cropRect.x}% ${cropRect.y + cropRect.height}%, 
                                                ${cropRect.x}% ${cropRect.y}%
                                            )`,
                                        }}
                                    />

                                    <div
                                        ref={cropBoxRef}
                                        style={{
                                            left: `${cropRect.x}%`,
                                            top: `${cropRect.y}%`,
                                            width: `${cropRect.width}%`,
                                            height: `${cropRect.height}%`,
                                        }}
                                        onMouseDown={(e) => startCropDrag(e, 'move')}
                                        className="absolute border border-white/90 shadow-xs cursor-move pointer-events-auto"
                                    >
                                        <div
                                            onMouseDown={(e) => startCropDrag(e, 'nw')}
                                            className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-white cursor-nwse-resize"
                                        />
                                        <div
                                            onMouseDown={(e) => startCropDrag(e, 'ne')}
                                            className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-white cursor-nesw-resize"
                                        />
                                        <div
                                            onMouseDown={(e) => startCropDrag(e, 'sw')}
                                            className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-white cursor-nesw-resize"
                                        />
                                        <div
                                            onMouseDown={(e) => startCropDrag(e, 'se')}
                                            className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-white cursor-nwse-resize"
                                        />

                                        <div
                                            onMouseDown={(e) => startCropDrag(e, 'top')}
                                            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-1.5 bg-white/90 rounded-full shadow cursor-ns-resize"
                                        />
                                        <div
                                            onMouseDown={(e) => startCropDrag(e, 'bottom')}
                                            className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-8 h-1.5 bg-white/90 rounded-full shadow cursor-ns-resize"
                                        />
                                        <div
                                            onMouseDown={(e) => startCropDrag(e, 'left')}
                                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-1.5 h-8 bg-white/90 rounded-full shadow cursor-ew-resize"
                                        />
                                        <div
                                            onMouseDown={(e) => startCropDrag(e, 'right')}
                                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-1.5 h-8 bg-white/90 rounded-full shadow cursor-ew-resize"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- Fullscreen Lightbox Modal --- */}
                {isFullScreen && (
                    <div
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-8 select-none"
                        onClick={() => setIsFullScreen(false)}
                    >
                        <button
                            type="button"
                            onClick={() => setIsFullScreen(false)}
                            className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                        <img
                            src={src}
                            alt={alt}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                )}
            </NodeViewWrapper>
        );
    }

    // RENDER: Placeholder Upload Area
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
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            e.target.value = '';
                                            processFile(file);
                                        }
                                    }}
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
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (linkInput.trim()) commitImage(linkInput.trim(), 'Embedded image');
                                }}
                                className="space-y-2"
                            >
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
    draggable: false,

    addAttributes() {
        return {
            src: {
                default: null,
            },
            alt: {
                default: '',
            },
            caption: {
                default: '',
            },
            link: {
                default: '',
            },
            pageId: {
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
                    caption: dom.getAttribute('data-caption') || '',
                    link: dom.getAttribute('data-link') || '',
                    pageId: dom.getAttribute('data-page-id') || '',
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
                'data-alt': HTMLAttributes.alt || '',
                'data-caption': HTMLAttributes.caption || '',
                'data-link': HTMLAttributes.link || '',
                'data-page-id': HTMLAttributes.pageId || '',
                'data-width': HTMLAttributes.width || 100,
                'data-alignment': HTMLAttributes.alignment || 'center',
            }),
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(ImageBlockView);
    },
});