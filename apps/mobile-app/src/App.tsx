import React, { useEffect } from 'react';
import { StatusBar, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import NetInfo from '@react-native-netinfo/netinfo';

import { AppNavigator } from './navigation/AppNavigator';
import { AuthProvider } from './store/AuthContext';
import { theme } from './utils/theme';
import { toastConfig } from './utils/toastConfig';
import { useOfflineSync } from './hooks/useOfflineSync';

const App: React.FC = () => {
  const { initializeOfflineSync } = useOfflineSync();

  useEffect(() => {
    // Initialize offline sync
    initializeOfflineSync();
    
    // Set up network monitoring
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log('Network state:', state);
    });

    return () => unsubscribe();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <AuthProvider>
            <NavigationContainer>
              <StatusBar
                barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
                backgroundColor={theme.colors.primary}
              />
              <AppNavigator />
              <Toast config={toastConfig} />
            </NavigationContainer>
          </AuthProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
