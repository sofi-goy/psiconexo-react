"use client";
import { VideoPanel } from './VideoPanel';
import { ClinicalPanel } from './ClinicalPanel';

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
    onEndCall: () => void;
    onNoteChange?: (content: string, isPrivate: boolean) => void;
};

export function ActiveSessionView({
    patient,
    sessionObjective,
    pastSessions = [],
    onEndCall,
    onNoteChange
}: Props) {
    return (
        <div className="active-session">
            <VideoPanel onEndCall={onEndCall} />
            <ClinicalPanel
                patient={patient}
                sessionObjective={sessionObjective}
                pastSessions={pastSessions}
                onNoteChange={onNoteChange}
            />
        </div>
    );
}
