/**
 * Emergency Contact Identity Escrow System
 * 
 * Implements AES-GCM encryption for emergency contact data with dual-authorization
 * access controls and comprehensive audit trails. Ensures COPPA/FERPA compliance
 * while maintaining ability to unmask identity in genuine emergencies.
 */

import { randomBytes, createCipheriv, createDecipheriv, pbkdf2Sync } from 'crypto';
import { securityAuditLogger } from './auditLogger';
import { storage } from '../storage';

export interface EncryptedEmergencyContact {
  id: string;
  encryptedName: string;
  encryptedPhone: string;
  encryptedRelation: string;
  encryptionKeyId: string;
  createdAt: Date;
  accessCount: number;
  lastAccessedAt?: Date;
  lastAccessedBy?: string;
  consentRecord: EmergencyContactConsent;
}

export interface EmergencyContactConsent {
  consentGiven: boolean;
  consentTimestamp: Date;
  consentVersion: string;
  ipAddress: string;
  userAgent: string;
  coppaCompliant: boolean;
  ferpaCompliant: boolean;
  parentalConsent?: boolean;
  consentWithdrawable: boolean;
}

export interface DualAuthRequest {
  requestId: string;
  requesterId: string;
  requesterRole: string;
  emergencyContactId: string;
  justification: string;
  urgencyLevel: 'ROUTINE' | 'URGENT' | 'EMERGENCY' | 'COURT_ORDER';
  approvals: DualAuthApproval[];
  status: 'PENDING' | 'APPROVED' | 'DENIED' | 'EXPIRED';
  expiresAt: Date;
}

export interface DualAuthApproval {
  approverId: string;
  approverRole: string;
  approvalTimestamp: Date;
  approvalMethod: string;
}

export class EmergencyContactEncryption {
  private readonly ENCRYPTION_ALGORITHM = 'aes-256-gcm';
  private readonly KEY_DERIVATION = 'pbkdf2';
  private readonly ITERATIONS = 100000;

  /**
   * Encrypt emergency contact data with AES-GCM
   */
  async encryptEmergencyContact(contactData: {
    name: string;
    phone: string;
    relation: string;
    consent: EmergencyContactConsent;
  }): Promise<EncryptedEmergencyContact> {
    try {
      // Generate unique encryption key for this contact
      const encryptionKey = randomBytes(32); // 256-bit key
      const keyId = randomBytes(16).toString('hex');
      
      // Encrypt each field separately with AES-GCM
      const encryptedName = await this.encryptField(contactData.name, encryptionKey);
      const encryptedPhone = await this.encryptField(contactData.phone, encryptionKey);
      const encryptedRelation = await this.encryptField(contactData.relation, encryptionKey);

      // Store encryption key securely (in production, use AWS KMS or similar)
      await this.storeEncryptionKey(keyId, encryptionKey);

      const encryptedContact: EncryptedEmergencyContact = {
        id: randomBytes(16).toString('hex'),
        encryptedName,
        encryptedPhone,
        encryptedRelation,
        encryptionKeyId: keyId,
        createdAt: new Date(),
        accessCount: 0,
        consentRecord: contactData.consent
      };

      // Audit log creation
      await securityAuditLogger.logEmergencyContactAccess({
        userId: 'system',
        userRole: 'encryption_service',
        emergencyContactId: encryptedContact.id,
        action: 'ENCRYPT',
        authorizationMethod: 'DUAL_AUTH'
      });

      return encryptedContact;

    } catch (error) {
      console.error('CRITICAL: Emergency contact encryption failed:', error);
      throw new Error('Failed to encrypt emergency contact data');
    }
  }

  /**
   * Decrypt emergency contact data with dual authorization
   */
  async decryptEmergencyContact(
    encryptedContactId: string,
    dualAuthRequest: DualAuthRequest,
    accessorUserId: string,
    accessorRole: string
  ): Promise<{
    name: string;
    phone: string;
    relation: string;
    consentRecord: EmergencyContactConsent;
  } | null> {
    try {
      // Verify dual authorization
      if (!await this.verifyDualAuthorization(dualAuthRequest)) {
        throw new Error('Dual authorization required for emergency contact access');
      }

      // Get encrypted contact data
      const encryptedContact = await this.getEncryptedContact(encryptedContactId);
      if (!encryptedContact) {
        return null;
      }

      // Retrieve decryption key
      const encryptionKey = await this.retrieveEncryptionKey(encryptedContact.encryptionKeyId);

      // Decrypt fields
      const name = await this.decryptField(encryptedContact.encryptedName, encryptionKey);
      const phone = await this.decryptField(encryptedContact.encryptedPhone, encryptionKey);
      const relation = await this.decryptField(encryptedContact.encryptedRelation, encryptionKey);

      // Update access tracking
      await this.updateAccessTracking(encryptedContactId, accessorUserId);

      // Audit log access
      await securityAuditLogger.logEmergencyContactAccess({
        userId: accessorUserId,
        userRole: accessorRole,
        emergencyContactId: encryptedContactId,
        action: 'DECRYPT',
        authorizationMethod: dualAuthRequest.urgencyLevel === 'COURT_ORDER' ? 'COURT_ORDER' : 'DUAL_AUTH'
      });

      return {
        name,
        phone,
        relation,
        consentRecord: encryptedContact.consentRecord
      };

    } catch (error) {
      console.error('Emergency contact decryption failed:', error);
      
      // Audit log failed access attempt
      await securityAuditLogger.logEmergencyContactAccess({
        userId: accessorUserId,
        userRole: accessorRole,
        emergencyContactId: encryptedContactId,
        action: 'DECRYPT',
        authorizationMethod: 'DUAL_AUTH'
      });

      throw new Error('Failed to decrypt emergency contact data');
    }
  }

  /**
   * Request dual authorization for emergency contact access
   */
  async requestDualAuthorization(params: {
    requesterId: string;
    requesterRole: string;
    emergencyContactId: string;
    justification: string;
    urgencyLevel: 'ROUTINE' | 'URGENT' | 'EMERGENCY' | 'COURT_ORDER';
  }): Promise<DualAuthRequest> {
    const request: DualAuthRequest = {
      requestId: randomBytes(16).toString('hex'),
      requesterId: params.requesterId,
      requesterRole: params.requesterRole,
      emergencyContactId: params.emergencyContactId,
      justification: params.justification,
      urgencyLevel: params.urgencyLevel,
      approvals: [],
      status: 'PENDING',
      expiresAt: new Date(Date.now() + (params.urgencyLevel === 'EMERGENCY' ? 1 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)) // 1 hour for emergency, 24 hours otherwise
    };

    // Store request for approval workflow
    await this.storeDualAuthRequest(request);

    // For court orders, auto-approve
    if (params.urgencyLevel === 'COURT_ORDER') {
      request.status = 'APPROVED';
      request.approvals.push({
        approverId: 'legal_system',
        approverRole: 'court_order',
        approvalTimestamp: new Date(),
        approvalMethod: 'legal_mandate'
      });
    }

    return request;
  }

  /**
   * Approve dual authorization request
   */
  async approveDualAuthRequest(
    requestId: string,
    approverId: string,
    approverRole: string
  ): Promise<boolean> {
    const request = await this.getDualAuthRequest(requestId);
    if (!request || request.status !== 'PENDING' || request.expiresAt < new Date()) {
      return false;
    }

    // Ensure approver is not the same as requester
    if (approverId === request.requesterId) {
      throw new Error('Self-approval not permitted for dual authorization');
    }

    // Ensure approver has appropriate role
    if (!['admin', 'school_principal', 'licensed_counselor', 'compliance_officer'].includes(approverRole)) {
      throw new Error('Insufficient privileges to approve emergency contact access');
    }

    const approval: DualAuthApproval = {
      approverId,
      approverRole,
      approvalTimestamp: new Date(),
      approvalMethod: 'manual_approval'
    };

    request.approvals.push(approval);

    // Check if we have sufficient approvals
    const requiredApprovals = request.urgencyLevel === 'EMERGENCY' ? 1 : 2;
    if (request.approvals.length >= requiredApprovals) {
      request.status = 'APPROVED';
    }

    await this.updateDualAuthRequest(request);
    return request.status === 'APPROVED';
  }

  /**
   * Verify dual authorization is valid
   */
  private async verifyDualAuthorization(request: DualAuthRequest): Promise<boolean> {
    if (request.status !== 'APPROVED') return false;
    if (request.expiresAt < new Date()) return false;

    const requiredApprovals = request.urgencyLevel === 'EMERGENCY' ? 1 : 2;
    return request.approvals.length >= requiredApprovals;
  }

  /**
   * Encrypt individual field using AES-256-GCM with proper IV and auth tag
   */
  private async encryptField(plaintext: string, key: Buffer): Promise<string> {
    try {
      // Generate random IV for each encryption operation (CRITICAL for security)
      const iv = randomBytes(16);
      
      // Use createCipheriv with proper algorithm and key
      const cipher = createCipheriv('aes-256-gcm', key, iv);
      
      // Encrypt the plaintext
      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Get authentication tag (CRITICAL for integrity verification)
      const authTag = cipher.getAuthTag();
      
      return JSON.stringify({
        encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
        algorithm: 'aes-256-gcm'
      });
    } catch (error) {
      console.error('CRITICAL: Field encryption failed:', error);
      throw new Error('Field encryption failed');
    }
  }

  /**
   * Decrypt individual field using AES-256-GCM with auth tag verification
   */
  private async decryptField(encryptedData: string, key: Buffer): Promise<string> {
    try {
      const data = JSON.parse(encryptedData);
      
      if (!data.iv || !data.authTag || !data.encrypted) {
        throw new Error('Invalid encrypted data format - missing required components');
      }
      
      // Use createDecipheriv with the stored IV
      const iv = Buffer.from(data.iv, 'hex');
      const decipher = createDecipheriv('aes-256-gcm', key, iv);
      
      // Set auth tag for integrity verification (CRITICAL)
      const authTag = Buffer.from(data.authTag, 'hex');
      decipher.setAuthTag(authTag);
      
      // Decrypt with auth tag verification
      let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('CRITICAL: Field decryption failed - possible data tampering:', error);
      throw new Error('Field decryption failed - data integrity check failed');
    }
  }

  // MASTER KEY for encrypting stored keys (in production, use AWS KMS/HashiCorp Vault)
  private readonly MASTER_KEY = this.getMasterKey();

  /**
   * SECURITY FIX: Fail-fast if MASTER_ENCRYPTION_KEY environment variable is missing
   */
  private getMasterKey(): string {
    const masterKey = process.env.MASTER_ENCRYPTION_KEY;
    if (!masterKey) {
      console.error('CRITICAL SECURITY ERROR: MASTER_ENCRYPTION_KEY environment variable is required for emergency contact encryption');
      console.error('This system handles child safety data and CANNOT operate without proper encryption keys');
      throw new Error('MASTER_ENCRYPTION_KEY environment variable is required - no hard-coded fallback allowed for child safety');
    }
    if (masterKey.length < 32) {
      throw new Error('MASTER_ENCRYPTION_KEY must be at least 32 characters for security');
    }
    return masterKey;
  }

  /**
   * FIXED: Store encryption key securely in database with master key encryption
   */
  private async storeEncryptionKey(keyId: string, key: Buffer): Promise<void> {
    try {
      // Encrypt the key with master key before storage
      const encryptedKey = this.encryptWithMasterKey(key);
      
      // Store in database 
      await storage.storeEncryptionKey(keyId, encryptedKey, 'emergency_contact');
      
      console.log(`🔑 FIXED: Encryption key ${keyId} securely stored in database`);
    } catch (error) {
      console.error(`CRITICAL: Failed to store encryption key ${keyId}:`, error);
      throw new Error('Failed to store encryption key securely');
    }
  }

  /**
   * FIXED: Retrieve and decrypt encryption key from database  
   */
  private async retrieveEncryptionKey(keyId: string): Promise<Buffer> {
    try {
      // Retrieve encrypted key from database
      const encryptedKey = await storage.retrieveEncryptionKey(keyId);
      
      if (!encryptedKey) {
        throw new Error(`Encryption key not found: ${keyId}`);
      }
      
      // Decrypt with master key
      const key = this.decryptWithMasterKey(encryptedKey);
      
      console.log(`🔑 FIXED: Encryption key ${keyId} successfully retrieved and decrypted`);
      return key;
    } catch (error) {
      console.error(`CRITICAL: Failed to retrieve encryption key ${keyId}:`, error);
      throw new Error('Failed to retrieve encryption key');
    }
  }

  /**
   * Encrypt key with master key for secure storage
   */
  private encryptWithMasterKey(key: Buffer): string {
    const iv = randomBytes(16);
    const masterKeyHash = pbkdf2Sync(this.MASTER_KEY, 'echodeed_salt', 100000, 32, 'sha512');
    const cipher = createCipheriv('aes-256-gcm', masterKeyHash, iv);
    
    let encrypted = cipher.update(key, undefined, 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    
    return JSON.stringify({
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      algorithm: 'aes-256-gcm'
    });
  }

  /**
   * Decrypt key with master key from storage
   */
  private decryptWithMasterKey(encryptedData: string): Buffer {
    const data = JSON.parse(encryptedData);
    const iv = Buffer.from(data.iv, 'hex');
    const authTag = Buffer.from(data.authTag, 'hex');
    const masterKeyHash = pbkdf2Sync(this.MASTER_KEY, 'echodeed_salt', 100000, 32, 'sha512');
    
    const decipher = createDecipheriv('aes-256-gcm', masterKeyHash, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(data.encrypted, 'hex');
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted;
  }

  private async getEncryptedContact(contactId: string): Promise<EncryptedEmergencyContact | null> {
    return await storage.getEncryptedEmergencyContact(contactId);
  }

  private async updateAccessTracking(contactId: string, userId: string): Promise<void> {
    await storage.updateEncryptedEmergencyContactAccess(contactId, userId);
    console.log(`📊 Updated access tracking for contact ${contactId} by user ${userId}`);
  }

  private async storeDualAuthRequest(request: DualAuthRequest): Promise<void> {
    await storage.createDualAuthRequest({
      requestId: request.requestId,
      requesterId: request.requesterId,
      requesterRole: request.requesterRole,
      emergencyContactId: request.emergencyContactId,
      justification: request.justification,
      urgencyLevel: request.urgencyLevel,
      status: request.status,
      approvals: request.approvals,
      expiresAt: request.expiresAt
    });
    console.log(`💼 Stored dual auth request ${request.requestId}`);
  }

  private async getDualAuthRequest(requestId: string): Promise<DualAuthRequest | null> {
    return await storage.getDualAuthRequest(requestId);
  }

  private async updateDualAuthRequest(request: DualAuthRequest): Promise<void> {
    await storage.updateDualAuthRequest(request.requestId, {
      status: request.status,
      approvals: request.approvals,
      updatedAt: new Date()
    });
    console.log(`💼 Updated dual auth request ${request.requestId} with status ${request.status}`);
  }
}

export const emergencyContactEncryption = new EmergencyContactEncryption();