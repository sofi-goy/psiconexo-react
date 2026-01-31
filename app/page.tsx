"use client";
import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Modal } from "./components/Modal";
import { NuevoTurno } from "./Forms/NuevoTurno";
import { NuevoPaciente } from "./Forms/NuevoPaciente";
import { WeeklyCalendar } from "./components/WeeklyCalendar";
import './dashboard.css';

export default function Home() {
  const [modalOpen, setModalOpen] = useState<'turno' | 'paciente' | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const loggedPsychologistId = 1;

  const handleSuccessTurno = () => {
      setModalOpen(null);
      setRefreshTrigger(prev => prev + 1);
  };

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

        <div style={{ flex: 1, border: '1px solid #333', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#0f0f0f' }}>
          <WeeklyCalendar 
            key={refreshTrigger} // El key fuerza al componente a recargarse si cambia
            psychologistId={loggedPsychologistId} 
          />
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