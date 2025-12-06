import React, { useState, useEffect } from 'react';
import { categoryService, productService } from '../services/api';
import type { Category, Product } from '../types';

const CategoriesProducts: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'categories' | 'products'>('categories');
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [productForm, setProductForm] = useState({
    categoryId: 0,
    name: '',
    description: '',
    price: 0,
    stock: 0,
    image: '',
  });

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await categoryService.create(categoryForm);
      setCategoryForm({ name: '', description: '' });
      setShowCategoryForm(false);
      loadCategories();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erreur création catégorie');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await productService.create(productForm);
      setProductForm({ categoryId: 0, name: '', description: '', price: 0, stock: 0, image: '' });
      setShowProductForm(false);
      loadProducts();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erreur création produit');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (confirm('Supprimer cette catégorie et tous ses produits?')) {
      try {
        await categoryService.delete(id);
        loadCategories();
        loadProducts();
      } catch (error) {
        alert('Erreur suppression catégorie');
      }
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm('Supprimer ce produit?')) {
      try {
        await productService.delete(id);
        loadProducts();
      } catch (error) {
        alert('Erreur suppression produit');
      }
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.8rem', color: '#333', marginBottom: '1.5rem' }}>Catégories & Produits</h2>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #eee' }}>
        <button
          onClick={() => setActiveTab('categories')}
          style={{
            padding: '1rem 2rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'categories' ? '3px solid #667eea' : '3px solid transparent',
            color: activeTab === 'categories' ? '#667eea' : '#666',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Catégories ({categories.length})
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
          Produits ({products.length})
        </button>
      </div>

      {activeTab === 'categories' ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3>Gestion des catégories</h3>
            <button
              onClick={() => setShowCategoryForm(!showCategoryForm)}
              style={{ padding: '0.75rem 1.5rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '600' }}
            >
              {showCategoryForm ? 'Annuler' : '+ Nouvelle catégorie'}
            </button>
          </div>

          {showCategoryForm && (
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '10px', marginBottom: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              <form onSubmit={handleCreateCategory}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Nom de la catégorie</label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    required
                    placeholder="Ex: Boissons, Plats..."
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '5px' }}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description (optionnel)</label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    rows={3}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '5px' }}
                  />
                </div>
                <button type="submit" style={{ padding: '0.75rem 2rem', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '600' }}>
                  Créer la catégorie
                </button>
              </form>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {categories.map((cat) => (
              <div key={cat.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <h4 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>{cat.name}</h4>
                {cat.description && <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>{cat.description}</p>}
                <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '1rem' }}>{cat.productCount || 0} produit(s)</p>
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  style={{ width: '100%', padding: '0.5rem', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3>Gestion des produits</h3>
            <button
              onClick={() => setShowProductForm(!showProductForm)}
              style={{ padding: '0.75rem 1.5rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '600' }}
            >
              {showProductForm ? 'Annuler' : '+ Nouveau produit'}
            </button>
          </div>

          {showProductForm && (
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '10px', marginBottom: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              <form onSubmit={handleCreateProduct} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Catégorie</label>
                  <select
                    value={productForm.categoryId}
                    onChange={(e) => setProductForm({ ...productForm, categoryId: parseInt(e.target.value) })}
                    required
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '5px' }}
                  >
                    <option value={0}>Sélectionner...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Nom du produit</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '5px' }}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description</label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    rows={2}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '5px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Prix (MAD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) })}
                    required
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '5px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Stock (optionnel)</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '5px' }}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>URL de l'image (optionnel)</label>
                  <input
                    type="text"
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    placeholder="https://..."
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '5px' }}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <button type="submit" style={{ padding: '0.75rem 2rem', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '600' }}>
                    Créer le produit
                  </button>
                </div>
              </form>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {products.map((prod) => (
              <div key={prod.id} style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                {prod.image && (
                  <img src={prod.image} alt={prod.name} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                )}
                {!prod.image && (
                  <div style={{ width: '100%', height: '150px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                    📷 Pas d'image
                  </div>
                )}
                <div style={{ padding: '1rem' }}>
                  <p style={{ fontSize: '0.75rem', color: '#667eea', marginBottom: '0.25rem' }}>{prod.categoryName}</p>
                  <h4 style={{ marginBottom: '0.5rem' }}>{prod.name}</h4>
                  {prod.description && <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>{prod.description}</p>}
                  <p style={{ fontSize: '1.2rem', fontWeight: '700', color: '#28a745', marginBottom: '0.5rem' }}>{prod.price.toFixed(2)} MAD</p>
                  <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '1rem' }}>Stock: {prod.stock}</p>
                  <button
                    onClick={() => handleDeleteProduct(prod.id)}
                    style={{ width: '100%', padding: '0.5rem', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesProducts;
