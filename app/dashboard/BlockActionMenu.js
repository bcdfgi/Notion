'use client';
import React, { useState } from 'react';
import {
    RefreshCw,
    Palette,
    Link,
    Copy,
    CornerUpRight,
    Trash2,
    ChevronRight
} from 'lucide-react';
import { slashItems } from './SlashCommands';

export default function BlockActionMenu({ editor, onClose, userEmail = "User" }) {
    const [search, setSearch] = useState('');
    const [submenu, setSubmenu] = useState(null); // 'turnInto' | 'color' | null

    const turnIntoItems = slashItems.filter(i => i.group === 'Turn into');
    const textColors = slashItems.filter(i => i.group === 'Text color');
    const bgColors = slashItems.filter(i => i.group === 'Background color');

    const handleDuplicate = () => {
        if (!editor) return;
        const { state } = editor;
        const { selection } = state;
        const node = selection.$from.parent;
        editor.chain().focus().insertContentAt(selection.$from.after(), node.toJSON()).run();
        onClose();
    };

    const handleDelete = () => {
        if (!editor) return;
        const { selection } = editor.state;
        const from = selection.$from.before(1);
        const to = selection.$from.after(1);
        editor.chain().focus().deleteRange({ from, to }).run();
        onClose();
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        onClose();
    };

    const handleApplyCommand = (item) => {
        if (item.command && editor) {
            const { from, to } = editor.state.selection;
            item.command({ editor, range: { from, to } });
        }
        onClose();
    };


    const text = editor?.state.doc.textContent || '';
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    const charCount = text.length;

    return (
        <div className="relative z-50">
            <div className="w-64 rounded-xl border border-gray-200 bg-white shadow-2xl p-1.5 text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-100">

                <div className="p-1 mb-1">
                    <input
                        type="text"
                        placeholder="Search actions..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-blue-500 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-gray-400"
                        autoFocus
                    />
                </div>

                <div className="px-2 py-1 text-[11px] font-medium text-gray-400">Text</div>


                <div
                    className="relative"
                    onMouseEnter={() => setSubmenu('turnInto')}
                >
                    <button
                        type="button"
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <RefreshCw size={14} className="text-gray-500" />
                            <span>Turn into</span>
                        </div>
                        <ChevronRight size={13} className="text-gray-400" />
                    </button>

                    {submenu === 'turnInto' && (
                        <div
                            className="absolute left-full top-0 ml-1 w-52 max-h-64 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-2xl p-1.5 z-50"
                            onMouseLeave={() => setSubmenu(null)}
                        >
                            <div className="px-2 py-1 text-[10px] font-semibold text-gray-400 uppercase">Turn into</div>
                            {turnIntoItems.map((item, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleApplyCommand(item)}
                                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100 text-left transition-colors"
                                >
                                    <span className="w-4 text-center">{item.icon}</span>
                                    <span className="truncate">{item.title}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>


                <div
                    className="relative"
                    onMouseEnter={() => setSubmenu('color')}
                >
                    <button
                        type="button"
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Palette size={14} className="text-gray-500" />
                            <span>Color</span>
                        </div>
                        <ChevronRight size={13} className="text-gray-400" />
                    </button>

                    {submenu === 'color' && (
                        <div
                            className="absolute left-full top-0 ml-1 w-56 max-h-72 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-2xl p-1.5 z-50"
                            onMouseLeave={() => setSubmenu(null)}
                        >
                            <div className="px-2 py-1 text-[10px] font-semibold text-gray-400 uppercase">Text color</div>
                            {textColors.map((color, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                        editor?.chain().focus().setColor(color.title.toLowerCase().replace(' text', '')).run();
                                        onClose();
                                    }}
                                    className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"
                                >
                                    <span>{color.icon}</span>
                                    <span>{color.title}</span>
                                </button>
                            ))}

                            <div className="px-2 pt-2 pb-1 text-[10px] font-semibold text-gray-400 uppercase border-t border-gray-100 mt-1">Background color</div>
                            {bgColors.map((color, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={onClose}
                                    className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"
                                >
                                    <span>{color.icon}</span>
                                    <span>{color.title}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="my-1 border-t border-gray-100" />


                <button
                    type="button"
                    onClick={handleCopyLink}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <Link size={14} className="text-gray-500" />
                        <span>Copy link to block</span>
                    </div>
                    <span className="text-[10px] text-gray-400">⌘^L</span>
                </button>

                <button
                    type="button"
                    onClick={handleDuplicate}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <Copy size={14} className="text-gray-500" />
                        <span>Duplicate</span>
                    </div>
                    <span className="text-[10px] text-gray-400">⌘D</span>
                </button>

                <button
                    type="button"
                    onClick={onClose}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <CornerUpRight size={14} className="text-gray-500" />
                        <span>Move to</span>
                    </div>
                    <span className="text-[10px] text-gray-400">⌘⇧P</span>
                </button>

                <button
                    type="button"
                    onClick={handleDelete}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <Trash2 size={14} className="text-red-500" />
                        <span>Delete</span>
                    </div>
                    <span className="text-[10px] text-red-400">Del</span>
                </button>


                <div className="mt-2 pt-2 border-t border-gray-100 px-2 text-[10px] text-gray-400 space-y-0.5 select-none">
                    <div>Last edited by {userEmail.split('@')[0]}</div>
                    <div>{wordCount} words, {charCount} characters</div>
                </div>
            </div>
        </div>
    );
}