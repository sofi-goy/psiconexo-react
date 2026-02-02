"use client";
import { useEffect, useRef, useState } from 'react';
import { VideoOff } from 'lucide-react';

type Props = {
    onStreamReady?: (stream: MediaStream) => void;
    isVideoOff?: boolean;
};

export function CameraPreview({ onStreamReady, isVideoOff }: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function initCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 640, height: 480, facingMode: 'user' },
                    audio: true,
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }

                setHasPermission(true);
                onStreamReady?.(stream);
            } catch (err) {
                console.error('Camera access error:', err);
                setHasPermission(false);
                setError('No se pudo acceder a la cámara');
            }
        }

        initCamera();

        return () => {
            if (videoRef.current?.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [onStreamReady]);

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
