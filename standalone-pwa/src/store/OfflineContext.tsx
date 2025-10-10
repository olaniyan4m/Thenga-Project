import React, { createContext, useContext, useEffect, useState } from 'react';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface OfflineContextType {
  isOnline: boolean;
  syncQueue: any[];
  addToSyncQueue: (item: any) => void;
  processSyncQueue: () => Promise<void>;
  getCachedData: (key: string) => Promise<any>;
  setCachedData: (key: string, data: any) => Promise<void>;
}

interface ThengaDB extends DBSchema {
  cache: {
    key: string;
    value: {
      data: any;
      timestamp: number;
      expiresAt?: number;
    };
  };
  syncQueue: {
    key: string;
    value: {
      id: string;
      type: string;
      data: any;
      timestamp: number;
      retries: number;
    };
  };
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncQueue, setSyncQueue] = useState<any[]>([]);
  const [db, setDb] = useState<IDBPDatabase<ThengaDB> | null>(null);

  // Initialize IndexedDB
  useEffect(() => {
    const initDB = async () => {
      try {
        const database = await openDB<ThengaDB>('ThengaDB', 1, {
          upgrade(db) {
            // Cache store for offline data
            if (!db.objectStoreNames.contains('cache')) {
              const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
              cacheStore.createIndex('timestamp', 'timestamp');
            }
            
            // Sync queue for pending operations
            if (!db.objectStoreNames.contains('syncQueue')) {
              const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
              syncStore.createIndex('timestamp', 'timestamp');
              syncStore.createIndex('type', 'type');
            }
          },
        });
        setDb(database);
        
        // Load existing sync queue
        const queue = await database.getAll('syncQueue');
        setSyncQueue(queue);
      } catch (error) {
        console.error('Failed to initialize IndexedDB:', error);
      }
    };

    initDB();
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      processSyncQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [db]);

  // Process sync queue when online
  const processSyncQueue = async () => {
    if (!isOnline || !db || syncQueue.length === 0) return;

    const queue = [...syncQueue];
    const processedItems = [];

    for (const item of queue) {
      try {
        await syncItem(item);
        processedItems.push(item.id);
      } catch (error) {
        console.error(`Failed to sync item ${item.id}:`, error);
        
        // Increment retry count
        item.retries += 1;
        if (item.retries < 3) {
          // Update item in queue with new retry count
          await db.put('syncQueue', item);
        } else {
          // Remove item after max retries
          processedItems.push(item.id);
        }
      }
    }

    // Remove processed items from queue
    if (processedItems.length > 0) {
      for (const id of processedItems) {
        await db.delete('syncQueue', id);
      }
      
      // Update local state
      const remainingQueue = await db.getAll('syncQueue');
      setSyncQueue(remainingQueue);
    }
  };

  // Sync individual item
  const syncItem = async (item: any) => {
    const { type, data } = item;

    switch (type) {
      case 'order':
        await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        break;
      
      case 'product':
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        break;
      
      case 'payment':
        await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        break;
      
      default:
        throw new Error(`Unknown sync type: ${type}`);
    }
  };

  // Add item to sync queue
  const addToSyncQueue = async (item: any) => {
    if (!db) return;

    const syncItem = {
      type: item.type,
      data: item.data,
      timestamp: Date.now(),
      retries: 0,
    };

    await db.add('syncQueue', syncItem);
    
    // Update local state
    const updatedQueue = await db.getAll('syncQueue');
    setSyncQueue(updatedQueue);

    // Try to sync immediately if online
    if (isOnline) {
      try {
        await syncItem(syncItem);
        await db.delete('syncQueue', syncItem.id);
        
        const remainingQueue = await db.getAll('syncQueue');
        setSyncQueue(remainingQueue);
      } catch (error) {
        console.error('Failed to sync item immediately:', error);
      }
    }
  };

  // Get cached data
  const getCachedData = async (key: string): Promise<any> => {
    if (!db) return null;

    try {
      const cached = await db.get('cache', key);
      
      if (!cached) return null;
      
      // Check if data has expired
      if (cached.expiresAt && Date.now() > cached.expiresAt) {
        await db.delete('cache', key);
        return null;
      }
      
      return cached.data;
    } catch (error) {
      console.error('Failed to get cached data:', error);
      return null;
    }
  };

  // Set cached data
  const setCachedData = async (key: string, data: any, ttl?: number): Promise<void> => {
    if (!db) return;

    try {
      const cacheItem = {
        key,
        data,
        timestamp: Date.now(),
        expiresAt: ttl ? Date.now() + ttl : undefined,
      };
      
      await db.put('cache', cacheItem);
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  };

  const value: OfflineContextType = {
    isOnline,
    syncQueue,
    addToSyncQueue,
    processSyncQueue,
    getCachedData,
    setCachedData,
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};
