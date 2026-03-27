'use client';
import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import debounce from 'lodash.debounce';
import { updatePageContent, getUserData } from '../actions';

const Dashboard = ({ userEmail = "nehakondabathini1234@gmail.com" }) => {
    const [mounted, setMounted] = useState(false);
    const [savingStatus, setSavingStatus] = useState("Saved");
    const [title, setTitle] = useState("Untitled");
    const titleRef = useRef(null);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: "Click here to type anything...",
            }),
        ],
        content: '',
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px]',
            },
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
                if (result.data.title) setTitle(result.data.title);
                if (result.data.content) editor.commands.setContent(result.data.content);
            }
        };
        if (editor) loadInitialData();
    }, [editor, userEmail]);


    const saveContent = useCallback(
        debounce(async (json, currentTitle) => {
            setSavingStatus("Saving...");

            const result = await updatePageContent(userEmail, {
                title: currentTitle,
                content: json
            });

            if (result.success) {
                setSavingStatus("Saved");
            } else {
                setSavingStatus("Error saving");
            }
        }, 1500),
        [userEmail]
    );

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-white">
            <header className="flex items-center justify-end px-6 py-2 border-b text-xs text-gray-400">
                <span>{savingStatus}</span>
            </header>

            <main className="max-w-3xl mx-auto mt-20 px-8">

                <h1
                    ref={titleRef}
                    className="text-4xl font-bold mb-8 outline-none"
                    contentEditable
                    suppressContentEditableWarning={true}
                    onInput={(e) => {
                        const newTitle = e.currentTarget.innerText;
                        setTitle(newTitle);
                        saveContent(editor.getJSON(), newTitle);
                    }}
                >
                    {title}
                </h1>
                <EditorContent editor={editor} />
            </main>
        </div>
    );
};

export default Dashboard;