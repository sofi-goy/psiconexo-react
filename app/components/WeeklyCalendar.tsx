"use client";
import { useState, useEffect, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import './calendar.css';

const locales = { 'es': es };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

type Appointment = {
  id: number;
  date: string;
  start_time: string;
  duration_minutes: number;
  patient_id: number;
  patient_name?: string;
};

type CalendarEvent = {
  title: string;
  start: Date;
  end: Date;
};

export function WeeklyCalendar({ psychologistId }: { psychologistId: number }) {
  const [isMounted, setIsMounted] = useState(false);
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    setIsMounted(true);
    async function fetchData() {
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      const startStr = format(weekStart, 'yyyy-MM-dd');
      const endStr = format(addDays(weekStart, 6), 'yyyy-MM-dd');

      try {
        const res = await fetch(
          `http://localhost:8080/api/v1/appointments?psychologist_id=${psychologistId}&start_date=${startStr}&end_date=${endStr}`
        );
        if (res.ok) setAppointments(await res.json() || []);
      } catch (e) {
        console.error(e);
      }
    }
    fetchData();
  }, [psychologistId, date]);

  const events = useMemo(() => {
    return appointments.map(appt => {
      const cleanDate = appt.date.includes('T') ? appt.date.split('T')[0] : appt.date;
      const [y, m, d] = cleanDate.split('-').map(Number);
      const [h, min] = appt.start_time.split(':').map(Number);

      const start = new Date(y, m - 1, d, h, min);
      const end = new Date(start.getTime() + appt.duration_minutes * 60000);

      return {
        title: `${appt.start_time} - ${appt.patient_name || `Paciente #${appt.patient_id}`}`,
        start,
        end,
      };
    }).filter(e => !isNaN(e.start.getTime()));
  }, [appointments]);

  if (!isMounted) {
    return <div style={{ height: '100%', padding: '20px', color: '#666' }}>Cargando agenda...</div>;
  }

  return (
    <div style={{ height: '100%', padding: '10px' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        culture='es'
        views={[Views.WEEK, Views.DAY]}
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        min={new Date(0, 0, 0, 8, 0, 0)}
        max={new Date(0, 0, 0, 20, 0, 0)}
        messages={{
          next: "Siguiente",
          previous: "Anterior",
          today: "Hoy",
          month: "Mes",
          week: "Semana",
          day: "Día",
          noEventsInRange: "No hay citas en este rango."
        }}
      />
    </div>
  );
}