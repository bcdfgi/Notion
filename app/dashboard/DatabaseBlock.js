'use client';
import React, { useState, useMemo } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import {
    Table as TableIcon,
    Kanban,
    LayoutGrid,
    List as ListIcon,
    Calendar as CalendarIcon,
    Plus,
    Search,
    Filter,
    ArrowUpDown,
    Zap,
    MoreHorizontal,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    X,
    Trash2,
    Clock,
    Tag,
    Type,
    SlidersHorizontal,
    Maximize2,
    Image as ImageIcon
} from 'lucide-react';

const NOTION_COLORS = {
    gray:   { bg: 'bg-[#F1F1EF]', text: 'text-[#5A5A5A]' },
    brown:  { bg: 'bg-[#F4EEEE]', text: 'text-[#78350F]' },
    orange: { bg: 'bg-[#FBECDD]', text: 'text-[#C2410C]' },
    yellow: { bg: 'bg-[#FBF3DB]', text: 'text-[#A16207]' },
    green:  { bg: 'bg-[#EDF3EC]', text: 'text-[#15803D]' },
    blue:   { bg: 'bg-[#E7F3F8]', text: 'text-[#0369A1]' },
    purple: { bg: 'bg-[#F4EEF8]', text: 'text-[#7E22CE]' },
    pink:   { bg: 'bg-[#F9EEF3]', text: 'text-[#BE185D]' },
    red:    { bg: 'bg-[#FDEBEC]', text: 'text-[#B91C1C]' },
};

const VIEW_DEFINITIONS = [
    { type: 'gallery', label: '~~~', icon: LayoutGrid },
    { type: 'table', label: 'Table', icon: TableIcon },
    { type: 'board', label: 'Board', icon: Kanban },
    { type: 'list', label: 'List', icon: ListIcon },
    { type: 'calendar', label: 'Calendar', icon: CalendarIcon },
];

export default function DatabaseBlock({ node, updateAttributes, deleteNode }) {
    const {
        title = 'new school year !',
        views = [
            { id: 'view-gallery', name: '~~~', type: 'gallery' },
            { id: 'view-table', name: 'Table', type: 'table' },
            { id: 'view-board', name: 'Board', type: 'board' },
            { id: 'view-list', name: 'List', type: 'list' },
            { id: 'view-calendar', name: 'Calendar', type: 'calendar' }
        ],
        activeViewId = 'view-calendar',
        properties = [
            { id: 'prop-title', name: 'Name', type: 'title' },
            { id: 'prop-created', name: 'Created', type: 'date' },
            { id: 'prop-tags', name: 'Tags', type: 'select', options: [] }
        ],
        rows = [
            { id: '1', icon: '♡', cover: '', values: { 'prop-title': 'Time Table', 'prop-created': '4 August 2024 13:42', 'prop-tags': '' } },
            { id: '2', icon: '♡', cover: '', values: { 'prop-title': 'Memories', 'prop-created': '24 February 2024 12:54', 'prop-tags': '' } },
            { id: '3', icon: '♡', cover: '', values: { 'prop-title': 'Manifestations', 'prop-created': '24 February 2024 12:50', 'prop-tags': '' } },
            { id: '4', icon: '♡', cover: '', values: { 'prop-title': 'to do list', 'prop-created': '2 January 2024 20:57', 'prop-tags': '' } },
            { id: '5', icon: '♡', cover: '', values: { 'prop-title': 'my student info', 'prop-created': '2 January 2024 20:57', 'prop-tags': '' } },
            { id: '6', icon: '♡', cover: '', values: { 'prop-title': 'digital notes', 'prop-created': '2 January 2024 20:57', 'prop-tags': '' } },
            { id: '7', icon: '♡', cover: '', values: { 'prop-title': 'classes', 'prop-created': '2 January 2024 20:57', 'prop-tags': '' } },
        ]
    } = node.attrs;

    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [activeRow, setActiveRow] = useState(null);
    const [activeSelectMenu, setActiveSelectMenu] = useState(null);
    const [showAddProperty, setShowAddProperty] = useState(false);
    const [newPropName, setNewPropName] = useState('');
    const [newPropType, setNewPropType] = useState('text');
    const [showNewGroupInput, setShowNewGroupInput] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');

    // Calendar state
    const [calendarDate, setCalendarDate] = useState(new Date());

    const currentActiveView = views.find(v => v.id === activeViewId) || views[0];
    const tagsProperty = properties.find(p => p.id === 'prop-tags' || p.type === 'select') || properties[2];

    const formatCurrentDateTime = () => {
        const d = new Date();
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    const handleAddRow = (dateStr = null, tagValue = '') => {
        const newRow = {
            id: `row-${Date.now()}`,
            icon: '♡',
            cover: '',
            date: dateStr || new Date().toISOString().split('T')[0],
            values: {
                'prop-title': '',
                'prop-created': formatCurrentDateTime(),
                'prop-tags': tagValue
            }
        };
        updateAttributes({ rows: [...rows, newRow] });
        setActiveRow(newRow);
    };

    const handleUpdateCell = (rowId, propId, val) => {
        const updated = rows.map(r => r.id === rowId ? { ...r, values: { ...(r.values || {}), [propId]: val } } : r);
        updateAttributes({ rows: updated });
        if (activeRow?.id === rowId) {
            setActiveRow(prev => ({ ...prev, values: { ...(prev.values || {}), [propId]: val } }));
        }
    };

    const handleUpdateCover = (rowId, coverUrl) => {
        const updated = rows.map(r => r.id === rowId ? { ...r, cover: coverUrl } : r);
        updateAttributes({ rows: updated });
        if (activeRow?.id === rowId) {
            setActiveRow(prev => ({ ...prev, cover: coverUrl }));
        }
    };

    const handleDeleteRow = (e, rowId) => {
        e.stopPropagation();
        updateAttributes({ rows: rows.filter(r => r.id !== rowId) });
        if (activeRow?.id === rowId) setActiveRow(null);
    };

    const handleAddProperty = () => {
        if (!newPropName.trim()) return;
        const newProp = {
            id: `prop-${Date.now()}`,
            name: newPropName.trim(),
            type: newPropType,
            options: newPropType === 'select' ? [
                { id: 'opt-1', label: 'Tag 1', color: 'blue' },
                { id: 'opt-2', label: 'Tag 2', color: 'green' }
            ] : undefined
        };
        updateAttributes({ properties: [...properties, newProp] });
        setNewPropName('');
        setShowAddProperty(false);
    };

    const handleCreateNewGroup = () => {
        if (!newGroupName.trim() || !tagsProperty) return;
        const newOption = {
            id: `opt-${Date.now()}`,
            label: newGroupName.trim(),
            color: 'blue'
        };
        const updatedProperties = properties.map(p =>
            p.id === tagsProperty.id
                ? { ...p, options: [...(p.options || []), newOption] }
                : p
        );
        updateAttributes({ properties: updatedProperties });
        setNewGroupName('');
        setShowNewGroupInput(false);
    };

    const getPropIcon = (type) => {
        switch (type) {
            case 'title':
                return <span className="font-serif font-bold text-[13px] leading-none text-gray-500">Aa</span>;
            case 'date':
                return <Clock size={13} className="text-gray-400" />;
            case 'select':
                return <Tag size={13} className="text-gray-400" />;
            default:
                return <Type size={13} className="text-gray-400" />;
        }
    };

    const filteredRows = useMemo(() => {
        return rows.filter(r => (r.values?.['prop-title'] || '').toLowerCase().includes(searchQuery.toLowerCase()));
    }, [rows, searchQuery]);

    const boardGroups = useMemo(() => {
        const groups = [];
        const unassigned = filteredRows.filter(r => !r.values?.[tagsProperty?.id]);
        groups.push({
            id: 'no-tags',
            label: 'No Tags',
            color: 'gray',
            items: unassigned,
            tagValue: ''
        });

        (tagsProperty?.options || []).forEach(opt => {
            const items = filteredRows.filter(r => r.values?.[tagsProperty?.id] === opt.id);
            groups.push({
                id: opt.id,
                label: opt.label,
                color: opt.color || 'blue',
                items: items,
                tagValue: opt.id
            });
        });

        return groups;
    }, [filteredRows, tagsProperty]);

    // Calendar Generation (Monday to Sunday)
    const calendarGrid = useMemo(() => {
        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        // Convert Sunday (0) to 7, so Monday is 1
        let startDayIndex = firstDayOfMonth.getDay();
        startDayIndex = startDayIndex === 0 ? 7 : startDayIndex;

        const prevMonthLastDay = new Date(year, month, 0).getDate();
        const totalDaysInMonth = lastDayOfMonth.getDate();

        const days = [];
        const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // 1. Previous Month Spillover Days
        for (let i = startDayIndex - 1; i > 0; i--) {
            const dayNum = prevMonthLastDay - i + 1;
            const dateStr = `${month === 0 ? year - 1 : year}-${String(month === 0 ? 12 : month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            days.push({
                day: dayNum,
                isOtherMonth: true,
                dateStr,
                label: `${dayNum}`,
                items: filteredRows.filter(r => r.date === dateStr)
            });
        }

        // 2. Current Month Days
        const today = new Date();
        for (let d = 1; d <= totalDaysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const isToday =
                today.getFullYear() === year &&
                today.getMonth() === month &&
                today.getDate() === d;

            const label = d === 1 ? `1 ${shortMonths[month]}` : `${d}`;

            days.push({
                day: d,
                isOtherMonth: false,
                isToday,
                dateStr,
                label,
                items: filteredRows.filter(r => r.date === dateStr)
            });
        }

        // 3. Next Month Spillover Days to fill out complete 5 or 6 rows (35 or 42 cells)
        const targetTotal = days.length <= 35 ? 35 : 42;
        const remaining = targetTotal - days.length;
        const nextMonthIndex = (month + 1) % 12;
        const nextMonthYear = month === 11 ? year + 1 : year;

        for (let d = 1; d <= remaining; d++) {
            const dateStr = `${nextMonthYear}-${String(nextMonthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const label = d === 1 ? `1 ${shortMonths[nextMonthIndex]}` : `${d}`;
            days.push({
                day: d,
                isOtherMonth: true,
                dateStr,
                label,
                items: filteredRows.filter(r => r.date === dateStr)
            });
        }

        return days;
    }, [calendarDate, filteredRows]);

    return (
        <NodeViewWrapper className="my-6 not-prose select-none font-sans group/db w-full">
            {/* Title */}
            <div className="flex items-center justify-between group/title mb-4">
                <input
                    type="text"
                    value={title}
                    placeholder="Untitled database"
                    onChange={(e) => updateAttributes({ title: e.target.value })}
                    className="text-3xl font-bold text-slate-800 bg-transparent focus:outline-none placeholder:text-gray-300 tracking-tight w-full"
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

            {/* View Tabs & Action Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-1">
                    {views.map((view) => {
                        const def = VIEW_DEFINITIONS.find(d => d.type === view.type) || VIEW_DEFINITIONS[0];
                        const Icon = def.icon;
                        const isActive = view.id === currentActiveView?.id;
                        return (
                            <button
                                key={view.id}
                                type="button"
                                onClick={() => updateAttributes({ activeViewId: view.id })}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[13px] font-medium transition-colors ${
                                    isActive
                                        ? 'bg-gray-100 text-slate-800 shadow-2xs'
                                        : 'text-gray-500 hover:bg-gray-100/60 hover:text-slate-700'
                                }`}
                            >
                                <Icon size={14} className={isActive ? 'text-slate-800' : 'text-gray-400'} />
                                <span>{view.name}</span>
                            </button>
                        );
                    })}

                    <button
                        type="button"
                        onClick={() => {
                            const newView = {
                                id: `view-${Date.now()}`,
                                name: 'New view',
                                type: 'calendar'
                            };
                            updateAttributes({ views: [...views, newView], activeViewId: newView.id });
                        }}
                        className="p-1 hover:bg-gray-100 text-gray-400 hover:text-slate-700 rounded-md transition-colors ml-0.5"
                    >
                        <Plus size={14} />
                    </button>
                </div>

                <div className="flex items-center gap-2 text-gray-400">
                    <button className="p-1 hover:bg-gray-100 hover:text-slate-700 rounded transition-colors" title="Filter">
                        <Filter size={14} />
                    </button>
                    <button className="p-1 hover:bg-gray-100 hover:text-slate-700 rounded transition-colors" title="Sort">
                        <ArrowUpDown size={14} />
                    </button>
                    <button className="p-1 hover:bg-gray-100 hover:text-slate-700 rounded transition-colors" title="Automations">
                        <Zap size={14} />
                    </button>

                    {showSearch ? (
                        <div className="flex items-center bg-gray-50 border border-gray-200 px-2 py-0.5 rounded text-xs text-slate-800">
                            <Search size={12} className="text-gray-400 mr-1" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search..."
                                className="bg-transparent focus:outline-none w-24 text-xs"
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
                            className="p-1 hover:bg-gray-100 hover:text-slate-700 rounded transition-colors"
                        >
                            <Search size={14} />
                        </button>
                    )}

                    <button className="p-1 hover:bg-gray-100 hover:text-slate-700 rounded transition-colors">
                        <Maximize2 size={14} />
                    </button>

                    <button className="p-1 hover:bg-gray-100 hover:text-slate-700 rounded transition-colors">
                        <SlidersHorizontal size={14} />
                    </button>

                    <div className="flex items-center bg-[#2383E2] hover:bg-blue-600 text-white rounded-md shadow-xs text-xs font-semibold overflow-hidden ml-1">
                        <button
                            type="button"
                            onClick={() => handleAddRow()}
                            className="px-2.5 py-1 flex items-center gap-1 active:scale-95"
                        >
                            New
                        </button>
                        <div className="w-[1px] h-3.5 bg-blue-400/60" />
                        <button
                            type="button"
                            onClick={() => handleAddRow()}
                            className="px-1.5 py-1 hover:bg-blue-700 transition-colors"
                        >
                            <ChevronDown size={12} />
                        </button>
                    </div>
                </div>
            </div>

            {/* --- 1. NOTION AUTHENTIC CALENDAR VIEW --- */}
            {currentActiveView?.type === 'calendar' && (
                <div className="w-full flex flex-col select-none">
                    {/* Calendar Sub-header: Month Year & Controls */}
                    <div className="flex items-center justify-between mb-3 px-1">
                        <h2 className="text-base font-bold text-slate-800">
                            {calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h2>

                        <div className="flex items-center gap-2">
                            {/* Manage in Calendar pill */}
                            <button
                                type="button"
                                className="flex items-center gap-1.5 px-2.5 py-1 border border-gray-200/80 hover:bg-gray-50 rounded-md text-xs font-medium text-slate-700 transition-colors shadow-2xs"
                            >
                                <CalendarIcon size={13} className="text-gray-500" />
                                <span>Manage in Calendar</span>
                            </button>

                            {/* Month Navigator: < Today > */}
                            <div className="flex items-center text-gray-500 text-xs font-medium">
                                <button
                                    type="button"
                                    onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}
                                    className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-slate-700"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCalendarDate(new Date())}
                                    className="px-2 py-0.5 hover:bg-gray-100 rounded text-slate-700 text-xs font-medium"
                                >
                                    Today
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}
                                    className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-slate-700"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Day Headers (Mon - Sun) */}
                    <div className="grid grid-cols-7 text-center text-xs text-gray-400 font-normal py-1 border-b border-gray-100">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                            <div key={day} className="py-0.5">{day}</div>
                        ))}
                    </div>

                    {/* Calendar Grid Cells */}
                    <div className="grid grid-cols-7 border-t border-l border-gray-200/70">
                        {calendarGrid.map((cell, idx) => (
                            <div
                                key={idx}
                                onClick={() => handleAddRow(cell.dateStr)}
                                className={`h-28 p-2 border-r border-b border-gray-200/70 hover:bg-gray-50/50 transition-colors flex flex-col justify-between group/cell relative cursor-pointer ${
                                    cell.isOtherMonth ? 'bg-transparent' : 'bg-white'
                                }`}
                            >
                                {/* Date Number and Add Button */}
                                <div className="flex items-center justify-between text-xs">
                                    {/* Hover '+' button */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddRow(cell.dateStr);
                                        }}
                                        className="opacity-0 group-hover/cell:opacity-100 p-0.5 text-gray-400 hover:text-slate-800 transition-opacity"
                                    >
                                        <Plus size={12} />
                                    </button>

                                    {/* Date indicator with red pill for Today */}
                                    {cell.isToday ? (
                                        <div className="w-5 h-5 rounded-full bg-[#E5484D] text-white flex items-center justify-center text-[11px] font-semibold leading-none shadow-xs">
                                            {cell.day}
                                        </div>
                                    ) : (
                                        <span className={`text-[12px] font-normal ${cell.isOtherMonth ? 'text-gray-300' : 'text-slate-800'}`}>
                                            {cell.label}
                                        </span>
                                    )}
                                </div>

                                {/* Items Container */}
                                <div className="space-y-1 overflow-y-auto max-h-16 mt-1">
                                    {cell.items.map(item => (
                                        <div
                                            key={item.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveRow(item);
                                            }}
                                            className="bg-white border border-gray-200 rounded px-1.5 py-0.5 text-[11px] font-medium text-slate-800 truncate shadow-2xs hover:bg-gray-50 flex items-center gap-1.5"
                                        >
                                            <span className="text-[10px] text-gray-400">{item.icon || '♡'}</span>
                                            <span className="truncate">{item.values?.['prop-title'] || 'Untitled'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- 2. LIST VIEW --- */}
            {currentActiveView?.type === 'list' && (
                <div className="flex flex-col select-none py-1">
                    {filteredRows.map((row) => (
                        <div
                            key={row.id}
                            className="group/item flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-100/60 cursor-pointer transition-colors"
                            onClick={() => setActiveRow(row)}
                        >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <span className="text-[#845ec2] text-[15px] select-none shrink-0 font-light">
                                    {row.icon || '♡'}
                                </span>
                                <input
                                    type="text"
                                    value={row.values?.['prop-title'] || ''}
                                    placeholder="Untitled"
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => handleUpdateCell(row.id, 'prop-title', e.target.value)}
                                    className="bg-transparent focus:outline-none text-[14px] font-normal text-slate-800 placeholder:text-gray-300 w-full"
                                />
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveRow(row);
                                    }}
                                    className="px-1.5 py-0.5 text-[11px] font-medium text-gray-500 hover:text-slate-800 bg-white border border-gray-200 rounded shadow-2xs"
                                >
                                    Open
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => handleDeleteRow(e, row.id)}
                                    className="p-1 text-gray-300 hover:text-red-500 rounded"
                                >
                                    <X size={13} />
                                </button>
                            </div>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={() => handleAddRow()}
                        className="flex items-center gap-2 px-2 py-2 text-xs text-gray-400 hover:text-slate-700 hover:bg-gray-100/50 rounded-lg transition-colors mt-0.5 text-left font-normal"
                    >
                        <Plus size={14} className="text-gray-400" />
                        <span>New page</span>
                    </button>
                </div>
            )}

            {/* --- 3. GALLERY VIEW --- */}
            {currentActiveView?.type === 'gallery' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 select-none">
                    {filteredRows.map((row) => (
                        <div
                            key={row.id}
                            onClick={() => setActiveRow(row)}
                            className="group/card border border-gray-200/90 rounded-2xl overflow-hidden hover:shadow-md transition-all bg-white cursor-pointer flex flex-col justify-between"
                        >
                            <div className="h-44 w-full overflow-hidden bg-[#F7F6F3] relative flex items-center justify-center">
                                {row.cover ? (
                                    <img
                                        src={row.cover}
                                        alt="Cover"
                                        className="w-full h-full object-cover group-hover/card:scale-102 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-1.5 text-gray-300">
                                        <ImageIcon size={26} strokeWidth={1.5} />
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const url = window.prompt("Enter image URL for this card's cover:");
                                                if (url) handleUpdateCover(row.id, url);
                                            }}
                                            className="opacity-0 group-hover/card:opacity-100 text-[11px] font-medium text-gray-500 hover:text-slate-800 bg-white/90 px-2 py-0.5 rounded shadow-xs transition-opacity"
                                        >
                                            Add cover
                                        </button>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={(e) => handleDeleteRow(e, row.id)}
                                    className="absolute top-2 right-2 opacity-0 group-hover/card:opacity-100 p-1 bg-white/90 text-gray-400 hover:text-red-500 rounded-md shadow-xs transition-all"
                                >
                                    <X size={12} />
                                </button>
                            </div>

                            <div className="p-3 bg-white flex items-center gap-2">
                                <span className="text-slate-400 text-sm">{row.icon || '♡'}</span>
                                <input
                                    type="text"
                                    value={row.values?.['prop-title'] || ''}
                                    placeholder="Untitled"
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => handleUpdateCell(row.id, 'prop-title', e.target.value)}
                                    className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none placeholder:text-gray-300 truncate"
                                />
                            </div>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={() => handleAddRow()}
                        className="h-56 border border-dashed border-gray-200/80 hover:border-gray-400/80 rounded-2xl flex items-center justify-center text-xs text-gray-400 hover:text-slate-700 transition-all hover:bg-gray-50/40"
                    >
                        <span className="flex items-center gap-1.5">
                            <Plus size={14} /> New page
                        </span>
                    </button>
                </div>
            )}

            {/* --- 4. BOARD VIEW --- */}
            {currentActiveView?.type === 'board' && (
                <div className="flex items-start gap-4 overflow-x-auto pb-4 select-none">
                    {boardGroups.map((group) => (
                        <div
                            key={group.id}
                            className="w-[260px] shrink-0 bg-[#F7F6F3] rounded-2xl p-2.5 flex flex-col gap-2 border border-gray-100/60"
                        >
                            <div className="flex items-center gap-2 px-1.5 py-1 text-xs font-medium text-slate-700">
                                <span>{group.label}</span>
                                <span className="text-gray-400 font-normal text-[11px]">{group.items.length}</span>
                            </div>

                            <div className="flex flex-col gap-2">
                                {group.items.map((row) => (
                                    <div
                                        key={row.id}
                                        onClick={() => setActiveRow(row)}
                                        className="bg-white border border-gray-200/80 rounded-xl p-3 shadow-2xs hover:shadow-sm cursor-pointer transition-all flex items-center justify-between group/card"
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <span className="text-slate-400 text-sm select-none shrink-0">
                                                {row.icon || '♡'}
                                            </span>
                                            <input
                                                type="text"
                                                value={row.values?.['prop-title'] || ''}
                                                placeholder="Untitled"
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => handleUpdateCell(row.id, 'prop-title', e.target.value)}
                                                className="w-full bg-transparent focus:outline-none text-[13px] font-medium text-slate-800 placeholder:text-gray-300 truncate"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => handleDeleteRow(e, row.id)}
                                            className="opacity-0 group-hover/card:opacity-100 text-gray-300 hover:text-red-500 p-0.5 ml-1 transition-opacity shrink-0"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={() => handleAddRow(null, group.tagValue)}
                                    className="w-full py-2 px-2.5 text-xs text-gray-400 hover:text-slate-700 hover:bg-gray-200/50 rounded-xl flex items-center gap-2 transition-colors text-left font-normal"
                                >
                                    <Plus size={13} className="text-gray-400" />
                                    <span>New page</span>
                                </button>
                            </div>
                        </div>
                    ))}

                    <div className="shrink-0 pt-1">
                        {showNewGroupInput ? (
                            <div className="w-56 bg-white border border-gray-200 rounded-xl p-2.5 shadow-md">
                                <input
                                    type="text"
                                    value={newGroupName}
                                    placeholder="Group name..."
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreateNewGroup()}
                                    className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none mb-2"
                                    autoFocus
                                />
                                <div className="flex items-center gap-1.5 justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowNewGroupInput(false)}
                                        className="text-[11px] px-2 py-0.5 text-gray-500 hover:bg-gray-100 rounded"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCreateNewGroup}
                                        className="text-[11px] px-2 py-0.5 bg-blue-500 text-white rounded font-medium"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setShowNewGroupInput(true)}
                                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-slate-700 px-2 py-1.5 rounded-lg hover:bg-gray-100/60 transition-colors font-medium whitespace-nowrap"
                            >
                                <Plus size={14} />
                                <span>New group</span>
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* --- 5. TABLE VIEW --- */}
            {currentActiveView?.type === 'table' && (
                <div className="w-full overflow-x-auto text-[13px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="border-b border-gray-200/70 text-gray-400 text-xs">
                            {properties.map((prop, idx) => (
                                <th
                                    key={prop.id}
                                    className={`py-2 px-2.5 font-normal text-gray-500 select-none ${
                                        idx === 0 ? 'w-[38%] min-w-[200px]' : 'w-[28%] min-w-[170px]'
                                    }`}
                                >
                                    <div className="flex items-center gap-1.5">
                                        {getPropIcon(prop.type)}
                                        <span className="text-gray-600 font-normal">{prop.name}</span>
                                    </div>
                                </th>
                            ))}
                            <th className="py-2 px-2 font-normal text-gray-400 w-16">
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddProperty(true)}
                                        className="p-0.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
                                    >
                                        <Plus size={13} />
                                    </button>
                                    <MoreHorizontal size={13} className="text-gray-300" />
                                </div>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredRows.map((row) => (
                            <tr
                                key={row.id}
                                className="group/row border-b border-gray-100 hover:bg-gray-50/70 transition-colors"
                            >
                                {properties.map((prop, idx) => {
                                    const cellVal = row.values?.[prop.id];

                                    if (idx === 0) {
                                        return (
                                            <td key={prop.id} className="py-1.5 px-2.5">
                                                <div className="flex items-center gap-2">
                                                        <span className="text-gray-400 text-sm select-none cursor-pointer hover:opacity-80">
                                                            {row.icon || '♡'}
                                                        </span>
                                                    <input
                                                        type="text"
                                                        value={cellVal || ''}
                                                        placeholder="Untitled"
                                                        onChange={(e) => handleUpdateCell(row.id, prop.id, e.target.value)}
                                                        className="w-full bg-transparent focus:outline-none font-medium text-slate-800 placeholder:text-gray-300"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveRow(row)}
                                                        className="opacity-0 group-hover/row:opacity-100 uppercase tracking-wider text-[10px] font-semibold text-gray-400 hover:text-slate-800 bg-white border border-gray-200 px-1.5 py-0.5 rounded shadow-2xs transition-all shrink-0 ml-1"
                                                    >
                                                        Open
                                                    </button>
                                                </div>
                                            </td>
                                        );
                                    }

                                    if (prop.id === 'prop-created' || prop.type === 'date') {
                                        return (
                                            <td key={prop.id} className="py-1.5 px-2.5 text-gray-600 text-xs">
                                                <input
                                                    type="text"
                                                    value={cellVal || ''}
                                                    onChange={(e) => handleUpdateCell(row.id, prop.id, e.target.value)}
                                                    placeholder="Empty"
                                                    className="w-full bg-transparent focus:outline-none text-gray-600 placeholder:text-gray-300 text-xs"
                                                />
                                            </td>
                                        );
                                    }

                                    if (prop.type === 'select') {
                                        const currentOpt = (prop.options || []).find(o => o.id === cellVal);
                                        const theme = currentOpt ? NOTION_COLORS[currentOpt.color || 'gray'] : null;

                                        return (
                                            <td key={prop.id} className="py-1.5 px-2.5 relative">
                                                {currentOpt ? (
                                                    <span
                                                        onClick={() => setActiveSelectMenu({ rowId: row.id, propId: prop.id })}
                                                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer ${theme.bg} ${theme.text}`}
                                                    >
                                                            {currentOpt.label}
                                                        </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveSelectMenu({ rowId: row.id, propId: prop.id })}
                                                        className="text-gray-300 hover:text-gray-500 text-xs"
                                                    >
                                                        Empty
                                                    </button>
                                                )}

                                                {activeSelectMenu?.rowId === row.id && activeSelectMenu?.propId === prop.id && (
                                                    <div className="absolute top-full left-2 mt-1 z-30 bg-white border border-gray-200 shadow-xl rounded-lg p-1.5 min-w-[130px] flex flex-col gap-0.5">
                                                        {(prop.options || []).map(opt => {
                                                            const colorTheme = NOTION_COLORS[opt.color || 'gray'];
                                                            return (
                                                                <button
                                                                    key={opt.id}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        handleUpdateCell(row.id, prop.id, opt.id);
                                                                        setActiveSelectMenu(null);
                                                                    }}
                                                                    className="flex items-center gap-1.5 px-2 py-1 hover:bg-gray-100 rounded text-left text-xs"
                                                                >
                                                                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${colorTheme.bg} ${colorTheme.text}`}>
                                                                            {opt.label}
                                                                        </span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    }

                                    return (
                                        <td key={prop.id} className="py-1.5 px-2.5">
                                            <input
                                                type="text"
                                                value={cellVal || ''}
                                                placeholder="Empty"
                                                onChange={(e) => handleUpdateCell(row.id, prop.id, e.target.value)}
                                                className="w-full bg-transparent focus:outline-none text-xs text-slate-800 placeholder:text-gray-300"
                                            />
                                        </td>
                                    );
                                })}

                                <td className="py-1.5 px-2 text-right">
                                    <button
                                        type="button"
                                        onClick={(e) => handleDeleteRow(e, row.id)}
                                        className="opacity-0 group-hover/row:opacity-100 text-gray-300 hover:text-red-500 p-0.5 transition-opacity"
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
                        onClick={() => handleAddRow()}
                        className="w-full text-left py-2 px-2.5 text-xs text-gray-400 hover:text-slate-700 hover:bg-gray-50/80 flex items-center gap-2 transition-colors rounded-b-md"
                    >
                        <Plus size={13} className="text-gray-400" />
                        <span>New page</span>
                    </button>
                </div>
            )}

            {/* Add Property Modal */}
            {showAddProperty && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[0.5px]">
                    <div className="bg-white border border-gray-200 shadow-2xl rounded-2xl p-4 w-72">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <span className="text-xs font-semibold text-gray-700">Add Column</span>
                            <button onClick={() => setShowAddProperty(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={14} />
                            </button>
                        </div>
                        <div className="space-y-3 pt-3 text-xs">
                            <div>
                                <label className="text-gray-400 block mb-1">Column Name</label>
                                <input
                                    type="text"
                                    value={newPropName}
                                    onChange={(e) => setNewPropName(e.target.value)}
                                    placeholder="e.g. Category"
                                    className="w-full border border-gray-200 rounded px-2 py-1 focus:outline-none"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="text-gray-400 block mb-1">Property Type</label>
                                <select
                                    value={newPropType}
                                    onChange={(e) => setNewPropType(e.target.value)}
                                    className="w-full border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none"
                                >
                                    <option value="text">Text</option>
                                    <option value="select">Tags</option>
                                    <option value="date">Date</option>
                                </select>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddProperty}
                                className="w-full py-1.5 bg-[#2383E2] hover:bg-blue-600 text-white rounded font-medium mt-2"
                            >
                                Add Property
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Side Peek Drawer */}
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

                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-3xl">{activeRow.icon || '♡'}</span>
                            <input
                                type="text"
                                value={activeRow.values?.['prop-title'] || ''}
                                placeholder="Untitled"
                                onChange={(e) => handleUpdateCell(activeRow.id, 'prop-title', e.target.value)}
                                className="text-3xl font-bold text-slate-800 focus:outline-none w-full"
                            />
                        </div>

                        <div className="space-y-3 pb-8 border-b border-gray-100 text-xs">
                            <div className="flex items-center">
                                <div className="w-32 flex items-center gap-1.5 text-gray-400">
                                    <ImageIcon size={13} />
                                    <span>Card Cover</span>
                                </div>
                                <input
                                    type="text"
                                    value={activeRow.cover || ''}
                                    placeholder="Paste image URL..."
                                    onChange={(e) => handleUpdateCover(activeRow.id, e.target.value)}
                                    className="border border-gray-200 px-2 py-1 rounded focus:outline-none w-full text-slate-800 placeholder:text-gray-300"
                                />
                            </div>

                            {properties.filter(p => p.type !== 'title').map((prop) => (
                                <div key={prop.id} className="flex items-center">
                                    <div className="w-32 flex items-center gap-1.5 text-gray-400">
                                        {getPropIcon(prop.type)}
                                        <span>{prop.name}</span>
                                    </div>
                                    <input
                                        type="text"
                                        value={activeRow.values?.[prop.id] || ''}
                                        placeholder="Empty"
                                        onChange={(e) => handleUpdateCell(activeRow.id, prop.id, e.target.value)}
                                        className="border border-gray-200 px-2 py-1 rounded focus:outline-none w-full text-slate-800 placeholder:text-gray-300"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </NodeViewWrapper>
    );
}