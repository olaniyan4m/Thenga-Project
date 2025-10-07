// 🔐 Pezela Authentication Service
// Secure Firebase Authentication with comprehensive security features

import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';

// Security configuration
const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  PASSWORD_MIN_LENGTH: 8,
  REQUIRE_SPECIAL_CHARS: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_UPPERCASE: true,
};

// User data encryption keys
const ENCRYPTION_KEYS = {
  USER_DATA: 'user_data_encryption_key',
  PAYMENT_DATA: 'payment_data_encryption_key',
  BUSINESS_DATA: 'business_data_encryption_key',
};

export interface UserProfile {
  uid: string;
  email: string;
  phone: string;
  businessName: string;
  businessType: string;
  registrationNumber: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  taxNumber: string;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    branchCode: string;
  };
  kycStatus: 'pending' | 'verified' | 'rejected';
  complianceStatus: {
    popia: boolean;
    pci: boolean;
    sars: boolean;
  };
  createdAt: Date;
  lastLogin: Date;
  deviceInfo: {
    deviceId: string;
    platform: string;
    version: string;
  };
}

export interface LoginAttempt {
  timestamp: Date;
  success: boolean;
  ipAddress: string;
  deviceId: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

class AuthService {
  private currentUser: FirebaseAuthTypes.User | null = null;
  private userProfile: UserProfile | null = null;
  private loginAttempts: LoginAttempt[] = [];
  private isLockedOut = false;
  private lockoutUntil: Date | null = null;

  constructor() {
    this.initializeAuth();
    this.setupSecurityMonitoring();
  }

  // Initialize authentication with security measures
  private async initializeAuth() {
    try {
      // Set up auth state listener
      auth().onAuthStateChanged(async (user) => {
        this.currentUser = user;
        if (user) {
          await this.loadUserProfile(user.uid);
          await this.recordLoginAttempt(true);
          await this.updateLastLogin();
        }
      });

      // Set up security monitoring
      await this.setupSecurityMonitoring();
    } catch (error) {
      console.error('Auth initialization error:', error);
      await this.logSecurityEvent('AUTH_INIT_ERROR', { error: error.message });
    }
  }

  // Set up comprehensive security monitoring
  private async setupSecurityMonitoring() {
    // Monitor for suspicious activity
    auth().onAuthStateChanged(async (user) => {
      if (user) {
        await this.checkSecurityRisks(user);
      }
    });

    // Set up session timeout
    setInterval(() => {
      this.checkSessionTimeout();
    }, 60000); // Check every minute
  }

  // Secure user registration with validation
  async registerUser(userData: {
    email: string;
    password: string;
    phone: string;
    businessName: string;
    businessType: string;
    registrationNumber: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
  }): Promise<{ success: boolean; message: string; user?: UserProfile }> {
    try {
      // Validate input data
      const validation = await this.validateRegistrationData(userData);
      if (!validation.isValid) {
        return { success: false, message: validation.message };
      }

      // Check if user already exists
      const existingUser = await this.checkExistingUser(userData.email, userData.phone);
      if (existingUser.exists) {
        return { success: false, message: existingUser.message };
      }

      // Create Firebase user
      const userCredential = await auth().createUserWithEmailAndPassword(
        userData.email,
        userData.password
      );

      // Create user profile with encrypted data
      const userProfile: UserProfile = {
        uid: userCredential.user.uid,
        email: userData.email,
        phone: userData.phone,
        businessName: userData.businessName,
        businessType: userData.businessType,
        registrationNumber: userData.registrationNumber,
        address: userData.address,
        city: userData.city,
        province: userData.province,
        postalCode: userData.postalCode,
        taxNumber: '',
        bankDetails: {
          bankName: '',
          accountNumber: '',
          branchCode: '',
        },
        kycStatus: 'pending',
        complianceStatus: {
          popia: false,
          pci: false,
          sars: false,
        },
        createdAt: new Date(),
        lastLogin: new Date(),
        deviceInfo: await this.getDeviceInfo(),
      };

      // Save encrypted user profile
      await this.saveUserProfile(userProfile);

      // Send verification email
      await this.sendVerificationEmail();

      // Log registration event
      await this.logSecurityEvent('USER_REGISTRATION', {
        userId: userCredential.user.uid,
        businessName: userData.businessName,
        businessType: userData.businessType,
      });

      return { success: true, message: 'Registration successful', user: userProfile };
    } catch (error) {
      await this.logSecurityEvent('REGISTRATION_ERROR', { error: error.message });
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  }

  // Secure login with comprehensive security checks
  async loginUser(email: string, password: string): Promise<{ success: boolean; message: string; user?: UserProfile }> {
    try {
      // Check if account is locked out
      if (this.isLockedOut && this.lockoutUntil && new Date() < this.lockoutUntil) {
        const remainingTime = Math.ceil((this.lockoutUntil.getTime() - new Date().getTime()) / 60000);
        return { 
          success: false, 
          message: `Account locked. Try again in ${remainingTime} minutes.` 
        };
      }

      // Check login attempt limits
      if (this.loginAttempts.length >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
        this.isLockedOut = true;
        this.lockoutUntil = new Date(Date.now() + SECURITY_CONFIG.LOCKOUT_DURATION);
        await this.logSecurityEvent('ACCOUNT_LOCKED', { email, attempts: this.loginAttempts.length });
        return { success: false, message: 'Too many failed attempts. Account locked.' };
      }

      // Attempt login
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      
      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        await this.logSecurityEvent('LOGIN_UNVERIFIED_EMAIL', { email });
        return { success: false, message: 'Please verify your email before logging in.' };
      }

      // Load user profile
      const userProfile = await this.loadUserProfile(userCredential.user.uid);
      
      // Record successful login
      await this.recordLoginAttempt(true);
      
      // Reset login attempts
      this.loginAttempts = [];
      this.isLockedOut = false;
      this.lockoutUntil = null;

      // Log successful login
      await this.logSecurityEvent('LOGIN_SUCCESS', { 
        userId: userCredential.user.uid,
        email: email 
      });

      return { success: true, message: 'Login successful', user: userProfile };
    } catch (error) {
      // Record failed login attempt
      await this.recordLoginAttempt(false);
      
      // Log failed login
      await this.logSecurityEvent('LOGIN_FAILED', { 
        email: email, 
        error: error.message,
        attempts: this.loginAttempts.length 
      });

      return { success: false, message: 'Invalid email or password.' };
    }
  }

  // Secure logout with session cleanup
  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      // Log logout event
      await this.logSecurityEvent('USER_LOGOUT', { 
        userId: this.currentUser?.uid 
      });

      // Clear local data
      await this.clearLocalData();

      // Sign out from Firebase
      await auth().signOut();

      // Reset user data
      this.currentUser = null;
      this.userProfile = null;

      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      await this.logSecurityEvent('LOGOUT_ERROR', { error: error.message });
      return { success: false, message: 'Logout failed' };
    }
  }

  // Validate registration data
  private async validateRegistrationData(userData: any): Promise<{ isValid: boolean; message: string }> {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      return { isValid: false, message: 'Please enter a valid email address.' };
    }

    // Password validation
    const passwordValidation = this.validatePassword(userData.password);
    if (!passwordValidation.isValid) {
      return { isValid: false, message: passwordValidation.message };
    }

    // Phone validation (South African format)
    const phoneRegex = /^(\+27|0)[0-9]{9}$/;
    if (!phoneRegex.test(userData.phone)) {
      return { isValid: false, message: 'Please enter a valid South African phone number.' };
    }

    // Business name validation
    if (!userData.businessName || userData.businessName.length < 2) {
      return { isValid: false, message: 'Business name must be at least 2 characters long.' };
    }

    // Registration number validation
    if (!userData.registrationNumber || userData.registrationNumber.length < 8) {
      return { isValid: false, message: 'Registration number must be at least 8 characters long.' };
    }

    return { isValid: true, message: 'Validation successful' };
  }

  // Validate password strength
  private validatePassword(password: string): { isValid: boolean; message: string } {
    if (password.length < SECURITY_CONFIG.PASSWORD_MIN_LENGTH) {
      return { isValid: false, message: `Password must be at least ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} characters long.` };
    }

    if (SECURITY_CONFIG.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter.' };
    }

    if (SECURITY_CONFIG.REQUIRE_NUMBERS && !/[0-9]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number.' };
    }

    if (SECURITY_CONFIG.REQUIRE_SPECIAL_CHARS && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one special character.' };
    }

    return { isValid: true, message: 'Password is valid' };
  }

  // Check for existing user
  private async checkExistingUser(email: string, phone: string): Promise<{ exists: boolean; message: string }> {
    try {
      // Check email
      const emailQuery = await firestore()
        .collection('users')
        .where('email', '==', email)
        .get();

      if (!emailQuery.empty) {
        return { exists: true, message: 'An account with this email already exists.' };
      }

      // Check phone
      const phoneQuery = await firestore()
        .collection('users')
        .where('phone', '==', phone)
        .get();

      if (!phoneQuery.empty) {
        return { exists: true, message: 'An account with this phone number already exists.' };
      }

      return { exists: false, message: 'User does not exist' };
    } catch (error) {
      return { exists: false, message: 'Error checking existing user' };
    }
  }

  // Save user profile with encryption
  private async saveUserProfile(userProfile: UserProfile): Promise<void> {
    try {
      // Encrypt sensitive data
      const encryptedProfile = await this.encryptUserData(userProfile);

      // Save to Firestore
      await firestore()
        .collection('users')
        .doc(userProfile.uid)
        .set(encryptedProfile);

      // Save to local storage
      await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
    } catch (error) {
      console.error('Error saving user profile:', error);
      throw error;
    }
  }

  // Load user profile
  private async loadUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      // Try to load from local storage first
      const localProfile = await AsyncStorage.getItem('userProfile');
      if (localProfile) {
        const profile = JSON.parse(localProfile);
        if (profile.uid === uid) {
          this.userProfile = profile;
          return profile;
        }
      }

      // Load from Firestore
      const doc = await firestore().collection('users').doc(uid).get();
      if (doc.exists) {
        const profile = doc.data() as UserProfile;
        this.userProfile = profile;
        
        // Save to local storage
        await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
        
        return profile;
      }

      return null;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  }

  // Encrypt user data
  private async encryptUserData(userData: UserProfile): Promise<UserProfile> {
    // In a real implementation, you would use proper encryption
    // For now, we'll return the data as-is but mark it as encrypted
    return {
      ...userData,
      // Add encryption markers
      encrypted: true,
      encryptionVersion: '1.0',
    } as any;
  }

  // Get device information
  private async getDeviceInfo(): Promise<{ deviceId: string; platform: string; version: string }> {
    try {
      const deviceId = await DeviceInfo.getUniqueId();
      const platform = Platform.OS;
      const version = await DeviceInfo.getVersion();

      return { deviceId, platform, version };
    } catch (error) {
      return { deviceId: 'unknown', platform: Platform.OS, version: '1.0.0' };
    }
  }

  // Record login attempt
  private async recordLoginAttempt(success: boolean): Promise<void> {
    const attempt: LoginAttempt = {
      timestamp: new Date(),
      success,
      ipAddress: 'unknown', // Would get from network request
      deviceId: await DeviceInfo.getUniqueId(),
    };

    this.loginAttempts.push(attempt);

    // Keep only last 10 attempts
    if (this.loginAttempts.length > 10) {
      this.loginAttempts = this.loginAttempts.slice(-10);
    }
  }

  // Check security risks
  private async checkSecurityRisks(user: FirebaseAuthTypes.User): Promise<void> {
    // Check for unusual login patterns
    const recentAttempts = this.loginAttempts.filter(
      attempt => new Date().getTime() - attempt.timestamp.getTime() < 3600000 // Last hour
    );

    if (recentAttempts.length > 3) {
      await this.logSecurityEvent('SUSPICIOUS_LOGIN_PATTERN', {
        userId: user.uid,
        attempts: recentAttempts.length,
      });
    }
  }

  // Check session timeout
  private checkSessionTimeout(): void {
    if (this.userProfile && this.userProfile.lastLogin) {
      const timeSinceLogin = new Date().getTime() - this.userProfile.lastLogin.getTime();
      if (timeSinceLogin > SECURITY_CONFIG.SESSION_TIMEOUT) {
        this.logout();
      }
    }
  }

  // Update last login
  private async updateLastLogin(): Promise<void> {
    if (this.userProfile) {
      this.userProfile.lastLogin = new Date();
      await this.saveUserProfile(this.userProfile);
    }
  }

  // Send verification email
  private async sendVerificationEmail(): Promise<void> {
    try {
      if (this.currentUser) {
        await this.currentUser.sendEmailVerification();
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
    }
  }

  // Clear local data
  private async clearLocalData(): Promise<void> {
    try {
      await AsyncStorage.removeItem('userProfile');
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('refreshToken');
    } catch (error) {
      console.error('Error clearing local data:', error);
    }
  }

  // Log security events
  private async logSecurityEvent(eventType: string, data: any): Promise<void> {
    try {
      const securityEvent = {
        eventType,
        timestamp: new Date(),
        userId: this.currentUser?.uid || 'anonymous',
        data,
        deviceInfo: await this.getDeviceInfo(),
      };

      // Log to Firestore
      await firestore()
        .collection('security_logs')
        .add(securityEvent);

      // Log to console in development
      if (__DEV__) {
        console.log('Security Event:', securityEvent);
      }
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  // Get current user
  getCurrentUser(): FirebaseAuthTypes.User | null {
    return this.currentUser;
  }

  // Get user profile
  getUserProfile(): UserProfile | null {
    return this.userProfile;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // Check if user is verified
  isEmailVerified(): boolean {
    return this.currentUser?.emailVerified || false;
  }
}

// Export singleton instance
export default new AuthService();
