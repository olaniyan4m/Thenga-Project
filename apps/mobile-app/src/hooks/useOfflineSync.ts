import { useState, useEffect } from 'react';
import NetInfo from '@react-native-netinfo/netinfo';
import SQLite from 'react-native-sqlite-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SyncItem {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  retries: number;
}

interface OfflineSyncHook {
  isOnline: boolean;
  syncQueue: SyncItem[];
  addToSyncQueue: (item: Omit<SyncItem, 'id' | 'timestamp' | 'retries'>) => Promise<void>;
  processSyncQueue: () => Promise<void>;
  getCachedData: (key: string) => Promise<any>;
  setCachedData: (key: string, data: any, ttl?: number) => Promise<void>;
}

// Initialize SQLite database
SQLite.DEBUG = __DEV__;
SQLite.enablePromise(true);

const getDBConnection = async () => {
  return SQLite.openDatabase({
    name: 'PezelaDB.db',
    location: 'default',
  });
};

export const useOfflineSync = (): OfflineSyncHook => {
  const [isOnline, setIsOnline] = useState(true);
  const [syncQueue, setSyncQueue] = useState<SyncItem[]>([]);
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);

  // Initialize database
  useEffect(() => {
    const initDB = async () => {
      try {
        const database = await getDBConnection();
        
        // Create tables if they don't exist
        await database.executeSql(`
          CREATE TABLE IF NOT EXISTS sync_queue (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            data TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            retries INTEGER DEFAULT 0
          )
        `);

        await database.executeSql(`
          CREATE TABLE IF NOT EXISTS cache (
            key TEXT PRIMARY KEY,
            data TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            expires_at INTEGER
          )
        `);

        setDb(database);
        
        // Load existing sync queue
        const [results] = await database.executeSql(
          'SELECT * FROM sync_queue ORDER BY timestamp ASC'
        );
        
        const queue: SyncItem[] = [];
        for (let i = 0; i < results.rows.length; i++) {
          const row = results.rows.item(i);
          queue.push({
            id: row.id.toString(),
            type: row.type,
            data: JSON.parse(row.data),
            timestamp: row.timestamp,
            retries: row.retries,
          });
        }
        
        setSyncQueue(queue);
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };

    initDB();
  }, []);

  // Monitor network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected && state.isInternetReachable;
      setIsOnline(!!online);
      
      if (online && syncQueue.length > 0) {
        processSyncQueue();
      }
    });

    return () => unsubscribe();
  }, [syncQueue.length]);

  // Process sync queue when online
  const processSyncQueue = async () => {
    if (!isOnline || !db || syncQueue.length === 0) return;

    const queue = [...syncQueue];
    const processedItems: string[] = [];

    for (const item of queue) {
      try {
        await syncItem(item);
        processedItems.push(item.id);
      } catch (error) {
        console.error(`Failed to sync item ${item.id}:`, error);
        
        // Increment retry count
        const newRetries = item.retries + 1;
        if (newRetries < 3) {
          // Update retry count in database
          await db.executeSql(
            'UPDATE sync_queue SET retries = ? WHERE id = ?',
            [newRetries, item.id]
          );
        } else {
          // Remove item after max retries
          processedItems.push(item.id);
        }
      }
    }

    // Remove processed items from database and state
    if (processedItems.length > 0) {
      for (const id of processedItems) {
        await db.executeSql('DELETE FROM sync_queue WHERE id = ?', [id]);
      }
      
      // Update local state
      const [results] = await db.executeSql(
        'SELECT * FROM sync_queue ORDER BY timestamp ASC'
      );
      
      const updatedQueue: SyncItem[] = [];
      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i);
        updatedQueue.push({
          id: row.id.toString(),
          type: row.type,
          data: JSON.parse(row.data),
          timestamp: row.timestamp,
          retries: row.retries,
        });
      }
      
      setSyncQueue(updatedQueue);
    }
  };

  // Sync individual item
  const syncItem = async (item: SyncItem) => {
    const { type, data } = item;
    const token = await AsyncStorage.getItem('accessToken');

    const baseUrl = await AsyncStorage.getItem('apiBaseUrl') || 'https://api.pezela.co.za';

    switch (type) {
      case 'order':
        await fetch(`${baseUrl}/api/orders`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        break;
      
      case 'product':
        await fetch(`${baseUrl}/api/products`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        break;
      
      case 'payment':
        await fetch(`${baseUrl}/api/payments`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        break;
      
      default:
        throw new Error(`Unknown sync type: ${type}`);
    }
  };

  // Add item to sync queue
  const addToSyncQueue = async (item: Omit<SyncItem, 'id' | 'timestamp' | 'retries'>) => {
    if (!db) return;

    const syncItem: SyncItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: Date.now(),
      retries: 0,
    };

    await db.executeSql(
      'INSERT INTO sync_queue (type, data, timestamp, retries) VALUES (?, ?, ?, ?)',
      [syncItem.type, JSON.stringify(syncItem.data), syncItem.timestamp, syncItem.retries]
    );

    // Update local state
    setSyncQueue(prev => [...prev, syncItem]);

    // Try to sync immediately if online
    if (isOnline) {
      try {
        await syncItem(syncItem);
        await db.executeSql('DELETE FROM sync_queue WHERE id = ?', [syncItem.id]);
        
        setSyncQueue(prev => prev.filter(item => item.id !== syncItem.id));
      } catch (error) {
        console.error('Failed to sync item immediately:', error);
      }
    }
  };

  // Get cached data
  const getCachedData = async (key: string): Promise<any> => {
    if (!db) return null;

    try {
      const [results] = await db.executeSql(
        'SELECT * FROM cache WHERE key = ?',
        [key]
      );

      if (results.rows.length === 0) return null;

      const row = results.rows.item(0);
      
      // Check if data has expired
      if (row.expires_at && Date.now() > row.expires_at) {
        await db.executeSql('DELETE FROM cache WHERE key = ?', [key]);
        return null;
      }
      
      return JSON.parse(row.data);
    } catch (error) {
      console.error('Failed to get cached data:', error);
      return null;
    }
  };

  // Set cached data
  const setCachedData = async (key: string, data: any, ttl?: number): Promise<void> => {
    if (!db) return;

    try {
      const expiresAt = ttl ? Date.now() + ttl : null;
      
      await db.executeSql(
        'INSERT OR REPLACE INTO cache (key, data, timestamp, expires_at) VALUES (?, ?, ?, ?)',
        [key, JSON.stringify(data), Date.now(), expiresAt]
      );
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  };

  return {
    isOnline,
    syncQueue,
    addToSyncQueue,
    processSyncQueue,
    getCachedData,
    setCachedData,
  };
};
