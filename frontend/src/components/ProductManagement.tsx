import React, { useState, useEffect } from 'react';
import { productService, categoryService } from '../services/api';
import type { Product, Category } from '../types';

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'repas' | 'boissons'>('all');
  const [filterCategory, setFilterCategory] = useState<number | null>(null);

  // Form states pour produit
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    categoryId: 0,
    image: '',
    available: true
  });

  // Form states pour catégorie
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    type: 'repas' as 'repas' | 'boissons'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        productService.getAll(),
        categoryService.getAll()
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  };

  const handleSaveProduct = async () => {
    try {
      if (editingProduct) {
        await productService.update(editingProduct.id, productForm);
      } else {
        await productService.create(productForm);
      }
      await loadData();
      resetProductForm();
      setShowProductModal(false);
    } catch (error) {
      alert('Erreur lors de la sauvegarde du produit');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Supprimer ce produit ?')) return;
    try {
      await productService.delete(id);
      await loadData();
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleSaveCategory = async () => {
    try {
      if (editingCategory) {
        await categoryService.update(editingCategory.id, categoryForm);
      } else {
        await categoryService.create(categoryForm);
      }
      await loadData();
      resetCategoryForm();
      setShowCategoryModal(false);
    } catch (error) {
      alert('Erreur lors de la sauvegarde de la catégorie');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Supprimer cette catégorie ? Tous les produits associés seront aussi supprimés.')) return;
    try {
      await categoryService.delete(id);
      await loadData();
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      categoryId: 0,
      image: '',
      available: true
    });
    setEditingProduct(null);
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      description: '',
      type: 'repas'
    });
    setEditingCategory(null);
  };

  const openProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description || '',
        price: product.price,
        stock: product.stock,
        categoryId: product.categoryId,
        image: product.image || '',
        available: product.available
      });
    } else {
      resetProductForm();
    }
    setShowProductModal(true);
  };

  const openCategoryModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        description: category.description || '',
        type: category.type || 'repas'
      });
    } else {
      resetCategoryForm();
    }
    setShowCategoryModal(true);
  };

  // Filtrer les produits
  const filteredProducts = products.filter(product => {
    if (filterCategory && product.categoryId !== filterCategory) return false;
    if (filterType !== 'all') {
      const category = categories.find(c => c.id === product.categoryId);
      if (category?.type !== filterType) return false;
    }
    return true;
  });

  // Filtrer les catégories
  const filteredCategories = filterType === 'all' 
    ? categories 
    : categories.filter(c => c.type === filterType);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
          <h2 style={{ margin: 0, flex: 1 }}>Gestion Produits & Catégories</h2>
          <button
            onClick={() => openCategoryModal()}
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
            ➕ Nouvelle Catégorie
          </button>
          <button
            onClick={() => openProductModal()}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            ➕ Nouveau Produit
          </button>
        </div>

        {/* Filtres */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            style={{
              padding: '0.5rem 1rem',
              border: '2px solid #667eea',
              borderRadius: '5px',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            <option value="all">Tous les types</option>
            <option value="repas">🍽️ Repas</option>
            <option value="boissons">🥤 Boissons</option>
          </select>
          <select
            value={filterCategory || ''}
            onChange={(e) => setFilterCategory(e.target.value ? Number(e.target.value) : null)}
            style={{
              padding: '0.5rem 1rem',
              border: '2px solid #667eea',
              borderRadius: '5px',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            <option value="">Toutes les catégories</option>
            {filteredCategories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.type === 'boissons' ? '🥤' : '🍽️'} {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Liste des catégories */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Catégories ({filteredCategories.length})</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {filteredCategories.map(category => (
            <div
              key={category.id}
              style={{
                background: 'white',
                padding: '1rem',
                borderRadius: '8px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                border: '2px solid #f0f0f0'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                <div style={{ flex: 1 }}>
                  <span style={{ 
                    fontSize: '1.5rem', 
                    marginRight: '0.5rem' 
                  }}>
                    {category.type === 'boissons' ? '🥤' : '🍽️'}
                  </span>
                  <strong style={{ fontSize: '1.1rem' }}>{category.name}</strong>
                  <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.85rem' }}>
                    {category.description}
                  </p>
                  <span style={{ 
                    display: 'inline-block', 
                    marginTop: '0.5rem', 
                    padding: '0.25rem 0.75rem', 
                    background: category.type === 'boissons' ? '#e3f2fd' : '#fff3e0',
                    color: category.type === 'boissons' ? '#1976d2' : '#e65100',
                    borderRadius: '12px', 
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    {category.type === 'boissons' ? 'Boissons' : 'Repas'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => openCategoryModal(category)}
                    style={{
                      padding: '0.4rem 0.8rem',
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    style={{
                      padding: '0.4rem 0.8rem',
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Liste des produits */}
      <div>
        <h3 style={{ marginBottom: '1rem' }}>Produits ({filteredProducts.length})</h3>
        <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Produit</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Catégorie</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Prix</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Stock</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Disponible</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
                    Aucun produit
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => {
                  const category = categories.find(c => c.id === product.categoryId);
                  return (
                    <tr key={product.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                      <td style={{ padding: '1rem' }}>
                        <strong>{product.name}</strong>
                        {product.description && (
                          <p style={{ margin: '0.25rem 0 0 0', color: '#666', fontSize: '0.85rem' }}>
                            {product.description}
                          </p>
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {category && (
                          <span>
                            {category.type === 'boissons' ? '🥤' : '🍽️'} {category.name}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600' }}>
                        {product.price.toFixed(2)} MAD
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          background: product.stock > 10 ? '#d4edda' : product.stock > 0 ? '#fff3cd' : '#f8d7da',
                          color: product.stock > 10 ? '#155724' : product.stock > 0 ? '#856404' : '#721c24',
                          borderRadius: '12px',
                          fontSize: '0.85rem',
                          fontWeight: '600'
                        }}>
                          {product.stock}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          background: product.available ? '#28a745' : '#dc3545',
                          color: 'white',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          {product.available ? 'Oui' : 'Non'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button
                            onClick={() => openProductModal(product)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#667eea',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.85rem'
                            }}
                          >
                            ✏️ Modifier
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.85rem'
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Produit */}
      {showProductModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '10px',
            width: '90%',
            maxWidth: '600px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ marginTop: 0 }}>
              {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
            </h3>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Nom *</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #dee2e6',
                    borderRadius: '5px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Description</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #dee2e6',
                    borderRadius: '5px',
                    fontSize: '1rem',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Prix (MAD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #dee2e6',
                      borderRadius: '5px',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Stock</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) || 0 })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #dee2e6',
                      borderRadius: '5px',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Catégorie *</label>
                <select
                  value={productForm.categoryId}
                  onChange={(e) => setProductForm({ ...productForm, categoryId: parseInt(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #dee2e6',
                    borderRadius: '5px',
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  <option value={0}>Sélectionner une catégorie</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.type === 'boissons' ? '🥤' : '🍽️'} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>URL Image</label>
                <input
                  type="text"
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  placeholder="https://..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #dee2e6',
                    borderRadius: '5px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={productForm.available}
                    onChange={(e) => setProductForm({ ...productForm, available: e.target.checked })}
                    style={{ marginRight: '0.5rem', transform: 'scale(1.2)' }}
                  />
                  <span style={{ fontWeight: '600' }}>Produit disponible</span>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                onClick={() => { setShowProductModal(false); resetProductForm(); }}
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
                onClick={handleSaveProduct}
                disabled={!productForm.name || !productForm.categoryId || productForm.price <= 0}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: productForm.name && productForm.categoryId && productForm.price > 0 ? '#28a745' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: productForm.name && productForm.categoryId && productForm.price > 0 ? 'pointer' : 'not-allowed',
                  fontWeight: '600'
                }}
              >
                {editingProduct ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Catégorie */}
      {showCategoryModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '10px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ marginTop: 0 }}>
              {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
            </h3>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Nom *</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #dee2e6',
                    borderRadius: '5px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Description</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #dee2e6',
                    borderRadius: '5px',
                    fontSize: '1rem',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Type *</label>
                <select
                  value={categoryForm.type}
                  onChange={(e) => setCategoryForm({ ...categoryForm, type: e.target.value as 'repas' | 'boissons' })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #dee2e6',
                    borderRadius: '5px',
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  <option value="repas">🍽️ Repas</option>
                  <option value="boissons">🥤 Boissons</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                onClick={() => { setShowCategoryModal(false); resetCategoryForm(); }}
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
                onClick={handleSaveCategory}
                disabled={!categoryForm.name}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: categoryForm.name ? '#28a745' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: categoryForm.name ? 'pointer' : 'not-allowed',
                  fontWeight: '600'
                }}
              >
                {editingCategory ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
