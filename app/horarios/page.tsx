"use client";
import { useState, useEffect } from "react";
import { Sidebar } from "../components/Sidebar";
import { Plus, Trash2, Save, Clock } from "lucide-react";
import './horarios.css';

type TimeBlock = {
  start_time: string;
  end_time: string;
};

type DaySchedule = {
  day_of_week: number;
  label: string;
  enabled: boolean;
  blocks: TimeBlock[];
};

const INITIAL_DAYS: DaySchedule[] = [
  { day_of_week: 1, label: "Lunes", enabled: false, blocks: [] },
  { day_of_week: 2, label: "Martes", enabled: false, blocks: [] },
  { day_of_week: 3, label: "Miércoles", enabled: false, blocks: [] },
  { day_of_week: 4, label: "Jueves", enabled: false, blocks: [] },
  { day_of_week: 5, label: "Viernes", enabled: false, blocks: [] },
  { day_of_week: 6, label: "Sábado", enabled: false, blocks: [] },
  { day_of_week: 7, label: "Domingo", enabled: false, blocks: [] },
];

export default function HorariosPage() {
  const [schedule, setSchedule] = useState<DaySchedule[]>(INITIAL_DAYS);
  const [loading, setLoading] = useState(true);
  const professionalId = 1; // Hardcodeado para MVP

  useEffect(() => {
    async function loadSchedule() {
      try {
        const res = await fetch(`http://localhost:8080/api/v1/schedule?professional_id=${professionalId}`);
        if (res.ok) {
          const data = await res.json();
          const newSchedule = INITIAL_DAYS.map(day => {
            const dayBlocks = data.filter((b: any) => b.day_of_week === day.day_of_week);
            return {
              ...day,
              enabled: dayBlocks.length > 0,
              blocks: dayBlocks.length > 0 ? dayBlocks : [{ start_time: "09:00", end_time: "17:00" }]
            };
          });
          setSchedule(newSchedule);
        }
      } catch (error) {
        console.error("Error cargando horarios:", error);
      } finally {
        setLoading(false);
      }
    }
    loadSchedule();
  }, []);

  const toggleDay = (dayIndex: number) => {
    const newSchedule = [...schedule];
    const day = newSchedule[dayIndex];
    day.enabled = !day.enabled;

    if (day.enabled && day.blocks.length === 0) {
      day.blocks.push({ start_time: "09:00", end_time: "17:00" });
    }
    setSchedule(newSchedule);
  };

  const addBlock = (dayIndex: number) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].blocks.push({ start_time: "14:00", end_time: "18:00" });
    setSchedule(newSchedule);
  };

  const removeBlock = (dayIndex: number, blockIndex: number) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].blocks.splice(blockIndex, 1);
    setSchedule(newSchedule);
  };

  const updateTime = (dayIndex: number, blockIndex: number, field: 'start_time' | 'end_time', value: string) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].blocks[blockIndex][field] = value;
    setSchedule(newSchedule);
  };

  const handleSave = async () => {
    const flatBlocks = [];

    for (const day of schedule) {
      if (day.enabled) {
        for (const block of day.blocks) {
          flatBlocks.push({
            day_of_week: day.day_of_week,
            start_time: block.start_time,
            end_time: block.end_time
          });
        }
      }
    }

    try {
      const res = await fetch('http://localhost:8080/api/v1/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professional_id: professionalId,
          blocks: flatBlocks
        })
      });

      if (res.ok) {
        alert("¡Horarios guardados correctamente!");
      } else {
        alert("Hubo un error al guardar.");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión.");
    }
  };

  if (loading) return <div style={{ padding: 50, color: 'var(--color-text-muted)' }}>Cargando horarios...</div>;

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--color-bg)' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>

        <header style={{ marginBottom: '32px' }}>
          <h1 style={{ color: 'var(--color-text-primary)', fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700 }}>
            <Clock size={24} /> Configuración de Horarios
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '6px' }}>
            Define tus bloques de disponibilidad semanal
          </p>
        </header>

        <div className="schedule-container">
          {schedule.map((day, dIndex) => (
            <div key={day.day_of_week} className={`day-card ${!day.enabled ? 'disabled' : ''}`}>

              <div className="day-header">
                <div className="day-title">
                  <span>{day.label}</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={day.enabled}
                    onChange={() => toggleDay(dIndex)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              {day.enabled && (
                <div className="time-blocks-list">
                  {day.blocks.map((block, bIndex) => (
                    <div key={bIndex} className="time-block-row">
                      <input
                        type="time"
                        className="time-input"
                        value={block.start_time}
                        onChange={(e) => updateTime(dIndex, bIndex, 'start_time', e.target.value)}
                      />
                      <span className="time-separator">hasta</span>
                      <input
                        type="time"
                        className="time-input"
                        value={block.end_time}
                        onChange={(e) => updateTime(dIndex, bIndex, 'end_time', e.target.value)}
                      />

                      <button
                        className="btn-icon"
                        onClick={() => removeBlock(dIndex, bIndex)}
                        title="Eliminar intervalo"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}

                  <button className="btn-add-interval" onClick={() => addBlock(dIndex)}>
                    <Plus size={16} /> Agregar intervalo
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <button className="save-fab" onClick={handleSave}>
          <Save size={20} /> Guardar Cambios
        </button>

      </main>
    </div>
  );
}