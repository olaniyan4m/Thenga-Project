import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../store/AuthContext';
import { useOffline } from '../store/OfflineContext';
import { OfflineIndicator } from '../components/OfflineIndicator';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
}

export const CustomerProductsScreen: React.FC = () => {
  const { user } = useAuth();
  const { isOnline } = useOffline();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Load products
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      // Mock product data
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Beef Kota',
          description: 'Delicious beef kota with fresh ingredients',
          price: 45.00,
          image: '/assets/Beef_Kota.jpg',
          category: 'kota',
          inStock: true,
        },
        {
          id: '2',
          name: 'Chicken Kota',
          description: 'Tender chicken kota with special sauce',
          price: 42.00,
          image: '/assets/Chicken_Kota.jpg',
          category: 'kota',
          inStock: true,
        },
        {
          id: '3',
          name: 'Classic Kota',
          description: 'Traditional kota with classic fillings',
          price: 38.00,
          image: '/assets/Classic_Kota.jpg',
          category: 'kota',
          inStock: true,
        },
        {
          id: '4',
          name: 'Chips',
          description: 'Crispy golden chips',
          price: 15.00,
          image: '/assets/Chips.jpeg',
          category: 'sides',
          inStock: true,
        },
        {
          id: '5',
          name: 'Coca Cola',
          description: 'Refreshing Coca Cola drink',
          price: 12.00,
          image: '/assets/coca_cola.webp',
          category: 'drinks',
          inStock: true,
        },
        {
          id: '6',
          name: 'Fanta',
          description: 'Orange Fanta drink',
          price: 12.00,
          image: '/assets/Fanta.webp',
          category: 'drinks',
          inStock: true,
        },
      ];
      
      setProducts(mockProducts);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => [...prev, product]);
    alert(`${product.name} added to cart!`);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'kota', 'sides', 'drinks'];

  return (
    <div className="customer-products-screen">
      {!isOnline && <OfflineIndicator />}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="products-container"
      >
        {/* Header */}
        <div className="products-header">
          <h1>🛍️ Shop Products</h1>
          <p>Browse our delicious menu</p>
        </div>

        {/* Search and Filter */}
        <div className="search-filter-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="category-filter">
            {categories.map(category => (
              <button
                key={category}
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Cart Summary */}
        {cart.length > 0 && (
          <div className="cart-summary">
            <div className="cart-info">
              <span>🛒 {cart.length} items in cart</span>
              <span>Total: R{cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</span>
            </div>
            <button className="checkout-btn">Checkout</button>
          </div>
        )}

        {/* Products Grid */}
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="product-card"
            >
              <div className="product-image">
                <img src={product.image} alt={product.name} />
                {!product.inStock && (
                  <div className="out-of-stock">Out of Stock</div>
                )}
              </div>
              
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-price">R{product.price.toFixed(2)}</div>
              </div>
              
              <button
                className={`add-to-cart-btn ${!product.inStock ? 'disabled' : ''}`}
                onClick={() => addToCart(product)}
                disabled={!product.inStock}
              >
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No products found</h3>
            <p>Try adjusting your search or filter</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
