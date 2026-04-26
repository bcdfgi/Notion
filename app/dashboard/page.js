'use client';
import React, { useEffect, useCallback, useState, useRef, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import debounce from 'lodash.debounce';
import { updatePageContent, logout, createPage, getPages,deletePage } from '../actions';
import { Link } from '@tiptap/extension-link';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Code } from '@tiptap/extension-code';
import { Underline } from '@tiptap/extension-underline';



const useIsMounted = () => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true); }, []);
    return mounted;
};

const ToolbarButton = ({ onClick, isActive, children, className = "" }) => (
    <button
        type="button"
        onClick={onClick}
        className={`h-7 min-w-7 px-1.5 rounded flex items-center justify-center transition-all duration-200 ease-in-out ${
            isActive
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
        } ${className}`}
    >
        {children}
    </button>
);

const VerticalDivider = () => <div className="w-[1px] h-4 bg-gray-200 mx-1.5" />;



const Dashboard = ({ userEmail = "nehakondabathini1234@gmail.com" }) => {
    const isMounted = useIsMounted();
    const [savingStatus, setSavingStatus] = useState("Saved");
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [handlePos, setHandlePos] = useState({ top: -100, opacity: 0 });

    const containerRef = useRef(null);
    const [pages, setPages] = useState([]);
    const [currentPageId, setCurrentPageId] = useState(null);
    const titleRef = useRef(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                code: false,
                link: false,
                underline: false,
            }),
            Underline,
            TextStyle,
            Color,
            Code,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { class: 'text-blue-500 underline cursor-pointer' }
            }),
            TaskList,
            TaskItem.configure({ nested: true }),
            Placeholder.configure({ placeholder: "Type '/' for commands..." }),
        ],
        content: '',
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'tiptap prose prose-slate max-w-none focus:outline-none min-h-[500px] caret-blue-500 pb-32',
            },
        },
        onUpdate: ({ editor }) => {
            const currentTitle = titleRef.current?.innerText || "Untitled";
            saveContent(editor.getJSON(), currentTitle);
        },
        onSelectionUpdate: ({ editor }) => {
            const { selection } = editor.state;
            if (!editor.view) return;
            let node = editor.view.domAtPos(selection.from).node;
            const editorRoot = editor.view.dom;
            while (node && node.parentNode !== editorRoot) {
                node = node.parentNode;
            }
            if (node instanceof HTMLElement) {
                updateHandlePosition(node);
            }
        },
    });

    const debouncedSave = useMemo(
        () => debounce(async (json, currentTitle, pageId) => {
            if (!pageId) return;
            setSavingStatus("Saving...");
            try {
                const result = await updatePageContent(pageId, { title: currentTitle, content: json });
                if (result.success) {
                    setSavingStatus("Saved");

                    setPages(prevPages => {
                        return prevPages.map(p =>
                            p._id === pageId ? { ...p, title: currentTitle, content: json } : p
                        );
                    });
                }
            } catch (error) {
                setSavingStatus("Error");
            }
        }, 1000),
        []
    );
    const fetchSidebar = useCallback(async () => {
        const result = await getPages(userEmail);
        if (result.success) {
            setPages(result.pages);
        }
    }, [userEmail]);


    const loadPage = useCallback(async (pageId, forceData = null) => {
        if (!pageId || (pageId === currentPageId && !forceData)) return;


        debouncedSave.cancel();


        setIsLoading(true);
        setCurrentPageId(pageId);

        const selectedPage = forceData || pages.find(p => p._id === pageId);


        if (selectedPage) {
            const displayTitle = selectedPage.title || "Untitled";

            if (titleRef.current) {
                titleRef.current.innerText = displayTitle;
                titleRef.current._lastValue = displayTitle; // LOCK IT IN
            }

            requestAnimationFrame(() => {
                editor?.commands.setContent(selectedPage.content, false);
                setIsLoading(false);
            });
        } else {

            const result = await getPages(userEmail);
            const freshPage = result.pages.find(p => p._id === pageId);

            if (freshPage) {
                setPages(result.pages);
                if (titleRef.current) {
                    titleRef.current.innerText = freshPage.title || "Untitled";
                }
                editor?.commands.setContent(freshPage.content, false);
            }
            setIsLoading(false);
        }
    }, [currentPageId, editor, pages, userEmail, debouncedSave]);

    const handleCreatePage = async () => {
        const result = await createPage(userEmail);
        if (result.success) {

            const sidebarResult = await getPages(userEmail);
            setPages(sidebarResult.pages);


            const newPage = sidebarResult.pages.find(p => p._id === result.pageId);
            loadPage(result.pageId, newPage);
        }
    };
    const handleDeletePage = async (e, pageId) => {
        e.stopPropagation();

        if (confirm("Are you sure you want to delete this page?")) {
            const result = await deletePage(pageId);
            if (result.success) {

                setPages(prev => prev.filter(p => p._id !== pageId));

                // If we deleted the current page, move to the first available page
                if (currentPageId === pageId) {
                    const remainingPages = pages.filter(p => p._id !== pageId);
                    if (remainingPages.length > 0) {
                        loadPage(remainingPages[0]._id);
                    } else {
                        handleCreatePage();
                    }
                }
            }
        }
    };


    useEffect(() => {
        const initialize = async () => {

            if (isMounted && editor && !currentPageId) {
                const result = await getPages(userEmail);
                if (result.success && result.pages.length > 0) {
                    setPages(result.pages);
                    const firstPage = result.pages[0];

                    setCurrentPageId(firstPage._id);

                    requestAnimationFrame(() => {
                        if (titleRef.current) {
                            const initialTitle = firstPage.title || "Untitled";
                            titleRef.current.innerText = initialTitle;
                            titleRef.current._lastValue = initialTitle;
                        }
                    });
                    editor.commands.setContent(firstPage.content);
                    setIsLoading(false);
                } else if (result.success && result.pages.length === 0) {
                    handleCreatePage();
                }
            }
        };
        initialize();
    }, [isMounted, editor, userEmail]);

    const updateHandlePosition = useCallback((targetElement, isTitle = false) => {
        if (!containerRef.current || !targetElement) return;
        const containerRect = containerRef.current.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        const offset = isTitle ? 14 : 4;
        setHandlePos({ top: targetRect.top - containerRect.top + offset, opacity: 1 });
    }, []);

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const title = titleRef.current;
        if (title && e.clientY >= title.getBoundingClientRect().top && e.clientY <= title.getBoundingClientRect().bottom) {
            updateHandlePosition(title, true);
            return;
        }
        const element = document.elementFromPoint(e.clientX, e.clientY);
        const block = element?.closest('.tiptap > *');
        if (block) updateHandlePosition(block);
    };







    const saveContent = useCallback((json, title) => {

        const cleanTitle = title.replace(/\n/g, '').trim();


        if (!isLoading && currentPageId && cleanTitle.length > 0) {
            debouncedSave(json, cleanTitle, currentPageId);
        }
    }, [currentPageId, debouncedSave, isLoading]);



    useEffect(() => {
        if (!editor || !currentPageId) return;

        editor.setOptions({
            onUpdate: ({ editor }) => {
                const currentTitle = titleRef.current?.innerText || "Untitled";
                saveContent(editor.getJSON(), currentTitle);
            },
        });
    }, [editor, currentPageId, saveContent]);
    useEffect(() => {
        const currentPage = pages.find(p => p._id === currentPageId);

        if (currentPage && titleRef.current && document.activeElement !== titleRef.current) {
            const syncTitle = currentPage.title || "Untitled";
            if (titleRef.current.innerText !== syncTitle) {
                titleRef.current.innerText = syncTitle;
                titleRef.current._lastValue = syncTitle;
            }
        }
    }, [pages, currentPageId]);


    if (!isMounted) return null;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="animate-pulse text-gray-400 font-medium">Loading Workspace...</div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-white overflow-hidden font-sans text-slate-900">

            <aside
                className={`${isSidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 ease-in-out bg-[#FBFBFA] border-r border-gray-200 flex flex-col z-20 overflow-hidden`}
            >
                <div className="p-4 flex flex-col h-full min-w-[256px]">
                    <div className="flex items-center gap-2 px-2 py-1.5 mb-6 hover:bg-gray-200/50 rounded-lg cursor-pointer transition-colors">
                        <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                            {userEmail[0].toUpperCase()}
                        </div>
                        <span className="font-semibold text-sm text-slate-700 truncate">
                            {`${userEmail.split('@')[0]}'s Notion`}
                        </span>
                    </div>

                    <nav className="flex-1 space-y-1">
                        <button className="w-full flex items-center gap-2.5 px-2.5 py-2 text-sm font-medium text-slate-600 hover:bg-gray-200/50 rounded-lg transition-colors group">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                            Home
                        </button>
                        <button className="w-full flex items-center gap-2.5 px-2.5 py-2 text-sm font-medium text-slate-600 hover:bg-gray-200/50 rounded-lg transition-colors group">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
                            Library
                        </button>
                        <div className="mt-8">
                            <div className="flex items-center justify-between px-3 mb-2 group">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Private</span>
                                <button
                                    onClick={handleCreatePage}
                                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-200 rounded transition-all"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                </button>
                            </div>

                            <div className="space-y-0.5">
                                {pages.map((page) => (
                                    <div key={page._id} className="group relative">
                                        <button
                                            onClick={() => loadPage(page._id)}
                                            className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                                currentPageId === page._id
                                                    ? 'bg-gray-200 text-slate-900 font-medium'
                                                    : 'text-slate-600 hover:bg-gray-200/50'
                                            }`}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                                            <span className="truncate pr-6">{page.title || "Untitled"}</span>
                                        </button>


                                        <button
                                            onClick={(e) => handleDeletePage(e, page._id)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-300 rounded text-gray-400 hover:text-red-500 transition-all"
                                            title="Delete page"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button className="w-full flex items-center gap-2.5 px-2.5 py-2 text-sm font-medium text-slate-600 hover:bg-gray-200/50 rounded-lg transition-colors group">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                            Settings
                        </button>
                    </nav>

                    <div className="mt-auto pt-4 border-t border-gray-200">
                        <button  onClick={()=> logout()}  className="w-full text-left px-2 py-1.5 text-xs font-medium text-gray-400 hover:text-red-500 transition-colors">
                            Log out
                        </button>
                    </div>
                </div>
            </aside>


            <div className="flex-1 flex flex-col min-w-0 bg-white relative">
                <header className="h-11 flex items-center justify-between px-4 bg-white/80 backdrop-blur-md z-10">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 transition-colors"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${savingStatus === "Saving..." ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`} />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {savingStatus}
                        </span>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto">
                    <main
                        ref={containerRef}
                        onMouseMove={handleMouseMove}
                        className="max-w-3xl mx-auto mt-16 px-16 relative group pb-40"
                    >

                        <div
                            className="absolute flex items-center z-50 pointer-events-auto opacity-0 group-hover:opacity-100"
                            style={{
                                transform: `translate3d(-100%, ${handlePos.top}px, 0)`,
                                transition: 'transform 100ms cubic-bezier(0.2, 0, 0, 1), opacity 200ms',
                            }}
                        >
                            <button
                                className="p-1 hover:bg-gray-100 rounded text-gray-300 hover:text-gray-600 transition-colors"
                                onClick={() => editor?.chain().focus().insertContent('<p></p>').run()}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            </button>
                            <div className="p-1 hover:bg-gray-100 rounded text-gray-300 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="2" /><circle cx="9" cy="12" r="2" /><circle cx="9" cy="18" r="2" /><circle cx="15" cy="6" r="2" /><circle cx="15" cy="12" r="2" /><circle cx="15" cy="18" r="2" /></svg>
                            </div>
                        </div>

                        <h1
                            ref={titleRef}
                            contentEditable
                            suppressContentEditableWarning={true}
                            data-placeholder="Untitled"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    editor?.chain().focus().run();
                                }
                            }}
                            onInput={(e) => {
                                const text = e.currentTarget.innerText;


                                if (text.trim() === "") return;


                                if (text !== titleRef.current._lastValue) {
                                    titleRef.current._lastValue = text;
                                    saveContent(editor?.getJSON(), text);
                                }
                            }}
                            onBlur={(e) => {
                                const text = e.currentTarget.innerText.trim();
                                if (text === "") {
                                    const fallback = "Untitled";
                                    e.currentTarget.innerText = fallback;
                                    titleRef.current._lastValue = fallback;
                                    saveContent(editor?.getJSON(), fallback);
                                }
                            }}
                            className="text-5xl font-bold mb-8 outline-none text-slate-800 tracking-tight leading-tight empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300"
                        >

                        </h1>

                        {editor && (
                            <>
                                <BubbleMenu
                                    editor={editor}
                                    tippyOptions={{ duration: 150 }}
                                    className="flex items-center gap-0.5 bg-white border border-gray-200 shadow-xl rounded-lg p-1.5"
                                >
                                    <button className="flex items-center gap-1.5 px-2 py-1 hover:bg-gray-100 rounded text-xs font-semibold text-gray-700 transition-colors">
                                        T
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6"/></svg>
                                    </button>

                                    <VerticalDivider />

                                    <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}>
                                        <span className="font-bold text-[13px]">B</span>
                                    </ToolbarButton>

                                    <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')}>
                                        <span className="italic serif text-[14px]">I</span>
                                    </ToolbarButton>

                                    <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')}>
                                        <span className="underline text-[13px] underline-offset-2">U</span>
                                    </ToolbarButton>

                                    <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                                    </ToolbarButton>

                                    <VerticalDivider />

                                    <ToolbarButton onClick={() => {
                                        const url = window.prompt('Enter URL');
                                        if (url) editor.chain().focus().setLink({ href: url }).run();
                                    }} isActive={editor.isActive('link')}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                                    </ToolbarButton>

                                    <ToolbarButton>
                                        <div className="flex flex-col items-center leading-none">
                                            <span className="text-[13px] font-semibold text-gray-700">A</span>
                                            <div className="w-3 h-[2px] bg-red-500 rounded-full mt-0.5" />
                                        </div>
                                    </ToolbarButton>

                                    <VerticalDivider />

                                    <ToolbarButton>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                                    </ToolbarButton>
                                </BubbleMenu>

                                <FloatingMenu editor={editor} className="flex gap-1 bg-white border border-gray-200 shadow-lg rounded-lg p-1.5 animate-in fade-in slide-in-from-bottom-2">
                                    <button className="px-2 py-1 text-xs font-medium hover:bg-gray-100 rounded" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</button>
                                    <button className="px-2 py-1 text-xs font-medium hover:bg-gray-100 rounded" onClick={() => editor.chain().focus().toggleTaskList().run()}>Task List</button>
                                    <button className="px-2 py-1 text-xs font-medium hover:bg-gray-100 rounded" onClick={() => editor.chain().focus().toggleBulletList().run()}>Bullet List</button>
                                </FloatingMenu>
                            </>
                        )}

                        <EditorContent editor={editor} />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;