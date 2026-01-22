"use client"

import { useState } from 'react';

export function NuevoPsico() {
     const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    cancellation_window_hours: 24
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
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

      if (!res.ok) throw new Error('Request failed');

      setStatus('success');
    } catch {
      setStatus('error');
    }
  }
    return (
        <form onSubmit={handleSubmit}>
            <input type="text" name="name" value={form.name} onChange={handleChange}></input>
            <input type="email" name="email" value={form.email} onChange={handleChange}></input>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange}></input>


      <button type="submit" disabled={status === 'loading'}>
        Enviar
      </button>

      {status === 'success' && <p>Guardado.</p>}
      {status === 'error' && <p>Error al guardar.</p>}
        </form>
    );
}