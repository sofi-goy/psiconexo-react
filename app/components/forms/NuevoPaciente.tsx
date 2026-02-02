"use client"

import { Form } from './Form';
import { FieldConfig } from '@/types/form';
import './forms.css';

type Props = {
    professionalId: number;
    onSuccess?: () => void;
};

export function NuevoPaciente({ professionalId, onSuccess }: Props) {

    const fields: FieldConfig[] = [
        { type: "text", name: "name", id: "paciente-name", label: "Nombre Completo", required: true },
        { type: "tel", name: "phone", id: "paciente-phone", label: "Teléfono", required: false },
        { type: "email", name: "email", id: "paciente-email", label: "Email", required: true },
    ];

    return (
        <Form
            titulo="Registrar Nuevo Paciente"
            endpoint='http://localhost:8080/api/v1/clients'
            fields={fields}
            extraValues={{ professional_id: professionalId, active: true }}
            onSuccess={onSuccess}
        />
    );
}