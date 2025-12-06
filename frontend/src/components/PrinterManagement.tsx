import { useState, useEffect } from 'react';
import { printerService } from '../services/api';

interface PrinterConfig {
  id?: number;
  destination: 'BAR' | 'CUISINE';
  type: 'USB' | 'NETWORK';
  name: string;
  usbPort?: string;
  networkIp?: string;
  networkPort?: number;
  isActive: boolean;
}

export default function PrinterManagement() {
  const [printers, setPrinters] = useState<PrinterConfig[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<PrinterConfig | null>(null);
  const [formData, setFormData] = useState<PrinterConfig>({
    destination: 'BAR',
    type: 'USB',
    name: '',
    usbPort: '',
    networkIp: '',
    networkPort: 9100,
    isActive: true,
  });

  useEffect(() => {
    loadPrinters();
  }, []);

  const loadPrinters = async () => {
    try {
      const data = await printerService.getAll();
      setPrinters(data);
    } catch (error) {
      console.error('Erreur chargement imprimantes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Nom de l\'imprimante requis');
      return;
    }

    if (formData.type === 'USB' && !formData.usbPort?.trim()) {
      alert('Port USB requis');
      return;
    }

    if (formData.type === 'NETWORK' && (!formData.networkIp?.trim() || !formData.networkPort)) {
      alert('IP et port réseau requis');
      return;
    }

    try {
      if (editingPrinter) {
        await printerService.update(editingPrinter.id!, formData);
      } else {
        await printerService.create(formData);
      }
      setShowModal(false);
      setEditingPrinter(null);
      resetForm();
      await loadPrinters();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (printer: PrinterConfig) => {
    setEditingPrinter(printer);
    setFormData(printer);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Supprimer cette imprimante ?')) {
      try {
        await printerService.delete(id);
        await loadPrinters();
      } catch (error) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      destination: 'BAR',
      type: 'USB',
      name: '',
      usbPort: '',
      networkIp: '',
      networkPort: 9100,
      isActive: true,
    });
  };

  const groupedPrinters = {
    BAR: printers.filter(p => p.destination === 'BAR'),
    CUISINE: printers.filter(p => p.destination === 'CUISINE'),
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0 }}>🖨️ Configuration des Imprimantes</h2>
        <button
          onClick={() => { setShowModal(true); setEditingPrinter(null); resetForm(); }}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          ➕ Ajouter une imprimante
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Section BAR */}
        <div>
          <h3 style={{
            padding: '1rem',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            borderRadius: '8px 8px 0 0',
            margin: 0,
          }}>
            🍹 IMPRIMANTES BAR
          </h3>
          <div style={{ border: '2px solid #f5576c', borderRadius: '0 0 8px 8px', padding: '1rem' }}>
            {groupedPrinters.BAR.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
                Aucune imprimante configurée
              </p>
            ) : (
              groupedPrinters.BAR.map(printer => (
                <PrinterCard
                  key={printer.id}
                  printer={printer}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>

        {/* Section CUISINE */}
        <div>
          <h3 style={{
            padding: '1rem',
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            borderRadius: '8px 8px 0 0',
            margin: 0,
          }}>
            🍳 IMPRIMANTES CUISINE
          </h3>
          <div style={{ border: '2px solid #00f2fe', borderRadius: '0 0 8px 8px', padding: '1rem' }}>
            {groupedPrinters.CUISINE.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
                Aucune imprimante configurée
              </p>
            ) : (
              groupedPrinters.CUISINE.map(printer => (
                <PrinterCard
                  key={printer.id}
                  printer={printer}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal d'ajout/édition */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto',
          }}>
            <h2 style={{ marginTop: 0 }}>
              {editingPrinter ? '✏️ Modifier l\'imprimante' : '➕ Nouvelle imprimante'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Destination
                </label>
                <select
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value as 'BAR' | 'CUISINE' })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem',
                  }}
                >
                  <option value="BAR">🍹 BAR (Boissons)</option>
                  <option value="CUISINE">🍳 CUISINE (Repas)</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Type de connexion
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'USB' | 'NETWORK' })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem',
                  }}
                >
                  <option value="USB">🔌 USB</option>
                  <option value="NETWORK">🌐 Réseau (IP)</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Nom de l'imprimante *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Epson TM-T20"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem',
                  }}
                />
              </div>

              {formData.type === 'USB' && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Port USB *
                  </label>
                  <input
                    type="text"
                    value={formData.usbPort}
                    onChange={(e) => setFormData({ ...formData, usbPort: e.target.value })}
                    placeholder="Ex: COM1, COM2 ou /dev/usb/lp0"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem',
                    }}
                  />
                </div>
              )}

              {formData.type === 'NETWORK' && (
                <>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                      Adresse IP *
                    </label>
                    <input
                      type="text"
                      value={formData.networkIp}
                      onChange={(e) => setFormData({ ...formData, networkIp: e.target.value })}
                      placeholder="Ex: 192.168.1.100"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '1rem',
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                      Port *
                    </label>
                    <input
                      type="number"
                      value={formData.networkPort}
                      onChange={(e) => setFormData({ ...formData, networkPort: parseInt(e.target.value) })}
                      placeholder="9100"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '1rem',
                      }}
                    />
                  </div>
                </>
              )}

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    style={{ width: '20px', height: '20px' }}
                  />
                  <span style={{ fontWeight: '600' }}>Imprimante active</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  {editingPrinter ? '💾 Enregistrer' : '➕ Ajouter'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingPrinter(null); resetForm(); }}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    background: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  ❌ Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function PrinterCard({ printer, onEdit, onDelete }: {
  printer: PrinterConfig;
  onEdit: (printer: PrinterConfig) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div style={{
      padding: '1rem',
      background: printer.isActive ? '#f0f9ff' : '#f5f5f5',
      border: printer.isActive ? '2px solid #667eea' : '2px solid #ccc',
      borderRadius: '8px',
      marginBottom: '1rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
        <div>
          <h4 style={{ margin: 0, marginBottom: '0.5rem' }}>
            {printer.name}
            {printer.isActive && <span style={{ marginLeft: '0.5rem', color: '#28a745' }}>✓ Active</span>}
          </h4>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>
            <div><strong>Type:</strong> {printer.type === 'USB' ? '🔌 USB' : '🌐 Réseau'}</div>
            {printer.type === 'USB' && <div><strong>Port:</strong> {printer.usbPort}</div>}
            {printer.type === 'NETWORK' && (
              <div><strong>Adresse:</strong> {printer.networkIp}:{printer.networkPort}</div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => onEdit(printer)}
            style={{
              padding: '0.5rem 1rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(printer.id!)}
            style={{
              padding: '0.5rem 1rem',
              background: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
