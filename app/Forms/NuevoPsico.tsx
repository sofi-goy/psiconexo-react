"use client"

import { Form } from './Form';
import { FieldConfig } from '@/types/form';

import './forms.css';

export function NuevoPsico() {
  const fields : FieldConfig[] = [
    {type: "text", name: "name", id: "psico-name", label: "Nombre", required: true},
    {type: "tel", name: "phone", id: "psico-phone", label: "Teléfono", required: false},
    {type: "email", name: "email", id: "psico-email", label: "Mail", required: true},
    {type: "number", name: "cancellation_window_hours", id: "psico-hours", label: "Anticipación para cancelar", required: true}
  ];

  return (
    <Form titulo="Crear Psicólogo" endpoint='http://localhost:8080/api/v1/psychologists' fields={fields} />
  );
}