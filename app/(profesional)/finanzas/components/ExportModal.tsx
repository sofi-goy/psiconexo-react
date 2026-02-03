"use client";
import { useState } from 'react';
import { X, Download, Calendar } from 'lucide-react';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onExport: (month: string, year: number) => void;
};

const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function ExportModal({ isOpen, onClose, onExport }: Props) {
    const currentDate = new Date();
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

    const handleExport = () => {
        onExport(MONTHS[selectedMonth], selectedYear);
        onClose();
    };

    if (!isOpen) return null;

    // Generate year options (current year and 2 previous)
    const years = [
        currentDate.getFullYear(),
        currentDate.getFullYear() - 1,
        currentDate.getFullYear() - 2,
    ];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-small" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Exportar Reporte</h2>
                    <button className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="export-content">
                    <p className="export-description">
                        Seleccioná el mes para descargar el pack completo para tu contador.
                    </p>

                    <div className="export-selectors">
                        <div className="form-group">
                            <label>Mes</label>
                            <div className="select-container">
                                <Calendar size={16} className="select-icon" />
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                >
                                    {MONTHS.map((month, index) => (
                                        <option key={month} value={index}>
                                            {month}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Año</label>
                            <div className="select-container">
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                >
                                    {years.map(year => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-actions">
                    <button type="button" className="btn-secondary" onClick={onClose}>
                        Cancelar
                    </button>
                    <button
                        type="button"
                        className="btn-primary export-btn"
                        onClick={handleExport}
                    >
                        <Download size={16} />
                        Descargar Pack Contador
                    </button>
                </div>
            </div>
        </div>
    );
}
