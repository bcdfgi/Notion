'use client';
import React, { useState } from 'react';
import { Sliders, Settings, X, Search, ChevronDown } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, userEmail, theme = 'Light', onThemeChange }) {
    const [activeTab, setActiveTab] = useState('preferences');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="relative flex w-full max-w-4xl h-[600px] bg-white dark:bg-[#202020] rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-[#2F2F2F] transition-colors">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 hover:bg-gray-100 dark:hover:bg-[#2F2F2F] rounded-md transition-colors"
                >
                    <X size={18} />
                </button>

                {/* Left Sidebar */}
                <div className="w-56 bg-[#FBFBFA] dark:bg-[#191919] border-r border-gray-200 dark:border-[#2F2F2F] p-3 flex flex-col justify-between shrink-0">
                    <div>
                        {/* Search Input */}
                        <div className="relative mb-3">
                            <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search settings"
                                className="w-full bg-transparent border border-gray-200 dark:border-[#2F2F2F] rounded-md pl-8 pr-2 py-1 text-xs text-slate-700 dark:text-[#EBEBEB] placeholder-gray-400 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        {/* User Account Info */}
                        <div className="px-2 mb-3">
                            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                                Account
                            </span>
                            <div className="flex items-center gap-2 py-1">
                                <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                                    {userEmail?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <span className="text-xs font-medium text-slate-700 dark:text-[#EBEBEB] truncate">
                                    {userEmail?.split('@')[0]}
                                </span>
                            </div>
                        </div>

                        {/* Nav Items */}
                        <div className="space-y-4">
                            <div>
                                <button
                                    onClick={() => setActiveTab('preferences')}
                                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                        activeTab === 'preferences'
                                            ? 'bg-gray-200 dark:bg-[#2C2C2C] text-slate-900 dark:text-white'
                                            : 'text-slate-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-[#2C2C2C]/50'
                                    }`}
                                >
                                    <Sliders size={14} />
                                    Preferences
                                </button>
                            </div>

                            <div>
                                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-2 block mb-1">
                                    Workspace
                                </span>
                                <div className="space-y-0.5">
                                    <button
                                        onClick={() => setActiveTab('general')}
                                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                            activeTab === 'general'
                                                ? 'bg-gray-200 dark:bg-[#2C2C2C] text-slate-900 dark:text-white'
                                                : 'text-slate-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-[#2C2C2C]/50'
                                        }`}
                                    >
                                        <Settings size={14} />
                                        General
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Content Area */}
                <div className="flex-1 overflow-y-auto p-8 text-slate-800 dark:text-[#EBEBEB]">
                    {activeTab === 'preferences' && (
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight mb-1">Preferences</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Choose how you want Notion to look and behave</p>

                            {/* Theme Selector */}
                            <div className="pb-5">
                                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Appearance</h3>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-medium text-slate-700 dark:text-slate-200">Theme</div>
                                        <div className="text-xs text-gray-400">Choose a theme for Notion on this device</div>
                                    </div>
                                    <div className="relative">
                                        <select
                                            value={theme}
                                            onChange={(e) => onThemeChange?.(e.target.value)}
                                            className="appearance-none bg-white dark:bg-[#262626] border border-gray-200 dark:border-[#383838] rounded-md px-3 py-1.5 pr-8 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
                                        >
                                            <option value="Light">Light</option>
                                            <option value="Dark">Dark</option>
                                        </select>
                                        <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'general' && (
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight mb-1">General</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Customize your workspace details</p>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Workspace Name</label>
                                    <input
                                        type="text"
                                        defaultValue={`${userEmail?.split('@')[0]}'s Notion`}
                                        className="w-full max-w-sm text-xs px-3 py-1.5 border border-gray-200 dark:border-[#383838] dark:bg-[#262626] dark:text-[#EBEBEB] rounded-md focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}