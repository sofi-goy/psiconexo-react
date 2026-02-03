"use client";
import { useState } from 'react';
import { User, Calendar, CreditCard, Shield, ChevronDown } from 'lucide-react';
import { ProfileTab } from './components/ProfileTab';
import { ScheduleTab } from './components/ScheduleTab';
import { BillingTab } from './components/BillingTab';
import { SecurityTab } from './components/SecurityTab';
import './styles.css';

type SectionId = 'profile' | 'schedule' | 'billing' | 'security';

type Section = {
    id: SectionId;
    title: string;
    icon: React.ReactNode;
    component: React.ReactNode;
};

export default function ConfiguracionPage() {
    const [expandedSections, setExpandedSections] = useState<Set<SectionId>>(
        new Set(['profile', 'schedule', 'billing', 'security'])
    );

    const toggleSection = (id: SectionId) => {
        setExpandedSections(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const sections: Section[] = [
        { id: 'profile', title: 'Perfil Profesional', icon: <User size={20} />, component: <ProfileTab /> },
        { id: 'schedule', title: 'Agenda y Horarios', icon: <Calendar size={20} />, component: <ScheduleTab /> },
        { id: 'billing', title: 'Datos de Cobro', icon: <CreditCard size={20} />, component: <BillingTab /> },
        { id: 'security', title: 'Cuenta y Seguridad', icon: <Shield size={20} />, component: <SecurityTab /> },
    ];

    return (
        <div className="config-page">
            <header className="config-header">
                <h1>Configuración</h1>
                <p>Administra tu perfil, agenda y preferencias</p>
            </header>

            <div className="config-sections">
                {sections.map(section => (
                    <section key={section.id} className="config-section">
                        <button
                            className={`section-header ${expandedSections.has(section.id) ? 'expanded' : ''}`}
                            onClick={() => toggleSection(section.id)}
                        >
                            <div className="section-title">
                                {section.icon}
                                <h2>{section.title}</h2>
                            </div>
                            <ChevronDown size={20} className="chevron" />
                        </button>

                        {expandedSections.has(section.id) && (
                            <div className="section-content">
                                {section.component}
                            </div>
                        )}
                    </section>
                ))}
            </div>
        </div>
    );
}
