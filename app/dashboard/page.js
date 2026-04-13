'use client';
import React, { useEffect, useCallback, useState, useRef, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import debounce from 'lodash.debounce';
import { updatePageContent, getUserData } from '../actions';

const useIsMounted = () => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);
    return mounted;
};

const MenuButton = ({ onClick, isActive, children }) => (
    <button
        type="button"
        onClick={onClick}
        className={`px-2 py-1.5 text-sm font-medium rounded hover:bg-gray-100 transition-colors ${
            isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
        }`}
    >
        {children}
    </button>
);

const Dashboard = ({ userEmail = "nehakondabathini1234@gmail.com" }) => {
    const isMounted = useIsMounted();
    const [savingStatus, setSavingStatus] = useState("Saved");
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [handlePos, setHandlePos] = useState({ top: -100, opacity: 0 });

    const containerRef = useRef(null);
    const titleRef = useRef(null);

    const editor = useEditor({
        extensions: [
            StarterKit,
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

    useEffect(() => {
        const loadInitialData = async () => {
            if (!editor || !isMounted) return;
            try {
                const result = await getUserData(userEmail);
                if (result.success && result.data) {
                    if (titleRef.current) titleRef.current.innerText = result.data.title;
                    editor.commands.setContent(result.data.content);
                }
            } catch (error) {
                console.error("Failed to load data", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadInitialData();
    }, [editor, isMounted, userEmail]);

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

    const debouncedSave = useMemo(
        () => debounce(async (json, currentTitle, email) => {
            setSavingStatus("Saving...");
            try {
                const result = await updatePageContent(email, { title: currentTitle, content: json });
                setSavingStatus(result.success ? "Saved" : "Error");
            } catch (error) {
                setSavingStatus("Error");
            }
        }, 1000),
        []
    );

    const saveContent = useCallback((json, title) => {
        if (!isLoading) debouncedSave(json, title, userEmail);
    }, [userEmail, debouncedSave, isLoading]);

    if (!isMounted) return null;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="animate-pulse text-gray-400 font-medium">Loading Workspace...</div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-white overflow-hidden">

            <aside
                className={`${isSidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 ease-in-out bg-[#FBFBFA] border-r border-gray-200 flex flex-col z-20`}
            >
                <div className="p-4 flex flex-col h-full min-w-[256px]">

                    <div className="flex items-center gap-2 px-2 py-1 mb-6 hover:bg-gray-200/50 rounded cursor-pointer transition-colors">
                        <div className="w-6 h-6 bg-orange-500 rounded text-white flex items-center justify-center text-[10px] font-bold">
                            {userEmail[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-sm text-slate-700 truncate">
                            {`${userEmail.split('@')[0]}'s Notion`}
                        </span>
                    </div>


                    <nav className="flex-1 space-y-0.5">
                        <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-slate-600 hover:bg-gray-200/50 rounded transition-colors group">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                            Home
                        </button>
                        <button
                            onClick={() => alert("Settings logic here")}
                            className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-slate-600 hover:bg-gray-200/50 rounded transition-colors"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                            Settings
                        </button>
                    </nav>

                    <div className="mt-auto pt-4 border-t border-gray-200">
                        <button className="w-full text-left px-2 py-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors">
                            Log out
                        </button>
                    </div>
                </div>
            </aside>


            <div className="flex-1 flex flex-col min-w-0 bg-white relative">


                <header className="h-12 flex items-center justify-between px-4 bg-white/80 backdrop-blur-md z-10">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-1.5 hover:bg-gray-100 rounded text-gray-500 transition-colors"
                        title="Toggle Sidebar"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                    </button>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                            {savingStatus}
                        </span>
                    </div>
                </header>


                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <main
                        ref={containerRef}
                        onMouseMove={handleMouseMove}
                        className="max-w-3xl mx-auto mt-20 px-16 relative group pb-40"
                    >

                        <div
                            className="absolute flex items-center z-50 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            style={{
                                transform: `translate3d(-100%, ${handlePos.top}px, 0)`,
                                transition: 'transform 120ms cubic-bezier(0.2, 0, 0, 1), opacity 200ms ease-in-out',

                            }}
                        >
                            <button
                                type="button"
                                className="p-1 hover:bg-gray-100 rounded text-gray-300 hover:text-gray-600 transition-colors"
                                onClick={() => editor?.chain().focus().insertContent('<p></p>').run()}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            </button>
                            <div className="p-1 hover:bg-gray-100 rounded text-gray-300 hover:text-gray-600 cursor-grab active:cursor-grabbing transition-colors">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="2" /><circle cx="9" cy="12" r="2" /><circle cx="9" cy="18" r="2" /><circle cx="15" cy="6" r="2" /><circle cx="15" cy="12" r="2" /><circle cx="15" cy="18" r="2" /></svg>
                            </div>
                        </div>


                        <h1
                            ref={titleRef}
                            className="text-5xl font-bold mb-8 outline-none text-slate-800 tracking-tight leading-tight"
                            contentEditable
                            suppressContentEditableWarning={true}
                            onInput={(e) => saveContent(editor?.getJSON(), e.currentTarget.innerText)}
                        >
                            Untitled
                        </h1>


                        {editor && (
                            <>
                                <BubbleMenu editor={editor} pluginKey="bubbleMenu" className="flex bg-white border border-gray-200 shadow-xl rounded-lg p-1">
                                    <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}>B</MenuButton>
                                </BubbleMenu>

                                <FloatingMenu editor={editor} pluginKey="floatingMenu" className="flex gap-1 bg-white border border-gray-200 shadow-lg rounded-lg p-1.5">
                                    <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</MenuButton>
                                    <MenuButton onClick={() => editor.chain().focus().toggleTaskList().run()}>Task</MenuButton>
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