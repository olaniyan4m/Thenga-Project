// 📦 Products Management Screen
// Handles product inventory, pricing, and stock management

import React, { useState, useEffect } from 'react';
import { apiService } from '../services/ApiService';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image: string;
}

interface ProductsScreenProps {
  user: any;
  onLogout: () => void;
}

const ProductsScreen: React.FC<ProductsScreenProps> = ({ user, onLogout }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [liveProducts, setLiveProducts] = useState<any[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    image: ''
  });

  // Load live products data
  useEffect(() => {
    const loadLiveProducts = async () => {
      setIsLoading(true);
      try {
        const isProduction = process.env.NODE_ENV === 'production' || 
                             window.location.hostname !== 'localhost';
        
        if (isProduction) {
          const response = await fetch('/api/products', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('apiKey')}` }
          });
          if (response.ok) {
            const data = await response.json();
            setLiveProducts(data.products || []);
            setProducts(data.products || []);
          }
        } else {
          // Development mode - use mock data
          const sampleProducts: Product[] = [
            { id: '1', name: 'Beef Kota', price: 45.00, stock: 20, category: 'Kota', image: '/assets/Beef_Kota.jpg', description: 'Delicious beef kota with fresh ingredients' },
            { id: '2', name: 'Chicken Kota', price: 40.00, stock: 25, category: 'Kota', image: '/assets/Chicken_Kota.jpg', description: 'Tender chicken kota with crispy bread' },
            { id: '3', name: 'Classic Kota', price: 35.00, stock: 30, category: 'Kota', image: '/assets/Classic_Kota.jpg', description: 'Traditional kota with classic fillings' },
            { id: '4', name: 'Chips', price: 15.00, stock: 50, category: 'Sides', image: '/assets/Chips.jpeg', description: 'Crispy golden chips' },
            { id: '5', name: 'Coca Cola', price: 12.00, stock: 40, category: 'Beverages', image: '/assets/coca_cola.webp', description: 'Refreshing Coca Cola drink' },
            { id: '6', name: 'Fanta', price: 12.00, stock: 35, category: 'Beverages', image: '/assets/Fanta.webp', description: 'Orange flavored Fanta drink' }
          ];
          setLiveProducts(sampleProducts);
          setProducts(sampleProducts);
          localStorage.setItem('pezela-products', JSON.stringify(sampleProducts));
        }
      } catch (error) {
        console.error('Failed to load live products:', error);
        // Fallback to localStorage if API fails
        const storedProducts = localStorage.getItem('pezela-products');
        if (storedProducts) {
          setProducts(JSON.parse(storedProducts));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadLiveProducts();
  }, []);

  const saveProducts = async (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    localStorage.setItem('pezela-products', JSON.stringify(updatedProducts));
    
    // Sync with live API
    try {
      const isProduction = process.env.NODE_ENV === 'production' || 
                           window.location.hostname !== 'localhost';
      
      if (isProduction) {
        await fetch('/api/products', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('apiKey')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            businessId: user?.id,
            products: updatedProducts,
            updatedAt: new Date().toISOString()
          })
        });
        console.log('Products synced to live system');
      }
    } catch (error) {
      console.error('Failed to sync products to live system:', error);
    }
  };

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.price > 0) {
      const product: Product = {
        id: Date.now().toString(),
        ...newProduct
      };
      saveProducts([...products, product]);
      setNewProduct({ name: '', description: '', price: 0, stock: 0, category: '', image: '' });
      setShowAddProduct(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      image: product.image
    });
    setShowAddProduct(true);
  };

  const handleUpdateProduct = () => {
    if (editingProduct && newProduct.name && newProduct.price > 0) {
      const updatedProducts = products.map(p => 
        p.id === editingProduct.id ? { ...p, ...newProduct } : p
      );
      saveProducts(updatedProducts);
      setEditingProduct(null);
      setNewProduct({ name: '', description: '', price: 0, stock: 0, category: '', image: '' });
      setShowAddProduct(false);
    }
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const updatedProducts = products.filter(p => p.id !== id);
      saveProducts(updatedProducts);
    }
  };

  const updateStock = (id: string, change: number) => {
    const updatedProducts = products.map(p => 
      p.id === id ? { ...p, stock: Math.max(0, p.stock + change) } : p
    );
    saveProducts(updatedProducts);
  };

  return (
    <div className="screen">
      <div className="screen-header">
        <div className="header-left">
          <img src="/assets/Logo2.PNG" alt="Pezela Logo" className="header-logo" />
          <h1>Products ({products.length})</h1>
          {isLoading && (
            <div className="loading-indicator">
              <span>🔄 Loading live products...</span>
            </div>
          )}
        </div>
        <div className="header-actions">
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </div>
      
      <div className="screen-content">
        {/* Product Stats */}
        <div className="product-stats">
          <div className="stat-card">
            <h3>Total Products</h3>
            <p>{products.length}</p>
          </div>
          <div className="stat-card">
            <h3>Low Stock</h3>
            <p>{products.filter(p => p.stock < 10).length}</p>
          </div>
          <div className="stat-card">
            <h3>Categories</h3>
            <p>{new Set(products.map(p => p.category)).size}</p>
          </div>
        </div>

        {/* Products List */}
        <div className="products-list">
          <h3>Product Inventory</h3>
          {products.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                {product.image && <img src={product.image} alt={product.name} />}
              </div>
              <div className="product-info">
                <h4>{product.name}</h4>
                <p className="product-description">{product.description}</p>
                <div className="product-price">R{product.price.toFixed(2)}</div>
                <div className="product-category">{product.category}</div>
              </div>
              <div className="product-stock">
                <div className="stock-controls">
                  <button onClick={() => updateStock(product.id, -1)} className="stock-btn">-</button>
                  <span className="stock-count">{product.stock}</span>
                  <button onClick={() => updateStock(product.id, 1)} className="stock-btn">+</button>
                </div>
                <div className="stock-status">
                  {product.stock < 10 && <span className="low-stock">Low Stock</span>}
                </div>
              </div>
              <div className="product-actions">
                <button onClick={() => handleEditProduct(product)} className="edit-btn">
                  Edit
                </button>
                <button onClick={() => handleDeleteProduct(product.id)} className="delete-btn">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Product Button */}
        <div className="add-product-section">
          <button onClick={() => setShowAddProduct(true)} className="add-product-btn">
            + Add Product
          </button>
        </div>

        {/* Add/Edit Product Modal */}
        {showAddProduct && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <button onClick={() => {
                  setShowAddProduct(false);
                  setEditingProduct(null);
                  setNewProduct({ name: '', description: '', price: 0, stock: 0, category: '', image: '' });
                }} className="close-btn">×</button>
              </div>
              <div className="modal-content">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    placeholder="Enter product name"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    placeholder="Enter product description"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Price (R) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="form-group">
                    <label>Stock Quantity</label>
                    <input
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value) || 0})}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  >
                    <option value="">Select Category</option>
                    <option value="Kota">Kota</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Sides">Sides</option>
                    <option value="Food">Food</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Pastries">Pastries</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button onClick={() => {
                    setShowAddProduct(false);
                    setEditingProduct(null);
                    setNewProduct({ name: '', description: '', price: 0, stock: 0, category: '', image: '' });
                  }} className="cancel-btn">Cancel</button>
                  <button 
                    onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
                    className="save-btn"
                    disabled={!newProduct.name || newProduct.price <= 0}
                  >
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsScreen;

