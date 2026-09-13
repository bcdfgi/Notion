'use client';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Plus, Trash2, ArrowRight, ArrowLeft, GripHorizontal } from 'lucide-react';

export const TableControlsOverlay = ({ editor }) => {
    const containerRef = useRef(null);
    const [tablePos, setTablePos] = useState(null);
    const [activeColPos, setActiveColPos] = useState(null);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    const updateCoordinates = useCallback(() => {
        if (!editor || !editor.view || !containerRef.current) return;

        const { selection } = editor.state;
        const domAtPos = editor.view.domAtPos(selection.$from.pos).node;
        const element = domAtPos instanceof HTMLElement ? domAtPos : domAtPos.parentElement;

        const table = element?.closest('table');
        const cell = element?.closest('td, th');

        if (table) {
            const parentRect = containerRef.current.getBoundingClientRect();
            const tableRect = table.getBoundingClientRect();

            // Calculate coordinates relative to THIS wrapper container
            setTablePos({
                top: tableRect.top - parentRect.top,
                left: tableRect.left - parentRect.left,
                width: tableRect.width,
                height: tableRect.height,
            });

            if (cell) {
                const cellRect = cell.getBoundingClientRect();
                setActiveColPos({
                    top: tableRect.top - parentRect.top,
                    left: cellRect.left - parentRect.left,
                    width: cellRect.width,
                });
            } else {
                setActiveColPos(null);
            }
        } else {
            setTablePos(null);
            setActiveColPos(null);
            setShowMenu(false);
        }
    }, [editor]);

    useEffect(() => {
        if (!editor) return;

        editor.on('selectionUpdate', updateCoordinates);
        editor.on('transaction', updateCoordinates);
        window.addEventListener('resize', updateCoordinates);

        return () => {
            editor.off('selectionUpdate', updateCoordinates);
            editor.off('transaction', updateCoordinates);
            window.removeEventListener('resize', updateCoordinates);
        };
    }, [editor, updateCoordinates]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className="pointer-events-none absolute inset-0 z-20 overflow-visible">
            {tablePos && (
                <>
                    {/* 1. Add Column Button (Right Side Pill) */}
                    <div
                        style={{
                            top: `${tablePos.top}px`,
                            left: `${tablePos.left + tablePos.width + 4}px`,
                            height: `${tablePos.height}px`,
                        }}
                        className="absolute flex items-center pointer-events-auto"
                    >
                        <button
                            type="button"
                            title="Click to add a column"
                            onClick={() => {
                                editor.chain().focus().addColumnAfter().run();
                                setTimeout(updateCoordinates, 50);
                            }}
                            className="w-4 h-24 rounded bg-gray-100/90 hover:bg-gray-200 border border-gray-200 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                        >
                            <Plus size={12} strokeWidth={2.5} />
                        </button>
                    </div>

                    {/* 2. Add Row Button (Bottom Pill Matching Exact Table Width) */}
                    <div
                        style={{
                            top: `${tablePos.top + tablePos.height + 4}px`,
                            left: `${tablePos.left}px`,
                            width: `${tablePos.width}px`,
                        }}
                        className="absolute pointer-events-auto"
                    >
                        <button
                            type="button"
                            title="Click to add a row"
                            onClick={() => {
                                editor.chain().focus().addRowAfter().run();
                                setTimeout(updateCoordinates, 50);
                            }}
                            className="h-4 w-full rounded bg-gray-100/90 hover:bg-gray-200 border border-gray-200 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                        >
                            <Plus size={12} strokeWidth={2.5} />
                        </button>
                    </div>

                    {/* 3. Blue Column Handle */}
                    {activeColPos && (
                        <div
                            style={{
                                top: `${activeColPos.top - 14}px`,
                                left: `${activeColPos.left + activeColPos.width / 2 - 12}px`,
                            }}
                            className="absolute pointer-events-auto z-30"
                        >
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMenu((prev) => !prev);
                                }}
                                className="w-6 h-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center justify-center shadow transition-colors cursor-pointer"
                            >
                                <GripHorizontal size={10} strokeWidth={3} />
                            </button>

                            {/* Dropdown Menu */}
                            {showMenu && (
                                <div
                                    ref={menuRef}
                                    className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 p-1.5 z-50 text-xs text-slate-700 select-none"
                                >
                                    <button
                                        type="button"
                                        onClick={() => {
                                            editor.chain().focus().addColumnBefore().run();
                                            setShowMenu(false);
                                            setTimeout(updateCoordinates, 50);
                                        }}
                                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 text-left font-medium"
                                    >
                                        <ArrowLeft size={13} className="text-gray-400" /> Insert left
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            editor.chain().focus().addColumnAfter().run();
                                            setShowMenu(false);
                                            setTimeout(updateCoordinates, 50);
                                        }}
                                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 text-left font-medium"
                                    >
                                        <ArrowRight size={13} className="text-gray-400" /> Insert right
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            editor.chain().focus().deleteColumn().run();
                                            setShowMenu(false);
                                            setTimeout(updateCoordinates, 50);
                                        }}
                                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-red-50 text-left font-medium text-red-600"
                                    >
                                        <Trash2 size={13} /> Delete column
                                    </button>

                                    <div className="h-px bg-gray-100 my-1" />

                                    <button
                                        type="button"
                                        onClick={() => {
                                            editor.chain().focus().deleteTable().run();
                                            setShowMenu(false);
                                            setTablePos(null);
                                        }}
                                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-red-50 text-left font-medium text-red-600"
                                    >
                                        <Trash2 size={13} /> Delete table
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};