// 🛍️ Customer Storefront Component
// Public-facing storefront that customers see when merchants share their link

import React, { useState, useEffect } from 'react';
import { orderService } from '../services/OrderService';
import { whatsAppService } from '../services/WhatsAppService';
import { firebaseService } from '../services/FirebaseService';
import { paymentService } from '../services/PaymentService';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
  variants?: Array<{
    name: string;
    price: number;
    isAvailable: boolean;
  }>;
}

interface CartItem {
  product: Product;
  quantity: number;
  variant?: string;
  totalPrice: number;
}

interface Storefront {
  id: string;
  merchantName: string;
  description: string;
  logo: string;
  banner: string;
  address: string;
  phone: string;
  hours: {
    [key: string]: { open: string; close: string; closed: boolean };
  };
  deliveryFee: number;
  minimumOrder: number;
  isOpen: boolean;
}

const CustomerStorefront: React.FC = () => {
  const [storefront, setStorefront] = useState<Storefront | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
    email: ''
  });
  const [currentView, setCurrentView] = useState<'catalogue' | 'orders' | 'account'>('catalogue');
  const [orders, setOrders] = useState<any[]>([]);
  const [showCustomerForm, setShowCustomerForm] = useState(true);
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [cartItems, setCartItems] = useState([
    { id: '3', name: 'Beef Kota', price: 50.00, quantity: 1, image: '/assets/Beef_Kota.jpg' },
    { id: '4', name: 'Coca Cola', price: 15.00, quantity: 1, image: '/assets/coca_cola.webp' }
  ]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [savedCards, setSavedCards] = useState([
    { id: 1, last4: '1234', brand: 'Visa', expiry: '12/25', isDefault: true }
  ]);
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    saveCard: true
  });
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [whatsappMessages, setWhatsappMessages] = useState([
    {
      id: 1,
      from: 'business',
      message: 'Welcome to Mama Zanele\'s Kota Stand! How can we help you today?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Subscribe to order updates
  useEffect(() => {
    const unsubscribeOrders = orderService.subscribe((orders) => {
      // Update customer orders when business updates them
      const customerOrders = orders.filter(order => 
        order.customerPhone === customerInfo?.phone
      );
      setOrders(customerOrders);
    });

    return unsubscribeOrders;
  }, [customerInfo?.phone]);

  // Subscribe to WhatsApp messages
  useEffect(() => {
    if (customerInfo?.phone) {
      const unsubscribeWhatsApp = whatsAppService.subscribeCustomer(customerInfo.phone, (messages) => {
        setWhatsappMessages(messages);
      });

      return unsubscribeWhatsApp;
    }
  }, [customerInfo?.phone]);

  // Check if customer info exists in localStorage
  useEffect(() => {
    const savedCustomerInfo = localStorage.getItem('customer-info');
    if (savedCustomerInfo) {
      const customerData = JSON.parse(savedCustomerInfo);
      setCustomerInfo(customerData);
      setIsLoading(false);
      // Don't show customer form if info exists
    } else {
      // Show loading then customer form for new users
      const timer = setTimeout(() => {
        setIsLoading(false);
        setShowCustomerForm(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Get business data dynamically
  useEffect(() => {
    // In a real app, this would get the business ID from URL params
    // For now, we'll use mock data but structure it for dynamic loading
    const getBusinessData = async () => {
      // Get business ID from URL (e.g., /customer/store_123 or ?business=store_123)
      const urlParams = new URLSearchParams(window.location.search);
      const businessId = urlParams.get('business') || 'store_123'; // Default for demo
      
      // In a real app, this would be an API call:
      // const businessData = await fetch(`/api/business/${businessId}`).then(r => r.json());
      
      // For now, using mock data but with dynamic structure
      const mockStorefront: Storefront = {
        id: businessId,
        merchantName: 'Mama Zanele\'s Kota Stand',
        description: 'Fresh, delicious kotas made with love. Serving the community for over 10 years.',
        logo: '/assets/Kota_logo.png', // This would be the business's actual logo
        banner: '/api/placeholder/400/200',
        address: '123 Main Street, Soweto, Johannesburg',
        phone: '+27 11 123 4567',
        hours: {
          monday: { open: '08:00', close: '18:00', closed: false },
          tuesday: { open: '08:00', close: '18:00', closed: false },
          wednesday: { open: '08:00', close: '18:00', closed: false },
          thursday: { open: '08:00', close: '18:00', closed: false },
          friday: { open: '08:00', close: '20:00', closed: false },
          saturday: { open: '09:00', close: '20:00', closed: false },
          sunday: { open: '10:00', close: '16:00', closed: false }
        },
        deliveryFee: 25,
        minimumOrder: 50,
        isOpen: true
      };
      
      setStorefront(mockStorefront);
      
      const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Classic Kota',
        description: 'Fresh bread with chips, polony, and atchar',
        price: 35,
        image: '/assets/Classic_Kota.jpg',
        category: 'meats',
        isAvailable: true
      },
      {
        id: '2',
        name: 'Chicken Kota',
        description: 'Fresh bread with chips, chicken, and atchar',
        price: 45,
        image: '/assets/Chicken_Kota.jpg',
        category: 'meats',
        isAvailable: true
      },
      {
        id: '3',
        name: 'Beef Kota',
        description: 'Fresh bread with chips, beef, and atchar',
        price: 50,
        image: '/assets/Beef_Kota.jpg',
        category: 'meats',
        isAvailable: true
      },
      {
        id: '4',
        name: 'Coca-Cola',
        description: 'Ice-cold Coca-Cola 500ml',
        price: 15,
        image: '/assets/coca_cola.webp',
        category: 'drinks',
        isAvailable: true
      },
      {
        id: '5',
        name: 'Fanta',
        description: 'Ice-cold Fanta 500ml',
        price: 15,
        image: '/assets/Fanta.webp',
        category: 'drinks',
        isAvailable: true
      },
      {
        id: '6',
        name: 'Chips',
        description: 'Fresh hot chips with salt',
        price: 20,
        image: '/assets/Chips.jpeg',
        category: 'veggies',
        isAvailable: true
      },
      {
        id: '7',
        name: 'Fresh Salad',
        description: 'Mixed green salad with tomatoes',
        price: 25,
        image: '/assets/Classic_Kota.jpg',
        category: 'veggies',
        isAvailable: true
      },
      {
        id: '8',
        name: 'Hot Sauce',
        description: 'Spicy hot sauce',
        price: 10,
        image: '/assets/Classic_Kota.jpg',
        category: 'salsas',
        isAvailable: true
      },
      {
        id: '9',
        name: 'Baked Beans',
        description: 'Traditional baked beans',
        price: 18,
        image: '/assets/Classic_Kota.jpg',
        category: 'beans',
        isAvailable: true
      }
    ];

      const mockOrders = [
        { id: '1', date: '2024-01-15', items: ['Beef Kota', 'Chips'], total: 45.00, status: 'Delivered' },
        { id: '2', date: '2024-01-14', items: ['Chicken Kota', 'Coke'], total: 35.00, status: 'Delivered' },
        { id: '3', date: '2024-01-13', items: ['Veggie Kota'], total: 25.00, status: 'Preparing' }
      ];

      setProducts(mockProducts);
      setOrders(mockOrders);
    };
    
    getBusinessData();
  }, []);

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch && product.isAvailable;
  });

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * product.price }
          : item
      ));
    } else {
      setCart([...cart, {
        product,
        quantity: 1,
        totalPrice: product.price
      }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };


  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.totalPrice, 0);
  };

  const getDeliveryTotal = () => {
    const subtotal = getCartTotal();
    return subtotal >= storefront?.minimumOrder ? storefront?.deliveryFee || 0 : 0;
  };

  const getGrandTotal = () => {
    return getCartTotal() + getDeliveryTotal();
  };

  const handleCheckout = () => {
    if (getCartTotal() < (storefront?.minimumOrder || 0)) {
      alert(`Minimum order is R${storefront?.minimumOrder}. Please add more items.`);
      return;
    }
    setShowCheckout(true);
  };


  if (!storefront) {
    return <div className="loading">Loading storefront...</div>;
  }

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (customerDetails.name && customerDetails.email && customerDetails.phone) {
      try {
        // Create customer data for Firebase
        const customerData = {
          id: `customer_${Date.now()}`,
          name: customerDetails.name,
          email: customerDetails.email,
          phone: customerDetails.phone,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Save to Firebase
        await firebaseService.saveCustomerData(customerData);
        
        // Also save to localStorage for offline access
        localStorage.setItem('customer-info', JSON.stringify(customerDetails));
        
        setCustomerInfo(customerDetails);
        setShowCustomerForm(false);
        alert('Welcome! You can now browse our products.');
      } catch (error) {
        console.error('Error saving customer data:', error);
        // Fallback to localStorage only
        localStorage.setItem('customer-info', JSON.stringify(customerDetails));
        setCustomerInfo(customerDetails);
        setShowCustomerForm(false);
        alert('Welcome! You can now browse our products.');
      }
    } else {
      alert('Please fill in all required fields.');
    }
  };

  const updateQuantity = (id: string, change: number) => {
    console.log('updateQuantity called with:', id, change);
    setCartItems(prevItems => {
      console.log('Current cartItems:', prevItems);
      
      // Find the product from the products array
      const product = products.find(p => p.id === id);
      if (!product) {
        console.log('Product not found:', id);
        return prevItems;
      }
      
      // Check if item already exists in cart
      const existingItem = prevItems.find(item => item.id === id);
      
      if (existingItem) {
        // Update existing item
        const updatedItems = prevItems.map(item => {
          if (item.id === id) {
            const newQuantity = Math.max(0, item.quantity + change);
            console.log('Updating item:', item.name, 'from', item.quantity, 'to', newQuantity);
            if (newQuantity === 0) {
              return null; // Remove item if quantity becomes 0
            }
            return { ...item, quantity: newQuantity };
          }
          return item;
        }).filter(item => item !== null) as typeof prevItems;
        console.log('Updated cartItems:', updatedItems);
        return updatedItems;
      } else {
        // Add new item to cart
        if (change > 0) {
          const newItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: change,
            image: product.image
          };
          console.log('Adding new item to cart:', newItem);
          const updatedItems = [...prevItems, newItem];
          console.log('Updated cartItems:', updatedItems);
          return updatedItems;
        }
        return prevItems;
      }
    });
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const handlePlaceOrder = () => {
    setShowPaymentModal(true);
  };

  const handlePayment = async (cardId?: number) => {
    try {
      // Create order data
      const orderData = {
        customerName: customerDetails.name,
        customerEmail: customerDetails.email,
        customerPhone: customerDetails.phone,
        customerAddress: '123 Main Street, Johannesburg', // In real app, get from form
        items: cartItems.map(item => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          totalPrice: item.price * item.quantity
        })),
        subtotal: getTotalPrice(),
        deliveryFee: 25,
        tax: getTotalPrice() * 0.15,
        totalAmount: getTotalPrice() + 25 + (getTotalPrice() * 0.15),
        status: 'pending' as const,
        paymentMethod: cardId ? 'card' as const : 'card' as const,
        paymentStatus: 'paid' as const,
        notes: 'Order placed via customer storefront',
        businessId: 'store_123'
      };

      // Create order in the system
      const order = orderService.createOrder(orderData);

      // Process payment and link to business account
      const paymentResult = await paymentService.processCustomerPayment({
        businessId: 'store_123',
        customerId: customerDetails.phone, // Using phone as customer ID
        orderId: order.id,
        amount: order.totalAmount,
        customerName: customerDetails.name,
        customerEmail: customerDetails.email,
        customerPhone: customerDetails.phone,
        paymentMethod: 'card'
      });

      if (paymentResult.success) {
        console.log('Payment processed successfully:', paymentResult.paymentId);
      } else {
        console.error('Payment processing failed:', paymentResult.error);
      }

      if (cardId) {
        // Use saved card
        alert(`Order #${order.orderNumber} placed successfully using saved card ending in ${savedCards.find(c => c.id === cardId)?.last4}!`);
      } else {
        // Use new card
        if (newCard.saveCard) {
          const newCardId = savedCards.length + 1;
          setSavedCards(prev => [...prev, {
            id: newCardId,
            last4: newCard.cardNumber.slice(-4),
            brand: 'Visa', // In real app, detect from card number
            expiry: newCard.expiryDate,
            isDefault: false
          }]);
          alert(`Order #${order.orderNumber} placed successfully! Card saved for future orders.`);
        } else {
          alert(`Order #${order.orderNumber} placed successfully!`);
        }
      }
      
      setShowPaymentModal(false);
      setCartItems([]); // Clear cart after successful order
      
      // Show success message with order details
      setTimeout(() => {
        alert(`Order Confirmed!\n\nOrder #${order.orderNumber}\nTotal: R${order.totalAmount.toFixed(2)}\n\nYou will receive WhatsApp updates about your order status.`);
      }, 500);
      
    } catch (error) {
      console.error('Payment processing error:', error);
      alert('Payment processing failed. Please try again.');
    }
  };

  const handleNewCardChange = (field: string, value: string) => {
    setNewCard(prev => ({ ...prev, [field]: value }));
  };

  const sendWhatsAppMessage = () => {
    if (newMessage.trim() && customerInfo) {
      // Send message to business via WhatsApp service
      whatsAppService.sendCustomerMessage(customerInfo.name, customerInfo.phone, newMessage);
      setNewMessage('');
      
      // Simulate business response
      setTimeout(() => {
        const responses = [
          "Thank you for your message! We'll get back to you shortly.",
          "Your order is being prepared! We'll notify you when it's ready.",
          "Is there anything specific you'd like to know about our menu?",
          "We're here to help! What can we do for you today?"
        ];
        const response = responses[Math.floor(Math.random() * responses.length)];
        whatsAppService.sendBusinessMessage(customerInfo.phone, response);
      }, 2000);
    }
  };

  const renderContent = () => {

    if (currentView === 'orders') {
      return (
        <div className="cart-page">
          <div className="cart-header">
            <div></div>
            <h2>My Cart</h2>
            <div></div>
          </div>
          
          <div className="main-cart-card">
            {cartItems.length > 0 ? cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p className="unit-price">R{item.price.toFixed(2)} / {item.name === 'Beef Kota' ? 'each' : 'bottle'}</p>
                  <p className="quantity-size">{item.name === 'Beef Kota' ? '1 kota' : '500ml'}</p>
                  <div className="item-controls">
                    <div className="price-display">
                      <span className="total-price">R{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                    <div className="quantity-controls">
                      <button 
                        className="qty-btn minus" 
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        -
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button 
                        className="qty-btn plus" 
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="empty-cart">
                <p>Your cart is empty</p>
              </div>
            )}
            
            <div className="cart-summary">
              <div className="summary-left">
                <p>{getTotalItems()} Items added</p>
                <p>Total Price</p>
              </div>
              <div className="summary-right">
                <span className="total-price">R{getTotalPrice().toFixed(2)}</span>
                <button className="place-order-btn" onClick={handlePlaceOrder}>PLACE ORDER</button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (currentView === 'account') {
      return (
        <div className="account-page">
          <div className="account-header">
            <h2>My Account</h2>
            <p>Manage your profile and preferences</p>
          </div>
          <div className="account-content">
            <div className="account-section">
              <h3>Profile Information</h3>
              <p>Name: {customerDetails.name || 'John Doe'}</p>
              <p>Email: {customerDetails.email || 'john@example.com'}</p>
              <p>Phone: {customerDetails.phone || '+27 12 345 6789'}</p>
            </div>
            <div className="account-section">
              <h3>Saved Payment Methods</h3>
              {savedCards.map(card => (
                <div key={card.id} className="saved-card-account">
                  <div className="card-info">
                    <span className="card-brand">{card.brand}</span>
                    <span className="card-number">**** **** **** {card.last4}</span>
                    <span className="card-expiry">Expires {card.expiry}</span>
                  </div>
                  {card.isDefault && <span className="default-badge">Default</span>}
                </div>
              ))}
            </div>
            <div className="account-section">
              <h3>Order History</h3>
              <p>Total Orders: 3</p>
              <p>Last Order: R70.00</p>
            </div>
          </div>
        </div>
      );
    }

    // Default catalogue view
    return (
      <>
        {/* Modern Categories */}
        <div className="modern-categories">
          <div className="category-filters">
            {['Meats', 'Veggies', 'Salsas', 'Drinks', 'Beans'].map(category => (
              <button
                key={category}
                className={`category-btn ${selectedCategory === category.toLowerCase() ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.toLowerCase())}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Modern Products Grid */}
        <div className="modern-products">
          <div className="products-grid">
            {filteredProducts.map(product => {
              const cartItem = cartItems.find(item => item.id === product.id);
              const quantity = cartItem ? cartItem.quantity : 0;
              const totalPrice = quantity * product.price;
              
              return (
                <div key={product.id} className="modern-product-card" onClick={() => setCurrentView('orders')}>
                  <div className="product-image">
                    <img src={product.image} alt={product.name} />
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="price-per-unit">R{product.price} / lb (20lb / bag)</p>
                    <div className="product-controls">
                      <div className="price-display">
                        <span className="total-price">R{totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="quantity-controls">
                        <button 
                          className="qty-btn minus"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQuantity(product.id, -1);
                          }}
                          disabled={quantity === 0}
                        >
                          -
                        </button>
                        <span className="quantity">{quantity}</span>
                        <button 
                          className="qty-btn plus"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQuantity(product.id, 1);
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Store Hours */}
        <div className="store-hours">
          <h3>Store Hours</h3>
          <div className="hours-list">
            {Object.entries(storefront.hours).map(([day, hours]) => {
              console.log('Rendering day:', day, hours);
              return (
                <div key={day} className="hours-item" style={{backgroundColor: '#f0f0f0', margin: '2px 0', padding: '4px'}}>
                  <span className="day">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                  <span className="time">
                    {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  };

  // Show loading screen
  if (isLoading) {
    return (
      <div className="customer-storefront">
        <div className="loading-screen">
          <div className="loading-content">
            <div className="loading-logo">
              <img src={storefront?.logo || '/assets/Kota_logo.png'} alt="Store logo" />
            </div>
            <h2>Welcome to Mama Zanele's Kota Stand</h2>
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
            <p>Loading your delicious experience...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-storefront">
      {/* Modern Header */}
      <div className="modern-header">
        <div className="header-top">
          <div className="store-logo">
            <img src={storefront.logo} alt="Store logo" />
            <h1>{storefront.merchantName}</h1>
          </div>
                  <div className="header-actions">
                    <button className="cart-btn" onClick={() => setCurrentView('orders')}>
                      🛒 {getTotalItems() > 0 && <span className="cart-count">{getTotalItems()}</span>}
                    </button>
                    <button className="whatsapp-btn" onClick={() => setShowWhatsApp(true)}>
                      💬
                    </button>
                    <button className="notifications-btn" onClick={() => setCurrentView('orders')}>🔔</button>
                  </div>
        </div>
      </div>

      {/* Dynamic Content */}
      {renderContent()}


      {/* Customer Information Modal */}
      {showCustomerForm && (
        <div className="customer-modal-overlay">
          <div className="customer-modal">
            <div className="modal-header">
              <h2>Welcome to {storefront?.merchantName}</h2>
              <p>Please provide your details to continue shopping</p>
            </div>
            <form className="customer-form" onSubmit={handleCustomerSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  value={customerDetails.name}
                  onChange={(e) => setCustomerDetails({...customerDetails, name: e.target.value})}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  value={customerDetails.email}
                  onChange={(e) => setCustomerDetails({...customerDetails, email: e.target.value})}
                  placeholder="Enter your email address"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone *</label>
                <input
                  type="tel"
                  id="phone"
                  value={customerDetails.phone}
                  onChange={(e) => setCustomerDetails({...customerDetails, phone: e.target.value})}
                  placeholder="Enter your phone number"
                  required
                />
              </div>
              <button type="submit" className="submit-btn">
                Continue Shopping
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="payment-modal-overlay">
          <div className="payment-modal">
            <div className="payment-header">
              <h3>Payment</h3>
              <button className="close-payment" onClick={() => setShowPaymentModal(false)}>×</button>
            </div>
            
            <div className="payment-content">
              <div className="order-summary">
                <h4>Order Summary</h4>
                <div className="order-items">
                  {cartItems.length > 0 ? cartItems.map(item => (
                    <div key={item.id} className="order-item">
                      <span>{item.name} x {item.quantity}</span>
                      <span>R{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  )) : (
                    <div className="order-item">
                      <span>No items in cart</span>
                      <span>R0.00</span>
                    </div>
                  )}
                </div>
                <div className="order-total">
                  <span>Total: R{getTotalPrice().toFixed(2)}</span>
                </div>
              </div>

              <div className="payment-options">
                <h4>Saved Cards</h4>
                {savedCards.map(card => (
                  <div key={card.id} className="saved-card" onClick={() => handlePayment(card.id)}>
                    <div className="card-info">
                      <span className="card-brand">{card.brand}</span>
                      <span className="card-number">**** **** **** {card.last4}</span>
                      <span className="card-expiry">{card.expiry}</span>
                    </div>
                    {card.isDefault && <span className="default-badge">Default</span>}
                  </div>
                ))}

                <div className="new-card-section">
                  <h4>Add New Card</h4>
                  <div className="card-form">
                    <input
                      type="text"
                      placeholder="Card Number"
                      value={newCard.cardNumber}
                      onChange={(e) => handleNewCardChange('cardNumber', e.target.value)}
                    />
                    <div className="card-row">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={newCard.expiryDate}
                        onChange={(e) => handleNewCardChange('expiryDate', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="CVV"
                        value={newCard.cvv}
                        onChange={(e) => handleNewCardChange('cvv', e.target.value)}
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Cardholder Name"
                      value={newCard.cardholderName}
                      onChange={(e) => handleNewCardChange('cardholderName', e.target.value)}
                    />
                    <label className="save-card">
                      <input
                        type="checkbox"
                        checked={newCard.saveCard}
                        onChange={(e) => handleNewCardChange('saveCard', e.target.checked.toString())}
                      />
                      Save card for future orders
                    </label>
                    <button 
                      className="pay-btn" 
                      onClick={() => handlePayment()}
                      disabled={!newCard.cardNumber || !newCard.expiryDate || !newCard.cvv || !newCard.cardholderName}
                    >
                      Pay R{getTotalPrice().toFixed(2)}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <div className={`nav-item ${currentView === 'catalogue' ? 'active' : ''}`} onClick={() => setCurrentView('catalogue')}>
          <span className="nav-icon">❤️</span>
          <span className="nav-label">Catalogue</span>
        </div>
        <div className={`nav-item ${currentView === 'orders' ? 'active' : ''}`} onClick={() => setCurrentView('orders')}>
          <span className="nav-icon">📦</span>
          <span className="nav-label">My Orders</span>
        </div>
        <div className={`nav-item ${currentView === 'account' ? 'active' : ''}`} onClick={() => setCurrentView('account')}>
          <span className="nav-icon">👤</span>
          <span className="nav-label">Account</span>
        </div>
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="cart-sidebar">
          <div className="cart-header">
            <button className="back-btn" onClick={() => setShowCart(false)}>
              ← Back
            </button>
            <h3>My Cart ({getTotalItems()})</h3>
            <div></div>
          </div>
          
          <div className="cart-items">
            {cart.map(item => (
              <div key={item.product.id} className="cart-item">
                <div className="item-image">
                  <img src={item.product.image || '/api/placeholder/80/80'} alt={item.product.name} />
                </div>
                <div className="item-details">
                  <h4>{item.product.name}</h4>
                  <p className="item-customization">Extra Avocado, Spicy Mayo</p>
                  <p className="item-price">Price per Item: R{item.product.price}</p>
                  <div className="quantity-controls">
                      <button 
                        className="qty-btn minus" 
                        onClick={() => updateQuantity(item.product.id, -1)}
                      >
                        -
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button 
                        className="qty-btn plus" 
                        onClick={() => updateQuantity(item.product.id, 1)}
                      >
                        +
                      </button>
                  </div>
                </div>
                <div className="item-actions">
                  <div className="item-total">R{item.totalPrice}</div>
                  <button 
                    className="remove-btn" 
                    onClick={() => removeFromCart(item.product.id)}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="location-section">
            <h4>Location</h4>
            <div className="location-info">
              <span>123 Sakura Street, Downtown City Center, 5 miles away</span>
              <button className="edit-location">✏️</button>
            </div>
          </div>

          <div className="order-summary">
            <h4>Order Summary</h4>
            
            <div className="promo-section">
              <label>Discount Coupon</label>
              <div className="promo-input">
                <input type="text" placeholder="Promo code" />
                <button className="apply-btn">Apply</button>
              </div>
            </div>

            <div className="summary-breakdown">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>R{getCartTotal()}</span>
              </div>
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span>{getDeliveryTotal() === 0 ? 'Free' : `R${getDeliveryTotal()}`}</span>
              </div>
              <div className="summary-row">
                <span>Tax</span>
                <span>R{(getCartTotal() * 0.15).toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>R{getGrandTotal()}</span>
              </div>
            </div>
          </div>

          <button 
            className="checkout-btn"
            onClick={handleCheckout}
            disabled={cart.length === 0}
          >
            🛒 Checkout
          </button>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="checkout-modal">
          <div className="checkout-content">
            <div className="checkout-header">
              <h2>Complete Your Order</h2>
              <button className="close-checkout" onClick={() => setShowCheckout(false)}>×</button>
            </div>
            <div className="checkout-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Delivery Address</label>
                <textarea
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email (Optional)</label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                />
              </div>
            </div>
            <div className="checkout-summary">
              <h3>Order Summary</h3>
              {cart.map(item => (
                <div key={item.product.id} className="order-item">
                  <span>{item.product.name} x {item.quantity}</span>
                  <span>R{item.totalPrice}</span>
                </div>
              ))}
              <div className="order-total">
                <span>Total: R{getGrandTotal()}</span>
              </div>
            </div>
            <div className="checkout-actions">
              <button className="back-btn" onClick={() => setShowCheckout(false)}>
                Back to Cart
              </button>
              <button 
                className="place-order-btn"
                onClick={handlePlaceOrder}
                disabled={!customerInfo.name || !customerInfo.phone || !customerInfo.address}
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Chat Modal */}
      {showWhatsApp && (
        <div className="whatsapp-modal-overlay">
          <div className="whatsapp-modal">
            <div className="whatsapp-header">
              <div className="whatsapp-store-info">
                <img src={storefront?.logo} alt="Store" className="whatsapp-store-logo" />
                <div>
                  <h3>{storefront?.merchantName}</h3>
                  <p>Online</p>
                </div>
              </div>
              <button className="close-whatsapp" onClick={() => setShowWhatsApp(false)}>×</button>
            </div>
            
            <div className="whatsapp-messages">
              {whatsappMessages.map(message => (
                <div key={message.id} className={`message ${message.from}`}>
                  <div className="message-content">
                    <p>{message.message}</p>
                    <span className="message-time">
                      {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="whatsapp-input">
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendWhatsAppMessage()}
              />
              <button onClick={sendWhatsAppMessage} className="send-btn">
                Send
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CustomerStorefront;
