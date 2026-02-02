"use client";
import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, User } from 'lucide-react';

type Props = {
    onEndCall: () => void;
};

export function VideoPanel({ onEndCall }: Props) {
    const selfVideoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(true);
    const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Initialize self camera
    useEffect(() => {
        async function initCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });
                if (selfVideoRef.current) {
                    selfVideoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error('Camera error:', err);
            }
        }
        initCamera();

        return () => {
            if (selfVideoRef.current?.srcObject) {
                const stream = selfVideoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Auto-hide controls
    const handleMouseMove = () => {
        setControlsVisible(true);
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
        }
        hideTimeoutRef.current = setTimeout(() => {
            setControlsVisible(false);
        }, 3000);
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        if (selfVideoRef.current?.srcObject) {
            const stream = selfVideoRef.current.srcObject as MediaStream;
            stream.getAudioTracks().forEach(track => {
                track.enabled = isMuted;
            });
        }
    };

    const toggleVideo = () => {
        setIsVideoOff(!isVideoOff);
        if (selfVideoRef.current?.srcObject) {
            const stream = selfVideoRef.current.srcObject as MediaStream;
            stream.getVideoTracks().forEach(track => {
                track.enabled = isVideoOff;
            });
        }
    };

    return (
        <div className="video-panel" onMouseMove={handleMouseMove}>
            {/* Remote video placeholder - will be LiveKit later */}
            <div className="remote-placeholder">
                <User size={80} />
                <span>Esperando al paciente...</span>
            </div>

            {/* Connection status */}
            <div className="connection-status">
                <div className="connection-dot" />
                <span>Conectado</span>
            </div>

            {/* Self video PiP */}
            <div className="self-video-pip">
                <video
                    ref={selfVideoRef}
                    autoPlay
                    playsInline
                    muted
                />
            </div>

            {/* Call controls */}
            <div className={`call-controls ${controlsVisible ? '' : 'hidden'}`}>
                <button
                    className={`control-btn mute ${isMuted ? 'active' : ''}`}
                    onClick={toggleMute}
                    title={isMuted ? 'Activar micrófono' : 'Silenciar'}
                >
                    {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                </button>

                <button
                    className={`control-btn mute ${isVideoOff ? 'active' : ''}`}
                    onClick={toggleVideo}
                    title={isVideoOff ? 'Activar cámara' : 'Apagar cámara'}
                >
                    {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
                </button>

                <button
                    className="control-btn end-call"
                    onClick={onEndCall}
                    title="Finalizar llamada"
                >
                    <PhoneOff size={22} />
                </button>
            </div>
        </div>
    );
}
