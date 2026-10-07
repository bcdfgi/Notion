'use client';
import React, { useState } from 'react';
import {
    Copy,
    Files,
    CornerUpRight,
    Trash2,
    SlidersHorizontal,
    Languages,
    Undo2,
    Download,
    Upload,
    ChevronRight,
    Search
} from 'lucide-react';

export default function PageMoreMenu({
                                         editor,
                                         onClose,
                                         onDeletePage,
                                         fontStyle = 'default',
                                         setFontStyle,
                                         isSmallText = false,
                                         setIsSmallText,
                                         isFullWidth = false,
                                         setIsFullWidth,
                                         userEmail = "User"
                                     }) {
    const [search, setSearch] = useState('');

    const handleCopyContents = () => {
        if (!editor) return;
        const text = editor.getText();
        navigator.clipboard.writeText(text);
        onClose();
    };

    const handleDuplicate = () => {
        if (!editor) return;
        const content = editor.getJSON();
        navigator.clipboard.writeText(JSON.stringify(content));
        onClose();
    };

    const handleExport = () => {
        if (!editor) return;
        const markdown = editor.getText();
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'page.md';
        a.click();
        URL.revokeObjectURL(url);
        onClose();
    };

    const text = editor?.state.doc.textContent || '';
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

    return (
        <div className="w-64 rounded-xl border border-gray-200 bg-white shadow-2xl p-2 text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-100 select-none">
            {/* Search Input */}
            <div className="relative mb-2">
                <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search actions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-8 pr-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                />
            </div>

            {/* Font Style Switcher */}
            <div className="grid grid-cols-3 gap-1.5 p-1 mb-2 bg-gray-50 rounded-lg">
                <button
                    type="button"
                    onClick={() => setFontStyle?.('default')}
                    className={`flex flex-col items-center py-1.5 rounded-md transition-all ${
                        fontStyle === 'default' ? 'bg-white shadow-sm text-slate-900 font-semibold' : 'text-gray-500 hover:text-slate-800'
                    }`}
                >
                    <span className="text-sm font-sans">Ag</span>
                    <span className="text-[10px] mt-0.5">Default</span>
                </button>
                <button
                    type="button"
                    onClick={() => setFontStyle?.('serif')}
                    className={`flex flex-col items-center py-1.5 rounded-md transition-all ${
                        fontStyle === 'serif' ? 'bg-white shadow-sm text-blue-600 font-semibold' : 'text-gray-500 hover:text-slate-800'
                    }`}
                >
                    <span className="text-sm font-serif">Ag</span>
                    <span className="text-[10px] mt-0.5">Serif</span>
                </button>
                <button
                    type="button"
                    onClick={() => setFontStyle?.('mono')}
                    className={`flex flex-col items-center py-1.5 rounded-md transition-all ${
                        fontStyle === 'mono' ? 'bg-white shadow-sm text-slate-900 font-semibold' : 'text-gray-500 hover:text-slate-800'
                    }`}
                >
                    <span className="text-sm font-mono">Ag</span>
                    <span className="text-[10px] mt-0.5">Mono</span>
                </button>
            </div>

            {/* Core Actions */}
            <div className="space-y-0.5">
                <button
                    type="button"
                    onClick={handleCopyContents}
                    className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <Copy size={14} className="text-gray-500" />
                    <span>Copy page contents</span>
                </button>

                <button
                    type="button"
                    onClick={handleDuplicate}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <div className="flex items-center gap-2.5">
                        <Files size={14} className="text-gray-500" />
                        <span>Duplicate</span>
                    </div>
                    <span className="text-[10px] text-gray-400">⌘D</span>
                </button>

                <button
                    type="button"
                    onClick={onClose}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <div className="flex items-center gap-2.5">
                        <CornerUpRight size={14} className="text-gray-500" />
                        <span>Move to</span>
                    </div>
                    <span className="text-[10px] text-gray-400">⌘⇧P</span>
                </button>

                <button
                    type="button"
                    onClick={() => {
                        onDeletePage?.();
                        onClose();
                    }}
                    className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                >
                    <Trash2 size={14} className="text-red-500" />
                    <span>Move to Trash</span>
                </button>
            </div>

            <div className="my-1.5 border-t border-gray-100" />

            {/* Layout Toggles */}
            <div className="space-y-0.5">
                <div className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-slate-600">Small text</span>
                    <button
                        type="button"
                        onClick={() => setIsSmallText?.(!isSmallText)}
                        className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors ${
                            isSmallText ? 'bg-blue-500' : 'bg-gray-200'
                        }`}
                    >
                        <div
                            className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform ${
                                isSmallText ? 'translate-x-4' : 'translate-x-0'
                            }`}
                        />
                    </button>
                </div>

                <div className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-slate-600">Full width</span>
                    <button
                        type="button"
                        onClick={() => setIsFullWidth?.(!isFullWidth)}
                        className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors ${
                            isFullWidth ? 'bg-blue-500' : 'bg-gray-200'
                        }`}
                    >
                        <div
                            className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform ${
                                isFullWidth ? 'translate-x-4' : 'translate-x-0'
                            }`}
                        />
                    </button>
                </div>


            </div>

            <div className="my-1.5 border-t border-gray-100" />


            <div className="space-y-0.5">






                <button
                    type="button"
                    onClick={handleExport}
                    className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <Upload size={14} className="text-gray-500" />
                    <span>Export</span>
                </button>
            </div>

            {/* Footer Word Count & Edit Info */}
            <div className="mt-2 pt-2 border-t border-gray-100 px-2 text-[10px] text-gray-400 space-y-0.5">
                <div>{wordCount} words</div>
                <div>Last edited by {userEmail.split('@')[0]}</div>
            </div>
        </div>
    );
}