"use client";
import { Heart } from 'lucide-react';

type Props = {
    maxDaily: number | null;
    onChange: (value: number | null) => void;
};

export function WellnessLimits({ maxDaily, onChange }: Props) {
    const handleChange = (value: string) => {
        const num = parseInt(value, 10);
        onChange(isNaN(num) || num <= 0 ? null : num);
    };

    return (
        <div className="agenda-card">
            <div className="agenda-card-header">
                <Heart size={20} />
                <h3>Límites de Bienestar</h3>
            </div>

            <div className="rule-group">
                <div className="rule-label">
                    Máximo de pacientes por día
                </div>
                <div className="wellness-input-group">
                    <input
                        type="number"
                        className="wellness-input"
                        value={maxDaily ?? ''}
                        onChange={(e) => handleChange(e.target.value)}
                        placeholder="∞"
                        min="1"
                        max="20"
                    />
                    <span className="wellness-hint">
                        {maxDaily
                            ? `El día se bloquea después de ${maxDaily} citas`
                            : 'Sin límite (no recomendado)'}
                    </span>
                </div>
            </div>

            <p style={{
                fontSize: '0.8rem',
                color: 'var(--color-text-muted)',
                marginTop: '12px',
                padding: '12px',
                background: 'var(--color-bg)',
                borderRadius: 'var(--radius-md)',
                lineHeight: 1.5
            }}>
                Protege tu salud mental. Aunque tengas huecos libres, el sistema bloqueará nuevas citas cuando alcances este límite.
            </p>
        </div>
    );
}
