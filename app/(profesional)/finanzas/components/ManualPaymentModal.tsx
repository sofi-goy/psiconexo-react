"use client";
import { useState, useMemo } from 'react';
import { X, Search, DollarSign } from 'lucide-react';

type Patient = {
    id: number;
    name: string;
};

type PaymentMethod = 'cash' | 'transfer' | 'mercadopago';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: {
        patientId: number;
        patientName: string;
        amount: number;
        method: PaymentMethod;
        generateInvoice: boolean;
    }) => void;
    patients: Patient[];
};

export function ManualPaymentModal({ isOpen, onClose, onSave, patients }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState<PaymentMethod>('cash');
    const [generateInvoice, setGenerateInvoice] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const filteredPatients = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const query = searchQuery.toLowerCase();
        return patients.filter(p =>
            p.name.toLowerCase().includes(query)
        ).slice(0, 5);
    }, [searchQuery, patients]);

    const handleSelectPatient = (patient: Patient) => {
        setSelectedPatient(patient);
        setSearchQuery(patient.name);
        setShowDropdown(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPatient || !amount) return;

        onSave({
            patientId: selectedPatient.id,
            patientName: selectedPatient.name,
            amount: parseFloat(amount),
            method,
            generateInvoice,
        });

        // Reset form
        setSearchQuery('');
        setSelectedPatient(null);
        setAmount('');
        setMethod('cash');
        setGenerateInvoice(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Registrar Cobro Manual</h2>
                    <button className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    {/* Patient Search */}
                    <div className="form-group">
                        <label>Paciente</label>
                        <div className="search-input-container">
                            <Search size={16} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Buscar paciente..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setSelectedPatient(null);
                                    setShowDropdown(true);
                                }}
                                onFocus={() => setShowDropdown(true)}
                            />
                            {showDropdown && filteredPatients.length > 0 && (
                                <div className="patient-dropdown">
                                    {filteredPatients.map(patient => (
                                        <button
                                            key={patient.id}
                                            type="button"
                                            className="patient-option"
                                            onClick={() => handleSelectPatient(patient)}
                                        >
                                            {patient.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Amount */}
                    <div className="form-group">
                        <label>Monto</label>
                        <div className="amount-input-container">
                            <DollarSign size={16} className="amount-icon" />
                            <input
                                type="number"
                                placeholder="15000"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min="0"
                                step="100"
                            />
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="form-group">
                        <label>Medio de Pago</label>
                        <div className="method-buttons">
                            <button
                                type="button"
                                className={`method-btn ${method === 'cash' ? 'active' : ''}`}
                                onClick={() => setMethod('cash')}
                            >
                                Efectivo
                            </button>
                            <button
                                type="button"
                                className={`method-btn ${method === 'transfer' ? 'active' : ''}`}
                                onClick={() => setMethod('transfer')}
                            >
                                Transferencia
                            </button>
                            <button
                                type="button"
                                className={`method-btn ${method === 'mercadopago' ? 'active' : ''}`}
                                onClick={() => setMethod('mercadopago')}
                            >
                                Mercado Pago
                            </button>
                        </div>
                    </div>

                    {/* Generate Invoice Checkbox */}
                    <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={generateInvoice}
                                onChange={(e) => setGenerateInvoice(e.target.checked)}
                            />
                            <span className="checkmark"></span>
                            Generar factura ahora
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={!selectedPatient || !amount}
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
