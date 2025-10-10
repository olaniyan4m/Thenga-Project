// 🔐 Thenga Audit Logging Service
// Comprehensive audit logging and monitoring for security and compliance

import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';

// Audit logging configuration
const AUDIT_CONFIG = {
  LOG_RETENTION_PERIOD: 3 * 365 * 24 * 60 * 60 * 1000, // 3 years in milliseconds
  MAX_LOCAL_LOGS: 1000,
  SYNC_INTERVAL: 5 * 60 * 1000, // 5 minutes
  CRITICAL_EVENT_THRESHOLD: 10,
  SUSPICIOUS_ACTIVITY_THRESHOLD: 5,
  REAL_TIME_MONITORING: true,
  ALERT_ENABLED: true,
};

export interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  sessionId: string;
  action: string;
  resource: string;
  result: 'success' | 'failure' | 'error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'authentication' | 'authorization' | 'data_access' | 'data_modification' | 'data_deletion' | 'system' | 'security' | 'compliance';
  description: string;
  details: any;
  ipAddress: string;
  deviceId: string;
  userAgent: string;
  location?: {
    latitude: number;
    longitude: number;
    country: string;
    region: string;
  };
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  complianceFlags: string[];
  tags: string[];
}

export interface SecurityAlert {
  id: string;
  timestamp: Date;
  alertType: 'suspicious_activity' | 'failed_authentication' | 'data_breach' | 'unauthorized_access' | 'system_compromise' | 'compliance_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedUsers: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  resolution: string;
  details: any;
}

export interface ComplianceReport {
  id: string;
  timestamp: Date;
  reportType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    totalEvents: number;
    criticalEvents: number;
    securityAlerts: number;
    complianceViolations: number;
    dataAccessEvents: number;
    authenticationEvents: number;
    authorizationEvents: number;
    dataModificationEvents: number;
    dataDeletionEvents: number;
  };
  trends: {
    eventTrend: 'increasing' | 'decreasing' | 'stable';
    securityTrend: 'improving' | 'deteriorating' | 'stable';
    complianceTrend: 'improving' | 'deteriorating' | 'stable';
  };
  recommendations: string[];
  status: 'draft' | 'review' | 'approved' | 'published';
}

class AuditLoggingService {
  private auditLogs: AuditLog[] = [];
  private securityAlerts: SecurityAlert[] = [];
  private complianceReports: ComplianceReport[] = [];
  private sessionId: string;
  private isMonitoring: boolean = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeAuditLogging();
  }

  // Initialize audit logging
  private async initializeAuditLogging() {
    try {
      // Load existing audit logs
      await this.loadAuditLogs();
      await this.loadSecurityAlerts();
      await this.loadComplianceReports();
      
      // Set up real-time monitoring
      if (AUDIT_CONFIG.REAL_TIME_MONITORING) {
        this.setupRealTimeMonitoring();
      }
      
      // Set up periodic sync
      this.setupPeriodicSync();
      
      // Set up log cleanup
      this.setupLogCleanup();
      
      // Set up compliance reporting
      this.setupComplianceReporting();
    } catch (error) {
      console.error('Audit logging initialization error:', error);
    }
  }

  // Log audit event
  async logEvent(
    action: string,
    resource: string,
    result: AuditLog['result'],
    severity: AuditLog['severity'],
    category: AuditLog['category'],
    description: string,
    details: any = {},
    userId: string = 'anonymous'
  ): Promise<{ success: boolean; logId?: string; error?: string }> {
    try {
      // Create audit log
      const auditLog: AuditLog = {
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        userId,
        sessionId: this.sessionId,
        action,
        resource,
        result,
        severity,
        category,
        description,
        details,
        ipAddress: 'unknown', // Would get from network request
        deviceId: await DeviceInfo.getUniqueId(),
        userAgent: `${Platform.OS} ${await DeviceInfo.getVersion()}`,
        riskLevel: this.assessRiskLevel(severity, category, result),
        complianceFlags: this.getComplianceFlags(category, action),
        tags: this.generateTags(action, resource, category),
      };

      // Store audit log
      await this.storeAuditLog(auditLog);

      // Check for suspicious activity
      await this.checkSuspiciousActivity(auditLog);

      // Check for compliance violations
      await this.checkComplianceViolations(auditLog);

      // Generate alerts if necessary
      await this.generateAlerts(auditLog);

      return { success: true, logId: auditLog.id };
    } catch (error) {
      console.error('Error logging audit event:', error);
      return { success: false, error: 'Failed to log audit event' };
    }
  }

  // Log authentication event
  async logAuthenticationEvent(
    action: 'login' | 'logout' | 'login_failed' | 'password_reset' | 'account_locked',
    userId: string,
    result: AuditLog['result'],
    details: any = {}
  ): Promise<{ success: boolean; logId?: string; error?: string }> {
    const severity = result === 'failure' ? 'high' : 'medium';
    const description = `Authentication ${action} for user ${userId}`;
    
    return await this.logEvent(
      action,
      'authentication',
      result,
      severity,
      'authentication',
      description,
      details,
      userId
    );
  }

  // Log data access event
  async logDataAccessEvent(
    action: 'read' | 'write' | 'update' | 'delete' | 'export',
    resource: string,
    userId: string,
    result: AuditLog['result'],
    details: any = {}
  ): Promise<{ success: boolean; logId?: string; error?: string }> {
    const severity = action === 'delete' ? 'high' : 'medium';
    const description = `Data ${action} on ${resource} by user ${userId}`;
    
    return await this.logEvent(
      action,
      resource,
      result,
      severity,
      'data_access',
      description,
      details,
      userId
    );
  }

  // Log security event
  async logSecurityEvent(
    action: string,
    resource: string,
    severity: AuditLog['severity'],
    description: string,
    details: any = {},
    userId: string = 'system'
  ): Promise<{ success: boolean; logId?: string; error?: string }> {
    return await this.logEvent(
      action,
      resource,
      'success',
      severity,
      'security',
      description,
      details,
      userId
    );
  }

  // Log compliance event
  async logComplianceEvent(
    action: string,
    resource: string,
    description: string,
    details: any = {},
    userId: string = 'system'
  ): Promise<{ success: boolean; logId?: string; error?: string }> {
    return await this.logEvent(
      action,
      resource,
      'success',
      'medium',
      'compliance',
      description,
      details,
      userId
    );
  }

  // Check for suspicious activity
  private async checkSuspiciousActivity(auditLog: AuditLog): Promise<void> {
    try {
      // Check for multiple failed authentication attempts
      if (auditLog.category === 'authentication' && auditLog.result === 'failure') {
        const recentFailures = this.auditLogs.filter(log => 
          log.category === 'authentication' &&
          log.result === 'failure' &&
          log.userId === auditLog.userId &&
          new Date().getTime() - log.timestamp.getTime() < 15 * 60 * 1000 // Last 15 minutes
        );

        if (recentFailures.length >= AUDIT_CONFIG.SUSPICIOUS_ACTIVITY_THRESHOLD) {
          await this.createSecurityAlert(
            'failed_authentication',
            'high',
            `Multiple failed authentication attempts for user ${auditLog.userId}`,
            [auditLog.userId],
            'high',
            {
              failureCount: recentFailures.length,
              timeWindow: '15 minutes',
              userId: auditLog.userId,
            }
          );
        }
      }

      // Check for unusual data access patterns
      if (auditLog.category === 'data_access') {
        const recentAccess = this.auditLogs.filter(log => 
          log.category === 'data_access' &&
          log.userId === auditLog.userId &&
          new Date().getTime() - log.timestamp.getTime() < 60 * 60 * 1000 // Last hour
        );

        if (recentAccess.length > 100) {
          await this.createSecurityAlert(
            'suspicious_activity',
            'medium',
            `Unusual data access pattern for user ${auditLog.userId}`,
            [auditLog.userId],
            'medium',
            {
              accessCount: recentAccess.length,
              timeWindow: '1 hour',
              userId: auditLog.userId,
            }
          );
        }
      }

      // Check for critical events
      if (auditLog.severity === 'critical') {
        const recentCritical = this.auditLogs.filter(log => 
          log.severity === 'critical' &&
          new Date().getTime() - log.timestamp.getTime() < 60 * 60 * 1000 // Last hour
        );

        if (recentCritical.length >= AUDIT_CONFIG.CRITICAL_EVENT_THRESHOLD) {
          await this.createSecurityAlert(
            'system_compromise',
            'critical',
            `Multiple critical events detected`,
            [auditLog.userId],
            'critical',
            {
              criticalEventCount: recentCritical.length,
              timeWindow: '1 hour',
              events: recentCritical.map(log => log.action),
            }
          );
        }
      }
    } catch (error) {
      console.error('Error checking suspicious activity:', error);
    }
  }

  // Check for compliance violations
  private async checkComplianceViolations(auditLog: AuditLog): Promise<void> {
    try {
      // Check for unauthorized data access
      if (auditLog.category === 'data_access' && auditLog.result === 'failure') {
        await this.createSecurityAlert(
          'unauthorized_access',
          'high',
          `Unauthorized data access attempt on ${auditLog.resource}`,
          [auditLog.userId],
          'high',
          {
            resource: auditLog.resource,
            userId: auditLog.userId,
            action: auditLog.action,
          }
        );
      }

      // Check for data deletion without proper authorization
      if (auditLog.action === 'delete' && auditLog.category === 'data_access') {
        await this.createSecurityAlert(
          'compliance_violation',
          'medium',
          `Data deletion on ${auditLog.resource}`,
          [auditLog.userId],
          'medium',
          {
            resource: auditLog.resource,
            userId: auditLog.userId,
            action: auditLog.action,
          }
        );
      }

      // Check for cross-border data transfer
      if (auditLog.details && auditLog.details.crossBorderTransfer) {
        await this.logComplianceEvent(
          'cross_border_transfer',
          auditLog.resource,
          `Cross-border data transfer detected`,
          auditLog.details,
          auditLog.userId
        );
      }
    } catch (error) {
      console.error('Error checking compliance violations:', error);
    }
  }

  // Generate alerts
  private async generateAlerts(auditLog: AuditLog): Promise<void> {
    try {
      // Generate alert for critical events
      if (auditLog.severity === 'critical') {
        await this.createSecurityAlert(
          'system_compromise',
          'critical',
          `Critical event: ${auditLog.description}`,
          [auditLog.userId],
          'critical',
          auditLog.details
        );
      }

      // Generate alert for high severity events
      if (auditLog.severity === 'high' && auditLog.result === 'failure') {
        await this.createSecurityAlert(
          'security_breach',
          'high',
          `High severity event: ${auditLog.description}`,
          [auditLog.userId],
          'high',
          auditLog.details
        );
      }
    } catch (error) {
      console.error('Error generating alerts:', error);
    }
  }

  // Create security alert
  private async createSecurityAlert(
    alertType: SecurityAlert['alertType'],
    severity: SecurityAlert['severity'],
    description: string,
    affectedUsers: string[],
    riskLevel: SecurityAlert['riskLevel'],
    details: any
  ): Promise<void> {
    try {
      const alert: SecurityAlert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        alertType,
        severity,
        description,
        affectedUsers,
        riskLevel,
        status: 'new',
        assignedTo: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        resolution: '',
        details,
      };

      // Save to Firestore
      await firestore()
        .collection('security_alerts')
        .doc(alert.id)
        .set(alert);

      // Save locally
      this.securityAlerts.push(alert);

      // Send real-time notification if enabled
      if (AUDIT_CONFIG.ALERT_ENABLED) {
        await this.sendAlertNotification(alert);
      }
    } catch (error) {
      console.error('Error creating security alert:', error);
    }
  }

  // Send alert notification
  private async sendAlertNotification(alert: SecurityAlert): Promise<void> {
    // Implementation would send notification to security team
    console.log('Security Alert:', alert.description);
  }

  // Generate compliance report
  async generateComplianceReport(
    reportType: ComplianceReport['reportType'],
    period: { start: Date; end: Date }
  ): Promise<{ success: boolean; reportId?: string; error?: string }> {
    try {
      // Get logs for the period
      const periodLogs = this.auditLogs.filter(log => 
        log.timestamp >= period.start && log.timestamp <= period.end
      );

      // Calculate metrics
      const metrics = {
        totalEvents: periodLogs.length,
        criticalEvents: periodLogs.filter(log => log.severity === 'critical').length,
        securityAlerts: this.securityAlerts.filter(alert => 
          alert.createdAt >= period.start && alert.createdAt <= period.end
        ).length,
        complianceViolations: periodLogs.filter(log => 
          log.complianceFlags.length > 0
        ).length,
        dataAccessEvents: periodLogs.filter(log => log.category === 'data_access').length,
        authenticationEvents: periodLogs.filter(log => log.category === 'authentication').length,
        authorizationEvents: periodLogs.filter(log => log.category === 'authorization').length,
        dataModificationEvents: periodLogs.filter(log => log.category === 'data_modification').length,
        dataDeletionEvents: periodLogs.filter(log => log.category === 'data_deletion').length,
      };

      // Calculate trends
      const trends = this.calculateTrends(periodLogs);

      // Generate recommendations
      const recommendations = this.generateRecommendations(metrics, trends);

      // Create compliance report
      const report: ComplianceReport = {
        id: `report_${reportType}_${Date.now()}`,
        timestamp: new Date(),
        reportType,
        period,
        metrics,
        trends,
        recommendations,
        status: 'draft',
      };

      // Save to Firestore
      await firestore()
        .collection('compliance_reports')
        .doc(report.id)
        .set(report);

      // Save locally
      this.complianceReports.push(report);

      return { success: true, reportId: report.id };
    } catch (error) {
      console.error('Error generating compliance report:', error);
      return { success: false, error: 'Failed to generate compliance report' };
    }
  }

  // Calculate trends
  private calculateTrends(logs: AuditLog[]): ComplianceReport['trends'] {
    // Simplified trend calculation
    const totalEvents = logs.length;
    const criticalEvents = logs.filter(log => log.severity === 'critical').length;
    const securityEvents = logs.filter(log => log.category === 'security').length;

    return {
      eventTrend: totalEvents > 1000 ? 'increasing' : 'stable',
      securityTrend: securityEvents > 100 ? 'deteriorating' : 'stable',
      complianceTrend: criticalEvents > 10 ? 'deteriorating' : 'stable',
    };
  }

  // Generate recommendations
  private generateRecommendations(metrics: any, trends: any): string[] {
    const recommendations: string[] = [];

    if (metrics.criticalEvents > 10) {
      recommendations.push('Review and address critical events immediately');
    }

    if (metrics.securityAlerts > 50) {
      recommendations.push('Implement additional security measures');
    }

    if (trends.securityTrend === 'deteriorating') {
      recommendations.push('Conduct security assessment and training');
    }

    if (metrics.complianceViolations > 20) {
      recommendations.push('Review compliance procedures and training');
    }

    return recommendations;
  }

  // Store audit log
  private async storeAuditLog(auditLog: AuditLog): Promise<void> {
    try {
      // Save to Firestore
      await firestore()
        .collection('audit_logs')
        .doc(auditLog.id)
        .set(auditLog);

      // Save locally
      this.auditLogs.unshift(auditLog);
      
      // Keep only last N logs locally
      if (this.auditLogs.length > AUDIT_CONFIG.MAX_LOCAL_LOGS) {
        this.auditLogs = this.auditLogs.slice(0, AUDIT_CONFIG.MAX_LOCAL_LOGS);
      }
    } catch (error) {
      console.error('Error storing audit log:', error);
    }
  }

  // Generate session ID
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Assess risk level
  private assessRiskLevel(
    severity: AuditLog['severity'],
    category: AuditLog['category'],
    result: AuditLog['result']
  ): AuditLog['riskLevel'] {
    let riskScore = 0;

    // Severity scoring
    switch (severity) {
      case 'low': riskScore += 1; break;
      case 'medium': riskScore += 2; break;
      case 'high': riskScore += 3; break;
      case 'critical': riskScore += 4; break;
    }

    // Category scoring
    switch (category) {
      case 'authentication': riskScore += 1; break;
      case 'authorization': riskScore += 2; break;
      case 'data_access': riskScore += 1; break;
      case 'data_modification': riskScore += 2; break;
      case 'data_deletion': riskScore += 3; break;
      case 'security': riskScore += 3; break;
      case 'compliance': riskScore += 2; break;
    }

    // Result scoring
    if (result === 'failure') riskScore += 2;
    if (result === 'error') riskScore += 3;

    // Determine risk level
    if (riskScore >= 8) return 'critical';
    if (riskScore >= 6) return 'high';
    if (riskScore >= 4) return 'medium';
    return 'low';
  }

  // Get compliance flags
  private getComplianceFlags(category: AuditLog['category'], action: string): string[] {
    const flags: string[] = [];

    if (category === 'data_access' && action === 'delete') {
      flags.push('data_deletion');
    }

    if (category === 'authentication' && action === 'login_failed') {
      flags.push('failed_authentication');
    }

    if (category === 'authorization' && action === 'unauthorized_access') {
      flags.push('unauthorized_access');
    }

    return flags;
  }

  // Generate tags
  private generateTags(action: string, resource: string, category: AuditLog['category']): string[] {
    const tags: string[] = [category, action];

    if (resource.includes('payment')) tags.push('payment');
    if (resource.includes('user')) tags.push('user_data');
    if (resource.includes('business')) tags.push('business_data');

    return tags;
  }

  // Set up real-time monitoring
  private setupRealTimeMonitoring(): void {
    this.isMonitoring = true;
    
    // Monitor for critical events
    setInterval(() => {
      this.monitorCriticalEvents();
    }, 60000); // Check every minute
  }

  // Set up periodic sync
  private setupPeriodicSync(): void {
    setInterval(() => {
      this.syncAuditLogs();
    }, AUDIT_CONFIG.SYNC_INTERVAL);
  }

  // Set up log cleanup
  private setupLogCleanup(): void {
    setInterval(() => {
      this.cleanupExpiredLogs();
    }, 24 * 60 * 60 * 1000); // Daily cleanup
  }

  // Set up compliance reporting
  private setupComplianceReporting(): void {
    // Generate daily reports
    setInterval(() => {
      this.generateDailyReport();
    }, 24 * 60 * 60 * 1000); // Daily
  }

  // Monitor critical events
  private async monitorCriticalEvents(): Promise<void> {
    if (!this.isMonitoring) return;

    const recentCritical = this.auditLogs.filter(log => 
      log.severity === 'critical' &&
      new Date().getTime() - log.timestamp.getTime() < 5 * 60 * 1000 // Last 5 minutes
    );

    if (recentCritical.length > 0) {
      console.log(`Critical events detected: ${recentCritical.length}`);
    }
  }

  // Sync audit logs
  private async syncAuditLogs(): Promise<void> {
    // Implementation would sync logs with central server
    console.log('Syncing audit logs...');
  }

  // Clean up expired logs
  private async cleanupExpiredLogs(): Promise<void> {
    try {
      const cutoffDate = new Date(Date.now() - AUDIT_CONFIG.LOG_RETENTION_PERIOD);
      
      // Clean up expired logs
      this.auditLogs = this.auditLogs.filter(log => log.timestamp >= cutoffDate);
      
      // Clean up expired security alerts
      this.securityAlerts = this.securityAlerts.filter(alert => 
        alert.createdAt >= cutoffDate
      );
    } catch (error) {
      console.error('Error cleaning up expired logs:', error);
    }
  }

  // Generate daily report
  private async generateDailyReport(): Promise<void> {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    await this.generateComplianceReport('daily', {
      start: yesterday,
      end: today,
    });
  }

  // Load audit logs
  private async loadAuditLogs(): Promise<void> {
    try {
      const query = await firestore()
        .collection('audit_logs')
        .orderBy('timestamp', 'desc')
        .limit(AUDIT_CONFIG.MAX_LOCAL_LOGS)
        .get();
      
      query.docs.forEach(doc => {
        const log = doc.data() as AuditLog;
        this.auditLogs.push(log);
      });
    } catch (error) {
      console.error('Error loading audit logs:', error);
    }
  }

  // Load security alerts
  private async loadSecurityAlerts(): Promise<void> {
    try {
      const query = await firestore()
        .collection('security_alerts')
        .orderBy('createdAt', 'desc')
        .limit(100)
        .get();
      
      query.docs.forEach(doc => {
        const alert = doc.data() as SecurityAlert;
        this.securityAlerts.push(alert);
      });
    } catch (error) {
      console.error('Error loading security alerts:', error);
    }
  }

  // Load compliance reports
  private async loadComplianceReports(): Promise<void> {
    try {
      const query = await firestore()
        .collection('compliance_reports')
        .orderBy('timestamp', 'desc')
        .limit(50)
        .get();
      
      query.docs.forEach(doc => {
        const report = doc.data() as ComplianceReport;
        this.complianceReports.push(report);
      });
    } catch (error) {
      console.error('Error loading compliance reports:', error);
    }
  }

  // Get audit logs for user
  getUserAuditLogs(userId: string): AuditLog[] {
    return this.auditLogs.filter(log => log.userId === userId);
  }

  // Get security alerts
  getSecurityAlerts(): SecurityAlert[] {
    return this.securityAlerts;
  }

  // Get compliance reports
  getComplianceReports(): ComplianceReport[] {
    return this.complianceReports;
  }

  // Get audit statistics
  getAuditStatistics(): any {
    const totalEvents = this.auditLogs.length;
    const criticalEvents = this.auditLogs.filter(log => log.severity === 'critical').length;
    const securityAlerts = this.securityAlerts.length;
    const complianceReports = this.complianceReports.length;

    return {
      totalEvents,
      criticalEvents,
      securityAlerts,
      complianceReports,
      criticalEventRate: totalEvents > 0 ? (criticalEvents / totalEvents) * 100 : 0,
    };
  }
}

// Export singleton instance
export default new AuditLoggingService();
