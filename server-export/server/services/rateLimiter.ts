/**
 * Rate Limiter Service
 * 
 * Implements rate limiting for sensitive endpoints, particularly the
 * crisis detection analyze-safety endpoint to prevent abuse and
 * ensure system stability during crisis situations.
 */

export interface RateLimitRule {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests allowed in window
  keyGenerator: (req: any) => string; // Function to generate rate limit key
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  message: string; // Error message when rate limit exceeded
}

export interface RateLimitRecord {
  count: number;
  windowStart: number;
  lastRequest: number;
}

export class RateLimiterService {
  private records = new Map<string, RateLimitRecord>();
  
  // Cleanup old records every 5 minutes
  constructor() {
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Safety Analysis Rate Limiter
   * Prevents abuse of crisis detection endpoint while allowing legitimate use
   */
  createSafetyAnalysisLimiter(): (req: any, res: any, next: any) => void {
    const rule: RateLimitRule = {
      windowMs: 60 * 1000, // 1 minute window
      maxRequests: 10, // 10 requests per minute per user/IP
      keyGenerator: (req) => {
        // Use authenticated user ID if available, otherwise IP address
        return req.user?.claims?.sub || req.ip || req.connection.remoteAddress;
      },
      message: 'Too many safety analysis requests. Please wait before analyzing more content.',
      skipSuccessfulRequests: false,
      skipFailedRequests: false
    };

    return this.createMiddleware(rule);
  }

  /**
   * Crisis Queue Access Rate Limiter  
   * Limits counselor access to crisis queue to prevent system overload
   */
  createCrisisQueueLimiter(): (req: any, res: any, next: any) => void {
    const rule: RateLimitRule = {
      windowMs: 60 * 1000, // 1 minute window
      maxRequests: 30, // 30 requests per minute per counselor
      keyGenerator: (req) => {
        return `crisis_queue:${req.user?.claims?.sub}`;
      },
      message: 'Crisis queue access rate exceeded. Please wait before refreshing.',
      skipSuccessfulRequests: false,
      skipFailedRequests: true // Don't count failed auth attempts
    };

    return this.createMiddleware(rule);
  }

  /**
   * Emergency Contact Access Rate Limiter
   * Strict limits on identity unmasking attempts
   */
  createEmergencyContactLimiter(): (req: any, res: any, next: any) => void {
    const rule: RateLimitRule = {
      windowMs: 60 * 60 * 1000, // 1 hour window  
      maxRequests: 5, // Only 5 emergency contact access attempts per hour
      keyGenerator: (req) => {
        return `emergency_contact:${req.user?.claims?.sub}`;
      },
      message: 'Emergency contact access rate exceeded. This action is strictly limited for security.',
      skipSuccessfulRequests: false,
      skipFailedRequests: false
    };

    return this.createMiddleware(rule);
  }

  /**
   * Support Post Submission Rate Limiter
   * Prevents spam while allowing genuine crisis posts
   */
  createSupportPostLimiter(): (req: any, res: any, next: any) => void {
    const rule: RateLimitRule = {
      windowMs: 5 * 60 * 1000, // 5 minute window
      maxRequests: 3, // 3 support posts per 5 minutes
      keyGenerator: (req) => {
        // Use school ID + user to allow multiple students from same school
        const userId = req.user?.claims?.sub || req.ip;
        const schoolId = req.body?.schoolId || 'unknown';
        return `support_post:${schoolId}:${userId}`;
      },
      message: 'Please wait before sharing another support request. If this is urgent, contact a counselor directly.',
      skipSuccessfulRequests: false,
      skipFailedRequests: true
    };

    return this.createMiddleware(rule);
  }

  /**
   * Generic Rate Limiter
   * Creates a rate limiter with custom parameters for claim code endpoints
   */
  createGenericLimiter(options: {
    maxRequests: number;
    windowMs: number;
    message?: string;
    keyGenerator?: (req: any) => string;
  }): (req: any, res: any, next: any) => void {
    const rule: RateLimitRule = {
      windowMs: options.windowMs,
      maxRequests: options.maxRequests,
      keyGenerator: options.keyGenerator || ((req) => {
        return req.user?.claims?.sub || req.ip || req.connection.remoteAddress;
      }),
      message: options.message || `Too many requests. Maximum ${options.maxRequests} requests per ${Math.floor(options.windowMs / 1000)} seconds.`,
      skipSuccessfulRequests: false,
      skipFailedRequests: false
    };

    return this.createMiddleware(rule);
  }

  /**
   * Create rate limiting middleware
   */
  private createMiddleware(rule: RateLimitRule) {
    return (req: any, res: any, next: any) => {
      const key = rule.keyGenerator(req);
      const now = Date.now();
      const windowStart = now - rule.windowMs;

      let record = this.records.get(key);
      
      if (!record || record.windowStart < windowStart) {
        // Create new record or reset window
        record = {
          count: 0,
          windowStart: now,
          lastRequest: now
        };
      }

      // Increment count
      record.count++;
      record.lastRequest = now;
      this.records.set(key, record);

      // Check rate limit
      if (record.count > rule.maxRequests) {
        console.warn(`🚨 Rate limit exceeded for key: ${key}, count: ${record.count}, limit: ${rule.maxRequests}`);
        
        // Add rate limit headers
        res.set({
          'X-RateLimit-Limit': rule.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': (record.windowStart + rule.windowMs).toString(),
          'Retry-After': Math.ceil(rule.windowMs / 1000).toString()
        });

        return res.status(429).json({
          error: 'RATE_LIMIT_EXCEEDED',
          message: rule.message,
          retryAfter: Math.ceil(rule.windowMs / 1000)
        });
      }

      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': rule.maxRequests.toString(),
        'X-RateLimit-Remaining': Math.max(0, rule.maxRequests - record.count).toString(),
        'X-RateLimit-Reset': (record.windowStart + rule.windowMs).toString()
      });

      next();
    };
  }

  /**
   * Clean up old records to prevent memory leaks
   */
  private cleanup(): void {
    const now = Date.now();
    const cutoff = now - (60 * 60 * 1000); // Remove records older than 1 hour
    
    for (const [key, record] of this.records.entries()) {
      if (record.lastRequest < cutoff) {
        this.records.delete(key);
      }
    }

    console.log(`🧹 Rate limiter cleanup: ${this.records.size} active records`);
  }

  /**
   * Get current rate limit status for a key
   */
  getRateLimitStatus(rule: RateLimitRule, req: any): {
    limit: number;
    remaining: number;
    resetTime: number;
    isLimited: boolean;
  } {
    const key = rule.keyGenerator(req);
    const record = this.records.get(key);
    const now = Date.now();
    const windowStart = now - rule.windowMs;

    if (!record || record.windowStart < windowStart) {
      return {
        limit: rule.maxRequests,
        remaining: rule.maxRequests,
        resetTime: now + rule.windowMs,
        isLimited: false
      };
    }

    return {
      limit: rule.maxRequests,
      remaining: Math.max(0, rule.maxRequests - record.count),
      resetTime: record.windowStart + rule.windowMs,
      isLimited: record.count >= rule.maxRequests
    };
  }
}

export const rateLimiter = new RateLimiterService();