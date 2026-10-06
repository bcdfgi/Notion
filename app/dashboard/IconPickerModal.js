'use client';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';
import * as LucideIcons from 'lucide-react';
import { Shuffle } from 'lucide-react';

const NOTION_COLORS = [
    { name: 'Default', value: '#37352F' },
    { name: 'Gray', value: '#9B9A97' },
    { name: 'Brown', value: '#64473A' },
    { name: 'Orange', value: '#D9730D' },
    { name: 'Yellow', value: '#DFAB01' },
    { name: 'Green', value: '#0F7B6C' },
    { name: 'Blue', value: '#0B6E99' },
    { name: 'Purple', value: '#6940A5' },
    { name: 'Pink', value: '#AD1A72' },
    { name: 'Red', value: '#E03E3E' },
];

// Change:
export default function IconPickerModal({ onSelect, onClose, initialTab = 'icons' }) {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [search, setSearch] = useState('');
    const [activeColorPopover, setActiveColorPopover] = useState(null);
    const [uploadError, setUploadError] = useState(''); // Added error state
    const gridContainerRef = useRef(null);
    const fileInputRef = useRef(null); // Added input ref

    const iconList = useMemo(() => {
        return Object.keys(LucideIcons).filter(
            (key) => key !== 'createLucideIcon' && typeof LucideIcons[key] === 'object'
        );
    }, []);

    const filteredIcons = useMemo(() => {
        return iconList
            .filter((name) => name.toLowerCase().includes(search.toLowerCase()))
            .slice(0, 100);
    }, [search, iconList]);

    const handleRandomIcon = () => {
        const randomName = iconList[Math.floor(Math.random() * iconList.length)];
        onSelect({
            type: 'icon',
            name: randomName,
            color: NOTION_COLORS[0].value,
        });
        onClose();
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.color-popover') && !e.target.closest('.icon-button')) {
                setActiveColorPopover(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleIconClick = (e, iconName) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const containerRect = gridContainerRef.current?.getBoundingClientRect() || { top: 0, left: 0 };

        setActiveColorPopover({
            iconName,
            top: rect.top - containerRect.top + 36,
            left: Math.max(10, Math.min(rect.left - containerRect.left - 40, 180)),
        });
    };


    const handleUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadError('');

        if (!file.type.startsWith('image/')) {
            setUploadError('Please select a valid image file.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result;
            const img = new Image();

            img.onload = () => {
                if (img.width !== 280 || img.height !== 280) {
                    setUploadError(`Warning: Image is ${img.width}×${img.height}px. It must be exactly 280×280px.`);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                    return;
                }

                onSelect({ type: 'image', value: dataUrl });
                onClose();
            };

            img.src = dataUrl;
        };

        reader.readAsDataURL(file);
    };

    return (
        <div className="absolute z-50 bg-white border border-gray-200 rounded-xl shadow-2xl w-96 p-3 text-slate-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
                <div className="flex gap-2">
                    {['emoji', 'icons', 'upload'].map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => {
                                setActiveTab(tab);
                                setActiveColorPopover(null);
                                setUploadError('');
                            }}
                            className={`text-xs font-semibold capitalize px-2.5 py-1 rounded-md transition-colors ${
                                activeTab === tab
                                    ? 'bg-gray-100 text-slate-900'
                                    : 'text-gray-400 hover:text-slate-700'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={() => {
                        onSelect(null);
                        onClose();
                    }}
                    className="text-xs text-gray-400 hover:text-red-500 font-medium transition-colors"
                >
                    Remove
                </button>
            </div>


            {activeTab === 'emoji' && (
                <div className="h-80 overflow-hidden flex justify-center">
                    <EmojiPicker
                        width="100%"
                        height="320px"
                        previewConfig={{ showPreview: false }}
                        onEmojiClick={(emojiData) => {
                            onSelect({ type: 'emoji', value: emojiData.emoji });
                            onClose();
                        }}
                    />
                </div>
            )}

            {activeTab === 'icons' && (
                <div className="relative" ref={gridContainerRef}>
                    <div className="flex items-center gap-2 mb-3">
                        <input
                            type="text"
                            placeholder="Filter icons..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:border-blue-500"
                        />
                        <button
                            type="button"
                            onClick={handleRandomIcon}
                            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md border border-gray-200 transition-colors shrink-0"
                            title="Random icon"
                        >
                            <Shuffle size={14} />
                        </button>
                    </div>

                    <div className="grid grid-cols-6 gap-2 h-64 overflow-y-auto pr-1">
                        {filteredIcons.map((iconName) => {
                            const IconComponent = LucideIcons[iconName];
                            return (
                                <button
                                    key={iconName}
                                    type="button"
                                    onClick={(e) => handleIconClick(e, iconName)}
                                    className="icon-button p-2 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-slate-700 hover:text-slate-900"
                                    title={iconName}
                                >
                                    <IconComponent size={20} color="#37352F" strokeWidth={2} />
                                </button>
                            );
                        })}
                    </div>


                    {activeColorPopover && (
                        <div
                            className="color-popover absolute z-50 bg-white border border-gray-200 rounded-xl shadow-xl p-2 animate-in fade-in zoom-in-95"
                            style={{
                                top: `${activeColorPopover.top}px`,
                                left: `${activeColorPopover.left}px`,
                            }}
                        >
                            <div className="grid grid-cols-5 gap-1.5 w-44">
                                {NOTION_COLORS.map((c) => {
                                    const SelectedIconComponent =
                                        LucideIcons[activeColorPopover.iconName] || LucideIcons.FileText;
                                    return (
                                        <button
                                            key={c.value}
                                            type="button"
                                            onClick={() => {
                                                onSelect({
                                                    type: 'icon',
                                                    name: activeColorPopover.iconName,
                                                    color: c.value,
                                                });
                                                setActiveColorPopover(null);
                                                onClose();
                                            }}
                                            className="p-1.5 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-transform hover:scale-110"
                                            title={c.name}
                                        >
                                            <SelectedIconComponent size={18} color={c.value} strokeWidth={2} />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}


            {activeTab === 'upload' && (
                <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg p-4">
                    <label className="cursor-pointer flex flex-col items-center">
                        <span className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-xs font-medium transition-colors">
                            Choose an Image
                        </span>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleUpload}
                        />
                    </label>
                    <p className="text-[11px] text-gray-400 mt-2">Required size: 280×280px</p>

                    {uploadError && (
                        <div className="mt-3 px-2.5 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-md text-center">
                            {uploadError}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}