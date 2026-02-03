"use client";
import { useState, useRef, useCallback, useEffect } from 'react';
import { X, GripVertical, FileText, History, Search, Check, Loader2, FileCheck2 } from 'lucide-react';
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
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [activeTab, setActiveTab] = useState<Tab>('note');
    const [content, setContent] = useState(note.content);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [historySearch, setHistorySearch] = useState('');
    const windowRef = useRef<HTMLDivElement>(null);

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
        if (windowRef.current) {
            const rect = windowRef.current.getBoundingClientRect();
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            });
            setIsDragging(true);
            onFocus();
        }
    }, [onFocus]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                setPosition({
                    x: e.clientX - dragOffset.x,
                    y: e.clientY - dragOffset.y,
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset]);

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

    return (
        <div
            ref={windowRef}
            className="floating-note-window"
            style={{
                left: position.x,
                top: position.y,
                zIndex,
            }}
            onClick={onFocus}
        >
            {/* Header - entire area is draggable */}
            <div
                className="floating-header"
                onMouseDown={handleMouseDown}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
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
                            {note.status === 'draft' ? 'Borrador' : 'Firmada'}
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
                        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
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
        </div>
    );
}
