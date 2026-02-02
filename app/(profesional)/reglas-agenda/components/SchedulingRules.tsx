"use client";
import { Sliders, Clock, Coffee, CalendarClock } from 'lucide-react';

type Settings = {
    mode: 'tetris' | 'flexible';
    default_duration_minutes: number;
    buffer_minutes: number;
    time_increment_minutes: number;
    min_booking_notice_hours: number;
    max_daily_appointments: number | null;
};

type Props = {
    settings: Settings;
    onChange: (settings: Settings) => void;
};

export function SchedulingRules({ settings, onChange }: Props) {
    const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
        onChange({ ...settings, [key]: value });
    };

    return (
        <div className="agenda-card">
            <div className="agenda-card-header">
                <Sliders size={20} />
                <h3>Reglas de Agendamiento</h3>
            </div>

            {/* Time Increment Dropdown */}
            <div className="rule-group">
                <div className="rule-label">
                    <Clock size={14} />
                    Mostrar horarios de inicio cada
                </div>
                <select
                    className="rule-select"
                    value={settings.time_increment_minutes}
                    onChange={(e) => {
                        const val = Number(e.target.value);
                        onChange({
                            ...settings,
                            time_increment_minutes: val,
                            mode: val >= 60 ? 'tetris' : 'flexible'
                        });
                    }}
                >
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={60}>60 minutos (cada hora)</option>
                </select>
            </div>

            {/* Session Duration */}
            <div className="rule-group">
                <div className="rule-label">
                    <Clock size={14} />
                    Duración de sesión
                </div>
                <div className="slider-group">
                    <input
                        type="range"
                        className="slider-input"
                        min="30"
                        max="120"
                        step="5"
                        value={settings.default_duration_minutes}
                        onChange={(e) => updateSetting('default_duration_minutes', Number(e.target.value))}
                    />
                    <div className="slider-value">{settings.default_duration_minutes} min</div>
                </div>
            </div>

            {/* Buffer Between Sessions */}
            <div className="rule-group">
                <div className="rule-label">
                    <Coffee size={14} />
                    Descanso entre sesiones
                </div>
                <div className="slider-group">
                    <input
                        type="range"
                        className="slider-input"
                        min="0"
                        max="30"
                        step="5"
                        value={settings.buffer_minutes}
                        onChange={(e) => updateSetting('buffer_minutes', Number(e.target.value))}
                    />
                    <div className="slider-value">{settings.buffer_minutes} min</div>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                    Tiempo para notas y preparación mental
                </p>
            </div>

            {/* Minimum Booking Notice */}
            <div className="rule-group">
                <div className="rule-label">
                    <CalendarClock size={14} />
                    Anticipación mínima
                </div>
                <select
                    className="rule-select"
                    value={settings.min_booking_notice_hours}
                    onChange={(e) => updateSetting('min_booking_notice_hours', Number(e.target.value))}
                >
                    <option value={2}>2 horas antes</option>
                    <option value={12}>12 horas antes</option>
                    <option value={24}>24 horas antes</option>
                    <option value={48}>48 horas antes (2 días)</option>
                    <option value={72}>72 horas antes (3 días)</option>
                </select>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                    Nadie podrá agendar con menos tiempo de anticipación
                </p>
            </div>
        </div>
    );
}
