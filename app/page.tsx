"use client";
import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Modal } from "./components/Modal";
import { NuevoTurno } from "./Forms/NuevoTurno";
import { NuevoPaciente } from "./Forms/NuevoPaciente";

export default function Home() {
  const [modalOpen, setModalOpen] = useState<'turno' | 'paciente' | null>(null);
  const loggedPsychologistId = 1; // hardcodeado para el primer psicoloco

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#121212' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center' }}>
          <div>
            <h1 style={{ color: 'white', fontSize: '1.8rem', margin: 0 }}>Agenda Semanal</h1>
            <p style={{ color: '#666', marginTop: '5px' }}>Gestiona tus sesiones y horarios</p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setModalOpen('paciente')}
              style={{ padding: '10px 20px', backgroundColor: 'transparent', border: '1px solid #444', color: 'white', borderRadius: '6px', cursor: 'pointer' }}
            >
              + Nuevo Paciente
            </button>
            <button 
              onClick={() => setModalOpen('turno')}
              style={{ padding: '10px 20px', backgroundColor: 'white', border: 'none', color: 'black', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              + Agendar Turno
            </button>
          </div>
        </header>

        <div style={{ 
          height: 'calc(100% - 100px)', 
          border: '1px dashed #333', 
          borderRadius: '12px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#0a0a0a'
        }}>
          <p style={{ color: '#444' }}>
            Aquí dibujaremos la grilla de horarios del Dr. House
          </p>
        </div>

      </main>

      <Modal 
        isOpen={modalOpen === 'turno'} 
        onClose={() => setModalOpen(null)}
        title="Agendar Nueva Sesión"
      >
        <NuevoTurno
          psychologistId={loggedPsychologistId}
          onSuccess={() => setModalOpen(null)}
        />
      </Modal>

      <Modal 
        isOpen={modalOpen === 'paciente'} 
        onClose={() => setModalOpen(null)}
        title="Registrar Nuevo Paciente"
      >
        <NuevoPaciente 
            psychologistId={loggedPsychologistId} 
            onSuccess={() => setModalOpen(null)}
        />
      </Modal>

    </div>
  );
}