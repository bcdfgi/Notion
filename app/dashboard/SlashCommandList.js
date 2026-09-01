'use client';
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';

export const SlashCommandList = forwardRef((props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index) => {
        const item = props.items[index];
        if (item) {
            props.command(item);
        }
    };

    useEffect(() => {
        setSelectedIndex(0);
    }, [props.items]);

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }) => {
            if (event.key === 'ArrowUp') {
                setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
                return true;
            }
            if (event.key === 'ArrowDown') {
                setSelectedIndex((selectedIndex + 1) % props.items.length);
                return true;
            }
            if (event.key === 'Enter') {
                selectItem(selectedIndex);
                return true;
            }
            return false;
        },
    }));

    if (!props.items || props.items.length === 0) {
        return (
            <div className="z-50 min-w-[240px] rounded-lg border border-gray-200 bg-white p-2 shadow-xl text-xs text-gray-400">
                No results
            </div>
        );
    }

    return (
        <div className="z-50 min-w-[240px] max-h-80 overflow-y-auto rounded-lg border border-gray-200 bg-white p-1.5 shadow-xl transition-all">
            {props.items.map((item, index) => {
                const prevItem = props.items[index - 1];
                const showGroupHeader = !prevItem || prevItem.group !== item.group;

                return (
                    <React.Fragment key={index}>
                        {showGroupHeader && (
                            <div className={`px-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider ${index > 0 ? 'mt-2 pt-2 border-t border-gray-100' : 'pt-1 pb-1'}`}>
                                {item.group || 'General'}
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={() => selectItem(index)}
                            className={`w-full flex items-center gap-2.5 px-2 py-1.5 text-left rounded-md text-xs font-medium transition-colors ${
                                index === selectedIndex
                                    ? 'bg-gray-100 text-slate-900'
                                    : 'text-slate-600 hover:bg-gray-50'
                            }`}
                        >
                            <span className="w-5 h-5 flex items-center justify-center text-slate-500 font-bold bg-gray-50 rounded border border-gray-200 shrink-0 text-[11px]">
                                {item.icon}
                            </span>
                            <div className="min-w-0">
                                <div className="font-medium text-slate-800 truncate">{item.title}</div>
                                {item.description && (
                                    <div className="text-[10px] text-gray-400 truncate">{item.description}</div>
                                )}
                            </div>
                        </button>
                    </React.Fragment>
                );
            })}
        </div>
    );
});

SlashCommandList.displayName = 'SlashCommandList';