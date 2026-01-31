import Link from 'next/link';
import './sidebar.css'; 

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>PsicoNexo</h2>
      </div>

      <nav className="sidebar-nav">
        <Link href="/" className="nav-item active">
          📅 <span>Mi Agenda</span>
        </Link>
        
        <Link href="/pacientes" className="nav-item">
          👥 <span>Mis Pacientes</span>
        </Link>

        <Link href="/perfil" className="nav-item">
          ⚙️ <span>Configuración</span>
        </Link>
      </nav>

      <div className="sidebar-footer">
        <button className="share-btn">
          🔗 Copiar Link Púbico
        </button>
        <div className="user-info">
          <div className="avatar">D</div>
          <span>Dr. House</span>
        </div>
      </div>
    </aside>
  );
}