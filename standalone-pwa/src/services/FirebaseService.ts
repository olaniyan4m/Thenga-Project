// Firebase Service for Data Persistence
// Handles both business and customer data storage

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, updateDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

// Firebase configuration for Thenga project
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDJUj26kbMpY3CQRtDFIZYgzmD7_s5kjEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "Thenga.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "Thenga",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "Thenga.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "130842827895",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:130842827895:web:260084e690afd77828fa72",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-XFEGWTMEKJ"
};

// Initialize Firebase with error handling
let app: any;
let db: any;
let auth: any;

try {
  // Check if Firebase app already exists
  const existingApps = getApps();
  if (existingApps.length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = existingApps[0];
  }
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.warn('Firebase initialization error:', error);
  // Fallback to mock services for development
  app = null;
  db = null;
  auth = null;
}

// Types
export interface BusinessData {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  logo: string;
  description: string;
  address: string;
  hours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  deliveryFee: number;
  minimumOrder: number;
  isOpen: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderData {
  id: string;
  businessId: string;
  customerId: string;
  orderNumber: string;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  paymentMethod: 'card' | 'cash' | 'eft';
  paymentStatus: 'pending' | 'paid' | 'failed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

class FirebaseService {
  // Business Data Management
  async saveBusinessData(businessData: BusinessData): Promise<void> {
    try {
      if (!db) {
        console.warn('Firebase not initialized, saving to localStorage instead');
        localStorage.setItem('business-data', JSON.stringify(businessData));
        return;
      }
      
      await setDoc(doc(db, 'businesses', businessData.id), {
        ...businessData,
        updatedAt: new Date().toISOString()
      });
      console.log('Business data saved to Firebase');
    } catch (error) {
      console.error('Error saving business data:', error);
      // Fallback to localStorage if Firebase fails
      console.warn('Falling back to localStorage for business data');
      localStorage.setItem('business-data', JSON.stringify(businessData));
    }
  }

  async getBusinessData(businessId: string): Promise<BusinessData | null> {
    try {
      if (!db) {
        console.warn('Firebase not initialized, checking localStorage instead');
        const localData = localStorage.getItem('business-data');
        return localData ? JSON.parse(localData) : null;
      }
      
      const docRef = doc(db, 'businesses', businessId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as BusinessData;
      } else {
        console.log('No business data found');
        return null;
      }
    } catch (error) {
      console.error('Error getting business data:', error);
      // Fallback to localStorage
      const localData = localStorage.getItem('business-data');
      return localData ? JSON.parse(localData) : null;
    }
  }

  // Customer Data Management
  async saveCustomerData(customerData: CustomerData): Promise<void> {
    try {
      await setDoc(doc(db, 'customers', customerData.id), {
        ...customerData,
        updatedAt: new Date().toISOString()
      });
      console.log('Customer data saved to Firebase');
    } catch (error) {
      console.error('Error saving customer data:', error);
      throw error;
    }
  }

  async getCustomerData(customerId: string): Promise<CustomerData | null> {
    try {
      const docRef = doc(db, 'customers', customerId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as CustomerData;
      } else {
        console.log('No customer data found');
        return null;
      }
    } catch (error) {
      console.error('Error getting customer data:', error);
      throw error;
    }
  }

  // Find customer by phone number
  async getCustomerByPhone(_phone: string): Promise<CustomerData | null> {
    try {
      // In a real app, you'd use a query here
      // For now, we'll use localStorage as fallback
      const localData = localStorage.getItem('customer-info');
      if (localData) {
        const customerData = JSON.parse(localData);
        return {
          id: `customer_${Date.now()}`,
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting customer by phone:', error);
      return null;
    }
  }

  // Order Management
  async saveOrder(orderData: OrderData): Promise<void> {
    try {
      await addDoc(collection(db, 'orders'), {
        ...orderData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log('Order saved to Firebase');
    } catch (error) {
      console.error('Error saving order:', error);
      throw error;
    }
  }

  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status,
        updatedAt: new Date().toISOString()
      });
      console.log('Order status updated in Firebase');
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  // Authentication
  async createBusinessAccount(email: string, password: string, businessData: Partial<BusinessData>): Promise<string> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const businessId = userCredential.user.uid;
      
      // Save business data
      await this.saveBusinessData({
        id: businessId,
        businessName: businessData.businessName || '',
        ownerName: businessData.ownerName || '',
        email,
        phone: businessData.phone || '',
        logo: businessData.logo || '',
        description: businessData.description || '',
        address: businessData.address || '',
        hours: businessData.hours || {
          monday: { open: '08:00', close: '18:00', closed: false },
          tuesday: { open: '08:00', close: '18:00', closed: false },
          wednesday: { open: '08:00', close: '18:00', closed: false },
          thursday: { open: '08:00', close: '18:00', closed: false },
          friday: { open: '08:00', close: '20:00', closed: false },
          saturday: { open: '09:00', close: '20:00', closed: false },
          sunday: { open: '10:00', close: '16:00', closed: false }
        },
        deliveryFee: businessData.deliveryFee || 25,
        minimumOrder: businessData.minimumOrder || 50,
        isOpen: businessData.isOpen || true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      return businessId;
    } catch (error) {
      console.error('Error creating business account:', error);
      throw error;
    }
  }

  async signInBusiness(email: string, password: string): Promise<string> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user.uid;
    } catch (error) {
      console.error('Error signing in business:', error);
      throw error;
    }
  }

  async signOutBusiness(): Promise<void> {
    try {
      await signOut(auth);
      console.log('Business signed out');
    } catch (error) {
      console.error('Error signing out business:', error);
      throw error;
    }
  }

  // Save payment record to Firestore
  async savePaymentRecord(data: any): Promise<void> {
    try {
      await setDoc(doc(db, 'payments', data.id), data, { merge: true });
      console.log('Payment record saved to Firestore:', data.id);
    } catch (e) {
      console.error('Error saving payment record:', e);
      throw e;
    }
  }
}

// Export singleton instance
export const firebaseService = new FirebaseService();
