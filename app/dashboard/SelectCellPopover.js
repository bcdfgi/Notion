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

const COLOR_PALETTE = ['default', 'gray', 'brown', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'red'];

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
                                              selectedValue, // string for select, array for multi-select
                                              onSelect,      // (optId) => void
                                              onRemove,      // (optId) => void
                                              onClose,
                                              onUpdatePropertyOptions,
                                          }) {
    const isMulti = property?.type === 'multi-select';
    const [searchQuery, setSearchQuery] = useState('');
    const [editingOption, setEditingOption] = useState(null);
    const popoverRef = useRef(null);
    const configMenuRef = useRef(null);
    const inputRef = useRef(null);
    const listEndRef = useRef(null);

    const options = property?.options || [];

    // Normalize selected IDs into an array for easy checking
    const selectedIds = Array.isArray(selectedValue)
        ? selectedValue
        : selectedValue ? [selectedValue] : [];

    const selectedOptionsList = options.filter(o => selectedIds.includes(o.id));

    const filteredOptions = options.filter(opt =>
        (opt.label || '').toLowerCase().includes(searchQuery.toLowerCase().trim())
    );

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

    // Create a new option and toggle it on
    const handleCreateOption = () => {
        const trimmed = searchQuery.trim();
        if (!trimmed) return;

        // Auto color assignment from 0..9 wrapping around
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
            inputRef.current?.focus();
            listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
    };

    const handleOptionClick = (optId) => {
        if (isMulti) {
            if (selectedIds.includes(optId)) {
                onRemove(optId);
            } else {
                onSelect(optId);
            }
            inputRef.current?.focus();
        } else {
            onSelect(optId);
            onClose();
        }
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
        if (selectedIds.includes(optId)) {
            onRemove(optId);
        }
        setEditingOption(null);
    };

    return (
        <>
            <div
                ref={popoverRef}
                style={{
                    top: `${(anchorRect?.bottom || 0) + 4}px`,
                    left: `${Math.max(16, anchorRect?.left || 0)}px`,
                }}
                className="fixed z-[60] w-[300px] bg-white border border-gray-200/90 shadow-[0_12px_32px_rgba(0,0,0,0.12)] rounded-xl p-2 text-xs font-sans text-slate-700 animate-in fade-in zoom-in-95 duration-100 flex flex-col max-h-[420px]"
                onMouseDown={(e) => e.stopPropagation()}
            >
                {/* Notion-style combined Tag Box & Inline Input */}
                <div
                    onClick={() => inputRef.current?.focus()}
                    className="flex flex-wrap items-center gap-1.5 p-1.5 min-h-[34px] border border-gray-200/90 rounded-lg bg-gray-50/40 focus-within:border-blue-500 focus-within:bg-white transition-colors cursor-text mb-2 shrink-0"
                >
                    {selectedOptionsList.map((opt) => {
                        const theme = NOTION_COLORS[opt.color || 'default'];
                        return (
                            <span
                                key={opt.id}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium shrink-0 ${theme.bg} ${theme.text}`}
                            >
                                <span className="truncate max-w-[130px]">{opt.label}</span>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemove(opt.id);
                                    }}
                                    className="hover:opacity-75 cursor-pointer"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        );
                    })}

                    <input
                        ref={inputRef}
                        type="text"
                        value={searchQuery}
                        autoFocus
                        placeholder={selectedOptionsList.length === 0 ? "Select an option or create one" : ""}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === 'Enter' && searchQuery.trim()) {
                                handleCreateOption();
                            } else if (e.key === 'Backspace' && !searchQuery && selectedOptionsList.length > 0) {
                                // Pressing backspace removes the last added pill
                                onRemove(selectedOptionsList[selectedOptionsList.length - 1].id);
                            }
                        }}
                        className="flex-1 min-w-[70px] bg-transparent text-xs text-slate-800 focus:outline-none placeholder:text-gray-400 py-0.5"
                    />
                </div>

                {/* Always-available Create Button */}
                {searchQuery.trim().length > 0 && (
                    <button
                        type="button"
                        onClick={handleCreateOption}
                        className="w-full flex items-center justify-between px-2 py-1.5 mb-1.5 text-left text-xs bg-blue-50/70 hover:bg-blue-100/70 text-blue-700 rounded-md transition-colors font-medium shrink-0"
                    >
                        <div className="flex items-center gap-1.5 truncate">
                            <Plus size={13} className="shrink-0 text-blue-600" />
                            <span className="text-blue-500 font-normal">Create</span>
                            <span className="truncate underline underline-offset-2">{searchQuery.trim()}</span>
                        </div>
                        <span className="text-[10px] text-blue-400 font-mono">↵ Enter</span>
                    </button>
                )}

                <div className="px-1 text-[11px] text-gray-400 mb-1 select-none shrink-0 font-medium">
                    Select an option or create one
                </div>

                {/* Options List */}
                <div className="flex-1 overflow-y-auto space-y-0.5 pr-0.5 min-h-[50px]">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((opt) => {
                            const theme = NOTION_COLORS[opt.color || 'default'];
                            const isSelected = selectedIds.includes(opt.id);

                            return (
                                <div
                                    key={opt.id}
                                    onClick={() => handleOptionClick(opt.id)}
                                    className={`group/opt flex items-center justify-between px-1.5 py-1.5 rounded-md cursor-pointer hover:bg-gray-100/70 transition-colors ${
                                        isSelected ? 'bg-gray-100/50' : ''
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

                                    <div className="flex items-center gap-1 shrink-0">
                                        {isSelected && (
                                            <Check size={13} className="text-slate-700 mr-0.5" strokeWidth={2.2} />
                                        )}
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

            {/* Option Configuration Submenu (Color Picker & Rename) */}
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