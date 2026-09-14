import React, { useState, useRef, useEffect, useMemo } from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { ChevronDown, Copy, Check, CornerDownLeft, MoreHorizontal } from 'lucide-react';

const LANGUAGES = [
    'Bash', 'C', 'C++', 'C#', 'CSS', 'Dart', 'Diff', 'Docker',
    'Elixir', 'Go', 'GraphQL', 'HTML', 'Java', 'JavaScript', 'JSON',
    'Kotlin', 'LaTeX', 'Lua', 'Markdown', 'MATLAB', 'PHP', 'Plain Text',
    'PowerShell', 'Python', 'R', 'Ruby', 'Rust', 'Scala', 'Shell',
    'Smalltalk', 'Solidity', 'SQL', 'Swift', 'TOML', 'TypeScript',
    'VB.Net', 'Verilog', 'VHDL', 'Visual Basic', 'WebAssembly', 'XML', 'YAML'
];

export const CodeBlockComponent = ({ node, updateAttributes }) => {
    const [copied, setCopied] = useState(false);
    const [isWordWrap, setIsWordWrap] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const menuRef = useRef(null);
    const searchInputRef = useRef(null);

    const currentLanguage = node.attrs.language || 'Plain Text';

    const filteredLanguages = useMemo(() => {
        return LANGUAGES.filter((lang) =>
            lang.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setIsMenuOpen(false);
                setSearchQuery('');
            }
        };

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            setTimeout(() => searchInputRef.current?.focus(), 50);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen]);

    const handleCopy = () => {
        navigator.clipboard.writeText(node.textContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const handleSelectLanguage = (lang) => {
        updateAttributes({ language: lang });
        setIsMenuOpen(false);
        setSearchQuery('');
    };

    return (
        <NodeViewWrapper className="relative my-4 group">
            {/* Notion Code Block Container */}
            <div className="rounded-md bg-[#F7F6F3] border border-neutral-200/60 p-4 pt-8 transition-colors">

                {/* Floating Top-Right Controls Bar */}
                <div
                    contentEditable={false}
                    className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm border border-neutral-200/80 rounded-md shadow-sm p-0.5 text-neutral-600 z-20"
                >
                    {/* Language Selector Button */}
                    <button
                        type="button"
                        onClick={() => setIsMenuOpen((prev) => !prev)}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded hover:bg-neutral-100 transition-colors text-neutral-700"
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
                        {copied ? (
                            <Check size={14} className="text-emerald-500" />
                        ) : (
                            <Copy size={14} />
                        )}
                    </button>

                    {/* Word Wrap Toggle Button */}
                    <button
                        type="button"
                        onClick={() => setIsWordWrap((prev) => !prev)}
                        title={isWordWrap ? 'Disable wrap' : 'Enable wrap'}
                        className={`p-1.5 rounded hover:bg-neutral-100 transition-colors ${
                            isWordWrap ? 'text-blue-600 bg-blue-50' : 'text-neutral-500 hover:text-neutral-800'
                        }`}
                    >
                        <CornerDownLeft size={14} />
                    </button>

                    {/* More Menu Placeholder */}
                    <button
                        type="button"
                        title="More options"
                        className="p-1.5 rounded hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 transition-colors"
                    >
                        <MoreHorizontal size={14} />
                    </button>

                    {/* Searchable Language Dropdown Popover */}
                    {isMenuOpen && (
                        <div
                            ref={menuRef}
                            className="absolute right-0 bottom-full mb-1.5 w-56 bg-white rounded-xl shadow-2xl border border-neutral-200/80 p-2 flex flex-col z-50 text-neutral-800 animate-in fade-in zoom-in-95 duration-100"
                        >
                            {/* Search Input Box */}
                            <div className="mb-2">
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search for a language..."
                                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-blue-500 outline-none focus:ring-2 focus:ring-blue-100 placeholder:text-neutral-400 font-sans"
                                />
                            </div>

                            {/* Language List */}
                            <div className="max-h-60 overflow-y-auto space-y-0.5 font-sans">
                                {filteredLanguages.length > 0 ? (
                                    filteredLanguages.map((lang) => (
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
                                    ))
                                ) : (
                                    <div className="px-2.5 py-2 text-xs text-neutral-400">
                                        No languages found
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Actual Editable Content */}
                <pre className={`font-mono text-sm leading-relaxed text-neutral-800 outline-none ${
                    isWordWrap ? 'whitespace-pre-wrap break-words' : 'overflow-x-auto whitespace-pre'
                }`}>
                    <NodeViewContent as="code" />
                </pre>
            </div>
        </NodeViewWrapper>
    );
};