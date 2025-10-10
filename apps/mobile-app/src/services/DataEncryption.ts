// 🔐 Thenga Data Encryption Service
// Comprehensive data encryption and secure storage

import AsyncStorage from '@react-native-async-storage/async-storage';
import Keychain from 'react-native-keychain';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';
import CryptoJS from 'crypto-js';

// Encryption configuration
const ENCRYPTION_CONFIG = {
  ALGORITHM: 'AES-256-GCM',
  KEY_SIZE: 256,
  IV_SIZE: 16,
  TAG_SIZE: 16,
  ITERATIONS: 10000,
  SALT_SIZE: 32,
  HASH_ALGORITHM: 'SHA-256',
  KEY_DERIVATION: 'PBKDF2',
};

// Data classification levels
export enum DataClassification {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted',
}

// Encryption keys for different data types
const ENCRYPTION_KEYS = {
  USER_DATA: 'user_data_encryption_key',
  PAYMENT_DATA: 'payment_data_encryption_key',
  BUSINESS_DATA: 'business_data_encryption_key',
  AUDIT_DATA: 'audit_data_encryption_key',
  SYSTEM_DATA: 'system_data_encryption_key',
};

export interface EncryptedData {
  data: string;
  iv: string;
  tag: string;
  algorithm: string;
  keyId: string;
  timestamp: Date;
  classification: DataClassification;
}

export interface EncryptionKey {
  id: string;
  key: string;
  algorithm: string;
  keySize: number;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
  usage: string[];
}

export interface SecureStorageItem {
  key: string;
  value: string;
  classification: DataClassification;
  encrypted: boolean;
  createdAt: Date;
  expiresAt?: Date;
  accessCount: number;
  lastAccessed: Date;
}

class DataEncryptionService {
  private encryptionKeys: Map<string, EncryptionKey> = new Map();
  private secureStorage: Map<string, SecureStorageItem> = new Map();
  private deviceKey: string | null = null;

  constructor() {
    this.initializeEncryption();
  }

  // Initialize encryption service
  private async initializeEncryption() {
    try {
      // Generate device-specific key
      await this.generateDeviceKey();
      
      // Load existing encryption keys
      await this.loadEncryptionKeys();
      
      // Set up key rotation
      this.setupKeyRotation();
      
      // Set up secure storage cleanup
      this.setupSecureStorageCleanup();
    } catch (error) {
      console.error('Encryption initialization error:', error);
    }
  }

  // Generate device-specific encryption key
  private async generateDeviceKey(): Promise<void> {
    try {
      // Check if device key exists in keychain
      const existingKey = await Keychain.getInternetCredentials('Thenga_device_key');
      
      if (existingKey && existingKey.password) {
        this.deviceKey = existingKey.password;
      } else {
        // Generate new device key
        const deviceKey = this.generateRandomKey(32);
        
        // Store in keychain
        await Keychain.setInternetCredentials(
          'Thenga_device_key',
          'device_key',
          deviceKey
        );
        
        this.deviceKey = deviceKey;
      }
    } catch (error) {
      console.error('Error generating device key:', error);
    }
  }

  // Encrypt data with specified classification
  async encryptData(
    data: any,
    classification: DataClassification,
    keyId?: string
  ): Promise<{ success: boolean; encryptedData?: EncryptedData; error?: string }> {
    try {
      // Validate input
      if (!data) {
        return { success: false, error: 'Data is required' };
      }

      // Get encryption key
      const encryptionKey = keyId ? 
        this.encryptionKeys.get(keyId) : 
        await this.getEncryptionKeyForClassification(classification);

      if (!encryptionKey) {
        return { success: false, error: 'Encryption key not found' };
      }

      // Convert data to string
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);

      // Generate IV
      const iv = this.generateRandomIV();

      // Encrypt data
      const encrypted = CryptoJS.AES.encrypt(dataString, encryptionKey.key, {
        iv: CryptoJS.enc.Utf8.parse(iv),
        mode: CryptoJS.mode.GCM,
        padding: CryptoJS.pad.Pkcs7,
      });

      // Create encrypted data object
      const encryptedData: EncryptedData = {
        data: encrypted.toString(),
        iv: iv,
        tag: '', // GCM mode doesn't use separate tag in CryptoJS
        algorithm: ENCRYPTION_CONFIG.ALGORITHM,
        keyId: encryptionKey.id,
        timestamp: new Date(),
        classification,
      };

      return { success: true, encryptedData };
    } catch (error) {
      console.error('Error encrypting data:', error);
      return { success: false, error: 'Encryption failed' };
    }
  }

  // Decrypt data
  async decryptData(
    encryptedData: EncryptedData
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Get encryption key
      const encryptionKey = this.encryptionKeys.get(encryptedData.keyId);
      if (!encryptionKey) {
        return { success: false, error: 'Encryption key not found' };
      }

      // Decrypt data
      const decrypted = CryptoJS.AES.decrypt(encryptedData.data, encryptionKey.key, {
        iv: CryptoJS.enc.Utf8.parse(encryptedData.iv),
        mode: CryptoJS.mode.GCM,
        padding: CryptoJS.pad.Pkcs7,
      });

      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedString) {
        return { success: false, error: 'Decryption failed' };
      }

      // Try to parse as JSON, fallback to string
      let data;
      try {
        data = JSON.parse(decryptedString);
      } catch {
        data = decryptedString;
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error decrypting data:', error);
      return { success: false, error: 'Decryption failed' };
    }
  }

  // Store data securely
  async storeSecureData(
    key: string,
    data: any,
    classification: DataClassification,
    expiresAt?: Date
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Encrypt data
      const encryptionResult = await this.encryptData(data, classification);
      if (!encryptionResult.success) {
        return { success: false, error: encryptionResult.error };
      }

      // Create secure storage item
      const storageItem: SecureStorageItem = {
        key,
        value: JSON.stringify(encryptionResult.encryptedData),
        classification,
        encrypted: true,
        createdAt: new Date(),
        expiresAt,
        accessCount: 0,
        lastAccessed: new Date(),
      };

      // Store in secure storage
      await this.storeInSecureStorage(storageItem);

      return { success: true };
    } catch (error) {
      console.error('Error storing secure data:', error);
      return { success: false, error: 'Failed to store data securely' };
    }
  }

  // Retrieve data securely
  async retrieveSecureData(
    key: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Get from secure storage
      const storageItem = await this.getFromSecureStorage(key);
      if (!storageItem) {
        return { success: false, error: 'Data not found' };
      }

      // Check if data has expired
      if (storageItem.expiresAt && new Date() > storageItem.expiresAt) {
        await this.deleteSecureData(key);
        return { success: false, error: 'Data has expired' };
      }

      // Update access count and last accessed
      storageItem.accessCount++;
      storageItem.lastAccessed = new Date();
      await this.updateSecureStorageItem(storageItem);

      // Decrypt data
      const encryptedData = JSON.parse(storageItem.value);
      const decryptionResult = await this.decryptData(encryptedData);
      
      if (!decryptionResult.success) {
        return { success: false, error: decryptionResult.error };
      }

      return { success: true, data: decryptionResult.data };
    } catch (error) {
      console.error('Error retrieving secure data:', error);
      return { success: false, error: 'Failed to retrieve data' };
    }
  }

  // Delete secure data
  async deleteSecureData(key: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Delete from secure storage
      await this.deleteFromSecureStorage(key);
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting secure data:', error);
      return { success: false, error: 'Failed to delete data' };
    }
  }

  // Generate encryption key
  async generateEncryptionKey(
    keyId: string,
    usage: string[],
    expiresInDays: number = 365
  ): Promise<{ success: boolean; keyId?: string; error?: string }> {
    try {
      // Generate random key
      const key = this.generateRandomKey(ENCRYPTION_CONFIG.KEY_SIZE / 8);
      
      // Create encryption key object
      const encryptionKey: EncryptionKey = {
        id: keyId,
        key: key,
        algorithm: ENCRYPTION_CONFIG.ALGORITHM,
        keySize: ENCRYPTION_CONFIG.KEY_SIZE,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
        isActive: true,
        usage,
      };

      // Store encryption key
      await this.storeEncryptionKey(encryptionKey);

      return { success: true, keyId };
    } catch (error) {
      console.error('Error generating encryption key:', error);
      return { success: false, error: 'Failed to generate encryption key' };
    }
  }

  // Rotate encryption key
  async rotateEncryptionKey(
    oldKeyId: string,
    newKeyId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get old key
      const oldKey = this.encryptionKeys.get(oldKeyId);
      if (!oldKey) {
        return { success: false, error: 'Old key not found' };
      }

      // Generate new key
      const newKeyResult = await this.generateEncryptionKey(
        newKeyId,
        oldKey.usage,
        365
      );

      if (!newKeyResult.success) {
        return { success: false, error: newKeyResult.error };
      }

      // Mark old key as inactive
      oldKey.isActive = false;
      await this.updateEncryptionKey(oldKey);

      // Re-encrypt all data with new key
      await this.reencryptDataWithNewKey(oldKeyId, newKeyId);

      return { success: true };
    } catch (error) {
      console.error('Error rotating encryption key:', error);
      return { success: false, error: 'Failed to rotate encryption key' };
    }
  }

  // Hash data
  hashData(data: string, algorithm: string = ENCRYPTION_CONFIG.HASH_ALGORITHM): string {
    switch (algorithm) {
      case 'SHA-256':
        return CryptoJS.SHA256(data).toString();
      case 'SHA-512':
        return CryptoJS.SHA512(data).toString();
      case 'MD5':
        return CryptoJS.MD5(data).toString();
      default:
        return CryptoJS.SHA256(data).toString();
    }
  }

  // Generate random key
  private generateRandomKey(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Generate random IV
  private generateRandomIV(): string {
    return this.generateRandomKey(ENCRYPTION_CONFIG.IV_SIZE);
  }

  // Get encryption key for classification
  private async getEncryptionKeyForClassification(
    classification: DataClassification
  ): Promise<EncryptionKey | null> {
    // Find active key for classification
    for (const key of this.encryptionKeys.values()) {
      if (key.isActive && key.usage.includes(classification)) {
        return key;
      }
    }

    // Generate new key if none exists
    const keyId = `key_${classification}_${Date.now()}`;
    const keyResult = await this.generateEncryptionKey(keyId, [classification]);
    
    if (keyResult.success) {
      return this.encryptionKeys.get(keyId) || null;
    }

    return null;
  }

  // Store encryption key
  private async storeEncryptionKey(key: EncryptionKey): Promise<void> {
    try {
      // Store in keychain
      await Keychain.setInternetCredentials(
        `Thenga_encryption_key_${key.id}`,
        'encryption_key',
        key.key
      );

      // Store metadata in secure storage
      await AsyncStorage.setItem(
        `encryption_key_${key.id}`,
        JSON.stringify({
          id: key.id,
          algorithm: key.algorithm,
          keySize: key.keySize,
          createdAt: key.createdAt,
          expiresAt: key.expiresAt,
          isActive: key.isActive,
          usage: key.usage,
        })
      );

      // Store in memory
      this.encryptionKeys.set(key.id, key);
    } catch (error) {
      console.error('Error storing encryption key:', error);
    }
  }

  // Update encryption key
  private async updateEncryptionKey(key: EncryptionKey): Promise<void> {
    try {
      // Update in keychain
      await Keychain.setInternetCredentials(
        `Thenga_encryption_key_${key.id}`,
        'encryption_key',
        key.key
      );

      // Update metadata in secure storage
      await AsyncStorage.setItem(
        `encryption_key_${key.id}`,
        JSON.stringify({
          id: key.id,
          algorithm: key.algorithm,
          keySize: key.keySize,
          createdAt: key.createdAt,
          expiresAt: key.expiresAt,
          isActive: key.isActive,
          usage: key.usage,
        })
      );

      // Update in memory
      this.encryptionKeys.set(key.id, key);
    } catch (error) {
      console.error('Error updating encryption key:', error);
    }
  }

  // Store in secure storage
  private async storeInSecureStorage(item: SecureStorageItem): Promise<void> {
    try {
      // Store in AsyncStorage
      await AsyncStorage.setItem(
        `secure_storage_${item.key}`,
        JSON.stringify(item)
      );

      // Store in memory
      this.secureStorage.set(item.key, item);
    } catch (error) {
      console.error('Error storing in secure storage:', error);
    }
  }

  // Get from secure storage
  private async getFromSecureStorage(key: string): Promise<SecureStorageItem | null> {
    try {
      // Check memory first
      const memoryItem = this.secureStorage.get(key);
      if (memoryItem) {
        return memoryItem;
      }

      // Get from AsyncStorage
      const itemString = await AsyncStorage.getItem(`secure_storage_${key}`);
      if (!itemString) {
        return null;
      }

      const item = JSON.parse(itemString) as SecureStorageItem;
      
      // Store in memory
      this.secureStorage.set(key, item);
      
      return item;
    } catch (error) {
      console.error('Error getting from secure storage:', error);
      return null;
    }
  }

  // Update secure storage item
  private async updateSecureStorageItem(item: SecureStorageItem): Promise<void> {
    try {
      // Update in AsyncStorage
      await AsyncStorage.setItem(
        `secure_storage_${item.key}`,
        JSON.stringify(item)
      );

      // Update in memory
      this.secureStorage.set(item.key, item);
    } catch (error) {
      console.error('Error updating secure storage item:', error);
    }
  }

  // Delete from secure storage
  private async deleteFromSecureStorage(key: string): Promise<void> {
    try {
      // Delete from AsyncStorage
      await AsyncStorage.removeItem(`secure_storage_${key}`);

      // Delete from memory
      this.secureStorage.delete(key);
    } catch (error) {
      console.error('Error deleting from secure storage:', error);
    }
  }

  // Re-encrypt data with new key
  private async reencryptDataWithNewKey(
    oldKeyId: string,
    newKeyId: string
  ): Promise<void> {
    try {
      // Get new key
      const newKey = this.encryptionKeys.get(newKeyId);
      if (!newKey) {
        throw new Error('New key not found');
      }

      // Get old key
      const oldKey = this.encryptionKeys.get(oldKeyId);
      if (!oldKey) {
        throw new Error('Old key not found');
      }

      // Re-encrypt all data
      for (const [key, item] of this.secureStorage.entries()) {
        if (item.encrypted) {
          // Decrypt with old key
          const encryptedData = JSON.parse(item.value);
          const decryptionResult = await this.decryptData(encryptedData);
          
          if (decryptionResult.success) {
            // Re-encrypt with new key
            const reencryptionResult = await this.encryptData(
              decryptionResult.data,
              item.classification,
              newKeyId
            );
            
            if (reencryptionResult.success) {
              // Update storage item
              item.value = JSON.stringify(reencryptionResult.encryptedData);
              await this.updateSecureStorageItem(item);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error re-encrypting data:', error);
    }
  }

  // Load encryption keys
  private async loadEncryptionKeys(): Promise<void> {
    try {
      // Load from AsyncStorage
      const keys = await AsyncStorage.getAllKeys();
      const encryptionKeyKeys = keys.filter(key => key.startsWith('encryption_key_'));
      
      for (const key of encryptionKeyKeys) {
        const keyData = await AsyncStorage.getItem(key);
        if (keyData) {
          const keyInfo = JSON.parse(keyData);
          const keyId = keyInfo.id;
          
          // Get key from keychain
          const keychainData = await Keychain.getInternetCredentials(
            `Thenga_encryption_key_${keyId}`
          );
          
          if (keychainData && keychainData.password) {
            const encryptionKey: EncryptionKey = {
              ...keyInfo,
              key: keychainData.password,
            };
            
            this.encryptionKeys.set(keyId, encryptionKey);
          }
        }
      }
    } catch (error) {
      console.error('Error loading encryption keys:', error);
    }
  }

  // Set up key rotation
  private setupKeyRotation(): void {
    // Check for expired keys daily
    setInterval(() => {
      this.checkExpiredKeys();
    }, 24 * 60 * 60 * 1000);
  }

  // Set up secure storage cleanup
  private setupSecureStorageCleanup(): void {
    // Clean up expired data daily
    setInterval(() => {
      this.cleanupExpiredData();
    }, 24 * 60 * 60 * 1000);
  }

  // Check expired keys
  private async checkExpiredKeys(): Promise<void> {
    try {
      const now = new Date();
      for (const [keyId, key] of this.encryptionKeys.entries()) {
        if (key.expiresAt && key.expiresAt < now) {
          // Generate new key
          const newKeyId = `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await this.rotateEncryptionKey(keyId, newKeyId);
        }
      }
    } catch (error) {
      console.error('Error checking expired keys:', error);
    }
  }

  // Clean up expired data
  private async cleanupExpiredData(): Promise<void> {
    try {
      const now = new Date();
      for (const [key, item] of this.secureStorage.entries()) {
        if (item.expiresAt && item.expiresAt < now) {
          await this.deleteSecureData(key);
        }
      }
    } catch (error) {
      console.error('Error cleaning up expired data:', error);
    }
  }

  // Get encryption key by ID
  getEncryptionKey(keyId: string): EncryptionKey | null {
    return this.encryptionKeys.get(keyId) || null;
  }

  // Get all encryption keys
  getAllEncryptionKeys(): EncryptionKey[] {
    return Array.from(this.encryptionKeys.values());
  }

  // Get secure storage item
  getSecureStorageItem(key: string): SecureStorageItem | null {
    return this.secureStorage.get(key) || null;
  }

  // Get all secure storage items
  getAllSecureStorageItems(): SecureStorageItem[] {
    return Array.from(this.secureStorage.values());
  }
}

// Export singleton instance
export default new DataEncryptionService();
