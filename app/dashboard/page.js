'use client';
import React, { useEffect, useCallback, useState, useRef, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import debounce from 'lodash.debounce';
import { updatePageContent, logout, createPage, getPages,deletePage } from '../actions';
import { Link } from '@tiptap/extension-link';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Code } from '@tiptap/extension-code';
import { Underline } from '@tiptap/extension-underline';
import {Table} from '@tiptap/extension-table';
import {TableRow} from '@tiptap/extension-table-row';
import {TableCell} from '@tiptap/extension-table-cell';
import {TableHeader} from '@tiptap/extension-table-header';
import PageIcon from './PageIcon';
import IconPickerModal from './IconPickerModal';
import { Image } from '@tiptap/extension-image';
import { SlashCommands, slashItems, plusMenuItems } from './SlashCommands';
import { SlashCommandList } from './SlashCommandList';
import BlockActionMenu from './BlockActionMenu';
import PageMoreMenu from './PageMoreMenu';
import { Smile, MoreHorizontal, Star, Plus } from 'lucide-react';
import SettingsModal from './SettingsMenu';
import {EmbedExtension} from './EmbedExtension';
import { TableControlsOverlay } from './TableControl';
import { PageLinkModal } from './LinkPage';
import { PageMention } from './PageMention';




const useIsMounted = () => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true); }, []);
    return mounted;
};

const ToolbarButton = ({ onClick, isActive, children, className = "" }) => (
    <button
        type="button"
        onClick={onClick}
        className={`h-7 min-w-7 px-1.5 rounded flex items-center justify-center transition-all duration-200 ease-in-out ${
            isActive
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
        } ${className}`}
    >
        {children}
    </button>
);

const VerticalDivider = () => <div className="w-px h-4 bg-gray-200 mx-1.5" />;

const NOTION_COVERS = [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop"
]
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const Dashboard = ({ userEmail = "nehakondabathini1234@gmail.com" }) => {
    const isMounted = useIsMounted();
    const [savingStatus, setSavingStatus] = useState("Saved");
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [handlePos, setHandlePos] = useState({ top: -100, opacity: 0 });

    const containerRef = useRef(null);
    const [pages, setPages] = useState([]);
    const [currentPageId, setCurrentPageId] = useState(null);
    const titleRef = useRef(null);
    const [coverImage,setCoverImage] = useState(null);
    const [showCoverPicker, setShowCoverPicker] = useState(false);
    const fileInputRef = useRef(null);
    const [uploadError, setUploadError] = useState("");
    const [isRepositioning, setIsRepositioning] = useState(false);
    const [coverPosition, setCoverPosition] = useState(50);
    const [isDraggingCover, setIsDraggingCover] = useState(false);
    const dragRef = useRef({ startY: 0, startPos: 50 });
    const [pageIcon, setPageIcon] = useState(null);
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [showPlusMenu, setShowPlusMenu] = useState(false);
    const plusMenuRef = useRef(null);
    const [showBlockMenu, setShowBlockMenu] = useState(false);
    const blockMenuRef = useRef(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const moreMenuRef = useRef(null);
    const [fontStyle, setFontStyle] = useState('default');
    const [isSmallText, setIsSmallText] = useState(false);
    const [isFullWidth, setIsFullWidth] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [showPageLinkModal, setShowPageLinkModal] = useState(false);


    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                code: false,
                link: false,
                underline: false,
                heading: {
                    levels: [1, 2, 3, 4],
                },
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            TaskList,
            TaskItem.configure({ nested: true }),
            Underline,
            TextStyle,
            Color,
            Code,
            PageMention,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { class: 'text-blue-500 underline cursor-pointer' }
            }),

            Placeholder.configure({ placeholder: "Type '/' for commands..." }),
            EmbedExtension,
            SlashCommands,
            Image.extend({

                addAttributes() {
                    return {
                        src: {
                            default: null,
                            parseHTML: element => element.getAttribute('src'),
                            renderHTML: attributes => {
                                if (!attributes.src) return {};
                                return { src: attributes.src };
                            },
                        },
                        alt: {
                            default: null,
                        },
                        title: {
                            default: null,
                        },
                    };
                },
            }).configure({
                inline: false,
                allowBase64: true,
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full my-4 shadow-sm',
                },
            }),
        ],
        content: '',
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'tiptap prose prose-slate max-w-none focus:outline-none min-h-[500px] caret-blue-500 pb-32 -ml-45 ',
            },
            handlePaste: (view, event) => {
                const items = Array.from(event.clipboardData?.items || []);
                const imageItem = items.find(item => item.type.startsWith('image/'));

                if (!imageItem) return false;

                const file = imageItem.getAsFile();
                if (!file) return false;

                if (file.size > MAX_FILE_SIZE) {
                    alert('Image size exceeds 5MB limit.');
                    return true;
                }


                const reader = new FileReader();
                reader.onload = async (e) => {
                    const src = e.target?.result;
                    if (typeof src === 'string') {
                        const imageType = view.state.schema.nodes.image;
                        if (imageType) {
                            const node = imageType.create({ src });
                            const transaction = view.state.tr.replaceSelectionWith(node);
                            view.dispatch(transaction);

                            if (currentPageId) {
                                const currentTitle = titleRef.current?.innerText || "Untitled";
                                const json = view.state.doc.toJSON();


                                setPages(prev => prev.map(p => p._id === currentPageId ? { ...p, content: json, title: currentTitle } : p));

                                setSavingStatus("Saving...");
                                const res = await updatePageContent(currentPageId, {
                                    title: currentTitle,
                                    content: json,
                                    userEmail,
                                });
                                setSavingStatus(res.success ? "Saved" : "Error");
                            }
                        }
                    }
                };
                reader.readAsDataURL(file);
                return true;
            },
            handleDrop: (view, event, slice, moved) => {
                if (moved || !event.dataTransfer?.files.length) return false;

                const file = event.dataTransfer.files[0];
                if (!file.type.startsWith('image/')) return false;

                if (file.size > MAX_FILE_SIZE) {
                    alert('Image size exceeds 5MB limit.');
                    return true;
                }


                const reader = new FileReader();
                reader.onload = async (e) => {
                    const src = e.target?.result;
                    if (typeof src === 'string') {
                        const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
                        const imageType = view.state.schema.nodes.image;

                        if (coordinates && imageType) {
                            const node = imageType.create({ src });
                            const transaction = view.state.tr.insert(coordinates.pos, node);
                            view.dispatch(transaction);

                            if (currentPageId) {
                                const currentTitle = titleRef.current?.innerText || "Untitled";
                                const json = view.state.doc.toJSON();


                                setPages(prev => prev.map(p => p._id === currentPageId ? { ...p, content: json, title: currentTitle } : p));

                                setSavingStatus("Saving...");
                                const res = await updatePageContent(currentPageId, {
                                    title: currentTitle,
                                    content: json,
                                    userEmail,
                                });
                                setSavingStatus(res.success ? "Saved" : "Error");
                            }
                        }
                    }
                };
                reader.readAsDataURL(file);
                return true;
            },
        },


        onUpdate: ({ editor }) => {
            if (isSwitchingPageRef.current) return;
            const currentTitle = titleRef.current?.innerText || "Untitled";
            saveContent(editor.getJSON(), currentTitle);
        },
        onSelectionUpdate: ({ editor }) => {
            const { selection } = editor.state;
            if (!editor.view) return;
            let node = editor.view.domAtPos(selection.from).node;
            const editorRoot = editor.view.dom;
            while (node && node.parentNode !== editorRoot) {
                node = node.parentNode;
            }
            if (node instanceof HTMLElement) {
                updateHandlePosition(node);
            }
        },
    });

    const debouncedSave = useMemo(
        () => debounce(async (json, currentTitle, pageId) => {
            if (!pageId) return;
            setSavingStatus("Saving...");
            try {
                const result = await updatePageContent(pageId, {
                    title: currentTitle,
                    content: json,
                    userEmail,
                });
                if (result.success) {
                    setSavingStatus("Saved");

                    setPages(prevPages => {
                        return prevPages.map(p =>
                            p._id === pageId ? { ...p, title: currentTitle, content: json } : p
                        );
                    });
                } else {
                    setSavingStatus("Error");
                }
            } catch (error) {
                setSavingStatus("Error");
            }
        }, 1000),
        [userEmail]
    );



    // Add a ref to track the latest pages synchronously
    const pagesRef = useRef(pages);
    useEffect(() => {
        pagesRef.current = pages;
    }, [pages]);

    const isSwitchingPageRef = useRef(false);

    const loadPage = useCallback(async (pageId, forceData = null) => {
        if (!pageId || (pageId === currentPageId && !forceData)) return;

        // 1. Immediately persist the outgoing page before switching
        if (editor && currentPageId) {
            const outgoingTitle = titleRef.current?.innerText || "Untitled";
            const outgoingContent = editor.getJSON();

            // Cancel any pending debounced timer
            debouncedSave.cancel();

            // Persist to MongoDB
            updatePageContent(currentPageId, {
                title: outgoingTitle,
                content: outgoingContent,
                userEmail,
            });

            // Update local state and ref synchronously
            const updatedPages = pagesRef.current.map(p =>
                p._id === currentPageId ? { ...p, title: outgoingTitle, content: outgoingContent } : p
            );
            pagesRef.current = updatedPages;
            setPages(updatedPages);
        }

        setCurrentPageId(pageId);

        // 2. Read from updated ref first, not stale React state
        let selectedPage = forceData || pagesRef.current.find(p => p._id === pageId);

        if (!selectedPage) {
            const result = await getPages(userEmail);
            if (result.success && result.pages) {
                pagesRef.current = result.pages;
                setPages(result.pages);
                selectedPage = result.pages.find(p => p._id === pageId);
            }
        }

        if (selectedPage) {
            const displayTitle = selectedPage.title || "Untitled";
            setCoverImage(selectedPage.coverImage || null);
            setCoverPosition(selectedPage.coverPosition ?? 50);
            setPageIcon(selectedPage.icon || null);

            if (titleRef.current) {
                titleRef.current.innerText = displayTitle;
                titleRef.current._lastValue = displayTitle;
            }

            if (editor && !editor.isDestroyed) {
                const raw = selectedPage.content;
                const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;

                // Set flag to prevent onUpdate from overwriting during switch
                isSwitchingPageRef.current = true;
                editor.commands.setContent(
                    parsed && parsed.type ? parsed : { type: 'doc', content: [{ type: 'paragraph' }] },
                    false
                );
                setTimeout(() => {
                    isSwitchingPageRef.current = false;
                }, 50);
            }
        }
        setIsLoading(false);
    }, [currentPageId, editor, userEmail, debouncedSave]);

    const handleInsertPageLink = (selectedPage) => {
        if (!editor || !currentPageId) return;

        editor
            .chain()
            .focus()
            .insertContent({
                type: 'pageMention',
                attrs: {
                    pageId: selectedPage._id,
                    title: selectedPage.title || 'Untitled',
                    icon: selectedPage.icon || null,
                },
            })
            .insertContent(' ')
            .run();

        const updatedJson = editor.getJSON();
        const currentTitle = titleRef.current?.innerText || "Untitled";

        const nextPages = pagesRef.current.map(p =>
            p._id === currentPageId ? { ...p, content: updatedJson, title: currentTitle } : p
        );
        pagesRef.current = nextPages;
        setPages(nextPages);

        saveContent(updatedJson, currentTitle);
    };
    useEffect(() => {
        const handlePageMentionClick = (e) => {
            const pill = e.target.closest('[data-page-id]');
            if (pill) {
                e.preventDefault();
                e.stopPropagation();
                const targetPageId = pill.getAttribute('data-page-id');
                if (targetPageId) {
                    loadPage(targetPageId);
                }
            }
        };

        const dom = editor?.view?.dom;
        if (dom) {
            dom.addEventListener('click', handlePageMentionClick);
            return () => dom.removeEventListener('click', handlePageMentionClick);
        }
    }, [editor, loadPage]);

    useEffect(() => {
        const initialize = async () => {
            if (isMounted && editor && !currentPageId) {
                const result = await getPages(userEmail);
                if (result.success && result.pages.length > 0) {
                    setPages(result.pages);
                    const firstPage = result.pages[0];

                    setCurrentPageId(firstPage._id);
                    setCoverImage(firstPage.coverImage || null);
                    setCoverPosition(firstPage.coverPosition ?? 50);
                    setPageIcon(firstPage.icon || null);

                    if (titleRef.current) {
                        const initialTitle = firstPage.title || "Untitled";
                        titleRef.current.innerText = initialTitle;
                        titleRef.current._lastValue = initialTitle;
                    }


                    const rawContent = firstPage.content;
                    const parsedContent = typeof rawContent === 'string' ? JSON.parse(rawContent) : rawContent;

                    editor.commands.setContent(
                        parsedContent && parsedContent.type ? parsedContent : { type: 'doc', content: [{ type: 'paragraph' }] },
                        false
                    );
                    setIsLoading(false);
                } else if (result.success && result.pages.length === 0) {
                    handleCreatePage();
                }
            }
        };
        initialize();
    }, [isMounted, editor, userEmail]);

    const handleCreatePage = async () => {
        const result = await createPage(userEmail);
        if (result.success) {

            const sidebarResult = await getPages(userEmail);
            setPages(sidebarResult.pages);


            const newPage = sidebarResult.pages.find(p => p._id === result.pageId);
            loadPage(result.pageId, newPage);
        }
    };
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (plusMenuRef.current && !plusMenuRef.current.contains(e.target)) {
                setShowPlusMenu(false);
            }
            if (blockMenuRef.current && !blockMenuRef.current.contains(e.target)) {
                setShowBlockMenu(false);
            }
            if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
                setShowMoreMenu(false);
            }
        };

        if (showPlusMenu || showBlockMenu || showMoreMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showPlusMenu, showBlockMenu, showMoreMenu]);

    const handleDeletePage = async (e, pageId) => {
        e.stopPropagation();

        if (confirm("Are you sure you want to delete this page?")) {
            const result = await deletePage(pageId);
            if (result.success) {

                setPages(prev => prev.filter(p => p._id !== pageId));


                if (currentPageId === pageId) {
                    const remainingPages = pages.filter(p => p._id !== pageId);
                    if (remainingPages.length > 0) {
                        loadPage(remainingPages[0]._id);
                    } else {
                        handleCreatePage();
                    }
                }
            }
        }
    };

    const handleUpdateCover = async (newCoverUrl) => {
        setCoverImage(newCoverUrl);
        setShowCoverPicker(false);

        if (currentPageId) {
            const currentTitle = titleRef.current?.innerText || "Untitled";
            const currentContent = editor?.getJSON() || { type: 'doc', content: [{ type: 'paragraph' }] };


            setPages(prev =>
                prev.map(p => (p._id === currentPageId ? { ...p, coverImage: newCoverUrl } : p))
            );


            setSavingStatus("Saving...");
            const res = await updatePageContent(currentPageId, {
                title: currentTitle,
                content: currentContent,
                coverImage: newCoverUrl
            });
            setSavingStatus(res.success ? "Saved" : "Error");
        }
    };


    const handleRemoveCover = () => {
        handleUpdateCover(null);
    };
    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;


        e.target.value = '';

        if (!file.type.startsWith('image/')) {
            setUploadError('Please select a valid image file.');
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            setUploadError('Image size exceeds 5MB limit.');
            return;
        }

        setUploadError('');
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                handleUpdateCover(reader.result);
            }
        };
        reader.readAsDataURL(file);
    };
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (plusMenuRef.current && !plusMenuRef.current.contains(e.target)) setShowPlusMenu(false);
            if (blockMenuRef.current && !blockMenuRef.current.contains(e.target)) setShowBlockMenu(false);
            if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) setShowMoreMenu(false);
        };
        if (showPlusMenu || showBlockMenu || showMoreMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showPlusMenu, showBlockMenu, showMoreMenu]);

    const handleMouseDownCover = (e) => {
        if (!isRepositioning) return;
        setIsDraggingCover(true);
        dragRef.current = { startY: e.clientY, startPos: coverPosition };
    };

    const handleMouseMoveCover = useCallback((e) => {
        if (!isDraggingCover) return;
        const deltaY = e.clientY - dragRef.current.startY;


        const newPos = Math.max(0, Math.min(100, dragRef.current.startPos - (deltaY * 0.3)));
        setCoverPosition(newPos);
    }, [isDraggingCover]);

    const handleMouseUpCover = useCallback(() => {
        setIsDraggingCover(false);
    }, []);


    useEffect(() => {
        if (isDraggingCover) {
            window.addEventListener('mousemove', handleMouseMoveCover);
            window.addEventListener('mouseup', handleMouseUpCover);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMoveCover);
            window.removeEventListener('mouseup', handleMouseUpCover);
        };
    }, [isDraggingCover, handleMouseMoveCover, handleMouseUpCover]);
    const handleSavePosition = async () => {
        setIsRepositioning(false);
        if (currentPageId) {
            setSavingStatus("Saving...");

            setPages(prev => prev.map(p =>
                p._id === currentPageId ? { ...p, coverPosition } : p
            ));


            const currentTitle = titleRef.current?.innerText || "Untitled";
            const res = await updatePageContent(currentPageId, {
                title: currentTitle,
                content: editor?.getJSON(),
                coverPosition: coverPosition
            });
            setSavingStatus(res.success ? "Saved" : "Error");
        }
    };

    const handleCancelReposition = () => {
        setIsRepositioning(false);

        const currentPage = pages.find(p => p._id === currentPageId);
        setCoverPosition(currentPage?.coverPosition ?? 50);
    };

    useEffect(() => {
        const handleBeforeUnload = () => {
            debouncedSave.flush();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [debouncedSave]);




    const updateHandlePosition = useCallback((targetElement, isTitle = false) => {
        if (!containerRef.current || !targetElement) return;
        const containerRect = containerRef.current.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        const offset = isTitle ? 14 : 4;
        setHandlePos({ top: targetRect.top - containerRect.top + offset, opacity: 1 });
    }, []);

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const title = titleRef.current;
        if (title && e.clientY >= title.getBoundingClientRect().top && e.clientY <= title.getBoundingClientRect().bottom) {
            updateHandlePosition(title, true);
            return;
        }
        const element = document.elementFromPoint(e.clientX, e.clientY);
        const block = element?.closest('.tiptap > *');
        if (block) updateHandlePosition(block);
    };
    const handleUpdateIcon = async (selectedIcon) => {
        setPageIcon(selectedIcon);
        setShowIconPicker(false);

        if (currentPageId) {
            setPages(prev =>
                prev.map(p => (p._id === currentPageId ? { ...p, icon: selectedIcon } : p))
            );

            setSavingStatus("Saving...");
            const res = await updatePageContent(currentPageId, {
                title: titleRef.current?.innerText || "Untitled",
                content: editor?.getJSON(),
                icon: selectedIcon,
            });
            setSavingStatus(res.success ? "Saved" : "Error");
        }
    };
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (plusMenuRef.current && !plusMenuRef.current.contains(e.target)) {
                setShowPlusMenu(false);
            }
        };
        if (showPlusMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showPlusMenu]);
    useEffect(() => {
        const handleOpenLinker = () => setShowPageLinkModal(true);
        window.addEventListener('notion:open-page-linker', handleOpenLinker);
        return () => window.removeEventListener('notion:open-page-linker', handleOpenLinker);
    }, []);





    const saveContent = useCallback((json, title) => {

        const cleanTitle = title.replace(/\n/g, '').trim();


        if (!isLoading && currentPageId && cleanTitle.length > 0) {
            debouncedSave(json, cleanTitle, currentPageId);
        }
    }, [currentPageId, debouncedSave, isLoading]);



    useEffect(() => {
        if (!editor || !currentPageId) return;

        editor.setOptions({
            onUpdate: ({ editor }) => {
                const currentTitle = titleRef.current?.innerText || "Untitled";
                saveContent(editor.getJSON(), currentTitle);
            },
        });
    }, [editor, currentPageId, saveContent]);
    useEffect(() => {
        const currentPage = pages.find(p => p._id === currentPageId);

        if (currentPage && titleRef.current) {
            const syncTitle = currentPage.title || "Untitled";
            if (document.activeElement !== titleRef.current && titleRef.current.innerText !== syncTitle) {
                titleRef.current.innerText = syncTitle;
                titleRef.current._lastValue = syncTitle;
            }
        }
    }, [currentPageId]);


    if (!isMounted) return null;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="animate-pulse text-gray-400 font-medium">Loading Workspace...</div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-white overflow-hidden font-sans text-slate-900">

            <aside
                className={`${isSidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 ease-in-out bg-[#FBFBFA] border-r border-gray-200 flex flex-col z-20 overflow-hidden`}
            >
                <div className="p-4 flex flex-col h-full min-w-[256px]">
                    <div className="flex items-center gap-2 px-2 py-1.5 mb-6 hover:bg-gray-200/50 rounded-lg cursor-pointer transition-colors">
                        <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                            {userEmail[0].toUpperCase()}
                        </div>
                        <span className="font-semibold text-sm text-slate-700 truncate">
                            {`${userEmail.split('@')[0]}'s Notion`}
                        </span>
                    </div>

                    <nav className="flex-1 space-y-1">
                        <button className="w-full flex items-center gap-2.5 px-2.5 py-2 text-sm font-medium text-slate-600 hover:bg-gray-200/50 rounded-lg transition-colors group">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                            Home
                        </button>
                        <button className="w-full flex items-center gap-2.5 px-2.5 py-2 text-sm font-medium text-slate-600 hover:bg-gray-200/50 rounded-lg transition-colors group">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
                            Library
                        </button>
                        <div className="mt-8">
                            <div className="flex items-center justify-between px-3 mb-2 group">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recents</span>
                                <button
                                    onClick={handleCreatePage}
                                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-200 rounded transition-all"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                </button>
                            </div>

                            <div className="space-y-0.5">
                                {pages.map((page) => (
                                    <div key={page._id} className="group relative flex items-center">
                                        <button
                                            onClick={() => loadPage(page._id)}
                                            className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-sm rounded-lg transition-colors ${
                                                currentPageId === page._id
                                                    ? 'bg-gray-200 text-slate-900 font-medium'
                                                    : 'text-slate-600 hover:bg-gray-200/50'
                                            }`}
                                        >
                                            {page.icon ? (
                                                <PageIcon icon={page.icon} size={16} />
                                            ) : (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                    <polyline points="14 2 14 8 20 8"></polyline>
                                                </svg>
                                            )}
                                            <span className="truncate pr-14 text-left">{page.title || "Untitled"}</span>
                                        </button>

                                        {/* Hover Action Buttons */}
                                        <div className="absolute right-1.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {/* Add nested page button with tooltip */}
                                            <div className="relative group/tooltip">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCreatePage();
                                                    }}
                                                    className="p-1 rounded hover:bg-gray-300/80 text-gray-500 hover:text-gray-800 transition-colors"
                                                >
                                                    <Plus size={14} strokeWidth={2.5} />
                                                </button>

                                                <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/tooltip:block z-50 whitespace-nowrap rounded bg-stone-900 px-2 py-1 text-[11px] font-medium text-white shadow-md">
                                                    Add a page inside
                                                </div>
                                            </div>

                                            {/* More options / Delete button */}
                                            <button
                                                type="button"
                                                onClick={(e) => handleDeletePage(e, page._id)}
                                                className="p-1 rounded hover:bg-gray-300/80 text-gray-500 hover:text-red-600 transition-colors"
                                                title="Delete page"
                                            >
                                                <MoreHorizontal size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="w-full flex items-center gap-2.5 px-2.5 py-2 text-sm font-medium text-slate-600 hover:bg-gray-200/50 rounded-lg transition-colors group"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                            Settings
                        </button>
                    </nav>

                    <div className="mt-auto pt-4 border-t border-gray-200">
                        <button  onClick={()=> logout()}  className="w-full text-left px-2 py-1.5 text-xs font-medium text-gray-400 hover:text-red-500 transition-colors">
                            Log out
                        </button>
                    </div>
                </div>
            </aside>


            <div className="flex-1 flex flex-col min-w-0 bg-white relative">
                <header className="h-11 flex items-center justify-between px-4 bg-white/80 backdrop-blur-md z-20 border-b border-gray-100">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 transition-colors"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>

                    <div className="flex items-center gap-1.5 text-slate-500">
                        {/* Edited status with pulse dot */}
                        <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-400">
                            <div className={`w-2 h-2 rounded-full ${savingStatus === "Saving..." ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`} />
                            <span>{savingStatus === "Saving..." ? "Saving..." : "Edited just now"}</span>
                        </div>

                        {/* Favorite (Star) Button */}
                        <button
                            type="button"
                            onClick={() => setIsFavorite(prev => !prev)}
                            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                            title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                        >
                            <Star
                                size={16}
                                className={isFavorite ? "fill-amber-400 text-amber-400" : "text-gray-400 hover:text-gray-600"}
                            />
                        </button>

                        {/* More options menu (...) */}
                        <div ref={moreMenuRef} className="relative">
                            <button
                                type="button"
                                onClick={() => setShowMoreMenu((prev) => !prev)}
                                className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <MoreHorizontal size={18} />
                            </button>

                            {showMoreMenu && (
                                <div className="absolute right-0 top-full mt-1 z-50">
                                    <PageMoreMenu
                                        editor={editor}
                                        onClose={() => setShowMoreMenu(false)}
                                        onDeletePage={() => currentPageId && handleDeletePage({ stopPropagation: () => {} }, currentPageId)}
                                        fontStyle={fontStyle}
                                        setFontStyle={setFontStyle}
                                        isSmallText={isSmallText}
                                        setIsSmallText={setIsSmallText}
                                        isFullWidth={isFullWidth}
                                        setIsFullWidth={setIsFullWidth}
                                        userEmail={userEmail}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto">
                    {coverImage && (
                        <div
                            className={`relative w-full h-52 sm:h-64 overflow-hidden bg-gray-100 ${
                                isRepositioning
                                    ? (isDraggingCover ? 'cursor-grabbing' : 'cursor-grab')
                                    : 'group/cover'
                            }`}
                            onMouseDown={handleMouseDownCover}
                        >
                            <img
                                src={coverImage}
                                alt="Cover"
                                className="w-full h-full object-cover pointer-events-none select-none"
                                style={{ objectPosition: `center ${coverPosition}%` }}
                            />

                            {isRepositioning ? (
                                <div className="absolute top-4 w-full flex justify-between px-8 items-center z-10 pointer-events-none">
                                    <div className="px-3 py-1.5 bg-black/60 text-white text-xs rounded shadow-sm">
                                        Drag image to reposition
                                    </div>
                                    <div className="flex items-center gap-2 pointer-events-auto">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleCancelReposition(); }}
                                            className="px-3 py-1.5 text-xs font-medium bg-white/90 hover:bg-white text-slate-700 rounded transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleSavePosition(); }}
                                            className="px-3 py-1.5 text-xs font-medium bg-blue-500 hover:bg-blue-600 text-white rounded transition-all"
                                        >
                                            Save position
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="absolute bottom-3 right-8 flex items-center gap-2 opacity-0 group-hover/cover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setShowCoverPicker(prev => !prev)}
                                        className="px-2.5 py-1 text-xs font-medium bg-white/90 hover:bg-white text-slate-700 rounded shadow-sm backdrop-blur-sm transition-all"
                                    >
                                        Change cover
                                    </button>
                                    <button
                                        onClick={() => setIsRepositioning(true)}
                                        className="px-2.5 py-1 text-xs font-medium bg-white/90 hover:bg-white text-slate-700 rounded shadow-sm backdrop-blur-sm transition-all"
                                    >
                                        Reposition
                                    </button>
                                    <button
                                        onClick={handleRemoveCover}
                                        className="px-2.5 py-1 text-xs font-medium bg-white/90 hover:bg-white text-red-600 rounded shadow-sm backdrop-blur-sm transition-all"
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    <main
                        ref={containerRef}
                        onMouseMove={handleMouseMove}
                        className={`mx-auto relative group pb-40 transition-all duration-150 ${
                            isFullWidth ? 'max-w-full px-12' : 'max-w-3xl px-16'
                        } ${
                            coverImage ? 'mt-8' : 'mt-16'
                        } ${
                            fontStyle === 'serif' ? 'font-serif' : fontStyle === 'mono' ? 'font-mono' : 'font-sans'
                        } ${
                            isSmallText ? 'text-xs' : 'text-base'
                        }`}
                    >
                        <div
                            ref={plusMenuRef}
                            className="absolute flex items-center z-50 pointer-events-auto opacity-0 group-hover:opacity-100"
                            style={{
                                transform: `translate3d(calc(-100% - 180px), ${handlePos.top}px, 0)`,
                                transition: 'transform 100ms cubic-bezier(0.2, 0, 0, 1), opacity 200ms',
                            }}
                        >
                            <div className="relative">
                                <button
                                    type="button"
                                    className="p-1 hover:bg-gray-100 rounded text-gray-300 hover:text-gray-600 transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowPlusMenu((prev) => !prev);
                                    }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <line x1="12" y1="5" x2="12" y2="19"></line>
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                    </svg>
                                </button>

                                {showPlusMenu && (
                                    <div className="absolute left-0 top-full mt-1 z-50">
                                        <SlashCommandList
                                            items={plusMenuItems}
                                            command={(item) => {
                                                if (item.command && editor) {
                                                    const { from, to } = editor.state.selection;
                                                    item.command({ editor, range: { from, to } });
                                                }
                                                setShowPlusMenu(false);
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Six-dots handle with action menu */}
                            <div ref={blockMenuRef} className="relative">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowBlockMenu((prev) => !prev);
                                        setShowPlusMenu(false);
                                    }}
                                    className="p-1 hover:bg-gray-100 rounded text-gray-300 hover:text-gray-600 cursor-pointer transition-colors"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <circle cx="9" cy="6" r="2" /><circle cx="9" cy="12" r="2" /><circle cx="9" cy="18" r="2" />
                                        <circle cx="15" cy="6" r="2" /><circle cx="15" cy="12" r="2" /><circle cx="15" cy="18" r="2" />
                                    </svg>
                                </button>

                                {showBlockMenu && (
                                    <div className="absolute left-0 top-full mt-1 z-50">
                                        <BlockActionMenu
                                            editor={editor}
                                            userEmail={userEmail}
                                            onClose={() => setShowBlockMenu(false)}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>



                        {showCoverPicker && (
                            <div className="absolute top-0 right-16 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-72">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Presets</span>
                                    <button
                                        onClick={() => setShowCoverPicker(false) }
                                        className="text-gray-400 hover:text-gray-600 text-xs"
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    {NOTION_COVERS.map((url, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleUpdateCover(url)}
                                            className="h-16 rounded overflow-hidden border border-gray-100 hover:scale-[1.02] transition-transform"
                                        >
                                            <img src={url} alt="preset" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                                <div>
                                    <div className="space-y-2 pt-2 border-t border-gray-100">

                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileUpload}
                                            accept="image/png, image/jpeg, image/webp, image/gif"
                                            className="hidden"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-gray-50 hover:bg-gray-100 text-slate-700 text-xs font-medium rounded border border-gray-200 transition-colors"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                <polyline points="17 8 12 3 7 8" />
                                                <line x1="12" y1="3" x2="12" y2="15" />
                                            </svg>
                                            Upload custom image
                                        </button>
                                        <div className="text-[10px] text-gray-400 text-center">Max file size: 5MB</div>


                                        {uploadError && (
                                            <p className="text-[11px] text-red-500 font-medium text-center">{uploadError}</p>
                                        )}


                                        <input
                                            type="text"
                                            placeholder="Or paste image link & press Enter..."
                                            className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded focus:outline-none focus:border-blue-500"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && e.currentTarget.value) {
                                                    handleUpdateCover(e.currentTarget.value);
                                                }
                                            }}
                                        />
                                    </div>

                                </div>
                            </div>
                        )}


                        {!coverImage && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-2 flex items-center gap-2">
                                <button
                                    onClick={() => setShowCoverPicker(true)}
                                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                                    Add cover
                                </button>
                            </div>
                        )}
                        <div className="flex items-center gap-2 mb-2 -ml-45">
                            {pageIcon ? (
                                <div className="relative inline-block">
                                    <button
                                        type="button"
                                        onClick={() => setShowIconPicker(prev => !prev)}
                                        className={`p-1 rounded-lg hover:bg-gray-200/50 transition-colors flex items-center justify-center border-none bg-transparent shadow-none outline-none ${
                                            coverImage ? '-mt-16' : ''
                                        }`}
                                    >
                                        <PageIcon icon={pageIcon} size={coverImage ? 56 : 44} />
                                    </button>
                                </div>
                            ) : (
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        type="button"
                                        onClick={() => setShowIconPicker(true)}
                                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                                    >
                                        <Smile size={14} />
                                        Add icon
                                    </button>
                                </div>
                            )}

                            {!coverImage && (
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setShowCoverPicker(true)}
                                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                                        Add cover
                                    </button>
                                </div>
                            )}
                        </div>


                        {showIconPicker && (
                            <div className="relative z-50">
                                <div className="absolute top-0 left-0">
                                    <IconPickerModal
                                        onSelect={(selected) => handleUpdateIcon(selected)}
                                        onClose={() => setShowIconPicker(false)}
                                    />
                                </div>
                            </div>
                        )}


                        <h1
                            ref={titleRef}
                            contentEditable
                            suppressContentEditableWarning={true}
                            data-placeholder="Untitled"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    editor?.chain().focus().run();
                                }
                            }}
                            onInput={(e) => {
                                const text = e.currentTarget.innerText;
                                saveContent(editor?.getJSON(), text);

                            }}
                            onBlur={(e) => {
                                const text = e.currentTarget.innerText.trim();
                                if (text === "") {
                                    const fallback = "Untitled";
                                    e.currentTarget.innerText = fallback;
                                    saveContent(editor?.getJSON(), fallback);
                                }
                            }}
                            className="-ml-45 text-5xl font-bold mb-8 outline-none text-slate-800 tracking-tight leading-tight empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300">



                        </h1>

                        {editor && (
                            <BubbleMenu
                                editor={editor}
                                tippyOptions={{
                                    duration: 150,
                                    placement: 'top-start',
                                    offset: [0, 10],
                                }}
                                className="w-64 bg-white border border-gray-200/80 shadow-2xl rounded-2xl p-2.5 flex flex-col gap-2 z-50 text-slate-700 select-none animate-in fade-in zoom-in-95 duration-100"
                            >
                                {/* Block Type Dropdown Selector */}
                                <div className="relative group/type">
                                    <button
                                        type="button"
                                        className="w-full flex items-center justify-between px-2.5 py-1.5 hover:bg-gray-100/80 rounded-lg text-[13px] font-medium transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="font-serif text-[15px] font-semibold text-slate-600 leading-none">T</span>
                                            <span className="text-slate-700">
                        {editor.isActive('heading', { level: 1 })
                            ? 'Heading 1'
                            : editor.isActive('heading', { level: 2 })
                                ? 'Heading 2'
                                : editor.isActive('heading', { level: 3 })
                                    ? 'Heading 3'
                                    : 'Normal text'}
                    </span>
                                        </div>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-400">
                                            <polyline points="9 18 15 12 9 6" />
                                        </svg>
                                    </button>

                                    {/* Hover/Click Submenu for Text Types */}
                                    <div className="hidden group-hover/type:flex flex-col absolute left-0 top-full mt-1 w-44 bg-white border border-gray-200 shadow-xl rounded-xl p-1 z-50">
                                        <button
                                            type="button"
                                            onClick={() => editor.chain().focus().setParagraph().run()}
                                            className="w-full text-left px-2 py-1.5 text-xs font-medium hover:bg-gray-100 rounded-md"
                                        >
                                            Normal text
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                                            className="w-full text-left px-2 py-1.5 text-xs font-medium hover:bg-gray-100 rounded-md"
                                        >
                                            Heading 1
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                                            className="w-full text-left px-2 py-1.5 text-xs font-medium hover:bg-gray-100 rounded-md"
                                        >
                                            Heading 2
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                                            className="w-full text-left px-2 py-1.5 text-xs font-medium hover:bg-gray-100 rounded-md"
                                        >
                                            Heading 3
                                        </button>
                                    </div>
                                </div>

                                <div className="h-px bg-gray-100 mx-1" />

                                {/* Row 1: Text Styling (A color, Bold, Italic, Underline, Clear Formatting) */}
                                <div className="flex items-center justify-between px-0.5">
                                    {/* Text Color / Highlight */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const color = window.prompt('Enter hex color or leave empty to clear:', '#2563eb');
                                            if (color) editor.chain().focus().setColor(color).run();
                                            else editor.chain().focus().unsetColor().run();
                                        }}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                                        title="Text Color"
                                    >
                                        <div className="flex flex-col items-center justify-center leading-none">
                                            <span className="font-semibold text-xs text-slate-700">A</span>
                                            <span className="w-3 h-0.5 bg-blue-500 rounded-full mt-0.5" />
                                        </div>
                                    </button>

                                    {/* Bold */}
                                    <button
                                        type="button"
                                        onClick={() => editor.chain().focus().toggleBold().run()}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                                            editor.isActive('bold') ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-gray-100'
                                        }`}
                                        title="Bold"
                                    >
                                        B
                                    </button>

                                    {/* Italic */}
                                    <button
                                        type="button"
                                        onClick={() => editor.chain().focus().toggleItalic().run()}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-serif italic transition-colors ${
                                            editor.isActive('italic') ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-gray-100'
                                        }`}
                                        title="Italic"
                                    >
                                        I
                                    </button>

                                    {/* Underline */}
                                    <button
                                        type="button"
                                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs underline underline-offset-2 transition-colors ${
                                            editor.isActive('underline') ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-gray-100'
                                        }`}
                                        title="Underline"
                                    >
                                        U
                                    </button>

                                    {/* Clear Formatting */}
                                    <button
                                        type="button"
                                        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-slate-800 transition-colors"
                                        title="Clear formatting"
                                    >
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                            <path d="M4 7V4h16v3" />
                                            <path d="M9 20h6" />
                                            <path d="M12 4v16" />
                                            <line x1="18" y1="18" x2="22" y2="22" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Row 2: Inserts & Formatting (Link, Strike, Code, Math/Equation, More) */}
                                <div className="flex items-center justify-between px-0.5">
                                    {/* Link */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const prevUrl = editor.getAttributes('link').href;
                                            const url = window.prompt('Enter URL:', prevUrl || '');
                                            if (url === null) return;
                                            if (url === '') {
                                                editor.chain().focus().extendMarkRange('link').unsetLink().run();
                                                return;
                                            }
                                            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
                                        }}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                            editor.isActive('link') ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-gray-100'
                                        }`}
                                        title="Link"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                        </svg>
                                    </button>

                                    {/* Strikethrough */}
                                    <button
                                        type="button"
                                        onClick={() => editor.chain().focus().toggleStrike().run()}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                            editor.isActive('strike') ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-gray-100'
                                        }`}
                                        title="Strikethrough"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                            <path d="M16 4H9a3 3 0 0 0-2.83 4" />
                                            <path d="M14 12a4 4 0 0 1 0 8H6" />
                                            <line x1="4" y1="12" x2="20" y2="12" />
                                        </svg>
                                    </button>

                                    {/* Inline Code */}
                                    <button
                                        type="button"
                                        onClick={() => editor.chain().focus().toggleCode().run()}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                            editor.isActive('code') ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-gray-100'
                                        }`}
                                        title="Inline Code"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                            <polyline points="16 18 22 12 16 6" />
                                            <polyline points="8 6 2 12 8 18" />
                                        </svg>
                                    </button>

                                    {/* Code Block / Equation symbol */}
                                    <button
                                        type="button"
                                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                            editor.isActive('codeBlock') ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-gray-100'
                                        }`}
                                        title="Code Block"
                                    >
                                        <span className="font-serif italic text-xs font-semibold text-slate-700">√x</span>
                                    </button>

                                    {/* More / Additional Options */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const currentText = editor.state.doc.textBetween(
                                                editor.state.selection.from,
                                                editor.state.selection.to
                                            );
                                            navigator.clipboard.writeText(currentText);
                                        }}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-slate-700 transition-colors"
                                        title="Copy selection"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <circle cx="12" cy="12" r="1" />
                                            <circle cx="19" cy="12" r="1" />
                                            <circle cx="5" cy="12" r="1" />
                                        </svg>
                                    </button>
                                </div>
                            </BubbleMenu>
                        )}


                        <div className="relative w-full">
                            <EditorContent editor={editor} />
                            <TableControlsOverlay editor={editor} />
                        </div>
                    </main>

                </div>
            </div>
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                userEmail={userEmail}
            />
            <PageLinkModal
                isOpen={showPageLinkModal}
                onClose={() => setShowPageLinkModal(false)}
                pages={pages}
                currentPageId={currentPageId}
                onSelectPage={handleInsertPageLink}
            />



        </div>
    );
};

export default Dashboard;