import { FieldConfig, is_numeric } from "@/types/form";
import { FormRow } from "./FormRow";
import { useState, ReactNode } from 'react';

type Props = {
    titulo: string;
    endpoint: string;
    fields: FieldConfig[];
    onFieldChange?: (name: string, value:any) => void;
    children?: ReactNode;
    extraValues?: Record<string, any>;
    onSuccess?: () => void;            
};

export function Form({ titulo, endpoint, fields, onFieldChange, children, extraValues, onSuccess }: Props) {
    const [form, setForm] = useState({});

    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [error, setError] = useState<string>('');

    function handleChange(field: FieldConfig, rawValue: string) {
        var value: string | Number;
        if (is_numeric(field)) {
            value = Number(rawValue);
        } else
            value = rawValue;

        setForm(prev => ({ ...prev, [field.name]: value }));

        if (onFieldChange) {
            onFieldChange(field.name, value)
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setStatus('loading');
        setError('');

        try {
            const payload = { ...form, ...extraValues };

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const error_data = await res.json();
                setError(JSON.stringify(error_data));
                throw new Error('Request failed');
            }

            setStatus('success');

            if (onSuccess) {
                setTimeout(() => {
                    setStatus('idle');
                    setForm({});
                    onSuccess();
                }, 1000);
            }

        } catch (err: any) {
            setStatus('error');
            if (!error) setError(err.message || "Error desconocido");
        }
    }

    return (
        <form onSubmit={handleSubmit} className='form-div'>
            <h1 className='form-title'>{titulo}</h1>

            {children}

            {fields.map(field =>
                <FormRow
                    key={field.name}
                    field={field}
                    onChange={handleChange}
                />)}

            <button type="submit" disabled={status === 'loading'} className='form-submit'>
                {status === 'loading' ? 'Guardando...' : 'Enviar'}
            </button>

            {status === 'success' && <p className='success'>Guardado correctamente.</p>}
            {status === 'error' && <p className='error'>Error al guardar: {error}</p>}
        </form>
    )
}