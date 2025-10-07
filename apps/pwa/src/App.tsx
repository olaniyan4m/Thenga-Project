import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from './store/AuthContext';
import { useOffline } from './store/OfflineContext';
import { LoadingScreen } from './screens/LoadingScreen';
import { LoginScreen } from './screens/auth/LoginScreen';
import { RegisterScreen } from './screens/auth/RegisterScreen';
import { CustomerDashboardScreen } from './screens/CustomerDashboardScreen';
import { CustomerProductsScreen } from './screens/CustomerProductsScreen';
import { CustomerOrdersScreen } from './screens/CustomerOrdersScreen';
import { CustomerPaymentsScreen } from './screens/CustomerPaymentsScreen';
import { CustomerSettingsScreen } from './screens/CustomerSettingsScreen';
import { OfflineIndicator } from './components/OfflineIndicator';
import { CustomerBottomNavigation } from './components/CustomerBottomNavigation';

const App: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { isOnline } = useOffline();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="app-container">
      {!isOnline && <OfflineIndicator />}
      
      <AnimatePresence mode="wait">
        <Routes>
          {user ? (
            <>
              <Route path="/" element={<CustomerDashboardScreen />} />
              <Route path="/products" element={<CustomerProductsScreen />} />
              <Route path="/orders" element={<CustomerOrdersScreen />} />
              <Route path="/payments" element={<CustomerPaymentsScreen />} />
              <Route path="/settings" element={<CustomerSettingsScreen />} />
            </>
          ) : (
            <>
              <Route path="/" element={<LoginScreen />} />
              <Route path="/register" element={<RegisterScreen />} />
            </>
          )}
        </Routes>
      </AnimatePresence>
      
      {user && <CustomerBottomNavigation />}
    </div>
  );
};

export default App;