"use client";
import { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import { User, Mail, Phone, Clock, DollarSign, RotateCcw, X, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import './smart-schedule-modal.css';

type Client = {
    id: number;
    name: string;
    email?: string;
    phone?: string;
};

type SlotInfo = {
    start: Date;
    end: Date;
};

type Props = {
    isOpen: boolean;
    onClose: () => void;
    slotInfo: SlotInfo | null;
    professionalId: number;
    onSchedule: (appointment: any) => void;
    onPreviewChange: (preview: any | null) => void;
};

type ClientOption = {
    value: number | 'new';
    label: string;
    client?: Client;
    isNew?: boolean;
};

const DURATION_OPTIONS = [
    { value: 30, label: '30 min' },
    { value: 45, label: '45 min' },
    { value: 60, label: '1 hora' },
    { value: 90, label: '1.5 horas' },
    { value: 120, label: '2 horas' },
    { value: 'custom', label: 'Personalizar...' },
];

export function SmartScheduleModal({ isOpen, onClose, slotInfo, professionalId, onSchedule, onPreviewChange }: Props) {
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedClient, setSelectedClient] = useState<ClientOption | null>(null);
    const [inputValue, setInputValue] = useState('');

    // Form state - editable date/time
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [newClientName, setNewClientName] = useState('');
    const [newClientEmail, setNewClientEmail] = useState('');
    const [newClientPhone, setNewClientPhone] = useState('');
    const [duration, setDuration] = useState(60);
    const [showCustomDuration, setShowCustomDuration] = useState(false);
    const [customDuration, setCustomDuration] = useState(60);
    const [price, setPrice] = useState(0);
    const [isRecurring, setIsRecurring] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Draggable state
    const modalRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Fetch clients
    useEffect(() => {
        if (!isOpen) return;

        async function loadClients() {
            try {
                const res = await fetch(`http://localhost:8080/api/v1/clients?professional_id=${professionalId}`);
                if (res.ok) {
                    const data = await res.json();
                    setClients(data || []);
                }
            } catch (e) {
                console.error(e);
            }
        }
        loadClients();
    }, [isOpen, professionalId]);

    // Initialize form when modal opens with slot info
    useEffect(() => {
        if (isOpen && slotInfo) {
            // Calculate duration from drag selection
            const draggedMinutes = Math.round((slotInfo.end.getTime() - slotInfo.start.getTime()) / 60000);
            // Use dragged duration if meaningful (>= 15 min), otherwise default to 60
            const initialDuration = draggedMinutes >= 15 ? draggedMinutes : 60;

            setSelectedDate(format(slotInfo.start, 'yyyy-MM-dd'));
            setSelectedTime(format(slotInfo.start, 'HH:mm'));
            setSelectedClient(null);
            setNewClientName('');
            setNewClientEmail('');
            setNewClientPhone('');
            setDuration(initialDuration);
            setShowCustomDuration(false);
            setCustomDuration(initialDuration);
            setPrice(0);
            setIsRecurring(false);
            setInputValue('');
            setPosition({ x: 0, y: 0 });

            // Trigger initial preview
            updatePreview(format(slotInfo.start, 'yyyy-MM-dd'), format(slotInfo.start, 'HH:mm'), initialDuration);
        }
    }, [isOpen, slotInfo]);

    // Update preview when date/time/duration changes
    const updatePreview = (date: string, time: string, dur: number) => {
        if (!date || !time) return;

        const [y, m, d] = date.split('-').map(Number);
        const [h, min] = time.split(':').map(Number);
        const start = new Date(y, m - 1, d, h, min);

        onPreviewChange({
            id: -1, // Preview ID
            date: date,
            start_time: time,
            duration_minutes: dur,
            client_id: 0,
            client_name: selectedClient?.isNew ? newClientName : selectedClient?.client?.name || 'Nueva cita',
            isPreview: true,
        });
    };

    // Effect to update preview on form changes
    useEffect(() => {
        if (isOpen) {
            const effectiveDuration = showCustomDuration ? customDuration : duration;
            updatePreview(selectedDate, selectedTime, effectiveDuration);
        }
    }, [selectedDate, selectedTime, duration, customDuration, showCustomDuration, selectedClient, newClientName, isOpen]);

    // Clear preview on close
    const handleClose = () => {
        onPreviewChange(null);
        onClose();
    };

    // Dragging handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.modal-drag-handle')) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        }
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                setPosition({
                    x: e.clientX - dragStart.x,
                    y: e.clientY - dragStart.y,
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragStart]);

    // Build options for combobox
    const options: ClientOption[] = clients
        .filter(c => c.name.toLowerCase().includes(inputValue.toLowerCase()))
        .map(c => ({
            value: c.id,
            label: c.name + (c.email ? ` (${c.email})` : ''),
            client: c,
        }));

    if (inputValue.trim()) {
        options.push({
            value: 'new',
            label: `+ Crear nuevo: "${inputValue}"`,
            isNew: true,
        });
    }

    const handleClientChange = (option: ClientOption | null) => {
        setSelectedClient(option);
        if (option?.isNew) {
            setNewClientName(inputValue);
        } else {
            setNewClientName('');
            setNewClientEmail('');
            setNewClientPhone('');
        }
    };

    const handleDurationChange = (value: number | 'custom') => {
        if (value === 'custom') {
            setShowCustomDuration(true);
        } else {
            setShowCustomDuration(false);
            setDuration(value);
        }
    };

    const handleSubmit = async () => {
        if (!selectedDate || !selectedTime) return;
        setIsSubmitting(true);

        const effectiveDuration = showCustomDuration ? customDuration : duration;

        try {
            let clientId: number;
            let clientName: string;

            if (selectedClient?.isNew) {
                const clientRes = await fetch('http://localhost:8080/api/v1/clients', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        professional_id: professionalId,
                        name: newClientName,
                        email: newClientEmail || null,
                        phone: newClientPhone || null,
                        active: true,
                    }),
                });
                if (!clientRes.ok) throw new Error('Error creando paciente');
                const newClient = await clientRes.json();
                clientId = newClient.id;
                clientName = newClientName;
            } else if (selectedClient?.value && typeof selectedClient.value === 'number') {
                clientId = selectedClient.value;
                clientName = selectedClient.client?.name || '';
            } else {
                alert('Selecciona un paciente');
                setIsSubmitting(false);
                return;
            }

            const endpoint = isRecurring
                ? 'http://localhost:8080/api/v1/recurring-rules'
                : 'http://localhost:8080/api/v1/appointments';

            const [y, m, d] = selectedDate.split('-').map(Number);
            const dateObj = new Date(y, m - 1, d);

            const payload = isRecurring ? {
                professional_id: professionalId,
                client_id: clientId,
                day_of_week: dateObj.getDay() === 0 ? 7 : dateObj.getDay(),
                start_time: selectedTime,
                duration: effectiveDuration,
                price: price,
                start_date: selectedDate,
            } : {
                professional_id: professionalId,
                client_id: clientId,
                date: selectedDate,
                start_time: selectedTime,
                duration: effectiveDuration,
                price: price,
            };

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error('Error al agendar');

            // For recurring rules, add small delay to let backend generate instances
            if (isRecurring) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            const confirmedAppointment = {
                id: Date.now(),
                date: selectedDate,
                start_time: selectedTime,
                duration_minutes: effectiveDuration,
                client_id: clientId,
                client_name: clientName,
                pending: false,
            };

            onSchedule(confirmedAppointment);
            onPreviewChange(null);
            onClose();

        } catch (error) {
            console.error(error);
            alert('Error al agendar la cita');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const effectiveDuration = showCustomDuration ? customDuration : duration;

    return (
        <div className="smart-modal-overlay" onClick={handleClose}>
            <div
                ref={modalRef}
                className="smart-modal"
                style={{
                    transform: `translate(${position.x}px, ${position.y}px)`,
                    cursor: isDragging ? 'grabbing' : 'default',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header - Draggable */}
                <div
                    className="smart-modal-header modal-drag-handle"
                    onMouseDown={handleMouseDown}
                    style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                >
                    <div>
                        <h2>Nueva Sesión</h2>
                    </div>
                    <button className="smart-modal-close" onClick={handleClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="smart-modal-body">
                    {/* Editable Date/Time */}
                    <div className="datetime-row">
                        <div className="form-group">
                            <label>
                                <Calendar size={16} />
                                Fecha
                            </label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>
                                <Clock size={16} />
                                Hora
                            </label>
                            <input
                                type="time"
                                value={selectedTime}
                                onChange={(e) => setSelectedTime(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Patient Combobox */}
                    <div className="form-group">
                        <label>
                            <User size={16} />
                            Paciente
                        </label>
                        <Select
                            options={options}
                            value={selectedClient}
                            onChange={handleClientChange}
                            onInputChange={setInputValue}
                            inputValue={inputValue}
                            placeholder="Buscar paciente..."
                            noOptionsMessage={() => "Escribe para buscar o crear"}
                            isClearable
                            classNamePrefix="patient-select"
                            formatOptionLabel={(option) => (
                                <span>{option.isNew ? option.label : (option.client?.name || option.label)}</span>
                            )}
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    backgroundColor: 'var(--color-surface)',
                                    borderColor: 'var(--color-border)',
                                    minHeight: 44,
                                    '&:hover': { borderColor: 'var(--color-primary)' },
                                }),
                                menu: (base) => ({
                                    ...base,
                                    backgroundColor: 'var(--color-surface)',
                                    border: '1px solid var(--color-border)',
                                    boxShadow: 'var(--shadow-lg)',
                                    zIndex: 100,
                                }),
                                option: (base, state) => ({
                                    ...base,
                                    backgroundColor: state.isFocused ? 'var(--color-primary-light)' : 'transparent',
                                    color: 'var(--color-text-primary)',
                                    cursor: 'pointer',
                                }),
                                singleValue: (base) => ({
                                    ...base,
                                    color: 'var(--color-text-primary)',
                                }),
                                input: (base) => ({
                                    ...base,
                                    color: 'var(--color-text-primary)',
                                }),
                            }}
                        />
                    </div>

                    {/* New client fields */}
                    {selectedClient?.isNew && (
                        <div className="new-client-fields">
                            <div className="form-group">
                                <label>
                                    <Mail size={16} />
                                    Email (opcional)
                                </label>
                                <input
                                    type="email"
                                    value={newClientEmail}
                                    onChange={e => setNewClientEmail(e.target.value)}
                                    placeholder="paciente@email.com"
                                />
                            </div>
                            <div className="form-group">
                                <label>
                                    <Phone size={16} />
                                    Teléfono (opcional)
                                </label>
                                <input
                                    type="tel"
                                    value={newClientPhone}
                                    onChange={e => setNewClientPhone(e.target.value)}
                                    placeholder="+54 9 11 1234-5678"
                                />
                            </div>
                        </div>
                    )}

                    {/* Duration and Price */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>
                                <Clock size={16} />
                                Duración
                            </label>
                            {showCustomDuration ? (
                                <div className="custom-duration-input">
                                    <input
                                        type="number"
                                        value={customDuration}
                                        onChange={(e) => setCustomDuration(Math.max(5, Number(e.target.value)))}
                                        min="5"
                                        max="480"
                                    />
                                    <span className="duration-suffix">min</span>
                                    <button
                                        type="button"
                                        className="btn-back-preset"
                                        onClick={() => setShowCustomDuration(false)}
                                        title="Volver a opciones"
                                    >
                                        ←
                                    </button>
                                </div>
                            ) : (
                                <select
                                    value={duration}
                                    onChange={e => handleDurationChange(e.target.value === 'custom' ? 'custom' : Number(e.target.value))}
                                >
                                    {DURATION_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                        <div className="form-group">
                            <label>
                                <DollarSign size={16} />
                                Precio
                            </label>
                            <input
                                type="number"
                                value={price}
                                onChange={e => setPrice(Number(e.target.value))}
                                placeholder="0"
                                min="0"
                            />
                        </div>
                    </div>

                    {/* Recurring toggle */}
                    <div className="recurring-toggle">
                        <label className="toggle-label">
                            <input
                                type="checkbox"
                                checked={isRecurring}
                                onChange={e => setIsRecurring(e.target.checked)}
                            />
                            <span className="toggle-switch"></span>
                            <RotateCcw size={16} />
                            Repetir semanalmente
                        </label>
                        {isRecurring && selectedDate && (
                            <p className="recurring-hint">
                                Se agendará todos los {format(new Date(selectedDate + 'T12:00:00'), 'EEEE', { locale: es })} a las {selectedTime} indefinidamente
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="smart-modal-footer">
                    <button className="btn-cancel" onClick={handleClose}>
                        Cancelar
                    </button>
                    <button
                        className="btn-schedule"
                        onClick={handleSubmit}
                        disabled={!selectedClient || isSubmitting}
                    >
                        {isSubmitting ? 'Agendando...' : 'Agendar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
