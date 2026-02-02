"use client";
import { Clock, Calendar, Lightbulb } from 'lucide-react';

type Patient = {
    id: number;
    name: string;
    reason?: string;
    lastSession?: string;
    flashback?: string;
};

type Props = {
    patient: Patient;
};

export function SessionInfoCard({ patient }: Props) {
    const initials = patient.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="session-info-card">
            <div className="session-info-header">Próxima Sesión</div>

            <div className="patient-info">
                <div className="patient-avatar">{initials}</div>
                <div className="patient-details">
                    <h3>{patient.name}</h3>
                    {patient.reason && <p>{patient.reason}</p>}
                </div>
            </div>

            <div className="session-meta">
                {patient.lastSession && (
                    <div className="meta-item">
                        <Calendar size={16} />
                        <span>Última sesión: {patient.lastSession}</span>
                    </div>
                )}
                <div className="meta-item">
                    <Clock size={16} />
                    <span>Duración: 50 minutos</span>
                </div>
            </div>

            {patient.flashback && (
                <div className="session-flashback">
                    <div className="flashback-label">
                        <Lightbulb size={14} />
                        Recordar
                    </div>
                    <p className="flashback-text">"{patient.flashback}"</p>
                </div>
            )}
        </div>
    );
}
