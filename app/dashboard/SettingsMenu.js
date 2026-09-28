'use client';
import React, { useState } from 'react';
import { Sliders, Settings, Download, X, Search, ChevronDown } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, userEmail }) {
    const [activeTab, setActiveTab] = useState('preferences');
    const [theme, setTheme] = useState('Light');
    const [highContrast, setHighContrast] = useState('Use system setting');
    const [enterNewLine, setEnterNewLine] = useState(false);
    const [language, setLanguage] = useState('English (UK)');
    const [startMonday, setStartMonday] = useState(true);

    if (!isOpen) return null;

    const navItems = [
        { id: 'preferences', label: 'Preferences', icon: Sliders, group: 'Account' },
        { id: 'general', label: 'General', icon: Settings, group: 'Workspace' },
       // { id: 'import', label: 'Import', icon: Download, group: 'Workspace' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="relative flex w-full max-w-4xl h-[600px] bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-md transition-colors"
                >
                    <X size={18} />
                </button>

                {/* Left Sidebar */}
                <div className="w-56 bg-[#FBFBFA] border-r border-gray-200 p-3 flex flex-col justify-between shrink-0">
                    <div>
                        {/* Search Input */}
                        <div className="relative mb-3">
                            <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search settings"
                                className="w-full bg-transparent border border-gray-200 rounded-md pl-8 pr-2 py-1 text-xs text-slate-700 placeholder-gray-400 focus:outline-none focus:border-blue-500"
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
                                <span className="text-xs font-medium text-slate-700 truncate">
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
                                            ? 'bg-gray-200 text-slate-900'
                                            : 'text-slate-600 hover:bg-gray-200/50'
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
                                                ? 'bg-gray-200 text-slate-900'
                                                : 'text-slate-600 hover:bg-gray-200/50'
                                        }`}
                                    >
                                        <Settings size={14} />
                                        General
                                    </button>
                                    {/*<button*/}
                                    {/*    onClick={() => setActiveTab('import')}*/}
                                    {/*    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${*/}
                                    {/*        activeTab === 'import'*/}
                                    {/*            ? 'bg-gray-200 text-slate-900'*/}
                                    {/*            : 'text-slate-600 hover:bg-gray-200/50'*/}
                                    {/*    }`}*/}
                                    {/*>*/}
                                    {/*    <Download size={14} />*/}
                                    {/*    Import*/}
                                    {/*</button>*/}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Content Area */}
                <div className="flex-1 overflow-y-auto p-8 text-slate-800">
                    {activeTab === 'preferences' && (
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight mb-1">Preferences</h2>
                            <p className="text-xs text-gray-500 mb-6">Choose how you want Notion to look and behave</p>

                            {/* Preferences Section */}
                            <div className="border-b border-gray-100 pb-5 mb-5">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Preferences</h3>

                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <div className="text-sm font-medium text-slate-700">Theme</div>
                                        <div className="text-xs text-gray-400">Choose a theme for Notion on this device</div>
                                    </div>
                                    <div className="relative">
                                        <select
                                            value={theme}
                                            onChange={(e) => setTheme(e.target.value)}
                                            className="appearance-none bg-white border border-gray-200 rounded-md px-3 py-1.5 pr-8 text-xs text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm"
                                        >
                                            <option>Light</option>
                                            <option>Dark</option>
                                            <option>Use system setting</option>
                                        </select>
                                        <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                                            High contrast
                                            <span className="text-[10px] bg-gray-100 text-gray-500 px-1 py-0.5 rounded font-normal">Beta</span>
                                        </div>
                                        <div className="text-xs text-gray-400">Increase contrast for improved visibility</div>
                                    </div>
                                    <div className="relative">
                                        <select
                                            value={highContrast}
                                            onChange={(e) => setHighContrast(e.target.value)}
                                            className="appearance-none bg-white border border-gray-200 rounded-md px-3 py-1.5 pr-8 text-xs text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm"
                                        >
                                            <option>Use system setting</option>
                                            <option>Disabled</option>
                                            <option>Enabled</option>
                                        </select>
                                        <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Input Options Section */}
                            <div className="border-b border-gray-100 pb-5 mb-5">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Input options</h3>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-medium text-slate-700">Use Enter to add a new line</div>
                                        <div className="text-xs text-gray-400">Applies to chat, comments and other input fields. Press Cmd/Ctrl + Enter to send.</div>
                                    </div>
                                    <button
                                        onClick={() => setEnterNewLine(prev => !prev)}
                                        className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${enterNewLine ? 'bg-blue-600' : 'bg-gray-200'}`}
                                    >
                                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${enterNewLine ? 'translate-x-4' : ''}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Language and Time Section */}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Language and time</h3>

                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <div className="text-sm font-medium text-slate-700">Language</div>
                                        <div className="text-xs text-gray-400">Choose the language you want to use Notion in</div>
                                    </div>
                                    <div className="relative">
                                        <select
                                            value={language}
                                            onChange={(e) => setLanguage(e.target.value)}
                                            className="appearance-none bg-white border border-gray-200 rounded-md px-3 py-1.5 pr-8 text-xs text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm"
                                        >
                                            <option>English (UK)</option>
                                            <option>English (US)</option>
                                        </select>
                                        <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-medium text-slate-700">Start week on Monday</div>
                                        <div className="text-xs text-gray-400">This will affect the way your calendars appear in Notion</div>
                                    </div>
                                    <button
                                        onClick={() => setStartMonday(prev => !prev)}
                                        className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${startMonday ? 'bg-blue-600' : 'bg-gray-200'}`}
                                    >
                                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${startMonday ? 'translate-x-4' : ''}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'general' && (
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight mb-1">General</h2>
                            <p className="text-xs text-gray-500 mb-6">Customize your workspace details</p>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Workspace Name</label>
                                    <input
                                        type="text"
                                        defaultValue={`${userEmail.split('@')[0]}'s Notion`}
                                        className="w-full max-w-sm text-xs px-3 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'import' && (
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight mb-1">Import</h2>
                            <p className="text-xs text-gray-500 mb-6">Import data from apps and files</p>
                            <div className="grid grid-cols-2 gap-3 max-w-md">
                                {['CSV', 'Text and Markdown', 'PDF'].map((source) => (
                                    <button
                                        key={source}
                                        className="flex items-center justify-center p-3 border border-gray-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-gray-50 transition-colors"
                                    >
                                        {source}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
