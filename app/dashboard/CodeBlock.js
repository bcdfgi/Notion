'use client';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import {
    ChevronDown,
    Copy,
    Check,
    CornerDownLeft,
    MoreHorizontal,
    MessageSquareText,
    Code2,
    Braces,
    Link as LinkIcon,
    CopyPlus,
    Trash2,
    ChevronRight,
} from 'lucide-react';

const LANGUAGES = [
    'Bash', 'C', 'C++', 'C#', 'CSS', 'Dart', 'Diff', 'Docker',
    'Elixir', 'Go', 'GraphQL', 'HTML', 'Java', 'JavaScript', 'JSON',
    'Kotlin', 'LaTeX', 'Lua', 'Markdown', 'MATLAB', 'PHP', 'Plain Text',
    'PowerShell', 'Python', 'R', 'Ruby', 'Rust', 'Scala', 'Shell',
    'Smalltalk', 'Solidity', 'SQL', 'Swift', 'TOML', 'TypeScript',
    'VB.Net', 'Verilog', 'VHDL', 'Visual Basic', 'WebAssembly', 'XML', 'YAML'
];

export const CodeBlockComponent = (props) => {
    const { node, updateAttributes, editor, deleteNode } = props;
    const [copied, setCopied] = useState(false);
    const [isWordWrap, setIsWordWrap] = useState(Boolean(node.attrs.wrap));
    const [showLanguageQuickMenu, setShowLanguageQuickMenu] = useState(false);
    const [showActionMenu, setShowActionMenu] = useState(false);
    const [showLanguageSubmenu, setShowLanguageSubmenu] = useState(false);

    const [searchAction, setSearchAction] = useState('');
    const [langSearchQuery, setLangSearchQuery] = useState('');
    const [showCaption, setShowCaption] = useState(Boolean(node.attrs.caption));

    const quickMenuRef = useRef(null);
    const actionMenuRef = useRef(null);
    const captionInputRef = useRef(null);
    const langSearchInputRef = useRef(null);

    const currentLanguage = node.attrs.language || 'Plain Text';
    const caption = node.attrs.caption || '';

    const filteredLanguages = useMemo(() => {
        return LANGUAGES.filter((lang) =>
            lang.toLowerCase().includes(langSearchQuery.toLowerCase().trim())
        );
    }, [langSearchQuery]);

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (quickMenuRef.current && !quickMenuRef.current.contains(e.target) && !e.target.closest('.lang-quick-btn')) {
                setShowLanguageQuickMenu(false);
            }
            if (actionMenuRef.current && !actionMenuRef.current.contains(e.target) && !e.target.closest('.action-menu-btn')) {
                setShowActionMenu(false);
                setShowLanguageSubmenu(false);
            }
        };

        if (showLanguageQuickMenu || showActionMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showLanguageQuickMenu, showActionMenu]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(node.textContent || '');
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    };

    const handleSelectLanguage = (lang) => {
        updateAttributes({ language: lang });
        setShowLanguageQuickMenu(false);
        setShowActionMenu(false);
        setShowLanguageSubmenu(false);
        setLangSearchQuery('');
    };

    const handleToggleWrap = () => {
        const nextWrap = !isWordWrap;
        setIsWordWrap(nextWrap);
        updateAttributes({ wrap: nextWrap });
    };

    const handleAddCaption = () => {
        setShowActionMenu(false);
        setShowCaption(true);
        setTimeout(() => captionInputRef.current?.focus(), 50);
    };

    const handleCopyLinkToBlock = async () => {
        setShowActionMenu(false);
        try {
            await navigator.clipboard.writeText(window.location.href);
        } catch (err) {
            console.error('Failed to copy link:', err);
        }
    };

    const handleDuplicate = () => {
        setShowActionMenu(false);
        if (editor) {
            const { selection } = editor.state;
            editor
                .chain()
                .focus()
                .insertContentAt(selection.to, {
                    type: 'codeBlock',
                    attrs: { ...node.attrs },
                    content: node.content?.toJSON() || [],
                })
                .run();
        }
    };

    return (
        <NodeViewWrapper className="relative my-4 group/code select-none not-prose">
            {/* Notion Code Block Container */}
            <div className="rounded-md bg-[#F7F6F3] border border-neutral-200/60 p-4 pt-8 transition-colors relative">
                {/* Floating Top-Right Controls Bar */}
                <div
                    contentEditable={false}
                    className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover/code:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm border border-neutral-200/80 rounded-md shadow-sm p-0.5 text-neutral-600 z-20"
                >
                    {/* Quick Language Selector Button */}
                    <button
                        type="button"
                        onClick={() => {
                            setShowLanguageQuickMenu((prev) => !prev);
                            setShowActionMenu(false);
                        }}
                        className="lang-quick-btn flex items-center gap-1 px-2 py-1 text-xs font-medium rounded hover:bg-neutral-100 transition-colors text-neutral-700"
                    >
                        <span>{currentLanguage}</span>
                        <ChevronDown size={13} className="text-neutral-400" />
                    </button>

                    {/* Copy Button */}
                    <button
                        type="button"
                        onClick={handleCopy}
                        title="Copy code"
                        className="p-1.5 rounded hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 transition-colors"
                    >
                        {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>

                    {/* Word Wrap Quick Button */}
                    <button
                        type="button"
                        onClick={handleToggleWrap}
                        title={isWordWrap ? 'Disable wrap' : 'Enable wrap'}
                        className={`p-1.5 rounded hover:bg-neutral-100 transition-colors ${
                            isWordWrap ? 'text-blue-600 bg-blue-50' : 'text-neutral-500 hover:text-neutral-800'
                        }`}
                    >
                        <CornerDownLeft size={14} />
                    </button>

                    {/* Notion More Options Trigger */}
                    <button
                        type="button"
                        onClick={() => {
                            setShowActionMenu((prev) => !prev);
                            setShowLanguageQuickMenu(false);
                            setShowLanguageSubmenu(false);
                        }}
                        title="More options"
                        className="action-menu-btn p-1.5 rounded hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 transition-colors"
                    >
                        <MoreHorizontal size={14} />
                    </button>
                </div>

                {/* Quick Language Dropdown */}
                {showLanguageQuickMenu && (
                    <div
                        ref={quickMenuRef}
                        contentEditable={false}
                        className="absolute right-2 top-10 w-56 bg-white rounded-xl shadow-2xl border border-neutral-200/80 p-2 flex flex-col z-40 text-neutral-800 animate-in fade-in zoom-in-95 duration-100"
                    >
                        <div className="mb-2">
                            <input
                                autoFocus
                                type="text"
                                value={langSearchQuery}
                                onChange={(e) => setLangSearchQuery(e.target.value)}
                                placeholder="Search for a language..."
                                className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-blue-500 outline-none focus:ring-2 focus:ring-blue-100 placeholder:text-neutral-400 font-sans"
                            />
                        </div>
                        <div className="max-h-60 overflow-y-auto space-y-0.5 font-sans">
                            {filteredLanguages.map((lang) => (
                                <button
                                    key={lang}
                                    type="button"
                                    onClick={() => handleSelectLanguage(lang)}
                                    className={`w-full text-left px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                                        currentLanguage === lang
                                            ? 'bg-neutral-100 font-semibold text-neutral-900'
                                            : 'text-neutral-700 hover:bg-neutral-100/70'
                                    }`}
                                >
                                    {lang}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- Notion Action Context Menu --- */}
                {showActionMenu && (
                    <div
                        ref={actionMenuRef}
                        contentEditable={false}
                        className="absolute right-2 top-10 w-60 bg-white rounded-xl shadow-2xl border border-neutral-200 p-1.5 z-40 text-neutral-700 select-none animate-in fade-in zoom-in-95 duration-75"
                    >
                        {/* Search Actions Input */}
                        <div className="px-2 py-1 mb-1 border-b border-gray-100">
                            <input
                                autoFocus
                                type="text"
                                value={searchAction}
                                onChange={(e) => setSearchAction(e.target.value)}
                                placeholder="Search actions..."
                                className="w-full text-xs bg-gray-50 rounded px-2.5 py-1 outline-none text-slate-800 placeholder:text-gray-400"
                            />
                        </div>

                        <div className="px-2 py-0.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                            Code
                        </div>

                        {/* Caption */}
                        <button
                            type="button"
                            onClick={handleAddCaption}
                            className="w-full flex items-center justify-between px-2 py-1.5 text-xs rounded hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <MessageSquareText size={14} className="text-gray-500" />
                                <span>Caption</span>
                            </div>
                            <span className="text-[10px] text-gray-400 font-mono">⌘⌥M</span>
                        </button>

                        {/* Copy Code */}
                        <button
                            type="button"
                            onClick={() => {
                                handleCopy();
                                setShowActionMenu(false);
                            }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded hover:bg-gray-100 transition-colors"
                        >
                            <Code2 size={14} className="text-gray-500" />
                            <span>Copy code</span>
                        </button>

                        {/* Wrap Code Toggle */}
                        <div
                            onClick={handleToggleWrap}
                            className="w-full flex items-center justify-between px-2 py-1.5 text-xs rounded hover:bg-gray-100 cursor-pointer transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <CornerDownLeft size={14} className="text-gray-500" />
                                <span>Wrap code</span>
                            </div>
                            <div
                                className={`w-8 h-4.5 rounded-full flex items-center p-0.5 transition-colors ${
                                    isWordWrap ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'
                                }`}
                            >
                                <div className="w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
                            </div>
                        </div>

                        {/* Language Nested Submenu Trigger */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowLanguageSubmenu((prev) => !prev)}
                                className="w-full flex items-center justify-between px-2 py-1.5 text-xs rounded hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <Braces size={14} className="text-gray-500" />
                                    <span>Language</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-400">
                                    <span className="text-[11px] text-gray-500 max-w-[65px] truncate">
                                        {currentLanguage}
                                    </span>
                                    <ChevronRight size={13} />
                                </div>
                            </button>

                            {/* Nested Language List (opens to the left) */}
                            {showLanguageSubmenu && (
                                <div className="absolute right-full top-0 mr-1 w-52 bg-white rounded-xl shadow-2xl border border-gray-200 p-2 z-50">
                                    <input
                                        ref={langSearchInputRef}
                                        type="text"
                                        value={langSearchQuery}
                                        onChange={(e) => setLangSearchQuery(e.target.value)}
                                        placeholder="Search language..."
                                        className="w-full text-xs px-2 py-1 mb-1.5 rounded border border-blue-500 outline-none"
                                    />
                                    <div className="max-h-52 overflow-y-auto space-y-0.5">
                                        {filteredLanguages.map((lang) => (
                                            <button
                                                key={lang}
                                                type="button"
                                                onClick={() => handleSelectLanguage(lang)}
                                                className={`w-full text-left px-2 py-1 text-xs rounded hover:bg-gray-100 ${
                                                    currentLanguage === lang ? 'font-semibold text-blue-600' : 'text-slate-700'
                                                }`}
                                            >
                                                {lang}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="h-px bg-gray-100 my-1" />



                        {/* Duplicate */}
                        <button
                            type="button"
                            onClick={handleDuplicate}
                            className="w-full flex items-center justify-between px-2 py-1.5 text-xs rounded hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <CopyPlus size={14} className="text-gray-500" />
                                <span>Duplicate</span>
                            </div>
                            <span className="text-[10px] text-gray-400 font-mono">⌘D</span>
                        </button>

                        {/* Delete */}
                        <button
                            type="button"
                            onClick={deleteNode}
                            className="w-full flex items-center justify-between px-2 py-1.5 text-xs text-red-600 rounded hover:bg-red-50 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <Trash2 size={14} />
                                <span>Delete</span>
                            </div>
                            <span className="text-[10px] text-red-400 font-mono">Del</span>
                        </button>
                    </div>
                )}

                {/* Actual Editable Content */}
                <pre
                    className={`font-mono text-sm leading-relaxed text-neutral-800 outline-none select-text ${
                        isWordWrap ? 'whitespace-pre-wrap break-words' : 'overflow-x-auto whitespace-pre'
                    }`}
                >
                    <NodeViewContent as="code" />
                </pre>
            </div>

            {/* Notion Caption Field */}
            {showCaption && (
                <div className="mt-1.5 w-full px-1">
                    <input
                        ref={captionInputRef}
                        type="text"
                        value={caption}
                        contentEditable={true}
                        suppressContentEditableWarning
                        placeholder="Write a caption..."
                        onChange={(e) => updateAttributes({ caption: e.target.value })}
                        onKeyDown={(e) => e.stopPropagation()}
                        className="w-full text-center text-xs text-gray-500 bg-transparent border-none outline-none placeholder:text-gray-300 focus:text-slate-800 select-text"
                    />
                </div>
            )}
        </NodeViewWrapper>
    );
};