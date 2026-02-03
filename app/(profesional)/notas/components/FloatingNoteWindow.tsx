"use client";
import { useState, useRef, useCallback, useEffect } from 'react';
import { X, GripVertical, FileText, History, Search, Check, Loader2, FileCheck2, Maximize2, Minimize2 } from 'lucide-react';
import { NoteToolbar } from './NoteToolbar';

type Tab = 'note' | 'history';

type HistoryEntry = {
    id: string;
    date: string;
    excerpt: string;
    content: string;
};

type NoteData = {
    id: string;
    patientId: number;
    patientName: string;
    sessionDate: string;
    status: 'draft' | 'signed';
    content: string;
};

type Props = {
    note: NoteData;
    history: HistoryEntry[];
    initialPosition: { x: number; y: number };
    onClose: () => void;
    onSave: (noteId: string, content: string) => void;
    onSign: (noteId: string, content: string) => void;
    onOpenNote: (noteId: string) => void;
    zIndex: number;
    onFocus: () => void;
};

const MIN_WIDTH = 400;
const MIN_HEIGHT = 350;
const DEFAULT_WIDTH = 500;
const DEFAULT_HEIGHT = 600;

export function FloatingNoteWindow({
    note,
    history,
    initialPosition,
    onClose,
    onSave,
    onSign,
    onOpenNote,
    zIndex,
    onFocus,
}: Props) {
    const [position, setPosition] = useState(initialPosition);
    const [size, setSize] = useState({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [activeTab, setActiveTab] = useState<Tab>('note');
    const [content, setContent] = useState(note.content);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [historySearch, setHistorySearch] = useState('');
    const windowRef = useRef<HTMLDivElement>(null);

    // Store previous position/size for restore
    const prevStateRef = useRef({ position, size });

    // Auto-save
    useEffect(() => {
        if (content === note.content) return;

        setSaveStatus('saving');
        const timeout = setTimeout(() => {
            setSaveStatus('saved');
            onSave(note.id, content);
        }, 1500);

        return () => clearTimeout(timeout);
    }, [content, note.content, note.id, onSave]);

    // Drag handlers
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (isMaximized) return; // Can't drag when maximized
        if (windowRef.current) {
            const rect = windowRef.current.getBoundingClientRect();
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            });
            setIsDragging(true);
            onFocus();
        }
    }, [onFocus, isMaximized]);

    // Resize handlers
    const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (isMaximized) return;
        setIsResizing(true);
        onFocus();
    }, [onFocus, isMaximized]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                setPosition({
                    x: e.clientX - dragOffset.x,
                    y: e.clientY - dragOffset.y,
                });
            }
            if (isResizing && windowRef.current) {
                const rect = windowRef.current.getBoundingClientRect();
                const newWidth = Math.max(MIN_WIDTH, e.clientX - rect.left);
                const newHeight = Math.max(MIN_HEIGHT, e.clientY - rect.top);
                setSize({ width: newWidth, height: newHeight });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setIsResizing(false);
        };

        if (isDragging || isResizing) {
            // Prevent text selection while dragging/resizing
            document.body.style.userSelect = 'none';
            document.body.style.cursor = isDragging ? 'grabbing' : 'nwse-resize';
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, dragOffset]);

    // Maximize/Restore toggle
    const handleToggleMaximize = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (isMaximized) {
            // Restore
            setPosition(prevStateRef.current.position);
            setSize(prevStateRef.current.size);
            setIsMaximized(false);
        } else {
            // Save current state and maximize
            prevStateRef.current = { position, size };
            setIsMaximized(true);
        }
        onFocus();
    }, [isMaximized, position, size, onFocus]);

    const handleFormat = useCallback((format: string) => {
        console.log('Format:', format);
    }, []);

    const filteredHistory = historySearch
        ? history.filter(h =>
            h.excerpt.toLowerCase().includes(historySearch.toLowerCase()) ||
            h.content.toLowerCase().includes(historySearch.toLowerCase())
        )
        : history;

    const handleHistoryItemClick = (entryId: string) => {
        if (entryId === note.id) {
            setActiveTab('note');
        } else {
            onOpenNote(entryId);
        }
    };

    // Window styles based on maximized state
    const windowStyle = isMaximized
        ? {
            position: 'absolute' as const,
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            zIndex,
            borderRadius: 0,
        }
        : {
            left: position.x,
            top: position.y,
            width: size.width,
            height: size.height,
            maxHeight: 'none',
            zIndex,
        };

    return (
        <div
            ref={windowRef}
            className={`floating-note-window ${isMaximized ? 'maximized' : ''}`}
            style={windowStyle}
            onClick={onFocus}
        >
            {/* Header - entire area is draggable */}
            <div
                className="floating-header"
                onMouseDown={handleMouseDown}
                style={{ cursor: isMaximized ? 'default' : (isDragging ? 'grabbing' : 'grab') }}
            >
                <div className="drag-handle" title="Arrastra para mover">
                    <GripVertical size={16} />
                </div>

                <div className="floating-tabs">
                    <button
                        className={`floating-tab ${activeTab === 'note' ? 'active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); setActiveTab('note'); }}
                    >
                        <FileText size={14} />
                        {note.patientName.split(' ')[0]}
                    </button>
                    <button
                        className={`floating-tab ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); setActiveTab('history'); }}
                    >
                        <History size={14} />
                        Historial
                    </button>
                </div>

                <button
                    className="floating-maximize"
                    onClick={handleToggleMaximize}
                    title={isMaximized ? 'Restaurar' : 'Maximizar'}
                >
                    {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>

                <button className="floating-close" onClick={(e) => { e.stopPropagation(); onClose(); }}>
                    <X size={16} />
                </button>
            </div>

            {/* Note Tab */}
            {activeTab === 'note' && (
                <div className="floating-content">
                    <div className="floating-note-info">
                        <span className="floating-patient">{note.patientName}</span>
                        <span className="floating-date">Sesión del {note.sessionDate}</span>
                        <span className={`floating-status ${note.status}`}>
                            {note.status === 'draft' ? '🟡 Borrador' : '✅ Firmada'}
                        </span>
                    </div>

                    <NoteToolbar onFormat={handleFormat} />

                    <textarea
                        className="floating-textarea"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Escribe tus notas de la sesión..."
                        disabled={note.status === 'signed'}
                    />

                    {/* Footer - also draggable */}
                    <div
                        className="floating-footer"
                        onMouseDown={handleMouseDown}
                        style={{ cursor: isMaximized ? 'default' : (isDragging ? 'grabbing' : 'grab') }}
                    >
                        <div className={`save-indicator ${saveStatus}`}>
                            {saveStatus === 'saving' && (
                                <>
                                    <Loader2 size={12} className="animate-spin" />
                                    Guardando...
                                </>
                            )}
                            {saveStatus === 'saved' && (
                                <>
                                    <Check size={12} />
                                    Guardado
                                </>
                            )}
                        </div>

                        {note.status === 'draft' && (
                            <button
                                className="floating-sign-btn"
                                onClick={(e) => { e.stopPropagation(); onSign(note.id, content); }}
                            >
                                <FileCheck2 size={14} />
                                Firmar
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
                <div className="floating-content">
                    <div className="floating-search">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Buscar en historial..."
                            value={historySearch}
                            onChange={(e) => setHistorySearch(e.target.value)}
                        />
                    </div>

                    <div className="floating-history-list">
                        {filteredHistory.length === 0 ? (
                            <div className="floating-empty">
                                No se encontraron notas
                            </div>
                        ) : (
                            filteredHistory.map(entry => (
                                <div
                                    key={entry.id}
                                    className={`floating-history-item ${entry.id === note.id ? 'current' : ''}`}
                                    onClick={() => handleHistoryItemClick(entry.id)}
                                >
                                    <div className="floating-history-date">
                                        {entry.id === note.id ? '📝 Actual' : entry.date}
                                    </div>
                                    <p className="floating-history-excerpt">{entry.excerpt}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Resize Handle */}
            {!isMaximized && (
                <div
                    className="resize-handle"
                    onMouseDown={handleResizeMouseDown}
                    title="Arrastra para redimensionar"
                />
            )}
        </div>
    );
}
