"use client";
import { useState, useEffect, useCallback } from 'react';
import { FileText, Clock, User, Lightbulb, Check, Lock, Loader2 } from 'lucide-react';

type Patient = {
    id: number;
    name: string;
    reason?: string;
    email?: string;
    phone?: string;
    birthDate?: string;
    medication?: string;
    emergencyContact?: string;
};

type SessionNote = {
    id: number;
    date: string;
    summary: string;
};

type Props = {
    patient: Patient;
    sessionObjective?: string;
    pastSessions?: SessionNote[];
    onNoteChange?: (content: string, isPrivate: boolean) => void;
};

export function ClinicalPanel({ patient, sessionObjective, pastSessions = [], onNoteChange }: Props) {
    const [activeTab, setActiveTab] = useState<'nota' | 'historial' | 'info'>('nota');
    const [noteContent, setNoteContent] = useState('');
    const [isPrivateNote, setIsPrivateNote] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');

    useEffect(() => {
        if (!noteContent) return;

        setSaveStatus('saving');
        const timeout = setTimeout(() => {
            setSaveStatus('saved');
            onNoteChange?.(noteContent, isPrivateNote);
        }, 1500);

        return () => clearTimeout(timeout);
    }, [noteContent, isPrivateNote, onNoteChange]);

    const handleNoteChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNoteContent(e.target.value);
        setSaveStatus('idle');
    }, []);

    return (
        <div className="clinical-panel">
            <div className="panel-tabs">
                <button
                    className={`panel-tab ${activeTab === 'nota' ? 'active' : ''}`}
                    onClick={() => setActiveTab('nota')}
                >
                    <FileText size={16} />
                    Nota
                </button>
                <button
                    className={`panel-tab ${activeTab === 'historial' ? 'active' : ''}`}
                    onClick={() => setActiveTab('historial')}
                >
                    <Clock size={16} />
                    Historial
                </button>
                <button
                    className={`panel-tab ${activeTab === 'info' ? 'active' : ''}`}
                    onClick={() => setActiveTab('info')}
                >
                    <User size={16} />
                    Info
                </button>
            </div>

            <div className="panel-content">
                {activeTab === 'nota' && (
                    <div className="note-editor">
                        {sessionObjective && (
                            <div className="session-objective">
                                <div className="objective-label">
                                    <Lightbulb size={14} />
                                    Objetivo de hoy
                                </div>
                                <p className="objective-text">{sessionObjective}</p>
                            </div>
                        )}

                        <div className="note-type-toggle">
                            <button
                                className={`note-type-btn ${!isPrivateNote ? 'active' : ''}`}
                                onClick={() => setIsPrivateNote(false)}
                            >
                                <FileText size={14} />
                                Nota Clínica
                            </button>
                            <button
                                className={`note-type-btn private ${isPrivateNote ? 'active' : ''}`}
                                onClick={() => setIsPrivateNote(true)}
                            >
                                <Lock size={14} />
                                Bitácora Personal
                            </button>
                        </div>

                        <textarea
                            className="note-textarea"
                            value={noteContent}
                            onChange={handleNoteChange}
                            placeholder={isPrivateNote
                                ? "Notas personales (privadas, no exportables)..."
                                : "Escribe tus notas de la sesión..."
                            }
                        />

                        {saveStatus !== 'idle' && (
                            <div className={`save-status ${saveStatus}`}>
                                {saveStatus === 'saving' ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Check size={14} />
                                        Guardado
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'historial' && (
                    <div className="session-history">
                        <div className="history-timeline">
                            {pastSessions.length === 0 ? (
                                <div style={{ padding: 20, textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                    Primera sesión con este paciente
                                </div>
                            ) : (
                                pastSessions.map(session => (
                                    <div key={session.id} className="history-item">
                                        <div className="history-date">{session.date}</div>
                                        <div className="history-summary">{session.summary}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'info' && (
                    <div className="patient-info-panel">
                        <div className="info-section">
                            <div className="info-section-title">Datos de contacto</div>
                            {patient.email && (
                                <div className="info-row">
                                    <span className="info-label">Email</span>
                                    <span className="info-value">{patient.email}</span>
                                </div>
                            )}
                            {patient.phone && (
                                <div className="info-row">
                                    <span className="info-label">Teléfono</span>
                                    <span className="info-value">{patient.phone}</span>
                                </div>
                            )}
                            {patient.birthDate && (
                                <div className="info-row">
                                    <span className="info-label">Cumpleaños</span>
                                    <span className="info-value">{patient.birthDate}</span>
                                </div>
                            )}
                        </div>

                        {(patient.medication || patient.emergencyContact) && (
                            <div className="info-section">
                                <div className="info-section-title">Información clínica</div>
                                {patient.medication && (
                                    <div className="info-row">
                                        <span className="info-label">Medicación</span>
                                        <span className="info-value">{patient.medication}</span>
                                    </div>
                                )}
                                {patient.emergencyContact && (
                                    <div className="info-row">
                                        <span className="info-label">Emergencia</span>
                                        <span className="info-value">{patient.emergencyContact}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
