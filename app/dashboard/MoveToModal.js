'use client';
import React, { useState, useMemo } from 'react';
import { Search, ChevronRight, Lock, FileText } from 'lucide-react';
import PageIcon from './PageIcon';

export default function MoveToModal({ isOpen, onClose, pages = [], currentPageId, onSelectDestination }) {
    const [search, setSearch] = useState('');

    const filteredPages = useMemo(() => {
        return pages
            .filter((p) => p._id !== currentPageId) // Exclude current page
            .filter((p) => {
                const title = p.title || 'Untitled';
                return title.toLowerCase().includes(search.toLowerCase());
            });
    }, [pages, currentPageId, search]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
            {/* Click outside backdrop */}
            <div className="fixed inset-0" onClick={onClose} />

            <div className="relative z-10 w-[300px] rounded-xl border border-gray-200/90 bg-white shadow-2xl p-2.5 text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-100">
                {/* Search Input */}
                <div className="relative flex items-center mb-2">
                    <Search size={14} className="absolute left-2.5 text-gray-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Move page to..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-transparent border border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 placeholder:text-gray-400"
                        autoFocus
                    />
                </div>

                {/* Section Header */}
                <div className="px-2 py-1 text-[11px] font-medium text-gray-400 select-none">
                    Suggested
                </div>

                {/* Page List */}
                <div className="max-h-64 overflow-y-auto space-y-0.5 mt-1">
                    {filteredPages.length === 0 ? (
                        <div className="py-6 text-center text-gray-400 select-none">
                            No matching pages
                        </div>
                    ) : (
                        filteredPages.map((page) => (
                            <button
                                key={page._id}
                                type="button"
                                onClick={() => onSelectDestination(page)}
                                className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-gray-100 text-left transition-colors group"
                            >
                                <div className="flex items-center gap-2 min-w-0 pr-2">
                                    <ChevronRight size={12} className="text-gray-400 group-hover:text-gray-600 shrink-0" />
                                    <span className="shrink-0 flex items-center justify-center">
                                        {page.icon ? (
                                            <PageIcon icon={page.icon} size={15} />
                                        ) : (
                                            <FileText size={15} className="text-gray-400" />
                                        )}
                                    </span>
                                    <span className="truncate font-medium text-slate-700">
                                        {page.title || 'Untitled'}
                                    </span>
                                </div>
                                {page.isPrivate && (
                                    <Lock size={12} className="text-gray-400 shrink-0" />
                                )}
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}