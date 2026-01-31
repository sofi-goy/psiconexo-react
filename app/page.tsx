"use client";
import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Modal } from "./components/Modal";
import { NuevoTurno } from "./Forms/NuevoTurno";
import { NuevoPaciente } from "./Forms/NuevoPaciente";
import './dashboard.css';

export default function Home() {
  const [modalOpen, setModalOpen] = useState<'turno' | 'paciente' | null>(null);
  const loggedPsychologistId = 1; 

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#121212' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
        
        <header className="dashboard-header">
          <div>
            <h1 className="header-title">Agenda Semanal</h1>
            <p className="header-subtitle">Gestiona tus sesiones y horarios</p>
          </div>
          
          <div className="header-actions">
            <button 
              onClick={() => setModalOpen('paciente')}
              className="btn-secondary"
            >
              + Nuevo Paciente
            </button>
            <button 
              onClick={() => setModalOpen('turno')}
              className="btn-primary"
            >
              + Agendar Turno
            </button>
          </div>
        </header>

        <div className="calendar-placeholder">
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