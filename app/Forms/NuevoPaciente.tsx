"use client"

import { Form } from './Form';
import { FieldConfig } from '@/types/form';

import './forms.css';

export function NuevoPaciente() {
    const fields: FieldConfig[] = [
        { type: "text", name: "name", id: "paciente-name", label: "Nombre", required: true },
        { type: "tel", name: "phone", id: "paciente-phone", label: "Teléfono", required: false },
        { type: "email", name: "email", id: "paciente-email", label: "Mail", required: true },
        { type: "number", name: "psychologist_id", id: "paciente-psico-id", label: "Psicologo", required: true },
    ];

    return (
        <Form titulo="Crear Paciente" endpoint='http://localhost:8080/api/v1/patients' fields={fields} />
    );
}