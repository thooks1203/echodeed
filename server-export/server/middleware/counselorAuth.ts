/**
 * Counselor Authentication and Authorization Middleware
 * 
 * Implements secure, school-scoped access controls for licensed counselors
 * accessing crisis data. Ensures only verified counselors can access
 * sensitive student information.
 */

import { securityAuditLogger } from '../services/auditLogger';

export interface CounselorUser {
  id: string;
  email: string;
  schoolRole: string;
  schoolId: string;
  licenseNumber?: string;
  licenseState?: string;
  isVerified: boolean;
}

/**
 * Middleware to verify counselor role and school access
 */
export const requireCounselorRole = async (req: any, res: any, next: any) => {
  try {
    if (!req.user?.claims?.sub) {
      return res.status(401).json({ 
        error: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication required for counselor access' 
      });
    }

    const userId = req.user.claims.sub;
    
    // Get user from storage with role verification
    const user = await req.app.locals.storage?.getUser(userId);
    if (!user) {
      return res.status(404).json({ 
        error: 'USER_NOT_FOUND',
        message: 'User account not found' 
      });
    }

    // Verify counselor role
    if (!['counselor', 'admin'].includes(user.schoolRole)) {
      await securityAuditLogger.logCrisisDataAccess({
        userId,
        userRole: user.schoolRole,
        schoolId: user.schoolId || 'unknown',
        postId: 'access_denied',
        action: 'VIEW_CRISIS_QUEUE',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      return res.status(403).json({ 
        error: 'INSUFFICIENT_PRIVILEGES',
        message: 'Counselor role required for crisis data access' 
      });
    }

    // Verify school association
    if (!user.schoolId) {
      return res.status(403).json({ 
        error: 'NO_SCHOOL_ASSOCIATION',
        message: 'School association required for counselor access' 
      });
    }

    // Add counselor context to request
    req.counselor = {
      id: user.id,
      email: user.email,
      schoolRole: user.schoolRole,
      schoolId: user.schoolId,
      isVerified: true // In production, verify license status
    };

    req.userRole = user.schoolRole;
    req.schoolId = user.schoolId;

    next();
  } catch (error) {
    console.error('Counselor authentication failed:', error);
    res.status(500).json({ 
      error: 'AUTHENTICATION_ERROR',
      message: 'Failed to verify counselor credentials' 
    });
  }
};

/**
 * Middleware to verify specific school access for counselors
 */
export const requireSchoolSpecificAccess = (paramName: string = 'schoolId') => {
  return async (req: any, res: any, next: any) => {
    try {
      const requestedSchoolId = req.params[paramName] || req.query[paramName] || req.body[paramName];
      const counselorSchoolId = req.counselor?.schoolId || req.schoolId;

      if (!requestedSchoolId) {
        return res.status(400).json({ 
          error: 'SCHOOL_ID_REQUIRED',
          message: 'School ID is required for this operation' 
        });
      }

      // Counselors can only access data from their own school
      if (requestedSchoolId !== counselorSchoolId && req.counselor?.schoolRole !== 'admin') {
        await securityAuditLogger.logCrisisDataAccess({
          userId: req.counselor?.id || 'unknown',
          userRole: req.userRole || 'unknown',
          schoolId: requestedSchoolId,
          postId: 'cross_school_access_denied',
          action: 'VIEW_CRISIS_QUEUE',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        });

        return res.status(403).json({ 
          error: 'CROSS_SCHOOL_ACCESS_DENIED',
          message: 'Access denied: Counselors can only access data from their own school' 
        });
      }

      next();
    } catch (error) {
      console.error('School access verification failed:', error);
      res.status(500).json({ 
        error: 'ACCESS_VERIFICATION_ERROR',
        message: 'Failed to verify school access' 
      });
    }
  };
};

/**
 * Middleware to verify licensed counselor status (Phase 2)
 */
export const requireLicensedCounselor = async (req: any, res: any, next: any) => {
  try {
    const counselor = req.counselor;
    if (!counselor) {
      return res.status(401).json({ 
        error: 'COUNSELOR_AUTH_REQUIRED',
        message: 'Counselor authentication required' 
      });
    }

    // In production, verify active license status
    // For now, accept counselor role as sufficient
    if (counselor.schoolRole !== 'counselor' && counselor.schoolRole !== 'admin') {
      return res.status(403).json({ 
        error: 'LICENSED_COUNSELOR_REQUIRED',
        message: 'Licensed counselor status required for this operation' 
      });
    }

    // TODO: Implement license verification
    // - Check license number against state database
    // - Verify license is current and in good standing
    // - Check for any disciplinary actions

    next();
  } catch (error) {
    console.error('License verification failed:', error);
    res.status(500).json({ 
      error: 'LICENSE_VERIFICATION_ERROR',
      message: 'Failed to verify counselor license' 
    });
  }
};

/**
 * Middleware to log counselor actions for audit trail
 */
export const logCounselorAction = (action: string) => {
  return async (req: any, res: any, next: any) => {
    // Store action for logging after response
    req.counselorAction = action;
    req.counselorActionTimestamp = new Date();

    // Log after response is sent
    res.on('finish', async () => {
      try {
        if (req.counselor && req.counselorAction) {
          await securityAuditLogger.logCounselorAction({
            userId: req.counselor.id,
            schoolId: req.counselor.schoolId,
            postId: req.params.id || req.params.postId || 'bulk_action',
            action: req.counselorAction,
            details: {
              endpoint: `${req.method} ${req.path}`,
              statusCode: res.statusCode,
              responseTime: Date.now() - req.counselorActionTimestamp.getTime(),
              schoolRole: req.counselor.schoolRole,
              parameters: req.params,
              queryParameters: req.query
            },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
          });
        }
      } catch (error) {
        console.error('Failed to log counselor action:', error);
      }
    });

    next();
  };
};

/**
 * Create school-scoped data filter for counselors
 */
export const createSchoolFilter = (req: any): { schoolId: string } => {
  return {
    schoolId: req.counselor?.schoolId || req.schoolId
  };
};

/**
 * Validate crisis intervention permissions
 */
export const validateCrisisPermissions = async (req: any, res: any, next: any) => {
  try {
    const counselor = req.counselor;
    if (!counselor) {
      return res.status(401).json({ 
        error: 'COUNSELOR_AUTH_REQUIRED',
        message: 'Counselor authentication required for crisis intervention' 
      });
    }

    // Check if counselor has crisis intervention training (Phase 2)
    // For now, all counselors can handle crisis situations
    
    // Ensure proper documentation
    if (req.method === 'POST' && !req.body.interventionReason) {
      return res.status(400).json({ 
        error: 'INTERVENTION_REASON_REQUIRED',
        message: 'Professional justification required for crisis intervention' 
      });
    }

    next();
  } catch (error) {
    console.error('Crisis permission validation failed:', error);
    res.status(500).json({ 
      error: 'PERMISSION_VALIDATION_ERROR',
      message: 'Failed to validate crisis intervention permissions' 
    });
  }
};