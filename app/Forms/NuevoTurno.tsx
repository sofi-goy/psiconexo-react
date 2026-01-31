"use client"

import { Form } from './Form';
import { FieldConfig } from '@/types/form';
import { useState, useEffect } from 'react';
import './forms.css';

export function NuevoTurno() {

  const [psicoOptions, setPsicoOptions] = useState<{label: string, value: number}[]>([]);
  const [patientOptions, setPatientOptions] = useState<{label: string, value: number | string}[]>([
    { label: "Primero seleccione un Psicólogx", value: "" }
  ]);
  
  const [isRecurring, setIsRecurring] = useState(false);
  const [fields, setFields] = useState<FieldConfig[]>([]);

  const daysOfWeekOptions = [
    { label: "Lunes", value: 1 },
    { label: "Martes", value: 2 },
    { label: "Miércoles", value: 3 },
    { label: "Jueves", value: 4 },
    { label: "Viernes", value: 5 },
    { label: "Sábado", value: 6 },
    { label: "Domingo", value: 7 },
  ];

  useEffect(() => {
    async function loadPsicos() {
      try {
        const res = await fetch("http://localhost:8080/api/v1/psychologists");
        if (!res.ok) throw new Error("Error cargando psicólogxs");
        const data = await res.json();
        
        setPsicoOptions([
            { label: "Seleccionar unx", value: 0 },
            ...data.map((p: any) => ({ label: p.name, value: p.id }))
        ]);
      } catch(e) {
          console.error(e);
      }
    }
    loadPsicos();
  }, []);

  useEffect(() => {
    const currentFields: FieldConfig[] = [
      { 
        type: "select", 
        name: "psychologist_id", 
        id: "turno-psico-id", 
        label: "Psicólogo",
        options: psicoOptions,
        optionsType: "number", 
        required: true 
      },
      { 
        type: "select", 
        name: "patient_id", 
        id: "turno-paciente-id", 
        label: "Paciente",
        options: patientOptions,
        optionsType: "number",
        required: true 
      },

      isRecurring 
        ? { 
            type: "select", 
            name: "day_of_week", 
            id: "turno-dia", 
            label: "Día de la Semana", 
            options: daysOfWeekOptions,
            optionsType: "number",
            required: true 
          }
        : { 
            type: "date",
            name: "date",
            id: "turno-date", 
            label: "Fecha (YYYY-MM-DD)", 
            required: true 
          },
      { type: "time", name: "start_time", id: "turno-start-time", label: "Hora (HH:MM)", required: true },
      { type: "number", name: "duration", id: "turno-duration", label: "Duración (min)", required: true }
    ];

    setFields(currentFields);
  }, [isRecurring, psicoOptions, patientOptions]);

  function handleFormChange(name: string, value: any) {
    if (name === 'psychologist_id') {
      const selectedPsicoId = value;
      if (selectedPsicoId) {
        loadPatients(selectedPsicoId);
      } else {
        setPatientOptions([{ label: "Primero seleccione un Psicólogx", value: "" }]);
      }
    }
  }

  async function loadPatients(psicoId: number) {
    try {
      const res = await fetch(`http://localhost:8080/api/v1/patients?psychologist_id=${psicoId}`);
      if (!res.ok) throw new Error("Error cargando pacientes");
      const data = await res.json();

      setPatientOptions([
          { label: "Seleccione paciente", value: "" },
          ...data.map((p: any) => ({ label: p.name, value: p.id }))
      ]);
    } catch(e) {
        console.error(e);
    }
  }

  const endpoint = isRecurring 
    ? 'http://localhost:8080/api/v1/recurring-slots' 
    : 'http://localhost:8080/api/v1/appointments';

  return (
    <div className="form-container-wrapper">
      <Form 
        key={isRecurring ? "recurring" : "single"} 
        titulo={isRecurring ? "Asignar Horario Fijo" : "Agendar Turno"} 
        endpoint={endpoint} 
        fields={fields}
        onFieldChange={handleFormChange} 
      >
        <div style={{ 
            marginBottom: '15px', 
            marginTop: '5px',
            color: 'white', 
            display: 'flex', 
            gap: '10px', 
            alignItems: 'center',
            fontSize: '0.9rem',
            borderBottom: '1px solid #333',
            paddingBottom: '15px'
        }}>
          <input 
            type="checkbox" 
            id="recurring-switch"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            style={{ transform: "scale(1.2)", cursor: 'pointer' }}
          />
          <label htmlFor="recurring-switch" style={{ cursor: 'pointer', userSelect: 'none' }}>
            {isRecurring ? "Horario Fijo (desmarcar para turno puntual)" : "Turno Puntual (marcar para horario fijo)"}
          </label>
        </div>
      </Form>
    </div>
  );
}