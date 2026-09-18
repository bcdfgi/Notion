'use client';
import React, { useState, useRef, useEffect } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import {
    Table as TableIcon,
    LayoutGrid,
    Kanban,
    List as ListIcon,
    Plus,
    Search,
    Filter,
    ArrowUpDown,
    ChevronDown,
    Calendar,
    LineChart,
    Clock,
    Rss,
    MapPin,
    FileEdit,
    Maximize2,
    X,
    Image as ImageIcon
} from 'lucide-react';

const VIEW_DEFINITIONS = [
    { type: 'table', label: 'Table', icon: TableIcon },
    { type: 'board', label: 'Board', icon: Kanban },
    { type: 'gallery', label: 'Gallery', icon: LayoutGrid },
    { type: 'list', label: 'List', icon: ListIcon },
    { type: 'chart', label: 'Chart', icon: LineChart },
    { type: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { type: 'timeline', label: 'Timeline', icon: Clock },
    { type: 'feed', label: 'Feed', icon: Rss },
    { type: 'map', label: 'Map', icon: MapPin },
    { type: 'calendar', label: 'Calendar', icon: Calendar },
    { type: 'form', label: 'Form', icon: FileEdit }
];

const PRESET_COVERS = [
    'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop'
];

export default function DatabaseBlock({ node, updateAttributes, deleteNode }) {
    const {
        title = 'Untitled',
        views = [{ id: 'view-1', name: 'Table', type: 'table' }],
        activeViewId = 'view-1',
        rows = []
    } = node.attrs;

    const [showViewPicker, setShowViewPicker] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [activeRow, setActiveRow] = useState(null);
    const pickerRef = useRef(null);

    const activeView = views.find(v => v.id === activeViewId) || views[0] || { type: 'table' };

    // Close view modal on outside click
    useEffect(() => {
        const handleOutside = (e) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target)) {
                setShowViewPicker(false);
            }
        };
        if (showViewPicker) document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, [showViewPicker]);

    const handleAddView = (viewDef) => {
        const newView = {
            id: `view-${Date.now()}`,
            name: viewDef.label,
            type: viewDef.type
        };
        updateAttributes({
            views: [...views, newView],
            activeViewId: newView.id
        });
        setShowViewPicker(false);
    };

    const handleAddPage = () => {
        const randomCover = PRESET_COVERS[rows.length % PRESET_COVERS.length];
        const newPage = {
            id: `page-${Date.now()}`,
            title: '',
            icon: '♡',
            cover: randomCover,
            status: 'Not Started',
            date: new Date().toISOString().split('T')[0]
        };
        updateAttributes({ rows: [...rows, newPage] });
        setActiveRow(newPage);
    };

    const handleUpdateRow = (rowId, key, value) => {
        const next = rows.map(r => r.id === rowId ? { ...r, [key]: value } : r);
        updateAttributes({ rows: next });
        if (activeRow?.id === rowId) setActiveRow(prev => ({ ...prev, [key]: value }));
    };

    const handleDeleteRow = (rowId) => {
        updateAttributes({ rows: rows.filter(r => r.id !== rowId) });
        if (activeRow?.id === rowId) setActiveRow(null);
    };

    const filteredRows = rows.filter(r =>
        (r.title || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <NodeViewWrapper className="my-8 not-prose select-none font-sans">
            <div className="w-full text-slate-800">
                {/* DATABASE HEADER / CONTROLS (Matches Screenshot) */}
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                        {views.map((view) => {
                            const def = VIEW_DEFINITIONS.find(d => d.type === view.type) || VIEW_DEFINITIONS[0];
                            const Icon = def.icon;
                            const isActive = view.id === activeViewId;
                            return (
                                <button
                                    key={view.id}
                                    type="button"
                                    onClick={() => updateAttributes({ activeViewId: view.id })}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[13px] transition-colors ${
                                        isActive
                                            ? 'bg-gray-200/60 text-slate-900 font-medium'
                                            : 'text-gray-500 hover:text-slate-800 hover:bg-gray-100/60'
                                    }`}
                                >
                                    <Icon size={14} className={isActive ? 'text-slate-800' : 'text-gray-400'} />
                                    <span>{view.name}</span>
                                </button>
                            );
                        })}

                        {/* Plus (+) Button to Open the Notion View Picker */}
                        <div className="relative" ref={pickerRef}>
                            <button
                                type="button"
                                onClick={() => setShowViewPicker(prev => !prev)}
                                className="p-1 hover:bg-gray-100 text-gray-400 hover:text-slate-700 rounded-md transition-colors"
                            >
                                <Plus size={14} />
                            </button>

                            {/* EXACT NOTION "ADD A NEW VIEW" MODAL FROM SCREENSHOT */}
                            {showViewPicker && (
                                <div className="absolute left-0 top-full mt-1.5 z-50 w-[310px] bg-white border border-gray-200 shadow-2xl rounded-2xl p-3 animate-in fade-in zoom-in-95 duration-100">
                                    <div className="text-[11px] font-medium text-gray-400 mb-2.5 px-1">
                                        Add a new view
                                    </div>

                                    {/* 4-Column Grid View Selector */}
                                    <div className="grid grid-cols-4 gap-1.5">
                                        {VIEW_DEFINITIONS.map((def) => {
                                            const Icon = def.icon;
                                            return (
                                                <button
                                                    key={def.type}
                                                    type="button"
                                                    onClick={() => handleAddView(def)}
                                                    className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-gray-100 transition-all text-slate-700 group hover:scale-[1.03]"
                                                >
                                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50 group-hover:bg-white text-gray-500 group-hover:text-slate-800 border border-gray-100 shadow-xs mb-1">
                                                        <Icon size={16} />
                                                    </div>
                                                    <span className="text-[11px] font-normal leading-tight text-center truncate w-full">
                                                        {def.label}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-2 pt-2 border-t border-gray-100">
                                        <button
                                            type="button"
                                            onClick={() => handleAddView({ label: 'Table', type: 'table' })}
                                            className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-slate-600 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <Plus size={13} className="text-gray-400" />
                                            <span>New data source</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Tools: Filter, Sort, Search, Blue "New" Split Button */}
                    <div className="flex items-center gap-1.5">
                        {showSearch ? (
                            <div className="flex items-center bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-md">
                                <Search size={13} className="text-gray-400 mr-1.5" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search pages..."
                                    className="bg-transparent text-xs text-slate-800 focus:outline-none w-28"
                                    autoFocus
                                />
                                <button onClick={() => { setSearchQuery(''); setShowSearch(false); }}>
                                    <X size={12} className="text-gray-400" />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setShowSearch(true)}
                                className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-slate-700 rounded-md transition-colors"
                            >
                                <Search size={14} />
                            </button>
                        )}

                        <button className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-slate-700 rounded-md transition-colors">
                            <Filter size={14} />
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-slate-700 rounded-md transition-colors">
                            <ArrowUpDown size={14} />
                        </button>

                        {/* Blue Notion "New" Button */}
                        <div className="flex items-center bg-[#2383E2] hover:bg-blue-600 text-white rounded-md shadow-xs ml-1 overflow-hidden">
                            <button
                                type="button"
                                onClick={handleAddPage}
                                className="px-2.5 py-1 text-xs font-semibold flex items-center gap-1 active:scale-95"
                            >
                                New
                            </button>
                            <div className="w-[1px] h-3.5 bg-blue-400/60" />
                            <button
                                type="button"
                                onClick={handleAddPage}
                                className="px-1.5 py-1 hover:bg-blue-700 transition-colors"
                            >
                                <ChevronDown size={12} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- 1. GALLERY VIEW (MATCHES SCREENSHOT TILES) --- */}
                {activeView.type === 'gallery' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4">
                        {filteredRows.map((row) => (
                            <div
                                key={row.id}
                                onClick={() => setActiveRow(row)}
                                className="group border border-gray-200/80 rounded-2xl overflow-hidden hover:shadow-lg transition-all bg-white cursor-pointer flex flex-col justify-between"
                            >
                                {/* Banner Photo / Cover Thumbnail */}
                                <div className="h-36 w-full overflow-hidden bg-gray-100 relative">
                                    {row.cover ? (
                                        <img src={row.cover} alt="card cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                                            <ImageIcon size={28} />
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); handleDeleteRow(row.id); }}
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 bg-white/90 text-gray-400 hover:text-red-500 rounded-md shadow-xs transition-all"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>

                                {/* Title with Heart/Icon Underneath */}
                                <div className="p-3 bg-white flex items-center gap-1.5">
                                    <span className="text-sm text-gray-500">{row.icon || '♡'}</span>
                                    <input
                                        type="text"
                                        value={row.title}
                                        placeholder="Untitled"
                                        onChange={(e) => handleUpdateRow(row.id, 'title', e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none placeholder:text-gray-300"
                                    />
                                </div>
                            </div>
                        ))}

                        {/* Dashed "+ New page" Card Tile */}
                        <button
                            type="button"
                            onClick={handleAddPage}
                            className="h-48 border border-dashed border-gray-200 hover:border-gray-400 rounded-2xl flex items-center justify-center text-xs text-gray-400 hover:text-slate-700 transition-all hover:bg-gray-50/50"
                        >
                            <span className="flex items-center gap-1.5">
                                <Plus size={14} /> New page
                            </span>
                        </button>
                    </div>
                )}

                {/* --- 2. TABLE VIEW --- */}
                {activeView.type === 'table' && (
                    <div className="w-full border-b border-gray-200/80 overflow-x-auto mt-1">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                            <tr className="border-b border-gray-200/70 text-gray-400 text-[12px] bg-white">
                                <th className="py-2 px-3 font-normal w-1/2 border-r border-gray-100">Name</th>
                                <th className="py-2 px-3 font-normal w-1/4 border-r border-gray-100">Status</th>
                                <th className="py-2 px-3 font-normal w-1/4 border-r border-gray-100">Date</th>
                                <th className="w-8 border-r border-gray-100 px-2 text-center text-gray-400 font-light cursor-pointer hover:bg-gray-50">
                                    <Plus size={13} className="mx-auto" />
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredRows.map((row) => (
                                <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50/80 group transition-colors">
                                    <td className="p-1.5 px-3 border-r border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <input
                                                type="text"
                                                value={row.title}
                                                placeholder="Untitled"
                                                onChange={(e) => handleUpdateRow(row.id, 'title', e.target.value)}
                                                className="w-full bg-transparent focus:outline-none text-slate-800 text-xs font-medium placeholder:text-gray-300"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setActiveRow(row)}
                                                className="opacity-0 group-hover:opacity-100 ml-2 px-1.5 py-0.5 bg-white border border-gray-200 rounded shadow-xs text-[10px] text-gray-500 hover:text-slate-800 shrink-0 font-medium"
                                            >
                                                Open
                                            </button>
                                        </div>
                                    </td>
                                    <td className="p-1.5 px-3 border-r border-gray-100">
                                            <span className="text-[11px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                                                {row.status || 'Not Started'}
                                            </span>
                                    </td>
                                    <td className="p-1.5 px-3 border-r border-gray-100 text-gray-500">
                                        {row.date || 'Empty'}
                                    </td>
                                    <td className="p-1 text-center">
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteRow(row.id)}
                                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500"
                                        >
                                            ✕
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        <button
                            type="button"
                            onClick={handleAddPage}
                            className="py-2 px-3 text-xs text-gray-400 hover:text-slate-800 flex items-center gap-1.5 transition-colors"
                        >
                            <Plus size={13} /> New page
                        </button>
                    </div>
                )}

                {/* --- 3. BOARD (KANBAN) VIEW --- */}
                {activeView.type === 'board' && (
                    <div className="grid grid-cols-3 gap-3 pt-4 min-h-[220px]">
                        {['Not Started', 'In Progress', 'Done'].map((col) => {
                            const groupRows = filteredRows.filter(r => (r.status || 'Not Started') === col);
                            return (
                                <div key={col} className="bg-[#F7F6F3] rounded-xl p-2.5 flex flex-col gap-2">
                                    <div className="flex items-center justify-between text-xs font-semibold px-1 text-gray-500">
                                        <span>{col}</span>
                                        <span className="text-gray-400 font-normal">{groupRows.length}</span>
                                    </div>
                                    <div className="space-y-2 flex-1">
                                        {groupRows.map((row) => (
                                            <div
                                                key={row.id}
                                                onClick={() => setActiveRow(row)}
                                                className="bg-white p-3 rounded-xl border border-gray-200/70 shadow-xs hover:shadow-md cursor-pointer transition-all"
                                            >
                                                <div className="text-xs font-semibold text-slate-800">{row.title || 'Untitled'}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddPage}
                                        className="py-1 text-xs text-gray-400 hover:text-slate-700 flex items-center gap-1 px-1 rounded hover:bg-gray-200/50"
                                    >
                                        <Plus size={13} /> New card
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* --- 4. LIST & OTHER VIEWS --- */}
                {['list', 'timeline', 'dashboard', 'chart', 'feed', 'map', 'calendar', 'form'].includes(activeView.type) && activeView.type !== 'gallery' && activeView.type !== 'table' && activeView.type !== 'board' && (
                    <div className="divide-y divide-gray-100 pt-2">
                        {filteredRows.map((row) => (
                            <div
                                key={row.id}
                                onClick={() => setActiveRow(row)}
                                className="flex items-center justify-between px-2 py-2 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors group"
                            >
                                <div className="flex items-center gap-2.5">
                                    <span className="text-gray-400">♡</span>
                                    <span className="text-xs font-medium text-slate-800">{row.title || 'Untitled'}</span>
                                </div>
                                <span className="text-[11px] text-gray-400">{row.date}</span>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={handleAddPage}
                            className="w-full text-left py-2 px-2 text-xs text-gray-400 hover:text-slate-700 flex items-center gap-1.5"
                        >
                            <Plus size={13} /> New page
                        </button>
                    </div>
                )}
            </div>

            {/* SIDE PEEK DRAWER WHEN CLICKING A CARD OR "OPEN" */}
            {activeRow && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-[1px]">
                    <div className="fixed inset-0" onClick={() => setActiveRow(null)} />
                    <div className="relative z-10 w-full max-w-xl bg-white h-full shadow-2xl flex flex-col p-8 overflow-y-auto animate-in slide-in-from-right duration-200">
                        <div className="flex items-center justify-between pb-6 text-gray-400">
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Page Inspector</span>
                            <button onClick={() => setActiveRow(null)} className="p-1 hover:bg-gray-100 rounded text-gray-500">
                                <X size={16} />
                            </button>
                        </div>

                        <input
                            type="text"
                            value={activeRow.title}
                            placeholder="Untitled"
                            onChange={(e) => handleUpdateRow(activeRow.id, 'title', e.target.value)}
                            className="text-3xl font-bold text-slate-800 focus:outline-none mb-6"
                        />

                        <div className="space-y-3 pb-8 border-b border-gray-100 text-xs">
                            <div className="flex items-center">
                                <span className="w-28 text-gray-400">Cover Image URL</span>
                                <input
                                    type="text"
                                    value={activeRow.cover || ''}
                                    placeholder="Paste image link..."
                                    onChange={(e) => handleUpdateRow(activeRow.id, 'cover', e.target.value)}
                                    className="flex-1 border border-gray-200 px-2 py-1 rounded focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </NodeViewWrapper>
    );
}