'use client';
import React from 'react';
import * as LucideIcons from 'lucide-react';

export default function PageIcon({ icon, size = 32, className = '' }) {
    if (!icon) return null;

    if (icon.type === 'emoji') {
        return (
            <span style={{ fontSize: `${size}px`, lineHeight: 1 }} className={className}>
                {icon.value}
            </span>
        );
    }

    if (icon.type === 'icon') {
        const IconComponent = LucideIcons[icon.name] || LucideIcons.FileText;
        return (
            <IconComponent
                size={size}
                color={icon.color || '#64748b'}
                className={className}
                strokeWidth={2}
            />
        );
    }

    if (icon.type === 'image') {
        return (
            <img
                src={icon.value}
                alt="Page Icon"
                className={`rounded object-cover ${className}`}
                style={{ width: `${size}px`, height: `${size}px` }}
            />
        );
    }

    return null;
}