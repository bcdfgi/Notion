'use client';
import React, { useState, useRef, useEffect } from 'react';
import { X, MoreHorizontal, Trash2, Check, GripVertical, Plus } from 'lucide-react';

const NOTION_COLORS = {
    default: { bg: 'bg-[#F1F1EF]', text: 'text-[#37352F]', swatch: 'bg-[#E3E2E0]' },
    gray:    { bg: 'bg-[#F1F1EF]', text: 'text-[#5A5A5A]', swatch: 'bg-[#E3E2E0]' },
    brown:   { bg: 'bg-[#F4EEEE]', text: 'text-[#78350F]', swatch: 'bg-[#EEE0DA]' },
    orange:  { bg: 'bg-[#FBECDD]', text: 'text-[#C2410C]', swatch: 'bg-[#FADEC9]' },
    yellow:  { bg: 'bg-[#FBF3DB]', text: 'text-[#A16207]', swatch: 'bg-[#FDECC8]' },
    green:   { bg: 'bg-[#EDF3EC]', text: 'text-[#15803D]', swatch: 'bg-[#DBEDDB]' },
    blue:    { bg: 'bg-[#E7F3F8]', text: 'text-[#0369A1]', swatch: 'bg-[#D3E5EF]' },
    purple:  { bg: 'bg-[#F4EEF8]', text: 'text-[#7E22CE]', swatch: 'bg-[#E8DEEE]' },
    pink:    { bg: 'bg-[#F9EEF3]', text: 'text-[#BE185D]', swatch: 'bg-[#F5E0E9]' },
    red:     { bg: 'bg-[#FDEBEC]', text: 'text-[#B91C1C]', swatch: 'bg-[#FFE2DD]' },
};

// Exactly 10 ordered Notion colors
const COLOR_PALETTE = [
    'default', // Index 0 (Option 1, 11, 21...)
    'gray',    // Index 1 (Option 2, 12, 22...)
    'brown',   // Index 2 (Option 3, 13, 23...)
    'orange',  // Index 3 (Option 4, 14, 24...)
    'yellow',  // Index 4 (Option 5, 15, 25...)
    'green',   // Index 5 (Option 6, 16, 26...)
    'blue',    // Index 6 (Option 7, 17, 27...)
    'purple',  // Index 7 (Option 8, 18, 28...)
    'pink',    // Index 8 (Option 9, 19, 29...)
    'red',     // Index 9 (Option 10, 20, 30...)
];

const COLOR_OPTIONS = [
    { key: 'default', label: 'Default' },
    { key: 'gray',    label: 'Gray' },
    { key: 'brown',   label: 'Brown' },
    { key: 'orange',  label: 'Orange' },
    { key: 'yellow',  label: 'Yellow' },
    { key: 'green',   label: 'Green' },
    { key: 'blue',    label: 'Blue' },
    { key: 'purple',  label: 'Purple' },
    { key: 'pink',    label: 'Pink' },
    { key: 'red',     label: 'Red' },
];

export default function SelectCellPopover({
                                              anchorRect,
                                              property,
                                              selectedValue,
                                              onSelect,
                                              onRemove,
                                              onClose,
                                              onUpdatePropertyOptions,
                                          }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [editingOption, setEditingOption] = useState(null);
    const popoverRef = useRef(null);
    const configMenuRef = useRef(null);
    const listEndRef = useRef(null);

    const options = property?.options || [];

    const filteredOptions = options.filter(opt =>
        (opt.label || '').toLowerCase().includes(searchQuery.toLowerCase().trim())
    );

    const selectedOpt = options.find(o => o.id === selectedValue);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(e.target) &&
                (!configMenuRef.current || !configMenuRef.current.contains(e.target))
            ) {
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

    // Automatically assigns color in strict order (1 to 10, then resets back to 1)
    const handleCreateOption = () => {
        const trimmed = searchQuery.trim();
        if (!trimmed) return;

        // Auto-assign: Index 0 to 9, then wraps back to 0 for index 10 (Option #11)
        const nextColorIndex = options.length % COLOR_PALETTE.length;
        const assignedColor = COLOR_PALETTE[nextColorIndex];

        const newOpt = {
            id: `opt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            label: trimmed,
            color: assignedColor,
        };

        const updated = [...options, newOpt];
        onUpdatePropertyOptions(updated);
        onSelect(newOpt.id);
        setSearchQuery('');

        setTimeout(() => {
            listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
    };

    const handleRenameOption = (optId, newLabel) => {
        const updated = options.map(o => o.id === optId ? { ...o, label: newLabel } : o);
        onUpdatePropertyOptions(updated);
    };

    const handleChangeOptionColor = (optId, newColor) => {
        const updated = options.map(o => o.id === optId ? { ...o, color: newColor } : o);
        onUpdatePropertyOptions(updated);
        setEditingOption(prev => prev ? { ...prev, color: newColor } : null);
    };

    const handleDeleteOption = (optId) => {
        const updated = options.filter(o => o.id !== optId);
        onUpdatePropertyOptions(updated);
        if (selectedValue === optId) {
            onRemove(optId);
        }
        setEditingOption(null);
    };

    return (
        <>
            {/* Main Select Popover */}
            <div
                ref={popoverRef}
                style={{
                    top: `${(anchorRect?.bottom || 0) + 4}px`,
                    left: `${Math.max(16, anchorRect?.left || 0)}px`,
                }}
                className="fixed z-[60] w-[275px] bg-white border border-gray-200/90 shadow-[0_12px_32px_rgba(0,0,0,0.12)] rounded-xl p-2 text-xs font-sans text-slate-700 animate-in fade-in zoom-in-95 duration-100 flex flex-col max-h-[420px]"
                onMouseDown={(e) => e.stopPropagation()}
            >
                {/* Active Tag Display */}
                {selectedOpt && (
                    <div className="flex flex-wrap gap-1 mb-2 pb-2 border-b border-gray-100 shrink-0">
                        <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                                NOTION_COLORS[selectedOpt.color || 'default']?.bg
                            } ${NOTION_COLORS[selectedOpt.color || 'default']?.text}`}
                        >
                            <span>{selectedOpt.label}</span>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemove(selectedOpt.id);
                                }}
                                className="hover:opacity-75"
                            >
                                <X size={12} />
                            </button>
                        </span>
                    </div>
                )}

                {/* Input: Pressing Enter creates immediately */}
                <div className="shrink-0 mb-1">
                    <input
                        type="text"
                        value={searchQuery}
                        autoFocus
                        placeholder="Select an option or create one"
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === 'Enter' && searchQuery.trim()) {
                                handleCreateOption();
                            }
                        }}
                        className="w-full px-2 py-1.5 text-xs bg-transparent focus:outline-none placeholder:text-gray-400 text-slate-800"
                    />
                </div>

                {/* Action button preview */}
                {searchQuery.trim().length > 0 && (
                    <button
                        type="button"
                        onClick={handleCreateOption}
                        className="w-full flex items-center justify-between px-2 py-1.5 mb-1 text-left text-xs bg-blue-50/70 hover:bg-blue-100/70 text-blue-700 rounded-md transition-colors font-medium shrink-0"
                    >
                        <div className="flex items-center gap-1.5 truncate">
                            <Plus size={13} className="shrink-0 text-blue-600" />
                            <span className="text-blue-500 font-normal">Create</span>
                            <span className="truncate underline underline-offset-2">{searchQuery.trim()}</span>
                        </div>
                        <span className="text-[10px] text-blue-400 font-mono">↵ Enter</span>
                    </button>
                )}

                {/* Options List */}
                <div className="flex-1 overflow-y-auto space-y-0.5 pr-0.5 min-h-[50px]">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((opt) => {
                            const theme = NOTION_COLORS[opt.color || 'default'];
                            const isSelected = selectedValue === opt.id;

                            return (
                                <div
                                    key={opt.id}
                                    onClick={() => {
                                        onSelect(opt.id);
                                        onClose();
                                    }}
                                    className={`group/opt flex items-center justify-between px-1.5 py-1 rounded-md cursor-pointer hover:bg-gray-100/70 transition-colors ${
                                        isSelected ? 'bg-gray-50' : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <GripVertical
                                            size={12}
                                            className="text-gray-300 opacity-0 group-hover/opt:opacity-100 shrink-0"
                                        />
                                        <span
                                            className={`px-2 py-0.5 rounded text-[11px] font-medium truncate ${theme.bg} ${theme.text}`}
                                        >
                                            {opt.label}
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            setEditingOption({
                                                ...opt,
                                                rect: {
                                                    top: Math.max(16, rect.top - 10),
                                                    left: rect.right + 8,
                                                },
                                            });
                                        }}
                                        className="p-1 hover:bg-gray-200/60 rounded text-gray-400 hover:text-slate-700 opacity-0 group-hover/opt:opacity-100 transition-opacity"
                                    >
                                        <MoreHorizontal size={13} />
                                    </button>
                                </div>
                            );
                        })
                    ) : (
                        !searchQuery && (
                            <div className="text-gray-400 text-[11px] py-3 text-center">
                                No options yet. Type above to add one.
                            </div>
                        )
                    )}
                    <div ref={listEndRef} />
                </div>
            </div>

            {/* Option Configuration Submenu (Color Override & Rename) */}
            {editingOption && (
                <div
                    ref={configMenuRef}
                    style={{
                        top: `${editingOption.rect.top}px`,
                        left: `${editingOption.rect.left}px`,
                    }}
                    className="fixed z-[70] w-[210px] bg-white border border-gray-200/90 shadow-[0_14px_36px_rgba(0,0,0,0.14)] rounded-2xl p-2 text-xs font-sans text-slate-700 animate-in fade-in zoom-in-95 duration-100"
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <div className="relative mb-1">
                        <input
                            type="text"
                            defaultValue={editingOption.label}
                            onBlur={(e) => handleRenameOption(editingOption.id, e.target.value)}
                            onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') {
                                    handleRenameOption(editingOption.id, e.currentTarget.value);
                                    e.currentTarget.blur();
                                }
                            }}
                            className="w-full px-2.5 py-1 border border-blue-500 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
                            autoFocus
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => handleDeleteOption(editingOption.id)}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-red-50 text-red-600 rounded-lg text-xs font-medium transition-colors"
                    >
                        <Trash2 size={13} />
                        <span>Delete</span>
                    </button>

                    <div className="h-px bg-gray-100 my-1.5" />

                    <div className="px-2 py-1 text-[11px] font-semibold text-gray-400 tracking-wide select-none">
                        Colours
                    </div>

                    <div className="max-h-56 overflow-y-auto space-y-0.5 pr-0.5">
                        {COLOR_OPTIONS.map((col) => {
                            const isColorSelected = (editingOption.color || 'default') === col.key;
                            const swatchClass = NOTION_COLORS[col.key]?.swatch || 'bg-gray-200';

                            return (
                                <button
                                    key={col.key}
                                    type="button"
                                    onClick={() => handleChangeOptionColor(editingOption.id, col.key)}
                                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-gray-100/80 text-left transition-colors"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <span className={`w-4 h-4 rounded ${swatchClass} shrink-0`} />
                                        <span className="text-slate-700">{col.label}</span>
                                    </div>
                                    {isColorSelected && (
                                        <Check size={13} className="text-slate-800 shrink-0" strokeWidth={2.5} />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </>
    );
}