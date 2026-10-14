'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_NAMES_FULL = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export function formatDateToFull(dateObj) {
    if (!dateObj || isNaN(dateObj.getTime())) return '';
    return `${dateObj.getDate()} ${MONTH_NAMES_FULL[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
}

export function formatDateToNumeric(dateObj) {
    if (!dateObj || isNaN(dateObj.getTime())) return '';
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
}

export function parseDateString(str) {
    if (!str) return null;
    // Check DD/MM/YYYY
    const dmyMatch = String(str).match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (dmyMatch) {
        const d = parseInt(dmyMatch[1], 10);
        const m = parseInt(dmyMatch[2], 10) - 1;
        const y = parseInt(dmyMatch[3], 10);
        const dt = new Date(y, m, d);
        if (!isNaN(dt.getTime())) return dt;
    }
    // Check standard JS parsable strings (e.g., "15 October 2026")
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) return parsed;
    return null;
}

export default function DateCellPopover({ anchorRect, currentDate, onSelect, onClose }) {
    const popoverRef = useRef(null);

    // Initial selected date
    const initialDate = useMemo(() => parseDateString(currentDate) || new Date(), [currentDate]);
    const [selectedDate, setSelectedDate] = useState(initialDate);
    const [viewDate, setViewDate] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
    const [inputText, setInputText] = useState(formatDateToNumeric(initialDate));

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

    // Calendar grid calculations (Monday - Sunday)
    const calendarDays = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        let startDay = firstDay.getDay(); // 0 is Sunday, 1 is Monday
        startDay = startDay === 0 ? 6 : startDay - 1; // Convert so Monday = 0

        const prevMonthLastDate = new Date(year, month, 0).getDate();
        const daysInMonth = lastDay.getDate();

        const days = [];

        // Previous month days
        for (let i = startDay - 1; i >= 0; i--) {
            const dayNum = prevMonthLastDate - i;
            const prevDate = new Date(year, month - 1, dayNum);
            days.push({
                date: prevDate,
                dayNumber: dayNum,
                isCurrentMonth: false,
            });
        }

        // Current month days
        for (let d = 1; d <= daysInMonth; d++) {
            const currDate = new Date(year, month, d);
            days.push({
                date: currDate,
                dayNumber: d,
                isCurrentMonth: true,
            });
        }

        // Next month days to fill 5 or 6 rows (35 or 42 cells)
        const totalSlots = days.length <= 35 ? 35 : 42;
        const remaining = totalSlots - days.length;
        for (let d = 1; d <= remaining; d++) {
            const nextDate = new Date(year, month + 1, d);
            days.push({
                date: nextDate,
                dayNumber: d,
                isCurrentMonth: false,
            });
        }

        return days;
    }, [viewDate]);

    const handleSelectDate = (dateObj) => {
        setSelectedDate(dateObj);
        setInputText(formatDateToNumeric(dateObj));
        onSelect(formatDateToFull(dateObj));
        onClose();
    };

    const handleTodayClick = () => {
        const today = new Date();
        setSelectedDate(today);
        setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
        setInputText(formatDateToNumeric(today));
        onSelect(formatDateToFull(today));
        onClose();
    };

    const handleInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            const parsed = parseDateString(inputText);
            if (parsed) {
                handleSelectDate(parsed);
            }
        }
    };

    return (
        <div
            ref={popoverRef}
            style={{
                top: `${(anchorRect?.bottom || 0) + 4}px`,
                left: `${Math.max(16, anchorRect?.left || 0)}px`,
            }}
            className="fixed z-[60] w-[270px] bg-white border border-gray-200/90 shadow-[0_14px_36px_rgba(0,0,0,0.14)] rounded-xl p-3 text-xs font-sans text-slate-700 animate-in fade-in zoom-in-95 duration-100 select-none"
            onMouseDown={(e) => e.stopPropagation()}
        >
            {/* Top Text Input (DD/MM/YYYY) */}
            <div className="mb-3">
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    placeholder="DD/MM/YYYY"
                    className="w-full px-2.5 py-1.5 bg-[#F7F7F5] border border-gray-200/80 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500"
                    autoFocus
                />
            </div>

            {/* Month & Year Navigation */}
            <div className="flex items-center justify-between mb-2 px-1">
                <span className="font-semibold text-slate-800 text-[13px]">
                    {MONTH_NAMES_SHORT[viewDate.getMonth()]} {viewDate.getFullYear()}
                </span>

                <div className="flex items-center gap-1.5 text-gray-500">
                    <button
                        type="button"
                        onClick={handleTodayClick}
                        className="text-[12px] font-medium text-gray-500 hover:text-slate-800 px-1 py-0.5 rounded hover:bg-gray-100 transition-colors"
                    >
                        Today
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                        className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-slate-700"
                    >
                        <ChevronLeft size={15} />
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
                        className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-slate-700"
                    >
                        <ChevronRight size={15} />
                    </button>
                </div>
            </div>

            {/* Weekdays Row */}
            <div className="grid grid-cols-7 text-center text-[11px] font-medium text-gray-400 mb-1">
                {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
                    <div key={day} className="py-1">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-y-0.5 text-center text-xs">
                {calendarDays.map((item, idx) => {
                    const isSelected =
                        selectedDate &&
                        item.date.getFullYear() === selectedDate.getFullYear() &&
                        item.date.getMonth() === selectedDate.getMonth() &&
                        item.date.getDate() === selectedDate.getDate();

                    return (
                        <div key={idx} className="flex items-center justify-center py-0.5">
                            <button
                                type="button"
                                onClick={() => handleSelectDate(item.date)}
                                className={`w-7 h-7 flex items-center justify-center rounded-md text-xs transition-colors ${
                                    isSelected
                                        ? 'bg-[#2383E2] text-white font-semibold shadow-xs'
                                        : item.isCurrentMonth
                                            ? 'text-slate-800 hover:bg-gray-100'
                                            : 'text-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                {item.dayNumber}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}