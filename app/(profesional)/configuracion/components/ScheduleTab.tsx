"use client";
import { useState, useEffect } from 'react';
import { Save, Loader2, DollarSign, Clock } from 'lucide-react';
import { WeekPainter } from './schedule/WeekPainter';
import { SchedulingRules } from './schedule/SchedulingRules';
import { WellnessLimits } from './schedule/WellnessLimits';
import { PatientPreview } from './schedule/PatientPreview';
import '../schedule-styles.css';

type TimeBlock = {
    day_of_week: number;
    start_time: string;
    end_time: string;
};

type SettingsData = {
    mode: 'tetris' | 'flexible';
    default_duration_minutes: number;
    buffer_minutes: number;
    time_increment_minutes: number;
    min_booking_notice_hours: number;
    max_daily_appointments: number | null;
};

const INITIAL_SETTINGS: SettingsData = {
    mode: 'tetris',
    default_duration_minutes: 50,
    buffer_minutes: 10,
    time_increment_minutes: 60,
    min_booking_notice_hours: 24,
    max_daily_appointments: 6,
};

export function ScheduleTab() {
    const [blocks, setBlocks] = useState<TimeBlock[]>([]);
    const [settings, setSettings] = useState<SettingsData>(INITIAL_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // New fields for pricing
    const [sessionPrice, setSessionPrice] = useState(15000);
    const [sessionDuration, setSessionDuration] = useState(50);

    const professionalId = 1; // MVP hardcoded

    useEffect(() => {
        async function loadData() {
            try {
                const scheduleRes = await fetch(`http://localhost:8080/api/v1/schedule?professional_id=${professionalId}`);
                if (scheduleRes.ok) {
                    const data = await scheduleRes.json();
                    if (data && Array.isArray(data)) {
                        setBlocks(data.map((d: unknown) => {
                            const item = d as { day_of_week: number; start_time: string; end_time: string };
                            return {
                                day_of_week: item.day_of_week,
                                start_time: item.start_time,
                                end_time: item.end_time,
                            };
                        }));
                    }
                }

                const settingsRes = await fetch(`http://localhost:8080/api/v1/settings?professional_id=${professionalId}`);
                if (settingsRes.ok) {
                    const data = await settingsRes.json();
                    if (data) {
                        setSettings({
                            mode: data.time_increment_minutes >= 60 ? 'tetris' : 'flexible',
                            default_duration_minutes: data.default_duration_minutes || 50,
                            buffer_minutes: data.buffer_minutes || 0,
                            time_increment_minutes: data.time_increment_minutes || 60,
                            min_booking_notice_hours: data.min_booking_notice_hours || 24,
                            max_daily_appointments: data.max_daily_appointments || null,
                        });
                        setSessionDuration(data.default_duration_minutes || 50);
                    }
                }
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const handleBlocksChange = (newBlocks: TimeBlock[]) => {
        setBlocks(newBlocks);
        setHasChanges(true);
    };

    const handleSettingsChange = (newSettings: SettingsData) => {
        setSettings(newSettings);
        setHasChanges(true);
    };

    const handleMaxDailyChange = (value: number | null) => {
        setSettings(prev => ({ ...prev, max_daily_appointments: value }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch('http://localhost:8080/api/v1/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    professional_id: professionalId,
                    blocks: blocks,
                }),
            });

            await fetch('http://localhost:8080/api/v1/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    professional_id: professionalId,
                    default_duration_minutes: settings.default_duration_minutes,
                    buffer_minutes: settings.buffer_minutes,
                    time_increment_minutes: settings.time_increment_minutes,
                    min_booking_notice_hours: settings.min_booking_notice_hours,
                    max_daily_appointments: settings.max_daily_appointments,
                }),
            });

            setHasChanges(false);
        } catch (error) {
            console.error('Error saving:', error);
            alert('Error al guardar. Intenta de nuevo.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="tab-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
            </div>
        );
    }

    return (
        <div className="tab-content schedule-tab">
            <header className="tab-header">
                <h1>Agenda y Horarios</h1>
                <p>Configura cómo los pacientes pueden agendar contigo</p>
            </header>

            <div className="form-sections">
                {/* Pricing Section - NEW */}
                <section className="form-section">
                    <h3>Duración y Costos</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>
                                <Clock size={14} />
                                Duración de Sesión
                            </label>
                            <div className="input-with-suffix">
                                <input
                                    type="number"
                                    value={sessionDuration}
                                    onChange={(e) => {
                                        setSessionDuration(parseInt(e.target.value) || 50);
                                        setHasChanges(true);
                                    }}
                                    min={15}
                                    max={120}
                                    step={5}
                                />
                                <span className="suffix">minutos</span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>
                                <DollarSign size={14} />
                                Precio Base
                            </label>
                            <div className="input-with-prefix">
                                <span className="prefix">$</span>
                                <input
                                    type="number"
                                    value={sessionPrice}
                                    onChange={(e) => {
                                        setSessionPrice(parseInt(e.target.value) || 0);
                                        setHasChanges(true);
                                    }}
                                    min={0}
                                    step={500}
                                />
                            </div>
                            <span className="form-hint">Este valor se usará para pre-llenar órdenes de pago</span>
                        </div>
                    </div>
                </section>

                {/* Existing Schedule Components */}
                <div className="schedule-content">
                    <div className="schedule-controls">
                        <WeekPainter
                            blocks={blocks}
                            onChange={handleBlocksChange}
                        />

                        <SchedulingRules
                            settings={settings}
                            onChange={handleSettingsChange}
                        />

                        <WellnessLimits
                            maxDaily={settings.max_daily_appointments}
                            onChange={handleMaxDailyChange}
                        />
                    </div>

                    <PatientPreview
                        blocks={blocks}
                        settings={settings}
                    />
                </div>

                {/* Save Button */}
                <div className="form-actions">
                    <button
                        className="save-btn"
                        onClick={handleSave}
                        disabled={saving || !hasChanges}
                    >
                        {saving ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Guardar Cambios
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
