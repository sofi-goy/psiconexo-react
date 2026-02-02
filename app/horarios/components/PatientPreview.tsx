"use client";
import { useMemo } from 'react';
import { Eye } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

type TimeBlock = {
    day_of_week: number;
    start_time: string;
    end_time: string;
};

type Settings = {
    mode: 'tetris' | 'flexible';
    default_duration_minutes: number;
    buffer_minutes: number;
    time_increment_minutes: number;
};

type Props = {
    blocks: TimeBlock[];
    settings: Settings;
};

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export function PatientPreview({ blocks, settings }: Props) {
    // Find first available block for preview
    const previewBlock = useMemo(() => {
        const sorted = [...blocks].sort((a, b) => a.day_of_week - b.day_of_week);
        return sorted[0] || null;
    }, [blocks]);

    // Generate slots based on settings
    const slots = useMemo(() => {
        if (!previewBlock) return [];

        const { start_time, end_time } = previewBlock;
        const [startH, startM] = start_time.split(':').map(Number);
        const [endH, endM] = end_time.split(':').map(Number);

        const startMinutes = startH * 60 + (startM || 0);
        const endMinutes = endH * 60 + (endM || 0);

        const increment = settings.mode === 'tetris' ? 60 : settings.time_increment_minutes;

        const generatedSlots: string[] = [];
        let current = startMinutes;

        // For tetris mode, align to hour boundaries
        if (settings.mode === 'tetris') {
            current = Math.ceil(startMinutes / 60) * 60;
        }

        while (current + settings.default_duration_minutes <= endMinutes) {
            const hours = Math.floor(current / 60);
            const mins = current % 60;
            generatedSlots.push(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);
            current += increment;
        }

        return generatedSlots.slice(0, 8); // Limit to 8 slots for preview
    }, [previewBlock, settings]);

    // Get the date of first enabled day this week
    const previewDate = useMemo(() => {
        if (!previewBlock) return null;
        const today = new Date();
        const weekStart = startOfWeek(today, { weekStartsOn: 1 });
        // day_of_week: 1=Mon, 7=Sun, but startOfWeek with weekStartsOn:1 means Mon=0
        const dayOffset = previewBlock.day_of_week === 7 ? 6 : previewBlock.day_of_week - 1;
        return addDays(weekStart, dayOffset);
    }, [previewBlock]);

    return (
        <div className="patient-preview">
            <div className="preview-header">
                <Eye size={16} />
                <h4>Vista del Paciente</h4>
            </div>

            <div className="preview-device">
                {previewBlock && previewDate ? (
                    <>
                        <div className="preview-date">
                            {format(previewDate, "EEEE d 'de' MMMM", { locale: es })}
                        </div>

                        <div className="preview-slots">
                            {slots.length > 0 ? (
                                slots.map((slot, i) => (
                                    <div key={i} className="preview-slot">
                                        <span className="slot-dot" />
                                        {slot}
                                    </div>
                                ))
                            ) : (
                                <div className="preview-empty">
                                    No hay turnos disponibles con esta configuración
                                </div>
                            )}
                        </div>

                        {slots.length >= 8 && (
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '8px', textAlign: 'center' }}>
                                + más horarios...
                            </p>
                        )}
                    </>
                ) : (
                    <div className="preview-empty">
                        Pinta bloques de disponibilidad para ver la vista previa
                    </div>
                )}
            </div>

            <p style={{
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)',
                marginTop: '12px',
                textAlign: 'center'
            }}>
                {settings.mode === 'tetris'
                    ? 'Modo Ordenado: turnos cada hora en punto'
                    : `Modo Abierto: turnos cada ${settings.time_increment_minutes} min`}
            </p>
        </div>
    );
}
