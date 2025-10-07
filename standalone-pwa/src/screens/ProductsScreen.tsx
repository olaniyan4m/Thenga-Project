import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../store/AuthContext';
import { useOffline } from '../store/OfflineContext';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  images: string[];
  category?: string;
  isActive: boolean;
}

export const ProductsScreen: React.FC = () => {
  const { user } = useAuth();
  const { isOnline, addToSyncQueue } = useOffline();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const queryClient = useQueryClient();

  // Fetch products
  const { data: products, isLoading } = useQuery(
    'products',
    async () => {
      const response = await fetch('/api/products', {
        headers: {
          'Authorization': `Bearer ${user?.accessToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
    {
      enabled: !!user?.accessToken,
      retry: 3,
    }
  );

  // Add product mutation
  const addProductMutation = useMutation(
    async (productData: Partial<Product>) => {
      if (isOnline) {
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user?.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        });
        if (!response.ok) throw new Error('Failed to add product');
        return response.json();
      } else {
        // Add to sync queue for offline
        await addToSyncQueue({
          type: 'product',
          data: productData,
        });
        return { success: true, message: 'Product will be synced when online' };
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
        setShowAddForm(false);
        toast.success('Product added successfully!');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to add product');
      },
    }
  );

  // Mock products for demo
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Coffee',
      description: 'Freshly brewed coffee',
      price: 25.00,
      stock: 50,
      images: ['/images/coffee.jpg'],
      category: 'Beverages',
      isActive: true,
    },
    {
      id: '2',
      name: 'Sandwich',
      description: 'Chicken and mayo sandwich',
      price: 45.00,
      stock: 20,
      images: ['/images/sandwich.jpg'],
      category: 'Food',
      isActive: true,
    },
    {
      id: '3',
      name: 'Tea',
      description: 'Hot tea with milk',
      price: 18.00,
      stock: 30,
      images: ['/images/tea.jpg'],
      category: 'Beverages',
      isActive: true,
    },
  ];

  const displayProducts = products || mockProducts;

  const handleAddProduct = (productData: Partial<Product>) => {
    addProductMutation.mutate(productData);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowAddForm(true);
  };

  return (
    <div className="products-screen">
      <div className="phone-frame">
        <div className="phone-screen">
          {/* Header */}
          <div className="screen-header">
            <h1>Products</h1>
            <button
              onClick={() => setShowAddForm(true)}
              className="add-button"
            >
              + Add Product
            </button>
          </div>

          {/* Products List */}
          <div className="products-content">
            {isLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading products...</p>
              </div>
            ) : displayProducts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <h3>No products yet</h3>
                <p>Add your first product to start selling</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="add-first-button"
                >
                  Add Product
                </button>
              </div>
            ) : (
              <div className="products-grid">
                {displayProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="product-card"
                  >
                    <div className="product-image">
                      {product.images.length > 0 ? (
                        <img src={product.images[0]} alt={product.name} />
                      ) : (
                        <div className="placeholder-image">📦</div>
                      )}
                    </div>
                    
                    <div className="product-info">
                      <h3 className="product-name">{product.name}</h3>
                      {product.description && (
                        <p className="product-description">{product.description}</p>
                      )}
                      <div className="product-price">R{product.price.toFixed(2)}</div>
                      <div className="product-stock">
                        Stock: {product.stock} units
                      </div>
                    </div>
                    
                    <div className="product-actions">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="edit-button"
                      >
                        Edit
                      </button>
                      <button className="delete-button">Delete</button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Add Product Form Modal */}
          {showAddForm && (
            <div className="modal-overlay">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="modal-content"
              >
                <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const productData = {
                      name: formData.get('name') as string,
                      description: formData.get('description') as string,
                      price: parseFloat(formData.get('price') as string),
                      stock: parseInt(formData.get('stock') as string),
                      category: formData.get('category') as string,
                    };
                    handleAddProduct(productData);
                  }}
                  className="product-form"
                >
                  <div className="form-group">
                    <label htmlFor="name">Product Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      defaultValue={editingProduct?.name || ''}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      defaultValue={editingProduct?.description || ''}
                      rows={3}
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="price">Price (R)</label>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        step="0.01"
                        defaultValue={editingProduct?.price || ''}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="stock">Stock</label>
                      <input
                        type="number"
                        id="stock"
                        name="stock"
                        defaultValue={editingProduct?.stock || ''}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select
                      id="category"
                      name="category"
                      defaultValue={editingProduct?.category || ''}
                    >
                      <option value="">Select category</option>
                      <option value="Food">Food</option>
                      <option value="Beverages">Beverages</option>
                      <option value="Snacks">Snacks</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div className="form-actions">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingProduct(null);
                      }}
                      className="cancel-button"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addProductMutation.isLoading}
                      className="save-button"
                    >
                      {addProductMutation.isLoading ? 'Saving...' : 'Save Product'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .products-screen {
          width: 100%;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }


        .screen-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          background: #f8f9fa;
          border-bottom: 1px solid #e0e0e0;
        }

        .screen-header h1 {
          font-size: 24px;
          font-weight: bold;
          color: #333;
          margin: 0;
        }

        .add-button {
          background: #2E7D32;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }

        .products-content {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #2E7D32;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          font-size: 18px;
          color: #333;
          margin: 0 0 8px 0;
        }

        .empty-state p {
          color: #666;
          margin: 0 0 20px 0;
        }

        .add-first-button {
          background: #2E7D32;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
        }

        .products-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .product-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .product-image {
          width: 100%;
          height: 120px;
          background: #f5f5f5;
          border-radius: 8px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .placeholder-image {
          font-size: 32px;
          color: #ccc;
        }

        .product-info {
          margin-bottom: 12px;
        }

        .product-name {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin: 0 0 4px 0;
        }

        .product-description {
          font-size: 14px;
          color: #666;
          margin: 0 0 8px 0;
        }

        .product-price {
          font-size: 18px;
          font-weight: bold;
          color: #2E7D32;
          margin-bottom: 4px;
        }

        .product-stock {
          font-size: 12px;
          color: #666;
        }

        .product-actions {
          display: flex;
          gap: 8px;
        }

        .edit-button,
        .delete-button {
          flex: 1;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          border: none;
        }

        .edit-button {
          background: #2196F3;
          color: white;
        }

        .delete-button {
          background: #f44336;
          color: white;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          padding: 24px;
          width: 90%;
          max-width: 400px;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-content h2 {
          font-size: 20px;
          font-weight: 600;
          color: #333;
          margin: 0 0 20px 0;
        }

        .product-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-size: 14px;
          font-weight: 500;
          color: #333;
          margin-bottom: 6px;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          padding: 10px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          font-size: 14px;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: #2E7D32;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        .cancel-button,
        .save-button {
          flex: 1;
          padding: 12px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border: none;
        }

        .cancel-button {
          background: #f5f5f5;
          color: #666;
        }

        .save-button {
          background: #2E7D32;
          color: white;
        }

        .save-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

      `}</style>
    </div>
  );
};
