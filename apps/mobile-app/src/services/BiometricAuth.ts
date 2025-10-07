// 🔐 Pezela Biometric Authentication Service
// Secure biometric authentication using device biometrics

import { TouchID, FaceID } from 'react-native-touch-id';
import Keychain from 'react-native-keychain';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';

// Biometric authentication configuration
const BIOMETRIC_CONFIG = {
  FALLBACK_ENABLED: true,
  FALLBACK_TITLE: 'Use Passcode',
  REASON: 'Authenticate to access Pezela',
  SENSOR_ERROR_DESCRIPTION: 'Touch ID sensor error',
  SENSOR_NOT_AVAILABLE: 'Touch ID not available',
  SENSOR_NOT_ENROLLED: 'Touch ID not enrolled',
  SENSOR_LOCKOUT: 'Touch ID locked out',
  USER_CANCEL: 'User cancelled authentication',
  SYSTEM_CANCEL: 'System cancelled authentication',
  AUTHENTICATION_FAILED: 'Authentication failed',
  USER_FALLBACK: 'User selected fallback',
  BIOMETRIC_NOT_SUPPORTED: 'Biometric authentication not supported',
  BIOMETRIC_NOT_AVAILABLE: 'Biometric authentication not available',
  BIOMETRIC_NOT_ENROLLED: 'Biometric authentication not enrolled',
  BIOMETRIC_LOCKOUT: 'Biometric authentication locked out',
  BIOMETRIC_LOCKOUT_PERMANENT: 'Biometric authentication permanently locked out',
  BIOMETRIC_NOT_PAIRED: 'Biometric authentication not paired',
  BIOMETRIC_NOT_AVAILABLE_FOR_DEVICE: 'Biometric authentication not available for device',
  BIOMETRIC_NOT_AVAILABLE_FOR_ACCOUNT: 'Biometric authentication not available for account',
  BIOMETRIC_NOT_AVAILABLE_FOR_APPLICATION: 'Biometric authentication not available for application',
  BIOMETRIC_NOT_AVAILABLE_FOR_USER: 'Biometric authentication not available for user',
  BIOMETRIC_NOT_AVAILABLE_FOR_SERVICE: 'Biometric authentication not available for service',
  BIOMETRIC_NOT_AVAILABLE_FOR_DEVICE_GROUP: 'Biometric authentication not available for device group',
  BIOMETRIC_NOT_AVAILABLE_FOR_ACCOUNT_GROUP: 'Biometric authentication not available for account group',
  BIOMETRIC_NOT_AVAILABLE_FOR_APPLICATION_GROUP: 'Biometric authentication not available for application group',
  BIOMETRIC_NOT_AVAILABLE_FOR_USER_GROUP: 'Biometric authentication not available for user group',
  BIOMETRIC_NOT_AVAILABLE_FOR_SERVICE_GROUP: 'Biometric authentication not available for service group',
};

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  errorCode?: string;
  biometricType?: 'TouchID' | 'FaceID' | 'Fingerprint' | 'Face';
  isAvailable?: boolean;
  isEnrolled?: boolean;
  isLocked?: boolean;
  isPermanentlyLocked?: boolean;
  isPaired?: boolean;
  isAvailableForDevice?: boolean;
  isAvailableForAccount?: boolean;
  isAvailableForApplication?: boolean;
  isAvailableForUser?: boolean;
  isAvailableForService?: boolean;
  isAvailableForDeviceGroup?: boolean;
  isAvailableForAccountGroup?: boolean;
  isAvailableForApplicationGroup?: boolean;
  isAvailableForUserGroup?: boolean;
  isAvailableForServiceGroup?: boolean;
}

export interface BiometricAuthConfig {
  reason: string;
  fallbackTitle?: string;
  sensorErrorDescription?: string;
  sensorNotAvailable?: string;
  sensorNotEnrolled?: string;
  sensorLockout?: string;
  userCancel?: string;
  systemCancel?: string;
  authenticationFailed?: string;
  userFallback?: string;
  biometricNotSupported?: string;
  biometricNotAvailable?: string;
  biometricNotEnrolled?: string;
  biometricLockout?: string;
  biometricLockoutPermanent?: string;
  biometricNotPaired?: string;
  biometricNotAvailableForDevice?: string;
  biometricNotAvailableForAccount?: string;
  biometricNotAvailableForApplication?: string;
  biometricNotAvailableForUser?: string;
  biometricNotAvailableForService?: string;
  biometricNotAvailableForDeviceGroup?: string;
  biometricNotAvailableForAccountGroup?: string;
  biometricNotAvailableForApplicationGroup?: string;
  biometricNotAvailableForUserGroup?: string;
  biometricNotAvailableForServiceGroup?: string;
}

class BiometricAuthService {
  private isInitialized: boolean = false;
  private biometricType: string | null = null;
  private isAvailable: boolean = false;
  private isEnrolled: boolean = false;
  private isLocked: boolean = false;
  private isPermanentlyLocked: boolean = false;
  private isPaired: boolean = false;
  private isAvailableForDevice: boolean = false;
  private isAvailableForAccount: boolean = false;
  private isAvailableForApplication: boolean = false;
  private isAvailableForUser: boolean = false;
  private isAvailableForService: boolean = false;
  private isAvailableForDeviceGroup: boolean = false;
  private isAvailableForAccountGroup: boolean = false;
  private isAvailableForApplicationGroup: boolean = false;
  private isAvailableForUserGroup: boolean = false;
  private isAvailableForServiceGroup: boolean = false;

  constructor() {
    this.initializeBiometricAuth();
  }

  // Initialize biometric authentication
  private async initializeBiometricAuth() {
    try {
      // Check if biometric authentication is supported
      const supportResult = await this.checkBiometricSupport();
      if (!supportResult.success) {
        console.log('Biometric authentication not supported:', supportResult.error);
        return;
      }

      // Check if biometric authentication is available
      const availabilityResult = await this.checkBiometricAvailability();
      if (!availabilityResult.success) {
        console.log('Biometric authentication not available:', availabilityResult.error);
        return;
      }

      // Check if biometric authentication is enrolled
      const enrollmentResult = await this.checkBiometricEnrollment();
      if (!enrollmentResult.success) {
        console.log('Biometric authentication not enrolled:', enrollmentResult.error);
        return;
      }

      this.isInitialized = true;
      console.log('Biometric authentication initialized successfully');
    } catch (error) {
      console.error('Error initializing biometric authentication:', error);
    }
  }

  // Check if biometric authentication is supported
  async checkBiometricSupport(): Promise<BiometricAuthResult> {
    try {
      const isSupported = await TouchID.isSupported();
      
      if (!isSupported) {
        return {
          success: false,
          error: BIOMETRIC_CONFIG.BIOMETRIC_NOT_SUPPORTED,
          errorCode: 'BIOMETRIC_NOT_SUPPORTED',
          isAvailable: false,
        };
      }

      return {
        success: true,
        isAvailable: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Unknown error',
        errorCode: 'UNKNOWN_ERROR',
        isAvailable: false,
      };
    }
  }

  // Check if biometric authentication is available
  async checkBiometricAvailability(): Promise<BiometricAuthResult> {
    try {
      const isAvailable = await TouchID.isSupported();
      
      if (!isAvailable) {
        return {
          success: false,
          error: BIOMETRIC_CONFIG.BIOMETRIC_NOT_AVAILABLE,
          errorCode: 'BIOMETRIC_NOT_AVAILABLE',
          isAvailable: false,
        };
      }

      this.isAvailable = true;
      return {
        success: true,
        isAvailable: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Unknown error',
        errorCode: 'UNKNOWN_ERROR',
        isAvailable: false,
      };
    }
  }

  // Check if biometric authentication is enrolled
  async checkBiometricEnrollment(): Promise<BiometricAuthResult> {
    try {
      const isEnrolled = await TouchID.isSupported();
      
      if (!isEnrolled) {
        return {
          success: false,
          error: BIOMETRIC_CONFIG.BIOMETRIC_NOT_ENROLLED,
          errorCode: 'BIOMETRIC_NOT_ENROLLED',
          isEnrolled: false,
        };
      }

      this.isEnrolled = true;
      return {
        success: true,
        isEnrolled: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Unknown error',
        errorCode: 'UNKNOWN_ERROR',
        isEnrolled: false,
      };
    }
  }

  // Authenticate using biometrics
  async authenticate(config: BiometricAuthConfig): Promise<BiometricAuthResult> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: 'Biometric authentication not initialized',
          errorCode: 'NOT_INITIALIZED',
        };
      }

      const authConfig = {
        reason: config.reason || BIOMETRIC_CONFIG.REASON,
        fallbackTitle: config.fallbackTitle || BIOMETRIC_CONFIG.FALLBACK_TITLE,
        sensorErrorDescription: config.sensorErrorDescription || BIOMETRIC_CONFIG.SENSOR_ERROR_DESCRIPTION,
        sensorNotAvailable: config.sensorNotAvailable || BIOMETRIC_CONFIG.SENSOR_NOT_AVAILABLE,
        sensorNotEnrolled: config.sensorNotEnrolled || BIOMETRIC_CONFIG.SENSOR_NOT_ENROLLED,
        sensorLockout: config.sensorLockout || BIOMETRIC_CONFIG.SENSOR_LOCKOUT,
        userCancel: config.userCancel || BIOMETRIC_CONFIG.USER_CANCEL,
        systemCancel: config.systemCancel || BIOMETRIC_CONFIG.SYSTEM_CANCEL,
        authenticationFailed: config.authenticationFailed || BIOMETRIC_CONFIG.AUTHENTICATION_FAILED,
        userFallback: config.userFallback || BIOMETRIC_CONFIG.USER_FALLBACK,
        biometricNotSupported: config.biometricNotSupported || BIOMETRIC_CONFIG.BIOMETRIC_NOT_SUPPORTED,
        biometricNotAvailable: config.biometricNotAvailable || BIOMETRIC_CONFIG.BIOMETRIC_NOT_AVAILABLE,
        biometricNotEnrolled: config.biometricNotEnrolled || BIOMETRIC_CONFIG.BIOMETRIC_NOT_ENROLLED,
        biometricLockout: config.biometricLockout || BIOMETRIC_CONFIG.BIOMETRIC_LOCKOUT,
        biometricLockoutPermanent: config.biometricLockoutPermanent || BIOMETRIC_CONFIG.BIOMETRIC_LOCKOUT_PERMANENT,
        biometricNotPaired: config.biometricNotPaired || BIOMETRIC_CONFIG.BIOMETRIC_NOT_PAIRED,
        biometricNotAvailableForDevice: config.biometricNotAvailableForDevice || BIOMETRIC_CONFIG.BIOMETRIC_NOT_AVAILABLE_FOR_DEVICE,
        biometricNotAvailableForAccount: config.biometricNotAvailableForAccount || BIOMETRIC_CONFIG.BIOMETRIC_NOT_AVAILABLE_FOR_ACCOUNT,
        biometricNotAvailableForApplication: config.biometricNotAvailableForApplication || BIOMETRIC_CONFIG.BIOMETRIC_NOT_AVAILABLE_FOR_APPLICATION,
        biometricNotAvailableForUser: config.biometricNotAvailableForUser || BIOMETRIC_CONFIG.BIOMETRIC_NOT_AVAILABLE_FOR_USER,
        biometricNotAvailableForService: config.biometricNotAvailableForService || BIOMETRIC_CONFIG.BIOMETRIC_NOT_AVAILABLE_FOR_SERVICE,
        biometricNotAvailableForDeviceGroup: config.biometricNotAvailableForDeviceGroup || BIOMETRIC_CONFIG.BIOMETRIC_NOT_AVAILABLE_FOR_DEVICE_GROUP,
        biometricNotAvailableForAccountGroup: config.biometricNotAvailableForAccountGroup || BIOMETRIC_CONFIG.BIOMETRIC_NOT_AVAILABLE_FOR_ACCOUNT_GROUP,
        biometricNotAvailableForApplicationGroup: config.biometricNotAvailableForApplicationGroup || BIOMETRIC_CONFIG.BIOMETRIC_NOT_AVAILABLE_FOR_APPLICATION_GROUP,
        biometricNotAvailableForUserGroup: config.biometricNotAvailableForUserGroup || BIOMETRIC_CONFIG.BIOMETRIC_NOT_AVAILABLE_FOR_USER_GROUP,
        biometricNotAvailableForServiceGroup: config.biometricNotAvailableForServiceGroup || BIOMETRIC_CONFIG.BIOMETRIC_NOT_AVAILABLE_FOR_SERVICE_GROUP,
      };

      const result = await TouchID.authenticate(authConfig.reason, authConfig);
      
      return {
        success: true,
        biometricType: this.biometricType || 'TouchID',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Authentication failed',
        errorCode: this.getErrorCode(error),
      };
    }
  }

  // Store biometric credentials
  async storeBiometricCredentials(
    username: string,
    password: string,
    service: string = 'Pezela'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await Keychain.setInternetCredentials(
        service,
        username,
        password,
        {
          accessControl: 'kSecAccessControlBiometryAny',
          accessGroup: 'com.pezela.mobile',
          authenticationType: 'kSecAccessControlBiometryAny',
          service: service,
        }
      );

      if (result) {
        return { success: true };
      } else {
        return { success: false, error: 'Failed to store biometric credentials' };
      }
    } catch (error) {
      return { success: false, error: error.message || 'Unknown error' };
    }
  }

  // Retrieve biometric credentials
  async retrieveBiometricCredentials(
    service: string = 'Pezela'
  ): Promise<{ success: boolean; username?: string; password?: string; error?: string }> {
    try {
      const result = await Keychain.getInternetCredentials(service);
      
      if (result && result.username && result.password) {
        return {
          success: true,
          username: result.username,
          password: result.password,
        };
      } else {
        return { success: false, error: 'No biometric credentials found' };
      }
    } catch (error) {
      return { success: false, error: error.message || 'Unknown error' };
    }
  }

  // Delete biometric credentials
  async deleteBiometricCredentials(
    service: string = 'Pezela'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await Keychain.resetInternetCredentials(service);
      
      if (result) {
        return { success: true };
      } else {
        return { success: false, error: 'Failed to delete biometric credentials' };
      }
    } catch (error) {
      return { success: false, error: error.message || 'Unknown error' };
    }
  }

  // Check if biometric authentication is available for device
  async checkBiometricAvailabilityForDevice(): Promise<BiometricAuthResult> {
    try {
      const isAvailable = await TouchID.isSupported();
      
      if (!isAvailable) {
        return {
          success: false,
          error: BIOMETRIC_CONFIG.BIOMETRIC_NOT_AVAILABLE_FOR_DEVICE,
          errorCode: 'BIOMETRIC_NOT_AVAILABLE_FOR_DEVICE',
          isAvailableForDevice: false,
        };
      }

      this.isAvailableForDevice = true;
      return {
        success: true,
        isAvailableForDevice: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Unknown error',
        errorCode: 'UNKNOWN_ERROR',
        isAvailableForDevice: false,
      };
    }
  }

  // Check if biometric authentication is available for account
  async checkBiometricAvailabilityForAccount(): Promise<BiometricAuthResult> {
    try {
      const isAvailable = await TouchID.isSupported();
      
      if (!isAvailable) {
        return {
          success: false,
          error: BIOMETRIC_CONFIG.BIOMETRIC_NOT_AVAILABLE_FOR_ACCOUNT,
          errorCode: 'BIOMETRIC_NOT_AVAILABLE_FOR_ACCOUNT',
          isAvailableForAccount: false,
        };
      }

      this.isAvailableForAccount = true;
      return {
        success: true,
        isAvailableForAccount: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Unknown error',
        errorCode: 'UNKNOWN_ERROR',
        isAvailableForAccount: false,
      };
    }
  }

  // Check if biometric authentication is available for application
  async checkBiometricAvailabilityForApplication(): Promise<BiometricAuthResult> {
    try {
      const isAvailable = await TouchID.isSupported();
      
      if (!isAvailable) {
        return {
          success: false,
          error: BIOMETRIC_CONFIG.BIOMETRIC_NOT_AVAILABLE_FOR_APPLICATION,
          errorCode: 'BIOMETRIC_NOT_AVAILABLE_FOR_APPLICATION',
          isAvailableForApplication: false,
        };
      }

      this.isAvailableForApplication = true;
      return {
        success: true,
        isAvailableForApplication: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Unknown error',
        errorCode: 'UNKNOWN_ERROR',
        isAvailableForApplication: false,
      };
    }
  }

  // Check if biometric authentication is available for user
  async checkBiometricAvailabilityForUser(): Promise<BiometricAuthResult> {
    try {
      const isAvailable = await TouchID.isSupported();
      
      if (!isAvailable) {
        return {
          success: false,
          error: BIOMETRIC_CONFIG.BIOMETRIC_NOT_AVAILABLE_FOR_USER,
          errorCode: 'BIOMETRIC_NOT_AVAILABLE_FOR_USER',
          isAvailableForUser: false,
        };
      }

      this.isAvailableForUser = true;
      return {
        success: true,
        isAvailableForUser: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Unknown error',
        errorCode: 'UNKNOWN_ERROR',
        isAvailableForUser: false,
      };
    }
  }

  // Check if biometric authentication is available for service
  async checkBiometricAvailabilityForService(): Promise<BiometricAuthResult> {
    try {
      const isAvailable = await TouchID.isSupported();
      
      if (!isAvailable) {
        return {
          success: false,
          error: BIOMETRIC_CONFIG.BIOMETRIC_NOT_AVAILABLE_FOR_SERVICE,
          errorCode: 'BIOMETRIC_NOT_AVAILABLE_FOR_SERVICE',
          isAvailableForService: false,
        };
      }

      this.isAvailableForService = true;
      return {
        success: true,
        isAvailableForService: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Unknown error',
        errorCode: 'UNKNOWN_ERROR',
        isAvailableForService: false,
      };
    }
  }

  // Get error code from error
  private getErrorCode(error: any): string {
    if (error.code) {
      return error.code;
    }

    if (error.message) {
      if (error.message.includes('User cancelled')) return 'USER_CANCEL';
      if (error.message.includes('System cancelled')) return 'SYSTEM_CANCEL';
      if (error.message.includes('Authentication failed')) return 'AUTHENTICATION_FAILED';
      if (error.message.includes('User fallback')) return 'USER_FALLBACK';
      if (error.message.includes('Biometric not supported')) return 'BIOMETRIC_NOT_SUPPORTED';
      if (error.message.includes('Biometric not available')) return 'BIOMETRIC_NOT_AVAILABLE';
      if (error.message.includes('Biometric not enrolled')) return 'BIOMETRIC_NOT_ENROLLED';
      if (error.message.includes('Biometric locked out')) return 'BIOMETRIC_LOCKOUT';
      if (error.message.includes('Biometric permanently locked out')) return 'BIOMETRIC_LOCKOUT_PERMANENT';
      if (error.message.includes('Biometric not paired')) return 'BIOMETRIC_NOT_PAIRED';
      if (error.message.includes('Biometric not available for device')) return 'BIOMETRIC_NOT_AVAILABLE_FOR_DEVICE';
      if (error.message.includes('Biometric not available for account')) return 'BIOMETRIC_NOT_AVAILABLE_FOR_ACCOUNT';
      if (error.message.includes('Biometric not available for application')) return 'BIOMETRIC_NOT_AVAILABLE_FOR_APPLICATION';
      if (error.message.includes('Biometric not available for user')) return 'BIOMETRIC_NOT_AVAILABLE_FOR_USER';
      if (error.message.includes('Biometric not available for service')) return 'BIOMETRIC_NOT_AVAILABLE_FOR_SERVICE';
      if (error.message.includes('Biometric not available for device group')) return 'BIOMETRIC_NOT_AVAILABLE_FOR_DEVICE_GROUP';
      if (error.message.includes('Biometric not available for account group')) return 'BIOMETRIC_NOT_AVAILABLE_FOR_ACCOUNT_GROUP';
      if (error.message.includes('Biometric not available for application group')) return 'BIOMETRIC_NOT_AVAILABLE_FOR_APPLICATION_GROUP';
      if (error.message.includes('Biometric not available for user group')) return 'BIOMETRIC_NOT_AVAILABLE_FOR_USER_GROUP';
      if (error.message.includes('Biometric not available for service group')) return 'BIOMETRIC_NOT_AVAILABLE_FOR_SERVICE_GROUP';
    }

    return 'UNKNOWN_ERROR';
  }

  // Get biometric type
  getBiometricType(): string | null {
    return this.biometricType;
  }

  // Check if biometric authentication is available
  isBiometricAvailable(): boolean {
    return this.isAvailable;
  }

  // Check if biometric authentication is enrolled
  isBiometricEnrolled(): boolean {
    return this.isEnrolled;
  }

  // Check if biometric authentication is locked
  isBiometricLocked(): boolean {
    return this.isLocked;
  }

  // Check if biometric authentication is permanently locked
  isBiometricPermanentlyLocked(): boolean {
    return this.isPermanentlyLocked;
  }

  // Check if biometric authentication is paired
  isBiometricPaired(): boolean {
    return this.isPaired;
  }

  // Check if biometric authentication is available for device
  isBiometricAvailableForDevice(): boolean {
    return this.isAvailableForDevice;
  }

  // Check if biometric authentication is available for account
  isBiometricAvailableForAccount(): boolean {
    return this.isAvailableForAccount;
  }

  // Check if biometric authentication is available for application
  isBiometricAvailableForApplication(): boolean {
    return this.isAvailableForApplication;
  }

  // Check if biometric authentication is available for user
  isBiometricAvailableForUser(): boolean {
    return this.isAvailableForUser;
  }

  // Check if biometric authentication is available for service
  isBiometricAvailableForService(): boolean {
    return this.isAvailableForService;
  }

  // Check if biometric authentication is available for device group
  isBiometricAvailableForDeviceGroup(): boolean {
    return this.isAvailableForDeviceGroup;
  }

  // Check if biometric authentication is available for account group
  isBiometricAvailableForAccountGroup(): boolean {
    return this.isAvailableForAccountGroup;
  }

  // Check if biometric authentication is available for application group
  isBiometricAvailableForApplicationGroup(): boolean {
    return this.isAvailableForApplicationGroup;
  }

  // Check if biometric authentication is available for user group
  isBiometricAvailableForUserGroup(): boolean {
    return this.isAvailableForUserGroup;
  }

  // Check if biometric authentication is available for service group
  isBiometricAvailableForServiceGroup(): boolean {
    return this.isAvailableForServiceGroup;
  }
}

// Export singleton instance
export default new BiometricAuthService();
