"use client";
import { useState, useCallback } from "react";
import { SlotInfo } from "react-big-calendar";
import { Modal } from "@/components/ui/Modal";
import { SmartScheduleModal } from "@/components/calendar/SmartScheduleModal";
import { NuevoPaciente } from "@/components/forms/NuevoPaciente";
import { WeeklyCalendar } from "@/components/calendar/WeeklyCalendar";
import { Plus } from "lucide-react";
import './dashboard.css';

type PreviewAppointment = {
  id: number;
  date: string;
  start_time: string;
  duration_minutes: number;
  client_id: number;
  client_name?: string;
  isPreview: boolean;
};

export default function ProfesionalDashboard() {
  const [modalPatient, setModalPatient] = useState(false);
  const [scheduleSlot, setScheduleSlot] = useState<SlotInfo | null>(null);
  const [previewAppointment, setPreviewAppointment] = useState<PreviewAppointment | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loggedProfessionalId = 1;

  const handleSlotSelect = useCallback((slotInfo: SlotInfo) => {
    setScheduleSlot(slotInfo);
  }, []);

  const handlePreviewChange = useCallback((preview: PreviewAppointment | null) => {
    setPreviewAppointment(preview);
  }, []);

  const handleSchedule = useCallback(() => {
    setPreviewAppointment(null);
    setRefreshKey(k => k + 1);
  }, []);

  const handleCloseSchedule = useCallback(() => {
    setPreviewAppointment(null);
    setScheduleSlot(null);
  }, []);

  return (
    <main style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1 className="header-title">Agenda Semanal</h1>
          <p className="header-subtitle">Haz clic en un horario vacío para agendar</p>
        </div>

        <div className="header-actions">
          <button
            onClick={() => setModalPatient(true)}
            className="btn-secondary"
          >
            <Plus size={18} />
            Nuevo Paciente
          </button>
        </div>
      </header>

      {/* Calendar */}
      <div className="calendar-container" style={{ flex: 1 }}>
        <WeeklyCalendar
          key={refreshKey}
          professionalId={loggedProfessionalId}
          onSlotSelect={handleSlotSelect}
          previewAppointment={previewAppointment}
        />
      </div>

      {/* Smart Schedule Modal */}
      <SmartScheduleModal
        isOpen={!!scheduleSlot}
        onClose={handleCloseSchedule}
        slotInfo={scheduleSlot}
        professionalId={loggedProfessionalId}
        onSchedule={handleSchedule}
        onPreviewChange={handlePreviewChange}
      />

      {/* Patient Modal */}
      <Modal
        isOpen={modalPatient}
        onClose={() => setModalPatient(false)}
        title="Registrar Nuevo Paciente"
      >
        <NuevoPaciente
          professionalId={loggedProfessionalId}
          onSuccess={() => setModalPatient(false)}
        />
      </Modal>
    </main>
  );
}