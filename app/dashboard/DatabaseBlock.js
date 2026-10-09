'use client';
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { NodeViewWrapper } from '@tiptap/react';
import {
    Table as TableIcon,
    Kanban,
    LayoutGrid,
    List as ListIcon,
    Calendar as CalendarIcon,
    Plus,
    Search,
    Filter,
    ArrowUpDown,
    Zap,
    MoreHorizontal,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ChevronsRight,
    Lock,
    Link2,
    Star,
    X,
    Trash2,
    Clock,
    Tag,
    Type,
    SlidersHorizontal,
    Maximize2,
    Image as ImageIcon,
    Smile,
    RotateCw,
    Sigma,
    ArrowLeftToLine,
    ArrowRightToLine,
    Copy,
    Check,
    AlignLeft,
    Hash,
    ChevronDownCircle,
    ListFilter,
    Loader2,
    Calendar,
    Users,
    Paperclip,
    CheckSquare,
    Link,
    AtSign,
    Phone,
    ArrowUpRight,
    User,
    History,
    UserCheck,
    MousePointerClick,
    MapPin,
    Binary,
} from 'lucide-react';
import IconPickerModal from './IconPickerModal';
import PageIcon from './PageIcon';
import RowEditor from './RowEditor';

const NOTION_COLORS = {
    gray:   { bg: 'bg-[#F1F1EF]', text: 'text-[#5A5A5A]' },
    brown:  { bg: 'bg-[#F4EEEE]', text: 'text-[#78350F]' },
    orange: { bg: 'bg-[#FBECDD]', text: 'text-[#C2410C]' },
    yellow: { bg: 'bg-[#FBF3DB]', text: 'text-[#A16207]' },
    green:  { bg: 'bg-[#EDF3EC]', text: 'text-[#15803D]' },
    blue:   { bg: 'bg-[#E7F3F8]', text: 'text-[#0369A1]' },
    purple: { bg: 'bg-[#F4EEF8]', text: 'text-[#7E22CE]' },
    pink:   { bg: 'bg-[#F9EEF3]', text: 'text-[#BE185D]' },
    red:    { bg: 'bg-[#FDEBEC]', text: 'text-[#B91C1C]' },
};

const NOTION_PRESET_COVERS = [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop"
];

const ALLOWED_VIEW_DEFINITIONS = [
    { type: 'table', label: 'Table', icon: TableIcon },
    { type: 'board', label: 'Board', icon: Kanban },
    { type: 'gallery', label: 'Gallery', icon: LayoutGrid },
    { type: 'list', label: 'List', icon: ListIcon },
    { type: 'calendar', label: 'Calendar', icon: CalendarIcon },
];

const PROPERTY_TYPES = [
    // Section 1
    { type: 'text', label: 'Text', icon: AlignLeft, section: 1 },
    { type: 'number', label: 'Number', icon: Hash, section: 1 },
    { type: 'select', label: 'Select', icon: ChevronDownCircle, section: 1 },
    { type: 'multi-select', label: 'Multi-select', icon: ListFilter, section: 1 },
    { type: 'status', label: 'Status', icon: Loader2, section: 1 },
    { type: 'date', label: 'Date', icon: Calendar, section: 1 },
    { type: 'person', label: 'Person', icon: Users, section: 1 },
    { type: 'files', label: 'Files & media', icon: Paperclip, section: 1 },
    { type: 'checkbox', label: 'Tickbox', icon: CheckSquare, section: 1 },
    { type: 'url', label: 'URL', icon: Link, section: 1 },
    { type: 'phone', label: 'Phone', icon: Phone, section: 1 },
    { type: 'email', label: 'Email', icon: AtSign, section: 1 },

    // Section 2
    { type: 'relation', label: 'Relation', icon: ArrowUpRight, section: 2 },
    { type: 'rollup', label: 'Rollup', icon: Search, section: 2 },
    { type: 'formula', label: 'Formula', icon: Sigma, section: 2 },
    { type: 'button', label: 'Button', icon: MousePointerClick, section: 2 },
    { type: 'id', label: 'ID', icon: Binary, section: 2 },
    { type: 'place', label: 'Place', icon: MapPin, section: 2 },

    // Section 3
    { type: 'created_time', label: 'Created time', icon: Clock, section: 3 },
    { type: 'last_edited_time', label: 'Last edited time', icon: History, section: 3 },
    { type: 'created_by', label: 'Created by', icon: User, section: 3 },
    { type: 'last_edited_by', label: 'Last edited by', icon: UserCheck, section: 3 },
];

const CALCULATE_GROUPS = [
    {
        key: 'count',
        label: 'Count',
        options: [
            { key: 'count_all', label: 'Count all' },
            { key: 'count_checked', label: 'Checked' },
            { key: 'count_unchecked', label: 'Unchecked' },
        ],
    },
    {
        key: 'percent',
        label: 'Percent',
        options: [
            { key: 'percent_checked', label: 'Percent checked' },
            { key: 'percent_unchecked', label: 'Percent unchecked' },
        ],
    },
];

export default function DatabaseBlock({ node, updateAttributes, deleteNode }) {
    const {
        title = 'new school year !',
        views = [
            { id: 'view-gallery', name: '~~~', type: 'gallery' },
            { id: 'view-table', name: 'Table', type: 'table' },
            { id: 'view-board', name: 'Board', type: 'board' },
            { id: 'view-list', name: 'List', type: 'list' },
            { id: 'view-calendar', name: 'Calendar', type: 'calendar' }
        ],
        activeViewId = 'view-table',
        properties = [
            { id: 'prop-title', name: 'Name', type: 'title' },
            { id: 'prop-created', name: 'Created', type: 'date' },
            { id: 'prop-tags', name: 'Tags', type: 'select', options: [] }
        ],
        rows = []
    } = node.attrs;

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [activeRow, setActiveRow] = useState(null);
    const [activeSelectMenu, setActiveSelectMenu] = useState(null);
    const [showAddProperty, setShowAddProperty] = useState(false);
    const [newPropName, setNewPropName] = useState('');
    const [newPropType, setNewPropType] = useState('text');
    const [showNewGroupInput, setShowNewGroupInput] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');

    const [iconPickerTargetRowId, setIconPickerTargetRowId] = useState(null);
    const [showDrawerCoverPicker, setShowDrawerCoverPicker] = useState(false);
    const drawerFileInputRef = useRef(null);

    const [showViewPicker, setShowViewPicker] = useState(false);
    const [viewPickerMode, setViewPickerMode] = useState('add');
    const [pickerPos, setPickerPos] = useState({ top: 0, left: 0 });
    const plusBtnRef = useRef(null);
    const modalRef = useRef(null);

    const [showTabMenuId, setShowTabMenuId] = useState(null);
    const [calendarDate, setCalendarDate] = useState(new Date());

    const currentActiveView = views.find(v => v.id === activeViewId) || views[0];
    const tagsProperty = properties.find(p => p.id === 'prop-tags' || p.type === 'select') || properties[2];
    // Tracks which property header was clicked: { prop, rect }
    const [activeColumnMenu, setActiveColumnMenu] = useState(null);
    const [showTypeSubmenu, setShowTypeSubmenu] = useState(false);
    const columnMenuRef = useRef(null);
    // Active sort configuration: { propId: string, direction: 'asc' | 'desc' } | null
    const [sortConfig, setSortConfig] = useState(null);
    const [showSortSubmenu, setShowSortSubmenu] = useState(false);
    // Active calculate states
    const [calculations, setCalculations] = useState({});
    const [showCalculateSubmenu, setShowCalculateSubmenu] = useState(false);
    const [activeCalculateCategory, setActiveCalculateCategory] = useState(null);
    const [addPropPos, setAddPropPos] = useState({ top: 0, left: 0 });
    const [propTypeSearch, setPropTypeSearch] = useState('');
    const addPropRef = useRef(null);
    // Drawer cover repositioning state
    const [isDrawerRepositioning, setIsDrawerRepositioning] = useState(false);
    const [isDrawerDraggingCover, setIsDrawerDraggingCover] = useState(false);
    const [drawerCoverPos, setDrawerCoverPos] = useState(50);
    const drawerDragRef = useRef({ startY: 0, startPos: 50 });

// Keep local drawerCoverPos synced when switching active rows
    useEffect(() => {
        if (activeRow) {
            setDrawerCoverPos(activeRow.coverPosition ?? 50);
            setIsDrawerRepositioning(false);
        }
    }, [activeRow?.id]);

    const handleMouseDownDrawerCover = (e) => {
        if (!isDrawerRepositioning) return;
        setIsDrawerDraggingCover(true);
        drawerDragRef.current = { startY: e.clientY, startPos: drawerCoverPos };
    };
    const handleMouseMoveDrawerCover = useCallback((e) => {
        if (!isDrawerDraggingCover) return;
        const deltaY = e.clientY - drawerDragRef.current.startY;
        const newPos = Math.max(0, Math.min(100, drawerDragRef.current.startPos - (deltaY * 0.3)));
        setDrawerCoverPos(newPos);
    }, [isDrawerDraggingCover]);


    const handleMouseUpDrawerCover = useCallback(() => {
        setIsDrawerDraggingCover(false);
    }, []);

    useEffect(() => {
        if (isDrawerDraggingCover) {
            window.addEventListener('mousemove', handleMouseMoveDrawerCover);
            window.addEventListener('mouseup', handleMouseUpDrawerCover);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMoveDrawerCover);
            window.removeEventListener('mouseup', handleMouseUpDrawerCover);
        };
    }, [isDrawerDraggingCover, handleMouseMoveDrawerCover, handleMouseUpDrawerCover]);

    const handleSaveDrawerCoverPosition = () => {
        setIsDrawerRepositioning(false);
        if (!activeRow) return;
        const updated = rows.map(r => r.id === activeRow.id ? { ...r, coverPosition: drawerCoverPos } : r);
        updateAttributes({ rows: updated });
        setActiveRow(prev => ({ ...prev, coverPosition: drawerCoverPos }));
    };

    const handleCancelDrawerCoverPosition = () => {
        setIsDrawerRepositioning(false);
        setDrawerCoverPos(activeRow?.coverPosition ?? 50);
    };

    const isolateEvents = {
        onKeyDown: (e) => e.stopPropagation(),
        onKeyUp: (e) => e.stopPropagation(),
        onKeyPress: (e) => e.stopPropagation(),
        onMouseDown: (e) => e.stopPropagation(),
    };

    const filteredRows = useMemo(() => {
        let result = rows.filter(r =>
            (r.values?.['prop-title'] || '').toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (sortConfig) {
            const { propId, direction } = sortConfig;
            const targetProp = properties.find(p => p.id === propId);
            const propType = targetProp?.type || 'text';

            result = [...result].sort((a, b) => {
                const valA = a.values?.[propId];
                const valB = b.values?.[propId];

                if (propType === 'checkbox') {
                    const boolA = valA === true || valA === 'true' ? 1 : 0;
                    const boolB = valB === true || valB === 'true' ? 1 : 0;
                    return direction === 'asc' ? boolA - boolB : boolB - boolA;
                }

                if (propType === 'number') {
                    const numA = parseFloat(valA) || 0;
                    const numB = parseFloat(valB) || 0;
                    return direction === 'asc' ? numA - numB : numB - numA;
                }

                if (propType === 'date' || propType === 'created_time') {
                    const timeA = new Date(valA || 0).getTime();
                    const timeB = new Date(valB || 0).getTime();
                    return direction === 'asc' ? timeA - timeB : timeB - timeA;
                }

                // String fallback (A -> Z)
                const strA = String(valA || '').toLowerCase();
                const strB = String(valB || '').toLowerCase();
                return direction === 'asc'
                    ? strA.localeCompare(strB)
                    : strB.localeCompare(strA);
            });
        }

        return result;
    }, [rows, searchQuery, sortConfig, properties]);

    const currentRowIndex = filteredRows.findIndex(r => r.id === activeRow?.id);
    const hasPrevRow = currentRowIndex > 0;
    const hasNextRow = currentRowIndex >= 0 && currentRowIndex < filteredRows.length - 1;

    const handlePrevRow = () => {
        if (hasPrevRow) setActiveRow(filteredRows[currentRowIndex - 1]);
    };

    const handleNextRow = () => {
        if (hasNextRow) setActiveRow(filteredRows[currentRowIndex + 1]);
    };

    const handleCopyPageLink = () => {
        if (!activeRow) return;
        navigator.clipboard.writeText(`${window.location.origin}#${activeRow.id}`);
    };

    const handleToggleRowFavorite = () => {
        if (!activeRow) return;
        const nextFav = !activeRow.isFavorite;
        const updated = rows.map(r => r.id === activeRow.id ? { ...r, isFavorite: nextFav } : r);
        updateAttributes({ rows: updated });
        setActiveRow(prev => ({ ...prev, isFavorite: nextFav }));
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                setShowViewPicker(false);
            }
            if (!e.target.closest('[data-tab-menu]')) {
                setShowTabMenuId(null);
            }
            if (addPropRef.current && !addPropRef.current.contains(e.target) && !e.target.closest('[data-add-prop-trigger]')) {
                setShowAddProperty(false);
                setPropTypeSearch('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAddRow = (dateStr = null, tagValue = '') => {
        const newRow = {
            id: `row-${Date.now()}`,
            icon: { type: 'emoji', value: '♡' },
            cover: '',
            coverPosition: 50, // <-- Add this
            date: dateStr || new Date().toISOString().split('T')[0],
            isFavorite: false,
            values: {
                'prop-title': '',
                'prop-created': formatCurrentDateTime(),
                'prop-tags': tagValue,
            },
            content: { type: 'doc', content: [{ type: 'paragraph' }] },
        };
        const nextRows = [...rows, newRow];
        updateAttributes({ rows: nextRows });
        setActiveRow(newRow);

        // Broadcast to sidebar recents
        window.dispatchEvent(new CustomEvent('notion:row-created', {
            detail: {
                row: newRow,
                parentTitle: title || 'Untitled database',
                properties,
            }
        }));
    };

    const formatCurrentDateTime = () => {
        const d = new Date();
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    const handleUpdateCell = (rowId, propId, val) => {
        const updated = rows.map(r => r.id === rowId ? { ...r, values: { ...(r.values || {}), [propId]: val } } : r);
        updateAttributes({ rows: updated });
        if (activeRow?.id === rowId) {
            setActiveRow(prev => ({ ...prev, values: { ...(prev.values || {}), [propId]: val } }));
        }

        //  ADD THIS: When the title column changes, notify the sidebar recents!
        if (propId === 'prop-title') {
            window.dispatchEvent(new CustomEvent('notion:row-updated', {
                detail: {
                    rowId,
                    title: val,
                }
            }));
        }
    };
    useEffect(() => {
        const handleCloseColMenu = (e) => {
            if (columnMenuRef.current && !columnMenuRef.current.contains(e.target)) {
                setActiveColumnMenu(null);
                setShowTypeSubmenu(false);
            }
        };
        if (activeColumnMenu) {
            document.addEventListener('mousedown', handleCloseColMenu);
        }
        return () => document.removeEventListener('mousedown', handleCloseColMenu);
    }, [activeColumnMenu]);

    // 1. Rename Property
    const handleRenameProperty = (propId, newName) => {
        const updated = properties.map(p => p.id === propId ? { ...p, name: newName } : p);
        updateAttributes({ properties: updated });
    };

// 2. Change Type
    const handleChangePropertyType = (propId, newType) => {
        const updated = properties.map(p => {
            if (p.id !== propId) return p;
            return {
                ...p,
                type: newType,
                options: newType === 'select' ? (p.options || [
                    { id: 'opt-1', label: 'Option 1', color: 'blue' }
                ]) : undefined,
            };
        });
        updateAttributes({ properties: updated });
        setShowTypeSubmenu(false);
        setActiveColumnMenu(null);
    };

// 3. Insert Left / Insert Right
    const handleInsertPropertyAdjacent = (targetPropId, direction = 'right') => {
        const index = properties.findIndex(p => p.id === targetPropId);
        if (index === -1) return;

        const newProp = {
            id: `prop-${Date.now()}`,
            name: 'New Column',
            type: 'text',
        };

        const nextProperties = [...properties];
        const insertIdx = direction === 'left' ? index : index + 1;
        nextProperties.splice(insertIdx, 0, newProp);

        updateAttributes({ properties: nextProperties });
        setActiveColumnMenu(null);
    };

// 4. Duplicate Property
    const handleDuplicateProperty = (prop) => {
        const index = properties.findIndex(p => p.id === prop.id);
        if (index === -1) return;

        const dupPropId = `prop-${Date.now()}`;
        const duplicatedProp = {
            ...prop,
            id: dupPropId,
            name: `${prop.name} (Copy)`,
        };

        const nextProperties = [...properties];
        nextProperties.splice(index + 1, 0, duplicatedProp);

        // Duplicate existing row values for this column
        const nextRows = rows.map(r => ({
            ...r,
            values: {
                ...(r.values || {}),
                [dupPropId]: r.values?.[prop.id] || '',
            },
        }));

        updateAttributes({ properties: nextProperties, rows: nextRows });
        setActiveColumnMenu(null);
    };

// 5. Delete Property
    const handleDeleteProperty = (propId) => {
        if (properties.length <= 1) return;
        const nextProperties = properties.filter(p => p.id !== propId);
        updateAttributes({ properties: nextProperties });
        setActiveColumnMenu(null);
    };

    const handleUpdateCover = (rowId, coverUrl) => {
        const updated = rows.map(r => r.id === rowId ? { ...r, cover: coverUrl } : r);
        updateAttributes({ rows: updated });
        if (activeRow?.id === rowId) {
            setActiveRow(prev => ({ ...prev, cover: coverUrl }));
        }
    };

    const handleUpdateIcon = (rowId, selectedIcon) => {
        const updated = rows.map(r => r.id === rowId ? { ...r, icon: selectedIcon } : r);
        updateAttributes({ rows: updated });
        if (activeRow?.id === rowId) {
            setActiveRow(prev => ({ ...prev, icon: selectedIcon }));
        }
        setIconPickerTargetRowId(null);

        //  ADD THIS: When the icon changes, notify the sidebar recents!
        window.dispatchEvent(new CustomEvent('notion:row-updated', {
            detail: {
                rowId,
                icon: selectedIcon,
            }
        }));
    };
    const handleDeleteRow = (e, rowId) => {
        e?.stopPropagation?.();
        const updated = rows.filter(r => r.id !== rowId);
        updateAttributes({ rows: updated });
        if (activeRow?.id === rowId) setActiveRow(null);

        //  ADD THIS: Notify sidebar to remove deleted row
        window.dispatchEvent(new CustomEvent('notion:row-deleted', {
            detail: { rowId }
        }));
    };

    const handleSelectNewPropertyType = (type) => {
        const finalName = newPropName.trim() || PROPERTY_TYPES.find(p => p.type === type)?.label || 'Column';
        const newProp = {
            id: `prop-${Date.now()}`,
            name: finalName,
            type,
            options: type === 'select' || type === 'multi-select' ? [
                { id: 'opt-1', label: 'Option 1', color: 'blue' },
                { id: 'opt-2', label: 'Option 2', color: 'green' }
            ] : undefined
        };
        updateAttributes({ properties: [...properties, newProp] });
        setNewPropName('');
        setPropTypeSearch('');
        setShowAddProperty(false);
    };



    const handleSelectViewType = (viewDef) => {
        if (viewPickerMode === 'convert') {
            const updatedViews = views.map(v =>
                v.id === currentActiveView.id
                    ? { ...v, type: viewDef.type, name: v.name === '~~~' ? '~~~' : viewDef.label }
                    : v
            );
            updateAttributes({ views: updatedViews });
        } else {
            const count = views.filter(v => v.type === viewDef.type).length;
            const newName = count === 0 ? viewDef.label : `${viewDef.label} ${count + 1}`;
            const newView = {
                id: `view-${Date.now()}`,
                name: newName,
                type: viewDef.type
            };
            updateAttributes({
                views: [...views, newView],
                activeViewId: newView.id
            });
        }
        setShowViewPicker(false);
    };

    const handleDeleteView = (viewId) => {
        if (views.length <= 1) return;
        const remaining = views.filter(v => v.id !== viewId);
        updateAttributes({
            views: remaining,
            activeViewId: activeViewId === viewId ? remaining[0].id : activeViewId
        });
        setShowTabMenuId(null);
    };

    const handleOpenConvertMenu = (e) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        setPickerPos({ top: rect.bottom + 8, left: Math.max(16, rect.left - 40) });
        setViewPickerMode('convert');
        setShowViewPicker(true);
        setShowTabMenuId(null);
    };

    const handleOpenAddViewMenu = (e) => {
        e.stopPropagation();
        const rect = plusBtnRef.current?.getBoundingClientRect();
        if (rect) {
            setPickerPos({ top: rect.bottom + 8, left: Math.max(16, rect.left - 20) });
        }
        setViewPickerMode('add');
        setShowViewPicker(true);
    };

    const handleAddProperty = () => {
        if (!newPropName.trim()) return;
        const newProp = {
            id: `prop-${Date.now()}`,
            name: newPropName.trim(),
            type: newPropType,
            options: newPropType === 'select' ? [
                { id: 'opt-1', label: 'Tag 1', color: 'blue' },
                { id: 'opt-2', label: 'Tag 2', color: 'green' }
            ] : undefined
        };
        updateAttributes({ properties: [...properties, newProp] });
        setNewPropName('');
        setShowAddProperty(false);
    };

    const handleCreateNewGroup = () => {
        if (!newGroupName.trim() || !tagsProperty) return;
        const newOption = {
            id: `opt-${Date.now()}`,
            label: newGroupName.trim(),
            color: 'blue'
        };
        const updatedProperties = properties.map(p =>
            p.id === tagsProperty.id
                ? { ...p, options: [...(p.options || []), newOption] }
                : p
        );
        updateAttributes({ properties: updatedProperties });
        setNewGroupName('');
        setShowNewGroupInput(false);
    };

    const getPropIcon = (type) => {
        const item = PROPERTY_TYPES.find((t) => t.type === type);
        if (item) {
            const Icon = item.icon;
            return <Icon size={13} className="text-gray-400" strokeWidth={1.8} />;
        }
        return <AlignLeft size={13} className="text-gray-400" strokeWidth={1.8} />;
    };

    const boardGroups = useMemo(() => {
        const groups = [];
        const unassigned = filteredRows.filter(r => !r.values?.[tagsProperty?.id]);
        groups.push({
            id: 'no-tags',
            label: 'No Tags',
            color: 'gray',
            items: unassigned,
            tagValue: ''
        });

        (tagsProperty?.options || []).forEach(opt => {
            const items = filteredRows.filter(r => r.values?.[tagsProperty?.id] === opt.id);
            groups.push({
                id: opt.id,
                label: opt.label,
                color: opt.color || 'blue',
                items: items,
                tagValue: opt.id
            });
        });

        return groups;
    }, [filteredRows, tagsProperty]);

    const handleUpdateRowContent = (rowId, contentJson) => {
        const updated = rows.map((r) =>
            r.id === rowId ? { ...r, content: contentJson } : r
        );
        updateAttributes({ rows: updated });
        if (activeRow?.id === rowId) {
            setActiveRow((prev) => ({ ...prev, content: contentJson }));
        }
    };
    useEffect(() => {
        // 1. Sync row content updates
        const handleRemoteRowUpdate = (e) => {
            const { rowId, content } = e.detail;
            const updated = rows.map(r => r.id === rowId ? { ...r, content } : r);
            updateAttributes({ rows: updated });
        };

        // 2. Sync title, icon, cover, or properties updated in full-page mode
        const handleRemoteRowFieldUpdate = (e) => {
            const { rowId, field, value } = e.detail;
            const updated = rows.map(r => {
                if (r.id !== rowId) return r;
                if (field === 'title') {
                    return { ...r, values: { ...(r.values || {}), 'prop-title': value } };
                }
                if (field === 'icon') {
                    return { ...r, icon: value };
                }
                if (field === 'cover') {
                    return { ...r, cover: value };
                }
                if (field === 'coverPosition') {
                    return { ...r, coverPosition: value };
                }
                if (field === 'property') {
                    const { propId, propValue } = value;
                    return { ...r, values: { ...(r.values || {}), [propId]: propValue } };
                }
                return r;
            });
            updateAttributes({ rows: updated });
        };

        window.addEventListener('notion:update-row-content', handleRemoteRowUpdate);
        window.addEventListener('notion:update-row-field', handleRemoteRowFieldUpdate);
        return () => {
            window.removeEventListener('notion:update-row-content', handleRemoteRowUpdate);
            window.removeEventListener('notion:update-row-field', handleRemoteRowFieldUpdate);
        };
    }, [rows, updateAttributes]);

    const getSortOptions = (type) => {
        switch (type) {
            case 'checkbox':
                return [
                    { label: 'Sort unchecked → checked', direction: 'asc' },
                    { label: 'Sort checked → unchecked', direction: 'desc' },
                ];
            case 'number':
                return [
                    { label: 'Sort 1 → 9', direction: 'asc' },
                    { label: 'Sort 9 → 1', direction: 'desc' },
                ];
            case 'date':
            case 'created_time':
            case 'last_edited_time':
                return [
                    { label: 'Sort oldest first', direction: 'asc' },
                    { label: 'Sort newest first', direction: 'desc' },
                ];
            default:
                return [
                    { label: 'Sort ascending', direction: 'asc' },
                    { label: 'Sort descending', direction: 'desc' },
                ];
        }
    };

    const calendarGrid = useMemo(() => {
        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        let startDayIndex = firstDayOfMonth.getDay();
        startDayIndex = startDayIndex === 0 ? 7 : startDayIndex;

        const prevMonthLastDay = new Date(year, month, 0).getDate();
        const totalDaysInMonth = lastDayOfMonth.getDate();

        const days = [];
        const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        for (let i = startDayIndex - 1; i > 0; i--) {
            const dayNum = prevMonthLastDay - i + 1;
            const dateStr = `${month === 0 ? year - 1 : year}-${String(month === 0 ? 12 : month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            days.push({
                day: dayNum,
                isOtherMonth: true,
                dateStr,
                label: `${dayNum}`,
                items: filteredRows.filter(r => r.date === dateStr)
            });
        }

        const today = new Date();
        for (let d = 1; d <= totalDaysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const isToday =
                today.getFullYear() === year &&
                today.getMonth() === month &&
                today.getDate() === d;

            const label = d === 1 ? `1 ${shortMonths[month]}` : `${d}`;
            days.push({
                day: d,
                isOtherMonth: false,
                isToday,
                dateStr,
                label,
                items: filteredRows.filter(r => r.date === dateStr)
            });
        }

        const targetTotal = days.length <= 35 ? 35 : 42;
        const remaining = targetTotal - days.length;
        const nextMonthIndex = (month + 1) % 12;
        const nextMonthYear = month === 11 ? year + 1 : year;

        for (let d = 1; d <= remaining; d++) {
            const dateStr = `${nextMonthYear}-${String(nextMonthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const label = d === 1 ? `1 ${shortMonths[nextMonthIndex]}` : `${d}`;
            days.push({
                day: d,
                isOtherMonth: true,
                dateStr,
                label,
                items: filteredRows.filter(r => r.date === dateStr)
            });
        }

        return days;
    }, [calendarDate, filteredRows]);

    const renderRowIcon = (row, size = 16) => {
        if (!row.icon) {
            return <span className="text-gray-400 text-sm">♡</span>;
        }
        if (typeof row.icon === 'string') {
            return <span className="text-sm">{row.icon}</span>;
        }
        return <PageIcon icon={row.icon} size={size} />;
    };

    return (
        <NodeViewWrapper className="my-6 not-prose font-sans group/db w-full">
            {/* Title */}
            <div className="flex items-center justify-between group/title mb-4">
                <input
                    type="text"
                    value={title}
                    placeholder="Untitled database"
                    {...isolateEvents}
                    onChange={(e) => updateAttributes({ title: e.target.value })}
                    className="text-3xl font-bold text-slate-800 bg-transparent focus:outline-none placeholder:text-gray-300 tracking-tight w-full"
                />
                <button
                    type="button"
                    onClick={deleteNode}
                    className="opacity-0 group-hover/db:opacity-100 p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition-all ml-2"
                    title="Delete database"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            {/* View Tabs & Action Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4 select-none">
                <div className="flex items-center gap-1 relative">
                    {views.map((view) => {
                        const def = ALLOWED_VIEW_DEFINITIONS.find(d => d.type === view.type) || ALLOWED_VIEW_DEFINITIONS[0];
                        const Icon = def.icon;
                        const isActive = view.id === currentActiveView?.id;
                        return (
                            <div key={view.id} className="relative group/tab flex items-center" data-tab-menu>
                                <button
                                    type="button"
                                    onClick={() => updateAttributes({ activeViewId: view.id })}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[13px] font-medium transition-colors ${
                                        isActive
                                            ? 'bg-gray-100 text-slate-800 shadow-2xs'
                                            : 'text-gray-500 hover:bg-gray-100/60 hover:text-slate-700'
                                    }`}
                                >
                                    <Icon size={14} className={isActive ? 'text-slate-800' : 'text-gray-400'} />
                                    <span>{view.name}</span>
                                </button>

                                {isActive && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowTabMenuId(showTabMenuId === view.id ? null : view.id);
                                        }}
                                        className="p-1 hover:bg-gray-200/70 text-gray-400 hover:text-slate-700 rounded-md ml-0.5"
                                        title="View options"
                                    >
                                        <ChevronDown size={11} />
                                    </button>
                                )}

                                {showTabMenuId === view.id && (
                                    <div className="absolute top-full left-0 mt-1.5 z-40 bg-white border border-gray-200/90 shadow-xl rounded-xl p-1.5 min-w-[170px] animate-in fade-in zoom-in-95 duration-100">
                                        <button
                                            type="button"
                                            onClick={handleOpenConvertMenu}
                                            className="w-full flex items-center justify-between px-2.5 py-1.5 hover:bg-gray-100 rounded-lg text-xs font-medium text-slate-700 text-left"
                                        >
                                            <span>Layout</span>
                                            <span className="text-[11px] text-gray-400 capitalize">{view.type} →</span>
                                        </button>
                                        <div className="h-px bg-gray-100 my-1" />
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteView(view.id)}
                                            disabled={views.length <= 1}
                                            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-left ${
                                                views.length <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'
                                            }`}
                                        >
                                            <Trash2 size={13} />
                                            <span>Delete view</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    <button
                        ref={plusBtnRef}
                        type="button"
                        onClick={handleOpenAddViewMenu}
                        className="p-1 hover:bg-gray-100 text-gray-400 hover:text-slate-700 rounded-md transition-colors ml-0.5"
                        title="Add a view"
                    >
                        <Plus size={14} />
                    </button>
                </div>

                <div className="flex items-center gap-2 text-gray-400">
                    <button className="p-1 hover:bg-gray-100 hover:text-slate-700 rounded transition-colors" title="Filter">
                        <Filter size={14} />
                    </button>
                    <button className="p-1 hover:bg-gray-100 hover:text-slate-700 rounded transition-colors" title="Sort">
                        <ArrowUpDown size={14} />
                    </button>
                    <button className="p-1 hover:bg-gray-100 hover:text-slate-700 rounded transition-colors" title="Automations">
                        <Zap size={14} />
                    </button>

                    {showSearch ? (
                        <div className="flex items-center bg-gray-50 border border-gray-200 px-2 py-0.5 rounded text-xs text-slate-800">
                            <Search size={12} className="text-gray-400 mr-1" />
                            <input
                                type="text"
                                value={searchQuery}
                                {...isolateEvents}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search..."
                                className="bg-transparent focus:outline-none w-24 text-xs"
                                autoFocus
                            />
                            <button onClick={() => { setSearchQuery(''); setShowSearch(false); }}>
                                <X size={12} className="text-gray-400" />
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setShowSearch(true)}
                            className="p-1 hover:bg-gray-100 hover:text-slate-700 rounded transition-colors"
                        >
                            <Search size={14} />
                        </button>
                    )}

                    <button className="p-1 hover:bg-gray-100 hover:text-slate-700 rounded transition-colors">
                        <Maximize2 size={14} />
                    </button>

                    <button className="p-1 hover:bg-gray-100 hover:text-slate-700 rounded transition-colors">
                        <SlidersHorizontal size={14} />
                    </button>

                    <div className="flex items-center bg-[#2383E2] hover:bg-blue-600 text-white rounded-md shadow-xs text-xs font-semibold overflow-hidden ml-1">
                        <button
                            type="button"
                            onClick={() => handleAddRow()}
                            className="px-2.5 py-1 flex items-center gap-1 active:scale-95"
                        >
                            New
                        </button>
                        <div className="w-[1px] h-3.5 bg-blue-400/60" />
                        <button
                            type="button"
                            onClick={() => handleAddRow()}
                            className="px-1.5 py-1 hover:bg-blue-700 transition-colors"
                        >
                            <ChevronDown size={12} />
                        </button>
                    </div>
                </div>
            </div>

            {/* --- 1. TABLE VIEW --- */}
            {currentActiveView?.type === 'table' && (
                <div className="w-full overflow-x-auto text-[13px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="border-b border-gray-200/70 text-gray-400 text-xs select-none">
                            {properties.map((prop, idx) => (
                                <th
                                    key={prop.id}
                                    onClick={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        setActiveColumnMenu({
                                            prop,
                                            rect: {
                                                top: rect.bottom + 4,
                                                left: Math.max(16, rect.left),
                                            },
                                        });
                                        setShowTypeSubmenu(false);
                                        setShowSortSubmenu(false); // <-- Reset sort flyout
                                    }}
                                    className={`py-2 px-2.5 font-normal text-gray-500 hover:bg-gray-100/70 rounded cursor-pointer transition-colors ${
                                        idx === 0 ? 'w-[38%] min-w-[200px]' : 'w-[28%] min-w-[170px]'
                                    }`}
                                >
                                    <div className="flex items-center gap-1.5">
                                        {getPropIcon(prop.type)}
                                        <span className="text-slate-700 font-medium">{prop.name}</span>
                                    </div>
                                </th>
                            ))}
                            <th className="py-2 px-2 font-normal text-gray-400 w-16">
                                <div className="flex items-center gap-1">
                                    {/* THIS IS THE BUTTON: */}
                                    <button
                                        type="button"
                                        data-add-prop-trigger
                                        onClick={(e) => {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            setAddPropPos({
                                                top: rect.bottom + 4,
                                                left: Math.max(16, rect.right - 300),
                                            });
                                            setShowAddProperty(true);
                                        }}
                                        className="p-0.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
                                    >
                                        <Plus size={13} />
                                    </button>
                                    <MoreHorizontal size={13} className="text-gray-300" />
                                </div>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredRows.map((row) => (
                            <tr
                                key={row.id}
                                className="group/row border-b border-gray-100 hover:bg-gray-50/70 transition-colors"
                            >
                                {properties.map((prop, idx) => {
                                    const cellVal = row.values?.[prop.id];

                                    if (idx === 0) {
                                        return (
                                            <td key={prop.id} className="py-1.5 px-2.5">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setIconPickerTargetRowId(row.id);
                                                        }}
                                                        className="p-0.5 hover:bg-gray-200/50 rounded flex items-center justify-center shrink-0 cursor-pointer"
                                                        title="Change icon"
                                                    >
                                                        {renderRowIcon(row, 15)}
                                                    </button>
                                                    <input
                                                        type="text"
                                                        value={cellVal || ''}
                                                        placeholder="Untitled"
                                                        {...isolateEvents}
                                                        onChange={(e) => handleUpdateCell(row.id, prop.id, e.target.value)}
                                                        className="w-full bg-transparent focus:outline-none font-medium text-slate-800 placeholder:text-gray-300"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveRow(row)}
                                                        className="opacity-0 group-hover/row:opacity-100 uppercase tracking-wider text-[10px] font-semibold text-gray-400 hover:text-slate-800 bg-white border border-gray-200 px-1.5 py-0.5 rounded shadow-2xs transition-all shrink-0 ml-1 select-none"
                                                    >
                                                        Open
                                                    </button>
                                                </div>
                                            </td>
                                        );
                                    }

                                    if (prop.id === 'prop-created' || prop.type === 'date') {
                                        return (
                                            <td key={prop.id} className="py-1.5 px-2.5 text-gray-600 text-xs">
                                                <input
                                                    type="text"
                                                    value={cellVal || ''}
                                                    {...isolateEvents}
                                                    onChange={(e) => handleUpdateCell(row.id, prop.id, e.target.value)}
                                                    placeholder="Empty"
                                                    className="w-full bg-transparent focus:outline-none text-gray-600 placeholder:text-gray-300 text-xs"
                                                />
                                            </td>
                                        );
                                    }

                                    if (prop.type === 'select') {
                                        const currentOpt = (prop.options || []).find(o => o.id === cellVal);
                                        const theme = currentOpt ? NOTION_COLORS[currentOpt.color || 'gray'] : null;

                                        return (
                                            <td key={prop.id} className="py-1.5 px-2.5 relative select-none">
                                                {currentOpt ? (
                                                    <span
                                                        onClick={() => setActiveSelectMenu({ rowId: row.id, propId: prop.id })}
                                                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer ${theme.bg} ${theme.text}`}
                                                    >
                                                        {currentOpt.label}
                                                    </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveSelectMenu({ rowId: row.id, propId: prop.id })}
                                                        className="text-gray-300 hover:text-gray-500 text-xs"
                                                    >
                                                        Empty
                                                    </button>
                                                )}

                                                {activeSelectMenu?.rowId === row.id && activeSelectMenu?.propId === prop.id && (
                                                    <div className="absolute top-full left-2 mt-1 z-30 bg-white border border-gray-200 shadow-xl rounded-lg p-1.5 min-w-[130px] flex flex-col gap-0.5">
                                                        {(prop.options || []).map(opt => {
                                                            const colorTheme = NOTION_COLORS[opt.color || 'gray'];
                                                            return (
                                                                <button
                                                                    key={opt.id}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        handleUpdateCell(row.id, prop.id, opt.id);
                                                                        setActiveSelectMenu(null);
                                                                    }}
                                                                    className="flex items-center gap-1.5 px-2 py-1 hover:bg-gray-100 rounded text-left text-xs"
                                                                >
                                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${colorTheme.bg} ${colorTheme.text}`}>
                                                                        {opt.label}
                                                                    </span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    }

                                    return (
                                        <td key={prop.id} className="py-1.5 px-2.5">
                                            <input
                                                type="text"
                                                value={cellVal || ''}
                                                placeholder="Empty"
                                                {...isolateEvents}
                                                onChange={(e) => handleUpdateCell(row.id, prop.id, e.target.value)}
                                                className="w-full bg-transparent focus:outline-none text-xs text-slate-800 placeholder:text-gray-300"
                                            />
                                        </td>
                                    );
                                })}

                                <td className="py-1.5 px-2 text-right select-none">
                                    <button
                                        type="button"
                                        onClick={(e) => handleDeleteRow(e, row.id)}
                                        className="opacity-0 group-hover/row:opacity-100 text-gray-300 hover:text-red-500 p-0.5 transition-opacity"
                                    >
                                        ✕
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <button
                        type="button"
                        onClick={() => handleAddRow()}
                        className="w-full text-left py-2 px-2.5 text-xs text-gray-400 hover:text-slate-700 hover:bg-gray-50/80 flex items-center gap-2 transition-colors rounded-b-md select-none"
                    >
                        <Plus size={13} className="text-gray-400" />
                        <span>New page</span>
                    </button>
                </div>
            )}

            {/* --- 2. BOARD VIEW --- */}
            {currentActiveView?.type === 'board' && (
                <div className="flex items-start gap-4 overflow-x-auto pb-4">
                    {boardGroups.map((group) => (
                        <div
                            key={group.id}
                            className="w-[260px] shrink-0 bg-[#F7F6F3] rounded-2xl p-2.5 flex flex-col gap-2 border border-gray-100/60"
                        >
                            <div className="flex items-center gap-2 px-1.5 py-1 text-xs font-medium text-slate-700 select-none">
                                <span>{group.label}</span>
                                <span className="text-gray-400 font-normal text-[11px]">{group.items.length}</span>
                            </div>

                            <div className="flex flex-col gap-2">
                                {group.items.map((row) => (
                                    <div
                                        key={row.id}
                                        onClick={() => setActiveRow(row)}
                                        className="bg-white border border-gray-200/80 rounded-xl p-3 shadow-2xs hover:shadow-sm cursor-pointer transition-all flex items-center justify-between group/card"
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIconPickerTargetRowId(row.id);
                                                }}
                                                className="shrink-0 p-0.5 hover:bg-gray-100 rounded"
                                                title="Change icon"
                                            >
                                                {renderRowIcon(row, 15)}
                                            </button>
                                            <input
                                                type="text"
                                                value={row.values?.['prop-title'] || ''}
                                                placeholder="Untitled"
                                                onClick={(e) => e.stopPropagation()}
                                                {...isolateEvents}
                                                onChange={(e) => handleUpdateCell(row.id, 'prop-title', e.target.value)}
                                                className="w-full bg-transparent focus:outline-none text-[13px] font-medium text-slate-800 placeholder:text-gray-300 truncate"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => handleDeleteRow(e, row.id)}
                                            className="opacity-0 group-hover/card:opacity-100 text-gray-300 hover:text-red-500 p-0.5 ml-1 transition-opacity shrink-0"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={() => handleAddRow(null, group.tagValue)}
                                    className="w-full py-2 px-2.5 text-xs text-gray-400 hover:text-slate-700 hover:bg-gray-200/50 rounded-xl flex items-center gap-2 transition-colors text-left font-normal select-none"
                                >
                                    <Plus size={13} className="text-gray-400" />
                                    <span>New page</span>
                                </button>
                            </div>
                        </div>
                    ))}

                    <div className="shrink-0 pt-1">
                        {showNewGroupInput ? (
                            <div className="w-56 bg-white border border-gray-200 rounded-xl p-2.5 shadow-md">
                                <input
                                    type="text"
                                    value={newGroupName}
                                    placeholder="Group name..."
                                    {...isolateEvents}
                                    onKeyDown={(e) => {
                                        e.stopPropagation();
                                        if (e.key === 'Enter') handleCreateNewGroup();
                                    }}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none mb-2"
                                    autoFocus
                                />
                                <div className="flex items-center gap-1.5 justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowNewGroupInput(false)}
                                        className="text-[11px] px-2 py-0.5 text-gray-500 hover:bg-gray-100 rounded"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCreateNewGroup}
                                        className="text-[11px] px-2 py-0.5 bg-blue-500 text-white rounded font-medium"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setShowNewGroupInput(true)}
                                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-slate-700 px-2 py-1.5 rounded-lg hover:bg-gray-100/60 transition-colors font-medium whitespace-nowrap select-none"
                            >
                                <Plus size={14} />
                                <span>New group</span>
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* --- 3. GALLERY VIEW --- */}
            {currentActiveView?.type === 'gallery' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    {filteredRows.map((row) => (
                        <div
                            key={row.id}
                            onClick={() => setActiveRow(row)}
                            className="group/card border border-gray-200/90 rounded-2xl overflow-hidden hover:shadow-md transition-all bg-white cursor-pointer flex flex-col justify-between"
                        >
                            <div className="h-44 w-full overflow-hidden bg-[#F7F6F3] relative flex items-center justify-center">
                                {row.cover ? (
                                    <img
                                        src={row.cover}
                                        alt="Cover"
                                        className="w-full h-full object-cover group-hover/card:scale-102 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-1.5 text-gray-300 select-none">
                                        <ImageIcon size={26} strokeWidth={1.5} />
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const url = window.prompt("Enter image URL for this card's cover:");
                                                if (url) handleUpdateCover(row.id, url);
                                            }}
                                            className="opacity-0 group-hover/card:opacity-100 text-[11px] font-medium text-gray-500 hover:text-slate-800 bg-white/90 px-2 py-0.5 rounded shadow-xs transition-opacity"
                                        >
                                            Add cover
                                        </button>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={(e) => handleDeleteRow(e, row.id)}
                                    className="absolute top-2 right-2 opacity-0 group-hover/card:opacity-100 p-1 bg-white/90 text-gray-400 hover:text-red-500 rounded-md shadow-xs transition-all"
                                >
                                    <X size={12} />
                                </button>
                            </div>

                            <div className="p-3 bg-white flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIconPickerTargetRowId(row.id);
                                    }}
                                    className="shrink-0 p-0.5 hover:bg-gray-100 rounded"
                                    title="Change icon"
                                >
                                    {renderRowIcon(row, 15)}
                                </button>
                                <input
                                    type="text"
                                    value={row.values?.['prop-title'] || ''}
                                    placeholder="Untitled"
                                    onClick={(e) => e.stopPropagation()}
                                    {...isolateEvents}
                                    onChange={(e) => handleUpdateCell(row.id, 'prop-title', e.target.value)}
                                    className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none placeholder:text-gray-300 truncate"
                                />
                            </div>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={() => handleAddRow()}
                        className="h-56 border border-dashed border-gray-200/80 hover:border-gray-400/80 rounded-2xl flex items-center justify-center text-xs text-gray-400 hover:text-slate-700 transition-all hover:bg-gray-50/40 select-none"
                    >
                        <span className="flex items-center gap-1.5">
                            <Plus size={14} /> New page
                        </span>
                    </button>
                </div>
            )}

            {/* --- 4. LIST VIEW --- */}
            {currentActiveView?.type === 'list' && (
                <div className="flex flex-col py-1">
                    {filteredRows.map((row) => (
                        <div
                            key={row.id}
                            className="group/item flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-100/60 cursor-pointer transition-colors"
                            onClick={() => setActiveRow(row)}
                        >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIconPickerTargetRowId(row.id);
                                    }}
                                    className="shrink-0 p-0.5 hover:bg-gray-200/50 rounded flex items-center justify-center"
                                    title="Change icon"
                                >
                                    {renderRowIcon(row, 15)}
                                </button>
                                <input
                                    type="text"
                                    value={row.values?.['prop-title'] || ''}
                                    placeholder="Untitled"
                                    onClick={(e) => e.stopPropagation()}
                                    {...isolateEvents}
                                    onChange={(e) => handleUpdateCell(row.id, 'prop-title', e.target.value)}
                                    className="bg-transparent focus:outline-none text-[14px] font-normal text-slate-800 placeholder:text-gray-300 w-full"
                                />
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity select-none">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveRow(row);
                                    }}
                                    className="px-1.5 py-0.5 text-[11px] font-medium text-gray-500 hover:text-slate-800 bg-white border border-gray-200 rounded shadow-2xs"
                                >
                                    Open
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => handleDeleteRow(e, row.id)}
                                    className="p-1 text-gray-300 hover:text-red-500 rounded"
                                >
                                    <X size={13} />
                                </button>
                            </div>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={() => handleAddRow()}
                        className="flex items-center gap-2 px-2 py-2 text-xs text-gray-400 hover:text-slate-700 hover:bg-gray-100/50 rounded-lg transition-colors mt-0.5 text-left font-normal select-none"
                    >
                        <Plus size={14} className="text-gray-400" />
                        <span>New page</span>
                    </button>
                </div>
            )}

            {/* --- 5. CALENDAR VIEW --- */}
            {currentActiveView?.type === 'calendar' && (
                <div className="w-full flex flex-col select-none">
                    <div className="flex items-center justify-between mb-3 px-1">
                        <h2 className="text-base font-bold text-slate-800">
                            {calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h2>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                className="flex items-center gap-1.5 px-2.5 py-1 border border-gray-200/80 hover:bg-gray-50 rounded-md text-xs font-medium text-slate-700 transition-colors shadow-2xs"
                            >
                                <CalendarIcon size={13} className="text-gray-500" />
                                <span>Manage in Calendar</span>
                            </button>

                            <div className="flex items-center text-gray-500 text-xs font-medium">
                                <button
                                    type="button"
                                    onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}
                                    className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-slate-700"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCalendarDate(new Date())}
                                    className="px-2 py-0.5 hover:bg-gray-100 rounded text-slate-700 text-xs font-medium"
                                >
                                    Today
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}
                                    className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-slate-700"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 text-center text-xs text-gray-400 font-normal py-1 border-b border-gray-100">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                            <div key={day} className="py-0.5">{day}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 border-t border-l border-gray-200/70">
                        {calendarGrid.map((cell, idx) => (
                            <div
                                key={idx}
                                onClick={() => handleAddRow(cell.dateStr)}
                                className={`h-28 p-2 border-r border-b border-gray-200/70 hover:bg-gray-50/50 transition-colors flex flex-col justify-between group/cell relative cursor-pointer ${
                                    cell.isOtherMonth ? 'bg-transparent' : 'bg-white'
                                }`}
                            >
                                <div className="flex items-center justify-between text-xs">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddRow(cell.dateStr);
                                        }}
                                        className="opacity-0 group-hover/cell:opacity-100 p-0.5 text-gray-400 hover:text-slate-800 transition-opacity"
                                    >
                                        <Plus size={12} />
                                    </button>

                                    {cell.isToday ? (
                                        <div className="w-5 h-5 rounded-full bg-[#E5484D] text-white flex items-center justify-center text-[11px] font-semibold leading-none shadow-xs">
                                            {cell.day}
                                        </div>
                                    ) : (
                                        <span className={`text-[12px] font-normal ${cell.isOtherMonth ? 'text-gray-300' : 'text-slate-800'}`}>
                                            {cell.label}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-1 overflow-y-auto max-h-16 mt-1">
                                    {cell.items.map(item => (
                                        <div
                                            key={item.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveRow(item);
                                            }}
                                            className="bg-white border border-gray-200 rounded px-1.5 py-0.5 text-[11px] font-medium text-slate-800 truncate shadow-2xs hover:bg-gray-50 flex items-center gap-1.5"
                                        >
                                            <span className="shrink-0">{renderRowIcon(item, 11)}</span>
                                            <span className="truncate">{item.values?.['prop-title'] || 'Untitled'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- PORTALIZED MODALS OUTSIDE PROSEMIRROR --- */}
            {mounted && createPortal(
                <>
                    {activeColumnMenu && (
                        <div
                            ref={columnMenuRef}
                            style={{
                                top: `${activeColumnMenu.rect.top}px`,
                                left: `${activeColumnMenu.rect.left}px`,
                            }}
                            className="fixed z-50 w-60 bg-white border border-gray-200 shadow-2xl rounded-xl p-1.5 text-xs text-slate-700 select-none animate-in fade-in zoom-in-95 duration-100"
                        >
                            {/* Property Name Input Header */}
                            <div className="flex items-center gap-2 p-1.5 bg-gray-50/80 border border-gray-200/70 rounded-lg mb-1">
                                <div className="text-gray-400 shrink-0">
                                    {getPropIcon(activeColumnMenu.prop.type)}
                                </div>
                                <input
                                    type="text"
                                    defaultValue={activeColumnMenu.prop.name}
                                    onBlur={(e) => handleRenameProperty(activeColumnMenu.prop.id, e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleRenameProperty(activeColumnMenu.prop.id, e.currentTarget.value);
                                            e.currentTarget.blur();
                                        }
                                    }}
                                    className="w-full bg-transparent font-medium text-slate-800 focus:outline-none"
                                />
                            </div>

                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowTypeSubmenu((prev) => !prev)}
                                    className="w-full flex items-center justify-between px-2.5 py-1.5 hover:bg-gray-100 rounded-md transition-colors text-left"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <RotateCw size={14} className="text-gray-500" />
                                        <span>Change type</span>
                                    </div>
                                    <span className="text-[11px] text-gray-400 capitalize flex items-center gap-1">
            {PROPERTY_TYPES.find(t => t.type === activeColumnMenu.prop.type)?.label || activeColumnMenu.prop.type} →
        </span>
                                </button>

                                {showTypeSubmenu && (
                                    <div className="absolute left-full top-0 ml-1.5 w-52 max-h-[380px] overflow-y-auto bg-white border border-gray-200/90 shadow-2xl rounded-xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                                        {PROPERTY_TYPES.map((item) => {
                                            const Icon = item.icon;
                                            const isSelected = activeColumnMenu.prop.type === item.type;
                                            return (
                                                <button
                                                    key={item.type}
                                                    type="button"
                                                    onClick={() => handleChangePropertyType(activeColumnMenu.prop.id, item.type)}
                                                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left group ${
                                                        isSelected ? 'bg-gray-100/80 font-medium text-slate-900' : 'text-slate-700 hover:bg-gray-100/70'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <Icon size={14} className="text-gray-500 shrink-0" strokeWidth={1.8} />
                                                        <span className="truncate">{item.label}</span>
                                                    </div>
                                                    {isSelected && <Check size={13} className="text-slate-700 shrink-0" strokeWidth={2.2} />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => setActiveColumnMenu(null)}
                                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 hover:bg-gray-100 rounded-md transition-colors text-left"
                            >
                                <Filter size={14} className="text-gray-500" />
                                <span>Filter</span>
                            </button>
                            {/* Sort with flyout submenu */}
                            <div
                                className="relative group/sort"
                                onMouseEnter={() => setShowSortSubmenu(true)}
                                onMouseLeave={() => setShowSortSubmenu(false)}
                            >
                                <button
                                    type="button"
                                    onClick={() => setShowSortSubmenu(prev => !prev)}
                                    className="w-full flex items-center justify-between px-2.5 py-1.5 hover:bg-gray-100 rounded-md transition-colors text-left"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <ArrowUpDown size={14} className="text-gray-500" />
                                        <span>Sort</span>
                                    </div>
                                    <span className="text-[11px] text-gray-400">›</span>
                                </button>

                                {showSortSubmenu && (
                                    <div
                                        className="absolute left-full top-0 pl-1 z-50"
                                        onMouseEnter={() => setShowSortSubmenu(true)}
                                    >
                                        {/* Invisible bridge to catch diagonal mouse movements */}
                                        <div className="w-56 bg-white border border-gray-200/90 shadow-2xl rounded-xl p-1 animate-in fade-in zoom-in-95 duration-100">
                                            {getSortOptions(activeColumnMenu.prop.type).map((opt) => {
                                                const isSelected =
                                                    sortConfig?.propId === activeColumnMenu.prop.id &&
                                                    sortConfig?.direction === opt.direction;

                                                return (
                                                    <button
                                                        key={opt.direction}
                                                        type="button"
                                                        onClick={() => {
                                                            setSortConfig({
                                                                propId: activeColumnMenu.prop.id,
                                                                direction: opt.direction,
                                                            });
                                                            setShowSortSubmenu(false);
                                                            setActiveColumnMenu(null);
                                                        }}
                                                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                                                            isSelected
                                                                ? 'bg-gray-100 font-medium text-slate-900'
                                                                : 'text-slate-700 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        <span>{opt.label}</span>
                                                        {isSelected && <Check size={13} className="text-blue-600" />}
                                                    </button>
                                                );
                                            })}

                                            {/* Clear Sort option if this column is sorted */}
                                            {sortConfig?.propId === activeColumnMenu.prop.id && (
                                                <>
                                                    <div className="h-px bg-gray-100 my-1" />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSortConfig(null);
                                                            setShowSortSubmenu(false);
                                                            setActiveColumnMenu(null);
                                                        }}
                                                        className="w-full text-left px-2.5 py-1.5 text-xs text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        Clear sort
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>


                            {/* Calculate with nested flyout submenus */}
                            <div
                                className="relative"
                                onMouseEnter={() => setShowCalculateSubmenu(true)}
                                onMouseLeave={() => {
                                    setShowCalculateSubmenu(false);
                                    setActiveCalculateCategory(null);
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() => setShowCalculateSubmenu((prev) => !prev)}
                                    className="w-full flex items-center justify-between px-2.5 py-1.5 hover:bg-gray-100 rounded-md transition-colors text-left"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <Sigma size={14} className="text-gray-500" />
                                        <span>Calculate</span>
                                    </div>
                                    <span className="text-[11px] text-gray-400">›</span>
                                </button>

                                {showCalculateSubmenu && (
                                    <div
                                        className="absolute left-full top-0 pl-1 z-50"
                                        onMouseEnter={() => setShowCalculateSubmenu(true)}
                                    >
                                        <div className="w-36 bg-white border border-gray-200/90 shadow-2xl rounded-xl p-1 animate-in fade-in zoom-in-95 duration-100">
                                            {/* None */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCalculations((prev) => ({ ...prev, [activeColumnMenu.prop.id]: 'none' }));
                                                    setShowCalculateSubmenu(false);
                                                    setActiveCalculateCategory(null);
                                                    setActiveColumnMenu(null);
                                                }}
                                                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-gray-100 transition-colors text-left"
                                            >
                                                <span className="text-slate-800">None</span>
                                                {(!calculations[activeColumnMenu.prop.id] || calculations[activeColumnMenu.prop.id] === 'none') && (
                                                    <Check size={13} className="text-slate-700" strokeWidth={2.2} />
                                                )}
                                            </button>

                                            {/* Count and Percent Categories */}
                                            {CALCULATE_GROUPS.map((groupDef) => (
                                                <div
                                                    key={groupDef.key}
                                                    className="relative"
                                                    onMouseEnter={() => setActiveCalculateCategory(groupDef.key)}
                                                >
                                                    <button
                                                        type="button"
                                                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                                                            activeCalculateCategory === groupDef.key
                                                                ? 'bg-gray-100 text-slate-900 font-medium'
                                                                : 'text-slate-700 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        <span>{groupDef.label}</span>
                                                        <span className="text-[11px] text-gray-400">›</span>
                                                    </button>

                                                    {/* Submenu flyout (left-aligned like Notion's UI) */}
                                                    {activeCalculateCategory === groupDef.key && (
                                                        <div
                                                            className="absolute right-full top-0 pr-1 z-50"
                                                            onMouseEnter={() => setActiveCalculateCategory(groupDef.key)}
                                                        >
                                                            <div className="w-44 bg-white border border-gray-200/90 shadow-2xl rounded-xl p-1 animate-in fade-in zoom-in-95 duration-100">
                                                                {groupDef.options.map((opt) => {
                                                                    const isSelected = calculations[activeColumnMenu.prop.id] === opt.key;
                                                                    return (
                                                                        <button
                                                                            key={opt.key}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setCalculations((prev) => ({
                                                                                    ...prev,
                                                                                    [activeColumnMenu.prop.id]: opt.key,
                                                                                }));
                                                                                setShowCalculateSubmenu(false);
                                                                                setActiveCalculateCategory(null);
                                                                                setActiveColumnMenu(null);
                                                                            }}
                                                                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                                                                                isSelected
                                                                                    ? 'bg-gray-100 font-medium text-slate-900'
                                                                                    : 'text-slate-700 hover:bg-gray-50'
                                                                            }`}
                                                                        >
                                                                            <span>{opt.label}</span>
                                                                            {isSelected && <Check size={13} className="text-slate-700" strokeWidth={2.2} />}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="h-px bg-gray-100 my-1" />

                            <button
                                type="button"
                                onClick={() => handleInsertPropertyAdjacent(activeColumnMenu.prop.id, 'left')}
                                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 hover:bg-gray-100 rounded-md transition-colors text-left"
                            >
                                <ArrowLeftToLine size={14} className="text-gray-500" />
                                <span>Insert left</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleInsertPropertyAdjacent(activeColumnMenu.prop.id, 'right')}
                                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 hover:bg-gray-100 rounded-md transition-colors text-left"
                            >
                                <ArrowRightToLine size={14} className="text-gray-500" />
                                <span>Insert right</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleDuplicateProperty(activeColumnMenu.prop)}
                                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 hover:bg-gray-100 rounded-md transition-colors text-left"
                            >
                                <Copy size={14} className="text-gray-500" />
                                <span>Duplicate property</span>
                            </button>

                            {/* Delete Property - Disabled on Title */}
                            {activeColumnMenu.prop.id !== 'prop-title' && (
                                <>
                                    <div className="h-px bg-gray-100 my-1" />
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteProperty(activeColumnMenu.prop.id)}
                                        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 hover:bg-red-50 text-red-600 rounded-md transition-colors text-left"
                                    >
                                        <Trash2 size={14} />
                                        <span>Delete property</span>
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                    {/* View Picker Modal */}
                    {showViewPicker && (
                        <div
                            ref={modalRef}
                            style={{ top: `${pickerPos.top}px`, left: `${pickerPos.left}px` }}
                            className="fixed z-50 w-[290px] bg-white border border-gray-200/90 shadow-[0_16px_36px_rgba(0,0,0,0.14)] rounded-2xl p-3 animate-in fade-in zoom-in-95 duration-100"
                        >
                            <div className="text-[11px] font-semibold text-gray-400 mb-2.5 px-1 tracking-wide select-none">
                                {viewPickerMode === 'convert' ? 'Select layout' : 'Add a new view'}
                            </div>

                            <div className="grid grid-cols-4 gap-2">
                                {ALLOWED_VIEW_DEFINITIONS.map((def) => {
                                    const Icon = def.icon;
                                    const isCurrent = currentActiveView.type === def.type;
                                    return (
                                        <button
                                            key={def.type}
                                            type="button"
                                            onClick={() => handleSelectViewType(def)}
                                            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all group ${
                                                isCurrent ? 'bg-gray-100' : 'hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-2xs mb-1.5 transition-colors ${
                                                isCurrent
                                                    ? 'bg-white border-gray-300 text-slate-900 font-bold'
                                                    : 'bg-gray-50 border-gray-200/70 text-gray-500 group-hover:bg-white group-hover:text-slate-900'
                                            }`}>
                                                <Icon size={18} strokeWidth={1.8} />
                                            </div>
                                            <span className="text-[11px] font-normal leading-tight text-center truncate w-full text-slate-700">
                                                {def.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Add Property Popover */}
                    {showAddProperty && (
                        <div
                            ref={addPropRef}
                            style={{ top: `${addPropPos.top}px`, left: `${addPropPos.left}px` }}
                            className="fixed z-50 w-[300px] max-h-[460px] bg-white border border-gray-200/90 shadow-2xl rounded-xl p-2 flex flex-col animate-in fade-in zoom-in-95 duration-100 select-none"
                        >
                            {/* Name input */}
                            <div className="flex items-center gap-2 px-2 py-1.5 border-b border-gray-100 mb-1.5">
            <span className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <Smile size={16} />
            </span>
                                <input
                                    type="text"
                                    value={newPropName}
                                    {...isolateEvents}
                                    onChange={(e) => setNewPropName(e.target.value)}
                                    placeholder="Type property name..."
                                    className="w-full text-xs font-medium text-slate-800 bg-transparent focus:outline-none placeholder:text-gray-400"
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddProperty(false);
                                        setPropTypeSearch('');
                                    }}
                                    className="text-gray-400 hover:text-gray-600 p-0.5"
                                >
                                    <X size={13} />
                                </button>
                            </div>

                            {/* Search Input */}
                            <div className="flex items-center gap-1.5 px-2 py-1 text-gray-400 mb-1">
                                <span className="text-[11px] font-medium text-gray-400">Select type</span>
                                <Search size={12} className="text-gray-400" />
                                <input
                                    type="text"
                                    value={propTypeSearch}
                                    {...isolateEvents}
                                    onChange={(e) => setPropTypeSearch(e.target.value)}
                                    className="w-full text-xs bg-transparent focus:outline-none text-slate-700 ml-1"
                                />
                            </div>

                            {/* --- PUT YOUR CODE HERE --- */}
                            <div className="overflow-y-auto max-h-[340px] pr-0.5 space-y-2">
                                {[1, 2, 3].map((sectionId, idx) => {
                                    const items = PROPERTY_TYPES.filter(
                                        (item) =>
                                            item.section === sectionId &&
                                            item.label.toLowerCase().includes(propTypeSearch.toLowerCase())
                                    );

                                    if (items.length === 0) return null;

                                    return (
                                        <React.Fragment key={sectionId}>
                                            {idx > 0 && <div className="h-px bg-gray-100 my-1" />}
                                            <div className="grid grid-cols-2 gap-x-1 gap-y-0.5">
                                                {items.map((item) => {
                                                    const Icon = item.icon;
                                                    return (
                                                        <button
                                                            key={item.type}
                                                            type="button"
                                                            onClick={() => handleSelectNewPropertyType(item.type)}
                                                            className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100/80 rounded-md text-xs text-slate-700 text-left transition-colors group"
                                                        >
                                                            <Icon
                                                                size={14}
                                                                className="text-gray-500 shrink-0 group-hover:text-slate-900"
                                                                strokeWidth={1.8}
                                                            />
                                                            <span className="truncate">{item.label}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                            {/* --- END OF YOUR CODE --- */}
                        </div>
                    )}

                    {/* Global Icon Picker Modal */}
                    {iconPickerTargetRowId && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[0.5px]"
                            onClick={() => setIconPickerTargetRowId(null)}
                        >
                            <div className="relative" onClick={(e) => e.stopPropagation()}>
                                <IconPickerModal
                                    initialTab="icons"
                                    onSelect={(selected) => handleUpdateIcon(iconPickerTargetRowId, selected)}
                                    onClose={() => setIconPickerTargetRowId(null)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Side Peek Drawer */}
                    {activeRow && (
                        <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-[1px]">
                            <div className="fixed inset-0" onClick={() => setActiveRow(null)} />
                            <div
                                className="relative z-10 w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-right duration-200"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Side Peek Drawer Header (Refined Notion Toolbar) */}
                                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-white/95 backdrop-blur-md sticky top-0 z-30 select-none text-gray-500">
                                    {/* Left actions: Close, Full page expansion, Up/Down navigation */}
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => setActiveRow(null)}
                                            className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 hover:text-slate-800 transition-colors"
                                            title="Close"
                                        >
                                            <ChevronsRight size={17} strokeWidth={2} />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                // Close side drawer and open full screen in main canvas
                                                const rowToOpen = activeRow;
                                                setActiveRow(null);
                                                window.dispatchEvent(
                                                    new CustomEvent('notion:open-page-fullscreen', {
                                                        detail: {
                                                            row: rowToOpen,
                                                            parentTitle: title || 'Untitled database',
                                                            properties,
                                                        }
                                                    })
                                                );
                                            }}
                                            className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 hover:text-slate-800 transition-colors"
                                            title="Open as full page"
                                        >
                                            <Maximize2 size={15} strokeWidth={2} />
                                        </button>

                                        <div className="w-[1px] h-4 bg-gray-200 mx-1" />

                                        <button
                                            type="button"
                                            onClick={handlePrevRow}
                                            disabled={!hasPrevRow}
                                            className={`p-1.5 rounded-md transition-colors ${
                                                hasPrevRow
                                                    ? 'hover:bg-gray-100 text-gray-500 hover:text-slate-800 cursor-pointer'
                                                    : 'text-gray-300 cursor-not-allowed'
                                            }`}
                                            title="Previous page"
                                        >
                                            <ChevronUp size={16} strokeWidth={2.2} />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleNextRow}
                                            disabled={!hasNextRow}
                                            className={`p-1.5 rounded-md transition-colors ${
                                                hasNextRow
                                                    ? 'hover:bg-gray-100 text-gray-500 hover:text-slate-800 cursor-pointer'
                                                    : 'text-gray-300 cursor-not-allowed'
                                            }`}
                                            title="Next page"
                                        >
                                            <ChevronDown size={16} strokeWidth={2.2} />
                                        </button>
                                    </div>

                                    {/* Right actions: Share, Copy link, Favorite, More options */}
                                    <div className="flex items-center gap-1">



                                        <button
                                            type="button"
                                            onClick={handleToggleRowFavorite}
                                            className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 hover:text-slate-800 transition-colors cursor-pointer"
                                            title={activeRow.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                        >
                                            <Star
                                                size={16}
                                                className={activeRow.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-gray-500'}
                                            />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={(e) => handleDeleteRow(e, activeRow.id)}
                                            className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 hover:text-slate-800 transition-colors cursor-pointer"
                                            title="More options"
                                        >
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </div>
                                </div>

                                {activeRow.cover ? (
                                    <div
                                        className={`relative w-full h-48 bg-gray-100 overflow-hidden shrink-0 ${
                                            isDrawerRepositioning
                                                ? (isDrawerDraggingCover ? 'cursor-grabbing' : 'cursor-grab')
                                                : 'group/drawerCover'
                                        }`}
                                        onMouseDown={handleMouseDownDrawerCover}
                                    >
                                        <img
                                            src={activeRow.cover}
                                            alt="Cover"
                                            className="w-full h-full object-cover pointer-events-none select-none"
                                            style={{ objectPosition: `center ${drawerCoverPos}%` }}
                                        />

                                        {isDrawerRepositioning ? (
                                            <div className="absolute top-3 w-full flex justify-between px-4 items-center z-10 pointer-events-none select-none">
                                                <div className="px-2.5 py-1 bg-black/60 text-white text-[11px] rounded shadow-xs">
                                                    Drag image to reposition
                                                </div>
                                                <div className="flex items-center gap-1.5 pointer-events-auto">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); handleCancelDrawerCoverPosition(); }}
                                                        className="px-2.5 py-1 text-xs font-medium bg-white/90 hover:bg-white text-slate-700 rounded shadow-xs"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); handleSaveDrawerCoverPosition(); }}
                                                        className="px-2.5 py-1 text-xs font-medium bg-blue-500 hover:bg-blue-600 text-white rounded shadow-xs"
                                                    >
                                                        Save position
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="absolute bottom-2 right-4 flex items-center gap-2 opacity-0 group-hover/drawerCover:opacity-100 transition-opacity select-none">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowDrawerCoverPicker(true)}
                                                    className="px-2.5 py-1 text-xs font-medium bg-white/90 hover:bg-white text-slate-700 rounded shadow-xs"
                                                >
                                                    Change cover
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsDrawerRepositioning(true)}
                                                    className="px-2.5 py-1 text-xs font-medium bg-white/90 hover:bg-white text-slate-700 rounded shadow-xs"
                                                >
                                                    Reposition
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleUpdateCover(activeRow.id, '')}
                                                    className="px-2.5 py-1 text-xs font-medium bg-white/90 hover:bg-white text-red-500 rounded shadow-xs"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : null}

                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="flex items-center gap-3 mb-2 select-none">
                                        {!activeRow.icon && (
                                            <button
                                                type="button"
                                                onClick={() => setIconPickerTargetRowId(activeRow.id)}
                                                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-slate-700 py-1 rounded transition-colors"
                                            >
                                                <Smile size={14} /> Add icon
                                            </button>
                                        )}
                                        {!activeRow.cover && (
                                            <button
                                                type="button"
                                                onClick={() => setShowDrawerCoverPicker(true)}
                                                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-slate-700 py-1 rounded transition-colors"
                                            >
                                                <ImageIcon size={14} /> Add cover
                                            </button>
                                        )}
                                    </div>

                                    {showDrawerCoverPicker && (
                                        <div className="mb-4 p-4 border border-gray-200 rounded-xl bg-white shadow-xl z-20">
                                            <div className="flex items-center justify-between mb-3 select-none">
                                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Choose Cover</span>
                                                <button onClick={() => setShowDrawerCoverPicker(false)} className="text-gray-400 hover:text-gray-600">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-4 gap-2 mb-3">
                                                {NOTION_PRESET_COVERS.map((cUrl, i) => (
                                                    <div
                                                        key={i}
                                                        onClick={() => {
                                                            handleUpdateCover(activeRow.id, cUrl);
                                                            setShowDrawerCoverPicker(false);
                                                        }}
                                                        className="h-16 rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                                                    >
                                                        <img src={cUrl} alt="preset" className="w-full h-full object-cover" />
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Paste image URL and press enter..."
                                                    className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none"
                                                    {...isolateEvents}
                                                    onKeyDown={(e) => {
                                                        e.stopPropagation();
                                                        if (e.key === 'Enter' && e.currentTarget.value) {
                                                            handleUpdateCover(activeRow.id, e.currentTarget.value);
                                                            setShowDrawerCoverPicker(false);
                                                        }
                                                    }}
                                                />
                                                <input
                                                    type="file"
                                                    ref={drawerFileInputRef}
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) return;
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            if (typeof reader.result === 'string') {
                                                                handleUpdateCover(activeRow.id, reader.result);
                                                                setShowDrawerCoverPicker(false);
                                                            }
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => drawerFileInputRef.current?.click()}
                                                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-slate-700 text-xs font-medium rounded-lg shrink-0 select-none"
                                                >
                                                    Upload
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Page Title & Icon inside Inspector */}
                                    <div className="flex items-center gap-3 mb-6">
                                        {activeRow.icon && (
                                            <button
                                                type="button"
                                                onClick={() => setIconPickerTargetRowId(activeRow.id)}
                                                className="p-1 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer select-none"
                                                title="Change icon"
                                            >
                                                {renderRowIcon(activeRow, 36)}
                                            </button>
                                        )}
                                        <input
                                            type="text"
                                            value={activeRow.values?.['prop-title'] || ''}
                                            placeholder="Untitled"
                                            {...isolateEvents}
                                            onChange={(e) => handleUpdateCell(activeRow.id, 'prop-title', e.target.value)}
                                            className="text-4xl font-bold text-slate-800 bg-transparent focus:outline-none w-full tracking-tight"
                                            autoFocus
                                        />
                                    </div>

                                    {/* Properties list */}
                                    <div className="space-y-3 pb-8 border-b border-gray-100 text-xs">
                                        {properties.filter(p => p.type !== 'title').map((prop) => (
                                            <div key={prop.id} className="flex items-center">
                                                <div className="w-32 flex items-center gap-1.5 text-gray-400 select-none">
                                                    {getPropIcon(prop.type)}
                                                    <span>{prop.name}</span>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={activeRow.values?.[prop.id] || ''}
                                                    placeholder="Empty"
                                                    {...isolateEvents}
                                                    onChange={(e) => handleUpdateCell(activeRow.id, prop.id, e.target.value)}
                                                    className="border border-gray-200 px-2 py-1 rounded focus:outline-none w-full text-slate-800 placeholder:text-gray-300"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex-1 flex flex-col pt-3 pb-20">
                                        <RowEditor
                                            key={activeRow.id}
                                            initialContent={activeRow.content}
                                            onChange={(newContent) => handleUpdateRowContent(activeRow.id, newContent)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>,
                document.body
            )}
        </NodeViewWrapper>
    );
}