'use client';
import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import debounce from 'lodash.debounce';
import { updatePageContent, getUserData } from '../actions';

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
    const [mounted, setMounted] = useState(false);
    const [savingStatus, setSavingStatus] = useState("Saved");
    const [handlePos, setHandlePos] = useState({ top: -100, opacity: 1 });
    const titleRef = useRef(null);

    const editor = useEditor({
        extensions: [
            StarterKit,
            TaskList,
            TaskItem.configure({ nested: true }),
            Placeholder.configure({
                placeholder: "Type '/' for commands...",
            }),
        ],
        content: '',
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'tiptap prose prose-slate max-w-none focus:outline-none min-h-[500px] caret-blue-500 pb-32',
            },
            handleDOMEvents: {
                mousemove: (view, event) => {
                    const editorElement = view.dom;
                    const editorRect = editorElement.getBoundingClientRect();

                    const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
                    if (!pos) return false;

                    const node = view.domAtPos(pos.pos).node;
                    const container = node.nodeType === 3 ? node.parentElement : node;

                    if (container === editorElement || container.classList.contains('prose')) return false;

                    const rect = container.getBoundingClientRect();


                    const relativeTop = rect.top - editorRect.top + editorElement.offsetTop;

                    setHandlePos({
                        top: relativeTop,
                        opacity: 1
                    });
                    return false;
                }
            }
        },
        onUpdate: ({ editor }) => {
            saveContent(editor.getJSON(), titleRef.current?.innerText || "Untitled");
        },
    });

    useEffect(() => {
        setMounted(true);
        const loadInitialData = async () => {
            const result = await getUserData(userEmail);
            if (result.success && result.data && editor) {
                if (titleRef.current) titleRef.current.innerText = result.data.title || "Untitled";
                if (result.data.content) editor.commands.setContent(result.data.content);
            }
        };
        if (editor) loadInitialData();
    }, [editor, userEmail]);

    const saveContent = useCallback(
        debounce(async (json, currentTitle) => {
            setSavingStatus("Saving...");
            const result = await updatePageContent(userEmail, { title: currentTitle, content: json });
            setSavingStatus(result.success ? "Saved" : "Error");
        }, 1000),
        [userEmail]
    );

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-white">
            <header className="sticky top-0 z-10 flex items-center justify-end px-6 py-3 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                    {savingStatus}
                </span>
            </header>

            <main className="max-w-3xl mx-auto mt-16 px-12 relative">

                <div
                    className="notion-block-handle"
                    style={{
                        top: `${handlePos.top}px`,
                        opacity: handlePos.opacity
                    }}
                >
                    <button
                        className="handle-btn"
                        onClick={() => editor.chain().focus().insertContent('<p></p>').run()}
                    >
                        <svg width="14" height="14" viewBox="0 0 16 16"><path fill="currentColor" d="M8 0a1 1 0 0 1 1 1v6h6a1 1 0 1 1 0 2H9v6a1 1 0 1 1-2 0V9H1a1 1 0 1 1 0-2h6V1a1 1 0 0 1 1-1z"/></svg>
                    </button>
                    <div className="handle-btn cursor-grab active:cursor-grabbing">
                        <svg width="12" height="16" viewBox="0 0 8 12"><path fill="currentColor" d="M2 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0 4a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0 4a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm4-8a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0 4a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0 4a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg>
                    </div>
                </div>

                <h1
                    ref={titleRef}
                    className="text-5xl font-bold mb-10 outline-none text-slate-800"
                    contentEditable
                    suppressContentEditableWarning={true}

                    onMouseEnter={() => setHandlePos({ top: 0, opacity: 1 })}
                    onInput={(e) => saveContent(editor?.getJSON(), e.currentTarget.innerText)}
                >
                    Untitled
                </h1>

                {editor && (
                    <BubbleMenu editor={editor} className="flex bg-white border border-gray-200 shadow-xl rounded-lg p-1">
                        <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}>B</MenuButton>
                        <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')}>I</MenuButton>
                        <div className="w-px h-4 bg-gray-200 mx-1 self-center" />
                        <MenuButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')}>Code</MenuButton>
                    </BubbleMenu>
                )}

                {editor && (
                    <FloatingMenu editor={editor} className="flex gap-1 bg-white border border-gray-200 shadow-lg rounded-lg p-1.5">
                        <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</MenuButton>
                        <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()}>List</MenuButton>
                        <MenuButton onClick={() => editor.chain().focus().toggleTaskList().run()}>Task</MenuButton>
                    </FloatingMenu>
                )}

                <EditorContent editor={editor} />
            </main>
        </div>
    );
};

export default Dashboard;