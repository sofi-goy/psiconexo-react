import { FieldConfig } from "@/types/form";
import { FormRow } from "./FormRow";

import { useState } from 'react';

type Props = {
    titulo: string;
    endpoint: string;
    fields: FieldConfig[];
};

export function Form({ titulo, endpoint, fields }: Props) {
    const [form, setForm] = useState({});

    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [error, setError] = useState<string>('');

    function handleChange(field: FieldConfig, rawValue: string) {
        var value: string | Number;
        if (field.type === "number")
            value = Number(rawValue);
        else
            value = rawValue;

        setForm(prev => ({ ...prev, [field.name]: value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setStatus('loading');

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const error_data = await res.json();
                setError(JSON.stringify(error_data));
                throw new Error('Request failed');
            }

            setStatus('success');
        } catch {
            setStatus('error');
        }
    }
    return (
        <form onSubmit={handleSubmit} className='form-div'>
            <h1 className='form-title'>{titulo}</h1>

            {fields.map(field =>
                <FormRow
                    key={field.name}
                    field={field}
                    onChange={handleChange}
                />)}

            <button type="submit" disabled={status === 'loading'} className='form-submit'>
                Enviar
            </button>

            {status === 'success' && <p className='success'>Guardado.</p>}
            {status === 'error' && <p className='error'>Error al guardar: {error}</p>}
        </form>
    )
}