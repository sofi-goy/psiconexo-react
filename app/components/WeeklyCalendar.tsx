"use client";
import { useState, useEffect, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addDays, setHours, setMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import './calendar.css'; // Nuestro CSS personalizado

// Configuración del localizador de fechas (Español)
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

// Tipos
type ScheduleBlock = { day_of_week: number; start_time: string; end_time: string; };
type Appointment = { id: number; date: string; start_time: string; duration_minutes: number; patient_id: number; };

// Evento unificado para el calendario
type CalendarEvent = {
  title: string;
  start: Date;
  end: Date;
  type: 'appointment' | 'availability'; // Para diferenciar color
};

export function WeeklyCalendar({ psychologistId }: { psychologistId: number }) {
  // Estado para la vista actual (por defecto 'work_week' si quisieras ocultar findes, o 'week')
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState(new Date());

  const [schedule, setSchedule] = useState<ScheduleBlock[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // 1. Fetch de Datos
  useEffect(() => {
    async function fetchData() {
      // Calculamos rango de fechas basado en la vista actual del calendario
      const startCurrentWeek = startOfWeek(date, { weekStartsOn: 1 });
      const startStr = format(startCurrentWeek, 'yyyy-MM-dd');
      const endStr = format(addDays(startCurrentWeek, 6), 'yyyy-MM-dd');

      try {
        // Cargar Configuración Base
        const resSched = await fetch(`http://localhost:8080/api/v1/schedule?psychologist_id=${psychologistId}`);
        if (resSched.ok) setSchedule(await resSched.json() || []);

        // Cargar Turnos Reales
        const resAppts = await fetch(`http://localhost:8080/api/v1/appointments?psychologist_id=${psychologistId}&start_date=${startStr}&end_date=${endStr}`);
        if (resAppts.ok) setAppointments(await resAppts.json() || []);

      } catch (e) {
        console.error("Error cargando datos", e);
      }
    }
    fetchData();
  }, [psychologistId, date]); // Recargamos si cambia la fecha que mira el usuario

  // 2. Transformación de Datos a Eventos del Calendario
  const events = useMemo(() => {
    const calendarEvents: CalendarEvent[] = [];
    const currentStartOfWeek = startOfWeek(date, { weekStartsOn: 1 }); // Lunes de la semana visible

    // A) PROYECCIÓN DE DISPONIBILIDAD (Bloques Grises)
    // Recorremos los 7 días de la semana actual
    for (let i = 0; i < 7; i++) {
      const currentDayDate = addDays(currentStartOfWeek, i);
      // Convertir 0 (Dom) - 6 (Sab) de date-fns a tu lógica 1 (Lun) - 7 (Dom)
      let jsDay = getDay(currentDayDate); 
      let dbDay = jsDay === 0 ? 7 : jsDay;

      // Buscar si hay configuración para este día
      const dayBlocks = schedule.filter(s => s.day_of_week === dbDay);

      dayBlocks.forEach(block => {
        const [startH, startM] = block.start_time.split(':').map(Number);
        const [endH, endM] = block.end_time.split(':').map(Number);

        calendarEvents.push({
          title: 'Disponible',
          start: setMinutes(setHours(currentDayDate, startH), startM),
          end: setMinutes(setHours(currentDayDate, endH), endM),
          type: 'availability'
        });
      });
    }

    // B) TURNOS AGENDADOS (Bloques Azules)
    appointments.forEach(appt => {
      try {
        // 1. Limpieza de fecha: Si viene "2026-01-26T00:00:00Z", nos quedamos con "2026-01-26"
        const cleanDate = appt.date.includes('T') ? appt.date.split('T')[0] : appt.date;
        
        // 2. Parsing manual seguro para evitar problemas de zona horaria
        const [y, m, d] = cleanDate.split('-').map(Number);
        const [h, min] = appt.start_time.split(':').map(Number);

        // Validación de integridad
        if (isNaN(y) || isNaN(m) || isNaN(d) || isNaN(h) || isNaN(min)) {
          console.warn("Datos de turno inválidos, se omite:", appt);
          return;
        }
      
        // 3. Construcción de objetos Date
        // (Recordatorio: en JS los meses van de 0 a 11)
        const startObj = new Date(y, m - 1, d, h, min); 
        const endObj = new Date(startObj.getTime() + appt.duration_minutes * 60000);

        calendarEvents.push({
          title: `Paciente #${appt.patient_id}`,
          start: startObj,
          end: endObj,
          type: 'appointment'
        });

      } catch (error) {
        console.error("Error procesando turno:", appt, error);
      }
    });

    return calendarEvents;
  }, [schedule, appointments, date]);

  // 3. Estilizador de Eventos (Aquí aplicamos las clases CSS)
  const eventStyleGetter = (event: CalendarEvent) => {
    if (event.type === 'appointment') {
      return { className: 'event-appointment' };
    }
    if (event.type === 'availability') {
      return { className: 'event-available' };
    }
    return {};
  };

  return (
    <div style={{ height: '100%', padding: '10px' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        culture='es'
        
        // Configuraciones Visuales
        views={[Views.WEEK, Views.DAY]} // Solo permitimos ver Semana o Día
        view={view} // Vista controlada
        onView={setView}
        date={date} // Fecha controlada
        onNavigate={setDate}
        
        min={new Date(0, 0, 0, 8, 0, 0)} // Empezar scroll a las 8:00 AM
        max={new Date(0, 0, 0, 20, 0, 0)} // Terminar scroll a las 8:00 PM
        
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