"use client";
import { useState } from 'react';
import { Mail, Lock, Bell, Eye, EyeOff, Check } from 'lucide-react';

export function SecurityTab() {
    const [email] = useState('drhouse@psiconexo.com');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        current: '',
        new: '',
        confirm: '',
    });
    const [notifications, setNotifications] = useState({
        weeklyReport: true,
        newAppointment: true,
        paymentReceived: true,
    });
    const [passwordChanged, setPasswordChanged] = useState(false);

    const handlePasswordChange = (field: string, value: string) => {
        setPasswordData(prev => ({ ...prev, [field]: value }));
        setPasswordChanged(false);
    };

    const handleSavePassword = () => {
        // Simulate password change
        if (passwordData.new !== passwordData.confirm) {
            alert('Las contraseñas no coinciden');
            return;
        }
        if (passwordData.new.length < 8) {
            alert('La contraseña debe tener al menos 8 caracteres');
            return;
        }
        setPasswordChanged(true);
        setPasswordData({ current: '', new: '', confirm: '' });
    };

    const handleNotificationChange = (field: string, value: boolean) => {
        setNotifications(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="tab-content">
            <header className="tab-header">
                <h1>Cuenta y Seguridad</h1>
                <p>Administra tu cuenta y preferencias de seguridad</p>
            </header>

            <div className="form-sections">
                {/* Email */}
                <section className="form-section">
                    <div className="section-header">
                        <Mail size={20} />
                        <h3>Correo Electrónico</h3>
                    </div>
                    <div className="form-group">
                        <label>Email de la cuenta</label>
                        <div className="email-display">
                            <input
                                type="email"
                                value={email}
                                disabled
                                className="disabled-input"
                            />
                            <span className="verified-badge">
                                <Check size={12} />
                                Verificado
                            </span>
                        </div>
                        <span className="form-hint">
                            Para cambiar tu email, contacta a soporte.
                        </span>
                    </div>
                </section>

                {/* Password */}
                <section className="form-section">
                    <div className="section-header">
                        <Lock size={20} />
                        <h3>Cambiar Contraseña</h3>
                    </div>

                    {passwordChanged && (
                        <div className="success-message">
                            <Check size={16} />
                            Contraseña actualizada correctamente
                        </div>
                    )}

                    <div className="password-form">
                        <div className="form-group">
                            <label>Contraseña Actual</label>
                            <div className="password-input-container">
                                <input
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    value={passwordData.current}
                                    onChange={(e) => handlePasswordChange('current', e.target.value)}
                                    placeholder="Ingresa tu contraseña actual"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Nueva Contraseña</label>
                            <div className="password-input-container">
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={passwordData.new}
                                    onChange={(e) => handlePasswordChange('new', e.target.value)}
                                    placeholder="Mínimo 8 caracteres"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Confirmar Nueva Contraseña</label>
                            <div className="password-input-container">
                                <input
                                    type="password"
                                    value={passwordData.confirm}
                                    onChange={(e) => handlePasswordChange('confirm', e.target.value)}
                                    placeholder="Repite la nueva contraseña"
                                />
                            </div>
                        </div>

                        <button
                            className="change-password-btn"
                            onClick={handleSavePassword}
                            disabled={!passwordData.current || !passwordData.new || !passwordData.confirm}
                        >
                            Actualizar Contraseña
                        </button>
                    </div>
                </section>

                {/* Notifications */}
                <section className="form-section">
                    <div className="section-header">
                        <Bell size={20} />
                        <h3>Notificaciones por Email</h3>
                    </div>

                    <div className="notification-options">
                        <label className="notification-option">
                            <input
                                type="checkbox"
                                checked={notifications.weeklyReport}
                                onChange={(e) => handleNotificationChange('weeklyReport', e.target.checked)}
                            />
                            <div className="notification-info">
                                <span className="notification-title">Resumen semanal</span>
                                <span className="notification-desc">
                                    Recibe un resumen de tu actividad cada lunes.
                                </span>
                            </div>
                        </label>

                        <label className="notification-option">
                            <input
                                type="checkbox"
                                checked={notifications.newAppointment}
                                onChange={(e) => handleNotificationChange('newAppointment', e.target.checked)}
                            />
                            <div className="notification-info">
                                <span className="notification-title">Nuevos turnos</span>
                                <span className="notification-desc">
                                    Notificación cuando un paciente agenda un turno.
                                </span>
                            </div>
                        </label>

                        <label className="notification-option">
                            <input
                                type="checkbox"
                                checked={notifications.paymentReceived}
                                onChange={(e) => handleNotificationChange('paymentReceived', e.target.checked)}
                            />
                            <div className="notification-info">
                                <span className="notification-title">Pagos recibidos</span>
                                <span className="notification-desc">
                                    Notificación cuando recibes un pago.
                                </span>
                            </div>
                        </label>
                    </div>
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
