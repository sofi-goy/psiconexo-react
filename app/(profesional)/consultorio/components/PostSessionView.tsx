"use client";
import { useState, useEffect } from 'react';
import { FileEdit, Check, Calendar, Loader2 } from 'lucide-react';

type Patient = {
    id: number;
    name: string;
};

type Props = {
    patient: Patient;
    initialNote: string;
    onSave: (note: string, signed: boolean) => void;
    onScheduleNext: () => void;
    onBack: () => void;
};

export function PostSessionView({ patient, initialNote, onSave, onScheduleNext, onBack }: Props) {
    const [note, setNote] = useState(initialNote);
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveOpen = () => {
        onSave(note, false);
        onBack();
    };

    const handleSignAndSave = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 800));
        onSave(note, true);
        setIsSaving(false);
        onBack();
    };

    return (
        <div className="post-session">
            <div className="post-session-header">
                <h2>Sesión con {patient.name} finalizada</h2>
                <p>¿Deseas agregar algo más antes de cerrar la nota?</p>
            </div>

            <div className="post-session-editor">
                <div className="post-editor-header">
                    <div className="post-editor-title">
                        <FileEdit size={18} style={{ marginRight: 8, display: 'inline' }} />
                        Nota de sesión
                    </div>
                </div>
                <textarea
                    className="post-editor-textarea"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Continúa escribiendo o revisa tus notas..."
                    autoFocus
                />
            </div>

            <div className="post-session-actions">
                <button className="post-btn secondary" onClick={handleSaveOpen}>
                    Dejar abierta
                </button>
                <button
                    className="post-btn primary"
                    onClick={handleSignAndSave}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Guardando...
                        </>
                    ) : (
                        <>
                            <Check size={18} />
                            Firmar y Guardar
                        </>
                    )}
                </button>
                <button className="post-btn schedule" onClick={onScheduleNext}>
                    <Calendar size={18} />
                    Agendar próxima
                </button>
            </div>
        </div>
    );
}
