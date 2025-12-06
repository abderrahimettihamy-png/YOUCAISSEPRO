import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';
import type { User } from '../types';
import { UserRole } from '../types';
import CategoriesProducts from './CategoriesProducts';
import PrinterManagement from './PrinterManagement';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'products' | 'printers'>('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [formData, setFormData] = useState<{
    username: string;
    password: string;
    role: UserRole;
    nom: string;
    prenom: string;
  }>({
    username: '',
    password: '',
    role: UserRole.SERVEUR,
    nom: '',
    prenom: '',
  });

  useEffect(() => {
    loadUsers();
    loadStats();
    const interval = setInterval(loadStats, 5000); // Refresh toutes les 5 secondes
    return () => clearInterval(interval);
  }, []);

  const loadUsers = async () => {
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
    }
  };

  const loadStats = async () => {
    try {
      const data = await userService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userService.create(formData);
      setShowForm(false);
      setFormData({ username: '', password: '', role: UserRole.SERVEUR, nom: '', prenom: '' });
      loadUsers();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erreur lors de la création');
    }
  };

  const handleResetPassword = async (userId: number) => {
    if (!newPassword || newPassword.length < 4) {
      alert('Le mot de passe doit contenir au moins 4 caractères');
      return;
    }
    try {
      await userService.resetPassword(userId, newPassword);
      alert('Mot de passe réinitialisé avec succès');
      setShowResetPassword(null);
      setNewPassword('');
    } catch (error) {
      alert('Erreur lors de la réinitialisation');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Confirmer la suppression?')) {
      try {
        await userService.delete(id);
        loadUsers();
      } catch (error) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const formatCurrency = (amount: number) => `${amount.toFixed(2)} MAD`;

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #eee' }}>
        <button
          onClick={() => setActiveTab('dashboard')}
          style={{
            padding: '1rem 2rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'dashboard' ? '3px solid #667eea' : '3px solid transparent',
            color: activeTab === 'dashboard' ? '#667eea' : '#666',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          📊 Tableau de bord
        </button>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '1rem 2rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'users' ? '3px solid #667eea' : '3px solid transparent',
            color: activeTab === 'users' ? '#667eea' : '#666',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          👤 Utilisateurs
        </button>
        <button
          onClick={() => setActiveTab('products')}
          style={{
            padding: '1rem 2rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'products' ? '3px solid #667eea' : '3px solid transparent',
            color: activeTab === 'products' ? '#667eea' : '#666',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          🍽️ Catégories & Produits
        </button>
        <button
          onClick={() => setActiveTab('printers')}
          style={{
            padding: '1rem 2rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'printers' ? '3px solid #667eea' : '3px solid transparent',
            color: activeTab === 'printers' ? '#667eea' : '#666',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          🖨️ Imprimantes
        </button>
      </div>

      {activeTab === 'dashboard' && stats && (
        <div>
          {/* Statistiques du jour */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '1.5rem', borderRadius: '15px', color: 'white', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)' }}>
              <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>💰 Chiffre d'affaire du jour</div>
              <div style={{ fontSize: '2rem', fontWeight: '700' }}>{formatCurrency(stats.totalSales?.totalRevenue || 0)}</div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', padding: '1.5rem', borderRadius: '15px', color: 'white', boxShadow: '0 4px 15px rgba(245, 87, 108, 0.3)' }}>
              <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>📝 Commandes payées</div>
              <div style={{ fontSize: '2rem', fontWeight: '700' }}>{stats.totalSales?.totalOrders || 0}</div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', padding: '1.5rem', borderRadius: '15px', color: 'white', boxShadow: '0 4px 15px rgba(79, 172, 254, 0.3)' }}>
              <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>🔓 Tables ouvertes</div>
              <div style={{ fontSize: '2rem', fontWeight: '700' }}>{stats.totalSales?.openOrders || 0}</div>
            </div>
          </div>

          {/* Ventes par serveur */}
          <div style={{ background: 'white', borderRadius: '15px', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 2px 15px rgba(0,0,0,0.08)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.3rem', color: '#333' }}>📊 Performance des serveurs (aujourd'hui)</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {stats.salesByServer?.map((server: any) => (
                <div key={server.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '1rem',
                  background: '#f8f9fa',
                  borderRadius: '10px',
                  border: `3px solid ${server.isActive ? '#28a745' : '#dc3545'}`
                }}>
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '50%', 
                    background: server.isActive ? '#28a745' : '#dc3545',
                    marginRight: '1rem'
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{server.prenom} {server.nom}</div>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                      {server.isActive ? '✅ Connecté' : '🔴 Déconnecté'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#667eea' }}>{formatCurrency(server.revenue || 0)}</div>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>{server.orderCount || 0} commande(s)</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tables ouvertes */}
          <div style={{ background: 'white', borderRadius: '15px', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 2px 15px rgba(0,0,0,0.08)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.3rem', color: '#333' }}>🔓 Tables ouvertes ({stats.openTables?.length || 0})</h3>
            {stats.openTables && stats.openTables.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                {stats.openTables.map((table: any) => (
                  <div key={table.id} style={{ 
                    padding: '1rem',
                    background: '#fff3cd',
                    border: '2px solid #ffc107',
                    borderRadius: '10px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: '600' }}>#{table.id}</span>
                      <span style={{ fontSize: '0.85rem', color: '#666' }}>{table.itemCount} article(s)</span>
                    </div>
                    <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>{table.location}</div>
                    {table.ticketNumber && (
                      <div style={{ fontSize: '0.75rem', color: '#667eea', marginBottom: '0.5rem' }}>🎫 {table.ticketNumber}</div>
                    )}
                    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#28a745' }}>{formatCurrency(table.total)}</div>
                    <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem' }}>
                      {new Date(table.createdAt).toLocaleString('fr-FR')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
                Aucune table ouverte
              </div>
            )}
          </div>

          {/* Historique 7 derniers jours */}
          <div style={{ background: 'white', borderRadius: '15px', padding: '1.5rem', boxShadow: '0 2px 15px rgba(0,0,0,0.08)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.3rem', color: '#333' }}>📈 Historique des ventes (7 derniers jours)</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Date</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600' }}>Commandes</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600' }}>Chiffre d'affaire</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.dailyHistory?.map((day: any, index: number) => (
                    <tr key={day.date} style={{ borderBottom: '1px solid #dee2e6', background: index === 0 ? '#f0f4ff' : 'white' }}>
                      <td style={{ padding: '1rem', fontWeight: index === 0 ? '600' : '400' }}>
                        {new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        {index === 0 && <span style={{ marginLeft: '0.5rem', color: '#667eea', fontSize: '0.85rem' }}>• Aujourd'hui</span>}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>{day.orderCount}</td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#28a745' }}>{formatCurrency(day.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && <CategoriesProducts />}

      {activeTab === 'printers' && <PrinterManagement />}

      {activeTab === 'users' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.8rem', color: '#333' }}>Gestion des utilisateurs</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ padding: '0.75rem 1.5rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '600' }}
        >
          {showForm ? 'Annuler' : '+ Nouvel utilisateur'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '10px', marginBottom: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '1rem' }}>Créer un utilisateur</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '5px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Mot de passe</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '5px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Nom</label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '5px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Prénom</label>
              <input
                type="text"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '5px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Rôle</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '5px' }}
              >
                <option value={UserRole.ADMIN}>Administrateur</option>
                <option value={UserRole.CAISSIER}>Caissier</option>
                <option value={UserRole.SERVEUR}>Serveur</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                type="submit"
                style={{ width: '100%', padding: '0.5rem', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '600' }}
              >
                Créer
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>ID</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Username</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Nom complet</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Rôle</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Statut</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: any) => (
              <tr key={user.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                <td style={{ padding: '1rem' }}>{user.id}</td>
                <td style={{ padding: '1rem' }}>{user.username}</td>
                <td style={{ padding: '1rem' }}>{user.prenom} {user.nom}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    background: user.role === 'ADMIN' ? '#667eea' : user.role === 'CAISSIER' ? '#28a745' : '#ffc107', 
                    color: 'white', 
                    borderRadius: '20px', 
                    fontSize: '0.85rem' 
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ 
                      width: '10px', 
                      height: '10px', 
                      borderRadius: '50%', 
                      background: user.isActive ? '#28a745' : '#dc3545'
                    }} />
                    <span style={{ fontSize: '0.9rem', color: user.isActive ? '#28a745' : '#999' }}>
                      {user.isActive ? 'Connecté' : 'Déconnecté'}
                    </span>
                  </div>
                  {user.lastLogin && (
                    <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.25rem' }}>
                      Dernière connexion: {new Date(user.lastLogin).toLocaleString('fr-FR')}
                    </div>
                  )}
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => setShowResetPassword(user.id)}
                      style={{ 
                        padding: '0.5rem 1rem', 
                        background: '#ffc107', 
                        color: '#333', 
                        border: 'none', 
                        borderRadius: '5px', 
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      🔑 Réinitialiser
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      style={{ 
                        padding: '0.5rem 1rem', 
                        background: '#dc3545', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '5px', 
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
      )}

      {/* Modal Réinitialisation mot de passe */}
      {showResetPassword && (
        <div
          onClick={() => { setShowResetPassword(null); setNewPassword(''); }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '15px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>🔑 Réinitialiser le mot de passe</h3>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 4 caractères"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #dee2e6',
                  borderRadius: '5px',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => { setShowResetPassword(null); setNewPassword(''); }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Annuler
              </button>
              <button
                onClick={() => showResetPassword && handleResetPassword(showResetPassword)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                ✓ Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
