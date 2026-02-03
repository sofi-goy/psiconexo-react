"use client";
import { useState, useEffect } from 'react';
import { FileText, AlertTriangle, Pencil } from 'lucide-react';

export type NoteStatus = 'draft' | 'signed';

export type ClinicalNote = {
    id: string;
    patientId: number;
    patientName: string;
    sessionDate: Date;
    status: NoteStatus;
    content: string;
    excerpt: string;
    signedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
};

type Props = {
    note: ClinicalNote;
    onClick: () => void;
};

function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Hace unos minutos';
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
}

function formatSessionDate(date: Date): string {
    return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

export function NoteCard({ note, onClick }: Props) {
    // Use state to avoid hydration mismatch - time is calculated only on client
    const [relativeTime, setRelativeTime] = useState('');
    const [showWarning, setShowWarning] = useState(false);

    const sessionDateStr = formatSessionDate(note.sessionDate);

    useEffect(() => {
        // Calculate on client only to avoid hydration mismatch
        setRelativeTime(formatRelativeTime(note.updatedAt));

        const hoursSinceUpdate = (Date.now() - note.updatedAt.getTime()) / (1000 * 60 * 60);
        setShowWarning(note.status === 'draft' && hoursSinceUpdate > 24);
    }, [note.updatedAt, note.status]);

    return (
        <div className="note-card" onClick={onClick}>
            <div className="note-card-left">
                <div className={`note-status ${note.status}`} />
                <div className="note-content">
                    <div className="note-patient">
                        <h3>{note.patientName}</h3>
                        <span className="note-date" suppressHydrationWarning>
                            {relativeTime || '...'}
                        </span>
                    </div>
                    <p className="note-session-info">
                        Sesión del {sessionDateStr} - {note.status === 'draft' ? 'Borrador' : 'Firmada'}
                    </p>
                    <p className="note-excerpt">"{note.excerpt}"</p>

                    {showWarning && (
                        <div className="note-warning">
                            <AlertTriangle size={14} />
                            Sin firmar hace más de 24hs
                        </div>
                    )}
                </div>
            </div>

            <div className="note-card-right">
                <button className="continue-btn" onClick={(e) => { e.stopPropagation(); onClick(); }}>
                    {note.status === 'draft' ? (
                        <>
                            <Pencil size={16} />
                            Continuar escribiendo
                        </>
                    ) : (
                        <>
                            <FileText size={16} />
                            Ver nota
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

