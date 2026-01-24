"use client"

import { Form } from './Form';
import { FieldConfig } from '@/types/form';

import './forms.css';

export function NuevoTurno() {
  const fields: FieldConfig[] = [
    { type: "number", name: "psychologist_id", id: "turno-psico-id", label: "Psicologo", required: true },
    { type: "number", name: "patient_id", id: "turno-paciente-id", label: "Paciente", required: true },
    { type: "text", name: "date", id: "turno-date", label: "Fecha (YYYY-MM-DD)", required: true },
    { type: "text", name: "start_time", id: "turno-start-time", label: "Hora (HH:MM)", required: true },
    { type: "number", name: "duration", id: "turno-duration", label: "Duración", required: true}
  ];

  return (
    <Form titulo="Agendar Turno" endpoint='http://localhost:8080/api/v1/appointments' fields={fields} />
  );
}