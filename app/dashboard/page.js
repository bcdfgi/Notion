'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import debounce from 'lodash.debounce';

const Dashboard = () => {

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const saveContent = useCallback(
        debounce(async (json) => {
            console.log("Saving to MongoDB...", json);
        }, 1500),
        []
    );

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
            saveContent(editor.getJSON());
        },
    });


    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-white">
            <header className="flex items-center justify-between px-4 py-2 border-b text-sm text-gray-500">
                <div className="flex items-center gap-2">

                </div>

            </header>

            <main className="max-w-3xl mx-auto mt-20 px-8">
                <h1
                    className="text-4xl font-bold mb-8 outline-none"
                    contentEditable
                    suppressContentEditableWarning={true}
                >
                    Untitled
                </h1>
                <EditorContent editor={editor} />
            </main>
        </div>
    );
};

export default Dashboard;