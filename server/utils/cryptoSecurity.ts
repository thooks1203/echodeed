/**
 * Cryptographic Security Utilities
 * 
 * Provides secure hashing and constant-time comparison utilities
 * for COPPA-compliant claim code system.
 */

import { createHash, timingSafeEqual } from 'crypto';

export class CryptoSecurity {
  /**
   * Generate a secure hash of a claim code using SHA-256
   * @param claimCode The plain text claim code
   * @param salt Optional salt (defaults to app-specific salt)
   * @returns Hex-encoded hash
   */
  static hashClaimCode(claimCode: string, salt: string = 'COPPA_CLAIM_CODE_SALT_2024'): string {
    const hash = createHash('sha256');
    hash.update(salt + claimCode + salt); // Salt sandwich for extra security
    return hash.digest('hex');
  }

  /**
   * Perform constant-time comparison of two hashes to prevent timing attacks
   * @param hash1 First hash to compare
   * @param hash2 Second hash to compare
   * @returns true if hashes are equal, false otherwise
   */
  static constantTimeCompare(hash1: string, hash2: string): boolean {
    // Ensure both strings are the same length to prevent length-based timing attacks
    if (hash1.length !== hash2.length) {
      return false;
    }

    try {
      const buffer1 = Buffer.from(hash1, 'hex');
      const buffer2 = Buffer.from(hash2, 'hex');
      
      // Use Node.js crypto.timingSafeEqual for constant-time comparison
      return timingSafeEqual(buffer1, buffer2);
    } catch (error) {
      // If conversion fails, return false
      return false;
    }
  }

  /**
   * Validate a claim code against a stored hash using constant-time comparison
   * @param plainClaimCode The user-submitted claim code
   * @param storedHash The stored hash from database
   * @returns true if claim code is valid, false otherwise
   */
  static validateClaimCodeHash(plainClaimCode: string, storedHash: string): boolean {
    const inputHash = this.hashClaimCode(plainClaimCode);
    return this.constantTimeCompare(inputHash, storedHash);
  }

  /**
   * Generate a cryptographically secure random code
   * @param length Length of the code (default 12)
   * @returns Secure random code
   */
  static generateSecureCode(length: number = 12): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const crypto = require('crypto');
    let result = '';
    
    for (let i = 0; i < length; i++) {
      // Use cryptographically secure random number generation
      const randomByte = crypto.randomBytes(1)[0];
      const index = randomByte % characters.length;
      result += characters[index];
      
      // Add dashes for readability at positions 4 and 8
      if ((i + 1) === 4 || (i + 1) === 8) {
        result += '-';
      }
    }
    
    return result;
  }

  /**
   * ✍️ DIGITAL SIGNATURE CAPABILITY
   * Generate a cryptographic signature hash over consent payload for legal verification
   * @param consentData The consent data object
   * @param metadata Additional metadata (IP, UA, timestamp, etc.)
   * @returns Object containing signature hash and payload
   */
  static generateConsentSignature(consentData: {
    consentVersion: string;
    parentName: string;
    parentEmail: string;
    signerFullName: string;
    consentFlags: Record<string, boolean>;
    finalConsentConfirmed: boolean;
  }, metadata: {
    ipAddress: string;
    userAgent: string;
    timestamp: string;
    deviceFingerprint?: string;
    sessionId?: string;
  }): { hash: string; payload: string; signatureMetadata: any } {
    
    // Create signature payload with all critical consent data
    const signaturePayload = {
      consentData,
      metadata,
      signatureTimestamp: new Date().toISOString(),
      signatureVersion: 'v1.0',
      cryptoAlgorithm: 'SHA-256'
    };

    // Convert to canonical JSON string for consistent hashing
    const payloadString = JSON.stringify(signaturePayload, Object.keys(signaturePayload).sort());
    
    // Generate cryptographic hash using SHA-256
    const hash = createHash('sha256');
    hash.update('COPPA_CONSENT_SIGNATURE_SALT_2025' + payloadString);
    const signatureHash = hash.digest('hex');

    // Create signature metadata for audit trail
    const signatureMetadata = {
      algorithm: 'SHA-256',
      saltUsed: 'COPPA_CONSENT_SIGNATURE_SALT_2025',
      payloadLength: payloadString.length,
      signatureVersion: 'v1.0',
      generatedAt: new Date().toISOString(),
      ...metadata
    };

    return {
      hash: signatureHash,
      payload: payloadString,
      signatureMetadata
    };
  }

  /**
   * Verify a consent signature hash against the stored payload
   * @param payload The stored signature payload
   * @param storedHash The stored signature hash
   * @returns true if signature is valid, false otherwise
   */
  static verifyConsentSignature(payload: string, storedHash: string): boolean {
    try {
      // Recreate the hash from the payload
      const hash = createHash('sha256');
      hash.update('COPPA_CONSENT_SIGNATURE_SALT_2025' + payload);
      const computedHash = hash.digest('hex');
      
      // Use constant-time comparison for security
      return this.constantTimeCompare(computedHash, storedHash);
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  /**
   * Extract signature metadata for audit purposes
   * @param signaturePayload The signature payload JSON string
   * @returns Parsed signature data for audit
   */
  static extractSignatureAuditData(signaturePayload: string): any {
    try {
      const parsed = JSON.parse(signaturePayload);
      return {
        consentVersion: parsed.consentData?.consentVersion,
        signerName: parsed.consentData?.signerFullName,
        parentEmail: parsed.consentData?.parentEmail,
        signatureTimestamp: parsed.signatureTimestamp,
        ipAddress: parsed.metadata?.ipAddress,
        userAgent: parsed.metadata?.userAgent,
        deviceFingerprint: parsed.metadata?.deviceFingerprint,
        finalConsentConfirmed: parsed.consentData?.finalConsentConfirmed,
        cryptoAlgorithm: parsed.cryptoAlgorithm,
        signatureVersion: parsed.signatureVersion
      };
    } catch (error) {
      console.error('Failed to extract signature audit data:', error);
      return null;
    }
  }
}