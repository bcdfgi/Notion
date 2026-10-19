
'use client';
import React, { useEffect, useRef } from 'react';

export const DEFAULT_STATUS_GROUPS = [
    {
        key: 'to_do',
        label: 'To-do',
        options: [
            { id: 'not_started', label: 'Not started', color: 'gray', dotColor: 'bg-gray-400' },
        ],
    },
    {
        key: 'in_progress',
        label: 'In progress',
        options: [
            { id: 'in_progress', label: 'In progress', color: 'blue', dotColor: 'bg-blue-500' },
        ],
    },
    {
        key: 'complete',
        label: 'Complete',
        options: [
            { id: 'done', label: 'Done', color: 'green', dotColor: 'bg-emerald-500' },
        ],
    },
];

export const STATUS_THEMES = {
    gray: { bg: 'bg-[#F1F1EF]', text: 'text-[#5A5A5A]', dot: 'bg-[#787774]' },
    blue: { bg: 'bg-[#E7F3F8]', text: 'text-[#0369A1]', dot: 'bg-[#2383E2]' },
    green: { bg: 'bg-[#EDF3EC]', text: 'text-[#15803D]', dot: 'bg-[#2EA043]' },
};

export function StatusBadge({ statusId = 'not_started', onClick, className = '' }) {
    const allOptions = DEFAULT_STATUS_GROUPS.flatMap(g => g.options);
    const opt = allOptions.find(o => o.id === statusId) || allOptions[0];
    const theme = STATUS_THEMES[opt.color] || STATUS_THEMES.gray;

    return (
        <span
            onClick={onClick}
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-medium cursor-pointer transition-opacity hover:opacity-90 select-none ${theme.bg} ${theme.text} ${className}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${theme.dot}`} />
            <span>{opt.label}</span>
        </span>
    );
}

export default function StatusCellPopover({ anchorRect, currentStatusId = 'not_started', onSelect, onClose }) {
    const popoverRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target)) {
                onClose();
            }
        };
        const timer = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 10);
        return () => {
            clearTimeout(timer);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    return (
        <div
            ref={popoverRef}
            style={{
                top: `${(anchorRect?.bottom || 0) + 4}px`,
                left: `${Math.max(16, anchorRect?.left || 0)}px`,
            }}
            className="fixed z-[60] w-[210px] bg-white border border-gray-200/90 shadow-[0_12px_32px_rgba(0,0,0,0.14)] rounded-xl p-2 text-xs font-sans text-slate-700 animate-in fade-in zoom-in-95 duration-100 select-none"
            onMouseDown={(e) => e.stopPropagation()}
        >

            <div className="px-2 py-1.5 bg-gray-50/70 rounded-lg mb-2">
                <StatusBadge statusId={currentStatusId} />
            </div>

            <div className="space-y-2.5">
                {DEFAULT_STATUS_GROUPS.map((group, groupIdx) => (
                    <div key={group.key} className="space-y-1">
                        {groupIdx > 0 && <div className="h-px bg-gray-100 my-1" />}
                        <div className="px-2 text-[11px] font-medium text-gray-400">
                            {group.label}
                        </div>
                        <div className="space-y-0.5">
                            {group.options.map((opt) => {
                                const isCurrent = currentStatusId === opt.id;
                                return (
                                    <div
                                        key={opt.id}
                                        onMouseDown={(e) => {
                                            e.stopPropagation();
                                            onSelect(opt.id);
                                            onClose();
                                        }}
                                        className={`flex items-center px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                                            isCurrent ? 'bg-gray-100/80' : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        <StatusBadge statusId={opt.id} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}