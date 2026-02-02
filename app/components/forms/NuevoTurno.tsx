"use client"

import { Form } from './Form';
import { FieldConfig } from '@/types/form';
import { useState, useEffect } from 'react';
import './forms.css';

type Props = {
  professionalId: number;
  onSuccess?: () => void;
};

export function NuevoTurno({ professionalId, onSuccess }: Props) {

  const [clientOptions, setClientOptions] = useState<{ label: string, value: number | string }[]>([
    { label: "Cargando pacientes...", value: "" }
  ]);

  const [appointmentType, setAppointmentType] = useState<string>("");
  const [fields, setFields] = useState<FieldConfig[]>([]);

  const daysOfWeekOptions = [
    { label: "Seleccionar día...", value: 0 },
    { label: "Lunes", value: 1 },
    { label: "Martes", value: 2 },
    { label: "Miércoles", value: 3 },
    { label: "Jueves", value: 4 },
    { label: "Viernes", value: 5 },
    { label: "Sábado", value: 6 },
    { label: "Domingo", value: 7 },
  ];

  useEffect(() => {
    async function loadClients() {
      try {
        const res = await fetch(`http://localhost:8080/api/v1/clients?professional_id=${professionalId}`);
        if (!res.ok) throw new Error("Error cargando pacientes");
        const data = await res.json();

        setClientOptions([
          { label: "Seleccione paciente", value: "" },
          ...data.map((c: any) => ({ label: c.name, value: c.id }))
        ]);
      } catch (e) {
        console.error(e);
        setClientOptions([{ label: "Error al cargar pacientes", value: "" }]);
      }
    }
    loadClients();
  }, [professionalId]);

  useEffect(() => {
    if (appointmentType === "") {
      setFields([]);
      return;
    }

    const isRecurring = appointmentType === 'recurring';

    const baseFields: FieldConfig[] = [
      {
        type: "select",
        name: "client_id",
        id: "turno-cliente-id",
        label: "Paciente",
        options: clientOptions,
        optionsType: "number",
        required: true
      },
    ];

    if (isRecurring) {
      baseFields.push(
        {
          type: "select",
          name: "day_of_week",
          id: "turno-dia",
          label: "Día de la Semana",
          options: daysOfWeekOptions,
          optionsType: "number",
          required: true
        },
        { type: "date", name: "start_date", id: "turno-start-date", label: "Desde (fecha inicio)", required: false },
      );
    } else {
      baseFields.push(
        { type: "date", name: "date", id: "turno-date", label: "Fecha", required: true }
      );
    }

    baseFields.push(
      { type: "time", name: "start_time", id: "turno-start-time", label: "Hora", required: true },
      { type: "number", name: "duration", id: "turno-duration", label: "Duración (min)", required: true },
      { type: "number", name: "price", id: "turno-price", label: "Precio", required: false }
    );

    setFields(baseFields);
  }, [appointmentType, clientOptions]);


  const endpoint = appointmentType === 'recurring'
    ? 'http://localhost:8080/api/v1/recurring-rules'
    : 'http://localhost:8080/api/v1/appointments';

  return (
    <div className="form-container-wrapper">

      <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ color: '#ccc', fontSize: '0.9rem' }}>Tipo de Agendamiento</label>
        <select
          value={appointmentType}
          onChange={(e) => setAppointmentType(e.target.value)}
          style={{
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid #333',
            backgroundColor: '#1a1a1a',
            color: 'white',
            fontSize: '1rem',
            outline: 'none'
          }}
        >
          <option value="" disabled>Seleccione tipo de Turno</option>
          <option value="single">Turno Puntual (Una sola vez)</option>
          <option value="recurring">Horario Fijo (Todas las semanas)</option>
        </select>
      </div>

      {appointmentType !== "" && (
        <Form
          key={appointmentType}
          titulo=""
          endpoint={endpoint}
          fields={fields}
          extraValues={{ professional_id: professionalId }}
          onSuccess={onSuccess}
        />
      )}

    </div>
  );
}