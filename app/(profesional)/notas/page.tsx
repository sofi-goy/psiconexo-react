"use client";
import { useState, useMemo, useCallback } from 'react';
import { Search, FileText } from 'lucide-react';
import { NoteCard, ClinicalNote } from './components/NoteCard';
import { TabFilter, TabType } from './components/TabFilter';
import { FloatingNoteWindow } from './components/FloatingNoteWindow';
import './styles.css';

// Mock data - will be replaced with API calls
const MOCK_NOTES: ClinicalNote[] = [
    {
        id: '1',
        patientId: 1,
        patientName: 'Mariana López',
        sessionDate: new Date('2026-02-02T10:00:00'),
        status: 'draft',
        content: 'Paciente refiere ansiedad por entrevista de trabajo programada para la próxima semana. Trabajamos técnicas de respiración y visualización. Se mostró receptiva a las sugerencias...',
        excerpt: 'Paciente refiere ansiedad por entrevista de trabajo. Trabajamos técnicas de respiración...',
        createdAt: new Date('2026-02-02T10:00:00'),
        updatedAt: new Date('2026-02-02T12:30:00'),
    },
    {
        id: '2',
        patientId: 2,
        patientName: 'Chupete Suazo',
        sessionDate: new Date('2026-02-01T15:00:00'),
        status: 'draft',
        content: 'Sesión enfocada en manejo de ira. Paciente reporta incidente en el trabajo donde logró contenerse. Revisamos estrategias de regulación emocional...',
        excerpt: 'Sesión enfocada en manejo de ira. Paciente reporta incidente en trabajo...',
        createdAt: new Date('2026-02-01T15:00:00'),
        updatedAt: new Date('2026-02-01T16:00:00'),
    },
    {
        id: '3',
        patientId: 3,
        patientName: 'Pedro Martínez',
        sessionDate: new Date('2026-02-01T11:00:00'),
        status: 'draft',
        content: 'Primera sesión de seguimiento después de vacaciones. Paciente refiere haber mantenido rutina de meditación...',
        excerpt: 'Primera sesión de seguimiento después de vacaciones. Mantuvo rutina de meditación...',
        createdAt: new Date('2026-02-01T11:00:00'),
        updatedAt: new Date('2026-02-01T11:50:00'),
    },
    {
        id: '4',
        patientId: 1,
        patientName: 'Mariana López',
        sessionDate: new Date('2026-01-26T10:00:00'),
        status: 'signed',
        content: 'Paciente reporta mejora en niveles de ansiedad. Continúa con ejercicios de respiración. Menciona entrevista de trabajo próxima que le genera preocupación.',
        excerpt: 'Mejora en niveles de ansiedad. Continúa ejercicios. Preocupación por entrevista...',
        signedAt: new Date('2026-01-26T11:00:00'),
        createdAt: new Date('2026-01-26T10:00:00'),
        updatedAt: new Date('2026-01-26T11:00:00'),
    },
    {
        id: '5',
        patientId: 4,
        patientName: 'Ana García',
        sessionDate: new Date('2026-01-25T14:00:00'),
        status: 'signed',
        content: 'Sesión de cierre de proceso terapéutico. Paciente ha logrado objetivos propuestos. Se acuerda seguimiento en 3 meses.',
        excerpt: 'Cierre de proceso terapéutico. Objetivos logrados. Seguimiento en 3 meses...',
        signedAt: new Date('2026-01-25T15:00:00'),
        createdAt: new Date('2026-01-25T14:00:00'),
        updatedAt: new Date('2026-01-25T15:00:00'),
    },
    {
        id: '6',
        patientId: 1,
        patientName: 'Mariana López',
        sessionDate: new Date('2026-01-19T10:00:00'),
        status: 'signed',
        content: 'Primera sesión enfocada en técnicas de relajación. Paciente receptiva al tratamiento. Se asignan ejercicios de respiración diafragmática.',
        excerpt: 'Técnicas de relajación. Paciente receptiva. Ejercicios respiración diafragmática...',
        signedAt: new Date('2026-01-19T11:00:00'),
        createdAt: new Date('2026-01-19T10:00:00'),
        updatedAt: new Date('2026-01-19T11:00:00'),
    },
];

type OpenWindow = {
    noteId: string;
    position: { x: number; y: number };
    zIndex: number;
};

export default function NotasPage() {
    const [activeTab, setActiveTab] = useState<TabType>('drafts');
    const [searchQuery, setSearchQuery] = useState('');
    const [openWindows, setOpenWindows] = useState<OpenWindow[]>([]);
    const [nextZIndex, setNextZIndex] = useState(100);

    const filteredNotes = useMemo(() => {
        let notes = MOCK_NOTES;

        if (activeTab === 'drafts') {
            notes = notes.filter(n => n.status === 'draft');
        } else if (activeTab === 'signed') {
            notes = notes.filter(n => n.status === 'signed');
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            notes = notes.filter(n =>
                n.patientName.toLowerCase().includes(query) ||
                n.content.toLowerCase().includes(query)
            );
        }

        return notes.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    }, [activeTab, searchQuery]);

    const counts = useMemo(() => ({
        drafts: MOCK_NOTES.filter(n => n.status === 'draft').length,
        signed: MOCK_NOTES.filter(n => n.status === 'signed').length,
        all: MOCK_NOTES.length,
    }), []);

    const handleNoteClick = useCallback((noteId: string) => {
        // Check if window already open
        if (openWindows.some(w => w.noteId === noteId)) {
            // Bring to front
            setOpenWindows(prev =>
                prev.map(w =>
                    w.noteId === noteId
                        ? { ...w, zIndex: nextZIndex }
                        : w
                )
            );
            setNextZIndex(z => z + 1);
            return;
        }

        // Calculate position (stagger windows)
        const offset = openWindows.length * 30;
        const newWindow: OpenWindow = {
            noteId,
            position: { x: 300 + offset, y: 100 + offset },
            zIndex: nextZIndex,
        };

        setOpenWindows(prev => [...prev, newWindow]);
        setNextZIndex(z => z + 1);
    }, [openWindows, nextZIndex]);

    const handleCloseWindow = useCallback((noteId: string) => {
        setOpenWindows(prev => prev.filter(w => w.noteId !== noteId));
    }, []);

    const handleFocusWindow = useCallback((noteId: string) => {
        setOpenWindows(prev =>
            prev.map(w =>
                w.noteId === noteId
                    ? { ...w, zIndex: nextZIndex }
                    : w
            )
        );
        setNextZIndex(z => z + 1);
    }, [nextZIndex]);

    const handleSaveNote = useCallback((noteId: string, content: string) => {
        console.log('Saving note:', noteId, content);
    }, []);

    const handleSignNote = useCallback((noteId: string, content: string) => {
        console.log('Signing note:', noteId, content);
        handleCloseWindow(noteId);
    }, [handleCloseWindow]);

    const getHistoryForPatient = useCallback((patientId: number) => {
        return MOCK_NOTES
            .filter(n => n.patientId === patientId)
            .map(n => ({
                id: n.id,
                date: n.sessionDate.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }),
                excerpt: n.excerpt,
                content: n.content,
            }));
    }, []);

    return (
        <div className="notas-container">
            {/* Header */}
            <header className="notas-header">
                <h1>Tus Notas Clínicas</h1>
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por paciente o contenido..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </header>

            {/* Tabs */}
            <TabFilter
                activeTab={activeTab}
                onTabChange={setActiveTab}
                counts={counts}
            />

            {/* Notes List */}
            <div className="notes-list">
                {filteredNotes.length === 0 ? (
                    <div className="empty-state">
                        <FileText size={48} />
                        <p>
                            {searchQuery
                                ? 'No se encontraron notas con esa búsqueda'
                                : activeTab === 'drafts'
                                    ? '¡No tienes borradores pendientes!'
                                    : 'No hay notas en esta categoría'
                            }
                        </p>
                    </div>
                ) : (
                    filteredNotes.map(note => (
                        <NoteCard
                            key={note.id}
                            note={note}
                            onClick={() => handleNoteClick(note.id)}
                        />
                    ))
                )}
            </div>

            {/* Floating Windows */}
            {openWindows.map(window => {
                const note = MOCK_NOTES.find(n => n.id === window.noteId);
                if (!note) return null;

                return (
                    <FloatingNoteWindow
                        key={window.noteId}
                        note={{
                            id: note.id,
                            patientId: note.patientId,
                            patientName: note.patientName,
                            sessionDate: note.sessionDate.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }),
                            status: note.status,
                            content: note.content,
                        }}
                        history={getHistoryForPatient(note.patientId)}
                        initialPosition={window.position}
                        zIndex={window.zIndex}
                        onClose={() => handleCloseWindow(window.noteId)}
                        onSave={handleSaveNote}
                        onSign={handleSignNote}
                        onOpenNote={handleNoteClick}
                        onFocus={() => handleFocusWindow(window.noteId)}
                    />
                );
            })}
        </div>
    );
}
