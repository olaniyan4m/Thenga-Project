// 🔐 Thenga GDPR Compliance Service
// General Data Protection Regulation (GDPR) compliance for international users

import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';

// GDPR compliance configuration
const GDPR_CONFIG = {
  DATA_RETENTION_PERIOD: 2 * 365 * 24 * 60 * 60 * 1000, // 2 years in milliseconds
  CONSENT_EXPIRY_PERIOD: 365 * 24 * 60 * 60 * 1000, // 1 year in milliseconds
  AUDIT_LOG_RETENTION: 3 * 365 * 24 * 60 * 60 * 1000, // 3 years in milliseconds
  DATA_MINIMIZATION_ENABLED: true,
  CONSENT_REQUIRED: true,
  RIGHT_TO_ACCESS_ENABLED: true,
  RIGHT_TO_RECTIFICATION_ENABLED: true,
  RIGHT_TO_ERASURE_ENABLED: true,
  RIGHT_TO_PORTABILITY_ENABLED: true,
  RIGHT_TO_OBJECT_ENABLED: true,
  RIGHT_TO_RESTRICTION_ENABLED: true,
  DATA_PROTECTION_IMPACT_ASSESSMENT_ENABLED: true,
  PRIVACY_BY_DESIGN_ENABLED: true,
  PRIVACY_BY_DEFAULT_ENABLED: true,
};

export interface GDPRConsent {
  id: string;
  userId: string;
  consentType: 'data_processing' | 'marketing' | 'analytics' | 'third_party_sharing' | 'profiling';
  granted: boolean;
  grantedAt: Date;
  expiresAt: Date;
  purpose: string;
  legalBasis: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests';
  withdrawalMethod: string;
  dataController: string;
  dataProcessor: string;
  thirdPartySharing: boolean;
  crossBorderTransfer: boolean;
  automatedDecisionMaking: boolean;
  profiling: boolean;
}

export interface GDPRDataSubject {
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
    location: {
      latitude: number;
      longitude: number;
      country: string;
      region: string;
    };
  };
  processingPurposes: string[];
  legalBasis: string[];
  retentionPeriod: number;
  dataCategories: string[];
  thirdPartySharing: boolean;
  crossBorderTransfer: boolean;
  automatedDecisionMaking: boolean;
  profiling: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastAccessed: Date;
  accessCount: number;
}

export interface GDPRDataBreach {
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
  riskToRights: 'low' | 'medium' | 'high' | 'critical';
  notificationDeadline: Date;
}

export interface GDPRDataProtectionImpactAssessment {
  id: string;
  timestamp: Date;
  processingActivity: string;
  dataTypes: string[];
  dataSubjects: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: string[];
  mitigationMeasures: string[];
  residualRisk: 'low' | 'medium' | 'high' | 'critical';
  approvalRequired: boolean;
  approved: boolean;
  approvedBy: string;
  approvedAt?: Date;
  status: 'draft' | 'review' | 'approved' | 'rejected';
}

export interface GDPRPrivacyNotice {
  id: string;
  version: string;
  effectiveDate: Date;
  language: string;
  content: {
    title: string;
    introduction: string;
    dataController: string;
    dataProcessor: string;
    dataTypes: string[];
    processingPurposes: string[];
    legalBasis: string[];
    dataRetention: string;
    dataSharing: string;
    dataTransfers: string;
    dataSubjectRights: string[];
    contactInformation: string;
    complaints: string;
    updates: string;
  };
  consentRequired: boolean;
  consentText: string;
  withdrawalMethod: string;
}

class GDPRComplianceService {
  private consentRegistry: Map<string, GDPRConsent> = new Map();
  private dataSubjects: Map<string, GDPRDataSubject> = new Map();
  private dataBreaches: GDPRDataBreach[] = [];
  private dpias: GDPRDataProtectionImpactAssessment[] = [];
  private privacyNotices: Map<string, GDPRPrivacyNotice> = new Map();

  constructor() {
    this.initializeGDPR();
  }

  // Initialize GDPR compliance
  private async initializeGDPR() {
    try {
      // Load existing data
      await this.loadConsentRegistry();
      await this.loadDataSubjects();
      await this.loadDataBreaches();
      await this.loadDPIAs();
      await this.loadPrivacyNotices();
      
      // Set up data retention cleanup
      this.setupDataRetentionCleanup();
      
      // Set up consent expiry monitoring
      this.setupConsentExpiryMonitoring();
      
      // Set up breach notification monitoring
      this.setupBreachNotificationMonitoring();
    } catch (error) {
      console.error('GDPR initialization error:', error);
    }
  }

  // Register data subject (user) for GDPR compliance
  async registerDataSubject(userId: string, personalData: any): Promise<{ success: boolean; message: string }> {
    try {
      // Validate personal data
      const validation = this.validatePersonalData(personalData);
      if (!validation.isValid) {
        return { success: false, message: validation.message };
      }

      // Create data subject record
      const dataSubject: GDPRDataSubject = {
        id: `ds_${userId}_${Date.now()}`,
        userId,
        personalData,
        processingPurposes: [
          'service_provision',
          'payment_processing',
          'customer_support',
          'legal_compliance',
          'business_analytics',
          'marketing',
          'profiling'
        ],
        legalBasis: [
          'consent',
          'contract',
          'legal_obligation',
          'legitimate_interests'
        ],
        retentionPeriod: GDPR_CONFIG.DATA_RETENTION_PERIOD,
        dataCategories: [
          'personal_identifiers',
          'contact_information',
          'business_information',
          'financial_information',
          'transaction_data',
          'location_data',
          'behavioral_data'
        ],
        thirdPartySharing: true,
        crossBorderTransfer: true,
        automatedDecisionMaking: true,
        profiling: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastAccessed: new Date(),
        accessCount: 0,
      };

      // Save to Firestore
      await firestore()
        .collection('gdpr_data_subjects')
        .doc(dataSubject.id)
        .set(dataSubject);

      // Save locally
      this.dataSubjects.set(userId, dataSubject);

      // Log registration
      await this.logAuditEvent('data_subject_registered', userId, {
        dataSubjectId: dataSubject.id,
        dataCategories: dataSubject.dataCategories,
        legalBasis: dataSubject.legalBasis,
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
    consentType: GDPRConsent['consentType'],
    purpose: string,
    legalBasis: GDPRConsent['legalBasis'],
    thirdPartySharing: boolean = false,
    crossBorderTransfer: boolean = false,
    automatedDecisionMaking: boolean = false,
    profiling: boolean = false
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
      const consent: GDPRConsent = {
        id: `consent_${userId}_${consentType}_${Date.now()}`,
        userId,
        consentType,
        granted: true,
        grantedAt: new Date(),
        expiresAt: new Date(Date.now() + GDPR_CONFIG.CONSENT_EXPIRY_PERIOD),
        purpose,
        legalBasis,
        withdrawalMethod: 'mobile_app_settings',
        dataController: 'Thenga (Pty) Ltd',
        dataProcessor: 'Thenga (Pty) Ltd',
        thirdPartySharing,
        crossBorderTransfer,
        automatedDecisionMaking,
        profiling,
      };

      // Save to Firestore
      await firestore()
        .collection('gdpr_consents')
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
        thirdPartySharing,
        crossBorderTransfer,
        automatedDecisionMaking,
        profiling,
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
        .collection('gdpr_consents')
        .doc(consentId)
        .update({
          granted: false,
          withdrawnAt: new Date(),
        });

      // Log consent withdrawal
      await this.logAuditEvent('consent_withdrawn', userId, {
        consentId,
        consentType: consent.consentType,
        purpose: consent.purpose,
      });

      return { success: true, message: 'Consent withdrawn successfully' };
    } catch (error) {
      console.error('Error withdrawing consent:', error);
      return { success: false, message: 'Failed to withdraw consent' };
    }
  }

  // Data subject access request (Article 15)
  async handleDataAccessRequest(userId: string): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      // Check if user has right to access
      if (!GDPR_CONFIG.RIGHT_TO_ACCESS_ENABLED) {
        return { success: false, message: 'Data access requests are not enabled' };
      }

      // Get user's data
      const dataSubject = this.dataSubjects.get(userId);
      if (!dataSubject) {
        return { success: false, message: 'No data found for user' };
      }

      // Update access count
      dataSubject.accessCount++;
      dataSubject.lastAccessed = new Date();
      await this.updateDataSubject(dataSubject);

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
        profiling: dataSubject.profiling,
        createdAt: dataSubject.createdAt,
        updatedAt: dataSubject.updatedAt,
        lastAccessed: dataSubject.lastAccessed,
        accessCount: dataSubject.accessCount,
      };

      // Log data access
      await this.logAuditEvent('data_access', userId, {
        dataTypes: dataSubject.dataCategories,
        purpose: 'data_subject_access_request',
        legalBasis: 'consent',
      });

      return { success: true, message: 'Data access request processed', data: exportData };
    } catch (error) {
      console.error('Error handling data access request:', error);
      return { success: false, message: 'Failed to process data access request' };
    }
  }

  // Data rectification request (Article 16)
  async handleDataRectificationRequest(
    userId: string,
    field: string,
    newValue: any
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Check if user has right to rectification
      if (!GDPR_CONFIG.RIGHT_TO_RECTIFICATION_ENABLED) {
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
      await this.updateDataSubject(dataSubject);

      // Log data rectification
      await this.logAuditEvent('data_modification', userId, {
        field,
        newValue,
        purpose: 'data_subject_rectification_request',
        legalBasis: 'consent',
      });

      return { success: true, message: 'Data rectification request processed' };
    } catch (error) {
      console.error('Error handling data rectification request:', error);
      return { success: false, message: 'Failed to process data rectification request' };
    }
  }

  // Data erasure request - Right to be forgotten (Article 17)
  async handleDataErasureRequest(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Check if user has right to erasure
      if (!GDPR_CONFIG.RIGHT_TO_ERASURE_ENABLED) {
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
        legalBasis: 'consent',
      });

      return { success: true, message: 'Data erasure request processed' };
    } catch (error) {
      console.error('Error handling data erasure request:', error);
      return { success: false, message: 'Failed to process data erasure request' };
    }
  }

  // Data portability request (Article 20)
  async handleDataPortabilityRequest(userId: string): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      // Check if data portability is enabled
      if (!GDPR_CONFIG.RIGHT_TO_PORTABILITY_ENABLED) {
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
        dataController: 'Thenga (Pty) Ltd',
        dataProcessor: 'Thenga (Pty) Ltd',
      };

      // Log data portability
      await this.logAuditEvent('data_export', userId, {
        purpose: 'data_subject_portability_request',
        format: 'JSON',
        legalBasis: 'consent',
      });

      return { success: true, message: 'Data portability request processed', data: portableData };
    } catch (error) {
      console.error('Error handling data portability request:', error);
      return { success: false, message: 'Failed to process data portability request' };
    }
  }

  // Object to processing request (Article 21)
  async handleObjectToProcessingRequest(
    userId: string,
    processingPurpose: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Check if right to object is enabled
      if (!GDPR_CONFIG.RIGHT_TO_OBJECT_ENABLED) {
        return { success: false, message: 'Object to processing requests are not enabled' };
      }

      // Get user's data
      const dataSubject = this.dataSubjects.get(userId);
      if (!dataSubject) {
        return { success: false, message: 'No data found for user' };
      }

      // Remove processing purpose
      const index = dataSubject.processingPurposes.indexOf(processingPurpose);
      if (index > -1) {
        dataSubject.processingPurposes.splice(index, 1);
        dataSubject.updatedAt = new Date();

        // Save to Firestore
        await this.updateDataSubject(dataSubject);

        // Log objection
        await this.logAuditEvent('object_to_processing', userId, {
          processingPurpose,
          purpose: 'data_subject_objection_request',
          legalBasis: 'consent',
        });

        return { success: true, message: 'Objection to processing processed' };
      }

      return { success: false, message: 'Processing purpose not found' };
    } catch (error) {
      console.error('Error handling object to processing request:', error);
      return { success: false, message: 'Failed to process objection request' };
    }
  }

  // Restriction of processing request (Article 18)
  async handleRestrictionOfProcessingRequest(
    userId: string,
    processingPurpose: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Check if right to restriction is enabled
      if (!GDPR_CONFIG.RIGHT_TO_RESTRICTION_ENABLED) {
        return { success: false, message: 'Restriction of processing requests are not enabled' };
      }

      // Get user's data
      const dataSubject = this.dataSubjects.get(userId);
      if (!dataSubject) {
        return { success: false, message: 'No data found for user' };
      }

      // Add restriction flag
      if (!dataSubject.processingPurposes.includes(`${processingPurpose}_RESTRICTED`)) {
        dataSubject.processingPurposes.push(`${processingPurpose}_RESTRICTED`);
        dataSubject.updatedAt = new Date();

        // Save to Firestore
        await this.updateDataSubject(dataSubject);

        // Log restriction
        await this.logAuditEvent('restriction_of_processing', userId, {
          processingPurpose,
          purpose: 'data_subject_restriction_request',
          legalBasis: 'consent',
        });

        return { success: true, message: 'Restriction of processing processed' };
      }

      return { success: false, message: 'Processing purpose already restricted' };
    } catch (error) {
      console.error('Error handling restriction of processing request:', error);
      return { success: false, message: 'Failed to process restriction request' };
    }
  }

  // Report data breach (Article 33)
  async reportDataBreach(
    severity: GDPRDataBreach['severity'],
    dataTypes: string[],
    affectedUsers: number,
    description: string,
    cause: string,
    mitigation: string
  ): Promise<{ success: boolean; message: string; breachId?: string }> {
    try {
      // Create data breach record
      const breach: GDPRDataBreach = {
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
        riskToRights: this.assessRiskToRights(severity, dataTypes, affectedUsers),
        notificationDeadline: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 hours
      };

      // Save to Firestore
      await firestore()
        .collection('gdpr_data_breaches')
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
        riskToRights: breach.riskToRights,
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

  // Create Data Protection Impact Assessment (Article 35)
  async createDPIA(
    processingActivity: string,
    dataTypes: string[],
    dataSubjects: number,
    riskFactors: string[]
  ): Promise<{ success: boolean; message: string; dpiaId?: string }> {
    try {
      // Create DPIA record
      const dpia: GDPRDataProtectionImpactAssessment = {
        id: `dpia_${Date.now()}`,
        timestamp: new Date(),
        processingActivity,
        dataTypes,
        dataSubjects,
        riskLevel: this.assessRiskLevel(dataTypes, dataSubjects, riskFactors),
        riskFactors,
        mitigationMeasures: [],
        residualRisk: 'low',
        approvalRequired: false,
        approved: false,
        approvedBy: '',
        status: 'draft',
      };

      // Save to Firestore
      await firestore()
        .collection('gdpr_dpias')
        .doc(dpia.id)
        .set(dpia);

      // Save locally
      this.dpias.push(dpia);

      // Log DPIA creation
      await this.logAuditEvent('dpia_created', 'system', {
        dpiaId: dpia.id,
        processingActivity,
        dataTypes,
        dataSubjects,
        riskLevel: dpia.riskLevel,
      });

      return { success: true, message: 'DPIA created successfully', dpiaId: dpia.id };
    } catch (error) {
      console.error('Error creating DPIA:', error);
      return { success: false, message: 'Failed to create DPIA' };
    }
  }

  // Create privacy notice
  async createPrivacyNotice(
    language: string,
    content: GDPRPrivacyNotice['content']
  ): Promise<{ success: boolean; message: string; noticeId?: string }> {
    try {
      // Create privacy notice
      const notice: GDPRPrivacyNotice = {
        id: `notice_${language}_${Date.now()}`,
        version: '1.0',
        effectiveDate: new Date(),
        language,
        content,
        consentRequired: true,
        consentText: 'I consent to the processing of my personal data as described in this privacy notice.',
        withdrawalMethod: 'mobile_app_settings',
      };

      // Save to Firestore
      await firestore()
        .collection('gdpr_privacy_notices')
        .doc(notice.id)
        .set(notice);

      // Save locally
      this.privacyNotices.set(notice.id, notice);

      // Log privacy notice creation
      await this.logAuditEvent('privacy_notice_created', 'system', {
        noticeId: notice.id,
        language,
        version: notice.version,
      });

      return { success: true, message: 'Privacy notice created successfully', noticeId: notice.id };
    } catch (error) {
      console.error('Error creating privacy notice:', error);
      return { success: false, message: 'Failed to create privacy notice' };
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

    // Validate phone format
    const phoneRegex = /^(\+27|0)[0-9]{9}$/;
    if (!phoneRegex.test(personalData.phone)) {
      return { isValid: false, message: 'Invalid phone number format' };
    }

    return { isValid: true, message: 'Personal data is valid' };
  }

  // Get valid consent
  private async getValidConsent(userId: string, consentType: string): Promise<GDPRConsent | null> {
    try {
      const query = await firestore()
        .collection('gdpr_consents')
        .where('userId', '==', userId)
        .where('consentType', '==', consentType)
        .where('granted', '==', true)
        .where('expiresAt', '>', new Date())
        .get();

      if (!query.empty) {
        const doc = query.docs[0];
        return doc.data() as GDPRConsent;
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
      await firestore().collection('gdpr_data_subjects').doc(userId).delete();
      
      // Delete from local storage
      await AsyncStorage.removeItem('userProfile');
      await AsyncStorage.removeItem('authToken');
    } catch (error) {
      console.error('Error deleting user data:', error);
    }
  }

  // Update data subject
  private async updateDataSubject(dataSubject: GDPRDataSubject): Promise<void> {
    try {
      // Update in Firestore
      await firestore()
        .collection('gdpr_data_subjects')
        .doc(dataSubject.id)
        .update(dataSubject);

      // Update locally
      this.dataSubjects.set(dataSubject.userId, dataSubject);
    } catch (error) {
      console.error('Error updating data subject:', error);
    }
  }

  // Assess risk to rights
  private assessRiskToRights(
    severity: string,
    dataTypes: string[],
    affectedUsers: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    let riskScore = 0;

    // Severity scoring
    switch (severity) {
      case 'low': riskScore += 1; break;
      case 'medium': riskScore += 2; break;
      case 'high': riskScore += 3; break;
      case 'critical': riskScore += 4; break;
    }

    // Data types scoring
    if (dataTypes.includes('financial_information')) riskScore += 2;
    if (dataTypes.includes('personal_identifiers')) riskScore += 1;
    if (dataTypes.includes('location_data')) riskScore += 1;

    // Affected users scoring
    if (affectedUsers > 1000) riskScore += 2;
    else if (affectedUsers > 100) riskScore += 1;

    // Determine risk level
    if (riskScore >= 6) return 'critical';
    if (riskScore >= 4) return 'high';
    if (riskScore >= 2) return 'medium';
    return 'low';
  }

  // Assess risk level for DPIA
  private assessRiskLevel(
    dataTypes: string[],
    dataSubjects: number,
    riskFactors: string[]
  ): 'low' | 'medium' | 'high' | 'critical' {
    let riskScore = 0;

    // Data types scoring
    if (dataTypes.includes('financial_information')) riskScore += 2;
    if (dataTypes.includes('personal_identifiers')) riskScore += 1;
    if (dataTypes.includes('location_data')) riskScore += 1;
    if (dataTypes.includes('behavioral_data')) riskScore += 1;

    // Data subjects scoring
    if (dataSubjects > 10000) riskScore += 2;
    else if (dataSubjects > 1000) riskScore += 1;

    // Risk factors scoring
    riskFactors.forEach(factor => {
      if (factor.includes('automated_decision_making')) riskScore += 2;
      if (factor.includes('profiling')) riskScore += 2;
      if (factor.includes('cross_border_transfer')) riskScore += 1;
      if (factor.includes('third_party_sharing')) riskScore += 1;
    });

    // Determine risk level
    if (riskScore >= 6) return 'critical';
    if (riskScore >= 4) return 'high';
    if (riskScore >= 2) return 'medium';
    return 'low';
  }

  // Notify regulatory authority
  private async notifyRegulatoryAuthority(breach: GDPRDataBreach): Promise<void> {
    // Implementation would send notification to relevant regulatory authority
    console.log('Notifying regulatory authority of data breach:', breach.id);
  }

  // Notify affected users
  private async notifyAffectedUsers(breach: GDPRDataBreach): Promise<void> {
    // Implementation would send notifications to affected users
    console.log('Notifying affected users of data breach:', breach.id);
  }

  // Load consent registry
  private async loadConsentRegistry(): Promise<void> {
    try {
      const query = await firestore().collection('gdpr_consents').get();
      query.docs.forEach(doc => {
        const consent = doc.data() as GDPRConsent;
        this.consentRegistry.set(consent.id, consent);
      });
    } catch (error) {
      console.error('Error loading consent registry:', error);
    }
  }

  // Load data subjects
  private async loadDataSubjects(): Promise<void> {
    try {
      const query = await firestore().collection('gdpr_data_subjects').get();
      query.docs.forEach(doc => {
        const dataSubject = doc.data() as GDPRDataSubject;
        this.dataSubjects.set(dataSubject.userId, dataSubject);
      });
    } catch (error) {
      console.error('Error loading data subjects:', error);
    }
  }

  // Load data breaches
  private async loadDataBreaches(): Promise<void> {
    try {
      const query = await firestore().collection('gdpr_data_breaches').get();
      query.docs.forEach(doc => {
        const breach = doc.data() as GDPRDataBreach;
        this.dataBreaches.push(breach);
      });
    } catch (error) {
      console.error('Error loading data breaches:', error);
    }
  }

  // Load DPIAs
  private async loadDPIAs(): Promise<void> {
    try {
      const query = await firestore().collection('gdpr_dpias').get();
      query.docs.forEach(doc => {
        const dpia = doc.data() as GDPRDataProtectionImpactAssessment;
        this.dpias.push(dpia);
      });
    } catch (error) {
      console.error('Error loading DPIAs:', error);
    }
  }

  // Load privacy notices
  private async loadPrivacyNotices(): Promise<void> {
    try {
      const query = await firestore().collection('gdpr_privacy_notices').get();
      query.docs.forEach(doc => {
        const notice = doc.data() as GDPRPrivacyNotice;
        this.privacyNotices.set(notice.id, notice);
      });
    } catch (error) {
      console.error('Error loading privacy notices:', error);
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

  // Set up breach notification monitoring
  private setupBreachNotificationMonitoring(): void {
    // Check for breach notification deadlines every hour
    setInterval(() => {
      this.checkBreachNotificationDeadlines();
    }, 60 * 60 * 1000);
  }

  // Clean up expired data
  private async cleanupExpiredData(): Promise<void> {
    try {
      const cutoffDate = new Date(Date.now() - GDPR_CONFIG.DATA_RETENTION_PERIOD);
      
      // Clean up expired data subjects
      for (const [userId, dataSubject] of this.dataSubjects.entries()) {
        if (dataSubject.createdAt < cutoffDate) {
          await this.deleteUserData(userId);
          this.dataSubjects.delete(userId);
        }
      }
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
          .collection('gdpr_consents')
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

  // Check breach notification deadlines
  private async checkBreachNotificationDeadlines(): Promise<void> {
    try {
      const now = new Date();
      const overdueBreaches = this.dataBreaches.filter(
        breach => breach.notificationDeadline < now && !breach.reported
      );

      for (const breach of overdueBreaches) {
        // Mark as reported
        breach.reported = true;
        breach.reportedAt = now;

        // Update in Firestore
        await firestore()
          .collection('gdpr_data_breaches')
          .doc(breach.id)
          .update({
            reported: true,
            reportedAt: now,
          });

        // Log notification
        await this.logAuditEvent('breach_notification_overdue', 'system', {
          breachId: breach.id,
          severity: breach.severity,
          riskToRights: breach.riskToRights,
        });
      }
    } catch (error) {
      console.error('Error checking breach notification deadlines:', error);
    }
  }

  // Log audit event
  private async logAuditEvent(action: string, userId: string, details: any): Promise<void> {
    try {
      const auditLog = {
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        userId,
        action,
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
        .collection('gdpr_audit_logs')
        .doc(auditLog.id)
        .set(auditLog);
    } catch (error) {
      console.error('Error logging audit event:', error);
    }
  }

  // Get user's consent status
  async getUserConsentStatus(userId: string): Promise<GDPRConsent[]> {
    return Array.from(this.consentRegistry.values())
      .filter(consent => consent.userId === userId);
  }

  // Get user's data subject record
  getUserDataSubject(userId: string): GDPRDataSubject | null {
    return this.dataSubjects.get(userId) || null;
  }

  // Get data breaches
  getDataBreaches(): GDPRDataBreach[] {
    return this.dataBreaches;
  }

  // Get DPIAs
  getDPIAs(): GDPRDataProtectionImpactAssessment[] {
    return this.dpias;
  }

  // Get privacy notices
  getPrivacyNotices(): GDPRPrivacyNotice[] {
    return Array.from(this.privacyNotices.values());
  }
}

// Export singleton instance
export default new GDPRComplianceService();
