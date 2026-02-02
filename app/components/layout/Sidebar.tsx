"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, Settings, Link as LinkIcon, User, Sliders } from 'lucide-react';
import './sidebar.css';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>PsicoNexo</h2>
      </div>

      <nav className="sidebar-nav">
        <Link
          href="/"
          className={`nav-item ${pathname === '/' ? 'active' : ''}`}
        >
          <CalendarDays size={20} />
          <span>Mi Agenda</span>
        </Link>

        <Link
          href="/reglas-agenda"
          className={`nav-item ${pathname === '/reglas-agenda' ? 'active' : ''}`}
        >
          <Sliders size={20} />
          <span>Reglas de Agenda</span>
        </Link>

        <Link
          href="/configuracion"
          className={`nav-item ${pathname === '/configuracion' ? 'active' : ''}`}
        >
          <Settings size={20} />
          <span>Configuración</span>
        </Link>
      </nav>

      <div className="sidebar-footer">
        <button className="share-btn-gold">
          <LinkIcon size={16} />
          <span>Copiar Link Público</span>
        </button>

        <div className="user-info">
          <div className="avatar">
            <User size={18} />
          </div>
          <div className="user-details">
            <span className="user-name">Dr. House</span>
            <span className="user-role">Psicólogo Clínico</span>
          </div>
        </div>
      </div>
    </aside>
  );
}