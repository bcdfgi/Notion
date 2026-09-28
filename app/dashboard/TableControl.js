'use client';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
    Plus,
    Trash2,
    ArrowRight,
    ArrowLeft,
    GripHorizontal,
    Paintbrush,
    ChevronRight,
    Copy,
    Delete,
    XCircle
} from 'lucide-react';

const TEXT_COLORS = [
    { title: 'Default text', color: null, preview: '#37352F' },
    { title: 'Grey text', color: '#787774', preview: '#787774' },
    { title: 'Brown text', color: '#9F6B53', preview: '#9F6B53' },
    { title: 'Orange text', color: '#D9730D', preview: '#D9730D' },
    { title: 'Yellow text', color: '#CB912F', preview: '#CB912F' },
    { title: 'Green text', color: '#448361', preview: '#448361' },
    { title: 'Blue text', color: '#337EA9', preview: '#337EA9' },
    { title: 'Purple text', color: '#9065B0', preview: '#9065B0' },
    { title: 'Pink text', color: '#C14C8A', preview: '#C14C8A' },
    { title: 'Red text', color: '#D44C47', preview: '#D44C47' },
];

const BG_COLORS = [
    { title: 'Default background', color: null, preview: '#FFFFFF', border: true },
    { title: 'Gray background', color: '#F1F1EF', preview: '#F1F1EF' },
    { title: 'Brown background', color: '#F4EEEE', preview: '#F4EEEE' },
    { title: 'Orange background', color: '#FBECDD', preview: '#FBECDD' },
    { title: 'Yellow background', color: '#FBF3DB', preview: '#FBF3DB' },
    { title: 'Green background', color: '#EDF3EC', preview: '#EDF3EC' },
    { title: 'Blue background', color: '#E7F3F8', preview: '#E7F3F8' },
    { title: 'Purple background', color: '#F4EEF8', preview: '#F4EEF8' },
    { title: 'Pink background', color: '#F9EEF3', preview: '#F9EEF3' },
    { title: 'Red background', color: '#FDEBEC', preview: '#FDEBEC' },
];

export const TableControlsOverlay = ({ editor }) => {
    const containerRef = useRef(null);
    const [tablePos, setTablePos] = useState(null);
    const [activeColPos, setActiveColPos] = useState(null);
    const [showMenu, setShowMenu] = useState(false);
    const [showColorSubmenu, setShowColorSubmenu] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
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
            setShowColorSubmenu(false);
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
                setShowColorSubmenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const applyTextColor = (hex) => {
        if (!editor) return;
        if (hex) {
            editor.chain().focus().setColor(hex).run();
        } else {
            editor.chain().focus().unsetColor().run();
        }
        setShowMenu(false);
        setShowColorSubmenu(false);
    };
    const clearColumnContents = () => {
        if (!editor) return;

        const { state, dispatch } = editor.view;
        const { doc, selection, schema } = state;
        const $pos = selection.$from;

        // 1. Locate the table and the active cell
        let tableDepth = -1;
        let cellDepth = -1;

        for (let d = $pos.depth; d > 0; d--) {
            const name = $pos.node(d).type.name;
            if (name === 'tableCell' || name === 'tableHeader') {
                cellDepth = d;
            }
            if (name === 'table') {
                tableDepth = d;
                break;
            }
        }

        if (tableDepth === -1 || cellDepth === -1) return;

        // 2. Determine target column index (accounting for colspan of preceding siblings)
        const currentRow = $pos.node(cellDepth - 1);
        const cellIndexInRow = $pos.index(cellDepth - 1);
        let targetCol = 0;
        for (let i = 0; i < cellIndexInRow; i++) {
            targetCol += currentRow.child(i).attrs.colspan || 1;
        }

        const table = $pos.node(tableDepth);
        const tableStart = $pos.start(tableDepth);

        // 3. Find the cell in every row belonging to targetCol
        const cellsToClear = [];
        let currentPos = tableStart;

        table.forEach((row) => {
            let col = 0;
            let cellPos = currentPos + 1; // +1 to step inside the row

            row.forEach((cell) => {
                const colspan = cell.attrs.colspan || 1;
                // If this cell covers our target column
                if (col <= targetCol && targetCol < col + colspan) {
                    cellsToClear.push({
                        start: cellPos + 1, // inside cell
                        end: cellPos + cell.nodeSize - 1, // end of cell content
                    });
                }
                col += colspan;
                cellPos += cell.nodeSize;
            });

            currentPos += row.nodeSize;
        });

        // 4. Dispatch transaction replacing cell contents with an empty paragraph
        // (traversing backwards so positions do not shift)
        const tr = state.tr;
        for (let i = cellsToClear.length - 1; i >= 0; i--) {
            const { start, end } = cellsToClear[i];
            tr.replaceWith(start, end, schema.nodes.paragraph.create());
        }

        dispatch(tr);
        setShowMenu(false);
    };

    const applyCellBackground = (hex) => {
        if (!editor) return;
        if (hex) {
            editor.chain().focus().setCellAttribute('backgroundColor', hex).run();
        } else {
            editor.chain().focus().setCellAttribute('backgroundColor', null).run();
        }
        setShowMenu(false);
        setShowColorSubmenu(false);
    };

    return (
        <div ref={containerRef} className="pointer-events-none absolute inset-0 z-20 overflow-visible">
            {tablePos && (
                <>
                    {/* Add Column Button */}
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

                    {/* Add Row Button */}
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

                    {/* Column Grip Handle */}
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
                                    setShowColorSubmenu(false);
                                }}
                                className="w-6 h-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center justify-center shadow transition-colors cursor-pointer"
                            >
                                <GripHorizontal size={10} strokeWidth={3} />
                            </button>

                            {/* Main Dropdown Menu */}
                            {showMenu && (
                                <div
                                    ref={menuRef}
                                    className="absolute left-0 top-full mt-2 w-52 bg-white rounded-xl shadow-2xl border border-gray-200 p-1.5 z-50 text-xs text-slate-700 select-none animate-in fade-in zoom-in-95 duration-75"
                                >
                                    <div className="p-1 mb-1">
                                        <input
                                            type="text"
                                            placeholder="Search actions..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-500 placeholder:text-gray-400"
                                        />
                                    </div>

                                    {/* Colour Flyout Toggle */}
                                    <div
                                        className="relative"
                                        onMouseEnter={() => setShowColorSubmenu(true)}
                                    >
                                        <button
                                            type="button"
                                            className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-gray-100 text-left font-medium transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Paintbrush size={13} className="text-gray-500" />
                                                <span>Colour</span>
                                            </div>
                                            <ChevronRight size={13} className="text-gray-400" />
                                        </button>

                                        {/* Nested Colour Submenu */}
                                        {showColorSubmenu && (
                                            <div
                                                onMouseLeave={() => setShowColorSubmenu(false)}
                                                className="absolute left-full top-0 ml-1 w-56 max-h-80 overflow-y-auto bg-white rounded-xl shadow-2xl border border-gray-200 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-75"
                                            >
                                                <div className="px-2 py-1 text-[11px] font-semibold text-gray-400">
                                                    Text colour
                                                </div>
                                                {TEXT_COLORS.map((item, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => applyTextColor(item.color)}
                                                        className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-gray-100 text-left text-xs text-slate-700 transition-colors"
                                                    >
                                                        <span
                                                            className="w-5 h-5 rounded border border-gray-200 flex items-center justify-center font-serif text-xs font-semibold bg-white shadow-xs"
                                                            style={{ color: item.preview }}
                                                        >
                                                            A
                                                        </span>
                                                        <span>{item.title}</span>
                                                    </button>
                                                ))}

                                                <div className="px-2 pt-2 pb-1 text-[11px] font-semibold text-gray-400 border-t border-gray-100 mt-1">
                                                    Background colour
                                                </div>
                                                {BG_COLORS.map((item, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => applyCellBackground(item.color)}
                                                        className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-gray-100 text-left text-xs text-slate-700 transition-colors"
                                                    >
                                                        <span
                                                            className="w-5 h-5 rounded border border-gray-200 shadow-xs"
                                                            style={{ backgroundColor: item.preview }}
                                                        />
                                                        <span>{item.title}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            editor.chain().focus().addColumnBefore().run();
                                            setShowMenu(false);
                                            setTimeout(updateCoordinates, 50);
                                        }}
                                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 text-left font-medium"
                                    >
                                        <ArrowLeft size={13} className="text-gray-500" /> Insert left
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
                                        <ArrowRight size={13} className="text-gray-500" /> Insert right
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            const { state } = editor;
                                            const cell = state.selection.$from.node(-1);
                                            editor.chain().focus().insertContent(cell.toJSON()).run();
                                            setShowMenu(false);
                                        }}
                                        className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-gray-100 text-left font-medium"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Copy size={13} className="text-gray-500" /> Duplicate
                                        </div>
                                        <span className="text-[10px] text-gray-400">⌘D</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={clearColumnContents}
                                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 text-left font-medium text-slate-700 transition-colors"
                                    >
                                        <XCircle size={14} className="text-gray-600 fill-gray-600 text-white" />
                                        <span>Clear contents</span>
                                    </button>

                                    <div className="h-px bg-gray-100 my-1" />

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
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};