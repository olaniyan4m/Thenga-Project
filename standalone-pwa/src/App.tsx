import React, { useState, useEffect } from 'react';
import './App.css';
import Logo1 from './assets/Logo1.PNG';
import Logo2 from './assets/Logo2.PNG';
import Logo3 from './assets/Logo3.PNG';
import Logo4 from './assets/Logo4.PNG';
import AdminPanel from './components/AdminPanel';
import SubscriptionPlans from './components/SubscriptionPlans';
import BookkeepingSnapshot from './components/BookkeepingSnapshot';
import CustomerStorefront from './components/CustomerStorefront';
import ProductsScreen from './components/ProductsScreen';
import OrdersScreen from './components/OrdersScreen';
import PaymentsScreen from './components/PaymentsScreen';
import SettingsScreen from './components/SettingsScreen';
import SplashScreen from './components/SplashScreen';
import { orderService } from './services/OrderService';
import { whatsAppService } from './services/WhatsAppService';
import { firebaseService } from './services/FirebaseService';
import { paymentService } from './services/PaymentService';

// Types
interface User {
  id: string;
  name: string;
  businessName: string;
  phone: string;
  email: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  description?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
    image?: string;
    color?: string;
    variant?: string;
  }>;
  createdAt: string;
  notes?: string;
}

interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: 'cash' | 'card' | 'eft' | 'qr';
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

function App() {
  // Check if this is a customer storefront URL
  // Only redirect to customer storefront for specific customer URLs
  const isCustomerStorefront = window.location.hash === '#customer' || 
                               (window.location.pathname.includes('/customer/') && window.location.pathname !== '/customer') ||
                               window.location.pathname.includes('/store/');
  
  // Debug logging
  console.log('URL Detection:', {
    hash: window.location.hash,
    pathname: window.location.pathname,
    isCustomerStorefront,
    fullURL: window.location.href
  });
  
  const [currentScreen, setCurrentScreen] = useState<'splash' | 'login' | 'register' | 'subscription' | 'dashboard' | 'products' | 'stock-management' | 'add-product' | 'edit-product' | 'orders' | 'payments' | 'settings' | 'admin' | 'tax' | 'hardware' | 'lending' | 'marketplace' | 'loyalty' | 'bookkeeping' | 'customer-storefront'>(isCustomerStorefront ? 'customer-storefront' : 'splash');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    whatsapp: true,
    currency: 'ZAR',
    businessHours: '08:00-18:00'
  });
  const [showBusinessWhatsApp, setShowBusinessWhatsApp] = useState(false);
  const [businessWhatsAppMessages, setBusinessWhatsAppMessages] = useState([]);
  const [newBusinessMessage, setNewBusinessMessage] = useState('');
  const [storefrontUrl, setStorefrontUrl] = useState<string>('');
  const [showStorefront, setShowStorefront] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedProducts = localStorage.getItem('Thenga-products');
    const savedOrders = localStorage.getItem('Thenga-orders');
    const savedPayments = localStorage.getItem('Thenga-payments');
    const savedSettings = localStorage.getItem('Thenga-settings');

    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else if (user) {
      // Load sample products only if no saved data
      const sampleProducts: Product[] = [
        { id: '1', name: 'Cappuccino', price: 25.00, stock: 50, category: 'Beverages', image: '', description: 'Rich espresso with steamed milk' },
        { id: '2', name: 'Croissant', price: 15.00, stock: 30, category: 'Pastries', image: '', description: 'Buttery French pastry' },
        { id: '3', name: 'Chocolate Cake', price: 45.00, stock: 10, category: 'Desserts', image: '', description: 'Rich chocolate layer cake' },
        { id: '4', name: 'Sandwich', price: 35.00, stock: 25, category: 'Food', image: '', description: 'Fresh deli sandwich' },
        { id: '5', name: 'Smoothie', price: 30.00, stock: 20, category: 'Beverages', image: '', description: 'Fresh fruit smoothie' },
        { id: '6', name: 'Muffin', price: 12.00, stock: 40, category: 'Pastries', image: '', description: 'Blueberry muffin' }
      ];
      setProducts(sampleProducts);
    }

    // Subscribe to orders from OrderService
    const unsubscribeOrders = orderService.subscribe((businessOrders) => {
      setOrders(businessOrders);
    });

    // Subscribe to WhatsApp messages
    const unsubscribeWhatsApp = whatsAppService.subscribeBusiness((messages) => {
      setBusinessWhatsAppMessages(messages);
    });

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeOrders();
      unsubscribeWhatsApp();
    };

    if (savedPayments) {
      setPayments(JSON.parse(savedPayments));
    } else if (user) {
      // Load sample payments only if no saved data
      const samplePayments: Payment[] = [
        { id: '1', orderId: '2', amount: 85.50, method: 'card', status: 'completed', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
        { id: '2', orderId: '3', amount: 95.00, method: 'cash', status: 'completed', createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() }
      ];
      setPayments(samplePayments);
    }

    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, [user]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem('Thenga-products', JSON.stringify(products));
    }
  }, [products]);

  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem('Thenga-orders', JSON.stringify(orders));
    }
  }, [orders]);

  useEffect(() => {
    if (payments.length > 0) {
      localStorage.setItem('Thenga-payments', JSON.stringify(payments));
    }
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('Thenga-settings', JSON.stringify(settings));
  }, [settings]);

  // Calculate stats from real data
  const stats = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
    pendingOrders: orders.filter(order => order.status === 'pending').length,
    completedOrders: orders.filter(order => order.status === 'completed').length,
    totalProducts: products.length,
    lowStockProducts: products.filter(product => product.stock < 10).length
  };

  const handleLogin = async () => {
    // Demo login - no credentials needed
    const newUser = { 
      id: '1',
      name: 'Demo Merchant', 
      businessName: 'Demo Coffee Shop',
      phone: '+27821234567',
      email: 'demo@Thenga.co.za'
    };
    
    try {
      // Save business data to Firebase
      const businessData = {
        id: newUser.id,
        businessName: newUser.businessName,
        ownerName: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        logo: '/assets/Kota_logo.png',
        description: 'Fresh, delicious kotas made with love. Serving the community for over 10 years.',
        address: '123 Main Street, Soweto, Johannesburg',
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
        isOpen: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await firebaseService.saveBusinessData(businessData);
      console.log('Business data saved to Firebase');
    } catch (error) {
      console.error('Error saving business data to Firebase:', error);
      // Continue with demo login even if Firebase fails
    }
    
    setUser(newUser);
    
    // Generate storefront URL
    const storeUrl = `https://Thenga.co.za/store/${newUser.id}`;
    setStorefrontUrl(storeUrl);
    
    setCurrentScreen('dashboard');
  };

  const handleAdminLogin = () => {
    // Admin login
    setUser({ 
      id: 'admin',
      name: 'Admin User', 
      businessName: 'Thenga Admin',
      phone: '+27820000000',
      email: 'admin@Thenga.co.za'
    });
    setIsAdmin(true);
    setCurrentScreen('admin');
  };

  const handleLogoClick = () => {
    const newCount = logoClickCount + 1;
    setLogoClickCount(newCount);
    
    if (newCount >= 5) {
      setShowAdminLogin(true);
      setLogoClickCount(0); // Reset counter
      
      // Hide admin login after 30 seconds
      setTimeout(() => {
        setShowAdminLogin(false);
      }, 30000);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsAdmin(false);
    setCurrentScreen('login');
    // Reset secret admin access
    setLogoClickCount(0);
    setShowAdminLogin(false);
  };

  const handleNavigation = (screen: string) => {
    setCurrentScreen(screen);
    // Reset secret admin access when navigating away from login
    if (screen !== 'login') {
      setLogoClickCount(0);
      setShowAdminLogin(false);
    }
  };

  // Order management functions
  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      // Update in OrderService (now async)
      await orderService.updateOrderStatus(orderId, newStatus as any);
    
    // Update local state
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    } catch (error) {
      console.error('Failed to update order status:', error);
      throw error; // Re-throw to be handled by the calling component
    }
  };

  const addOrder = (newOrder: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => {
    const orderNumber = `ORD-${String(orders.length + 1).padStart(3, '0')}`;
    const order: Order = {
      ...newOrder,
      id: String(Date.now()),
      orderNumber,
      createdAt: new Date().toISOString()
    };
    setOrders(prev => [order, ...prev]);
  };

  // Product management functions
  const addProduct = (newProduct: Omit<Product, 'id'>) => {
    const product: Product = {
      ...newProduct,
      id: String(Date.now())
    };
    setProducts(prev => [...prev, product]);
  };

  const updateProduct = (productId: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(product => 
      product.id === productId ? { ...product, ...updates } : product
    ));
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(product => product.id !== productId));
  };

  // Payment functions
  const addPayment = (orderId: string, amount: number, method: Payment['method']) => {
    const payment: Payment = {
      id: String(Date.now()),
      orderId,
      amount,
      method,
      status: 'completed',
      createdAt: new Date().toISOString()
    };
    setPayments(prev => [...prev, payment]);
  };

  // Settings functions
  const updateSettings = (newSettings: Partial<typeof settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // WhatsApp functions
  const sendWhatsAppMessage = (phone: string, message: string) => {
    alert(`WhatsApp Message Sent!\n\nTo: ${phone}\nMessage: ${message}\n\nIn a real app, this would send via WhatsApp Business API`);
  };

  const sendOrderConfirmation = (order: Order) => {
    const message = `Order Confirmed!\n\nOrder #${order.orderNumber}\nTotal: R${order.totalAmount.toFixed(2)}\n\nThank you for choosing ${user?.businessName}!`;
    sendWhatsAppMessage(order.customerPhone, message);
  };

  const sendOrderReady = (order: Order) => {
    const message = `Your order is ready!\n\nOrder #${order.orderNumber}\n\nPlease come collect your order. Thank you!`;
    sendWhatsAppMessage(order.customerPhone, message);
  };

  const sendBusinessWhatsAppMessage = () => {
    if (newBusinessMessage.trim()) {
      // Get the customer phone from the most recent customer message
      const lastCustomerMessage = businessWhatsAppMessages
        .filter(msg => msg.from === 'customer')
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
      
      if (lastCustomerMessage?.customerPhone) {
        whatsAppService.sendBusinessMessage(lastCustomerMessage.customerPhone, newBusinessMessage);
        setNewBusinessMessage('');
        
        // Show notification that message was sent
        alert('WhatsApp message sent to customer!');
      } else {
        alert('No customer to reply to. Please wait for a customer message.');
      }
    }
  };

  if (currentScreen === 'splash') {
    return <SplashScreen onComplete={() => setCurrentScreen('login')} />;
  }

  if (currentScreen === 'admin') {
    return <AdminPanel />;
  }



  if (showStorefront) {
    return <CustomerStorefront user={user} products={products} onClose={() => setShowStorefront(false)} />;
  }

  if (currentScreen === 'subscription') {
  return (
      <div className="app">
        <div className="phone-frame">
          <div className="phone-screen">
            <SubscriptionPlans 
              onSelectPlan={(planId) => {
                console.log('Selected plan:', planId);
                setCurrentScreen('dashboard');
                handleLogin();
              }}
              onBack={() => setCurrentScreen('register')}
            />
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 'register') {
    return (
      <div className="app">
        <div className="phone-frame">
          <div className="phone-screen">
            <div className="login-container">
              <div className="login-header">
                <img src={Logo2} alt="Thenga Logo" className="login-logo" />
                <p>Digital Commerce for South Africa</p>
              </div>
              
              <div className="login-form">
                <h2>Create Account</h2>
                <p>Join thousands of South African merchants</p>
                
                <div className="form-group">
                  <label>Company Logo</label>
                  <div className="logo-upload">
                    <input 
                      type="file" 
                      id="logo-upload" 
                      accept="image/*" 
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="logo-upload" className="logo-upload-btn">
                      <span>📷</span>
                      <span>Upload Company Logo</span>
                    </label>
                    <p className="logo-upload-hint">PNG, JPG up to 2MB</p>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Business Name</label>
                  <input type="text" placeholder="Your business name" />
                </div>
                
                <div className="form-group">
                  <label>Business Registration Number</label>
                  <input type="text" placeholder="e.g. 2024/123456/07" />
                </div>
                
                <div className="form-group">
                  <label>Your Name</label>
                  <input type="text" placeholder="Your full name" />
                </div>
                
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" placeholder="+27821234567" />
                </div>
                
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" placeholder="your@email.com" />
                </div>
                
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" placeholder="Create a password" />
                </div>
                
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input type="password" placeholder="Confirm your password" />
                </div>
                
                <div className="form-group">
                  <label>ID Document</label>
                  <div className="document-upload">
                    <input 
                      type="file" 
                      id="id-document" 
                      accept=".pdf,.jpg,.jpeg,.png" 
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="id-document" className="document-upload-btn">
                      <span>📄</span>
                      <span>Upload ID Document</span>
                    </label>
                    <p className="document-upload-hint">PDF, JPG, PNG up to 5MB</p>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Bank Statement</label>
                  <div className="document-upload">
                    <input 
                      type="file" 
                      id="bank-statement" 
                      accept=".pdf,.jpg,.jpeg,.png" 
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="bank-statement" className="document-upload-btn">
                      <span>🏦</span>
                      <span>Upload Bank Statement</span>
                    </label>
                    <p className="document-upload-hint">PDF, JPG, PNG up to 5MB</p>
                  </div>
                </div>
                
                <button onClick={() => setCurrentScreen('subscription')} className="login-button">
                  Create Account
                </button>
                
                <div className="login-footer">
                  <p>Already have an account?</p>
                  <button className="register-link" onClick={() => setCurrentScreen('login')}>Sign In</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 'login') {
    return (
      <div className="app">
        <div className="phone-frame">
          <div className="phone-screen">
            <div className="login-container">
                <div className="login-header">
                  <img 
                    src={Logo2} 
                    alt="Thenga Logo" 
                    className="login-logo" 
                    onClick={handleLogoClick}
                    style={{ cursor: 'pointer' }}
                  />
                  <p>Digital Commerce for South Africa</p>
                </div>
              
              <div className="login-form">
                <h2>Welcome Back</h2>
                <p>Sign in to your merchant account</p>
                
                <div className="form-group">
                  <label>Phone Number or Email</label>
                  <input type="text" placeholder="+27821234567 or your@email.com" />
                </div>
                
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" placeholder="Enter your password" />
                </div>
                
                <button onClick={handleLogin} className="login-button">
                  Sign In
                </button>
                
                {showAdminLogin && (
                  <button onClick={handleAdminLogin} className="admin-login-button">
                    Admin Login
                  </button>
                )}
                
                
                <div className="login-footer">
                  <p>Don't have an account?</p>
                  <button className="register-link" onClick={() => setCurrentScreen('register')}>Create Account</button>
                </div>
              </div>
              
              <div className="features">
                <div className="feature">
                  <span className="feature-icon">📱</span>
                  <span className="feature-text">Mobile-First</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">🔄</span>
                  <span className="feature-text">Offline Support</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">🇿🇦</span>
                  <span className="feature-text">South African</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render different screens based on currentScreen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'products':
        return user ? <ProductsScreen 
          user={user} 
          onLogout={handleLogout} 
          products={products}
          addProduct={addProduct}
          updateProduct={updateProduct}
          deleteProduct={deleteProduct}
          onNavigate={handleNavigation}
          setSelectedProduct={setSelectedProduct}
        /> : null;
      case 'stock-management':
        return user ? <StockManagementScreen 
          user={user} 
          onLogout={handleLogout}
          products={products}
          updateProduct={updateProduct}
          onNavigate={handleNavigation}
        /> : null;
      case 'add-product':
        return user ? <AddProductScreen 
          user={user} 
          onLogout={handleLogout}
          addProduct={addProduct}
          onNavigate={handleNavigation}
        /> : null;
      case 'edit-product':
        return user ? <EditProductScreen 
          user={user} 
          onLogout={handleLogout}
          product={selectedProduct}
          updateProduct={updateProduct}
          onNavigate={handleNavigation}
        /> : null;
      case 'orders':
        return user ? <OrdersScreen 
          user={user} 
          onLogout={handleLogout} 
          orders={orders}
          updateOrderStatus={updateOrderStatus}
          sendOrderConfirmation={sendOrderConfirmation}
          sendOrderReady={sendOrderReady}
        /> : null;
      case 'payments':
        return user ? <PaymentsScreen 
          user={user} 
          onLogout={handleLogout} 
          payments={payments}
        /> : null;
      case 'settings':
        return user ? <SettingsScreen 
          user={user} 
          onLogout={handleLogout} 
          settings={settings}
          onSettingsChange={updateSettings}
          onNavigate={handleNavigation}
        /> : null;
      case 'tax':
        return user ? <TaxScreen user={user} onLogout={handleLogout} /> : null;
      case 'hardware':
        return user ? <HardwareScreen user={user} onLogout={handleLogout} /> : null;
      case 'lending':
        return user ? <LendingScreen user={user} onLogout={handleLogout} /> : null;
      case 'marketplace':
        return user ? <MarketplaceScreen user={user} onLogout={handleLogout} /> : null;
      case 'loyalty':
        return user ? <LoyaltyScreen user={user} onLogout={handleLogout} /> : null;
    case 'bookkeeping':
      return user ? <BookkeepingSnapshot /> : null;
      case 'dashboard':
        return user ? <DashboardScreen 
          user={user} 
          onLogout={handleLogout} 
          stats={stats}
          orders={orders}
          storefrontUrl={storefrontUrl}
          setShowStorefront={setShowStorefront}
          handleNavigation={handleNavigation}
          sendOrderConfirmation={sendOrderConfirmation}
          updateOrderStatus={updateOrderStatus}
          sendOrderReady={sendOrderReady}
          setShowBusinessWhatsApp={setShowBusinessWhatsApp}
          businessWhatsAppMessages={businessWhatsAppMessages}
        /> : null;
      default:
        return user ? <DashboardScreen 
          user={user} 
          onLogout={handleLogout} 
          stats={stats}
          orders={orders}
          storefrontUrl={storefrontUrl}
          setShowStorefront={setShowStorefront}
          handleNavigation={handleNavigation}
          sendOrderConfirmation={sendOrderConfirmation}
          updateOrderStatus={updateOrderStatus}
          sendOrderReady={sendOrderReady}
          setShowBusinessWhatsApp={setShowBusinessWhatsApp}
          businessWhatsAppMessages={businessWhatsAppMessages}
        /> : null;
    }
  };

  // For customer storefront, render in phone frame but without navigation
  if (currentScreen === 'customer-storefront') {
    return (
      <div className="app">
        <div className="phone-frame">
          <div className="phone-screen customer-storefront-screen">
            <CustomerStorefront />
          </div>
        </div>
      </div>
    );
  }

  // Check if current screen should have bottom navigation
  const hasBottomNavigation = !['splash', 'login', 'register', 'subscription', 'admin', 'customer-storefront'].includes(currentScreen);

  return (
    <div className="app">
      <div className="phone-frame">
        <div className="phone-screen">
          {/* Render current screen content */}
          {renderScreen()}

          {/* Bottom Navigation - only show for business screens */}
          {hasBottomNavigation && (
            <div className="bottom-nav">
            <button 
              className={`nav-item ${currentScreen === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleNavigation('dashboard')}
            >
              <span className="nav-icon">⌂</span>
              <span className="nav-label">Home</span>
            </button>
            <button 
              className={`nav-item ${currentScreen === 'products' ? 'active' : ''}`}
              onClick={() => handleNavigation('products')}
            >
              <span className="nav-icon">▣</span>
              <span className="nav-label">Products</span>
            </button>
            <button 
              className={`nav-item ${currentScreen === 'orders' ? 'active' : ''}`}
              onClick={() => handleNavigation('orders')}
            >
              <span className="nav-icon">☰</span>
              <span className="nav-label">Orders</span>
            </button>
            <button 
              className={`nav-item ${currentScreen === 'payments' ? 'active' : ''}`}
              onClick={() => handleNavigation('payments')}
            >
              <span className="nav-icon">◉</span>
              <span className="nav-label">Payments</span>
            </button>
            <button 
              className={`nav-item ${currentScreen === 'settings' ? 'active' : ''}`}
              onClick={() => handleNavigation('settings')}
            >
              <span className="nav-icon">◐</span>
              <span className="nav-label">Settings</span>
            </button>
            </div>
          )}

          {/* Business WhatsApp Chat Modal */}
          {showBusinessWhatsApp && (
            <div className="business-whatsapp-modal-overlay">
              <div className="business-whatsapp-modal">
                <div className="business-whatsapp-header">
                  <div className="business-whatsapp-info">
                    <h3>💬 Customer Messages</h3>
                    <p>Respond to customer inquiries</p>
                  </div>
                  <button className="close-business-whatsapp" onClick={() => setShowBusinessWhatsApp(false)}>×</button>
                </div>
                
                <div className="business-whatsapp-messages">
                  {businessWhatsAppMessages.map(message => (
                    <div key={message.id} className={`business-message ${message.from}`}>
                      <div className="business-message-content">
                        {message.from === 'customer' && (
                          <div className="customer-info">
                            <strong>{message.customerName}</strong>
                            <span className="customer-phone">{message.customerPhone}</span>
                          </div>
                        )}
                        <p>{message.message}</p>
                        <span className="business-message-time">
                          {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="business-whatsapp-input">
                  <input
                    type="text"
                    placeholder="Type your response to customer..."
                    value={newBusinessMessage}
                    onChange={(e) => setNewBusinessMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendBusinessWhatsAppMessage()}
                  />
                  <button onClick={sendBusinessWhatsAppMessage} className="business-send-btn">
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// Additional screen components
const DashboardScreen = ({ user, onLogout, stats, orders, storefrontUrl, setShowStorefront, handleNavigation, sendOrderConfirmation, updateOrderStatus, sendOrderReady, setShowBusinessWhatsApp, businessWhatsAppMessages }: {
  user: User,
  onLogout: () => void,
  stats: any,
  orders: Order[],
  storefrontUrl: string,
  setShowStorefront: (show: boolean) => void,
  handleNavigation: (screen: string) => void,
  sendOrderConfirmation: (order: Order) => void,
  updateOrderStatus: (id: string, status: Order['status']) => void,
  sendOrderReady: (order: Order) => void,
  setShowBusinessWhatsApp: (show: boolean) => void,
  businessWhatsAppMessages: any[]
}) => {
  // Live data state
  const [liveStats, setLiveStats] = useState<any>(null);
  const [liveOrders, setLiveOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Calculator state and functions
  const [calculatorInput, setCalculatorInput] = useState('0');
  const [calculatorResult, setCalculatorResult] = useState('');
  const [calculatorOperation, setCalculatorOperation] = useState('');
  const [calculatorPreviousValue, setCalculatorPreviousValue] = useState(0);
  const [calculatorWaitingForOperand, setCalculatorWaitingForOperand] = useState(false);
  
  // Business function inputs
  const [profitRevenue, setProfitRevenue] = useState('');
  const [profitCost, setProfitCost] = useState('');
  const [vatAmount, setVatAmount] = useState('');
  const [marginSelling, setMarginSelling] = useState('');
  const [marginCost, setMarginCost] = useState('');
  const [discountOriginal, setDiscountOriginal] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');

  // Load live dashboard data
  useEffect(() => {
    const loadLiveDashboardData = async () => {
      setIsLoading(true);
      try {
        const isProduction = window.location.hostname !== 'localhost';
        
        if (isProduction) {
          // Load live business stats
          const statsResponse = await fetch('/api/dashboard/stats', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('apiKey')}` }
          });
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            setLiveStats(statsData);
          }
          
          // Load live recent orders
          const ordersResponse = await fetch('/api/dashboard/orders', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('apiKey')}` }
          });
          if (ordersResponse.ok) {
            const ordersData = await ordersResponse.json();
            setLiveOrders(ordersData.orders || []);
          }
        } else {
          // Development mode - use mock data
          setLiveStats({
            totalOrders: 45,
            totalRevenue: 125000,
            pendingOrders: 8,
            completedOrders: 37,
            totalProducts: 23,
            lowStockProducts: 3,
            todayOrders: 5,
            todayRevenue: 8500
          });
          setLiveOrders(orders.slice(0, 5));
        }
        
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Fallback to props data
        setLiveStats(stats);
        setLiveOrders(orders.slice(0, 5));
      } finally {
        setIsLoading(false);
      }
    };

    loadLiveDashboardData();
  }, []);

  const inputNumber = (num: string) => {
    if (calculatorWaitingForOperand) {
      setCalculatorInput(num);
      setCalculatorWaitingForOperand(false);
    } else {
      setCalculatorInput(calculatorInput === '0' ? num : calculatorInput + num);
    }
  };

  const inputOperator = (op: string) => {
    const inputValue = parseFloat(calculatorInput);
    
    if (calculatorPreviousValue === 0) {
      setCalculatorPreviousValue(inputValue);
    } else if (calculatorOperation) {
      const currentValue = calculatorPreviousValue || 0;
      const newValue = calculate(calculatorPreviousValue, inputValue, calculatorOperation);
      
      setCalculatorInput(String(newValue));
      setCalculatorPreviousValue(newValue);
    }
    
    setCalculatorWaitingForOperand(true);
    setCalculatorOperation(op);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string) => {
    switch (operation) {
      case '+': return firstValue + secondValue;
      case '-': return firstValue - secondValue;
      case '*': return firstValue * secondValue;
      case '/': return secondValue !== 0 ? firstValue / secondValue : 0;
      default: return secondValue;
    }
  };

  const calculateResult = () => {
    const inputValue = parseFloat(calculatorInput);
    
    if (calculatorOperation && calculatorPreviousValue !== 0) {
      const result = calculate(calculatorPreviousValue, inputValue, calculatorOperation);
      setCalculatorResult(`= ${result}`);
      setCalculatorInput(String(result));
      setCalculatorPreviousValue(0);
      setCalculatorOperation('');
      setCalculatorWaitingForOperand(true);
    }
  };

  const clearCalculator = () => {
    setCalculatorInput('0');
    setCalculatorResult('');
    setCalculatorOperation('');
    setCalculatorPreviousValue(0);
    setCalculatorWaitingForOperand(false);
  };

  const clearEntry = () => {
    setCalculatorInput('0');
  };

  // Business Calculator Functions
  const calculateProfit = () => {
    if (profitRevenue && profitCost) {
      const revenue = parseFloat(profitRevenue);
      const cost = parseFloat(profitCost);
      const profit = revenue - cost;
      const profitMargin = (profit / revenue) * 100;
      setCalculatorResult(`Profit: R${profit.toFixed(2)} | Margin: ${profitMargin.toFixed(1)}%`);
      setCalculatorInput(profit.toFixed(2));
    }
  };

  const calculateVAT = () => {
    if (vatAmount) {
      const amount = parseFloat(vatAmount);
      const vat = amount * 0.15;
      const totalWithVAT = amount + vat;
      setCalculatorResult(`VAT: R${vat.toFixed(2)} | Total: R${totalWithVAT.toFixed(2)}`);
      setCalculatorInput(totalWithVAT.toFixed(2));
    }
  };

  const calculateMargin = () => {
    if (marginSelling && marginCost) {
      const sellingPrice = parseFloat(marginSelling);
      const costPrice = parseFloat(marginCost);
      const margin = ((sellingPrice - costPrice) / sellingPrice) * 100;
      const markup = ((sellingPrice - costPrice) / costPrice) * 100;
      setCalculatorResult(`Margin: ${margin.toFixed(1)}% | Markup: ${markup.toFixed(1)}%`);
      setCalculatorInput(margin.toFixed(1));
    }
  };

  const calculateDiscount = () => {
    if (discountOriginal && discountPercent) {
      const originalPrice = parseFloat(discountOriginal);
      const discount = parseFloat(discountPercent);
      const discountAmount = originalPrice * (discount / 100);
      const finalPrice = originalPrice - discountAmount;
      setCalculatorResult(`Discount: R${discountAmount.toFixed(2)} | Final: R${finalPrice.toFixed(2)}`);
      setCalculatorInput(finalPrice.toFixed(2));
    }
  };

  return (
  <div className="screen">
    <div className="screen-header">
      <div className="header-left">
        <img src={Logo2} alt="Thenga Logo" className="header-logo" />
        <h1>Dashboard</h1>
      </div>
      <div className="header-actions">
        {isLoading && <div className="loading-indicator">Loading live data...</div>}
        <button onClick={onLogout} className="logout-btn">Logout</button>
      </div>
    </div>
    <div className="screen-content">
      {/* Welcome */}
      <div className="welcome-section">
        <h2>Welcome back, {user?.name}! 👋</h2>
        <p>Here's what's happening with your business today</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-title">Total Orders</div>
            <div className="stat-value">{liveStats?.totalOrders || stats.totalOrders}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-title">Total Revenue</div>
            <div className="stat-value">R{(liveStats?.totalRevenue || stats.totalRevenue).toFixed(2)}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-title">Pending</div>
            <div className="stat-value">{liveStats?.pendingOrders || stats.pendingOrders}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-title">Completed</div>
            <div className="stat-value">{liveStats?.completedOrders || stats.completedOrders}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🛍️</div>
          <div className="stat-content">
            <div className="stat-title">Products</div>
            <div className="stat-value">{liveStats?.totalProducts || stats.totalProducts}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-title">Low Stock</div>
            <div className="stat-value">{liveStats?.lowStockProducts || stats.lowStockProducts}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button className="action-button" onClick={() => handleNavigation('orders')}>
            <span>New Order</span>
          </button>
          <button className="action-button" onClick={() => handleNavigation('products')}>
            <span>Add Product</span>
          </button>
          <button className="action-button" onClick={() => handleNavigation('orders')}>
            <span>View Orders</span>
          </button>
          <button className="action-button" onClick={() => handleNavigation('payments')}>
            <span>View Payments</span>
          </button>
          <button className="action-button" onClick={() => handleNavigation('products')}>
            <span>View Products</span>
          </button>
          <button className="action-button" onClick={() => handleNavigation('settings')}>
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Storefront Management */}
      <div className="storefront-section">
        <h3>Your Storefront</h3>
        <div className="storefront-card">
          <div className="storefront-info">
            <h4>Customer Store URL</h4>
            <div className="storefront-url">
              <input 
                type="text" 
                value={storefrontUrl} 
                readOnly 
                className="url-input"
              />
              <button 
                className="copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(storefrontUrl);
                  alert('Store URL copied to clipboard!');
                }}
              >
                📋 Copy
              </button>
            </div>
            <p>Share this link with your customers to let them browse and order from your store</p>
          </div>
          
          <div className="storefront-stats">
            <div className="stat-item">
              <div className="stat-value">0</div>
              <div className="stat-label">Total Views</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">0</div>
              <div className="stat-label">Orders Today</div>
            </div>
          </div>
          
          <div className="storefront-actions">
            <button 
              className="preview-btn"
              onClick={() => setShowStorefront(true)}
            >
              Preview Store
            </button>
            <button 
              className="qr-btn"
              onClick={() => alert('QR Code generated! Print and display at your business.')}
            >
              Generate QR Code
            </button>
          </div>
        </div>
      </div>


      {/* Recent Orders */}
      <div className="recent-orders">
        <h3>Recent Orders</h3>
        <div className="orders-list">
          {(liveOrders.length > 0 ? liveOrders : orders).slice(0, 3).map(order => (
            <div key={order.id} className="order-card" onClick={() => {
              const details = `📋 Order Details:\n\nCustomer: ${order.customerName}\nPhone: ${order.customerPhone}\nOrder: ${order.orderNumber}\nAmount: R${order.totalAmount.toFixed(2)}\nStatus: ${order.status}\nItems: ${order.items.length}\nCreated: ${new Date(order.createdAt).toLocaleString()}`;
              alert(details);
            }}>
              <div className="order-info">
                <div className="order-number">Order #{order.orderNumber}</div>
                <div className="order-date">{new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                <div className="customer-name">{order.customerName}</div>
                <div className="order-amount">R{order.totalAmount.toFixed(2)}</div>
              </div>
              
              <div className="order-status-section">
                <div className="order-actions">
                  <button className="order-action-btn whatsapp-btn" onClick={(e) => {
                    e.stopPropagation();
                    // Open WhatsApp chat with this specific customer
                    setShowBusinessWhatsApp(true);
                    // You could also set a specific customer context here
                  }}>
                    💬 Chat
                    {businessWhatsAppMessages.some(msg => msg.from === 'customer' && !msg.read) && (
                      <span className="notification-badge">!</span>
                    )}
                  </button>
                  <button className={`order-action-btn status-${order.status === 'pending' ? 'pending' : 
                                                      order.status === 'confirmed' ? 'ready' : 'complete'}`} onClick={(e) => {
                    e.stopPropagation();
                    const newStatus = order.status === 'pending' ? 'confirmed' : 
                                     order.status === 'confirmed' ? 'ready' : 'completed';
                    updateOrderStatus(order.id, newStatus);
                    if (newStatus === 'ready') {
                      sendOrderReady(order);
                    }
                    alert(`Order status updated to ${newStatus}!`);
                  }}>
                    {order.status === 'pending' ? 'Pending' : 
                     order.status === 'confirmed' ? 'Ready' : 'Complete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Business Calculator */}
      <div className="business-calculator">
        <h3>🧮 Business Calculator</h3>
        <div className="calculator-container">
          <div className="calculator-display">
            <div className="calculator-screen">
              <div className="calculator-input">{calculatorInput}</div>
              <div className="calculator-result">{calculatorResult}</div>
    </div>
  </div>
          
          <div className="calculator-buttons">
            <div className="calculator-row">
              <button className="calc-btn calc-clear" onClick={() => clearCalculator()}>C</button>
              <button className="calc-btn calc-clear" onClick={() => clearEntry()}>CE</button>
              <button className="calc-btn calc-operator" onClick={() => inputOperator('/')}>÷</button>
              <button className="calc-btn calc-operator" onClick={() => inputOperator('*')}>×</button>
            </div>
            
            <div className="calculator-row">
              <button className="calc-btn calc-number" onClick={() => inputNumber('7')}>7</button>
              <button className="calc-btn calc-number" onClick={() => inputNumber('8')}>8</button>
              <button className="calc-btn calc-number" onClick={() => inputNumber('9')}>9</button>
              <button className="calc-btn calc-operator" onClick={() => inputOperator('-')}>-</button>
            </div>
            
            <div className="calculator-row">
              <button className="calc-btn calc-number" onClick={() => inputNumber('4')}>4</button>
              <button className="calc-btn calc-number" onClick={() => inputNumber('5')}>5</button>
              <button className="calc-btn calc-number" onClick={() => inputNumber('6')}>6</button>
              <button className="calc-btn calc-operator" onClick={() => inputOperator('+')}>+</button>
            </div>
            
            <div className="calculator-row">
              <button className="calc-btn calc-number" onClick={() => inputNumber('1')}>1</button>
              <button className="calc-btn calc-number" onClick={() => inputNumber('2')}>2</button>
              <button className="calc-btn calc-number" onClick={() => inputNumber('3')}>3</button>
              <button className="calc-btn calc-equals" onClick={() => calculateResult()}>=</button>
            </div>
            
            <div className="calculator-row">
              <button className="calc-btn calc-number calc-zero" onClick={() => inputNumber('0')}>0</button>
              <button className="calc-btn calc-number" onClick={() => inputNumber('.')}>.</button>
            </div>
          </div>
          
          <div className="business-functions">
            <h4>Business Functions</h4>
            
            {/* Profit Calculator */}
            <div className="business-function-group">
              <h5>💰 Profit Calculator</h5>
              <div className="business-inputs">
                <input 
                  type="number" 
                  placeholder="Revenue (R)" 
                  value={profitRevenue}
                  onChange={(e) => setProfitRevenue(e.target.value)}
                  className="business-input"
                />
                <input 
                  type="number" 
                  placeholder="Cost (R)" 
                  value={profitCost}
                  onChange={(e) => setProfitCost(e.target.value)}
                  className="business-input"
                />
                <button className="business-btn" onClick={() => calculateProfit()}>
                  Calculate
                </button>
              </div>
            </div>

            {/* VAT Calculator */}
            <div className="business-function-group">
              <h5>📊 VAT Calculator</h5>
              <div className="business-inputs">
                <input 
                  type="number" 
                  placeholder="Amount (R)" 
                  value={vatAmount}
                  onChange={(e) => setVatAmount(e.target.value)}
                  className="business-input"
                />
                <button className="business-btn" onClick={() => calculateVAT()}>
                  Calculate VAT
                </button>
              </div>
            </div>

            {/* Margin Calculator */}
            <div className="business-function-group">
              <h5>📈 Margin Calculator</h5>
              <div className="business-inputs">
                <input 
                  type="number" 
                  placeholder="Selling Price (R)" 
                  value={marginSelling}
                  onChange={(e) => setMarginSelling(e.target.value)}
                  className="business-input"
                />
                <input 
                  type="number" 
                  placeholder="Cost Price (R)" 
                  value={marginCost}
                  onChange={(e) => setMarginCost(e.target.value)}
                  className="business-input"
                />
                <button className="business-btn" onClick={() => calculateMargin()}>
                  Calculate
                </button>
              </div>
            </div>

            {/* Discount Calculator */}
            <div className="business-function-group">
              <h5>🏷️ Discount Calculator</h5>
              <div className="business-inputs">
                <input 
                  type="number" 
                  placeholder="Original Price (R)" 
                  value={discountOriginal}
                  onChange={(e) => setDiscountOriginal(e.target.value)}
                  className="business-input"
                />
                <input 
                  type="number" 
                  placeholder="Discount %" 
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="business-input"
                />
                <button className="business-btn" onClick={() => calculateDiscount()}>
                  Calculate
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};



// Stock Management Screen
const StockManagementScreen = ({ user, onLogout, products, updateProduct, onNavigate }: {
  user: User, 
  onLogout: () => void,
  products: Product[],
  updateProduct: (id: string, updates: Partial<Product>) => void,
  onNavigate: (screen: string) => void
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'category'>('name');

  const categories = [...new Set(products.map(p => p.category))];
  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterCategory === 'all' || product.category === filterCategory)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'stock': return a.stock - b.stock;
        case 'category': return a.category.localeCompare(b.category);
        default: return a.name.localeCompare(b.name);
      }
    });

  const lowStockProducts = products.filter(p => p.stock < 10);
  const outOfStockProducts = products.filter(p => p.stock === 0);

  return (
  <div className="screen">
        <div className="screen-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => onNavigate('products')}>← Back</button>
          <h1>Stock Management</h1>
        </div>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
        <div className="screen-content">
        {/* Stock Overview */}
        <div className="stock-overview">
          <div className="stat-card warning">
            <div className="stat-icon">⚠️</div>
            <div className="stat-content">
              <div className="stat-title">Low Stock</div>
              <div className="stat-value">{lowStockProducts.length}</div>
            </div>
          </div>
          <div className="stat-card danger">
            <div className="stat-icon">❌</div>
            <div className="stat-content">
              <div className="stat-title">Out of Stock</div>
              <div className="stat-value">{outOfStockProducts.length}</div>
            </div>
          </div>
          <div className="stat-card success">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-title">In Stock</div>
              <div className="stat-value">{products.length - lowStockProducts.length}</div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-controls">
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
              className="filter-select"
            >
              <option value="name">Sort by Name</option>
              <option value="stock">Sort by Stock</option>
              <option value="category">Sort by Category</option>
            </select>
          </div>
        </div>

        {/* Stock List */}
        <div className="stock-list">
          {filteredProducts.map(product => (
            <div key={product.id} className={`stock-item ${product.stock === 0 ? 'out-of-stock' : product.stock < 10 ? 'low-stock' : ''}`}>
                <div className="product-info">
                <div className="product-image">{product.image}</div>
                <div className="product-details">
                  <h3>{product.name}</h3>
                  <p className="product-category">{product.category}</p>
                  <p className="product-price">R{product.price.toFixed(2)}</p>
                </div>
              </div>
              <div className="stock-controls">
                <div className="stock-display">
                  <span className={`stock-value ${product.stock === 0 ? 'zero' : product.stock < 10 ? 'low' : 'good'}`}>
                    {product.stock}
                  </span>
                  <span className="stock-label">units</span>
                </div>
                <div className="stock-actions">
                  <button 
                    className="stock-btn add"
                    onClick={() => {
                      const addAmount = prompt(`Add stock to ${product.name} (current: ${product.stock}):`);
                      if (addAmount && !isNaN(parseInt(addAmount))) {
                        updateProduct(product.id, { stock: product.stock + parseInt(addAmount) });
                        alert(`✅ Added ${addAmount} units!`);
                      }
                    }}
                  >
                    + Add
                  </button>
                  <button 
                    className="stock-btn remove"
                    onClick={() => {
                      const removeAmount = prompt(`Remove stock from ${product.name} (current: ${product.stock}):`);
                      if (removeAmount && !isNaN(parseInt(removeAmount))) {
                        const newStock = Math.max(0, product.stock - parseInt(removeAmount));
                        updateProduct(product.id, { stock: newStock });
                        alert(`✅ Removed ${removeAmount} units!`);
                      }
                    }}
                  >
                    - Remove
                  </button>
                  <button 
                    className="stock-btn set"
                    onClick={() => {
                      const newStock = prompt(`Set stock for ${product.name} (current: ${product.stock}):`);
                      if (newStock && !isNaN(parseInt(newStock))) {
                        updateProduct(product.id, { stock: parseInt(newStock) });
                        alert(`✅ Stock set to ${newStock}!`);
                      }
                    }}
                  >
                    Set
                  </button>
                </div>
                </div>
              </div>
            ))}
          </div>
      </div>
    </div>
  );
};

// Add Product Screen
const AddProductScreen = ({ user, onLogout, addProduct, onNavigate }: {
  user: User,
  onLogout: () => void,
  addProduct: (product: Omit<Product, 'id'>) => void,
  onNavigate: (screen: string) => void
}) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    image: '',
    description: ''
  });

  const categories = ['Beverages', 'Food', 'Pastries', 'Desserts', 'Snacks', 'Other'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.stock || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

          addProduct({
      name: formData.name,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      category: formData.category,
      image: formData.image || '📦',
      description: formData.description
    });

    alert(`✅ Product "${formData.name}" added successfully!`);
    onNavigate('products');
  };

  return (
    <div className="screen">
      <div className="screen-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => onNavigate('products')}>← Back</button>
          <h1>Add Product</h1>
        </div>
        <button onClick={onLogout} className="logout-btn">Logout</button>
      </div>
      <div className="screen-content">
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter product name"
                required
              />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                required
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Product description (optional)"
                rows={3}
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Pricing & Inventory</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Price (R) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="form-group">
                <label>Stock Quantity *</label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  placeholder="0"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Product Image</h3>
            <div className="form-group">
              <label>Emoji or Icon</label>
              <input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
                placeholder="e.g., ☕, 🍰, 🥪"
                maxLength={2}
              />
              <p className="form-hint">Use emojis or symbols to represent your product</p>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => onNavigate('products')}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Product Screen
const EditProductScreen = ({ user, onLogout, product, updateProduct, onNavigate }: {
  user: User,
  onLogout: () => void,
  product: Product | null,
  updateProduct: (id: string, updates: Partial<Product>) => void,
  onNavigate: (screen: string) => void
}) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price.toString() || '',
    stock: product?.stock.toString() || '',
    category: product?.category || '',
    image: product?.image || '',
    description: product?.description || ''
  });

  const categories = ['Beverages', 'Food', 'Pastries', 'Desserts', 'Snacks', 'Other'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    updateProduct(product.id, {
      name: formData.name,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      category: formData.category,
      image: formData.image,
      description: formData.description
    });

    alert(`✅ Product "${formData.name}" updated successfully!`);
    onNavigate('products');
  };

  if (!product) {
    return (
      <div className="screen">
        <div className="screen-header">
          <div className="header-left">
            <button className="back-btn" onClick={() => onNavigate('products')}>← Back</button>
            <h1>Edit Product</h1>
          </div>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
        <div className="screen-content">
          <div className="error-message">
            <p>Product not found. Please go back and select a product to edit.</p>
            <button onClick={() => onNavigate('products')} className="primary-button">
              Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="screen-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => onNavigate('products')}>← Back</button>
          <h1>Edit Product</h1>
        </div>
        <button onClick={onLogout} className="logout-btn">Logout</button>
      </div>
      <div className="screen-content">
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter product name"
                required
              />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                required
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Product description (optional)"
                rows={3}
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Pricing & Inventory</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Price (R) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="form-group">
                <label>Stock Quantity *</label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  placeholder="0"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Product Image</h3>
            <div className="form-group">
              <label>Emoji or Icon</label>
              <input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
                placeholder="e.g., ☕, 🍰, 🥪"
                maxLength={2}
              />
              <p className="form-hint">Use emojis or symbols to represent your product</p>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => onNavigate('products')}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Update Product
      </button>
          </div>
        </form>
    </div>
  </div>
);
};

const TaxScreen = ({ user, onLogout }: { 
  user: User, 
  onLogout: () => void
}) => {
  const [activeTab, setActiveTab] = useState('reports');
  const [selectedAccounting, setSelectedAccounting] = useState('');
  const [showAccountingConfig, setShowAccountingConfig] = useState(false);
  const [liveTaxData, setLiveTaxData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Tax settings state
  const [taxSettings, setTaxSettings] = useState({
    sarsNumber: '',
    vatNumber: '',
    accountingSystem: '',
    accountingConfig: {}
  });
  
  // Edit mode states
  const [editingSars, setEditingSars] = useState(false);
  const [editingVat, setEditingVat] = useState(false);
  const [tempSarsNumber, setTempSarsNumber] = useState('');
  const [tempVatNumber, setTempVatNumber] = useState('');

  // Load live tax data
  useEffect(() => {
    const loadLiveTaxData = async () => {
      setIsLoading(true);
      try {
        // In production, this would fetch from API
        const isProduction = process.env.NODE_ENV === 'production' || 
                             window.location.hostname !== 'localhost';
        
        if (isProduction) {
          // Simulate API call for live tax data
          const response = await fetch('/api/tax/data', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('apiKey')}` }
          });
          if (response.ok) {
            const data = await response.json();
            setLiveTaxData(data);
          }
        } else {
          // Development mode - use mock data
          setLiveTaxData({
            totalRevenue: 125000,
            taxableIncome: 95000,
            vatCollected: 18750,
            vatPaid: 12000,
            netVatOwed: 6750,
            lastSubmission: '2024-01-15',
            nextDue: '2024-02-28'
          });
        }
      } catch (error) {
        console.error('Failed to load tax data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLiveTaxData();
  }, []);

  return (
    <div className="screen">
      <div className="screen-header">
        <h1>Tax & SARS Compliance</h1>
        <button onClick={onLogout} className="logout-btn">Logout</button>
      </div>
      <div className="screen-content">
        {/* Apple-style segmented control */}
        <div className="segmented-control">
          <button
            className={`segment ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            Reports
          </button>
          <button
            className={`segment ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>

        {activeTab === 'reports' && (
          <div className="content-section">
            <div className="section-header">
              <h2>Tax Reports</h2>
              <button 
                className="primary-button"
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    const isProduction = window.location.hostname !== 'localhost';
                    
                    if (isProduction) {
                      // Generate live tax report
                      const response = await fetch('/api/tax/generate-report', {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('apiKey')}` }
                      });
                      
                      if (response.ok) {
                        const reportData = await response.json();
                        setLiveTaxData(prev => ({ 
                          ...prev, 
                          generatedReport: {
                            id: reportData.reportId,
                            generatedDate: new Date().toISOString(),
                            status: 'Generated',
                            vatReturn: reportData.vatReturn,
                            incomeTax: reportData.incomeTax
                          }
                        }));
                      }
                    } else {
                      // Development mode - simulate report generation
                      const generatedReport = {
                        id: `REPORT-${Date.now()}`,
                        generatedDate: new Date().toISOString(),
                        status: 'Generated',
                        vatReturn: {
                          period: 'Dec 2024',
                          vatCollected: liveTaxData?.vatCollected || 18750,
                          vatPaid: liveTaxData?.vatPaid || 12000,
                          netVatOwed: liveTaxData?.netVatOwed || 6750
                        },
                        incomeTax: {
                          period: 'Q4 2024',
                          taxableIncome: 38100,
                          taxOwed: 11430,
                          deductions: 5000,
                          netTaxOwed: 6430
                        }
                      };
                      setLiveTaxData(prev => ({ ...prev, generatedReport }));
                    }
                  } catch (error) {
                    console.error('Error generating tax report:', error);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
              >
                {isLoading ? 'Generating...' : 'Generate'}
              </button>
            </div>
            
            <div className="card-list">
              <div className="card">
                <div className="card-header">
                  <div className="card-title">VAT Return</div>
                  <div className="badge success">Ready</div>
                </div>
                <div className="card-content">
                  <div className="info-row">
                    <span className="label">Period:</span>
                    <span className="value">Dec 2024</span>
                  </div>
                  <div className="info-row">
                    <span className="label">VAT:</span>
                    <span className="value">
                      {liveTaxData ? `R${liveTaxData.netVatOwed?.toLocaleString() || '0'}` : 'Loading...'}
                    </span>
                  </div>
                </div>
                <div className="card-actions">
                  <button 
                    className="secondary-button"
                    onClick={async () => {
                      try {
                        setIsLoading(true);
                        const isProduction = window.location.hostname !== 'localhost';
                        
                        if (isProduction) {
                          const response = await fetch('/api/tax/vat-return/view', {
                            headers: { 'Authorization': `Bearer ${localStorage.getItem('apiKey')}` }
                          });
                          if (response.ok) {
                            const vatData = await response.json();
                            setLiveTaxData(prev => ({ ...prev, vatReturn: vatData }));
                          }
                        } else {
                          // Development mode - show mock VAT return data
                          const vatReturnData = {
                            period: 'Dec 2024',
                            vatCollected: liveTaxData?.vatCollected || 18750,
                            vatPaid: liveTaxData?.vatPaid || 12000,
                            netVatOwed: liveTaxData?.netVatOwed || 6750,
                            submissionDate: new Date().toLocaleDateString(),
                            status: 'Ready for submission'
                          };
                          setLiveTaxData(prev => ({ ...prev, vatReturn: vatReturnData }));
                        }
                      } catch (error) {
                        console.error('Error loading VAT return:', error);
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                  >
                    View
                  </button>
                  <button 
                    className="secondary-button"
                    onClick={async () => {
                      try {
                        setIsLoading(true);
                        const isProduction = window.location.hostname !== 'localhost';
                        
                        if (isProduction) {
                          const response = await fetch('/api/tax/vat-return/export', {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${localStorage.getItem('apiKey')}` }
                          });
                          if (response.ok) {
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `VAT_Return_${new Date().toISOString().split('T')[0]}.pdf`;
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            document.body.removeChild(a);
                          }
                        } else {
                          // Development mode - simulate export
                          const exportData = {
                            period: 'Dec 2024',
                            vatCollected: liveTaxData?.vatCollected || 18750,
                            vatPaid: liveTaxData?.vatPaid || 12000,
                            netVatOwed: liveTaxData?.netVatOwed || 6750,
                            exportDate: new Date().toISOString()
                          };
                          const dataStr = JSON.stringify(exportData, null, 2);
                          const dataBlob = new Blob([dataStr], { type: 'application/json' });
                          const url = window.URL.createObjectURL(dataBlob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `VAT_Return_${new Date().toISOString().split('T')[0]}.json`;
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);
                          document.body.removeChild(a);
                        }
                      } catch (error) {
                        console.error('Error exporting VAT return:', error);
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                  >
                    Export
                  </button>
                  <button 
                    className="secondary-button" 
                    onClick={async () => {
                      try {
                        setIsLoading(true);
                        const isProduction = window.location.hostname !== 'localhost';
                        
                        if (isProduction) {
                          const response = await fetch('/api/tax/vat-return/submit', {
                            method: 'POST',
                            headers: { 
                              'Authorization': `Bearer ${localStorage.getItem('apiKey')}`,
                              'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                              period: 'Dec 2024',
                              netVatOwed: liveTaxData?.netVatOwed || 6750,
                              submissionDate: new Date().toISOString()
                            })
                          });
                          if (response.ok) {
                            const result = await response.json();
                            setLiveTaxData(prev => ({ 
                              ...prev, 
                              vatReturn: { ...prev.vatReturn, status: 'Submitted', submissionId: result.submissionId }
                            }));
                          }
                        } else {
                          // Development mode - simulate submission
                          setLiveTaxData(prev => ({ 
                            ...prev, 
                            vatReturn: { 
                              ...prev.vatReturn, 
                              status: 'Submitted to SARS', 
                              submissionId: `SARS-${Date.now()}`,
                              submissionDate: new Date().toISOString()
                            }
                          }));
                        }
                      } catch (error) {
                        console.error('Error submitting VAT return:', error);
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                  >
                    Submit to SARS
                  </button>
                </div>
              </div>
              
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Income Tax Summary</div>
                  <div className="badge warning">Pending</div>
                </div>
                <div className="card-content">
                  <div className="info-row">
                    <span className="label">Period:</span>
                    <span className="value">Q4 2024</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Taxable Income:</span>
                    <span className="value">R38,100.00</span>
                  </div>
                </div>
                <div className="card-actions">
                  <button 
                    className="secondary-button"
                    onClick={async () => {
                      try {
                        setIsLoading(true);
                        const isProduction = window.location.hostname !== 'localhost';
                        
                        if (isProduction) {
                          const response = await fetch('/api/tax/income-tax/view', {
                            headers: { 'Authorization': `Bearer ${localStorage.getItem('apiKey')}` }
                          });
                          if (response.ok) {
                            const incomeData = await response.json();
                            setLiveTaxData(prev => ({ ...prev, incomeTax: incomeData }));
                          }
                        } else {
                          // Development mode - show mock income tax data
                          const incomeTaxData = {
                            period: 'Q4 2024',
                            taxableIncome: 38100,
                            taxOwed: 11430,
                            deductions: 5000,
                            netTaxOwed: 6430,
                            submissionDate: new Date().toLocaleDateString(),
                            status: 'Ready for submission'
                          };
                          setLiveTaxData(prev => ({ ...prev, incomeTax: incomeTaxData }));
                        }
                      } catch (error) {
                        console.error('Error loading income tax:', error);
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                  >
                    View
                  </button>
                  <button 
                    className="secondary-button"
                    onClick={async () => {
                      try {
                        setIsLoading(true);
                        const isProduction = window.location.hostname !== 'localhost';
                        
                        if (isProduction) {
                          const response = await fetch('/api/tax/income-tax/export', {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${localStorage.getItem('apiKey')}` }
                          });
                          if (response.ok) {
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `Income_Tax_Summary_${new Date().toISOString().split('T')[0]}.pdf`;
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            document.body.removeChild(a);
                          }
                        } else {
                          // Development mode - simulate export
                          const exportData = {
                            period: 'Q4 2024',
                            taxableIncome: 38100,
                            taxOwed: 11430,
                            deductions: 5000,
                            netTaxOwed: 6430,
                            exportDate: new Date().toISOString()
                          };
                          const dataStr = JSON.stringify(exportData, null, 2);
                          const dataBlob = new Blob([dataStr], { type: 'application/json' });
                          const url = window.URL.createObjectURL(dataBlob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `Income_Tax_Summary_${new Date().toISOString().split('T')[0]}.json`;
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);
                          document.body.removeChild(a);
                        }
                      } catch (error) {
                        console.error('Error exporting income tax:', error);
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                  >
                    Export
                  </button>
                  <button 
                    className="secondary-button" 
                    onClick={async () => {
                      try {
                        setIsLoading(true);
                        const isProduction = window.location.hostname !== 'localhost';
                        
                        if (isProduction) {
                          const response = await fetch('/api/tax/income-tax/submit', {
                            method: 'POST',
                            headers: { 
                              'Authorization': `Bearer ${localStorage.getItem('apiKey')}`,
                              'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                              period: 'Q4 2024',
                              taxableIncome: 38100,
                              netTaxOwed: 6430,
                              submissionDate: new Date().toISOString()
                            })
                          });
                          if (response.ok) {
                            const result = await response.json();
                            setLiveTaxData(prev => ({ 
                              ...prev, 
                              incomeTax: { ...prev.incomeTax, status: 'Submitted', submissionId: result.submissionId }
                            }));
                          }
                        } else {
                          // Development mode - simulate submission
                          setLiveTaxData(prev => ({ 
                            ...prev, 
                            incomeTax: { 
                              ...prev.incomeTax, 
                              status: 'Submitted to SARS', 
                              submissionId: `SARS-${Date.now()}`,
                              submissionDate: new Date().toISOString()
                            }
                          }));
                        }
                      } catch (error) {
                        console.error('Error submitting income tax:', error);
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                  >
                    Submit to SARS
                  </button>
                </div>
              </div>
            </div>
            
            <div className="action-buttons">
              <button 
                className="primary-button" 
                onClick={async () => {
                  try {
                    setIsLoading(true);
                    const isProduction = window.location.hostname !== 'localhost';
                    
                    if (isProduction) {
                      const response = await fetch('/api/tax/export-all', {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('apiKey')}` }
                      });
                      if (response.ok) {
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `Tax_Reports_${new Date().toISOString().split('T')[0]}.zip`;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                      }
                    } else {
                      // Development mode - simulate export
                      const exportData = {
                        vatReturn: liveTaxData?.vatReturn || {},
                        incomeTax: liveTaxData?.incomeTax || {},
                        exportDate: new Date().toISOString(),
                        businessName: 'Your Business'
                      };
                      const dataStr = JSON.stringify(exportData, null, 2);
                      const dataBlob = new Blob([dataStr], { type: 'application/json' });
                      const url = window.URL.createObjectURL(dataBlob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `Tax_Reports_${new Date().toISOString().split('T')[0]}.json`;
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      document.body.removeChild(a);
                    }
                  } catch (error) {
                    console.error('Error exporting all reports:', error);
                  } finally {
                    setIsLoading(false);
                  }
                }}
              >
                Export to Accounting
              </button>
              <button 
                className="primary-button" 
                onClick={async () => {
                  try {
                    setIsLoading(true);
                    const isProduction = window.location.hostname !== 'localhost';
                    
                    if (isProduction) {
                      const response = await fetch('/api/tax/submit-all', {
                        method: 'POST',
                        headers: { 
                          'Authorization': `Bearer ${localStorage.getItem('apiKey')}`,
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          vatReturn: liveTaxData?.vatReturn,
                          incomeTax: liveTaxData?.incomeTax,
                          submissionDate: new Date().toISOString()
                        })
                      });
                      if (response.ok) {
                        const result = await response.json();
                        setLiveTaxData(prev => ({ 
                          ...prev, 
                          vatReturn: { ...prev.vatReturn, status: 'Submitted', submissionId: result.vatSubmissionId },
                          incomeTax: { ...prev.incomeTax, status: 'Submitted', submissionId: result.incomeSubmissionId }
                        }));
                      }
                    } else {
                      // Development mode - simulate submission
                      setLiveTaxData(prev => ({ 
                        ...prev, 
                        vatReturn: { 
                          ...prev.vatReturn, 
                          status: 'Submitted to SARS', 
                          submissionId: `SARS-VAT-${Date.now()}`,
                          submissionDate: new Date().toISOString()
                        },
                        incomeTax: { 
                          ...prev.incomeTax, 
                          status: 'Submitted to SARS', 
                          submissionId: `SARS-INC-${Date.now()}`,
                          submissionDate: new Date().toISOString()
                        }
                      }));
                    }
                  } catch (error) {
                    console.error('Error submitting all reports:', error);
                  } finally {
                    setIsLoading(false);
                  }
                }}
              >
                Submit All to SARS
              </button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="content-section">
            <div className="section-header">
              <h2>Tax Settings</h2>
            </div>
            
            <div className="settings-list">
              <div className="setting-row">
                <div className="setting-content">
                  <div className="setting-title">SARS Registration Number</div>
                  <div className="setting-subtitle">Your SARS tax number</div>
                  {editingSars ? (
                    <div className="edit-form">
                      <input 
                        type="text" 
                        value={tempSarsNumber}
                        onChange={(e) => setTempSarsNumber(e.target.value)}
                        placeholder="Enter SARS Registration Number"
                        className="edit-input"
                      />
                      <div className="edit-actions">
                        <button 
                          className="secondary-button"
                          onClick={() => {
                            setEditingSars(false);
                            setTempSarsNumber('');
                          }}
                        >
                          Cancel
                        </button>
                        <button 
                          className="primary-button"
                          onClick={async () => {
                            try {
                              setIsLoading(true);
                              const isProduction = window.location.hostname !== 'localhost';
                              
                              if (isProduction) {
                                const response = await fetch('/api/tax/settings/sars-number', {
                                  method: 'PUT',
                                  headers: { 
                                    'Authorization': `Bearer ${localStorage.getItem('apiKey')}`,
                                    'Content-Type': 'application/json'
                                  },
                                  body: JSON.stringify({ sarsNumber: tempSarsNumber })
                                });
                                if (response.ok) {
                                  setTaxSettings(prev => ({ ...prev, sarsNumber: tempSarsNumber }));
                                  setEditingSars(false);
                                }
                              } else {
                                // Development mode
                                setTaxSettings(prev => ({ ...prev, sarsNumber: tempSarsNumber }));
                                setEditingSars(false);
                                console.log('SARS Number updated:', tempSarsNumber);
                              }
                            } catch (error) {
                              console.error('Error updating SARS number:', error);
                            } finally {
                              setIsLoading(false);
                            }
                          }}
                        >
                          {isLoading ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="setting-value">
                      {taxSettings.sarsNumber || 'Not set'}
                    </div>
                  )}
                </div>
                {!editingSars && (
                  <button 
                    className="tertiary-button" 
                    onClick={() => {
                      setTempSarsNumber(taxSettings.sarsNumber);
                      setEditingSars(true);
                    }}
                  >
                    Edit
                  </button>
                )}
              </div>
              
              <div className="setting-row">
                <div className="setting-content">
                  <div className="setting-title">VAT Registration</div>
                  <div className="setting-subtitle">VAT number details</div>
                  {editingVat ? (
                    <div className="edit-form">
                      <input 
                        type="text" 
                        value={tempVatNumber}
                        onChange={(e) => setTempVatNumber(e.target.value)}
                        placeholder="Enter VAT Number"
                        className="edit-input"
                      />
                      <div className="edit-actions">
                        <button 
                          className="secondary-button"
                          onClick={() => {
                            setEditingVat(false);
                            setTempVatNumber('');
                          }}
                        >
                          Cancel
                        </button>
                        <button 
                          className="primary-button"
                          onClick={async () => {
                            try {
                              setIsLoading(true);
                              const isProduction = window.location.hostname !== 'localhost';
                              
                              if (isProduction) {
                                const response = await fetch('/api/tax/settings/vat-number', {
                                  method: 'PUT',
                                  headers: { 
                                    'Authorization': `Bearer ${localStorage.getItem('apiKey')}`,
                                    'Content-Type': 'application/json'
                                  },
                                  body: JSON.stringify({ vatNumber: tempVatNumber })
                                });
                                if (response.ok) {
                                  setTaxSettings(prev => ({ ...prev, vatNumber: tempVatNumber }));
                                  setEditingVat(false);
                                }
                              } else {
                                // Development mode
                                setTaxSettings(prev => ({ ...prev, vatNumber: tempVatNumber }));
                                setEditingVat(false);
                                console.log('VAT Number updated:', tempVatNumber);
                              }
                            } catch (error) {
                              console.error('Error updating VAT number:', error);
                            } finally {
                              setIsLoading(false);
                            }
                          }}
                        >
                          {isLoading ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="setting-value">
                      {taxSettings.vatNumber || 'Not set'}
                    </div>
                  )}
                </div>
                {!editingVat && (
                  <button 
                    className="tertiary-button" 
                    onClick={() => {
                      setTempVatNumber(taxSettings.vatNumber);
                      setEditingVat(true);
                    }}
                  >
                    Edit
                  </button>
                )}
              </div>
              
              <div className="setting-row">
                <div className="setting-content">
                  <div className="setting-title">Accounting System</div>
                  <div className="setting-subtitle">Connect to your accounting software</div>
                </div>
                <select 
                  className="accounting-dropdown"
                  value={selectedAccounting}
                  onChange={(e) => {
                    setSelectedAccounting(e.target.value);
                    if (e.target.value) {
                      setShowAccountingConfig(true);
                    }
                  }}
                >
                  <option value="">Select System</option>
                  <option value="quickbooks">QuickBooks</option>
                  <option value="xero">Xero</option>
                  <option value="sage">Sage</option>
                  <option value="pastel">Pastel</option>
                </select>
              </div>
              
              {showAccountingConfig && selectedAccounting && (
                <div className="accounting-config">
                  <h3>Configure {selectedAccounting.charAt(0).toUpperCase() + selectedAccounting.slice(1)}</h3>
                  
                  {selectedAccounting === 'quickbooks' && (
                    <div className="config-fields">
                      <div className="config-field">
                        <label>QuickBooks Company ID:</label>
                        <input type="text" placeholder="Enter Company ID" />
                      </div>
                      <div className="config-field">
                        <label>API Key:</label>
                        <input type="password" placeholder="Enter API Key" />
                      </div>
                      <div className="config-field">
                        <label>Sync Frequency:</label>
                        <select>
                          <option>Daily</option>
                          <option>Weekly</option>
                          <option>Monthly</option>
                        </select>
                      </div>
                    </div>
                  )}
                  
                  {selectedAccounting === 'xero' && (
                    <div className="config-fields">
                      <div className="config-field">
                        <label>Xero Tenant ID:</label>
                        <input type="text" placeholder="Enter Tenant ID" />
                      </div>
                      <div className="config-field">
                        <label>Client ID:</label>
                        <input type="text" placeholder="Enter Client ID" />
                      </div>
                      <div className="config-field">
                        <label>Client Secret:</label>
                        <input type="password" placeholder="Enter Client Secret" />
                      </div>
                    </div>
                  )}
                  
                  {selectedAccounting === 'sage' && (
                    <div className="config-fields">
                      <div className="config-field">
                        <label>Sage Company Code:</label>
                        <input type="text" placeholder="Enter Company Code" />
                      </div>
                      <div className="config-field">
                        <label>Database Path:</label>
                        <input type="text" placeholder="Enter Database Path" />
                      </div>
                      <div className="config-field">
                        <label>User ID:</label>
                        <input type="text" placeholder="Enter User ID" />
                      </div>
                    </div>
                  )}
                  
                  {selectedAccounting === 'pastel' && (
                    <div className="config-fields">
                      <div className="config-field">
                        <label>Pastel Company:</label>
                        <input type="text" placeholder="Enter Company Name" />
                      </div>
                      <div className="config-field">
                        <label>Data Path:</label>
                        <input type="text" placeholder="Enter Data Path" />
                      </div>
                      <div className="config-field">
                        <label>Version:</label>
                        <select>
                          <option>Pastel Evolution</option>
                          <option>Pastel Partner</option>
                          <option>Pastel Xpress</option>
                        </select>
                      </div>
                    </div>
                  )}
                  
                  <div className="config-actions">
                    <button className="secondary-button" onClick={() => setShowAccountingConfig(false)}>
                      Cancel
                    </button>
                    <button 
                      className="primary-button" 
                      onClick={async () => {
                        try {
                          setIsLoading(true);
                          const isProduction = window.location.hostname !== 'localhost';
                          
                          if (isProduction) {
                            // Save accounting configuration to API
                            const response = await fetch('/api/tax/settings/accounting', {
                              method: 'POST',
                              headers: { 
                                'Authorization': `Bearer ${localStorage.getItem('apiKey')}`,
                                'Content-Type': 'application/json'
                              },
                              body: JSON.stringify({
                                system: selectedAccounting,
                                configuration: taxSettings.accountingConfig
                              })
                            });
                            
                            if (response.ok) {
                              const result = await response.json();
                              setTaxSettings(prev => ({ 
                                ...prev, 
                                accountingSystem: selectedAccounting,
                                accountingConfig: result.configuration
                              }));
                      setShowAccountingConfig(false);
                            }
                          } else {
                            // Development mode - simulate save
                            setTaxSettings(prev => ({ 
                              ...prev, 
                              accountingSystem: selectedAccounting,
                              accountingConfig: {
                                system: selectedAccounting,
                                configuredDate: new Date().toISOString(),
                                status: 'Active'
                              }
                            }));
                            setShowAccountingConfig(false);
                            
                            // Simulate API call
                            setTimeout(() => {
                              console.log('Accounting system configured:', selectedAccounting);
                            }, 500);
                          }
                        } catch (error) {
                          console.error('Error saving accounting configuration:', error);
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                    >
                      {isLoading ? 'Saving...' : 'Save Configuration'}
                    </button>
                  </div>
                </div>
              )}
              
              <div className="setting-row">
                <div className="setting-content">
                  <div className="setting-title">Auto-Generate Reports</div>
                  <div className="setting-subtitle">Monthly reports</div>
                </div>
                <div className="toggle">
                  <input type="checkbox" id="auto-reports" defaultChecked />
                  <label htmlFor="auto-reports" className="toggle-label"></label>
                </div>
              </div>
              
              <div className="setting-row">
                <div className="setting-content">
                  <div className="setting-title">Auto-Submit to SARS</div>
                  <div className="setting-subtitle">Automatically submit reports</div>
                </div>
                <div className="toggle">
                  <input type="checkbox" id="auto-submit" />
                  <label htmlFor="auto-submit" className="toggle-label"></label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const HardwareScreen = ({ user, onLogout }: { 
  user: User, 
  onLogout: () => void
}) => {
  const [activeTab, setActiveTab] = useState('devices');
  const [hardwareDevices, setHardwareDevices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Device management state
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [newDevice, setNewDevice] = useState({
    name: '',
    type: '',
    model: '',
    connectionType: 'usb'
  });
  const [deviceStatus, setDeviceStatus] = useState<{[key: string]: string}>({});

  // Load hardware devices
  useEffect(() => {
    const loadHardwareDevices = async () => {
      setIsLoading(true);
      try {
        const isProduction = process.env.NODE_ENV === 'production' || 
                             window.location.hostname !== 'localhost';
        
        if (isProduction) {
          const response = await fetch('/api/hardware/devices', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('apiKey')}` }
          });
          if (response.ok) {
            const data = await response.json();
            setHardwareDevices(data.devices || []);
          }
        } else {
          // Development mode - mock data
          setHardwareDevices([
            { id: '1', name: 'POS Terminal', type: 'pos', status: 'connected', lastSeen: '2024-01-15T10:30:00Z' },
            { id: '2', name: 'Receipt Printer', type: 'printer', status: 'connected', lastSeen: '2024-01-15T10:29:00Z' },
            { id: '3', name: 'Card Reader', type: 'payment', status: 'disconnected', lastSeen: '2024-01-14T15:20:00Z' }
          ]);
        }
      } catch (error) {
        console.error('Failed to load hardware devices:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHardwareDevices();
  }, []);

  return (
    <div className="screen">
      <div className="screen-header">
        <h1>Hardware Integrations</h1>
        <button onClick={onLogout} className="logout-btn">Logout</button>
      </div>
      <div className="screen-content">
        {/* Segmented Control */}
        <div className="segmented-control">
          <button
            className={`segment ${activeTab === 'devices' ? 'active' : ''}`}
            onClick={() => setActiveTab('devices')}
          >
            Devices
          </button>
          <button
            className={`segment ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>

        {activeTab === 'devices' && (
          <div className="content-section">
            <div className="section-header">
              <h2>Connected Devices</h2>
              <button 
                className="primary-button"
                onClick={() => setShowAddDevice(true)}
              >
                Add Device
              </button>
            </div>
            
            {showAddDevice && (
              <div className="add-device-form">
                <h3>Add New Device</h3>
                <div className="form-fields">
                  <div className="form-field">
                    <label>Device Name:</label>
                    <input 
                      type="text" 
                      value={newDevice.name}
                      onChange={(e) => setNewDevice(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter device name"
                    />
                  </div>
                  <div className="form-field">
                    <label>Device Type:</label>
                    <select 
                      value={newDevice.type}
                      onChange={(e) => setNewDevice(prev => ({ ...prev, type: e.target.value }))}
                    >
                      <option value="">Select Type</option>
                      <option value="card-reader">Card Reader</option>
                      <option value="printer">Printer</option>
                      <option value="scanner">Barcode Scanner</option>
                      <option value="pos">POS Terminal</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Model:</label>
                    <input 
                      type="text" 
                      value={newDevice.model}
                      onChange={(e) => setNewDevice(prev => ({ ...prev, model: e.target.value }))}
                      placeholder="Enter device model"
                    />
                  </div>
                  <div className="form-field">
                    <label>Connection Type:</label>
                    <select 
                      value={newDevice.connectionType}
                      onChange={(e) => setNewDevice(prev => ({ ...prev, connectionType: e.target.value }))}
                    >
                      <option value="usb">USB</option>
                      <option value="bluetooth">Bluetooth</option>
                      <option value="wifi">WiFi</option>
                      <option value="ethernet">Ethernet</option>
                    </select>
                  </div>
                </div>
                <div className="form-actions">
                  <button 
                    className="secondary-button"
                    onClick={() => {
                      setShowAddDevice(false);
                      setNewDevice({ name: '', type: '', model: '', connectionType: 'usb' });
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    className="primary-button"
                    onClick={async () => {
                      try {
                        setIsLoading(true);
                        const isProduction = window.location.hostname !== 'localhost';
                        
                        if (isProduction) {
                          const response = await fetch('/api/hardware/devices', {
                            method: 'POST',
                            headers: { 
                              'Authorization': `Bearer ${localStorage.getItem('apiKey')}`,
                              'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(newDevice)
                          });
                          if (response.ok) {
                            const device = await response.json();
                            setHardwareDevices(prev => [...prev, device]);
                            setShowAddDevice(false);
                            setNewDevice({ name: '', type: '', model: '', connectionType: 'usb' });
                          }
                        } else {
                          // Development mode
                          const device = {
                            id: `device-${Date.now()}`,
                            ...newDevice,
                            status: 'disconnected',
                            lastSeen: new Date().toISOString()
                          };
                          setHardwareDevices(prev => [...prev, device]);
                          setShowAddDevice(false);
                          setNewDevice({ name: '', type: '', model: '', connectionType: 'usb' });
                          console.log('Device added:', device);
                        }
                      } catch (error) {
                        console.error('Error adding device:', error);
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                  >
                    {isLoading ? 'Adding...' : 'Add Device'}
                  </button>
                </div>
              </div>
            )}
            
            <div className="card-list">
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Card Reader</div>
                  <div className="badge success">Connected</div>
                </div>
                <div className="card-content">
                  <div className="info-row">
                    <span className="label">Model:</span>
                    <span className="value">Yoco Card Reader</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Status:</span>
                    <span className="value">Active</span>
                  </div>
                  {deviceStatus['card-reader'] && (
                    <div className="info-row">
                      <span className="label">Test Result:</span>
                      <span className="value">{deviceStatus['card-reader']}</span>
                    </div>
                  )}
                </div>
                <div className="card-actions">
                  <button 
                    className="secondary-button"
                    onClick={async () => {
                      try {
                        setIsLoading(true);
                        const isProduction = window.location.hostname !== 'localhost';
                        
                        if (isProduction) {
                          const response = await fetch('/api/hardware/devices/card-reader/configure', {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${localStorage.getItem('apiKey')}` }
                          });
                          if (response.ok) {
                            const config = await response.json();
                            console.log('Card Reader configured:', config);
                          }
                        } else {
                          // Development mode
                          console.log('Card Reader configuration opened');
                          setTimeout(() => {
                            console.log('Card Reader configured successfully');
                          }, 1000);
                        }
                      } catch (error) {
                        console.error('Error configuring card reader:', error);
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                  >
                    {isLoading ? 'Configuring...' : 'Configure'}
                  </button>
                  <button 
                    className="secondary-button"
                    onClick={async () => {
                      try {
                        setIsLoading(true);
                        const isProduction = window.location.hostname !== 'localhost';
                        
                        if (isProduction) {
                          const response = await fetch('/api/hardware/devices/card-reader/test', {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${localStorage.getItem('apiKey')}` }
                          });
                          if (response.ok) {
                            const testResult = await response.json();
                            setDeviceStatus(prev => ({ ...prev, 'card-reader': testResult.status }));
                          }
                        } else {
                          // Development mode
                          setTimeout(() => {
                            setDeviceStatus(prev => ({ ...prev, 'card-reader': 'Test successful' }));
                            console.log('Card Reader test completed');
                          }, 2000);
                        }
                      } catch (error) {
                        console.error('Error testing card reader:', error);
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                  >
                    {isLoading ? 'Testing...' : 'Test'}
                  </button>
                </div>
              </div>
              
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Barcode Scanner</div>
                  <div className="badge warning">Disconnected</div>
                </div>
                <div className="card-content">
                  <div className="info-row">
                    <span className="label">Model:</span>
                    <span className="value">Generic USB Scanner</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Status:</span>
                    <span className="value">Offline</span>
                  </div>
                  {deviceStatus['barcode-scanner'] && (
                    <div className="info-row">
                      <span className="label">Connection Status:</span>
                      <span className="value">{deviceStatus['barcode-scanner']}</span>
                    </div>
                  )}
                </div>
                <div className="card-actions">
                  <button 
                    className="secondary-button"
                    onClick={async () => {
                      try {
                        setIsLoading(true);
                        const isProduction = window.location.hostname !== 'localhost';
                        
                        if (isProduction) {
                          const response = await fetch('/api/hardware/devices/barcode-scanner/connect', {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${localStorage.getItem('apiKey')}` }
                          });
                          if (response.ok) {
                            const result = await response.json();
                            setDeviceStatus(prev => ({ ...prev, 'barcode-scanner': result.status }));
                          }
                        } else {
                          // Development mode
                          setTimeout(() => {
                            setDeviceStatus(prev => ({ ...prev, 'barcode-scanner': 'Connected successfully' }));
                            console.log('Barcode Scanner connected');
                          }, 2000);
                        }
                      } catch (error) {
                        console.error('Error connecting barcode scanner:', error);
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                  >
                    {isLoading ? 'Connecting...' : 'Connect'}
                  </button>
                  <button 
                    className="secondary-button"
                    onClick={async () => {
                      try {
                        setIsLoading(true);
                        const isProduction = window.location.hostname !== 'localhost';
                        
                        if (isProduction) {
                          const response = await fetch('/api/hardware/devices/barcode-scanner/setup', {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${localStorage.getItem('apiKey')}` }
                          });
                          if (response.ok) {
                            const setup = await response.json();
                            console.log('Barcode Scanner setup completed:', setup);
                          }
                        } else {
                          // Development mode
                          setTimeout(() => {
                            setDeviceStatus(prev => ({ ...prev, 'barcode-scanner': 'Setup completed' }));
                            console.log('Barcode Scanner setup completed');
                          }, 3000);
                        }
                      } catch (error) {
                        console.error('Error setting up barcode scanner:', error);
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                  >
                    {isLoading ? 'Setting up...' : 'Setup'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="content-section">
            <div className="section-header">
              <h2>Hardware Settings</h2>
            </div>
            
            <div className="settings-list">
              <div className="setting-row">
                <div className="setting-content">
                  <div className="setting-title">Auto-Connect Devices</div>
                  <div className="setting-subtitle">Automatically connect new devices</div>
                </div>
                <div className="toggle">
                  <input type="checkbox" id="auto-connect" defaultChecked />
                  <label htmlFor="auto-connect" className="toggle-label"></label>
                </div>
              </div>
              
              <div className="setting-row">
                <div className="setting-content">
                  <div className="setting-title">Device Notifications</div>
                  <div className="setting-subtitle">Get notified about device status</div>
                </div>
                <div className="toggle">
                  <input type="checkbox" id="device-notifications" defaultChecked />
                  <label htmlFor="device-notifications" className="toggle-label"></label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const LendingScreen = ({ user, onLogout }: { 
  user: User, 
  onLogout: () => void
}) => {
  const [activeTab, setActiveTab] = useState('credit');
  const [lendingData, setLendingData] = useState<any>(null);
  const [creditScore, setCreditScore] = useState<number>(0);
  const [availableLoans, setAvailableLoans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Credit score details state
  const [showCreditDetails, setShowCreditDetails] = useState(false);
  const [creditDetails, setCreditDetails] = useState<any>(null);
  const [loanApplications, setLoanApplications] = useState<any[]>([]);
  
  // Loan application state
  const [showLoanApplication, setShowLoanApplication] = useState(false);
  const [loanApplication, setLoanApplication] = useState({
    loanType: '',
    amount: '',
    businessName: '',
    contactEmail: '',
    phone: '',
    businessRegistration: '',
    monthlyRevenue: '',
    loanPurpose: '',
    repaymentTerm: '12'
  });

  // Load lending data
  useEffect(() => {
    const loadLendingData = async () => {
      setIsLoading(true);
      try {
        const isProduction = process.env.NODE_ENV === 'production' || 
                             window.location.hostname !== 'localhost';
        
        if (isProduction) {
          const response = await fetch('/api/lending/data', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('apiKey')}` }
          });
          if (response.ok) {
            const data = await response.json();
            setLendingData(data);
            setCreditScore(data.creditScore || 0);
            setAvailableLoans(data.availableLoans || []);
          }
        } else {
          // Development mode - mock data
          setLendingData({
            businessRevenue: 125000,
            monthlyIncome: 15000,
            creditScore: 720,
            loanHistory: [
              { id: '1', amount: 50000, status: 'paid', date: '2023-06-15' },
              { id: '2', amount: 25000, status: 'active', date: '2023-12-01' }
            ]
          });
          setCreditScore(720);
          setAvailableLoans([
            { id: '1', name: 'Business Growth Loan', amount: 100000, rate: 8.5, term: '24 months' },
            { id: '2', name: 'Equipment Finance', amount: 50000, rate: 7.2, term: '36 months' },
            { id: '3', name: 'Working Capital', amount: 25000, rate: 9.1, term: '12 months' }
          ]);
        }
      } catch (error) {
        console.error('Failed to load lending data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLendingData();
  }, []);

  return (
    <div className="screen">
      <div className="screen-header">
        <h1>Merchant Micro-lending</h1>
        <button onClick={onLogout} className="logout-btn">Logout</button>
      </div>
      <div className="screen-content">
        {/* Segmented Control */}
        <div className="segmented-control">
          <button
            className={`segment ${activeTab === 'credit' ? 'active' : ''}`}
            onClick={() => setActiveTab('credit')}
          >
            Credit Score
          </button>
          <button
            className={`segment ${activeTab === 'loans' ? 'active' : ''}`}
            onClick={() => setActiveTab('loans')}
          >
            Loans
          </button>
        </div>

        {activeTab === 'credit' && (
          <div className="content-section">
            <div className="section-header">
              <h2>Credit Score</h2>
            </div>
            
            <div className="card-list">
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Current Score</div>
                  <div className="badge success">Good</div>
                </div>
                <div className="card-content">
                  <div className="info-row">
                    <span className="label">Score:</span>
                    <span className="value">750/1000</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Last Updated:</span>
                    <span className="value">Dec 2024</span>
                  </div>
                </div>
                <div className="card-actions">
                  <button 
                    className="secondary-button"
                    onClick={async () => {
                      try {
                        setIsLoading(true);
                        const isProduction = window.location.hostname !== 'localhost';
                        
                        if (isProduction) {
                          const response = await fetch('/api/lending/credit-details', {
                            headers: { 'Authorization': `Bearer ${localStorage.getItem('apiKey')}` }
                          });
                          if (response.ok) {
                            const details = await response.json();
                            setCreditDetails(details);
                            setShowCreditDetails(true);
                          }
                        } else {
                          // Development mode - show mock credit details
                          const mockDetails = {
                            score: 750,
                            factors: [
                              { factor: 'Payment History', impact: 'Positive', weight: 35 },
                              { factor: 'Credit Utilization', impact: 'Good', weight: 30 },
                              { factor: 'Length of Credit', impact: 'Excellent', weight: 15 },
                              { factor: 'Credit Mix', impact: 'Good', weight: 10 },
                              { factor: 'New Credit', impact: 'Neutral', weight: 10 }
                            ],
                            recommendations: [
                              'Maintain current payment patterns',
                              'Keep credit utilization below 30%',
                              'Avoid opening new credit accounts'
                            ],
                            lastUpdated: new Date().toISOString()
                          };
                          setCreditDetails(mockDetails);
                          setShowCreditDetails(true);
                        }
                      } catch (error) {
                        console.error('Error loading credit details:', error);
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                  >
                    {isLoading ? 'Loading...' : 'View Details'}
                  </button>
                  <button 
                    className="secondary-button"
                    onClick={async () => {
                      try {
                        setIsLoading(true);
                        const isProduction = window.location.hostname !== 'localhost';
                        
                        if (isProduction) {
                          const response = await fetch('/api/lending/refresh-credit', {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${localStorage.getItem('apiKey')}` }
                          });
                          if (response.ok) {
                            const updatedData = await response.json();
                            setCreditScore(updatedData.creditScore);
                            setLendingData(prev => ({ ...prev, creditScore: updatedData.creditScore }));
                          }
                        } else {
                          // Development mode - simulate refresh
                          const newScore = Math.floor(Math.random() * 50) + 700; // Random score between 700-750
                          setCreditScore(newScore);
                          setLendingData(prev => ({ ...prev, creditScore: newScore }));
                          console.log('Credit score refreshed:', newScore);
                        }
                      } catch (error) {
                        console.error('Error refreshing credit score:', error);
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                  >
                    {isLoading ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>
              </div>
            </div>
            
            {showCreditDetails && creditDetails && (
              <div className="credit-details-modal">
                <div className="modal-header">
                  <h3>Credit Score Details</h3>
                  <button 
                    className="close-btn"
                    onClick={() => setShowCreditDetails(false)}
                  >
                    ×
                  </button>
                </div>
                <div className="modal-content">
                  <div className="score-section">
                    <h4>Current Score: {creditDetails.score}/1000</h4>
                    <p>Last Updated: {new Date(creditDetails.lastUpdated).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="factors-section">
                    <h4>Credit Factors</h4>
                    {creditDetails.factors.map((factor: any, index: number) => (
                      <div key={index} className="factor-item">
                        <div className="factor-name">{factor.factor}</div>
                        <div className="factor-impact">{factor.impact}</div>
                        <div className="factor-weight">{factor.weight}%</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="recommendations-section">
                    <h4>Recommendations</h4>
                    <ul>
                      {creditDetails.recommendations.map((rec: string, index: number) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'loans' && (
          <div className="content-section">
            <div className="section-header">
              <h2>Available Loans</h2>
            </div>
            
            <div className="card-list">
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Working Capital Loan</div>
                  <div className="badge success">Available</div>
                </div>
                <div className="card-content">
                  <div className="info-row">
                    <span className="label">Amount:</span>
                    <span className="value">R50,000</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Interest:</span>
                    <span className="value">12% p.a.</span>
                  </div>
                </div>
                <div className="card-actions">
                  <button 
                    className="secondary-button"
                    onClick={() => {
                      setLoanApplication(prev => ({
                        ...prev,
                        loanType: 'Working Capital Loan',
                        amount: '50000'
                      }));
                      setShowLoanApplication(true);
                    }}
                  >
                    Apply
                  </button>
                  <button 
                    className="secondary-button"
                    onClick={async () => {
                      try {
                        setIsLoading(true);
                        const isProduction = window.location.hostname !== 'localhost';
                        
                        if (isProduction) {
                          const response = await fetch('/api/lending/loans/working-capital/details', {
                            headers: { 'Authorization': `Bearer ${localStorage.getItem('apiKey')}` }
                          });
                          if (response.ok) {
                            const details = await response.json();
                            console.log('Loan details:', details);
                          }
                        } else {
                          // Development mode - show mock loan details
                          const loanDetails = {
                            name: 'Working Capital Loan',
                            amount: 50000,
                            interestRate: 12,
                            term: '12 months',
                            monthlyPayment: 4444,
                            totalInterest: 3333,
                            eligibility: {
                              minCreditScore: 650,
                              minRevenue: 100000,
                              maxDebtRatio: 0.4
                            },
                            requirements: [
                              'Business registration certificate',
                              '6 months bank statements',
                              'Tax clearance certificate',
                              'Business plan'
                            ],
                            benefits: [
                              'Quick approval process',
                              'Flexible repayment terms',
                              'No early payment penalties',
                              'Competitive interest rates'
                            ]
                          };
                          console.log('Loan details:', loanDetails);
                        }
                      } catch (error) {
                        console.error('Error loading loan details:', error);
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                  >
                    {isLoading ? 'Loading...' : 'Details'}
                  </button>
                </div>
              </div>
            </div>
            
            {showLoanApplication && (
              <div className="loan-application-form">
                <div className="form-header">
                  <h3>Loan Application</h3>
                  <button 
                    className="close-btn"
                    onClick={() => setShowLoanApplication(false)}
                  >
                    ×
                  </button>
                </div>
                <div className="form-content">
                  <div className="form-section">
                    <h4>Loan Information</h4>
                    <div className="form-row">
                      <div className="form-field">
                        <label>Loan Type:</label>
                        <input 
                          type="text" 
                          value={loanApplication.loanType}
                          onChange={(e) => setLoanApplication(prev => ({ ...prev, loanType: e.target.value }))}
                          placeholder="Enter loan type"
                        />
                      </div>
                      <div className="form-field">
                        <label>Amount (R):</label>
                        <input 
                          type="number" 
                          value={loanApplication.amount}
                          onChange={(e) => setLoanApplication(prev => ({ ...prev, amount: e.target.value }))}
                          placeholder="Enter loan amount"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-field">
                        <label>Repayment Term (months):</label>
                        <select 
                          value={loanApplication.repaymentTerm}
                          onChange={(e) => setLoanApplication(prev => ({ ...prev, repaymentTerm: e.target.value }))}
                        >
                          <option value="6">6 months</option>
                          <option value="12">12 months</option>
                          <option value="18">18 months</option>
                          <option value="24">24 months</option>
                          <option value="36">36 months</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-section">
                    <h4>Business Information</h4>
                    <div className="form-row">
                      <div className="form-field">
                        <label>Business Name:</label>
                        <input 
                          type="text" 
                          value={loanApplication.businessName}
                          onChange={(e) => setLoanApplication(prev => ({ ...prev, businessName: e.target.value }))}
                          placeholder="Enter business name"
                        />
                      </div>
                      <div className="form-field">
                        <label>Contact Email:</label>
                        <input 
                          type="email" 
                          value={loanApplication.contactEmail}
                          onChange={(e) => setLoanApplication(prev => ({ ...prev, contactEmail: e.target.value }))}
                          placeholder="Enter contact email"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-field">
                        <label>Phone Number:</label>
                        <input 
                          type="tel" 
                          value={loanApplication.phone}
                          onChange={(e) => setLoanApplication(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div className="form-field">
                        <label>Business Registration:</label>
                        <input 
                          type="text" 
                          value={loanApplication.businessRegistration}
                          onChange={(e) => setLoanApplication(prev => ({ ...prev, businessRegistration: e.target.value }))}
                          placeholder="Enter registration number"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-field">
                        <label>Monthly Revenue (R):</label>
                        <input 
                          type="number" 
                          value={loanApplication.monthlyRevenue}
                          onChange={(e) => setLoanApplication(prev => ({ ...prev, monthlyRevenue: e.target.value }))}
                          placeholder="Enter monthly revenue"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-section">
                    <h4>Loan Purpose</h4>
                    <div className="form-field">
                      <label>Purpose of Loan:</label>
                      <textarea 
                        value={loanApplication.loanPurpose}
                        onChange={(e) => setLoanApplication(prev => ({ ...prev, loanPurpose: e.target.value }))}
                        placeholder="Describe how you will use the loan funds"
                        rows={3}
                      />
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button 
                      className="secondary-button"
                      onClick={() => setShowLoanApplication(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="primary-button"
                      onClick={async () => {
                        try {
                          setIsLoading(true);
                          const isProduction = window.location.hostname !== 'localhost';
                          
                          if (isProduction) {
                            const response = await fetch('/api/lending/loans/apply', {
                              method: 'POST',
                              headers: { 
                                'Authorization': `Bearer ${localStorage.getItem('apiKey')}`,
                                'Content-Type': 'application/json'
                              },
                              body: JSON.stringify({
                                ...loanApplication,
                                reviewEmail: 'loan@Thenga.co.za',
                                applicationDate: new Date().toISOString()
                              })
                            });
                            if (response.ok) {
                              const application = await response.json();
                              setLoanApplications(prev => [...prev, application]);
                              setShowLoanApplication(false);
                              console.log('Loan application submitted:', application);
                            }
                          } else {
                            // Development mode - simulate application
                            const application = {
                              id: `app-${Date.now()}`,
                              ...loanApplication,
                              reviewEmail: 'loan@Thenga.co.za',
                              status: 'Under Review',
                              applicationDate: new Date().toISOString(),
                              estimatedDecision: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                            };
                            setLoanApplications(prev => [...prev, application]);
                            setShowLoanApplication(false);
                            console.log('Loan application submitted to loan@Thenga.co.za:', application);
                          }
                        } catch (error) {
                          console.error('Error applying for loan:', error);
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                    >
                      {isLoading ? 'Submitting...' : 'Submit Application'}
                    </button>
              </div>
            </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const MarketplaceScreen = ({ user, onLogout }: { 
  user: User, 
  onLogout: () => void
}) => {
  const [activeTab, setActiveTab] = useState('storefront');
  const [marketplaceData, setMarketplaceData] = useState<any>(null);
  const [marketplaceStats, setMarketplaceStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Storefront state
  const [storefrontUrl, setStorefrontUrl] = useState('');
  const [storefrontStats, setStorefrontStats] = useState<any>(null);
  
  // Delivery partners state
  const [deliveryPartners, setDeliveryPartners] = useState<any[]>([
    { id: 'uber', name: 'Uber Eats', status: 'connected', commission: '15%' },
    { id: 'bolt', name: 'Bolt Food', status: 'pending', commission: '12%' },
    { id: 'mr-d', name: 'Mr D Food', status: 'disconnected', commission: '18%' }
  ]);
  const [partnerStatus, setPartnerStatus] = useState<{[key: string]: string}>({
    'uber': 'connected',
    'bolt': 'pending',
    'mr-d': 'disconnected'
  });
  
  // Configuration state
  const [showConfigForm, setShowConfigForm] = useState<string | null>(null);
  const [configData, setConfigData] = useState<{[key: string]: any}>({});

  // Load marketplace data
  useEffect(() => {
    const loadMarketplaceData = async () => {
      console.log('MarketplaceScreen useEffect running...');
      setIsLoading(true);
      try {
        const isProduction = window.location.hostname !== 'localhost';
        console.log('Is production:', isProduction);
        
        if (isProduction) {
          // Load marketplace data
          const response = await fetch('/api/marketplace/data', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('apiKey')}` }
          });
          if (response.ok) {
            const data = await response.json();
            setMarketplaceData(data);
            setMarketplaceStats(data.stats);
          }
          
          // Load storefront data
          const storefrontResponse = await fetch('/api/marketplace/storefront', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('apiKey')}` }
          });
          if (storefrontResponse.ok) {
            const storefrontData = await storefrontResponse.json();
            setStorefrontUrl(storefrontData.url);
            setStorefrontStats(storefrontData.stats);
          }
          
          // Load delivery partners
          const partnersResponse = await fetch('/api/marketplace/delivery-partners', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('apiKey')}` }
          });
          if (partnersResponse.ok) {
            const partnersData = await partnersResponse.json();
            setDeliveryPartners(partnersData.partners);
            setPartnerStatus(partnersData.status);
          }
        } else {
          // Development mode - mock data
          setMarketplaceData({
            platforms: [
              { id: '1', name: 'Takealot', status: 'active', products: 45, sales: 12500 },
              { id: '2', name: 'Bidorbuy', status: 'active', products: 32, sales: 8500 },
              { id: '3', name: 'Facebook Marketplace', status: 'pending', products: 0, sales: 0 }
            ],
            totalProducts: 77,
            totalSales: 21000,
            activeListings: 45
          });
          setMarketplaceStats({
            totalRevenue: 21000,
            totalOrders: 156,
            averageOrderValue: 135,
            conversionRate: 3.2
          });
          
          // Mock storefront data
          setStorefrontUrl('https://storefront.Thenga.co.za/business/12345');
          setStorefrontStats({
            views: 1250,
            visitors: 890,
            orders: 45,
            revenue: 15750
          });
          
          // Mock delivery partners
          const mockPartners = [
            { id: 'uber', name: 'Uber Eats', status: 'connected', commission: '15%' },
            { id: 'bolt', name: 'Bolt Food', status: 'pending', commission: '12%' },
            { id: 'mr-d', name: 'Mr D Food', status: 'disconnected', commission: '18%' }
          ];
          console.log('Setting delivery partners:', mockPartners);
          setDeliveryPartners(mockPartners);
          setPartnerStatus({
            'uber': 'connected',
            'bolt': 'pending',
            'mr-d': 'disconnected'
          });
        }
      } catch (error) {
        console.error('Failed to load marketplace data:', error);
        
        // Fallback: Load mock data even on error
        console.log('Loading fallback delivery partners');
        const fallbackPartners = [
          { id: 'uber', name: 'Uber Eats', status: 'connected', commission: '15%' },
          { id: 'bolt', name: 'Bolt Food', status: 'pending', commission: '12%' },
          { id: 'mr-d', name: 'Mr D Food', status: 'disconnected', commission: '18%' }
        ];
        console.log('Setting fallback partners:', fallbackPartners);
        setDeliveryPartners(fallbackPartners);
        setPartnerStatus({
          'uber': 'connected',
          'bolt': 'pending',
          'mr-d': 'disconnected'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadMarketplaceData();
  }, []);

  return (
    <div className="screen">
      <div className="screen-header">
        <h1>Marketplace</h1>
        <button onClick={onLogout} className="logout-btn">Logout</button>
      </div>
      <div className="screen-content">
        {/* Segmented Control */}
        <div className="segmented-control">
          <button
            className={`segment ${activeTab === 'storefront' ? 'active' : ''}`}
            onClick={() => setActiveTab('storefront')}
          >
            Storefront
          </button>
          <button
            className={`segment ${activeTab === 'delivery' ? 'active' : ''}`}
            onClick={() => setActiveTab('delivery')}
          >
            Delivery
          </button>
        </div>

        {activeTab === 'storefront' && (
          <div className="content-section">
            <div className="section-header">
              <h2>Public Storefront</h2>
            </div>
            
            <div className="card-list">
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Store URL</div>
                  <div className="badge success">Live</div>
                </div>
                <div className="card-content">
                  <div className="info-row">
                    <span className="label">URL:</span>
                    <span className="value">{storefrontUrl || 'https://storefront.Thenga.co.za/business/12345'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Views:</span>
                    <span className="value">{storefrontStats?.views || '1,250'} this month</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Visitors:</span>
                    <span className="value">{storefrontStats?.visitors || '890'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Orders:</span>
                    <span className="value">{storefrontStats?.orders || '45'}</span>
                  </div>
                </div>
                <div className="card-actions">
                  <button 
                    className="secondary-button"
                    onClick={async () => {
                      try {
                        const isProduction = window.location.hostname !== 'localhost';
                        const url = storefrontUrl || 'https://storefront.Thenga.co.za/business/12345';
                        
                        if (isProduction) {
                          // Track view in production
                          await fetch('/api/marketplace/storefront/view', {
                            method: 'POST',
                            headers: { 
                              'Authorization': `Bearer ${localStorage.getItem('apiKey')}`,
                              'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ action: 'view', timestamp: new Date().toISOString() })
                          });
                        }
                        
                        // Open storefront in new tab
                        window.open(url, '_blank');
                        console.log('Opening storefront:', url);
                      } catch (error) {
                        console.error('Error opening storefront:', error);
                        // Fallback - open URL anyway
                        const url = storefrontUrl || 'https://storefront.Thenga.co.za/business/12345';
                        window.open(url, '_blank');
                      }
                    }}
                  >
                    View
                  </button>
                  <button 
                    className="secondary-button"
                    onClick={async () => {
                      try {
                        const isProduction = window.location.hostname !== 'localhost';
                        const url = storefrontUrl || 'https://storefront.Thenga.co.za/business/12345';
                        
                        if (isProduction) {
                          // Track share in production
                          await fetch('/api/marketplace/storefront/share', {
                            method: 'POST',
                            headers: { 
                              'Authorization': `Bearer ${localStorage.getItem('apiKey')}`,
                              'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ action: 'share', timestamp: new Date().toISOString() })
                          });
                        }
                        
                        // Copy URL to clipboard
                        await navigator.clipboard.writeText(url);
                        console.log('Storefront URL copied to clipboard:', url);
                        
                        // Show success message (you could add a toast notification here)
                        alert('Storefront URL copied to clipboard!');
                      } catch (error) {
                        console.error('Error sharing storefront:', error);
                        // Fallback - show URL for manual copy
                        alert(`Storefront URL: ${storefrontUrl || 'https://storefront.Thenga.co.za/business/12345'}`);
                      }
                    }}
                  >
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'delivery' && (
          <div className="content-section">
            <div className="section-header">
              <h2>Delivery Partners</h2>
            </div>
            
            <div className="card-list">
              {deliveryPartners.length === 0 ? (
              <div className="card">
                  <div className="card-content">
                    <p>No delivery partners available</p>
                  </div>
                </div>
              ) : (
                deliveryPartners.map((partner) => (
                <div key={partner.id} className="card">
                <div className="card-header">
                    <div className="card-title">{partner.name}</div>
                    <div className={`badge ${partner.status === 'connected' ? 'success' : partner.status === 'pending' ? 'warning' : 'error'}`}>
                      {partner.status === 'connected' ? 'Connected' : partner.status === 'pending' ? 'Pending' : 'Disconnected'}
                    </div>
                </div>
                <div className="card-content">
                  <div className="info-row">
                    <span className="label">Status:</span>
                      <span className="value">{partnerStatus[partner.id] || partner.status}</span>
                  </div>
                  <div className="info-row">
                      <span className="label">Commission:</span>
                      <span className="value">{partner.commission}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Last Sync:</span>
                      <span className="value">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="card-actions">
                    <button 
                      className="secondary-button"
                      onClick={() => {
                        setShowConfigForm(partner.id);
                        setConfigData({
                          [partner.id]: {
                            commission: partner.commission,
                            autoAccept: true,
                            deliveryRadius: 15,
                            workingHours: '08:00-20:00',
                            maxOrders: 50
                          }
                        });
                      }}
                    >
                      Configure
                    </button>
                    <button 
                      className="secondary-button"
                      onClick={async () => {
                        try {
                          setIsLoading(true);
                          const isProduction = window.location.hostname !== 'localhost';
                          
                          if (isProduction) {
                            // Test delivery partner in production
                            const response = await fetch(`/api/marketplace/delivery-partners/${partner.id}/test`, {
                              method: 'POST',
                              headers: { 
                                'Authorization': `Bearer ${localStorage.getItem('apiKey')}`,
                                'Content-Type': 'application/json'
                              },
                              body: JSON.stringify({
                                partnerId: partner.id,
                                partnerName: partner.name,
                                action: 'test',
                                testType: 'connection',
                                timestamp: new Date().toISOString()
                              })
                            });
                            
                            if (response.ok) {
                              const result = await response.json();
                              console.log('Partner test result:', result);
                              
                              // Update partner status based on test result
                              const newStatus = result.success ? 'connected' : 'error';
                              setPartnerStatus(prev => ({
                                ...prev,
                                [partner.id]: newStatus
                              }));
                              
                              // Update delivery partners list
                              setDeliveryPartners(prev => 
                                prev.map(p => 
                                  p.id === partner.id 
                                    ? { ...p, status: newStatus, lastTested: new Date().toISOString(), testResult: result }
                                    : p
                                )
                              );
                              
                              alert(`🧪 ${partner.name} Test Results:\n\nStatus: ${result.success ? '✅ PASSED' : '❌ FAILED'}\nResponse Time: ${result.responseTime || 'N/A'}ms\nAPI Status: ${result.apiStatus || 'Unknown'}\nLast Error: ${result.error || 'None'}\n\n${result.message || ''}`);
                            } else {
                              throw new Error(`Test failed: ${response.status}`);
                            }
                          } else {
                            // Development mode - simulate test with real data
                            console.log(`Testing ${partner.name}...`);
                            
                            // Simulate API delay
                            await new Promise(resolve => setTimeout(resolve, 2000));
                            
                            // Generate realistic test results
                            const testResults = {
                              uber: { success: true, responseTime: 245, apiStatus: 'healthy', error: null },
                              bolt: { success: false, responseTime: 1200, apiStatus: 'timeout', error: 'Connection timeout' },
                              'mr-d': { success: true, responseTime: 180, apiStatus: 'healthy', error: null }
                            };
                            
                            const result = testResults[partner.id as keyof typeof testResults] || { 
                              success: Math.random() > 0.3, 
                              responseTime: Math.floor(Math.random() * 1000) + 100,
                              apiStatus: 'unknown',
                              error: null
                            };
                            
                            // Update partner status
                            const newStatus = result.success ? 'connected' : 'error';
                            setPartnerStatus(prev => ({
                              ...prev,
                              [partner.id]: newStatus
                            }));
                            
                            // Update delivery partners list
                            setDeliveryPartners(prev => 
                              prev.map(p => 
                                p.id === partner.id 
                                  ? { ...p, status: newStatus, lastTested: new Date().toISOString(), testResult: result }
                                  : p
                              )
                            );
                            
                            alert(`🧪 ${partner.name} Test Results:\n\nStatus: ${result.success ? '✅ PASSED' : '❌ FAILED'}\nResponse Time: ${result.responseTime}ms\nAPI Status: ${result.apiStatus}\nLast Error: ${result.error || 'None'}\n\n${result.success ? 'Connection successful. Partner is ready for orders.' : 'Connection failed. Please check configuration and try again.'}`);
                          }
                        } catch (error) {
                          console.error('Error testing partner:', error);
                          alert(`❌ Error testing ${partner.name}:\n${error.message || 'Please try again.'}`);
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                    >
                      {isLoading ? 'Testing...' : 'Test'}
                    </button>
                </div>
              </div>
                ))
              )}
            </div>
            
            {showConfigForm && (
              <div className="delivery-config-form">
                <div className="form-header">
                  <h3>Configure {deliveryPartners.find(p => p.id === showConfigForm)?.name}</h3>
                  <button 
                    className="close-btn"
                    onClick={() => setShowConfigForm(null)}
                  >
                    ×
                  </button>
                </div>
                <div className="form-content">
                  <div className="form-section">
                    <h4>Partner Settings</h4>
                    <div className="form-row">
                      <div className="form-field">
                        <label>Commission Rate:</label>
                        <input 
                          type="text" 
                          value={configData[showConfigForm]?.commission || ''}
                          onChange={(e) => setConfigData(prev => ({
                            ...prev,
                            [showConfigForm]: {
                              ...prev[showConfigForm],
                              commission: e.target.value
                            }
                          }))}
                          placeholder="e.g., 15%"
                        />
                      </div>
                      <div className="form-field">
                        <label>Delivery Radius (km):</label>
                        <input 
                          type="number" 
                          value={configData[showConfigForm]?.deliveryRadius || ''}
                          onChange={(e) => setConfigData(prev => ({
                            ...prev,
                            [showConfigForm]: {
                              ...prev[showConfigForm],
                              deliveryRadius: parseInt(e.target.value)
                            }
                          }))}
                          placeholder="15"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-field">
                        <label>Working Hours:</label>
                        <input 
                          type="text" 
                          value={configData[showConfigForm]?.workingHours || ''}
                          onChange={(e) => setConfigData(prev => ({
                            ...prev,
                            [showConfigForm]: {
                              ...prev[showConfigForm],
                              workingHours: e.target.value
                            }
                          }))}
                          placeholder="08:00-20:00"
                        />
                      </div>
                      <div className="form-field">
                        <label>Max Orders per Day:</label>
                        <input 
                          type="number" 
                          value={configData[showConfigForm]?.maxOrders || ''}
                          onChange={(e) => setConfigData(prev => ({
                            ...prev,
                            [showConfigForm]: {
                              ...prev[showConfigForm],
                              maxOrders: parseInt(e.target.value)
                            }
                          }))}
                          placeholder="50"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-field">
                        <label>
                          <input 
                            type="checkbox" 
                            checked={configData[showConfigForm]?.autoAccept || false}
                            onChange={(e) => setConfigData(prev => ({
                              ...prev,
                              [showConfigForm]: {
                                ...prev[showConfigForm],
                                autoAccept: e.target.checked
                              }
                            }))}
                          />
                          Auto Accept Orders
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button 
                      className="secondary-button"
                      onClick={() => setShowConfigForm(null)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="primary-button"
                      onClick={async () => {
                        try {
                          setIsLoading(true);
                          const isProduction = window.location.hostname !== 'localhost';
                          const partner = deliveryPartners.find(p => p.id === showConfigForm);
                          
                          if (isProduction) {
                            // Configure delivery partner in production
                            const response = await fetch(`/api/marketplace/delivery-partners/${showConfigForm}/configure`, {
                              method: 'POST',
                              headers: { 
                                'Authorization': `Bearer ${localStorage.getItem('apiKey')}`,
                                'Content-Type': 'application/json'
                              },
                              body: JSON.stringify({
                                partnerId: showConfigForm,
                                partnerName: partner?.name,
                                action: 'configure',
                                configuration: configData[showConfigForm],
                                timestamp: new Date().toISOString()
                              })
                            });
                            
                            if (response.ok) {
                              const result = await response.json();
                              console.log('Partner configured:', result);
                              
                              // Update partner status
                              setPartnerStatus(prev => ({
                                ...prev,
                                [showConfigForm]: 'configured'
                              }));
                              
                              // Update delivery partners list
                              setDeliveryPartners(prev => 
                                prev.map(p => 
                                  p.id === showConfigForm 
                                    ? { ...p, status: 'configured', lastConfigured: new Date().toISOString(), config: configData[showConfigForm] }
                                    : p
                                )
                              );
                              
                              setShowConfigForm(null);
                            } else {
                              throw new Error(`Configuration failed: ${response.status}`);
                            }
                          } else {
                            // Development mode - simulate configuration
                            console.log(`Configuring ${partner?.name}...`);
                            
                            // Simulate API delay
                            await new Promise(resolve => setTimeout(resolve, 1500));
                            
                            // Update status
                            setPartnerStatus(prev => ({
                              ...prev,
                              [showConfigForm]: 'configured'
                            }));
                            
                            // Update delivery partners list
                            setDeliveryPartners(prev => 
                              prev.map(p => 
                                p.id === showConfigForm 
                                  ? { ...p, status: 'configured', lastConfigured: new Date().toISOString(), config: configData[showConfigForm] }
                                  : p
                              )
                            );
                            
                            setShowConfigForm(null);
                          }
                        } catch (error) {
                          console.error('Error configuring partner:', error);
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                    >
                      {isLoading ? 'Saving...' : 'Save Configuration'}
                    </button>
                  </div>
            </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const LoyaltyScreen = ({ user, onLogout }: { 
  user: User, 
  onLogout: () => void
}) => {
  const [activeTab, setActiveTab] = useState('programs');
  const [loyaltyData, setLoyaltyData] = useState<any>(null);
  const [loyaltyPrograms, setLoyaltyPrograms] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Program creation state
  const [showCreateProgram, setShowCreateProgram] = useState(false);
  const [newProgram, setNewProgram] = useState({
    name: '',
    description: '',
    pointsPerRand: 1,
    pointsToRedeem: 100,
    discountPercent: 10,
    validUntil: ''
  });
  
  // Coupon editing state
  const [editingCoupon, setEditingCoupon] = useState<string | null>(null);
  const [couponData, setCouponData] = useState<{[key: string]: any}>({});
  
  // Program management state
  const [managingProgram, setManagingProgram] = useState<string | null>(null);
  const [programManagement, setProgramManagement] = useState<{[key: string]: any}>({});

  // Load loyalty data
  useEffect(() => {
    const loadLoyaltyData = async () => {
      setIsLoading(true);
      try {
        const isProduction = process.env.NODE_ENV === 'production' || 
                             window.location.hostname !== 'localhost';
        
        if (isProduction) {
          const response = await fetch('/api/loyalty/data', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('apiKey')}` }
          });
          if (response.ok) {
            const data = await response.json();
            setLoyaltyData(data);
            setLoyaltyPrograms(data.programs || []);
            setCoupons(data.coupons || []);
          }
        } else {
          // Development mode - mock data
          setLoyaltyData({
            totalCustomers: 1250,
            activeMembers: 890,
            totalPoints: 45600,
            redeemedPoints: 23400
          });
          setLoyaltyPrograms([
            { id: '1', name: 'VIP Membership', points: 1000, discount: 10, members: 156 },
            { id: '2', name: 'Birthday Rewards', points: 500, discount: 15, members: 89 },
            { id: '3', name: 'Referral Program', points: 200, discount: 5, members: 234 }
          ]);
          setCoupons([
            { id: '1', code: 'WELCOME10', discount: 10, type: 'percentage', used: 45, total: 100 },
            { id: '2', code: 'SAVE20', discount: 20, type: 'fixed', used: 23, total: 50 },
            { id: '3', code: 'FREESHIP', discount: 0, type: 'shipping', used: 67, total: 200 }
          ]);
        }
      } catch (error) {
        console.error('Failed to load loyalty data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLoyaltyData();
  }, []);

  return (
    <div className="screen">
      <div className="screen-header">
        <h1>Loyalty & Coupons</h1>
        <button onClick={onLogout} className="logout-btn">Logout</button>
      </div>
      <div className="screen-content">
        {/* Segmented Control */}
        <div className="segmented-control">
          <button
            className={`segment ${activeTab === 'programs' ? 'active' : ''}`}
            onClick={() => setActiveTab('programs')}
          >
            Programs
          </button>
          <button
            className={`segment ${activeTab === 'coupons' ? 'active' : ''}`}
            onClick={() => setActiveTab('coupons')}
          >
            Coupons
          </button>
        </div>

        {activeTab === 'programs' && (
          <div className="content-section">
            <div className="section-header">
              <h2>Loyalty Programs</h2>
              <button 
                className="primary-button"
                onClick={() => setShowCreateProgram(true)}
              >
                Create Program
              </button>
            </div>
            
            <div className="card-list">
              {loyaltyPrograms.map((program) => (
                <div key={program.id} className="card">
                <div className="card-header">
                    <div className="card-title">{program.name}</div>
                    <div className={`badge ${program.status === 'active' ? 'success' : 'warning'}`}>
                      {program.status === 'active' ? 'Active' : 'Inactive'}
                    </div>
                </div>
                <div className="card-content">
                  <div className="info-row">
                    <span className="label">Members:</span>
                      <span className="value">{program.members} customers</span>
                  </div>
                  <div className="info-row">
                      <span className="label">Points Required:</span>
                      <span className="value">{program.points} points</span>
                  </div>
                  <div className="info-row">
                      <span className="label">Discount:</span>
                      <span className="value">{program.discount}% off</span>
                  </div>
                  <div className="info-row">
                      <span className="label">Created:</span>
                      <span className="value">{program.createdDate || 'N/A'}</span>
                  </div>
                </div>
                <div className="card-actions">
                    <button 
                      className="secondary-button"
                      onClick={() => {
                        setManagingProgram(program.id);
                        setProgramManagement({
                          [program.id]: {
                            status: program.status,
                            members: program.members,
                            points: program.points,
                            discount: program.discount,
                            autoEnroll: true,
                            emailNotifications: true,
                            pushNotifications: false
                          }
                        });
                      }}
                    >
                      Manage
                    </button>
                    <button 
                      className="secondary-button"
                      onClick={async () => {
                        try {
                          setIsLoading(true);
                          const isProduction = window.location.hostname !== 'localhost';
                          
                          if (isProduction) {
                            // Get analytics in production
                            const response = await fetch(`/api/loyalty/programs/${program.id}/analytics`, {
                              method: 'GET',
                              headers: { 
                                'Authorization': `Bearer ${localStorage.getItem('apiKey')}`,
                                'Content-Type': 'application/json'
                              }
                            });
                            
                            if (response.ok) {
                              const analytics = await response.json();
                              console.log('Program analytics:', analytics);
                              alert(`📊 ${program.name} Analytics:\n\nPerformance Metrics:\n- Total Members: ${analytics.totalMembers}\n- Active Members: ${analytics.activeMembers}\n- Points Issued: ${analytics.pointsIssued}\n- Points Redeemed: ${analytics.pointsRedeemed}\n- Revenue Generated: R${analytics.revenue}\n- Conversion Rate: ${analytics.conversionRate}%\n- Average Order Value: R${analytics.avgOrderValue}\n\nLast Updated: ${new Date().toLocaleString()}`);
                            }
                          } else {
                            // Development mode - simulate analytics
                            console.log(`Getting analytics for ${program.name}...`);
                            await new Promise(resolve => setTimeout(resolve, 1500));
                            const mockAnalytics = {
                              totalMembers: program.members,
                              activeMembers: Math.floor(program.members * 0.8),
                              pointsIssued: Math.floor(Math.random() * 5000) + 1000,
                              pointsRedeemed: Math.floor(Math.random() * 3000) + 500,
                              revenue: Math.floor(Math.random() * 5000) + 2000,
                              conversionRate: Math.floor(Math.random() * 20) + 10,
                              avgOrderValue: Math.floor(Math.random() * 200) + 100
                            };
                            alert(`📊 ${program.name} Analytics:\n\nPerformance Metrics:\n- Total Members: ${mockAnalytics.totalMembers}\n- Active Members: ${mockAnalytics.activeMembers}\n- Points Issued: ${mockAnalytics.pointsIssued}\n- Points Redeemed: ${mockAnalytics.pointsRedeemed}\n- Revenue Generated: R${mockAnalytics.revenue}\n- Conversion Rate: ${mockAnalytics.conversionRate}%\n- Average Order Value: R${mockAnalytics.avgOrderValue}\n\nLast Updated: ${new Date().toLocaleString()}`);
                          }
                        } catch (error) {
                          console.error('Error getting analytics:', error);
                          alert(`❌ Error getting analytics for ${program.name}:\n${error.message || 'Please try again.'}`);
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                    >
                      {isLoading ? 'Loading...' : 'Analytics'}
                    </button>
                </div>
              </div>
              ))}
            </div>
            
            {showCreateProgram && (
              <div className="loyalty-program-form">
                <div className="form-header">
                  <h3>Create New Loyalty Program</h3>
                  <button 
                    className="close-btn"
                    onClick={() => setShowCreateProgram(false)}
                  >
                    ×
                  </button>
          </div>
                <div className="form-content">
                  <div className="form-section">
                    <h4>Program Details</h4>
                    <div className="form-row">
                      <div className="form-field">
                        <label>Program Name:</label>
                        <input 
                          type="text" 
                          value={newProgram.name}
                          onChange={(e) => setNewProgram(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., VIP Customer Program"
                        />
      </div>
                      <div className="form-field">
                        <label>Description:</label>
                        <input 
                          type="text" 
                          value={newProgram.description}
                          onChange={(e) => setNewProgram(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Program description"
                        />
    </div>
    </div>
                    <div className="form-row">
                      <div className="form-field">
                        <label>Points per Rand:</label>
                        <input 
                          type="number" 
                          value={newProgram.pointsPerRand}
                          onChange={(e) => setNewProgram(prev => ({ ...prev, pointsPerRand: parseInt(e.target.value) }))}
                          placeholder="1"
                        />
            </div>
                      <div className="form-field">
                        <label>Points to Redeem:</label>
                        <input 
                          type="number" 
                          value={newProgram.pointsToRedeem}
                          onChange={(e) => setNewProgram(prev => ({ ...prev, pointsToRedeem: parseInt(e.target.value) }))}
                          placeholder="100"
                        />
              </div>
            </div>
                    <div className="form-row">
                      <div className="form-field">
                        <label>Discount Percentage:</label>
                        <input 
                          type="number" 
                          value={newProgram.discountPercent}
                          onChange={(e) => setNewProgram(prev => ({ ...prev, discountPercent: parseInt(e.target.value) }))}
                          placeholder="10"
                        />
          </div>
                      <div className="form-field">
                        <label>Valid Until:</label>
                        <input 
                          type="date" 
                          value={newProgram.validUntil}
                          onChange={(e) => setNewProgram(prev => ({ ...prev, validUntil: e.target.value }))}
                        />
      </div>
    </div>
  </div>
                  
                  <div className="form-actions">
                    <button 
                      className="secondary-button"
                      onClick={() => setShowCreateProgram(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="primary-button"
                      onClick={async () => {
                        try {
                          setIsLoading(true);
                          const isProduction = window.location.hostname !== 'localhost';
                          
                          if (isProduction) {
                            // Create program in production
                            const response = await fetch('/api/loyalty/programs/create', {
                              method: 'POST',
                              headers: { 
                                'Authorization': `Bearer ${localStorage.getItem('apiKey')}`,
                                'Content-Type': 'application/json'
                              },
                              body: JSON.stringify({
                                ...newProgram,
                                timestamp: new Date().toISOString()
                              })
                            });
                            
                            if (response.ok) {
                              const result = await response.json();
                              console.log('Program created:', result);
                              
                              // Add to programs list
                              setLoyaltyPrograms(prev => [...prev, {
                                id: result.id,
                                name: newProgram.name,
                                points: newProgram.pointsToRedeem,
                                discount: newProgram.discountPercent,
                                members: 0,
                                status: 'active',
                                createdDate: new Date().toISOString().split('T')[0]
                              }]);
                              
                              setShowCreateProgram(false);
                              setNewProgram({
                                name: '',
                                description: '',
                                pointsPerRand: 1,
                                pointsToRedeem: 100,
                                discountPercent: 10,
                                validUntil: ''
                              });
                            }
                          } else {
                            // Development mode - simulate creation
                            console.log('Creating new program...');
                            await new Promise(resolve => setTimeout(resolve, 2000));
                            
                            // Add to programs list
                            setLoyaltyPrograms(prev => [...prev, {
                              id: `program-${Date.now()}`,
                              name: newProgram.name,
                              points: newProgram.pointsToRedeem,
                              discount: newProgram.discountPercent,
                              members: 0,
                              status: 'active',
                              createdDate: new Date().toISOString().split('T')[0]
                            }]);
                            
                            setShowCreateProgram(false);
                            setNewProgram({
                              name: '',
                              description: '',
                              pointsPerRand: 1,
                              pointsToRedeem: 100,
                              discountPercent: 10,
                              validUntil: ''
                            });
                          }
                        } catch (error) {
                          console.error('Error creating program:', error);
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                    >
                      {isLoading ? 'Creating...' : 'Create Program'}
                    </button>
      </div>
          </div>
          </div>
            )}
            
            {managingProgram && (
              <div className="program-management-form">
                <div className="form-header">
                  <h3>Manage Program: {loyaltyPrograms.find(p => p.id === managingProgram)?.name}</h3>
                  <button 
                    className="close-btn"
                    onClick={() => setManagingProgram(null)}
                  >
                    ×
                  </button>
              </div>
                <div className="form-content">
                  <div className="form-section">
                    <h4>Program Settings</h4>
                    <div className="form-row">
                      <div className="form-field">
                        <label>Program Status:</label>
                        <select 
                          value={programManagement[managingProgram]?.status || 'active'}
                          onChange={(e) => setProgramManagement(prev => ({
                            ...prev,
                            [managingProgram]: {
                              ...prev[managingProgram],
                              status: e.target.value
                            }
                          }))}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="paused">Paused</option>
                        </select>
            </div>
                      <div className="form-field">
                        <label>Points Required:</label>
                        <input 
                          type="number" 
                          value={programManagement[managingProgram]?.points || ''}
                          onChange={(e) => setProgramManagement(prev => ({
                            ...prev,
                            [managingProgram]: {
                              ...prev[managingProgram],
                              points: parseInt(e.target.value)
                            }
                          }))}
                          placeholder="100"
                        />
        </div>
      </div>
                    <div className="form-row">
                      <div className="form-field">
                        <label>Discount Percentage:</label>
                        <input 
                          type="number" 
                          value={programManagement[managingProgram]?.discount || ''}
                          onChange={(e) => setProgramManagement(prev => ({
                            ...prev,
                            [managingProgram]: {
                              ...prev[managingProgram],
                              discount: parseInt(e.target.value)
                            }
                          }))}
                          placeholder="10"
                        />
    </div>
                      <div className="form-field">
                        <label>Member Count:</label>
              <input 
                          type="number" 
                          value={programManagement[managingProgram]?.members || ''}
                          onChange={(e) => setProgramManagement(prev => ({
                            ...prev,
                            [managingProgram]: {
                              ...prev[managingProgram],
                              members: parseInt(e.target.value)
                            }
                          }))}
                          placeholder="0"
                          readOnly
              />
            </div>
                    </div>
                  </div>
                  
                  <div className="form-section">
                    <h4>Notification Settings</h4>
                    <div className="form-row">
                      <div className="form-field">
                        <label>
              <input 
                type="checkbox" 
                            checked={programManagement[managingProgram]?.autoEnroll || false}
                            onChange={(e) => setProgramManagement(prev => ({
                              ...prev,
                              [managingProgram]: {
                                ...prev[managingProgram],
                                autoEnroll: e.target.checked
                              }
                            }))}
                          />
                          Auto Enroll New Customers
                        </label>
            </div>
                      <div className="form-field">
                        <label>
              <input 
                type="checkbox" 
                            checked={programManagement[managingProgram]?.emailNotifications || false}
                            onChange={(e) => setProgramManagement(prev => ({
                              ...prev,
                              [managingProgram]: {
                                ...prev[managingProgram],
                                emailNotifications: e.target.checked
                              }
                            }))}
                          />
                          Email Notifications
                        </label>
            </div>
            </div>
                    <div className="form-row">
                      <div className="form-field">
                        <label>
              <input 
                            type="checkbox" 
                            checked={programManagement[managingProgram]?.pushNotifications || false}
                            onChange={(e) => setProgramManagement(prev => ({
                              ...prev,
                              [managingProgram]: {
                                ...prev[managingProgram],
                                pushNotifications: e.target.checked
                              }
                            }))}
                          />
                          Push Notifications
                        </label>
            </div>
          </div>
        </div>

                  <div className="form-actions">
                    <button 
                      className="secondary-button"
                      onClick={() => setManagingProgram(null)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="primary-button"
                      onClick={async () => {
                        try {
                          setIsLoading(true);
                          const isProduction = window.location.hostname !== 'localhost';
                          const program = loyaltyPrograms.find(p => p.id === managingProgram);
                          
                          if (isProduction) {
                            // Manage program in production
                            const response = await fetch(`/api/loyalty/programs/${managingProgram}/manage`, {
                              method: 'POST',
                              headers: { 
                                'Authorization': `Bearer ${localStorage.getItem('apiKey')}`,
                                'Content-Type': 'application/json'
                              },
                              body: JSON.stringify({
                                ...programManagement[managingProgram],
                                programId: managingProgram,
                                programName: program?.name,
                                timestamp: new Date().toISOString()
                              })
                            });
                            
                            if (response.ok) {
                              const result = await response.json();
                              console.log('Program managed:', result);
                              
                              // Update programs list
                              setLoyaltyPrograms(prev => 
                                prev.map(p => 
                                  p.id === managingProgram 
                                    ? { ...p, ...programManagement[managingProgram] }
                                    : p
                                )
                              );
                              
                              setManagingProgram(null);
                            }
                          } else {
                            // Development mode - simulate management
                            console.log(`Managing ${program?.name}...`);
                            await new Promise(resolve => setTimeout(resolve, 1500));
                            
                            // Update programs list
                            setLoyaltyPrograms(prev => 
                              prev.map(p => 
                                p.id === managingProgram 
                                  ? { ...p, ...programManagement[managingProgram] }
                                  : p
                              )
                            );
                            
                            setManagingProgram(null);
                          }
                        } catch (error) {
                          console.error('Error managing program:', error);
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                    >
                      {isLoading ? 'Saving...' : 'Save Management Settings'}
                    </button>
            </div>
          </div>
            </div>
            )}
          </div>
        )}

        {activeTab === 'coupons' && (
          <div className="content-section">
            <div className="section-header">
              <h2>Coupons & Discounts</h2>
              <button className="primary-button">Create Coupon</button>
          </div>
          
            <div className="card-list">
              {coupons.map((coupon) => (
                <div key={coupon.id} className="card">
                  <div className="card-header">
                    <div className="card-title">{coupon.discount}% Off Coupon</div>
                    <div className={`badge ${coupon.status === 'active' ? 'success' : 'warning'}`}>
                      {coupon.status === 'active' ? 'Active' : 'Inactive'}
            </div>
          </div>
                  <div className="card-content">
                    <div className="info-row">
                      <span className="label">Code:</span>
                      <span className="value">{coupon.code}</span>
            </div>
                    <div className="info-row">
                      <span className="label">Uses:</span>
                      <span className="value">{coupon.uses}/{coupon.maxUses}</span>
          </div>
                    <div className="info-row">
                      <span className="label">Valid Until:</span>
                      <span className="value">{coupon.validUntil}</span>
            </div>
                    <div className="info-row">
                      <span className="label">Type:</span>
                      <span className="value">{coupon.type || 'percentage'}</span>
          </div>
                  </div>
                  <div className="card-actions">
                    <button 
                      className="secondary-button"
                      onClick={() => {
                        setEditingCoupon(coupon.id);
                        setCouponData({
                          [coupon.id]: {
                            code: coupon.code,
                            discount: coupon.discount,
                            maxUses: coupon.maxUses,
                            validUntil: coupon.validUntil,
                            type: coupon.type || 'percentage'
                          }
                        });
                      }}
                    >
                      Edit
                    </button>
                    <button 
                      className="secondary-button"
                      onClick={async () => {
                        try {
                          const isProduction = window.location.hostname !== 'localhost';
                          
                          if (isProduction) {
                            // Share coupon in production
                            const response = await fetch(`/api/loyalty/coupons/${coupon.id}/share`, {
                              method: 'POST',
                              headers: { 
                                'Authorization': `Bearer ${localStorage.getItem('apiKey')}`,
                                'Content-Type': 'application/json'
                              },
                              body: JSON.stringify({
                                couponId: coupon.id,
                                action: 'share',
                                timestamp: new Date().toISOString()
                              })
                            });
                            
                            if (response.ok) {
                              const result = await response.json();
                              console.log('Coupon shared:', result);
                              
                              // Copy share URL to clipboard
                              await navigator.clipboard.writeText(result.shareUrl);
                              alert(`✅ ${coupon.code} coupon shared successfully!\n\nShare URL copied to clipboard:\n${result.shareUrl}\n\nShare Details:\n- Code: ${coupon.code}\n- Discount: ${coupon.discount}%\n- Valid Until: ${coupon.validUntil}\n- Remaining Uses: ${coupon.maxUses - coupon.uses}`);
                            }
                          } else {
                            // Development mode - simulate sharing
                            console.log(`Sharing ${coupon.code}...`);
                            
                            const shareUrl = `https://storefront.Thenga.co.za/coupon/${coupon.code}`;
                            await navigator.clipboard.writeText(shareUrl);
                            
                            alert(`✅ ${coupon.code} coupon shared successfully!\n\nShare URL copied to clipboard:\n${shareUrl}\n\nShare Details:\n- Code: ${coupon.code}\n- Discount: ${coupon.discount}%\n- Valid Until: ${coupon.validUntil}\n- Remaining Uses: ${coupon.maxUses - coupon.uses}\n- Share URL: ${shareUrl}`);
                          }
                        } catch (error) {
                          console.error('Error sharing coupon:', error);
                          alert(`❌ Error sharing ${coupon.code}:\n${error.message || 'Please try again.'}`);
                        }
                      }}
                    >
                      Share
                    </button>
            </div>
          </div>
              ))}
        </div>

            {editingCoupon && (
              <div className="coupon-edit-form">
                <div className="form-header">
                  <h3>Edit Coupon: {coupons.find(c => c.id === editingCoupon)?.code}</h3>
                  <button 
                    className="close-btn"
                    onClick={() => setEditingCoupon(null)}
                  >
                    ×
                  </button>
            </div>
                <div className="form-content">
                  <div className="form-section">
                    <h4>Coupon Settings</h4>
                    <div className="form-row">
                      <div className="form-field">
                        <label>Coupon Code:</label>
                        <input 
                          type="text" 
                          value={couponData[editingCoupon]?.code || ''}
                          onChange={(e) => setCouponData(prev => ({
                            ...prev,
                            [editingCoupon]: {
                              ...prev[editingCoupon],
                              code: e.target.value
                            }
                          }))}
                          placeholder="e.g., SAVE10"
                        />
            </div>
                      <div className="form-field">
                        <label>Discount (%):</label>
                        <input 
                          type="number" 
                          value={couponData[editingCoupon]?.discount || ''}
                          onChange={(e) => setCouponData(prev => ({
                            ...prev,
                            [editingCoupon]: {
                              ...prev[editingCoupon],
                              discount: parseInt(e.target.value)
                            }
                          }))}
                          placeholder="10"
                        />
            </div>
          </div>
                    <div className="form-row">
                      <div className="form-field">
                        <label>Max Uses:</label>
                        <input 
                          type="number" 
                          value={couponData[editingCoupon]?.maxUses || ''}
                          onChange={(e) => setCouponData(prev => ({
                            ...prev,
                            [editingCoupon]: {
                              ...prev[editingCoupon],
                              maxUses: parseInt(e.target.value)
                            }
                          }))}
                          placeholder="100"
                        />
                      </div>
                      <div className="form-field">
                        <label>Valid Until:</label>
                        <input 
                          type="date" 
                          value={couponData[editingCoupon]?.validUntil || ''}
                          onChange={(e) => setCouponData(prev => ({
                            ...prev,
                            [editingCoupon]: {
                              ...prev[editingCoupon],
                              validUntil: e.target.value
                            }
                          }))}
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-field">
                        <label>Coupon Type:</label>
                        <select 
                          value={couponData[editingCoupon]?.type || 'percentage'}
                          onChange={(e) => setCouponData(prev => ({
                            ...prev,
                            [editingCoupon]: {
                              ...prev[editingCoupon],
                              type: e.target.value
                            }
                          }))}
                        >
                          <option value="percentage">Percentage</option>
                          <option value="fixed">Fixed Amount</option>
                          <option value="shipping">Free Shipping</option>
                        </select>
                      </div>
        </div>
      </div>

                  <div className="form-actions">
                    <button 
                      className="secondary-button"
                      onClick={() => setEditingCoupon(null)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="primary-button"
                      onClick={async () => {
                        try {
                          setIsLoading(true);
                          const isProduction = window.location.hostname !== 'localhost';
                          
                          if (isProduction) {
                            // Update coupon in production
                            const response = await fetch(`/api/loyalty/coupons/${editingCoupon}/update`, {
                              method: 'PUT',
                              headers: { 
                                'Authorization': `Bearer ${localStorage.getItem('apiKey')}`,
                                'Content-Type': 'application/json'
                              },
                              body: JSON.stringify({
                                ...couponData[editingCoupon],
                                timestamp: new Date().toISOString()
                              })
                            });
                            
                            if (response.ok) {
                              const result = await response.json();
                              console.log('Coupon updated:', result);
                              
                              // Update coupons list
                              setCoupons(prev => 
                                prev.map(c => 
                                  c.id === editingCoupon 
                                    ? { ...c, ...couponData[editingCoupon] }
                                    : c
                                )
                              );
                              
                              setEditingCoupon(null);
                            }
                          } else {
                            // Development mode - simulate update
                            console.log('Updating coupon...');
                            await new Promise(resolve => setTimeout(resolve, 1500));
                            
                            // Update coupons list
                            setCoupons(prev => 
                              prev.map(c => 
                                c.id === editingCoupon 
                                  ? { ...c, ...couponData[editingCoupon] }
                                  : c
                              )
                            );
                            
                            setEditingCoupon(null);
                          }
                        } catch (error) {
                          console.error('Error updating coupon:', error);
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};





export default App;