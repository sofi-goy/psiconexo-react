"use client"

import { useState } from 'react';
import { FormRow } from './FormRow';
import { FieldConfig } from '@/types/form';

import './forms.css';

export function NuevoPsico() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    cancellation_window_hours: 24
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>('');

   function handleChange(name: string, value: string) {
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('http://localhost:8080/api/v1/psychologists', {
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

  const nameField : FieldConfig = {type: "text", name: "name", id: "psico-name", label: "Nombre", required: true}
  const phoneField : FieldConfig = {type: "tel", name: "phone", id: "psico-phone", label: "Teléfono", required: false}
  const emailField : FieldConfig = {type: "email", name: "email", id: "psico-email", label: "Mail", required: true}

  return (
    <form onSubmit={handleSubmit} className='form-div'>
      <h1 className='form-title'>Crear Psicólogo</h1>

      <FormRow field={nameField} onChange={handleChange} />
      <FormRow field={emailField} onChange={handleChange} />
      <FormRow field={phoneField} onChange={handleChange} />
      
      <button type="submit" disabled={status === 'loading'} className='form-submit'>
        Enviar
      </button>

      {status === 'success' && <p className='success'>Guardado.</p>}
      {status === 'error' && <p className='error'>Error al guardar: {error}</p>}
    </form>
  );
}