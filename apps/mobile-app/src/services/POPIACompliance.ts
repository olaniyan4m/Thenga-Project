// 🔐 Pezela POPIA Compliance Service
// Protection of Personal Information Act (POPIA) compliance for South Africa

import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';

// POPIA compliance configuration
const POPIA_CONFIG = {
  DATA_RETENTION_PERIOD: 7 * 365 * 24 * 60 * 60 * 1000, // 7 years in milliseconds
  CONSENT_EXPIRY_PERIOD: 365 * 24 * 60 * 60 * 1000, // 1 year in milliseconds
  AUDIT_LOG_RETENTION: 3 * 365 * 24 * 60 * 60 * 1000, // 3 years in milliseconds
  DATA_MINIMIZATION_ENABLED: true,
  CONSENT_REQUIRED: true,
  RIGHT_TO_ACCESS_ENABLED: true,
  RIGHT_TO_RECTIFICATION_ENABLED: true,
  RIGHT_TO_ERASURE_ENABLED: true,
  DATA_PORTABILITY_ENABLED: true,
};

export interface POPIAConsent {
  id: string;
  userId: string;
  consentType: 'data_processing' | 'marketing' | 'analytics' | 'third_party_sharing';
  granted: boolean;
  grantedAt: Date;
  expiresAt: Date;
  purpose: string;
  legalBasis: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests';
  withdrawalMethod: string;
  dataController: string;
  dataProcessor: string;
}

export interface POPIADataSubject {
  id: string;
  userId: string;
  personalData: {
    name: string;
    email: string;
    phone: string;
    address: string;
    businessName: string;
    registrationNumber: string;
    taxNumber: string;
    bankDetails: any;
  };
  processingPurposes: string[];
  legalBasis: string[];
  retentionPeriod: number;
  dataCategories: string[];
  thirdPartySharing: boolean;
  crossBorderTransfer: boolean;
  automatedDecisionMaking: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface POPIAAuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  action: 'data_access' | 'data_modification' | 'data_deletion' | 'consent_granted' | 'consent_withdrawn' | 'data_export' | 'data_breach';
  dataType: string;
  purpose: string;
  legalBasis: string;
  ipAddress: string;
  deviceId: string;
  userAgent: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  details: any;
}

export interface POPIADataBreach {
  id: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  dataTypes: string[];
  affectedUsers: number;
  description: string;
  cause: string;
  mitigation: string;
  reported: boolean;
  reportedAt?: Date;
  regulatoryNotification: boolean;
  userNotification: boolean;
  status: 'detected' | 'investigating' | 'contained' | 'resolved';
}

class POPIAComplianceService {
  private consentRegistry: Map<string, POPIAConsent> = new Map();
  private dataSubjects: Map<string, POPIADataSubject> = new Map();
  private auditLogs: POPIAAuditLog[] = [];
  private dataBreaches: POPIADataBreach[] = [];

  constructor() {
    this.initializePOPIA();
  }

  // Initialize POPIA compliance
  private async initializePOPIA() {
    try {
      // Load existing consent registry
      await this.loadConsentRegistry();
      
      // Load data subjects
      await this.loadDataSubjects();
      
      // Load audit logs
      await this.loadAuditLogs();
      
      // Set up data retention cleanup
      this.setupDataRetentionCleanup();
      
      // Set up consent expiry monitoring
      this.setupConsentExpiryMonitoring();
    } catch (error) {
      console.error('POPIA initialization error:', error);
    }
  }

  // Register data subject (user) for POPIA compliance
  async registerDataSubject(userId: string, personalData: any): Promise<{ success: boolean; message: string }> {
    try {
      // Validate personal data
      const validation = this.validatePersonalData(personalData);
      if (!validation.isValid) {
        return { success: false, message: validation.message };
      }

      // Create data subject record
      const dataSubject: POPIADataSubject = {
        id: `ds_${userId}_${Date.now()}`,
        userId,
        personalData,
        processingPurposes: [
          'service_provision',
          'payment_processing',
          'customer_support',
          'legal_compliance',
          'business_analytics'
        ],
        legalBasis: [
          'consent',
          'contract',
          'legal_obligation'
        ],
        retentionPeriod: POPIA_CONFIG.DATA_RETENTION_PERIOD,
        dataCategories: [
          'personal_identifiers',
          'contact_information',
          'business_information',
          'financial_information',
          'transaction_data'
        ],
        thirdPartySharing: true,
        crossBorderTransfer: false,
        automatedDecisionMaking: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save to Firestore
      await firestore()
        .collection('popia_data_subjects')
        .doc(dataSubject.id)
        .set(dataSubject);

      // Save locally
      this.dataSubjects.set(userId, dataSubject);

      // Log registration
      await this.logAuditEvent('data_subject_registered', userId, {
        dataSubjectId: dataSubject.id,
        dataCategories: dataSubject.dataCategories,
      });

      return { success: true, message: 'Data subject registered successfully' };
    } catch (error) {
      console.error('Error registering data subject:', error);
      return { success: false, message: 'Failed to register data subject' };
    }
  }

  // Obtain explicit consent for data processing
  async obtainConsent(
    userId: string,
    consentType: POPIAConsent['consentType'],
    purpose: string,
    legalBasis: POPIAConsent['legalBasis']
  ): Promise<{ success: boolean; message: string; consentId?: string }> {
    try {
      // Check if consent already exists and is valid
      const existingConsent = await this.getValidConsent(userId, consentType);
      if (existingConsent) {
        return { 
          success: true, 
          message: 'Valid consent already exists',
          consentId: existingConsent.id 
        };
      }

      // Create new consent record
      const consent: POPIAConsent = {
        id: `consent_${userId}_${consentType}_${Date.now()}`,
        userId,
        consentType,
        granted: true,
        grantedAt: new Date(),
        expiresAt: new Date(Date.now() + POPIA_CONFIG.CONSENT_EXPIRY_PERIOD),
        purpose,
        legalBasis,
        withdrawalMethod: 'mobile_app_settings',
        dataController: 'Pezela (Pty) Ltd',
        dataProcessor: 'Pezela (Pty) Ltd',
      };

      // Save to Firestore
      await firestore()
        .collection('popia_consents')
        .doc(consent.id)
        .set(consent);

      // Save locally
      this.consentRegistry.set(consent.id, consent);

      // Log consent grant
      await this.logAuditEvent('consent_granted', userId, {
        consentId: consent.id,
        consentType,
        purpose,
        legalBasis,
      });

      return { success: true, message: 'Consent obtained successfully', consentId: consent.id };
    } catch (error) {
      console.error('Error obtaining consent:', error);
      return { success: false, message: 'Failed to obtain consent' };
    }
  }

  // Withdraw consent
  async withdrawConsent(userId: string, consentId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Get consent record
      const consent = this.consentRegistry.get(consentId);
      if (!consent || consent.userId !== userId) {
        return { success: false, message: 'Consent not found' };
      }

      // Update consent status
      consent.granted = false;
      consent.expiresAt = new Date();

      // Save to Firestore
      await firestore()
        .collection('popia_consents')
        .doc(consentId)
        .update({
          granted: false,
          withdrawnAt: new Date(),
        });

      // Log consent withdrawal
      await this.logAuditEvent('consent_withdrawn', userId, {
        consentId,
        consentType: consent.consentType,
      });

      return { success: true, message: 'Consent withdrawn successfully' };
    } catch (error) {
      console.error('Error withdrawing consent:', error);
      return { success: false, message: 'Failed to withdraw consent' };
    }
  }

  // Data subject access request
  async handleDataAccessRequest(userId: string): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      // Check if user has right to access
      if (!POPIA_CONFIG.RIGHT_TO_ACCESS_ENABLED) {
        return { success: false, message: 'Data access requests are not enabled' };
      }

      // Get user's data
      const dataSubject = this.dataSubjects.get(userId);
      if (!dataSubject) {
        return { success: false, message: 'No data found for user' };
      }

      // Prepare data for export
      const exportData = {
        personalData: dataSubject.personalData,
        processingPurposes: dataSubject.processingPurposes,
        legalBasis: dataSubject.legalBasis,
        dataCategories: dataSubject.dataCategories,
        retentionPeriod: dataSubject.retentionPeriod,
        thirdPartySharing: dataSubject.thirdPartySharing,
        crossBorderTransfer: dataSubject.crossBorderTransfer,
        automatedDecisionMaking: dataSubject.automatedDecisionMaking,
        createdAt: dataSubject.createdAt,
        updatedAt: dataSubject.updatedAt,
      };

      // Log data access
      await this.logAuditEvent('data_access', userId, {
        dataTypes: dataSubject.dataCategories,
        purpose: 'data_subject_access_request',
      });

      return { success: true, message: 'Data access request processed', data: exportData };
    } catch (error) {
      console.error('Error handling data access request:', error);
      return { success: false, message: 'Failed to process data access request' };
    }
  }

  // Data rectification request
  async handleDataRectificationRequest(
    userId: string,
    field: string,
    newValue: any
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Check if user has right to rectification
      if (!POPIA_CONFIG.RIGHT_TO_RECTIFICATION_ENABLED) {
        return { success: false, message: 'Data rectification requests are not enabled' };
      }

      // Get user's data
      const dataSubject = this.dataSubjects.get(userId);
      if (!dataSubject) {
        return { success: false, message: 'No data found for user' };
      }

      // Update the field
      dataSubject.personalData[field] = newValue;
      dataSubject.updatedAt = new Date();

      // Save to Firestore
      await firestore()
        .collection('popia_data_subjects')
        .doc(dataSubject.id)
        .update({
          personalData: dataSubject.personalData,
          updatedAt: dataSubject.updatedAt,
        });

      // Log data rectification
      await this.logAuditEvent('data_modification', userId, {
        field,
        newValue,
        purpose: 'data_subject_rectification_request',
      });

      return { success: true, message: 'Data rectification request processed' };
    } catch (error) {
      console.error('Error handling data rectification request:', error);
      return { success: false, message: 'Failed to process data rectification request' };
    }
  }

  // Data erasure request (right to be forgotten)
  async handleDataErasureRequest(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Check if user has right to erasure
      if (!POPIA_CONFIG.RIGHT_TO_ERASURE_ENABLED) {
        return { success: false, message: 'Data erasure requests are not enabled' };
      }

      // Get user's data
      const dataSubject = this.dataSubjects.get(userId);
      if (!dataSubject) {
        return { success: false, message: 'No data found for user' };
      }

      // Check if erasure is legally permissible
      const canErase = await this.checkErasureLegality(userId);
      if (!canErase) {
        return { success: false, message: 'Data erasure not legally permissible' };
      }

      // Delete user data
      await this.deleteUserData(userId);

      // Log data erasure
      await this.logAuditEvent('data_deletion', userId, {
        purpose: 'data_subject_erasure_request',
        dataTypes: dataSubject.dataCategories,
      });

      return { success: true, message: 'Data erasure request processed' };
    } catch (error) {
      console.error('Error handling data erasure request:', error);
      return { success: false, message: 'Failed to process data erasure request' };
    }
  }

  // Data portability request
  async handleDataPortabilityRequest(userId: string): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      // Check if data portability is enabled
      if (!POPIA_CONFIG.DATA_PORTABILITY_ENABLED) {
        return { success: false, message: 'Data portability requests are not enabled' };
      }

      // Get user's data
      const dataSubject = this.dataSubjects.get(userId);
      if (!dataSubject) {
        return { success: false, message: 'No data found for user' };
      }

      // Prepare portable data
      const portableData = {
        personalData: dataSubject.personalData,
        processingPurposes: dataSubject.processingPurposes,
        legalBasis: dataSubject.legalBasis,
        dataCategories: dataSubject.dataCategories,
        format: 'JSON',
        encoding: 'UTF-8',
        exportedAt: new Date(),
      };

      // Log data portability
      await this.logAuditEvent('data_export', userId, {
        purpose: 'data_subject_portability_request',
        format: 'JSON',
      });

      return { success: true, message: 'Data portability request processed', data: portableData };
    } catch (error) {
      console.error('Error handling data portability request:', error);
      return { success: false, message: 'Failed to process data portability request' };
    }
  }

  // Report data breach
  async reportDataBreach(
    severity: POPIADataBreach['severity'],
    dataTypes: string[],
    affectedUsers: number,
    description: string,
    cause: string,
    mitigation: string
  ): Promise<{ success: boolean; message: string; breachId?: string }> {
    try {
      // Create data breach record
      const breach: POPIADataBreach = {
        id: `breach_${Date.now()}`,
        timestamp: new Date(),
        severity,
        dataTypes,
        affectedUsers,
        description,
        cause,
        mitigation,
        reported: false,
        regulatoryNotification: severity === 'high' || severity === 'critical',
        userNotification: true,
        status: 'detected',
      };

      // Save to Firestore
      await firestore()
        .collection('popia_data_breaches')
        .doc(breach.id)
        .set(breach);

      // Save locally
      this.dataBreaches.push(breach);

      // Log breach
      await this.logAuditEvent('data_breach', 'system', {
        breachId: breach.id,
        severity,
        dataTypes,
        affectedUsers,
      });

      // Notify regulatory authority if required
      if (breach.regulatoryNotification) {
        await this.notifyRegulatoryAuthority(breach);
      }

      // Notify affected users
      if (breach.userNotification) {
        await this.notifyAffectedUsers(breach);
      }

      return { success: true, message: 'Data breach reported successfully', breachId: breach.id };
    } catch (error) {
      console.error('Error reporting data breach:', error);
      return { success: false, message: 'Failed to report data breach' };
    }
  }

  // Validate personal data
  private validatePersonalData(personalData: any): { isValid: boolean; message: string } {
    // Check required fields
    const requiredFields = ['name', 'email', 'phone', 'businessName'];
    for (const field of requiredFields) {
      if (!personalData[field] || personalData[field].trim() === '') {
        return { isValid: false, message: `${field} is required` };
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(personalData.email)) {
      return { isValid: false, message: 'Invalid email format' };
    }

    // Validate phone format (South African)
    const phoneRegex = /^(\+27|0)[0-9]{9}$/;
    if (!phoneRegex.test(personalData.phone)) {
      return { isValid: false, message: 'Invalid South African phone number format' };
    }

    return { isValid: true, message: 'Personal data is valid' };
  }

  // Get valid consent
  private async getValidConsent(userId: string, consentType: string): Promise<POPIAConsent | null> {
    try {
      const query = await firestore()
        .collection('popia_consents')
        .where('userId', '==', userId)
        .where('consentType', '==', consentType)
        .where('granted', '==', true)
        .where('expiresAt', '>', new Date())
        .get();

      if (!query.empty) {
        const doc = query.docs[0];
        return doc.data() as POPIAConsent;
      }

      return null;
    } catch (error) {
      console.error('Error getting valid consent:', error);
      return null;
    }
  }

  // Check erasure legality
  private async checkErasureLegality(userId: string): Promise<boolean> {
    // Check if user has any legal obligations that prevent erasure
    // This would typically check for ongoing contracts, legal requirements, etc.
    return true; // Simplified for now
  }

  // Delete user data
  private async deleteUserData(userId: string): Promise<void> {
    try {
      // Delete from Firestore
      await firestore().collection('users').doc(userId).delete();
      await firestore().collection('popia_data_subjects').doc(userId).delete();
      
      // Delete from local storage
      await AsyncStorage.removeItem('userProfile');
      await AsyncStorage.removeItem('authToken');
    } catch (error) {
      console.error('Error deleting user data:', error);
    }
  }

  // Notify regulatory authority
  private async notifyRegulatoryAuthority(breach: POPIADataBreach): Promise<void> {
    // Implementation would send notification to Information Regulator
    console.log('Notifying regulatory authority of data breach:', breach.id);
  }

  // Notify affected users
  private async notifyAffectedUsers(breach: POPIADataBreach): Promise<void> {
    // Implementation would send notifications to affected users
    console.log('Notifying affected users of data breach:', breach.id);
  }

  // Load consent registry
  private async loadConsentRegistry(): Promise<void> {
    try {
      const query = await firestore().collection('popia_consents').get();
      query.docs.forEach(doc => {
        const consent = doc.data() as POPIAConsent;
        this.consentRegistry.set(consent.id, consent);
      });
    } catch (error) {
      console.error('Error loading consent registry:', error);
    }
  }

  // Load data subjects
  private async loadDataSubjects(): Promise<void> {
    try {
      const query = await firestore().collection('popia_data_subjects').get();
      query.docs.forEach(doc => {
        const dataSubject = doc.data() as POPIADataSubject;
        this.dataSubjects.set(dataSubject.userId, dataSubject);
      });
    } catch (error) {
      console.error('Error loading data subjects:', error);
    }
  }

  // Load audit logs
  private async loadAuditLogs(): Promise<void> {
    try {
      const query = await firestore()
        .collection('popia_audit_logs')
        .orderBy('timestamp', 'desc')
        .limit(1000)
        .get();
      
      query.docs.forEach(doc => {
        const log = doc.data() as POPIADataAuditLog;
        this.auditLogs.push(log);
      });
    } catch (error) {
      console.error('Error loading audit logs:', error);
    }
  }

  // Set up data retention cleanup
  private setupDataRetentionCleanup(): void {
    // Run cleanup every 24 hours
    setInterval(() => {
      this.cleanupExpiredData();
    }, 24 * 60 * 60 * 1000);
  }

  // Set up consent expiry monitoring
  private setupConsentExpiryMonitoring(): void {
    // Check for expired consents every hour
    setInterval(() => {
      this.checkExpiredConsents();
    }, 60 * 60 * 1000);
  }

  // Clean up expired data
  private async cleanupExpiredData(): Promise<void> {
    try {
      const cutoffDate = new Date(Date.now() - POPIA_CONFIG.DATA_RETENTION_PERIOD);
      
      // Clean up expired audit logs
      const expiredLogs = this.auditLogs.filter(log => log.timestamp < cutoffDate);
      for (const log of expiredLogs) {
        await firestore().collection('popia_audit_logs').doc(log.id).delete();
      }
      
      // Remove from local array
      this.auditLogs = this.auditLogs.filter(log => log.timestamp >= cutoffDate);
    } catch (error) {
      console.error('Error cleaning up expired data:', error);
    }
  }

  // Check expired consents
  private async checkExpiredConsents(): Promise<void> {
    try {
      const now = new Date();
      const expiredConsents = Array.from(this.consentRegistry.values())
        .filter(consent => consent.expiresAt < now && consent.granted);

      for (const consent of expiredConsents) {
        // Update consent status
        consent.granted = false;
        
        // Save to Firestore
        await firestore()
          .collection('popia_consents')
          .doc(consent.id)
          .update({ granted: false, expiredAt: now });

        // Log consent expiry
        await this.logAuditEvent('consent_expired', consent.userId, {
          consentId: consent.id,
          consentType: consent.consentType,
        });
      }
    } catch (error) {
      console.error('Error checking expired consents:', error);
    }
  }

  // Log audit event
  private async logAuditEvent(action: string, userId: string, details: any): Promise<void> {
    try {
      const auditLog: POPIADataAuditLog = {
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        userId,
        action: action as any,
        dataType: details.dataType || 'user_data',
        purpose: details.purpose || 'compliance',
        legalBasis: details.legalBasis || 'consent',
        ipAddress: 'unknown', // Would get from network request
        deviceId: await DeviceInfo.getUniqueId(),
        userAgent: `${Platform.OS} ${await DeviceInfo.getVersion()}`,
        details,
      };

      // Save to Firestore
      await firestore()
        .collection('popia_audit_logs')
        .doc(auditLog.id)
        .set(auditLog);

      // Save locally
      this.auditLogs.unshift(auditLog);
      
      // Keep only last 1000 logs locally
      if (this.auditLogs.length > 1000) {
        this.auditLogs = this.auditLogs.slice(0, 1000);
      }
    } catch (error) {
      console.error('Error logging audit event:', error);
    }
  }

  // Get user's consent status
  async getUserConsentStatus(userId: string): Promise<POPIAConsent[]> {
    return Array.from(this.consentRegistry.values())
      .filter(consent => consent.userId === userId);
  }

  // Get user's data subject record
  getUserDataSubject(userId: string): POPIADataSubject | null {
    return this.dataSubjects.get(userId) || null;
  }

  // Get audit logs for user
  getUserAuditLogs(userId: string): POPIADataAuditLog[] {
    return this.auditLogs.filter(log => log.userId === userId);
  }
}

// Export singleton instance
export default new POPIAComplianceService();
