'use client';
import React, { useState, useEffect, useRef } from 'react';
import { FileText, Link as LinkIcon, FolderOpen, X } from 'lucide-react';

export function FileBadge({ fileData, onDownloadOrOpen, onRemove }) {
    if (!fileData) return null;

    const isLink = fileData.type === 'link';
    const displayName = fileData.name || (isLink ? fileData.url : 'Untitled file');

    return (
        <span
            onClick={(e) => {
                e.stopPropagation();
                onDownloadOrOpen(fileData);
            }}
            className="group/badge inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#F1F1EF] hover:bg-[#E3E2E0] text-[#37352F] text-xs font-medium cursor-pointer transition-colors max-w-full select-none"
            title={isLink ? `Open link: ${fileData.url}` : `Download: ${displayName}`}
        >
            {isLink ? (
                <LinkIcon size={12} className="text-gray-500 shrink-0" />
            ) : (
                <FileText size={12} className="text-gray-500 shrink-0" />
            )}
            <span className="truncate max-w-[140px] underline-offset-2 group-hover/badge:underline">
                {displayName}
            </span>
            {onRemove && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    className="opacity-0 group-hover/badge:opacity-100 hover:text-red-500 p-0.5 rounded text-gray-400"
                >
                    <X size={11} />
                </button>
            )}
        </span>
    );
}

export default function FilesCellPopover({ anchorRect, onSelectFile, onClose }) {
    const [activeTab, setActiveTab] = useState('upload');
    const [linkUrl, setLinkUrl] = useState('');
    const fileInputRef = useRef(null);
    const popoverRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target)) {
                onClose();
            }
        };
        const timer = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 10);
        return () => {
            clearTimeout(timer);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);


    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            onSelectFile({
                type: 'upload',
                name: file.name,
                size: file.size,
                fileType: file.type,
                dataUrl: reader.result,
            });
            onClose();
        };
        reader.readAsDataURL(file);
    };


    const handleSubmitLink = (e) => {
        e?.preventDefault();
        const trimmed = linkUrl.trim();
        if (!trimmed) return;

        let formattedUrl = trimmed;
        if (!/^https?:\/\//i.test(formattedUrl)) {
            formattedUrl = `https://${formattedUrl}`;
        }

        try {
            const urlObj = new URL(formattedUrl);
            onSelectFile({
                type: 'link',
                name: urlObj.hostname + (urlObj.pathname !== '/' ? urlObj.pathname : ''),
                url: formattedUrl,
            });
            onClose();
        } catch {

            onSelectFile({
                type: 'link',
                name: trimmed,
                url: formattedUrl,
            });
            onClose();
        }
    };

    return (
        <div
            ref={popoverRef}
            style={{
                top: `${(anchorRect?.bottom || 0) + 4}px`,
                left: `${Math.max(16, anchorRect?.left || 0)}px`,
            }}
            className="fixed z-[60] w-[270px] bg-white border border-gray-200/90 shadow-[0_14px_36px_rgba(0,0,0,0.14)] rounded-xl p-3 text-xs font-sans text-slate-700 animate-in fade-in zoom-in-95 duration-100 select-none"
            onMouseDown={(e) => e.stopPropagation()}
        >

            <div className="flex items-center gap-3 border-b border-gray-100 pb-2 mb-3">
                <button
                    type="button"
                    onClick={() => setActiveTab('upload')}
                    className={`text-xs font-semibold pb-1 relative transition-colors ${
                        activeTab === 'upload' ? 'text-slate-800' : 'text-gray-400 hover:text-slate-600'
                    }`}
                >
                    Upload
                    {activeTab === 'upload' && (
                        <div className="absolute bottom-[-9px] left-0 right-0 h-[2px] bg-slate-800 rounded-full" />
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('link')}
                    className={`text-xs font-semibold pb-1 relative transition-colors ${
                        activeTab === 'link' ? 'text-slate-800' : 'text-gray-400 hover:text-slate-600'
                    }`}
                >
                    Link
                    {activeTab === 'link' && (
                        <div className="absolute bottom-[-9px] left-0 right-0 h-[2px] bg-slate-800 rounded-full" />
                    )}
                </button>
            </div>


            {activeTab === 'upload' && (
                <div className="space-y-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-between px-3 py-2 bg-[#2383E2] hover:bg-blue-600 text-white font-medium rounded-lg shadow-2xs transition-colors cursor-pointer"
                    >
                        <span className="flex-1 text-center font-medium text-xs">Upload file</span>
                        <FolderOpen size={14} className="opacity-80" />
                    </button>

                    <p className="text-[11px] text-gray-400 text-center select-none pt-1">
                        or ⌘+V to paste an image
                    </p>
                </div>
            )}


            {activeTab === 'link' && (
                <form onSubmit={handleSubmitLink} className="space-y-2.5">
                    <input
                        type="text"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="Paste in https://..."
                        className="w-full px-2.5 py-1.5 border border-blue-500 rounded-lg text-xs font-normal text-slate-800 focus:outline-none"
                        autoFocus
                    />

                    <button
                        type="submit"
                        className="w-full py-1.5 bg-[#2383E2] hover:bg-blue-600 text-white font-medium rounded-lg shadow-2xs text-xs transition-colors cursor-pointer"
                    >
                        Link
                    </button>
                </form>
            )}
        </div>
    );
}