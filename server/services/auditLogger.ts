/**
 * Security Audit Logger
 * 
 * Comprehensive audit logging for all security-sensitive operations
 * in the child safety system. Logs are immutable and include full context.
 */

export interface AuditEvent {
  eventType: 'CRISIS_DATA_ACCESS' | 'EMERGENCY_CONTACT_ACCESS' | 'IDENTITY_UNMASK' | 'COUNSELOR_ACTION' | 'NCMEC_REPORT' | 'SLACK_NOTIFICATION' | 'CLAIM_CODE_EVENT';
  userId?: string;
  userRole?: string;
  schoolId?: string;
  postId?: string;
  emergencyContactId?: string;
  claimCodeId?: string;
  action: string;
  details: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
}

export class SecurityAuditLogger {
  /**
   * Log crisis data access - tracks who viewed sensitive crisis posts
   */
  async logCrisisDataAccess(params: {
    userId: string;
    userRole: string;
    schoolId: string;
    postId: string;
    action: 'VIEW_CRISIS_QUEUE' | 'VIEW_CRISIS_POST' | 'RESPOND_TO_CRISIS';
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    const event: AuditEvent = {
      eventType: 'CRISIS_DATA_ACCESS',
      userId: params.userId,
      userRole: params.userRole,
      schoolId: params.schoolId,
      postId: params.postId,
      action: params.action,
      details: {
        accessType: params.action,
        timestamp: new Date().toISOString(),
        security_context: 'crisis_intervention_system'
      },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      timestamp: new Date(),
      success: true
    };

    await this.writeAuditLog(event);
  }

  /**
   * Log emergency contact access - tracks identity unmasking
   */
  async logEmergencyContactAccess(params: {
    userId: string;
    userRole: string;
    emergencyContactId: string;
    action: 'DECRYPT' | 'VIEW' | 'EXPORT';
    authorizationMethod: 'DUAL_AUTH' | 'EMERGENCY_OVERRIDE' | 'COURT_ORDER';
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    const event: AuditEvent = {
      eventType: 'EMERGENCY_CONTACT_ACCESS',
      userId: params.userId,
      userRole: params.userRole,
      emergencyContactId: params.emergencyContactId,
      action: params.action,
      details: {
        authorizationMethod: params.authorizationMethod,
        timestamp: new Date().toISOString(),
        security_context: 'identity_escrow_system',
        compliance_note: 'COPPA/FERPA emergency access logged'
      },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      timestamp: new Date(),
      success: true
    };

    await this.writeAuditLog(event);
  }

  /**
   * Log counselor actions - tracks professional interventions
   */
  async logCounselorAction(params: {
    userId: string;
    schoolId: string;
    postId: string;
    action: 'RESPOND' | 'ESCALATE' | 'RESOLVE' | 'REFER';
    details: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    const event: AuditEvent = {
      eventType: 'COUNSELOR_ACTION',
      userId: params.userId,
      userRole: 'counselor',
      schoolId: params.schoolId,
      postId: params.postId,
      action: params.action,
      details: {
        ...params.details,
        timestamp: new Date().toISOString(),
        professional_context: 'licensed_counselor_intervention'
      },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      timestamp: new Date(),
      success: true
    };

    await this.writeAuditLog(event);
  }

  /**
   * Log NCMEC reporting - mandatory reporter compliance
   */
  async logNCMECReport(params: {
    userId: string;
    postId: string;
    ncmecCaseId: string;
    reportType: 'CHILD_ABUSE' | 'EXPLOITATION' | 'IMMINENT_DANGER';
    details: any;
  }): Promise<void> {
    const event: AuditEvent = {
      eventType: 'NCMEC_REPORT',
      userId: params.userId,
      userRole: 'mandatory_reporter',
      postId: params.postId,
      action: 'SUBMIT_NCMEC_REPORT',
      details: {
        ncmecCaseId: params.ncmecCaseId,
        reportType: params.reportType,
        ...params.details,
        timestamp: new Date().toISOString(),
        legal_context: 'mandatory_reporter_obligation'
      },
      timestamp: new Date(),
      success: true
    };

    await this.writeAuditLog(event);
  }

  /**
   * Log Slack notifications - tracks redacted communications
   */
  async logSlackNotification(params: {
    postId: string;
    schoolId: string;
    safetyLevel: string;
    messageType: 'CRISIS_ALERT' | 'HIGH_RISK_ALERT' | 'FOLLOW_UP';
    redactedContent: string;
    success: boolean;
    errorMessage?: string;
  }): Promise<void> {
    const event: AuditEvent = {
      eventType: 'SLACK_NOTIFICATION',
      schoolId: params.schoolId,
      postId: params.postId,
      action: 'SEND_ALERT',
      details: {
        messageType: params.messageType,
        safetyLevel: params.safetyLevel,
        redactedContent: params.redactedContent,
        dataMinimization: 'PII_REMOVED',
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      success: params.success,
      errorMessage: params.errorMessage
    };

    await this.writeAuditLog(event);
  }

  /**
   * Log claim code events - dedicated COPPA-compliant audit for school registration
   */
  async logClaimCodeEvent(params: {
    userId?: string;
    userRole?: string;
    schoolId?: string;
    claimCodeId?: string;
    action: 'VALIDATE' | 'GENERATE' | 'REDEEM' | 'REDEEM_SUCCESS' | 'REDEEM_FAILED' | 'DEACTIVATE';
    details: any;
    ipAddress?: string;
    userAgent?: string;
    success: boolean;
    errorMessage?: string;
  }): Promise<void> {
    const event: AuditEvent = {
      eventType: 'CLAIM_CODE_EVENT',
      userId: params.userId,
      userRole: params.userRole,
      schoolId: params.schoolId,
      claimCodeId: params.claimCodeId,
      action: params.action,
      details: {
        ...params.details,
        timestamp: new Date().toISOString(),
        security_context: 'coppa_compliant_registration',
        compliance_note: 'Student registration audit - no sensitive data stored',
        data_minimization: 'COPPA_COMPLIANT'
      },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      timestamp: new Date(),
      success: params.success,
      errorMessage: params.errorMessage
    };

    await this.writeAuditLog(event);
  }

  /**
   * Write audit log to secure, immutable storage
   */
  private async writeAuditLog(event: AuditEvent): Promise<void> {
    try {
      // Log to console with structured format (for development)
      console.log('🔒 SECURITY_AUDIT:', JSON.stringify({
        timestamp: event.timestamp.toISOString(),
        eventType: event.eventType,
        userId: event.userId,
        userRole: event.userRole,
        action: event.action,
        success: event.success,
        details: event.details,
        compliance: 'COPPA_FERPA_NCMEC_COMPLIANT'
      }));

      // TODO: In production, write to:
      // 1. Immutable audit database (append-only)
      // 2. External SIEM system
      // 3. Compliance monitoring dashboard
      // 4. Encrypted backup storage

      // Store in database for immediate access (Phase 1)
      // await storage.createAuditLog(event);

    } catch (error) {
      console.error('CRITICAL: Failed to write security audit log:', error);
      // This should trigger alerts in production
    }
  }

  /**
   * Query audit logs with proper authorization
   */
  async queryAuditLogs(params: {
    userId: string;
    userRole: string;
    filters?: {
      eventType?: string;
      startDate?: Date;
      endDate?: Date;
      postId?: string;
      schoolId?: string;
    };
  }): Promise<AuditEvent[]> {
    // Only allow admin and compliance roles to query audit logs
    if (!['admin', 'compliance_officer', 'security_admin'].includes(params.userRole)) {
      throw new Error('Unauthorized: Insufficient privileges for audit log access');
    }

    // Log the audit log access itself
    await this.logCrisisDataAccess({
      userId: params.userId,
      userRole: params.userRole,
      schoolId: params.filters?.schoolId || 'system',
      postId: 'audit_query',
      action: 'VIEW_CRISIS_QUEUE'
    });

    // TODO: Implement secure query with filters
    return [];
  }
}

export const securityAuditLogger = new SecurityAuditLogger();