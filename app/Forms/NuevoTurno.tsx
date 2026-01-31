"use client"

import { Form } from './Form';
import { FieldConfig } from '@/types/form';
import { useState, useEffect } from 'react';
import './forms.css';

export function NuevoTurno() {
  const initialFields: FieldConfig[] = [
    { 
      type: "select", 
      name: "psychologist_id", 
      id: "turno-psico-id", 
      label: "Psicologo",
      options: [],
      optionsType: "number", 
      required: true 
    },
    { 
      type: "select", 
      name: "patient_id", 
      id: "turno-paciente-id", 
      label: "Paciente",
      options: [
        { label: "Primero seleccione un Psicólogx", value: "" }
      ],
      optionsType: "number",
      required: true 
    },
    { type: "text", name: "date", id: "turno-date", label: "Fecha (YYYY-MM-DD)", required: true },
    { type: "text", name: "start_time", id: "turno-start-time", label: "Hora (HH:MM)", required: true },
    { type: "number", name: "duration", id: "turno-duration", label: "Duración (min)", required: true }
  ];

  const [fields, setFields] = useState<FieldConfig[]>(initialFields);

  useEffect(() => {
    async function loadPsicos() {
      try {
        const res = await fetch("http://localhost:8080/api/v1/psychologists");
        if (!res.ok) throw new Error("Error cargando psicólogxs");
        const psicos = await res.json();

        setFields(prev => prev.map(f =>
          f.name === 'psychologist_id'
          ? {
              ...f,
              options: [
                { label: "Seleccionar unx", value: "" },
                ...psicos.map((p: any) => ({ label: p.name, value: p.id }))
              ]
          }
         : f 
        ));
      } catch(e) {
          console.error(e);
      }
    }
    loadPsicos();
  }, []);

  function handleFormChange(name: string, value: any) {

    if (name === 'psychologist_id') {
      const selectedPsicoId = value;
      if (selectedPsicoId) {
        loadPatients(selectedPsicoId);
      } else {
        clearPatients();
      }
    }
  }

  async function loadPatients(psicoId: number) {
    try {
      const res = await fetch(`http://localhost:8080/api/v1/patients?psychologist_id=${psicoId}`);

      if (!res.ok) throw new Error("Error cargando pacientes");
      const pacientes = await res.json();

      setFields(prev => prev.map(f =>
        f.name === 'patient_id'
        ? {
            ...f,
            options: [
              { label: "Seleccione paciente", value: "" },
              ...pacientes.map((p: any) => ({ label: p.name, value: p.id }))
            ]
        }
       : f 
      ));
    } catch(e) {
        console.error(e);
    }
  }

  function clearPatients() {
    setFields(prev => prev.map(f =>
      f.name === 'patient_id'
      ? { ...f, options: [{ label: "Primero seleccionar psicólogx", value: "" }] }
      : f
    ));
  }

  return (
    <Form 
      titulo="Agendar Turno" 
      endpoint='http://localhost:8080/api/v1/appointments' 
      fields={fields}
      onFieldChange={handleFormChange} 
    />
  );
}