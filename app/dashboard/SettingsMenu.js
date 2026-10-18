'use client';
import React, { useState } from 'react';
import { Sliders, Settings, X, Search, ChevronDown } from 'lucide-react';
import IconPickerModal from './IconPickerModal';
import PageIcon from './PageIcon';

export default function SettingsModal({
                                          isOpen,
                                          onClose,
                                          userEmail,
                                          theme = 'Light',
                                          onThemeChange,
                                          workspaceName,
                                          onWorkspaceNameChange,
                                          workspaceIcon,
                                          onWorkspaceIconChange,
                                      }) {
    const [activeTab, setActiveTab] = useState('preferences');
    const [showWorkspaceIconPicker, setShowWorkspaceIconPicker] = useState(false);
    const [nameDraft, setNameDraft] = useState(workspaceName || '');
    const [charError, setCharError] = useState('');

    React.useEffect(() => {
        setNameDraft(workspaceName || '');
        setCharError('');
    }, [workspaceName, isOpen]);

    const handleInputChange = (e) => {
        const val = e.target.value;

        if (val.length > 65) {
            setCharError('Workspace name cannot exceed 65 characters.');
            setNameDraft(val.slice(0, 65));
            return;
        }

        setCharError('');
        setNameDraft(val);
    };

    const handleSaveWorkspaceName = () => {
        if (!nameDraft.trim()) return;
        onWorkspaceNameChange?.(nameDraft.trim());
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="relative flex w-full max-w-4xl h-[600px] bg-white dark:bg-[#202020] rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-[#2F2F2F] transition-colors">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 hover:bg-gray-100 dark:hover:bg-[#2F2F2F] rounded-md transition-colors"
                >
                    <X size={18} />
                </button>


                <div className="w-56 bg-[#FBFBFA] dark:bg-[#191919] border-r border-gray-200 dark:border-[#2F2F2F] p-3 flex flex-col justify-between shrink-0">
                    <div>

                        <div className="relative mb-3">
                            <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search settings"
                                className="w-full bg-transparent border border-gray-200 dark:border-[#2F2F2F] rounded-md pl-8 pr-2 py-1 text-xs text-slate-700 dark:text-[#EBEBEB] placeholder-gray-400 focus:outline-none focus:border-blue-500"
                            />
                        </div>


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


                        <div className="space-y-4">



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


                <div className="flex-1 overflow-y-auto p-8 text-slate-800 dark:text-[#EBEBEB]">



                    {activeTab === 'general' && (
                        <div className="max-w-xl">
                            <h2 className="text-2xl font-bold tracking-tight mb-1 text-slate-800 dark:text-slate-100">
                                General
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                                Manage your workspace name, domains and more
                            </p>


                            <div className="border-b border-gray-100 dark:border-[#2F2F2F] pb-2 mb-6">
                                <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Workspace settings
                                </h3>
                            </div>

                            <div className="space-y-6">

                                <div>
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-0.5">
                                        Workspace name
                                    </label>
                                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-2">
                                        Your workspace name can be up to 65 characters
                                    </p>

                                    <div className="relative max-w-lg">
                                        <input
                                            type="text"
                                            maxLength={65}
                                            value={nameDraft}
                                            onChange={handleInputChange}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleSaveWorkspaceName();
                                                }
                                            }}
                                            placeholder="Workspace name"
                                            className="w-full text-xs px-3 py-2 pr-16 bg-gray-50/60 dark:bg-[#262626] border border-gray-200 dark:border-[#383838] rounded-lg text-slate-800 dark:text-[#EBEBEB] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-xs"
                                        />


                                        {nameDraft !== workspaceName && nameDraft.trim().length > 0 && (
                                            <button
                                                type="button"
                                                onClick={handleSaveWorkspaceName}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                            >
                                                Save
                                            </button>
                                        )}
                                    </div>

                                    {charError && (
                                        <p className="text-[11px] text-red-500 mt-1">{charError}</p>
                                    )}
                                </div>


                                <div>
                                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-0.5">
                                        Icon
                                    </label>
                                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-3">
                                        Upload an image or pick an emoji. This icon will appear in your sidebar and notifications.
                                    </p>

                                    <div className="relative inline-block">
                                        <button
                                            type="button"
                                            onClick={() => setShowWorkspaceIconPicker((prev) => !prev)}
                                            className="w-14 h-14 rounded-lg border border-gray-200 dark:border-[#383838] bg-gray-50 dark:bg-[#262626] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#2e2e2e] transition-colors overflow-hidden cursor-pointer shadow-xs"
                                            title="Change workspace icon"
                                        >
                                            {workspaceIcon ? (
                                                typeof workspaceIcon === 'string' &&
                                                (workspaceIcon.startsWith('http') || workspaceIcon.startsWith('data:')) ? (
                                                    <img src={workspaceIcon} alt="Workspace Icon" className="w-full h-full object-cover" />
                                                ) : typeof workspaceIcon === 'string' ? (
                                                    <span className="text-3xl leading-none">{workspaceIcon}</span>
                                                ) : workspaceIcon?.type === 'emoji' && workspaceIcon?.value ? (
                                                    <span className="text-3xl leading-none">{workspaceIcon.value}</span>
                                                ) : workspaceIcon?.emoji ? (
                                                    <span className="text-3xl leading-none">{workspaceIcon.emoji}</span>
                                                ) : (
                                                    <PageIcon icon={workspaceIcon} size={28} />
                                                )
                                            ) : (
                                                <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center text-xs font-bold text-white shadow-xs">
                                                    {userEmail?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                            )}
                                        </button>
                                        {showWorkspaceIconPicker && (
                                            <div className="absolute top-16 left-0 z-50">
                                                <IconPickerModal
                                                    onSelect={(selected) => {
                                                        onWorkspaceIconChange?.(selected);
                                                        setShowWorkspaceIconPicker(false);
                                                    }}
                                                    onClose={() => setShowWorkspaceIconPicker(false)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}