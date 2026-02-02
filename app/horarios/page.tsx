"use client";
import { useState, useEffect } from "react";
import { Sidebar } from "../components/Sidebar";
import { WeekPainter } from "./components/WeekPainter";
import { SchedulingRules } from "./components/SchedulingRules";
import { WellnessLimits } from "./components/WellnessLimits";
import { PatientPreview } from "./components/PatientPreview";
import { Save, Loader2 } from "lucide-react";
import './agenda-rules.css';

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

export default function AgendaRulesPage() {
  const [blocks, setBlocks] = useState<TimeBlock[]>([]);
  const [settings, setSettings] = useState<SettingsData>(INITIAL_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const professionalId = 1; // MVP hardcoded

  // Load existing data
  useEffect(() => {
    async function loadData() {
      try {
        // Load schedule blocks
        const scheduleRes = await fetch(`http://localhost:8080/api/v1/schedule?professional_id=${professionalId}`);
        if (scheduleRes.ok) {
          const data = await scheduleRes.json();
          if (data && Array.isArray(data)) {
            setBlocks(data.map((d: any) => ({
              day_of_week: d.day_of_week,
              start_time: d.start_time,
              end_time: d.end_time,
            })));
          }
        }

        // Load settings
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
      // Save schedule
      await fetch('http://localhost:8080/api/v1/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professional_id: professionalId,
          blocks: blocks,
        }),
      });

      // Save settings
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
      <div className="agenda-rules-page">
        <Sidebar />
        <main className="agenda-rules-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
        </main>
      </div>
    );
  }

  return (
    <div className="agenda-rules-page">
      <Sidebar />

      <main className="agenda-rules-main">
        <header className="agenda-header">
          <h1>
            Reglas de Agenda
          </h1>
          <p>Configura cómo los pacientes pueden agendar contigo</p>
        </header>

        <div className="agenda-content">
          {/* Left Column: Controls */}
          <div className="agenda-controls">
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

          {/* Right Column: Preview */}
          <PatientPreview
            blocks={blocks}
            settings={settings}
          />
        </div>

        {/* Save Button */}
        <button
          className="save-button"
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
      </main>
    </div>
  );
}