import { useState, useEffect } from 'react';
import { categoryService, productService, orderService, printService } from '../services/api';
import type { Category, Product } from '../types';
// import { useAuth } from '../context/AuthContext';

interface CartItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  categoryType?: string;
}

export default function ServeurDashboard() {
  // const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [clientName, setClientName] = useState('');
  const [notes, setNotes] = useState('');
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [printPreviewData, setPrintPreviewData] = useState<any>(null);

  useEffect(() => {
    loadCategories();
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

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      alert('Panier vide');
      return;
    }

    if (!clientName.trim()) {
      alert('Veuillez entrer le nom du client (ex: Chambre 10, Passage 5)');
      return;
    }

    try {
      const orderData = {
        clientName: clientName.trim(),
        notes: notes.trim(),
        items: cart.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity
        })),
        total: calculateTotal()
      };

      const response = await orderService.create(orderData);
      
      // Imprimer automatiquement
      try {
        const printResult = await printService.printOrder(response.orderId);
        
        // Afficher l'aperçu des tickets
        const ticketsData = await printService.getTicketsByDestination(response.orderId);
        setPrintPreviewData(ticketsData);
        setShowPrintPreview(true);

        const printedInfo = printResult.results.printed.length > 0
          ? `📄 Impression:\n` + printResult.results.printed.map((p: any) => 
              `  • ${p.destination}: ${p.items} article(s) → ${p.printer}`
            ).join('\n')
          : '⚠️ Aucune imprimante configurée';

        alert(
          `✅ Commande envoyée avec succès!\n\n` +
          `Ticket N°: ${response.ticketNumber}\n\n` +
          printedInfo
        );
      } catch (printError) {
        console.error('Erreur impression:', printError);
        alert(`✅ Commande créée (Ticket ${response.ticketNumber})\n⚠️ Erreur d'impression - vérifiez la configuration`);
      }

      // Réinitialiser
      setCart([]);
      setClientName('');
      setNotes('');

    } catch (error: any) {
      alert(error.response?.data?.error || 'Erreur lors de la création de la commande');
    }
  };

  const barItems = cart.filter(item => item.categoryType === 'boissons');
  const cuisineItems = cart.filter(item => item.categoryType === 'repas');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', height: 'calc(100vh - 150px)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              style={{
                padding: '0.75rem 1.5rem',
                background: selectedCategory === category.id 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : '#f0f0f0',
                color: selectedCategory === category.id ? 'white' : '#333',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              {category.type === 'boissons' ? '🍹' : '🍽️'} {category.name}
            </button>
          ))}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '1rem',
          overflowY: 'auto',
          flex: 1
        }}>
          {products.map(product => (
            <div
              key={product.id}
              onClick={() => addToCart(product)}
              style={{
                padding: '1rem',
                background: 'white',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                height: '140px',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ fontSize: '2rem' }}>
                {categories.find(c => c.id === product.categoryId)?.type === 'boissons' ? '🥤' : '🍽️'}
              </div>
              <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{product.name}</div>
              <div style={{ color: '#667eea', fontWeight: 'bold' }}>{product.price.toFixed(2)} MAD</div>
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

        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Client (ex: Chambre 10)"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid #ddd',
              borderRadius: '8px',
              marginBottom: '0.5rem'
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
              resize: 'none'
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
            disabled={cart.length === 0 || !clientName.trim()}
            style={{
              width: '100%',
              padding: '1rem',
              background: cart.length === 0 || !clientName.trim()
                ? '#ccc'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: cart.length === 0 || !clientName.trim() ? 'not-allowed' : 'pointer',
              fontSize: '1.1rem',
              fontWeight: '600'
            }}
          >
            📤 Envoyer la commande
          </button>
        </div>
      </div>

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
              Ticket: <strong>{printPreviewData.order.ticketNumber}</strong> | 
              Client: <strong>{printPreviewData.order.clientName}</strong>
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {printPreviewData.tickets.bar.items.length > 0 && (
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

              {printPreviewData.tickets.cuisine.items.length > 0 && (
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
    </div>
  );
}
