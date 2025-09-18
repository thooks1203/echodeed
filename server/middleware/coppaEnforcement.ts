/**
 * COPPA Enforcement Middleware
 * 
 * Global access blocking middleware that enforces COPPA compliance
 * by blocking access for under-13 students until parental consent is approved.
 * 
 * Critical for Burlington, NC middle schools compliance.
 */

import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { securityAuditLogger } from '../services/auditLogger';

export interface COPPAEnforcedRequest extends Request {
  user?: any;
  coppaStatus?: {
    isStudent: boolean;
    isUnder13: boolean;
    consentStatus: string;
    requiresParentalConsent: boolean;
    accessBlocked: boolean;
  };
}

/**
 * Global COPPA enforcement middleware - blocks access until parental consent approved
 */
export const enforceCOPPA = async (req: COPPAEnforcedRequest, res: Response, next: NextFunction) => {
  try {
    // Skip COPPA checks for non-authenticated requests and specific endpoints
    if (!req.user?.claims?.sub || shouldSkipCOPPACheck(req.path)) {
      return next();
    }

    const userId = req.user.claims.sub;
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    // Check if user is a student
    const user = await storage.getUser(userId);
    if (!user || user.schoolRole !== 'student') {
      // Not a student - allow access
      req.coppaStatus = {
        isStudent: false,
        isUnder13: false,
        consentStatus: 'not_applicable',
        requiresParentalConsent: false,
        accessBlocked: false
      };
      return next();
    }

    // Get student account details for COPPA compliance check
    const studentAccount = await storage.getStudentAccount(userId);
    if (!studentAccount) {
      // Student account not found - this might be a registration in progress
      req.coppaStatus = {
        isStudent: true,
        isUnder13: false, // Default to false for safety
        consentStatus: 'unknown',
        requiresParentalConsent: false,
        accessBlocked: false
      };
      return next();
    }

    // Calculate student age
    const currentYear = new Date().getFullYear();
    const studentAge = currentYear - (studentAccount.birthYear || currentYear);
    const isUnder13 = studentAge < 13;

    // 🛡️ COPPA ENFORCEMENT: Block access for under-13 students without approved consent
    if (isUnder13) {
      const consentStatus = studentAccount.parentalConsentStatus || 'pending';
      const isAccountActive = studentAccount.isAccountActive === 1;
      
      // Block access if consent not approved or account not active
      if (consentStatus !== 'approved' || !isAccountActive) {
        req.coppaStatus = {
          isStudent: true,
          isUnder13: true,
          consentStatus,
          requiresParentalConsent: true,
          accessBlocked: true
        };

        // 🔒 AUDIT: Log blocked access attempt
        await securityAuditLogger.logClaimCodeEvent({
          userId,
          userRole: 'student',
          schoolId: studentAccount.schoolId,
          action: 'REDEEM_FAILED',
          details: {
            blockReason: 'COPPA_COMPLIANCE',
            consentStatus,
            studentAge,
            isAccountActive,
            endpoint: req.path,
            method: req.method
          },
          ipAddress,
          userAgent: req.get('User-Agent'),
          success: false,
          errorMessage: 'Access blocked pending parental consent'
        });

        // Return COPPA compliance error
        return res.status(403).json({
          error: 'Account access restricted pending parental consent',
          errorCode: 'COPPA_CONSENT_REQUIRED',
          details: {
            requiresParentalConsent: true,
            consentStatus,
            parentNotificationEmail: studentAccount.parentNotificationEmail,
            message: consentStatus === 'pending' 
              ? 'A parental consent email has been sent. Please ask your parent/guardian to approve your account.'
              : 'Parental consent is required to activate your account. Please contact your teacher.'
          }
        });
      }
    }

    // Access allowed - set status and continue
    req.coppaStatus = {
      isStudent: true,
      isUnder13,
      consentStatus: studentAccount.parentalConsentStatus || 'not_required',
      requiresParentalConsent: isUnder13,
      accessBlocked: false
    };

    next();

  } catch (error) {
    console.error('COPPA enforcement error:', error);
    
    // 🔒 AUDIT: Log enforcement failure
    try {
      await securityAuditLogger.logClaimCodeEvent({
        userId: req.user?.claims?.sub || 'unknown',
        userRole: 'student',
        action: 'REDEEM_FAILED',
        details: {
          blockReason: 'COPPA_ENFORCEMENT_ERROR',
          error: error instanceof Error ? error.message : 'Unknown error',
          endpoint: req.path
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: false,
        errorMessage: 'COPPA enforcement middleware error'
      });
    } catch (auditError) {
      console.error('Failed to log COPPA enforcement error:', auditError);
    }

    // Fail secure - block access if enforcement fails
    res.status(500).json({
      error: 'Account access verification temporarily unavailable',
      errorCode: 'COPPA_ENFORCEMENT_ERROR'
    });
  }
};

/**
 * Check if endpoint should skip COPPA checks
 */
function shouldSkipCOPPACheck(path: string): boolean {
  const skipPaths = [
    '/api/auth/',           // Authentication endpoints
    '/api/claim-codes/',    // Claim code system (has its own COPPA handling)
    '/api/parental-consent/', // Parental consent endpoints
    '/api/health',          // Health checks
    '/api/monitoring/',     // Monitoring endpoints
    '/favicon.ico',         // Static assets
    '/assets/',            // Static assets
    '/api/logout'          // Logout endpoint
  ];

  return skipPaths.some(skipPath => path.startsWith(skipPath));
}

/**
 * Middleware for endpoints that require explicit COPPA consent verification
 * Use this for sensitive operations beyond basic access
 */
export const requireCOPPACompliance = async (req: COPPAEnforcedRequest, res: Response, next: NextFunction) => {
  // First run standard COPPA enforcement
  await enforceCOPPA(req, res, (err) => {
    if (err || res.headersSent) return;

    // Additional strict checking for sensitive operations
    if (req.coppaStatus?.isUnder13 && req.coppaStatus?.consentStatus !== 'approved') {
      return res.status(403).json({
        error: 'This operation requires verified parental consent',
        errorCode: 'COPPA_STRICT_CONSENT_REQUIRED'
      });
    }

    next();
  });
};