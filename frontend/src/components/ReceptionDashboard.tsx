import { useEffect, useState } from 'react';
import api from '../services/api';

interface RoomOrder {
  roomNumber: string;
  orders: Array<{
    id: number;
    ticketNumber: string;
    items: Array<{
      productName: string;
      quantity: number;
      price: number;
      total: number;
    }>;
    total: number;
    discount: number;
    finalTotal: number;
    status: string;
    paymentMethod?: string;
    createdAt: string;
    receptionPrintedAt?: string;
  }>;
  totalAmount: number;
}

export default function ReceptionDashboard() {
  const [roomOrders, setRoomOrders] = useState<RoomOrder[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<RoomOrder | null>(null);
  const [loading, setLoading] = useState(true);

  const loadReceptionOrders = async () => {
    try {
      const response = await api.get('/orders/reception');
      setRoomOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement réception:', error);
      setLoading(false);
    }
  };

  const printRoomBill = async (room: RoomOrder) => {
    const printWindow = window.open('', '', 'width=400,height=700');
    if (!printWindow) return;

    const billHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Facture Chambre ${room.roomNumber}</title>
        <style>
          @page { margin: 0; }
          body { 
            font-family: 'Courier New', monospace; 
            padding: 15px;
            margin: 0;
            font-size: 11px;
            max-width: 350px;
            color: #000;
          }
          h2, h3 { text-align: center; margin: 10px 0; }
          h2 { font-size: 18px; }
          h3 { font-size: 14px; border-bottom: 2px solid #000; padding-bottom: 5px; }
          .divider { border-top: 1px dashed #000; margin: 10px 0; }
          .double-line { border-top: 2px solid #000; margin: 10px 0; }
          .line { display: flex; justify-content: space-between; margin: 3px 0; }
          .total { font-weight: bold; font-size: 13px; margin-top: 5px; }
          .center { text-align: center; }
          .item-line { margin: 2px 0; font-size: 10px; }
        </style>
      </head>
      <body>
        <h2>YOU VOYAGE COMPANY</h2>
        <p class="center" style="font-size: 10px;">Tel: 06 16 73 41 71</p>
        <div class="double-line"></div>
        <h3>FACTURE CHAMBRE ${room.roomNumber}</h3>
        <p class="center"><strong>Date: ${new Date().toLocaleDateString('fr-FR')}</strong></p>
        <p class="center" style="font-size: 9px;">Imprimé le: ${new Date().toLocaleString('fr-FR')}</p>
        <div class="divider"></div>
        
        ${room.orders.map((order, idx) => `
          <div style="margin-bottom: 15px;">
            <p style="font-weight: bold; margin: 5px 0;">Ticket #${order.ticketNumber || order.id}</p>
            <p style="font-size: 9px; color: #666; margin: 2px 0;">${new Date(order.createdAt).toLocaleString('fr-FR')}</p>
            <div class="divider"></div>
            ${order.items.map(item => `
              <div class="item-line">
                <div class="line">
                  <span>${item.productName}</span>
                  <span>x${item.quantity}</span>
                </div>
                <div class="line" style="padding-left: 20px;">
                  <span>${item.price.toFixed(2)} MAD/u</span>
                  <span><strong>${item.total.toFixed(2)} MAD</strong></span>
                </div>
              </div>
            `).join('')}
            <div class="divider"></div>
            <div class="line">
              <span>Sous-total:</span>
              <span>${order.total.toFixed(2)} MAD</span>
            </div>
            ${order.discount > 0 ? `
              <div class="line">
                <span>Remise:</span>
                <span>-${order.discount.toFixed(2)} MAD</span>
              </div>
            ` : ''}
            <div class="line total">
              <span>Total:</span>
              <span>${order.finalTotal.toFixed(2)} MAD</span>
            </div>
            ${order.paymentMethod ? `
              <div class="line" style="font-size: 9px;">
                <span>Payé par:</span>
                <span>${order.paymentMethod === 'espece' ? 'Espèce' : order.paymentMethod === 'carte' ? 'Carte' : 'Chèque'}</span>
              </div>
            ` : ''}
          </div>
          ${idx < room.orders.length - 1 ? '<div class="double-line"></div>' : ''}
        `).join('')}
        
        <div class="double-line"></div>
        <div class="line total" style="font-size: 16px;">
          <span>TOTAL CHAMBRE:</span>
          <span>${room.totalAmount.toFixed(2)} MAD</span>
        </div>
        
        <div class="divider"></div>
        <p class="center" style="font-size: 9px; margin-top: 15px;">*** MERCI DE VOTRE VISITE ***</p>
        
        <script>
          window.onload = function() { 
            setTimeout(function() {
              window.print(); 
              setTimeout(function() {
                window.close();
              }, 100);
            }, 250);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(billHTML);
    printWindow.document.close();
  };

  const markAsPrinted = async (roomNumber: string) => {
    try {
      await api.post(`/orders/reception/${roomNumber}/print`);
      await loadReceptionOrders();
    } catch (error) {
      console.error('Erreur marquage impression:', error);
    }
  };

  useEffect(() => {
    loadReceptionOrders();
    const interval = setInterval(loadReceptionOrders, 10000); // Actualiser toutes les 10s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ fontSize: '1.2rem', color: '#666' }}>Chargement...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', color: '#333', margin: 0 }}>🏨 Réception - Chambres</h2>
        <button
          onClick={loadReceptionOrders}
          style={{ 
            padding: '0.75rem 1.5rem', 
            background: '#667eea', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer', 
            fontWeight: '600' 
          }}
        >
          🔄 Actualiser
        </button>
      </div>

      {roomOrders.length === 0 ? (
        <div style={{
          padding: '3rem',
          textAlign: 'center',
          background: '#f8f9fa',
          borderRadius: '10px',
          border: '2px dashed #dee2e6'
        }}>
          <p style={{ fontSize: '1.2rem', color: '#666', margin: 0 }}>
            Aucune consommation en attente
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {roomOrders.map((room) => (
            <div
              key={room.roomNumber}
              onClick={() => setSelectedRoom(room)}
              style={{
                background: 'white',
                border: '3px solid #667eea',
                borderRadius: '12px',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.15)';
              }}
            >
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: room.orders.some(o => !o.receptionPrintedAt) ? '#ff6b6b' : '#51cf66',
                color: 'white',
                padding: '0.25rem 0.5rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: '700'
              }}>
                {room.orders.some(o => !o.receptionPrintedAt) ? 'NOUVEAU' : 'IMPRIMÉ'}
              </div>

              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.5rem',
                  fontSize: '2rem'
                }}>
                  🚪
                </div>
                <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#333' }}>
                  Chambre {room.roomNumber}
                </h3>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.5rem',
                  background: '#f8f9fa',
                  borderRadius: '5px',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ color: '#666', fontSize: '0.9rem' }}>Tickets:</span>
                  <span style={{ fontWeight: '700', color: '#333' }}>{room.orders.length}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '5px',
                  color: 'white'
                }}>
                  <span style={{ fontWeight: '600' }}>Total:</span>
                  <span style={{ fontSize: '1.3rem', fontWeight: '700' }}>{room.totalAmount.toFixed(2)} MAD</span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  printRoomBill(room);
                  markAsPrinted(room.roomNumber);
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem'
                }}
              >
                🖨️ Imprimer Facture
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal détails chambre */}
      {selectedRoom && (
        <div
          onClick={() => setSelectedRoom(null)}
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
              maxWidth: '800px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: '#333' }}>🚪 Chambre {selectedRoom.roomNumber}</h2>
              <button
                onClick={() => setSelectedRoom(null)}
                style={{
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                ✕ Fermer
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              {selectedRoom.orders.map((order) => (
                <div
                  key={order.id}
                  style={{
                    background: '#f8f9fa',
                    padding: '1.5rem',
                    borderRadius: '10px',
                    marginBottom: '1rem',
                    border: '2px solid #dee2e6'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>
                        Ticket #{order.ticketNumber || order.id}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>
                        {new Date(order.createdAt).toLocaleString('fr-FR')}
                      </p>
                    </div>
                    <div style={{
                      padding: '0.25rem 0.75rem',
                      background: order.status === 'payee' ? '#28a745' : '#ffc107',
                      color: 'white',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      height: 'fit-content'
                    }}>
                      {order.status === 'payee' ? 'PAYÉE' : 'EN ATTENTE'}
                    </div>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                    <thead>
                      <tr style={{ background: '#dee2e6' }}>
                        <th style={{ padding: '0.5rem', textAlign: 'left', color: '#333' }}>Article</th>
                        <th style={{ padding: '0.5rem', textAlign: 'center', color: '#333' }}>Qté</th>
                        <th style={{ padding: '0.5rem', textAlign: 'right', color: '#333' }}>Prix U.</th>
                        <th style={{ padding: '0.5rem', textAlign: 'right', color: '#333' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #dee2e6' }}>
                          <td style={{ padding: '0.5rem', color: '#333' }}>{item.productName}</td>
                          <td style={{ padding: '0.5rem', textAlign: 'center', color: '#333' }}>{item.quantity}</td>
                          <td style={{ padding: '0.5rem', textAlign: 'right', color: '#333' }}>{item.price.toFixed(2)} MAD</td>
                          <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: '600', color: '#333' }}>
                            {item.total.toFixed(2)} MAD
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ marginBottom: '0.25rem', color: '#333' }}>
                      Sous-total: <strong>{order.total.toFixed(2)} MAD</strong>
                    </div>
                    {order.discount > 0 && (
                      <div style={{ marginBottom: '0.25rem', color: '#dc3545' }}>
                        Remise: <strong>-{order.discount.toFixed(2)} MAD</strong>
                      </div>
                    )}
                    <div style={{ fontSize: '1.2rem', color: '#333' }}>
                      Total: <strong>{order.finalTotal.toFixed(2)} MAD</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '10px',
              color: 'white',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem' }}>
                <span style={{ fontWeight: '600' }}>TOTAL CHAMBRE:</span>
                <strong>{selectedRoom.totalAmount.toFixed(2)} MAD</strong>
              </div>
            </div>

            <button
              onClick={() => {
                printRoomBill(selectedRoom);
                markAsPrinted(selectedRoom.roomNumber);
                setSelectedRoom(null);
              }}
              style={{
                width: '100%',
                padding: '1rem',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1.1rem'
              }}
            >
              🖨️ Imprimer Facture Complète
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
