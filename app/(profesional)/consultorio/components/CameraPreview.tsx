"use client";
import { useEffect, useRef, useState, useCallback } from 'react';
import { VideoOff } from 'lucide-react';

type Props = {
    onStreamReady?: (stream: MediaStream) => void;
    isVideoOff?: boolean;
};

export function CameraPreview({ onStreamReady, isVideoOff }: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Stable callback ref to avoid re-running effect
    const onStreamReadyRef = useRef(onStreamReady);
    onStreamReadyRef.current = onStreamReady;

    const stopAllTracks = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
                track.stop();
            });
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        async function initCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 640, height: 480, facingMode: 'user' },
                    audio: true,
                });

                if (!isMounted) {
                    // Component unmounted before we got the stream
                    stream.getTracks().forEach(track => track.stop());
                    return;
                }

                streamRef.current = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }

                setHasPermission(true);
                onStreamReadyRef.current?.(stream);
            } catch (err) {
                console.error('Camera access error:', err);
                if (isMounted) {
                    setHasPermission(false);
                    setError('No se pudo acceder a la cámara');
                }
            }
        }

        initCamera();

        return () => {
            isMounted = false;
            stopAllTracks();
        };
    }, [stopAllTracks]);

    // Also stop tracks when page becomes hidden (user switches tabs/navigates)
    useEffect(() => {
        const handleVisibilityChange = () => {
            // Only stop if navigating away (not just tab switch)
            if (document.visibilityState === 'hidden') {
                // We'll let the unmount handle this
            }
        };

        const handleBeforeUnload = () => {
            stopAllTracks();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [stopAllTracks]);

    return (
        <div className="camera-preview-container">
            {hasPermission === false ? (
                <div className="camera-placeholder">
                    <span>{error || 'Cámara no disponible'}</span>
                </div>
            ) : isVideoOff ? (
                <div className="camera-placeholder">
                    <VideoOff size={48} />
                    <span>Cámara apagada</span>
                </div>
            ) : (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="camera-preview"
                />
            )}
        </div>
    );
}
