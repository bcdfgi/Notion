'use client';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import {
    Table as TableIcon,
    LayoutGrid,
    Kanban,
    List as ListIcon,
    Calendar as CalendarIcon,
    Plus,
    Search,
    Filter,
    ArrowUpDown,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    X,
    Trash2,
    Image as ImageIcon
} from 'lucide-react';

// All 5 allowed views: Table, Board, Gallery, List, Calendar
const VIEW_DEFINITIONS = [
    { type: 'table', label: 'Table', icon: TableIcon },
    { type: 'board', label: 'Board', icon: Kanban },
    { type: 'gallery', label: 'Gallery', icon: LayoutGrid },
    { type: 'list', label: 'List', icon: ListIcon },
    { type: 'calendar', label: 'Calendar', icon: CalendarIcon }
];

export default function DatabaseBlock({ node, updateAttributes, deleteNode }) {
    const {
        title = 'Untitled',
        views = [{ id: 'view-1', name: 'Table', type: 'table' }],
        activeViewId = 'view-1',
        rows = []
    } = node.attrs;

    const [showViewPicker, setShowViewPicker] = useState(false);
    const [pickerPos, setPickerPos] = useState({ top: 0, left: 0 });
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [activeRow, setActiveRow] = useState(null);
    const plusButtonRef = useRef(null);
    const modalRef = useRef(null);

    const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

    const currentActiveView = views.find(v => v.id === activeViewId) || views[0] || { id: 'view-1', name: 'Table', type: 'table' };

    const handleTogglePicker = (e) => {
        e.stopPropagation();
        if (!showViewPicker && plusButtonRef.current) {
            const rect = plusButtonRef.current.getBoundingClientRect();
            setPickerPos({
                top: rect.bottom + 6,
                left: rect.left
            });
            setShowViewPicker(true);
        } else {
            setShowViewPicker(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                modalRef.current &&
                !modalRef.current.contains(e.target) &&
                plusButtonRef.current &&
                !plusButtonRef.current.contains(e.target)
            ) {
                setShowViewPicker(false);
            }
        };

        if (showViewPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showViewPicker]);

    const handleAddView = (viewDef) => {
        const count = views.filter(v => v.type === viewDef.type).length;
        const viewName = count === 0 ? viewDef.label : `${viewDef.label} ${count}`;

        const newView = {
            id: `view-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            name: viewName,
            type: viewDef.type
        };

        updateAttributes({
            views: [...views, newView],
            activeViewId: newView.id
        });
        setShowViewPicker(false);
    };

    const handleAddPage = (defaultDate = null, defaultStatus = 'Not Started') => {
        const newPage = {
            id: `page-${Date.now()}`,
            title: '',
            icon: '♡',
            cover: '',
            status: defaultStatus,
            date: defaultDate || new Date().toISOString().split('T')[0]
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

    const boardColumns = useMemo(() => {
        const defaultCols = ['Not Started', 'In Progress', 'Done'];
        const customCols = rows.map(r => r.status).filter(Boolean);
        return Array.from(new Set([...defaultCols, ...customCols]));
    }, [rows]);

    const calendarDays = useMemo(() => {
        const year = currentMonthDate.getFullYear();
        const month = currentMonthDate.getMonth();
        const firstDayIndex = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        for (let i = 0; i < firstDayIndex; i++) {
            days.push({ empty: true, key: `empty-${i}` });
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            days.push({
                day,
                dateStr,
                items: filteredRows.filter(r => r.date === dateStr),
                key: dateStr
            });
        }
        return days;
    }, [currentMonthDate, filteredRows]);

    return (
        <NodeViewWrapper className="my-8 not-prose select-none font-sans group/db">
            <div className="w-full text-slate-800">
                {/* 1. DATABASE TITLE */}
                <div className="flex items-center justify-between group/title mb-2">
                    <input
                        type="text"
                        value={title}
                        placeholder="Untitled database"
                        onChange={(e) => updateAttributes({ title: e.target.value })}
                        className="text-2xl font-bold text-slate-800 bg-transparent focus:outline-none placeholder:text-gray-300 w-full tracking-tight"
                    />
                    <button
                        type="button"
                        onClick={deleteNode}
                        className="opacity-0 group-hover/db:opacity-100 p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition-all ml-2"
                        title="Delete database"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>

                {/* 2. TAB CONTROLS */}
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <div className="flex items-center gap-1.5">
                        {views.map((view) => {
                            const def = VIEW_DEFINITIONS.find(d => d.type === view.type) || VIEW_DEFINITIONS[0];
                            const Icon = def.icon;
                            const isActive = view.id === currentActiveView?.id;
                            return (
                                <button
                                    key={view.id}
                                    type="button"
                                    onClick={() => updateAttributes({ activeViewId: view.id })}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[13px] transition-colors ${
                                        isActive
                                            ? 'bg-gray-200/70 text-slate-900 font-medium'
                                            : 'text-gray-500 hover:text-slate-800 hover:bg-gray-100/60'
                                    }`}
                                >
                                    <Icon size={14} className={isActive ? 'text-slate-800' : 'text-gray-400'} />
                                    <span>{view.name}</span>
                                </button>
                            );
                        })}

                        {/* Plus Button */}
                        <button
                            ref={plusButtonRef}
                            type="button"
                            onClick={handleTogglePicker}
                            className="p-1 hover:bg-gray-100 text-gray-400 hover:text-slate-700 rounded-md transition-colors"
                            title="Add a view"
                        >
                            <Plus size={14} />
                        </button>
                    </div>

                    {/* Right Tools */}
                    <div className="flex items-center gap-1.5">
                        {showSearch ? (
                            <div className="flex items-center bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-md">
                                <Search size={13} className="text-gray-400 mr-1.5" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search..."
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

                        <div className="flex items-center bg-[#2383E2] hover:bg-blue-600 text-white rounded-md shadow-xs ml-1 overflow-hidden">
                            <button
                                type="button"
                                onClick={() => handleAddPage()}
                                className="px-2.5 py-1 text-xs font-semibold flex items-center gap-1 active:scale-95"
                            >
                                New
                            </button>
                            <div className="w-[1px] h-3.5 bg-blue-400/60" />
                            <button
                                type="button"
                                onClick={() => handleAddPage()}
                                className="px-1.5 py-1 hover:bg-blue-700 transition-colors"
                            >
                                <ChevronDown size={12} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- TABLE VIEW --- */}
                {currentActiveView?.type === 'table' && (
                    <div className="w-full border-b border-gray-200/80 overflow-x-auto mt-1">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                            <tr className="border-b border-gray-200/70 text-gray-400 text-[12px] bg-white">
                                <th className="py-2 px-3 font-normal w-1/2 border-r border-gray-100">Name</th>
                                <th className="py-2 px-3 font-normal w-1/2 border-r border-gray-100">Add Property</th>

                                <th className="w-8 border-r border-gray-100 px-2 text-center text-gray-400 font-light">
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
                            onClick={() => handleAddPage()}
                            className="py-2 px-3 text-xs text-gray-400 hover:text-slate-800 flex items-center gap-1.5 transition-colors"
                        >
                            <Plus size={13} /> New page
                        </button>
                    </div>
                )}

                {/* --- BOARD VIEW --- */}
                {currentActiveView?.type === 'board' && (
                    <div className="grid grid-cols-3 gap-3 pt-4 min-h-[220px]">
                        {boardColumns.map((col) => {
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
                                        onClick={() => handleAddPage(null, col)}
                                        className="py-1 text-xs text-gray-400 hover:text-slate-700 flex items-center gap-1 px-1 rounded hover:bg-gray-200/50"
                                    >
                                        <Plus size={13} /> New card
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* --- GALLERY VIEW --- */}
                {currentActiveView?.type === 'gallery' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4">
                        {filteredRows.map((row) => (
                            <div
                                key={row.id}
                                onClick={() => setActiveRow(row)}
                                className="group border border-gray-200/80 rounded-2xl overflow-hidden hover:shadow-lg transition-all bg-white cursor-pointer flex flex-col justify-between"
                            >
                                <div className="h-36 w-full overflow-hidden bg-gray-100 relative">
                                    {row.cover ? (
                                        <img src={row.cover} alt="cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
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
                                <div className="p-3 bg-white flex items-center gap-1.5">
                                    <span className="text-sm text-gray-500">{row.icon || '♡'}</span>
                                    <input
                                        type="text"
                                        value={row.title}
                                        placeholder="Untitled"
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => handleUpdateRow(row.id, 'title', e.target.value)}
                                        className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none placeholder:text-gray-300"
                                    />
                                </div>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={() => handleAddPage()}
                            className="h-48 border border-dashed border-gray-200 hover:border-gray-400 rounded-2xl flex items-center justify-center text-xs text-gray-400 hover:text-slate-700 transition-all hover:bg-gray-50/50"
                        >
                            <span className="flex items-center gap-1.5">
                                <Plus size={14} /> New page
                            </span>
                        </button>
                    </div>
                )}

                {/* --- LIST VIEW --- */}
                {currentActiveView?.type === 'list' && (
                    <div className="divide-y divide-gray-100 pt-2">
                        {filteredRows.map((row) => (
                            <div
                                key={row.id}
                                onClick={() => setActiveRow(row)}
                                className="flex items-center justify-between px-2 py-2 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors group"
                            >
                                <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-4">
                                    <span className="text-gray-400">♡</span>
                                    <input
                                        type="text"
                                        value={row.title}
                                        placeholder="Untitled"
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => handleUpdateRow(row.id, 'title', e.target.value)}
                                        className="bg-transparent focus:outline-none text-xs font-medium text-slate-800 flex-1"
                                    />
                                </div>
                                <span className="text-[11px] text-gray-400">{row.date}</span>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => handleAddPage()}
                            className="w-full text-left py-2 px-2 text-xs text-gray-400 hover:text-slate-700 flex items-center gap-1.5"
                        >
                            <Plus size={13} /> New page
                        </button>
                    </div>
                )}

                {/* --- CALENDAR VIEW --- */}
                {currentActiveView?.type === 'calendar' && (
                    <div className="pt-3">
                        <div className="flex items-center justify-between px-2 mb-3">
                            <span className="text-sm font-bold text-slate-800">
                                {currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </span>
                            <div className="flex items-center gap-1 text-gray-500">
                                <button
                                    type="button"
                                    onClick={() => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1))}
                                    className="p-1 hover:bg-gray-100 rounded"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCurrentMonthDate(new Date())}
                                    className="px-2 py-0.5 text-xs font-medium hover:bg-gray-100 rounded"
                                >
                                    Today
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1))}
                                    className="p-1 hover:bg-gray-100 rounded"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 border border-gray-200/80 rounded-xl overflow-hidden text-xs">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="bg-gray-50/70 p-2 text-center text-gray-400 font-medium border-b border-r border-gray-100">
                                    {day}
                                </div>
                            ))}
                            {calendarDays.map((cell) => {
                                if (cell.empty) {
                                    return <div key={cell.key} className="h-24 bg-gray-50/20 border-b border-r border-gray-100" />;
                                }
                                return (
                                    <div
                                        key={cell.key}
                                        onClick={() => handleAddPage(cell.dateStr)}
                                        className="h-24 p-1.5 border-b border-r border-gray-100 hover:bg-gray-50/50 transition-colors flex flex-col justify-between group cursor-pointer"
                                    >
                                        <div className="flex items-center justify-between text-[11px] text-gray-400">
                                            <span>{cell.day}</span>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); handleAddPage(cell.dateStr); }}
                                                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-blue-500"
                                            >
                                                <Plus size={11} />
                                            </button>
                                        </div>

                                        <div className="space-y-1 overflow-y-auto max-h-16">
                                            {cell.items.map(item => (
                                                <div
                                                    key={item.id}
                                                    onClick={(e) => { e.stopPropagation(); setActiveRow(item); }}
                                                    className="bg-white border border-gray-200/80 shadow-xs px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-800 truncate hover:bg-gray-50"
                                                >
                                                    {item.title || 'Untitled'}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* FIXED POPUP OVERLAY FOR "ADD A NEW VIEW" */}
            {showViewPicker && (
                <div
                    ref={modalRef}
                    style={{ top: `${pickerPos.top}px`, left: `${pickerPos.left}px` }}
                    className="fixed z-[100] w-[280px] bg-white border border-gray-200/90 shadow-[0_12px_32px_rgba(0,0,0,0.14)] rounded-2xl p-3 animate-in fade-in zoom-in-95 duration-100"
                >
                    <div className="text-[11px] font-medium text-gray-400 mb-2.5 px-1">
                        Add a new view
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                        {VIEW_DEFINITIONS.map((def) => {
                            const Icon = def.icon;
                            return (
                                <button
                                    key={def.type}
                                    type="button"
                                    onClick={() => handleAddView(def)}
                                    className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-gray-100 transition-all text-slate-700 group hover:scale-[1.03]"
                                >
                                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-50 group-hover:bg-white text-gray-500 group-hover:text-slate-900 border border-gray-200/60 shadow-xs mb-1.5 transition-colors">
                                        <Icon size={17} strokeWidth={1.8} />
                                    </div>
                                    <span className="text-[11px] font-normal leading-tight text-center truncate w-full">
                                        {def.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* SIDE PEEK INSPECTOR DRAWER */}
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
                                <span className="w-28 text-gray-400">Date</span>
                                <input
                                    type="date"
                                    value={activeRow.date || ''}
                                    onChange={(e) => handleUpdateRow(activeRow.id, 'date', e.target.value)}
                                    className="border border-gray-200 px-2 py-1 rounded focus:outline-none text-slate-800"
                                />
                            </div>
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