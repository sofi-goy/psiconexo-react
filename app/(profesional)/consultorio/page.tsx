"use client";
import { useState, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { AirlockView } from './components/AirlockView';
import { ActiveSessionView } from './components/ActiveSessionView';
import { PostSessionView } from './components/PostSessionView';
import { ClinicalPanel } from './components/ClinicalPanel';
import './styles.css';

type Phase = 'airlock' | 'active' | 'notes-only' | 'post';

const MOCK_PATIENT = {
    id: 1,
    name: 'Mariana López',
    reason: 'Ansiedad generalizada',
    lastSession: 'hace 7 días',
    flashback: 'Preguntar por la entrevista de trabajo',
    email: 'mariana.lopez@email.com',
    phone: '+54 9 11 5678-1234',
    birthDate: '15 de Marzo',
    medication: 'Ninguna actualmente',
    emergencyContact: 'Juan López (hermano) - 11 8765-4321',
};

const MOCK_PAST_SESSIONS = [
    { id: 1, date: 'Hace 7 días - 24 Ene 2026', summary: 'Paciente reporta mejora en niveles de ansiedad. Continúa con ejercicios de respiración. Menciona entrevista de trabajo próxima.' },
    { id: 2, date: 'Hace 14 días - 17 Ene 2026', summary: 'Primera sesión enfocada en técnicas de relajación. Paciente receptiva al tratamiento.' },
    { id: 3, date: 'Hace 21 días - 10 Ene 2026', summary: 'Evaluación inicial. Diagnóstico: TAG leve. Plan de tratamiento establecido.' },
];

export default function ConsultorioPage() {
    const [phase, setPhase] = useState<Phase>('airlock');
    const [sessionNote, setSessionNote] = useState('');

    const handleJoin = useCallback(() => {
        setPhase('active');
    }, []);

    const handleNotesOnly = useCallback(() => {
        setPhase('notes-only');
    }, []);

    const handleEndCall = useCallback(() => {
        setPhase('post');
    }, []);

    const handleEndNotesSession = useCallback(() => {
        setPhase('post');
    }, []);

    const handleNoteChange = useCallback((content: string, isPrivate: boolean) => {
        if (!isPrivate) {
            setSessionNote(content);
        }
    }, []);

    const handleSaveNote = useCallback((note: string, signed: boolean) => {
        console.log('Saving note:', { note, signed });
    }, []);

    const handleScheduleNext = useCallback(() => {
        window.location.href = '/?patient=' + MOCK_PATIENT.id;
    }, []);

    const handleBack = useCallback(() => {
        setPhase('airlock');
        setSessionNote('');
    }, []);

    const getHeaderTitle = () => {
        switch (phase) {
            case 'airlock': return 'Pre-sesión';
            case 'active': return 'Sesión en curso';
            case 'notes-only': return 'Sesión presencial';
            case 'post': return 'Cierre de sesión';
        }
    };

    return (
        <div className="consultorio-container">
            <header className="consultorio-header">
                <div className="header-left">
                    <Link href="/" className="back-btn">
                        <ArrowLeft size={18} />
                        Volver
                    </Link>
                    <h1>Consultorio Digital - {getHeaderTitle()}</h1>
                </div>
            </header>

            {phase === 'airlock' && (
                <AirlockView
                    patient={MOCK_PATIENT}
                    onJoin={handleJoin}
                    onNotesOnly={handleNotesOnly}
                />
            )}

            {phase === 'active' && (
                <ActiveSessionView
                    patient={MOCK_PATIENT}
                    sessionObjective="Revisar técnicas de respiración y progreso con ansiedad"
                    pastSessions={MOCK_PAST_SESSIONS}
                    onEndCall={handleEndCall}
                    onNoteChange={handleNoteChange}
                />
            )}

            {phase === 'notes-only' && (
                <div className="notes-only-session">
                    <div className="notes-only-header">
                        <h2>Sesión presencial con {MOCK_PATIENT.name}</h2>
                        <button className="end-notes-btn" onClick={handleEndNotesSession}>
                            Finalizar sesión
                        </button>
                    </div>
                    <ClinicalPanel
                        patient={MOCK_PATIENT}
                        sessionObjective="Revisar técnicas de respiración y progreso con ansiedad"
                        pastSessions={MOCK_PAST_SESSIONS}
                        onNoteChange={handleNoteChange}
                    />
                </div>
            )}

            {phase === 'post' && (
                <PostSessionView
                    patient={MOCK_PATIENT}
                    initialNote={sessionNote}
                    onSave={handleSaveNote}
                    onScheduleNext={handleScheduleNext}
                    onBack={handleBack}
                />
            )}
        </div>
    );
}
