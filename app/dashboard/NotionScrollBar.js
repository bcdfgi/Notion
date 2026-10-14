'use client';
import React, { useRef, useState, useEffect, useCallback } from 'react';

export default function NotionScrollBar({ targetRef }) {
    const trackRef = useRef(null);
    const [thumbStyle, setThumbStyle] = useState({ width: 0, left: 0, visible: false });
    const isDraggingRef = useRef(false);
    const dragStartRef = useRef({ startX: 0, startLeft: 0 });

    const updateScrollMetrics = useCallback(() => {
        const el = targetRef?.current;
        const track = trackRef.current;
        if (!el || !track) return;

        const { clientWidth, scrollWidth, scrollLeft } = el;

        // If the table doesn't overflow horizontally, hide the scrollbar
        if (scrollWidth <= clientWidth) {
            setThumbStyle((prev) => (prev.visible ? { ...prev, visible: false } : prev));
            return;
        }

        const trackWidth = track.clientWidth;
        // Calculate thumb size proportional to visible content
        const computedThumbWidth = Math.max(48, (clientWidth / scrollWidth) * trackWidth);
        const maxScroll = scrollWidth - clientWidth;
        const maxLeft = trackWidth - computedThumbWidth;
        const computedLeft = maxScroll > 0 ? (scrollLeft / maxScroll) * maxLeft : 0;

        setThumbStyle({
            width: computedThumbWidth,
            left: Math.min(Math.max(0, computedLeft), maxLeft),
            visible: true,
        });
    }, [targetRef]);

    useEffect(() => {
        const el = targetRef?.current;
        if (!el) return;

        updateScrollMetrics();
        el.addEventListener('scroll', updateScrollMetrics, { passive: true });
        window.addEventListener('resize', updateScrollMetrics);

        const resizeObserver = new ResizeObserver(() => updateScrollMetrics());
        resizeObserver.observe(el);

        return () => {
            el.removeEventListener('scroll', updateScrollMetrics);
            window.removeEventListener('resize', updateScrollMetrics);
            resizeObserver.disconnect();
        };
    }, [targetRef, updateScrollMetrics]);

    // Handle dragging the thumb
    const handleMouseDown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        isDraggingRef.current = true;
        dragStartRef.current = {
            startX: e.clientX,
            startLeft: thumbStyle.left,
        };

        const handleMouseMove = (moveEvent) => {
            if (!isDraggingRef.current) return;
            const el = targetRef.current;
            const track = trackRef.current;
            if (!el || !track) return;

            const deltaX = moveEvent.clientX - dragStartRef.current.startX;
            const trackWidth = track.clientWidth;
            const maxLeft = trackWidth - thumbStyle.width;
            const targetLeft = Math.min(Math.max(0, dragStartRef.current.startLeft + deltaX), maxLeft);

            const scrollFraction = maxLeft > 0 ? targetLeft / maxLeft : 0;
            el.scrollLeft = scrollFraction * (el.scrollWidth - el.clientWidth);
        };

        const handleMouseUp = () => {
            isDraggingRef.current = false;
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    // Clicking anywhere on the track jumps to that position
    const handleTrackClick = (e) => {
        const el = targetRef.current;
        const track = trackRef.current;
        if (!el || !track || isDraggingRef.current) return;

        const rect = track.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const maxLeft = rect.width - thumbStyle.width;
        const targetLeft = Math.min(Math.max(0, clickX - thumbStyle.width / 2), maxLeft);

        const scrollFraction = maxLeft > 0 ? targetLeft / maxLeft : 0;
        el.scrollLeft = scrollFraction * (el.scrollWidth - el.clientWidth);
    };

    if (!thumbStyle.visible) return null;

    return (
        <div className="w-full py-2.5 flex items-center justify-center select-none">
            <div
                ref={trackRef}
                onClick={handleTrackClick}
                className="w-full max-w-[96%] h-3 relative rounded-full cursor-pointer bg-transparent hover:bg-gray-100/50 transition-colors"
            >
                <div
                    onMouseDown={handleMouseDown}
                    style={{
                        width: `${thumbStyle.width}px`,
                        transform: `translate3d(${thumbStyle.left}px, 0, 0)`,
                    }}
                    className="absolute top-0.5 h-2 rounded-full bg-[#37352F]/40 hover:bg-[#37352F]/65 active:bg-[#37352F]/80 transition-colors cursor-grab active:cursor-grabbing shadow-xs"
                />
            </div>
        </div>
    );
}