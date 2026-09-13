'use client';
import React, { useState, useEffect, useRef } from 'react';
import PageIcon from './PageIcon';
import { FileText, Search } from 'lucide-react';

export const PageLinkModal = ({ isOpen, onClose, pages = [], currentPageId, onSelectPage }) => {
    const [search, setSearch] = useState('');
    const inputRef = useRef(null);
    const modalRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setSearch('');
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                onClose();
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Filter out current page and match search query
    const filteredPages = pages.filter((p) =>
        p._id !== currentPageId &&
        (p.title || 'Untitled').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-xs">
            <div
                ref={modalRef}
                className="w-80 max-h-[380px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100"
            >
                {/* Search Input Bar */}
                <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100">
                    <Search size={14} className="text-gray-400 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search for a page..."
                        className="w-full text-xs outline-none bg-transparent text-slate-800 placeholder:text-gray-400"
                    />
                </div>

                {/* Subtitle */}
                <div className="px-3 pt-2 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    Select a page
                </div>

                {/* Page List */}
                <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
                    {filteredPages.length === 0 ? (
                        <div className="px-3 py-6 text-center text-xs text-gray-400">
                            No matching pages found
                        </div>
                    ) : (
                        filteredPages.map((p) => (
                            <button
                                key={p._id}
                                type="button"
                                onClick={() => {
                                    onSelectPage(p);
                                    onClose();
                                }}
                                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-gray-100 transition-colors text-left"
                            >
                                <span className="shrink-0 flex items-center justify-center text-sm">
                                    {p.icon ? (
                                        <PageIcon icon={p.icon} size={15} />
                                    ) : (
                                        <FileText size={15} className="text-gray-400" />
                                    )}
                                </span>
                                <span className="truncate">{p.title || 'Untitled'}</span>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};