'use client';
import React, { useState, useEffect, useRef } from 'react';
import { X, Check } from 'lucide-react';

export function evaluateFormula(expression, rowValues = {}, properties = []) {
    if (!expression || !expression.trim()) return '';

    try {
        let sanitized = expression.trim();

        // 1. Replace property references: prop("ColumnName") or prop('ColumnName')
        properties.forEach((prop) => {
            const regex = new RegExp(`prop\\(["']${prop.name}["']\\)`, 'gi');
            let rawVal = rowValues[prop.id];

            if (rawVal === undefined || rawVal === null || rawVal === '') {
                rawVal = 0;
            } else if (!isNaN(Number(rawVal))) {
                rawVal = Number(rawVal);
            } else {
                rawVal = JSON.stringify(String(rawVal));
            }
            sanitized = sanitized.replace(regex, rawVal);
        });

        // 2. Safely evaluate arithmetic and common math functions
        const mathScope = {
            abs: Math.abs,
            ceil: Math.ceil,
            floor: Math.floor,
            round: Math.round,
            max: Math.max,
            min: Math.min,
            sqrt: Math.sqrt,
            pow: Math.pow,
        };

        // Function constructor isolated scope
        const result = new Function(
            ...Object.keys(mathScope),
            `"use strict"; return (${sanitized});`
        )(...Object.values(mathScope));

        if (result === undefined || result === null || Number.isNaN(result)) return '';
        return typeof result === 'number' ? Math.round(result * 100) / 100 : String(result);
    } catch {
        return '#ERROR!';
    }
}

export default function FormulaEditorModal({
                                               property,
                                               rows = [],
                                               properties = [],
                                               onSaveFormula,
                                               onClose,
                                           }) {
    const [formulaText, setFormulaText] = useState(property?.formula || '');
    const textareaRef = useRef(null);

    // Live preview based on the first row's data
    const previewRow = rows[0] || {};
    const livePreviewResult = evaluateFormula(formulaText, previewRow.values || {}, properties);

    useEffect(() => {
        textareaRef.current?.focus();
    }, []);

    const handleSave = () => {
        onSaveFormula(property.id, formulaText.trim());
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/25 backdrop-blur-[0.5px]"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-lg bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.18)] border border-gray-200/90 overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 select-none">
                    <span className="font-semibold text-sm text-slate-800">Edit formula</span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-slate-700 transition-colors"
                    >
                        <X size={15} />
                    </button>
                </div>

                {/* Formula Text Area */}
                <div className="p-4">
                    <div className="border border-blue-500 rounded-xl p-3 focus-within:ring-2 focus-within:ring-blue-100 transition-all bg-white">
                        <textarea
                            ref={textareaRef}
                            value={formulaText}
                            onChange={(e) => setFormulaText(e.target.value)}
                            placeholder='e.g. prop("Number") * 2 + 10'
                            rows={4}
                            className="w-full bg-transparent resize-none text-[13px] font-mono text-slate-800 focus:outline-none placeholder:text-gray-300"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                    handleSave();
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Footer / Preview Strip */}
                <div className="px-4 py-3 bg-[#FBFBFA] border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-400 font-medium">Output:</span>
                        <span className="font-mono font-semibold text-slate-700 bg-white border border-gray-200 px-2 py-0.5 rounded">
                            {livePreviewResult !== '' ? String(livePreviewResult) : 'No output'}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200/60 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="px-3.5 py-1.5 text-xs font-semibold bg-[#2383E2] hover:bg-blue-600 text-white rounded-lg shadow-2xs transition-colors flex items-center gap-1"
                        >
                            <Check size={13} strokeWidth={2.5} />
                            <span>Done</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}