"use client";
import { useState } from 'react';
import { Camera, Link as LinkIcon, Check, AlertCircle } from 'lucide-react';

export function ProfileTab() {
    const [formData, setFormData] = useState({
        firstName: 'Gregory',
        lastName: 'House',
        title: 'Lic. en Psicología',
        matricula: 'MN 12345',
        slug: 'dr-house',
        bio: 'Especialista en TCC y ansiedad. Más de 10 años de experiencia.',
    });
    const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSlugChange = (value: string) => {
        // Sanitize slug
        const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '-');
        handleChange('slug', sanitized);

        // Simulate availability check
        setSlugStatus('checking');
        setTimeout(() => {
            setSlugStatus(sanitized === 'taken-slug' ? 'taken' : 'available');
        }, 500);
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="tab-content">
            <header className="tab-header">
                <h1>Perfil Profesional</h1>
                <p>Configura cómo te ven los pacientes en tu link público</p>
            </header>

            <div className="form-sections">
                {/* Photo Upload */}
                <section className="form-section small">
                    <h3>Foto de Perfil</h3>
                    <div className="photo-upload">
                        <div className="photo-preview">
                            {photoPreview ? (
                                <img src={photoPreview} alt="Preview" />
                            ) : (
                                <div className="photo-placeholder">
                                    <Camera size={32} />
                                </div>
                            )}
                        </div>
                        <div className="photo-actions">
                            <label className="upload-btn">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    hidden
                                />
                                Subir Foto
                            </label>
                            <span className="photo-hint">JPG, PNG. Máximo 2MB</span>
                        </div>
                    </div>
                </section>

                {/* Basic Info */}
                <section className="form-section medium">
                    <h3>Datos Básicos</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Nombre</label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => handleChange('firstName', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Apellido</label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => handleChange('lastName', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Título Profesional</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                placeholder="Ej: Lic. en Psicología"
                            />
                        </div>
                        <div className="form-group">
                            <label>Matrícula <span className="optional">(opcional)</span></label>
                            <input
                                type="text"
                                value={formData.matricula}
                                onChange={(e) => handleChange('matricula', e.target.value)}
                                placeholder="Ej: MN 12345"
                            />
                        </div>
                    </div>
                </section>

                {/* Public Link */}
                <section className="form-section">
                    <h3>Link Público</h3>
                    <p className="section-description">
                        Este es el link que compartirás con tus pacientes para agendar turnos.
                    </p>
                    <div className="slug-input-container">
                        <span className="slug-prefix">
                            <LinkIcon size={14} />
                            psiconexo.com/
                        </span>
                        <input
                            type="text"
                            value={formData.slug}
                            onChange={(e) => handleSlugChange(e.target.value)}
                            className="slug-input"
                        />
                        <span className={`slug-status ${slugStatus}`}>
                            {slugStatus === 'checking' && 'Verificando...'}
                            {slugStatus === 'available' && (
                                <>
                                    <Check size={14} />
                                    Disponible
                                </>
                            )}
                            {slugStatus === 'taken' && (
                                <>
                                    <AlertCircle size={14} />
                                    No disponible
                                </>
                            )}
                        </span>
                    </div>
                </section>

                {/* Bio */}
                <section className="form-section full-width">
                    <h3>Bio Corta</h3>
                    <p className="section-description">
                        Una descripción breve que aparecerá en tu perfil público.
                    </p>
                    <div className="form-group">
                        <textarea
                            value={formData.bio}
                            onChange={(e) => handleChange('bio', e.target.value.slice(0, 140))}
                            maxLength={140}
                            rows={3}
                            placeholder="Especialista en TCC y ansiedad..."
                        />
                        <span className="char-count">{formData.bio.length}/140</span>
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
