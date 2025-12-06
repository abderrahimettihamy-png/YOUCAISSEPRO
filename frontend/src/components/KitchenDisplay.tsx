import { useState, useEffect } from 'react';
import { orderService } from '../services/api';

interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  notes?: string;
}

interface KitchenOrder {
  id: number;
  ticketNumber: string;
  clientName: string;
  items: OrderItem[];
  createdAt: string;
  serveurName: string;
}

interface Props {
  destination: 'BAR' | 'CUISINE';
}

export default function KitchenDisplay({ destination }: Props) {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000); // Actualiser toutes les 5 secondes
    return () => clearInterval(interval);
  }, [destination]);

  const loadOrders = async () => {
    try {
      const allOrders = await orderService.getAll();
      
      // Filtrer seulement les commandes en attente
      const pendingOrders = allOrders.filter((order: any) => 
        order.status === 'en_attente'
      );

      // Filtrer les items selon la destination (BAR ou CUISINE)
      const ordersWithFilteredItems = await Promise.all(
        pendingOrders.map(async (order: any) => {
          const items = order.items || [];
          const filteredItems = items.filter((item: any) => {
            if (destination === 'BAR') {
              return item.categoryType === 'boissons';
            } else {
              return item.categoryType === 'repas';
            }
          });

          if (filteredItems.length > 0) {
            return {
              id: order.id,
              ticketNumber: order.ticketNumber,
              clientName: order.clientName,
              items: filteredItems,
              createdAt: order.createdAt,
              serveurName: order.createdByName || 'Serveur'
            };
          }
          return null;
        })
      );

      setOrders(ordersWithFilteredItems.filter(o => o !== null) as KitchenOrder[]);
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
    }
  };

  const markAsCompleted = (orderId: number) => {
    setCompletedOrders(prev => new Set(prev).add(orderId));
    setTimeout(() => {
      setCompletedOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
      loadOrders();
    }, 2000);
  };

  const backgroundColor = destination === 'BAR' 
    ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';

  const icon = destination === 'BAR' ? '🍹' : '🍳';

  return (
    <div style={{ padding: '1rem', minHeight: '100vh', background: '#f5f5f5' }}>
      {/* En-tête */}
      <div style={{
        background: backgroundColor,
        color: 'white',
        padding: '2rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '2.5rem' }}>
          {icon} {destination}
        </h1>
        <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>
          {orders.length} commande{orders.length > 1 ? 's' : ''} en attente
        </p>
      </div>

      {/* Grille des commandes */}
      {orders.length === 0 ? (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '3rem',
          textAlign: 'center',
          color: '#999'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
          <h2>Aucune commande en attente</h2>
          <p>Les nouvelles commandes apparaîtront ici automatiquement</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}>
          {orders.map(order => (
            <div
              key={order.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: completedOrders.has(order.id) 
                  ? '0 0 20px rgba(76, 175, 80, 0.5)'
                  : '0 4px 12px rgba(0,0,0,0.1)',
                border: completedOrders.has(order.id)
                  ? '3px solid #4caf50'
                  : '2px solid #ddd',
                transition: 'all 0.3s ease'
              }}
            >
              {/* En-tête de commande */}
              <div style={{
                borderBottom: '2px solid #f0f0f0',
                paddingBottom: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <h3 style={{ margin: 0, fontSize: '1.5rem' }}>
                    #{order.ticketNumber}
                  </h3>
                  <span style={{
                    background: destination === 'BAR' ? '#f5576c' : '#00f2fe',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}>
                    {new Date(order.createdAt).toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                <div style={{ color: '#666', fontSize: '0.95rem' }}>
                  <div><strong>Client:</strong> {order.clientName}</div>
                  <div><strong>Serveur:</strong> {order.serveurName}</div>
                </div>
              </div>

              {/* Articles */}
              <div style={{ marginBottom: '1.5rem' }}>
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '0.75rem',
                      background: '#f9f9f9',
                      borderRadius: '8px',
                      marginBottom: '0.5rem',
                      border: '1px solid #e0e0e0'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                        {item.quantity}x
                      </span>
                      <span style={{ flex: 1, marginLeft: '1rem', fontSize: '1.1rem' }}>
                        {item.productName}
                      </span>
                    </div>
                    {item.notes && (
                      <div style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem',
                        background: '#fff3cd',
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                        color: '#856404'
                      }}>
                        📝 {item.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Bouton Prêt */}
              <button
                onClick={() => markAsCompleted(order.id)}
                disabled={completedOrders.has(order.id)}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: completedOrders.has(order.id)
                    ? '#4caf50'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: completedOrders.has(order.id) ? 'default' : 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {completedOrders.has(order.id) ? '✅ PRÊT' : '✓ Marquer comme prêt'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
