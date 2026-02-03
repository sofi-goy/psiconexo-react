"use client";
import { useState, useCallback } from 'react';
import { CheckCircle, Clock, Paperclip, FileText, Loader2, Check } from 'lucide-react';

type PaymentStatus = 'paid' | 'pending' | 'receipt';
type FiscalStatus = 'invoiced' | 'pending';
type PaymentMethod = 'mercadopago' | 'transfer' | 'cash';

export type Transaction = {
    id: string;
    date: Date;
    patientName: string;
    concept: string;
    amount: number;
    paymentStatus: PaymentStatus;
    paymentMethod?: PaymentMethod;
    fiscalStatus: FiscalStatus;
    receiptUrl?: string;
};

type Props = {
    transactions: Transaction[];
    onViewReceipt: (url: string) => void;
    onGenerateInvoice: (transactionId: string) => Promise<void>;
    onShowToast: (message: string) => void;
};

function formatRelativeDate(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return `Hoy, ${date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

function PaymentStatusBadge({ status, method }: { status: PaymentStatus; method?: PaymentMethod }) {
    if (status === 'paid') {
        const methodLabel = method === 'mercadopago' ? 'MP' : method === 'transfer' ? 'Transf.' : 'Efectivo';
        return (
            <span className="payment-badge paid">
                <CheckCircle size={14} />
                Cobrado ({methodLabel})
            </span>
        );
    }
    if (status === 'pending') {
        return (
            <span className="payment-badge pending">
                <Clock size={14} />
                Pendiente
            </span>
        );
    }
    return (
        <span className="payment-badge receipt">
            <Paperclip size={14} />
            Ver Comprobante
        </span>
    );
}

function InvoiceButton({
    fiscalStatus,
    paymentStatus,
    transactionId,
    patientName,
    onGenerate,
    onShowToast
}: {
    fiscalStatus: FiscalStatus;
    paymentStatus: PaymentStatus;
    transactionId: string;
    patientName: string;
    onGenerate: (id: string) => Promise<void>;
    onShowToast: (message: string) => void;
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [isComplete, setIsComplete] = useState(fiscalStatus === 'invoiced');

    const handleClick = useCallback(async () => {
        if (isComplete || isLoading) return;

        setIsLoading(true);
        try {
            await onGenerate(transactionId);
            setIsComplete(true);
            onShowToast(`Factura generada y enviada al mail de ${patientName}`);
        } catch {
            onShowToast('Error al generar factura');
        } finally {
            setIsLoading(false);
        }
    }, [transactionId, patientName, onGenerate, onShowToast, isLoading, isComplete]);

    if (isComplete) {
        return (
            <span className="invoice-badge invoiced">
                <FileText size={14} />
                Facturado
            </span>
        );
    }

    const isPaid = paymentStatus === 'paid';

    return (
        <button
            className={`invoice-btn ${!isPaid ? 'disabled' : ''}`}
            onClick={handleClick}
            disabled={isLoading || !isPaid}
            title={!isPaid ? 'Solo se puede emitir factura cuando el pago está cobrado' : ''}
        >
            {isLoading ? (
                <>
                    <Loader2 size={14} className="animate-spin" />
                    Generando...
                </>
            ) : (
                <>
                    <FileText size={14} />
                    Emitir Factura
                </>
            )}
        </button>
    );
}

export function TransactionTable({ transactions, onViewReceipt, onGenerateInvoice, onShowToast }: Props) {
    return (
        <div className="transaction-table-container">
            <table className="transaction-table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Paciente</th>
                        <th>Concepto</th>
                        <th>Monto</th>
                        <th>Estado Pago</th>
                        <th>Estado Fiscal</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map(tx => (
                        <tr key={tx.id}>
                            <td className="tx-date">{formatRelativeDate(tx.date)}</td>
                            <td className="tx-patient">{tx.patientName}</td>
                            <td className="tx-concept">{tx.concept}</td>
                            <td className="tx-amount">{formatCurrency(tx.amount)}</td>
                            <td>
                                {tx.paymentStatus === 'receipt' ? (
                                    <button
                                        className="payment-badge receipt clickable"
                                        onClick={() => tx.receiptUrl && onViewReceipt(tx.receiptUrl)}
                                    >
                                        <Paperclip size={14} />
                                        Ver Comprobante
                                    </button>
                                ) : (
                                    <PaymentStatusBadge
                                        status={tx.paymentStatus}
                                        method={tx.paymentMethod}
                                    />
                                )}
                            </td>
                            <td>
                                <InvoiceButton
                                    fiscalStatus={tx.fiscalStatus}
                                    paymentStatus={tx.paymentStatus}
                                    transactionId={tx.id}
                                    patientName={tx.patientName}
                                    onGenerate={onGenerateInvoice}
                                    onShowToast={onShowToast}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
