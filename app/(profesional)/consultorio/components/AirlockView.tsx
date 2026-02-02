"use client";
import { useState, useCallback, useEffect } from 'react';
import { ArrowRight, FileText, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { CameraPreview } from './CameraPreview';
import { AudioLevelMeter } from './AudioLevelMeter';
import { SessionInfoCard } from './SessionInfoCard';

type Patient = {
    id: number;
    name: string;
    reason?: string;
    lastSession?: string;
    flashback?: string;
};

type Props = {
    patient: Patient;
    onJoin: () => void;
    onNotesOnly: () => void;
};

export function AirlockView({ patient, onJoin, onNotesOnly }: Props) {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    // Cleanup stream when component unmounts (navigating away)
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    const handleStreamReady = useCallback((newStream: MediaStream) => {
        setStream(newStream);
    }, []);

    const toggleMute = useCallback(() => {
        if (stream) {
            stream.getAudioTracks().forEach(track => {
                track.enabled = isMuted;
            });
        }
        setIsMuted(!isMuted);
    }, [stream, isMuted]);

    const toggleVideo = useCallback(() => {
        if (stream) {
            stream.getVideoTracks().forEach(track => {
                track.enabled = isVideoOff;
            });
        }
        setIsVideoOff(!isVideoOff);
    }, [stream, isVideoOff]);

    return (
        <div className="airlock">
            <div className="airlock-left">
                <div className="airlock-title">
                    <h2>Sala de preparación</h2>
                    <p>Vista previa del psicólogo</p>
                </div>

                <CameraPreview onStreamReady={handleStreamReady} isVideoOff={isVideoOff} />

                {/* Media controls row */}
                <div className="media-controls-row">
                    <AudioLevelMeter stream={stream} />

                    <button
                        className={`media-toggle-btn ${isMuted ? 'off' : ''}`}
                        onClick={toggleMute}
                        title={isMuted ? 'Activar micrófono' : 'Silenciar'}
                    >
                        {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>

                    <button
                        className={`media-toggle-btn ${isVideoOff ? 'off' : ''}`}
                        onClick={toggleVideo}
                        title={isVideoOff ? 'Activar cámara' : 'Apagar cámara'}
                    >
                        {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                    </button>
                </div>
            </div>

            <div className="airlock-right">
                <SessionInfoCard patient={patient} />

                <div className="airlock-actions">
                    <button className="join-button" onClick={onJoin}>
                        <span>Estoy listo / Unirse</span>
                        <ArrowRight size={20} />
                    </button>

                    <button className="notes-only-button" onClick={onNotesOnly}>
                        <FileText size={18} />
                        <span>Acceder solo a Notas e Historial</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
