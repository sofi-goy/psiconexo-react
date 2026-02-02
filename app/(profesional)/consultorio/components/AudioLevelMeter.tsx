"use client";
import { useEffect, useState } from 'react';
import { Mic } from 'lucide-react';

type Props = {
    stream?: MediaStream | null;
};

export function AudioLevelMeter({ stream }: Props) {
    const [levels, setLevels] = useState<number[]>([2, 4, 6, 8, 6, 4, 2]);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        if (!stream) return;

        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);

        analyser.fftSize = 32;
        microphone.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        let animationId: number;

        function updateLevels() {
            analyser.getByteFrequencyData(dataArray);

            // Get average volume
            const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
            setIsActive(average > 10);

            // Generate bar heights based on frequency data
            const newLevels = Array.from({ length: 7 }, (_, i) => {
                const idx = Math.floor((i / 7) * dataArray.length);
                return Math.max(4, Math.min(24, dataArray[idx] / 10));
            });

            setLevels(newLevels);
            animationId = requestAnimationFrame(updateLevels);
        }

        updateLevels();

        return () => {
            cancelAnimationFrame(animationId);
            audioContext.close();
        };
    }, [stream]);

    return (
        <div className="audio-meter">
            <Mic size={20} className="audio-meter-icon" />
            <div className="audio-bars">
                {levels.map((height, i) => (
                    <div
                        key={i}
                        className="audio-bar"
                        style={{ height: `${height}px` }}
                    />
                ))}
            </div>
            <span className="audio-status">
                {isActive ? 'Micrófono detectado' : 'Habla para probar'}
            </span>
        </div>
    );
}
