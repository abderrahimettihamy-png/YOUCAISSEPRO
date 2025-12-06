import { useState, useEffect } from 'react';
import { categoryService, productService, orderService, printService } from '../services/api';
import type { Category, Product, Order } from '../types';
import PrinterManagement from './PrinterManagement';

interface CartItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  categoryType?: string;
}

export default function ServeurDashboard() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [clientType, setClientType] = useState<'chambre' | 'passage'>('chambre');
  const [clientNumber, setClientNumber] = useState('');
  const [mealTime, setMealTime] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [printPreviewData, setPrintPreviewData] = useState<any>(null);
  const [openOrders, setOpenOrders] = useState<Order[]>([]);
  const [showOpenOrders, setShowOpenOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPrinterManagement, setShowPrinterManagement] = useState(false);

  useEffect(() => {
    loadCategories();
    loadOpenOrders();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadProducts(selectedCategory);
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
      if (data.length > 0 && !selectedCategory) {
        setSelectedCategory(data[0].id);
      }
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    }
  };

  const loadProducts = async (categoryId: number) => {
    try {
      const data = await productService.getAll();
      const filtered = data.filter(p => p.categoryId === categoryId && p.available);
      setProducts(filtered);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    }
  };

  const loadOpenOrders = async () => {
    try {
      const data = await orderService.getAll();
      const open = data.filter((o: Order) => o.status === 'en_attente');
      
      // Charger les items pour chaque commande ouverte
      const ordersWithItems = await Promise.all(
        open.map(async (order) => {
          try {
            const fullOrder = await orderService.getById(order.id);
            return {
              ...order,
              items: fullOrder.items || [],
              createdByName: order.createdByName || 
                ((order as any).createdByNom && (order as any).createdByPrenom 
                  ? `${(order as any).createdByPrenom} ${(order as any).createdByNom}`
                  : undefined)
            };
          } catch (error) {
            console.error('Erreur lors du chargement de la commande:', error);
            return order;
          }
        })
      );
      
      setOpenOrders(ordersWithItems);
    } catch (error) {
      console.error('Erreur chargement commandes ouvertes:', error);
    }
  };

  const addToCart = (product: Product) => {
    const category = categories.find(c => c.id === product.categoryId);
    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: 1,
        categoryType: category?.type
      }]);
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getClientName = () => {
    if (!clientNumber) return '';
    const num = parseInt(clientNumber);
    if (clientType === 'chambre') {
      return `Chambre ${num.toString().padStart(2, '0')}`;
    } else {
      return `Passage ${num}`;
    }
  };

  const validateClientNumber = () => {
    const num = parseInt(clientNumber);
    if (!clientNumber || isNaN(num)) {
      alert('Veuillez sélectionner un numéro');
      return false;
    }
    if (clientType === 'chambre' && (num < 1 || num > 24)) {
      alert('Numéro de chambre invalide (1-24)');
      return false;
    }
    if (clientType === 'passage' && (num < 1 || num > 50)) {
      alert('Numéro de passage invalide (1-50)');
      return false;
    }
    return true;
  };

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      alert('Panier vide');
      return;
    }

    if (!validateClientNumber()) return;

    if (!mealTime) {
      alert('Veuillez sélectionner l\'heure du service');
      return;
    }

    try {
      const orderData = {
        clientName: getClientName(),
        mealTime: mealTime,
        notes: notes.trim(),
        items: cart.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
          categoryType: item.categoryType
        })),
        total: calculateTotal()
      };

      const response = await orderService.create(orderData);
      
      // Imprimer automatiquement
      try {
        await printService.printOrder(response.orderId);
        const ticketsData = await printService.getTicketsByDestination(response.orderId);
        
        // Transformer les données pour le preview
        const previewData = {
          order: response,
          tickets: {
            bar: { items: [] },
            cuisine: { items: [] }
          }
        };

        // Grouper les tickets par destination
        for (const ticket of ticketsData) {
          if (ticket.destination === 'BAR') {
            previewData.tickets.bar = ticket;
          } else if (ticket.destination === 'CUISINE') {
            previewData.tickets.cuisine = ticket;
          }
        }

        setPrintPreviewData(previewData);
        setShowPrintPreview(true);

        alert(
          `✅ Commande créée avec succès!\n\n` +
          `Ticket N°: ${response.ticketNumber}\n\n` +
          `📄 Envoyée aux écrans d'affichage`
        );
      } catch (printError) {
        console.error('Erreur impression:', printError);
        alert(`✅ Commande créée (Ticket ${response.ticketNumber})\n⚠️ Erreur d'affichage`);
      }

      // Réinitialiser
      setCart([]);
      setClientNumber('');
      setMealTime('');
      setNotes('');
      setSelectedOrder(null);
      loadOpenOrders();

    } catch (error: any) {
      alert(error.response?.data?.error || 'Erreur lors de la création de la commande');
    }
  };

  const handleAddToExistingOrder = async (order: Order) => {
    if (cart.length === 0) {
      alert('Veuillez d\'abord ajouter des articles au panier');
      return;
    }

    try {
      const newItems = cart.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity
      }));

      await orderService.addItems(order.id, newItems);
      
      // Réimprimer automatiquement
      try {
        const printResult = await printService.printOrder(order.id);
        const printedInfo = printResult.results.printed.length > 0
          ? `📄 Impression:\n` + printResult.results.printed.map((p: any) => 
              `  • ${p.destination}: ${p.items} article(s) → ${p.printer}`
            ).join('\n')
          : '⚠️ Aucune imprimante configurée';

        alert(
          `✅ Articles ajoutés à ${order.clientName}\n\n` +
          printedInfo
        );
      } catch {
        alert(`✅ Articles ajoutés à ${order.clientName}\n⚠️ Erreur d'impression`);
      }

      setCart([]);
      setShowOpenOrders(false);
      loadOpenOrders();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erreur');
    }
  };

  const handleReprintOrder = async (orderId: number) => {
    try {
      await printService.printOrder(orderId);
      alert('✅ Bon réimprimé');
    } catch (error) {
      alert('❌ Erreur de réimpression');
    }
  };

  const barItems = cart.filter(item => item.categoryType === 'boissons');
  const cuisineItems = cart.filter(item => item.categoryType === 'repas');

  return (
    <div>
      {/* Afficher la gestion des imprimantes si demandé */}
      {showPrinterManagement ? (
        <div>
          <button
            onClick={() => setShowPrinterManagement(false)}
            style={{
              marginBottom: '1rem',
              padding: '0.75rem 1.5rem',
              background: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            ← Retour aux commandes
          </button>
          <PrinterManagement />
        </div>
      ) : (
        <>
          {/* Barre d'actions */}
          <div style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => {
                loadOpenOrders();
                setShowOpenOrders(true);
              }}
              style={{
                padding: '0.5rem 1rem',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem'
              }}
            >
              📋 Commandes en cours ({openOrders.length})
            </button>
            <button
              onClick={() => setShowPrinterManagement(true)}
              style={{
                padding: '0.5rem 1rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem'
              }}
            >
              🖨️ Imprimantes
            </button>
            {selectedOrder && cart.length > 0 && (
              <button
                onClick={() => handleAddToExistingOrder(selectedOrder)}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  animation: 'pulse 1.5s infinite'
                }}
              >
                ✅ Ajouter à: {selectedOrder.clientName}
              </button>
            )}
          </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', height: 'calc(100vh - 180px)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  padding: '0.5rem 1rem',
                  background: selectedCategory === category.id 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : '#f0f0f0',
                  color: selectedCategory === category.id ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}
              >
                {category.type === 'boissons' ? '🍹' : '🍽️'} {category.name}
              </button>
            ))}
          </div>

          {/* Barre de recherche */}
          <input
            type="text"
            placeholder="🔍 Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '0.75rem',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '0.9rem',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
          />

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '0.5rem',
            overflowY: 'auto',
            flex: 1
          }}>
            {products
              .filter(product => 
                product.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map(product => (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                style={{
                  padding: '0.5rem',
                  background: 'white',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  height: '150px',
                  justifyContent: 'space-between'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.03)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name}
                    style={{
                      width: '70px',
                      height: '70px',
                      objectFit: 'cover',
                      borderRadius: '6px'
                    }}
                  />
                ) : (
                  <div style={{ fontSize: '2.5rem' }}>
                    {categories.find(c => c.id === product.categoryId)?.type === 'boissons' ? '🥤' : '🍽️'}
                  </div>
                )}
                <div style={{ fontWeight: '600', fontSize: '0.8rem', lineHeight: '1.2' }}>{product.name}</div>
                <div style={{ color: '#667eea', fontWeight: 'bold', fontSize: '1rem' }}>
                  {product.price.toFixed(2)} MAD
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h2 style={{ margin: '0 0 1rem 0' }}>🛒 Commande</h2>

          {/* Sélection Client */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <button
                onClick={() => setClientType('chambre')}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: clientType === 'chambre' ? '#667eea' : '#f0f0f0',
                  color: clientType === 'chambre' ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                🏨 Chambre
              </button>
              <button
                onClick={() => setClientType('passage')}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: clientType === 'passage' ? '#667eea' : '#f0f0f0',
                  color: clientType === 'passage' ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                🚶 Passage
              </button>
            </div>

            <select
              value={clientNumber}
              onChange={(e) => setClientNumber(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem',
                marginBottom: '0.5rem'
              }}
            >
              <option value="">
                {clientType === 'chambre' ? 'Sélectionner chambre (01-24)' : 'Sélectionner passage (1-50)'}
              </option>
              {clientType === 'chambre' 
                ? Array.from({length: 24}, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>
                      Chambre {num.toString().padStart(2, '0')}
                    </option>
                  ))
                : Array.from({length: 50}, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>
                      Passage {num}
                    </option>
                  ))
              }
            </select>

            <input
              type="time"
              value={mealTime}
              onChange={(e) => setMealTime(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: mealTime ? '2px solid #4CAF50' : '2px solid #ff6b6b',
                borderRadius: '8px',
                fontSize: '1rem',
                marginBottom: '0.5rem',
                fontWeight: 'bold',
                backgroundColor: mealTime ? '#fff' : '#ffe6e6'
              }}
            />

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes"
              rows={2}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #ddd',
                borderRadius: '8px',
                resize: 'none',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem' }}>
            {barItems.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  marginBottom: '0.5rem'
                }}>
                  🍹 BAR ({barItems.length})
                </div>
                {barItems.map(item => (
                  <div key={item.productId} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    background: '#f9f9f9',
                    borderRadius: '6px',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{item.productName}</div>
                      <div style={{ color: '#666', fontSize: '0.85rem' }}>{item.price.toFixed(2)} MAD</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        style={{
                          width: '28px',
                          height: '28px',
                          background: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        -
                      </button>
                      <span style={{ fontWeight: 'bold', minWidth: '30px', textAlign: 'center' }}>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        style={{
                          width: '28px',
                          height: '28px',
                          background: '#4caf50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {cuisineItems.length > 0 && (
              <div>
                <div style={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  marginBottom: '0.5rem'
                }}>
                  🍳 CUISINE ({cuisineItems.length})
                </div>
                {cuisineItems.map(item => (
                  <div key={item.productId} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    background: '#f9f9f9',
                    borderRadius: '6px',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{item.productName}</div>
                      <div style={{ color: '#666', fontSize: '0.85rem' }}>{item.price.toFixed(2)} MAD</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        style={{
                          width: '28px',
                          height: '28px',
                          background: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        -
                      </button>
                      <span style={{ fontWeight: 'bold', minWidth: '30px', textAlign: 'center' }}>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        style={{
                          width: '28px',
                          height: '28px',
                          background: '#4caf50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {cart.length === 0 && (
              <div style={{ textAlign: 'center', color: '#999', padding: '2rem 0' }}>Panier vide</div>
            )}
          </div>

          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '1rem',
              background: '#f5f5f5',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '1.3rem',
              fontWeight: 'bold'
            }}>
              <span>TOTAL:</span>
              <span style={{ color: '#667eea' }}>{calculateTotal().toFixed(2)} MAD</span>
            </div>

            <button
              onClick={handleSubmitOrder}
              disabled={cart.length === 0 || !clientNumber || !mealTime}
              style={{
                width: '100%',
                padding: '1rem',
                background: cart.length === 0 || !clientNumber || !mealTime
                  ? '#ccc'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: cart.length === 0 || !clientNumber || !mealTime ? 'not-allowed' : 'pointer',
                fontSize: '1.1rem',
                fontWeight: '600'
              }}
            >
              📤 Envoyer la commande
            </button>
          </div>
        </div>
      </div>

      {/* Modal Commandes en cours */}
      {showOpenOrders && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            width: '90%',
            maxWidth: '900px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2>📋 Commandes en cours ({openOrders.length})</h2>
            
            {openOrders.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
                Aucune commande en cours
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {openOrders.map(order => (
                  <div key={order.id} style={{
                    padding: '1.5rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    background: '#f9f9f9'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{order.clientName}</div>
                        <div style={{ color: '#666', fontSize: '0.9rem' }}>
                          Ticket: {order.ticketNumber}
                        </div>
                        {order.createdByName && (
                          <div style={{ color: '#4caf50', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                            👤 Créée par: {order.createdByName}
                          </div>
                        )}
                      </div>
                      <div style={{ fontWeight: 'bold', fontSize: '1.3rem', color: '#667eea' }}>
                        {order.total?.toFixed(2)} MAD
                      </div>
                    </div>

                    {/* Liste des articles */}
                    {order.items && order.items.length > 0 && (
                      <div style={{ 
                        marginBottom: '1rem', 
                        padding: '0.75rem',
                        background: 'white',
                        borderRadius: '6px',
                        maxHeight: '200px',
                        overflowY: 'auto'
                      }}>
                        <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.5rem', color: '#333' }}>
                          📝 Articles ({order.items.length})
                        </div>
                        {order.items.map((item, idx) => (
                          <div key={idx} style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            padding: '0.4rem 0',
                            borderBottom: idx < order.items!.length - 1 ? '1px solid #f0f0f0' : 'none',
                            fontSize: '0.85rem',
                            color: '#333'
                          }}>
                            <div>
                              <span style={{ fontWeight: '600', color: '#333' }}>{item.quantity}x </span>
                              <span style={{ color: '#333' }}>{item.productName || 'Produit inconnu'}</span>
                              {item.addedByName && (
                                <span style={{ color: '#999', fontSize: '0.75rem', marginLeft: '0.5rem' }}>
                                  (par {item.addedByName})
                                </span>
                              )}
                            </div>
                            <span style={{ color: '#667eea', fontWeight: '600' }}>
                              {item.total.toFixed(2)} MAD
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => {
                          setShowOpenOrders(false);
                          // Optionnel: scroll vers le haut pour voir le panier
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                          // Stocker temporairement la commande sélectionnée
                          setSelectedOrder(order);
                          alert(`🛒 Ajoutez des produits au panier\npuis cliquez à nouveau sur "Commandes en cours"\npour les ajouter à: ${order.clientName}`);
                        }}
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          background: '#4caf50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        ➕ Ajouter des articles
                      </button>
                      <button
                        onClick={() => handleReprintOrder(order.id)}
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          background: '#667eea',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        🖨️ Réimprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowOpenOrders(false)}
              style={{
                marginTop: '1.5rem',
                width: '100%',
                padding: '1rem',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              ✓ Fermer
            </button>
          </div>
        </div>
      )}

      {/* Modal Aperçu impression */}
      {showPrintPreview && printPreviewData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            width: '90%',
            maxWidth: '900px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2>📄 Aperçu des tickets</h2>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
              Ticket: <strong>{printPreviewData?.order?.ticketNumber}</strong> | 
              Client: <strong>{printPreviewData?.order?.clientName || 'Sans nom'}</strong>
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {printPreviewData?.tickets?.bar?.items && printPreviewData.tickets.bar.items.length > 0 && (
                <div style={{ border: '2px solid #f5576c', borderRadius: '8px', padding: '1rem' }}>
                  <h3 style={{ color: '#f5576c', marginTop: 0 }}>🍹 BAR</h3>
                  {printPreviewData.tickets.bar.items.map((item: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>{item.quantity}x {item.productName}</span>
                      <span>{item.total.toFixed(2)} MAD</span>
                    </div>
                  ))}
                </div>
              )}

              {printPreviewData?.tickets?.cuisine?.items && printPreviewData.tickets.cuisine.items.length > 0 && (
                <div style={{ border: '2px solid #00f2fe', borderRadius: '8px', padding: '1rem' }}>
                  <h3 style={{ color: '#00f2fe', marginTop: 0 }}>🍳 CUISINE</h3>
                  {printPreviewData.tickets.cuisine.items.map((item: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>{item.quantity}x {item.productName}</span>
                      <span>{item.total.toFixed(2)} MAD</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowPrintPreview(false)}
              style={{
                marginTop: '1.5rem',
                width: '100%',
                padding: '1rem',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              ✓ Fermer
            </button>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
}
