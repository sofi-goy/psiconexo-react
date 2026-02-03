"use client";
import { useState } from 'react';
import { Building2, CreditCard, FileText, Upload, Check, AlertCircle, Info, ExternalLink } from 'lucide-react';

export function BillingTab() {
    const [bankData, setBankData] = useState({
        cbu: '',
        alias: '',
        bank: '',
        titular: '',
        showInEmail: true,
    });

    const [mpStatus, setMpStatus] = useState<'disconnected' | 'connected'>('disconnected');
    const [mpEmail, setMpEmail] = useState('');

    const [afipData, setAfipData] = useState({
        hasCertificate: false,
        hasKey: false,
        puntoVenta: '',
    });

    const handleBankChange = (field: string, value: string | boolean) => {
        setBankData(prev => ({ ...prev, [field]: value }));
    };

    const handleConnectMP = () => {
        // Simulate OAuth flow
        setTimeout(() => {
            setMpStatus('connected');
            setMpEmail('drhouse@gmail.com');
        }, 1000);
    };

    const handleFileUpload = (type: 'certificate' | 'key') => {
        // Simulate file upload
        setTimeout(() => {
            setAfipData(prev => ({
                ...prev,
                [type === 'certificate' ? 'hasCertificate' : 'hasKey']: true,
            }));
        }, 500);
    };

    return (
        <div className="tab-content">
            <header className="tab-header">
                <h1>Datos de Cobro</h1>
                <p>Configura los métodos de pago para tus pacientes</p>
            </header>

            <div className="form-sections">
                {/* Bank Transfer */}
                <section className="form-section">
                    <div className="section-header">
                        <Building2 size={20} />
                        <h3>Transferencia Bancaria</h3>
                    </div>
                    <p className="section-description">
                        Estos datos se mostrarán a los pacientes que elijan pagar por transferencia.
                    </p>

                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label>CBU / CVU</label>
                            <input
                                type="text"
                                value={bankData.cbu}
                                onChange={(e) => handleBankChange('cbu', e.target.value)}
                                placeholder="0000000000000000000000"
                                maxLength={22}
                            />
                        </div>
                        <div className="form-group">
                            <label>Alias</label>
                            <input
                                type="text"
                                value={bankData.alias}
                                onChange={(e) => handleBankChange('alias', e.target.value)}
                                placeholder="mi.alias.banco"
                            />
                        </div>
                        <div className="form-group">
                            <label>Banco</label>
                            <input
                                type="text"
                                value={bankData.bank}
                                onChange={(e) => handleBankChange('bank', e.target.value)}
                                placeholder="Ej: Banco Galicia"
                            />
                        </div>
                        <div className="form-group full-width">
                            <label>Titular de la Cuenta</label>
                            <input
                                type="text"
                                value={bankData.titular}
                                onChange={(e) => handleBankChange('titular', e.target.value)}
                                placeholder="Nombre completo del titular"
                            />
                        </div>
                    </div>

                    <div className="toggle-option">
                        <label className="toggle-label">
                            <input
                                type="checkbox"
                                checked={bankData.showInEmail}
                                onChange={(e) => handleBankChange('showInEmail', e.target.checked)}
                            />
                            <span className="toggle-text">
                                Mostrar estos datos en el mail de confirmación de turno
                            </span>
                        </label>
                    </div>
                </section>

                {/* Mercado Pago */}
                <section className="form-section">
                    <div className="section-header">
                        <CreditCard size={20} />
                        <h3>Mercado Pago</h3>
                    </div>
                    <p className="section-description">
                        Permite a tus pacientes pagar con tarjeta de crédito, débito o dinero en cuenta.
                    </p>

                    {mpStatus === 'disconnected' ? (
                        <button className="mp-connect-btn" onClick={handleConnectMP}>
                            <CreditCard size={18} />
                            Vincular cuenta de Mercado Pago
                            <ExternalLink size={14} />
                        </button>
                    ) : (
                        <div className="mp-connected">
                            <Check size={18} />
                            <span>Conectado como <strong>{mpEmail}</strong></span>
                            <button className="mp-disconnect">Desconectar</button>
                        </div>
                    )}

                    <div className="info-box">
                        <Info size={16} />
                        <p>
                            Mercado Pago aplica una comisión del 5.99% + IVA sobre cada transacción.
                            Esta comisión es establecida y cobrada directamente por Mercado Pago.
                            PsicoNexo no retiene ningún porcentaje adicional de tus cobros.
                        </p>
                    </div>
                </section>

                {/* AFIP */}
                <section className="form-section">
                    <div className="section-header">
                        <FileText size={20} />
                        <h3>Facturación (AFIP)</h3>
                    </div>
                    <p className="section-description">
                        Configura la facturación electrónica para emitir comprobantes automáticamente.
                    </p>

                    <div className="afip-uploads">
                        <div className="upload-box">
                            <div className={`upload-status ${afipData.hasCertificate ? 'success' : ''}`}>
                                {afipData.hasCertificate ? <Check size={20} /> : <Upload size={20} />}
                            </div>
                            <div className="upload-info">
                                <h4>Certificado Digital</h4>
                                <p>Archivo .crt de AFIP</p>
                            </div>
                            <label className="upload-action">
                                <input
                                    type="file"
                                    accept=".crt"
                                    onChange={() => handleFileUpload('certificate')}
                                    hidden
                                />
                                {afipData.hasCertificate ? 'Cambiar' : 'Subir'}
                            </label>
                        </div>

                        <div className="upload-box">
                            <div className={`upload-status ${afipData.hasKey ? 'success' : ''}`}>
                                {afipData.hasKey ? <Check size={20} /> : <Upload size={20} />}
                            </div>
                            <div className="upload-info">
                                <h4>Clave Privada</h4>
                                <p>Archivo .key de AFIP</p>
                            </div>
                            <label className="upload-action">
                                <input
                                    type="file"
                                    accept=".key"
                                    onChange={() => handleFileUpload('key')}
                                    hidden
                                />
                                {afipData.hasKey ? 'Cambiar' : 'Subir'}
                            </label>
                        </div>
                    </div>

                    <div className="form-group" style={{ maxWidth: '200px', marginTop: '16px' }}>
                        <label>Punto de Venta</label>
                        <input
                            type="text"
                            value={afipData.puntoVenta}
                            onChange={(e) => setAfipData(prev => ({ ...prev, puntoVenta: e.target.value }))}
                            placeholder="00001"
                            maxLength={5}
                        />
                    </div>

                    {(!afipData.hasCertificate || !afipData.hasKey) && (
                        <div className="help-link">
                            <AlertCircle size={14} />
                            <a href="#" target="_blank">
                                ¿Cómo obtengo estos archivos de AFIP?
                            </a>
                        </div>
                    )}
                </section>

                {/* Save Button */}
                <div className="form-actions">
                    <button className="save-btn">
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    );
}
