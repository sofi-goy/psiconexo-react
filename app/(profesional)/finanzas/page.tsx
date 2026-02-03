"use client";
import { useState, useCallback, useMemo } from 'react';
import { DollarSign, Plus, Download, Search, Filter } from 'lucide-react';
import { KPICard } from './components/KPICard';
import { TransactionTable, Transaction } from './components/TransactionTable';
import { ManualPaymentModal } from './components/ManualPaymentModal';
import { ExportModal } from './components/ExportModal';
import { Toast } from './components/Toast';
import './styles.css';

// Mock patients for autocomplete
const MOCK_PATIENTS = [
    { id: 1, name: 'Mariana López' },
    { id: 2, name: 'Chupete Suazo' },
    { id: 3, name: 'Pedro Martínez' },
    { id: 4, name: 'Ana García' },
    { id: 5, name: 'Lucas Fernández' },
];

// Mock transactions
const MOCK_TRANSACTIONS: Transaction[] = [
    {
        id: '1',
        date: new Date('2026-02-02T14:00:00'),
        patientName: 'Mariana López',
        concept: 'Sesión Terapia Individual',
        amount: 15000,
        paymentStatus: 'paid',
        paymentMethod: 'mercadopago',
        fiscalStatus: 'pending',
    },
    {
        id: '2',
        date: new Date('2026-02-02T10:00:00'),
        patientName: 'Chupete Suazo',
        concept: 'Sesión Terapia Individual',
        amount: 15000,
        paymentStatus: 'paid',
        paymentMethod: 'transfer',
        fiscalStatus: 'invoiced',
    },
    {
        id: '3',
        date: new Date('2026-02-01T16:00:00'),
        patientName: 'Pedro Martínez',
        concept: 'Sesión Terapia Individual',
        amount: 15000,
        paymentStatus: 'pending',
        fiscalStatus: 'pending',
    },
    {
        id: '4',
        date: new Date('2026-02-01T11:00:00'),
        patientName: 'Ana García',
        concept: 'Sesión Terapia Individual',
        amount: 15000,
        paymentStatus: 'receipt',
        receiptUrl: '/mock-receipt.jpg',
        fiscalStatus: 'pending',
    },
    {
        id: '5',
        date: new Date('2026-01-28T15:00:00'),
        patientName: 'Lucas Fernández',
        concept: 'Sesión Terapia Individual',
        amount: 15000,
        paymentStatus: 'paid',
        paymentMethod: 'cash',
        fiscalStatus: 'invoiced',
    },
];

export default function FinanzasPage() {
    const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
    const [isManualPaymentOpen, setIsManualPaymentOpen] = useState(false);
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [toast, setToast] = useState({ message: '', isVisible: false });

    // Search and filters
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'pending' | 'receipt'>('all');
    const [fiscalFilter, setFiscalFilter] = useState<'all' | 'invoiced' | 'pending'>('all');

    // Filter patients for autocomplete
    const filteredPatients = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const query = searchQuery.toLowerCase();
        const uniquePatients = [...new Set(transactions.map(tx => tx.patientName))];
        return uniquePatients.filter(name =>
            name.toLowerCase().includes(query)
        ).slice(0, 5);
    }, [searchQuery, transactions]);

    // Apply filters to transactions
    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx => {
            const matchesSearch = !searchQuery || tx.patientName.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesPayment = paymentFilter === 'all' || tx.paymentStatus === paymentFilter;
            const matchesFiscal = fiscalFilter === 'all' || tx.fiscalStatus === fiscalFilter;
            return matchesSearch && matchesPayment && matchesFiscal;
        });
    }, [transactions, searchQuery, paymentFilter, fiscalFilter]);

    // Calculate KPIs
    const currentMonth = new Date().getMonth();
    const currentMonthTransactions = transactions.filter(
        tx => tx.date.getMonth() === currentMonth && tx.paymentStatus === 'paid'
    );
    const totalIncome = currentMonthTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    const pendingPayments = transactions.filter(tx => tx.paymentStatus === 'pending');
    const pendingAmount = pendingPayments.reduce((sum, tx) => sum + tx.amount, 0);

    const toInvoice = transactions.filter(
        tx => tx.paymentStatus === 'paid' && tx.fiscalStatus === 'pending'
    );
    const toInvoiceAmount = toInvoice.reduce((sum, tx) => sum + tx.amount, 0);

    const showToast = useCallback((message: string) => {
        setToast({ message, isVisible: true });
    }, []);

    const hideToast = useCallback(() => {
        setToast(prev => ({ ...prev, isVisible: false }));
    }, []);

    const handleViewReceipt = useCallback((url: string) => {
        // In real app, open modal with receipt image
        console.log('View receipt:', url);
        showToast('Vista de comprobante (demo)');
    }, [showToast]);

    const handleGenerateInvoice = useCallback(async (transactionId: string) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setTransactions(prev =>
            prev.map(tx =>
                tx.id === transactionId
                    ? { ...tx, fiscalStatus: 'invoiced' as const }
                    : tx
            )
        );
    }, []);

    const handleManualPayment = useCallback((data: {
        patientId: number;
        patientName: string;
        amount: number;
        method: 'cash' | 'transfer' | 'mercadopago';
        generateInvoice: boolean;
    }) => {
        const newTransaction: Transaction = {
            id: `manual-${Date.now()}`,
            date: new Date(),
            patientName: data.patientName,
            concept: 'Sesión Terapia Individual',
            amount: data.amount,
            paymentStatus: 'paid',
            paymentMethod: data.method,
            fiscalStatus: data.generateInvoice ? 'invoiced' : 'pending',
        };

        setTransactions(prev => [newTransaction, ...prev]);
        showToast(`Cobro registrado: ${data.patientName} - $${data.amount.toLocaleString()}`);
    }, [showToast]);

    const handleExport = useCallback((month: string, year: number) => {
        // Simulate download
        showToast(`Descargando reporte de ${month} ${year}...`);

        // In real app, trigger file download
        setTimeout(() => {
            showToast(`Pack de ${month} ${year} descargado`);
        }, 1500);
    }, [showToast]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="finanzas-container">
            {/* Header */}
            <header className="finanzas-header">
                <h1>Finanzas</h1>
                <button
                    className="export-report-btn"
                    onClick={() => setIsExportOpen(true)}
                >
                    <Download size={16} />
                    Exportar Reporte
                </button>
            </header>

            {/* KPI Cards */}
            <div className="kpi-grid">
                <KPICard
                    title="Ingresos Este Mes"
                    value={formatCurrency(totalIncome)}
                    subtitle={`${currentMonthTransactions.length} sesiones cobradas`}
                    trend={{ direction: 'up', percentage: '15%' }}
                    variant="success"
                />
                <KPICard
                    title="Por Cobrar"
                    value={formatCurrency(pendingAmount)}
                    subtitle={`${pendingPayments.length} sesiones pendientes de pago`}
                    variant="warning"
                />
                <KPICard
                    title="A Facturar"
                    value={formatCurrency(toInvoiceAmount)}
                    subtitle={`${toInvoice.length} pagos recibidos sin factura`}
                    variant="info"
                />
            </div>

            {/* Action Bar */}
            <div className="action-bar">
                <button
                    className="manual-payment-btn"
                    onClick={() => setIsManualPaymentOpen(true)}
                >
                    <Plus size={16} />
                    Registrar Cobro Manual
                </button>

                {/* Patient Search */}
                <div className="action-search-container">
                    <Search size={16} className="action-search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar paciente..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowSearchDropdown(true);
                        }}
                        onFocus={() => setShowSearchDropdown(true)}
                        onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
                        className="action-search-input"
                    />
                    {showSearchDropdown && filteredPatients.length > 0 && (
                        <div className="action-search-dropdown">
                            {filteredPatients.map(name => (
                                <button
                                    key={name}
                                    type="button"
                                    className="action-search-option"
                                    onMouseDown={() => {
                                        setSearchQuery(name);
                                        setShowSearchDropdown(false);
                                    }}
                                >
                                    {name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Payment Status Filter */}
                <div className="filter-container">
                    <Filter size={14} className="filter-icon" />
                    <select
                        value={paymentFilter}
                        onChange={(e) => setPaymentFilter(e.target.value as typeof paymentFilter)}
                        className="filter-select"
                    >
                        <option value="all">Estado Pago</option>
                        <option value="paid">Cobrado</option>
                        <option value="pending">Pendiente</option>
                        <option value="receipt">Con Comprobante</option>
                    </select>
                </div>

                {/* Fiscal Status Filter */}
                <div className="filter-container">
                    <Filter size={14} className="filter-icon" />
                    <select
                        value={fiscalFilter}
                        onChange={(e) => setFiscalFilter(e.target.value as typeof fiscalFilter)}
                        className="filter-select"
                    >
                        <option value="all">Estado Fiscal</option>
                        <option value="pending">Por Facturar</option>
                        <option value="invoiced">Facturado</option>
                    </select>
                </div>
            </div>

            {/* Transaction Table */}
            <TransactionTable
                transactions={filteredTransactions}
                onViewReceipt={handleViewReceipt}
                onGenerateInvoice={handleGenerateInvoice}
                onShowToast={showToast}
            />

            {/* Modals */}
            <ManualPaymentModal
                isOpen={isManualPaymentOpen}
                onClose={() => setIsManualPaymentOpen(false)}
                onSave={handleManualPayment}
                patients={MOCK_PATIENTS}
            />

            <ExportModal
                isOpen={isExportOpen}
                onClose={() => setIsExportOpen(false)}
                onExport={handleExport}
            />

            {/* Toast */}
            <Toast
                message={toast.message}
                isVisible={toast.isVisible}
                onHide={hideToast}
            />
        </div>
    );
}
