"use client";
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, Views, View, SlotInfo } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import './calendar.css';

const locales = { 'es': es };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

type Appointment = {
  id: number;
  date: string;
  start_time: string;
  duration_minutes: number;
  client_id: number;
  client_name?: string;
  pending?: boolean;
  isPreview?: boolean;
};

type CalendarEvent = {
  id: number;
  title: string;
  start: Date;
  end: Date;
  pending?: boolean;
  isPreview?: boolean;
};

type Props = {
  professionalId: number;
  onSlotSelect?: (slotInfo: SlotInfo) => void;
  previewAppointment?: Appointment | null;
};

export function WeeklyCalendar({ professionalId, onSlotSelect, previewAppointment }: Props) {
  const [isMounted, setIsMounted] = useState(false);
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const fetchAppointments = useCallback(async () => {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const startStr = format(weekStart, 'yyyy-MM-dd');
    const endStr = format(addDays(weekStart, 6), 'yyyy-MM-dd');

    try {
      const res = await fetch(
        `http://localhost:8080/api/v1/appointments?professional_id=${professionalId}&start_date=${startStr}&end_date=${endStr}`
      );
      if (res.ok) setAppointments(await res.json() || []);
    } catch (e) {
      console.error(e);
    }
  }, [professionalId, date]);

  useEffect(() => {
    setIsMounted(true);
    fetchAppointments();
  }, [fetchAppointments]);

  // Refetch when preview clears (appointment was confirmed)
  useEffect(() => {
    if (previewAppointment === null) {
      fetchAppointments();
    }
  }, [previewAppointment, fetchAppointments]);

  const events = useMemo(() => {
    const allAppointments = [...appointments];

    // Add preview appointment if exists
    if (previewAppointment) {
      allAppointments.push(previewAppointment);
    }

    return allAppointments.map(appt => {
      const cleanDate = appt.date.includes('T') ? appt.date.split('T')[0] : appt.date;
      const [y, m, d] = cleanDate.split('-').map(Number);
      const [h, min] = appt.start_time.split(':').map(Number);

      const start = new Date(y, m - 1, d, h, min);
      const end = new Date(start.getTime() + appt.duration_minutes * 60000);

      return {
        id: appt.id,
        title: appt.client_name || `Paciente #${appt.client_id}`,
        start,
        end,
        pending: appt.pending,
        isPreview: appt.isPreview,
      };
    }).filter(e => !isNaN(e.start.getTime()));
  }, [appointments, previewAppointment]);

  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    if (onSlotSelect) {
      onSlotSelect(slotInfo);
    }
  }, [onSlotSelect]);

  const eventPropGetter = useCallback((event: CalendarEvent) => {
    if (event.isPreview) {
      return { className: 'preview' };
    }
    if (event.pending) {
      return { className: 'pending' };
    }
    return {};
  }, []);

  if (!isMounted) {
    return (
      <div style={{ height: '100%', padding: '40px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
        Cargando agenda...
      </div>
    );
  }

  return (
    <div style={{ height: '100%' }}>
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
        max={new Date(0, 0, 0, 21, 0, 0)}
        selectable
        onSelectSlot={handleSelectSlot}
        eventPropGetter={eventPropGetter}
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