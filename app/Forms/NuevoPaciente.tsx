"use client"

import { Form } from './Form';
import { FieldConfig } from '@/types/form';

import { useState, useEffect } from 'react';


import './forms.css';

export function NuevoPaciente() {
    const fields: FieldConfig[] = [
        { type: "text", name: "name", id: "paciente-name", label: "Nombre", required: true },
        { type: "tel", name: "phone", id: "paciente-phone", label: "Teléfono", required: false },
        { type: "email", name: "email", id: "paciente-email", label: "Mail", required: true },
        { type: "select", name: "psychologist_id", id: "paciente-psico-id", label: "Psicologo", options: [], optionsType: "number", required: true },
    ];

    const [dynamicFields, setDynamicFields] = useState<FieldConfig[]>(fields);

    async function loadPsicos() {
        const endpoint = "http://localhost:8080/api/v1/psychologists";

        const res = await fetch(endpoint);

        if (!res.ok) {
            const error_data = await res.json();
            throw new Error('Request failed');
        }

        var psicos = await res.json();

         setDynamicFields(prev =>
        prev.map(field =>
          field.name === 'psychologist_id'
            ? {
                ...field,
                options: psicos.map((p: any) => ({
                  label: p.name,
                  value: p.id,
                })),
              }
            : field
        )
      );
    }

    useEffect(() => {loadPsicos();}, [])

    return (
        <Form titulo="Crear Paciente" endpoint='http://localhost:8080/api/v1/patients' fields={dynamicFields} />
    );
}