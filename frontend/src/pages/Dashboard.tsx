import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from '../components/AdminDashboard';
import CaissierDashboard from '../components/CaissierDashboard';
import ServeurDashboard from '../components/ServeurDashboard';
import ReceptionDashboard from '../components/ReceptionDashboard';
import Logo from '../components/Logo';

const Dashboard: React.FC = () => {
  const { user, logout, isAdmin, isCaissier, isServeur } = useAuth();
  const navigate = useNavigate();
  const isReception = user?.role === 'RECEPTION';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <header style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)', color: 'white', padding: '1rem 2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Logo size={55} variant="icon" />
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: '700', margin: 0, letterSpacing: '0.5px' }}>YOU CAISSE PRO</h1>
              <p style={{ fontSize: '0.75rem', margin: 0, opacity: 0.85, fontWeight: '500' }}>YOU VOYAGE COMPANY</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ textAlign: 'right', borderRight: '1px solid rgba(255,255,255,0.3)', paddingRight: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', opacity: 0.9, fontWeight: '600' }}>📞 Contact</div>
              <div style={{ fontSize: '1rem', fontWeight: '700', letterSpacing: '0.5px' }}>06 16 73 41 71</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.95rem', opacity: 0.95, fontWeight: '600' }}>{user?.prenom} {user?.nom}</span>
              <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{user?.role}</span>
            </div>
            <button
              onClick={handleLogout}
              style={{ padding: '0.6rem 1.2rem', background: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.6)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', transition: 'all 0.3s', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.35)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {isAdmin && <AdminDashboard />}
        {isCaissier && <CaissierDashboard />}
        {isServeur && <ServeurDashboard />}
        {isReception && <ReceptionDashboard />}
      </main>
    </div>
  );
};

export default Dashboard;
