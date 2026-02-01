"use client";
import { useState, useEffect, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addDays, setHours, setMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import './calendar.css';

const locales = {
  'es': es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

type ScheduleBlock = { day_of_week: number; start_time: string; end_time: string; };
type Appointment = {
  id: number;
  date: string;
  start_time: string;
  duration_minutes: number;
  patient_id: number;
  patient_name?: string;
};

// Horarios fijos (recurrentes cada semana)
type RecurringSlot = {
  id: number;
  day_of_week: number;
  start_time: string;
  duration_minutes: number;
  patient_id: number;
  patient_name?: string;
};

type CalendarEvent = {
  title: string;
  start: Date;
  end: Date;
  type: 'appointment' | 'availability';
};

export function WeeklyCalendar({ psychologistId }: { psychologistId: number }) {
  const [isMounted, setIsMounted] = useState(false);
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState(new Date());

  const [schedule, setSchedule] = useState<ScheduleBlock[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [recurringSlots, setRecurringSlots] = useState<RecurringSlot[]>([]);

  useEffect(() => {
    setIsMounted(true);
    async function fetchData() {
      const startCurrentWeek = startOfWeek(date, { weekStartsOn: 1 });
      const startStr = format(startCurrentWeek, 'yyyy-MM-dd');
      const endStr = format(addDays(startCurrentWeek, 6), 'yyyy-MM-dd');

      try {
        // Horarios de disponibilidad del psicólogo
        const resSched = await fetch(`http://localhost:8080/api/v1/schedule?psychologist_id=${psychologistId}`);
        if (resSched.ok) setSchedule(await resSched.json() || []);

        // Turnos puntuales (one-time appointments)
        const resAppts = await fetch(`http://localhost:8080/api/v1/appointments?psychologist_id=${psychologistId}&start_date=${startStr}&end_date=${endStr}`);
        if (resAppts.ok) setAppointments(await resAppts.json() || []);

        // Horarios fijos (recurring weekly slots)
        const resRecurring = await fetch(`http://localhost:8080/api/v1/recurring-slots?psychologist_id=${psychologistId}`);
        if (resRecurring.ok) setRecurringSlots(await resRecurring.json() || []);

      } catch (e) {
        console.error(e);
      }
    }
    fetchData();
  }, [psychologistId, date]);

  const { backgroundEvents, myEvents } = useMemo(() => {
    const bgEvents: CalendarEvent[] = [];
    const fgEvents: CalendarEvent[] = [];
    const currentStartOfWeek = startOfWeek(date, { weekStartsOn: 1 });

    // A) DISPONIBILIDAD (Fondo / Verde)
    for (let i = 0; i < 7; i++) {
      const currentDayDate = addDays(currentStartOfWeek, i);
      let jsDay = getDay(currentDayDate);
      let dbDay = jsDay === 0 ? 7 : jsDay;

      const dayBlocks = schedule.filter(s => s.day_of_week === dbDay);

      dayBlocks.forEach(block => {
        const [startH, startM] = block.start_time.split(':').map(Number);
        const [endH, endM] = block.end_time.split(':').map(Number);

        bgEvents.push({
          title: '',
          start: setMinutes(setHours(currentDayDate, startH), startM),
          end: setMinutes(setHours(currentDayDate, endH), endM),
          type: 'availability'
        });
      });
    }

    // B) TURNOS PUNTUALES (Azul)
    appointments.forEach(appt => {
      try {
        const cleanDate = appt.date.includes('T') ? appt.date.split('T')[0] : appt.date;
        const [y, m, d] = cleanDate.split('-').map(Number);
        const [h, min] = appt.start_time.split(':').map(Number);

        if (isNaN(y) || isNaN(m) || isNaN(d) || isNaN(h) || isNaN(min)) return;

        const startObj = new Date(y, m - 1, d, h, min);
        const endObj = new Date(startObj.getTime() + appt.duration_minutes * 60000);

        fgEvents.push({
          title: appt.patient_name || `Paciente #${appt.patient_id}`,
          start: startObj,
          end: endObj,
          type: 'appointment'
        });
      } catch (error) {
        console.error(error);
      }
    });

    // C) HORARIOS FIJOS (Recurrentes - también Azul)
    // Proyectamos cada recurring slot al día correspondiente de esta semana
    for (let i = 0; i < 7; i++) {
      const currentDayDate = addDays(currentStartOfWeek, i);
      let jsDay = getDay(currentDayDate);
      let dbDay = jsDay === 0 ? 7 : jsDay; // Convertir domingo de 0 a 7

      const daySlots = recurringSlots.filter(s => s.day_of_week === dbDay);

      daySlots.forEach(slot => {
        const [h, min] = slot.start_time.split(':').map(Number);
        if (isNaN(h) || isNaN(min)) return;

        const startObj = setMinutes(setHours(currentDayDate, h), min);
        const endObj = new Date(startObj.getTime() + slot.duration_minutes * 60000);

        fgEvents.push({
          title: slot.patient_name || `Paciente #${slot.patient_id}`,
          start: startObj,
          end: endObj,
          type: 'appointment'
        });
      });
    }

    return { backgroundEvents: bgEvents, myEvents: fgEvents };
  }, [schedule, appointments, recurringSlots, date]);

  const eventStyleGetter = (event: CalendarEvent) => {
    if (event.type === 'appointment') {
      return { className: 'event-appointment' };
    }
    return {};
  };

  if (!isMounted) {
    return <div style={{ height: '100%', padding: '20px', color: '#666' }}>Cargando agenda...</div>;
  }

  return (
    <div style={{ height: '100%', padding: '10px' }}>
      <Calendar
        localizer={localizer}
        events={myEvents}
        backgroundEvents={backgroundEvents}
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
        eventPropGetter={eventStyleGetter}
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