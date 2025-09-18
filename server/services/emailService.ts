import nodemailer from 'nodemailer';
import { DEMO_MODE, BCA_EMAIL_CONFIG } from '@shared/demoConfig';

interface ConsentEmailData {
  parentEmail: string;
  parentName: string;
  studentFirstName: string;
  schoolName: string;
  verificationCode: string;
  baseUrl: string;
}

interface EnhancedConsentEmailData {
  parentEmail: string;
  parentName: string;
  studentName: string;
  schoolName: string;
  consentRecordId: string;
  verificationCode: string;
  verificationUrl: string;
  consentVersion: string;
  expiresAt: Date;
}

interface ConsentConfirmationEmailData {
  parentEmail: string;
  parentName: string;
  consentRecordId: string;
  approvedAt: Date;
  consentVersion: string;
}

interface ConsentRevocationEmailData {
  parentEmail: string;
  parentName: string;
  revokedAt: Date;
  revokedReason: string;
}

interface ConsentReminderEmailData {
  parentEmail: string;
  parentName: string;
  studentFirstName: string;
  schoolName: string;
  verificationCode: string;
  baseUrl: string;
  reminderType: '3day' | '7day';
  daysSinceRequest: number;
  expiresInDays: number;
}

interface ConsentDenialEmailData {
  parentEmail: string;
  parentName: string;
  studentFirstName: string;
  schoolName: string;
  deniedAt: Date;
}

// 🔄 ANNUAL CONSENT RENEWAL EMAIL INTERFACES - BURLINGTON POLICY
interface ConsentRenewalEmailData {
  parentEmail: string;
  parentName: string;
  studentFirstName: string;
  schoolName: string;
  verificationCode: string;
  baseUrl: string;
  renewalYear: string;
  expiryDate: Date;
}

interface RenewalReminderEmailData {
  parentEmail: string;
  parentName: string;
  studentFirstName: string;
  schoolName: string;
  verificationCode: string;
  baseUrl: string;
  reminderType: '45day' | '14day' | '7day' | '1day' | 'manual';
  daysUntilExpiry: number;
  expiryDate: Date;
}

interface EmailService {
  sendParentalConsentEmail(data: ConsentEmailData): Promise<boolean>;
  sendEnhancedParentalConsentEmail(data: EnhancedConsentEmailData): Promise<boolean>;
  sendConsentConfirmationEmail(data: ConsentConfirmationEmailData): Promise<boolean>;
  sendConsentRevocationConfirmation(data: ConsentRevocationEmailData): Promise<boolean>;
  sendConsentReminderEmail(data: ConsentReminderEmailData): Promise<boolean>;
  sendConsentDenialConfirmation(data: ConsentDenialEmailData): Promise<boolean>;
  // 🔄 Burlington renewal methods
  sendConsentRenewalEmail(data: ConsentRenewalEmailData): Promise<boolean>;
  sendRenewalReminderEmail(data: RenewalReminderEmailData): Promise<boolean>;
}

class NodemailerEmailService implements EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // For development and demo mode, we'll use a test account or log-only mode
    if (process.env.NODE_ENV === 'development' || DEMO_MODE.enabled) {
      // In development and demo mode, we'll just log the emails instead of sending them
      console.log('📧 Email service initialized in demo mode (logging only)');
      this.transporter = null;
    } else {
      // In production, configure with real SMTP settings
      const emailConfig = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      };

      this.transporter = nodemailer.createTransport(emailConfig);
    }
  }

  async sendParentalConsentEmail(data: ConsentEmailData): Promise<boolean> {
    const { parentEmail, parentName, studentFirstName, schoolName, verificationCode, baseUrl } = data;
    
    const consentUrl = `${baseUrl}/parent-consent/${verificationCode}`;
    
    const htmlContent = this.generateConsentEmailHTML({
      parentName,
      studentFirstName,
      schoolName,
      consentUrl,
      verificationCode
    });

    const textContent = this.generateConsentEmailText({
      parentName,
      studentFirstName,
      schoolName,
      consentUrl
    });

    const mailOptions = {
      from: BCA_EMAIL_CONFIG.fromEmail || process.env.SMTP_FROM || 'EchoDeed <noreply@echodeed.com>',
      to: parentEmail,
      subject: BCA_EMAIL_CONFIG.templates.consentRequest.subject.replace('{studentName}', studentFirstName),
      text: textContent,
      html: htmlContent
    };

    try {
      if (this.transporter) {
        // Send real email in production
        const info = await this.transporter.sendMail(mailOptions);
        console.log('📧 Consent email sent successfully:', info.messageId);
        return true;
      } else {
        // Development mode - log email content
        console.log('\n📧 ==== PARENTAL CONSENT EMAIL (DEVELOPMENT MODE) ====');
        console.log(`To: ${parentEmail}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log(`Consent URL: ${consentUrl}`);
        console.log(`Verification Code: ${verificationCode}`);
        console.log('=================================================\n');
        console.log(textContent);
        console.log('\n=================================================');
        return true;
      }
    } catch (error) {
      console.error('❌ Failed to send consent email:', error);
      return false;
    }
  }

  async sendEnhancedParentalConsentEmail(data: EnhancedConsentEmailData): Promise<boolean> {
    const { parentEmail, parentName, studentName, schoolName, verificationCode, verificationUrl, consentVersion, expiresAt } = data;
    
    const htmlContent = this.generateEnhancedConsentEmailHTML({
      parentName,
      studentName,
      schoolName,
      verificationUrl,
      verificationCode,
      consentVersion,
      expiresAt
    });

    const textContent = this.generateEnhancedConsentEmailText({
      parentName,
      studentName,
      schoolName,
      verificationUrl,
      consentVersion,
      expiresAt
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || 'EchoDeed <noreply@echodeed.com>',
      to: parentEmail,
      subject: `🔐 Enhanced Parental Consent Required - ${studentName}'s EchoDeed Account (${consentVersion})`,
      text: textContent,
      html: htmlContent
    };

    try {
      if (this.transporter) {
        const info = await this.transporter.sendMail(mailOptions);
        console.log('📧 Enhanced consent email sent successfully:', info.messageId);
        return true;
      } else {
        console.log('\n📧 ==== ENHANCED PARENTAL CONSENT EMAIL (DEVELOPMENT MODE) ====');
        console.log(`To: ${parentEmail}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log(`Consent URL: ${verificationUrl}`);
        console.log(`Verification Code: ${verificationCode}`);
        console.log(`Consent Version: ${consentVersion}`);
        console.log(`Expires At: ${expiresAt.toISOString()}`);
        console.log('=================================================\n');
        console.log(textContent);
        console.log('\n=================================================');
        return true;
      }
    } catch (error) {
      console.error('❌ Failed to send enhanced consent email:', error);
      return false;
    }
  }

  async sendConsentConfirmationEmail(data: ConsentConfirmationEmailData): Promise<boolean> {
    const { parentEmail, parentName, consentRecordId, approvedAt, consentVersion } = data;
    
    const htmlContent = this.generateConsentConfirmationHTML({
      parentName,
      consentRecordId,
      approvedAt,
      consentVersion
    });

    const textContent = this.generateConsentConfirmationText({
      parentName,
      consentRecordId,
      approvedAt,
      consentVersion
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || 'EchoDeed <noreply@echodeed.com>',
      to: parentEmail,
      subject: `✅ Parental Consent Confirmed - EchoDeed Account Activated`,
      text: textContent,
      html: htmlContent
    };

    try {
      if (this.transporter) {
        const info = await this.transporter.sendMail(mailOptions);
        console.log('📧 Consent confirmation email sent successfully:', info.messageId);
        return true;
      } else {
        console.log('\n📧 ==== CONSENT CONFIRMATION EMAIL (DEVELOPMENT MODE) ====');
        console.log(`To: ${parentEmail}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log(`Record ID: ${consentRecordId}`);
        console.log(`Approved At: ${approvedAt.toISOString()}`);
        console.log('=================================================\n');
        console.log(textContent);
        console.log('\n=================================================');
        return true;
      }
    } catch (error) {
      console.error('❌ Failed to send consent confirmation email:', error);
      return false;
    }
  }

  async sendConsentRevocationConfirmation(data: ConsentRevocationEmailData): Promise<boolean> {
    const { parentEmail, parentName, revokedAt, revokedReason } = data;
    
    const htmlContent = this.generateConsentRevocationHTML({
      parentName,
      revokedAt,
      revokedReason
    });

    const textContent = this.generateConsentRevocationText({
      parentName,
      revokedAt,
      revokedReason
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || 'EchoDeed <noreply@echodeed.com>',
      to: parentEmail,
      subject: `🛡️ Parental Consent Revoked - EchoDeed Account Deactivated`,
      text: textContent,
      html: htmlContent
    };

    try {
      if (this.transporter) {
        const info = await this.transporter.sendMail(mailOptions);
        console.log('📧 Consent revocation email sent successfully:', info.messageId);
        return true;
      } else {
        console.log('\n📧 ==== CONSENT REVOCATION EMAIL (DEVELOPMENT MODE) ====');
        console.log(`To: ${parentEmail}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log(`Revoked At: ${revokedAt.toISOString()}`);
        console.log(`Reason: ${revokedReason}`);
        console.log('=================================================\n');
        console.log(textContent);
        console.log('\n=================================================');
        return true;
      }
    } catch (error) {
      console.error('❌ Failed to send consent revocation email:', error);
      return false;
    }
  }

  async sendConsentReminderEmail(data: ConsentReminderEmailData): Promise<boolean> {
    const { parentEmail, parentName, studentFirstName, schoolName, verificationCode, baseUrl, reminderType, daysSinceRequest, expiresInDays } = data;
    
    const consentUrl = `${baseUrl}/parent-consent/${verificationCode}`;
    
    const htmlContent = this.generateConsentReminderEmailHTML({
      parentName,
      studentFirstName,
      schoolName,
      consentUrl,
      verificationCode,
      reminderType,
      daysSinceRequest,
      expiresInDays
    });

    const textContent = this.generateConsentReminderEmailText({
      parentName,
      studentFirstName,
      schoolName,
      consentUrl,
      reminderType,
      daysSinceRequest,
      expiresInDays
    });

    const reminderTypeText = reminderType === '3day' ? '3-Day' : '7-Day';
    const mailOptions = {
      from: process.env.SMTP_FROM || 'Burlington Christian Academy EchoDeed <noreply@echodeed.com>',
      to: parentEmail,
      subject: `⏰ ${reminderTypeText} Reminder: Parental Consent Still Needed - ${studentFirstName}'s EchoDeed Account`,
      text: textContent,
      html: htmlContent
    };

    try {
      if (this.transporter) {
        const info = await this.transporter.sendMail(mailOptions);
        console.log(`📧 ${reminderTypeText} consent reminder email sent successfully:`, info.messageId);
        return true;
      } else {
        console.log(`\n📧 ==== ${reminderTypeText.toUpperCase()} CONSENT REMINDER EMAIL (DEVELOPMENT MODE) ====`);
        console.log(`To: ${parentEmail}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log(`Consent URL: ${consentUrl}`);
        console.log(`Days Since Request: ${daysSinceRequest}`);
        console.log(`Expires In: ${expiresInDays} days`);
        console.log('=================================================\n');
        console.log(textContent);
        console.log('\n=================================================');
        return true;
      }
    } catch (error) {
      console.error(`❌ Failed to send ${reminderTypeText} consent reminder email:`, error);
      return false;
    }
  }

  async sendConsentDenialConfirmation(data: ConsentDenialEmailData): Promise<boolean> {
    const { parentEmail, parentName, studentFirstName, schoolName, deniedAt } = data;
    
    const htmlContent = this.generateConsentDenialHTML({
      parentName,
      studentFirstName,
      schoolName,
      deniedAt
    });

    const textContent = this.generateConsentDenialText({
      parentName,
      studentFirstName,
      schoolName,
      deniedAt
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || 'Burlington Christian Academy EchoDeed <noreply@echodeed.com>',
      to: parentEmail,
      subject: `❌ Parental Consent Denied - ${studentFirstName}'s EchoDeed Account Status`,
      text: textContent,
      html: htmlContent
    };

    try {
      if (this.transporter) {
        const info = await this.transporter.sendMail(mailOptions);
        console.log('📧 Consent denial confirmation email sent successfully:', info.messageId);
        return true;
      } else {
        console.log('\n📧 ==== CONSENT DENIAL CONFIRMATION EMAIL (DEVELOPMENT MODE) ====');
        console.log(`To: ${parentEmail}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log(`Denied At: ${deniedAt.toISOString()}`);
        console.log('=================================================\n');
        console.log(textContent);
        console.log('\n=================================================');
        return true;
      }
    } catch (error) {
      console.error('❌ Failed to send consent denial confirmation email:', error);
      return false;
    }
  }

  // 🔄 ANNUAL CONSENT RENEWAL EMAIL METHODS - BURLINGTON POLICY IMPLEMENTATION

  async sendConsentRenewalEmail(data: ConsentRenewalEmailData): Promise<boolean> {
    const { parentEmail, parentName, studentFirstName, schoolName, verificationCode, baseUrl, renewalYear, expiryDate } = data;
    
    const renewalUrl = `${baseUrl}/renewals/${verificationCode}`;
    
    const htmlContent = this.generateConsentRenewalHTML({
      parentName,
      studentFirstName,
      schoolName,
      renewalUrl,
      renewalYear,
      expiryDate,
      verificationCode
    });

    const textContent = this.generateConsentRenewalText({
      parentName,
      studentFirstName,
      schoolName,
      renewalUrl,
      renewalYear,
      expiryDate
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || 'Burlington Christian Academy EchoDeed <noreply@echodeed.com>',
      to: parentEmail,
      subject: `🔄 Annual Consent Renewal Required - ${studentFirstName}'s EchoDeed Account for ${renewalYear}`,
      text: textContent,
      html: htmlContent
    };

    try {
      if (this.transporter) {
        const info = await this.transporter.sendMail(mailOptions);
        console.log('📧 Consent renewal email sent successfully:', info.messageId);
        return true;
      } else {
        console.log('\n📧 ==== CONSENT RENEWAL EMAIL (DEVELOPMENT MODE) ====');
        console.log(`To: ${parentEmail}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log(`Renewal URL: ${renewalUrl}`);
        console.log(`Renewal Year: ${renewalYear}`);
        console.log(`Expiry Date: ${expiryDate.toLocaleDateString()}`);
        console.log('=================================================\n');
        console.log(textContent);
        console.log('\n=================================================');
        return true;
      }
    } catch (error) {
      console.error('❌ Failed to send consent renewal email:', error);
      return false;
    }
  }

  async sendRenewalReminderEmail(data: RenewalReminderEmailData): Promise<boolean> {
    const { parentEmail, parentName, studentFirstName, schoolName, verificationCode, baseUrl, reminderType, daysUntilExpiry, expiryDate } = data;
    
    const renewalUrl = `${baseUrl}/renewals/${verificationCode}`;
    
    // Define reminder urgency and messaging
    const reminderConfig = {
      '45day': { urgency: 'Early Notice', emoji: '📅', priority: 'info' },
      '14day': { urgency: 'Action Needed', emoji: '⚠️', priority: 'warning' },
      '7day': { urgency: 'Urgent Action Required', emoji: '🚨', priority: 'urgent' },
      '1day': { urgency: 'IMMEDIATE ACTION REQUIRED', emoji: '⏰', priority: 'critical' },
      'manual': { urgency: 'Reminder', emoji: '📧', priority: 'info' }
    };

    const config = reminderConfig[reminderType] || reminderConfig['manual'];
    
    const htmlContent = this.generateRenewalReminderHTML({
      parentName,
      studentFirstName,
      schoolName,
      renewalUrl,
      reminderType,
      daysUntilExpiry,
      expiryDate,
      urgency: config.urgency,
      emoji: config.emoji,
      priority: config.priority,
      verificationCode
    });

    const textContent = this.generateRenewalReminderText({
      parentName,
      studentFirstName,
      schoolName,
      renewalUrl,
      reminderType,
      daysUntilExpiry,
      expiryDate,
      urgency: config.urgency
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || 'Burlington Christian Academy EchoDeed <noreply@echodeed.com>',
      to: parentEmail,
      subject: `${config.emoji} ${config.urgency}: Consent Renewal for ${studentFirstName} (${daysUntilExpiry} days remaining)`,
      text: textContent,
      html: htmlContent
    };

    try {
      if (this.transporter) {
        const info = await this.transporter.sendMail(mailOptions);
        console.log(`📧 ${reminderType} renewal reminder email sent successfully:`, info.messageId);
        return true;
      } else {
        console.log(`\n📧 ==== ${reminderType.toUpperCase()} RENEWAL REMINDER EMAIL (DEVELOPMENT MODE) ====`);
        console.log(`To: ${parentEmail}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log(`Renewal URL: ${renewalUrl}`);
        console.log(`Days Until Expiry: ${daysUntilExpiry}`);
        console.log(`Expiry Date: ${expiryDate.toLocaleDateString()}`);
        console.log(`Urgency: ${config.urgency}`);
        console.log('=================================================\n');
        console.log(textContent);
        console.log('\n=================================================');
        return true;
      }
    } catch (error) {
      console.error(`❌ Failed to send ${reminderType} renewal reminder email:`, error);
      return false;
    }
  }

  private generateConsentEmailHTML(data: {
    parentName: string;
    studentFirstName: string;
    schoolName: string;
    consentUrl: string;
    verificationCode: string;
  }) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Parental Consent Required - EchoDeed</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
        .content { padding: 30px; }
        .highlight-box { background: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .highlight-box h3 { margin: 0 0 10px 0; color: #0369a1; font-size: 18px; }
        .consent-button { display: block; background: linear-gradient(135deg, #10b981, #059669); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 18px; text-align: center; margin: 25px 0; transition: transform 0.2s; }
        .consent-button:hover { transform: translateY(-1px); }
        .safety-info { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; }
        .code-box { background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; padding: 12px; font-family: monospace; font-size: 16px; text-align: center; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Parental Consent Required</h1>
            <p>Your child wants to join EchoDeed</p>
        </div>
        
        <div class="content">
            <p>Dear <strong>${data.parentName}</strong>,</p>
            
            <p>Your child <strong>${data.studentFirstName}</strong> has requested to create an account on <strong>EchoDeed</strong> through their school (<strong>${data.schoolName}</strong>).</p>
            
            <div class="highlight-box">
                <h3>🎓 What is EchoDeed?</h3>
                <p>EchoDeed is a COPPA-compliant platform that helps K-8 students learn empathy and character development by sharing anonymous acts of kindness. It's designed specifically for schools and includes:</p>
                <ul>
                    <li><strong>Anonymous & Safe:</strong> No personal information is shared publicly</li>
                    <li><strong>Educational Focus:</strong> Aligned with Social-Emotional Learning (SEL) standards</li>
                    <li><strong>Teacher Supervised:</strong> All content is moderated for safety</li>
                    <li><strong>COPPA Compliant:</strong> Meets all privacy requirements for children under 13</li>
                </ul>
            </div>

            <div class="safety-info">
                <p><strong>🛡️ Your child's safety and privacy are our top priorities:</strong></p>
                <ul>
                    <li>No personal information is collected beyond first name and grade</li>
                    <li>All posts are anonymous and cannot be traced back to your child</li>
                    <li>Content is automatically filtered and teacher-moderated</li>
                    <li>You can revoke consent and delete the account at any time</li>
                </ul>
            </div>

            <p><strong>To approve your child's account, please click the button below:</strong></p>
            
            <a href="${data.consentUrl}" class="consent-button">
                ✅ Give Consent & Activate Account
            </a>
            
            <p style="text-align: center; color: #6b7280; font-size: 14px;">
                Or copy and paste this link into your browser:<br>
                <span style="word-break: break-all;">${data.consentUrl}</span>
            </p>

            <div class="code-box">
                <strong>Verification Code:</strong> ${data.verificationCode}
            </div>

            <p style="font-size: 14px; color: #6b7280;">
                <strong>Important:</strong> This consent link will expire in 14 days per Burlington Christian Academy policy. If you do not provide consent within this time, your child will need to register again.
            </p>

            <p>If you have any questions about EchoDeed or need assistance, please contact your child's school or reply to this email.</p>
            
            <p>Thank you for supporting your child's character development!</p>
            
            <p>Best regards,<br><strong>The EchoDeed Team</strong></p>
        </div>
        
        <div class="footer">
            <p>EchoDeed™ - Building Character Through Kindness</p>
            <p>FERPA & COPPA Compliant • Anonymous & Safe</p>
            <p style="font-size: 12px; margin-top: 15px;">
                This email was sent to you because a student at ${data.schoolName} provided your email address for parental consent. 
                If you did not expect this email, please contact the school directly.
            </p>
        </div>
    </div>
</body>
</html>
    `;
  }

  private generateConsentEmailText(data: {
    parentName: string;
    studentFirstName: string;
    schoolName: string;
    consentUrl: string;
  }) {
    return `
PARENTAL CONSENT REQUIRED - EchoDeed

Dear ${data.parentName},

Your child ${data.studentFirstName} has requested to create an account on EchoDeed through their school (${data.schoolName}).

WHAT IS ECHODEED?
EchoDeed is a COPPA-compliant platform that helps K-8 students learn empathy and character development by sharing anonymous acts of kindness.

KEY SAFETY FEATURES:
• Anonymous & Safe: No personal information is shared publicly
• Educational Focus: Aligned with Social-Emotional Learning (SEL) standards  
• Teacher Supervised: All content is moderated for safety
• COPPA Compliant: Meets all privacy requirements for children under 13

YOUR CHILD'S SAFETY & PRIVACY:
• No personal information collected beyond first name and grade
• All posts are anonymous and cannot be traced back to your child
• Content is automatically filtered and teacher-moderated
• You can revoke consent and delete the account at any time

TO APPROVE YOUR CHILD'S ACCOUNT:
Click this link: ${data.consentUrl}

This consent link will expire in 14 days per Burlington Christian Academy policy.

If you have any questions, please contact your child's school.

Thank you for supporting your child's character development!

Best regards,
The EchoDeed Team

---
EchoDeed™ - Building Character Through Kindness
FERPA & COPPA Compliant • Anonymous & Safe
    `;
  }

  private generateEnhancedConsentEmailHTML(data: {
    parentName: string;
    studentName: string;
    schoolName: string;
    verificationUrl: string;
    verificationCode: string;
    consentVersion: string;
    expiresAt: Date;
  }) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enhanced Parental Consent Required - EchoDeed</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
        .content { padding: 30px; }
        .highlight-box { background: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .highlight-box h3 { margin: 0 0 10px 0; color: #0369a1; font-size: 18px; }
        .consent-button { display: block; background: linear-gradient(135deg, #10b981, #059669); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 18px; text-align: center; margin: 25px 0; transition: transform 0.2s; }
        .consent-button:hover { transform: translateY(-1px); }
        .safety-info { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; }
        .code-box { background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; padding: 12px; font-family: monospace; font-size: 16px; text-align: center; margin: 15px 0; }
        .version-badge { background: #3b82f6; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Enhanced Parental Consent Required</h1>
            <p>EchoDeed Account Verification <span class="version-badge">${data.consentVersion}</span></p>
        </div>
        
        <div class="content">
            <p><strong>Dear ${data.parentName},</strong></p>
            
            <p>Your child <strong>${data.studentName}</strong> has requested to create an account on EchoDeed through <strong>${data.schoolName}</strong>.</p>
            
            <div class="highlight-box">
                <h3>🛡️ Enhanced COPPA Compliance Features</h3>
                <p>This enhanced consent system provides:</p>
                <ul>
                    <li><strong>Granular Consent Controls</strong> - Choose exactly what data you consent to</li>
                    <li><strong>72-Hour Security Expiry</strong> - Links automatically expire for security</li>
                    <li><strong>One-Time Verification</strong> - Prevent replay attacks and unauthorized access</li>
                    <li><strong>Immutable Audit Trail</strong> - Permanent record for compliance</li>
                    <li><strong>Easy Revocation</strong> - Withdraw consent at any time</li>
                </ul>
            </div>

            <a href="${data.verificationUrl}" class="consent-button">
                ✅ Review & Provide Consent
            </a>

            <div class="code-box">
                <strong>Verification Code:</strong> ${data.verificationCode}
            </div>

            <div class="safety-info">
                <p><strong>🚨 Security Notice:</strong></p>
                <ul>
                    <li>This link expires on: <strong>${data.expiresAt.toLocaleDateString()} at ${data.expiresAt.toLocaleTimeString()}</strong></li>
                    <li>This verification code can only be used once</li>
                    <li>If expired, your child will need to request a new consent link</li>
                </ul>
            </div>

            <p>If you have any questions, please contact your child's school.</p>
            
            <p>Thank you for supporting your child's character development!</p>
            
            <p>Best regards,<br><strong>The EchoDeed Team</strong></p>
        </div>
        
        <div class="footer">
            <p>EchoDeed™ - Building Character Through Kindness</p>
            <p>Enhanced COPPA Compliance • Burlington NC School District Approved</p>
            <p style="font-size: 12px; margin-top: 15px;">
                Consent Version: ${data.consentVersion} | This email was sent to you because a student at ${data.schoolName} provided your email address for parental consent.
            </p>
        </div>
    </div>
</body>
</html>
    `;
  }

  private generateConsentReminderEmailHTML(data: {
    parentName: string;
    studentFirstName: string;
    schoolName: string;
    consentUrl: string;
    verificationCode: string;
    reminderType: '3day' | '7day';
    daysSinceRequest: number;
    expiresInDays: number;
  }) {
    const isUrgent = data.reminderType === '7day';
    const urgencyColor = isUrgent ? '#dc2626' : '#d97706';
    const urgencyBg = isUrgent ? '#fef2f2' : '#fffbeb';
    const reminderText = data.reminderType === '3day' ? '3-Day Reminder' : 'Final 7-Day Reminder';
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${reminderText}: Parental Consent Required - EchoDeed</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, ${urgencyColor} 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
        .content { padding: 30px; }
        .urgency-box { background: ${urgencyBg}; border: 2px solid ${urgencyColor}; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .urgency-box h3 { margin: 0 0 10px 0; color: ${urgencyColor}; font-size: 18px; }
        .consent-button { display: block; background: linear-gradient(135deg, #10b981, #059669); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 18px; text-align: center; margin: 25px 0; transition: transform 0.2s; }
        .consent-button:hover { transform: translateY(-1px); }
        .burlington-info { background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; }
        .code-box { background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; padding: 12px; font-family: monospace; font-size: 16px; text-align: center; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⏰ ${reminderText}</h1>
            <p>Parental Consent Still Required</p>
        </div>
        
        <div class="content">
            <p>Dear <strong>${data.parentName}</strong>,</p>
            
            <div class="urgency-box">
                <h3>🚨 Action Required</h3>
                <p>This is a ${data.reminderType === '3day' ? 'gentle' : 'final'} reminder that your child <strong>${data.studentFirstName}</strong> is still waiting for parental consent to use EchoDeed through <strong>${data.schoolName}</strong>.</p>
                <ul>
                    <li><strong>Request sent:</strong> ${data.daysSinceRequest} days ago</li>
                    <li><strong>Expires in:</strong> ${data.expiresInDays} days</li>
                    <li><strong>Status:</strong> Waiting for your response</li>
                </ul>
            </div>

            <div class="burlington-info">
                <p><strong>🏫 Burlington Christian Academy COPPA Compliance Notice:</strong></p>
                <p>As part of Burlington Christian Academy's commitment to student digital safety, all students require explicit parental consent before accessing online educational platforms like EchoDeed. This consent process ensures:</p>
                <ul>
                    <li>Full transparency about data collection and use</li>
                    <li>Compliance with federal COPPA regulations</li>
                    <li>Parent control over their child's digital footprint</li>
                    <li>Enhanced safety measures for student online activities</li>
                </ul>
            </div>

            <p><strong>To provide consent for your child's EchoDeed account:</strong></p>
            
            <a href="${data.consentUrl}" class="consent-button">
                ✅ Give Consent Now
            </a>
            
            <div class="code-box">
                <strong>Verification Code:</strong> ${data.verificationCode}
            </div>

            <p style="font-size: 14px; color: #6b7280;">
                <strong>${data.reminderType === '7day' ? '⚠️ Final Notice:' : '📅 Important:'}</strong> 
                ${data.reminderType === '7day' ? 
                  `This is your final reminder. The consent request will expire in ${data.expiresInDays} days. After expiration, your child will need to register again.` :
                  `You have ${data.expiresInDays} days remaining to provide consent. We'll send one more reminder in 4 days.`
                }
            </p>

            <p>If you have any questions about this process, please contact Burlington Christian Academy directly or reply to this email.</p>
            
            <p>Thank you for your attention to this important matter!</p>
            
            <p>Best regards,<br><strong>Burlington Christian Academy<br>EchoDeed Implementation Team</strong></p>
        </div>
        
        <div class="footer">
            <p>EchoDeed™ - Building Character Through Kindness</p>
            <p>Burlington Christian Academy • COPPA Compliant • Safe for Students</p>
            <p style="font-size: 12px; margin-top: 15px;">
                This reminder was sent because a consent request for ${data.studentFirstName} at ${data.schoolName} has not been responded to. 
                To stop receiving reminders, please either approve or deny the consent request.
            </p>
        </div>
    </div>
</body>
</html>
    `;
  }

  private generateConsentReminderEmailText(data: {
    parentName: string;
    studentFirstName: string;
    schoolName: string;
    consentUrl: string;
    reminderType: '3day' | '7day';
    daysSinceRequest: number;
    expiresInDays: number;
  }) {
    const reminderText = data.reminderType === '3day' ? '3-DAY REMINDER' : 'FINAL 7-DAY REMINDER';
    
    return `
${reminderText}: PARENTAL CONSENT REQUIRED - EchoDeed

Dear ${data.parentName},

🚨 ACTION REQUIRED
This is a ${data.reminderType === '3day' ? 'gentle' : 'final'} reminder that your child ${data.studentFirstName} is still waiting for parental consent to use EchoDeed through ${data.schoolName}.

REQUEST STATUS:
• Request sent: ${data.daysSinceRequest} days ago
• Expires in: ${data.expiresInDays} days
• Status: Waiting for your response

🏫 BURLINGTON MIDDLE SCHOOL COPPA COMPLIANCE NOTICE:
As part of Burlington Christian Academy's commitment to student digital safety, all students require explicit parental consent before accessing online educational platforms like EchoDeed. This consent process ensures:
• Full transparency about data collection and use
• Compliance with federal COPPA regulations
• Parent control over their child's digital footprint
• Enhanced safety measures for student online activities

TO PROVIDE CONSENT:
Click this link: ${data.consentUrl}

${data.reminderType === '7day' ? 
  `⚠️ FINAL NOTICE: This is your final reminder. The consent request will expire in ${data.expiresInDays} days. After expiration, your child will need to register again.` :
  `📅 IMPORTANT: You have ${data.expiresInDays} days remaining to provide consent. We'll send one more reminder in 4 days.`
}

If you have any questions, please contact Burlington Christian Academy directly.

Thank you for your attention to this important matter!

Best regards,
Burlington Christian Academy
EchoDeed Implementation Team

---
EchoDeed™ - Building Character Through Kindness
Burlington Christian Academy • COPPA Compliant • Safe for Students
    `;
  }

  private generateConsentDenialHTML(data: {
    parentName: string;
    studentFirstName: string;
    schoolName: string;
    deniedAt: Date;
  }) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Parental Consent Denied - EchoDeed Account Status</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
        .content { padding: 30px; }
        .status-box { background: #fef2f2; border: 2px solid #ef4444; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .status-box h3 { margin: 0 0 10px 0; color: #dc2626; font-size: 18px; }
        .info-box { background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>❌ Consent Denied</h1>
            <p>Account Status Confirmation</p>
        </div>
        
        <div class="content">
            <p>Dear <strong>${data.parentName}</strong>,</p>
            
            <div class="status-box">
                <h3>📋 Consent Decision Recorded</h3>
                <p>You have chosen to <strong>deny parental consent</strong> for your child <strong>${data.studentFirstName}</strong> to use EchoDeed through <strong>${data.schoolName}</strong>.</p>
                <ul>
                    <li><strong>Decision:</strong> Consent Denied</li>
                    <li><strong>Date & Time:</strong> ${data.deniedAt.toLocaleDateString()} at ${data.deniedAt.toLocaleTimeString()}</li>
                    <li><strong>Account Status:</strong> Inactive (as requested)</li>
                </ul>
            </div>

            <div class="info-box">
                <p><strong>📌 What This Means:</strong></p>
                <ul>
                    <li>Your child's EchoDeed account will remain inactive</li>
                    <li>No personal information will be collected or processed</li>
                    <li>Your child will not have access to the EchoDeed platform</li>
                    <li>Your decision has been logged for Burlington Christian Academy's records</li>
                </ul>
            </div>

            <div class="info-box">
                <p><strong>💭 Changed Your Mind?</strong></p>
                <p>If you would like to reconsider and provide consent in the future, please contact <strong>${data.schoolName}</strong> directly. They can help initiate a new consent request.</p>
            </div>

            <p>Thank you for taking the time to review and respond to the parental consent request. Your decision helps ensure that only students with explicit parental approval can access digital educational platforms.</p>
            
            <p>If you have any questions about this decision or need to discuss your child's educational technology options, please contact the school directly.</p>
            
            <p>Best regards,<br><strong>Burlington Christian Academy<br>EchoDeed Implementation Team</strong></p>
        </div>
        
        <div class="footer">
            <p>EchoDeed™ - Building Character Through Kindness</p>
            <p>Burlington Christian Academy • COPPA Compliant • Respecting Parental Choices</p>
            <p style="font-size: 12px; margin-top: 15px;">
                This confirmation was sent to acknowledge your consent decision for ${data.studentFirstName} at ${data.schoolName}.
                Your privacy choices are respected and will be maintained.
            </p>
        </div>
    </div>
</body>
</html>
    `;
  }

  private generateConsentDenialText(data: {
    parentName: string;
    studentFirstName: string;
    schoolName: string;
    deniedAt: Date;
  }) {
    return `
PARENTAL CONSENT DENIED - EchoDeed Account Status

Dear ${data.parentName},

📋 CONSENT DECISION RECORDED
You have chosen to deny parental consent for your child ${data.studentFirstName} to use EchoDeed through ${data.schoolName}.

DECISION SUMMARY:
• Decision: Consent Denied
• Date & Time: ${data.deniedAt.toLocaleDateString()} at ${data.deniedAt.toLocaleTimeString()}
• Account Status: Inactive (as requested)

📌 WHAT THIS MEANS:
• Your child's EchoDeed account will remain inactive
• No personal information will be collected or processed
• Your child will not have access to the EchoDeed platform
• Your decision has been logged for Burlington Christian Academy's records

💭 CHANGED YOUR MIND?
If you would like to reconsider and provide consent in the future, please contact ${data.schoolName} directly. They can help initiate a new consent request.

Thank you for taking the time to review and respond to the parental consent request. Your decision helps ensure that only students with explicit parental approval can access digital educational platforms.

If you have any questions about this decision or need to discuss your child's educational technology options, please contact the school directly.

Best regards,
Burlington Christian Academy
EchoDeed Implementation Team

---
EchoDeed™ - Building Character Through Kindness
Burlington Christian Academy • COPPA Compliant • Respecting Parental Choices
    `;
  }

  private generateEnhancedConsentEmailText(data: {
    parentName: string;
    studentName: string;
    schoolName: string;
    verificationUrl: string;
    consentVersion: string;
    expiresAt: Date;
  }) {
    return `
ENHANCED PARENTAL CONSENT REQUIRED - EchoDeed (${data.consentVersion})

Dear ${data.parentName},

Your child ${data.studentName} has requested to create an account on EchoDeed through ${data.schoolName}.

🛡️ ENHANCED COPPA COMPLIANCE FEATURES:
• Granular Consent Controls - Choose exactly what data you consent to
• 72-Hour Security Expiry - Links automatically expire for security  
• One-Time Verification - Prevent replay attacks and unauthorized access
• Immutable Audit Trail - Permanent record for compliance
• Easy Revocation - Withdraw consent at any time

TO REVIEW & PROVIDE CONSENT:
Click this secure link: ${data.verificationUrl}

🚨 SECURITY NOTICE:
• This link expires on: ${data.expiresAt.toLocaleDateString()} at ${data.expiresAt.toLocaleTimeString()}
• This verification code can only be used once
• If expired, your child will need to request a new consent link

If you have any questions, please contact your child's school.

Thank you for supporting your child's character development!

Best regards,
The EchoDeed Team

---
EchoDeed™ - Building Character Through Kindness
Enhanced COPPA Compliance • Burlington NC School District Approved
Consent Version: ${data.consentVersion}
    `;
  }

  private generateConsentConfirmationHTML(data: {
    parentName: string;
    consentRecordId: string;
    approvedAt: Date;
    consentVersion: string;
  }) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Parental Consent Confirmed - EchoDeed</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .content { padding: 30px; }
        .confirmation-box { background: #f0fdf4; border: 2px solid #22c55e; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; }
        .record-box { background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; padding: 12px; font-family: monospace; font-size: 14px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Parental Consent Confirmed</h1>
            <p>EchoDeed Account Successfully Activated</p>
        </div>
        
        <div class="content">
            <p><strong>Dear ${data.parentName},</strong></p>
            
            <div class="confirmation-box">
                <h3>🎉 Consent Successfully Approved!</h3>
                <p>Your child's EchoDeed account has been activated and they can now safely participate in character-building activities.</p>
            </div>

            <p><strong>Consent Details:</strong></p>
            <div class="record-box">
                Record ID: ${data.consentRecordId}<br>
                Approved: ${data.approvedAt.toLocaleDateString()} at ${data.approvedAt.toLocaleTimeString()}<br>
                Consent Version: ${data.consentVersion}<br>
                Status: APPROVED & IMMUTABLE
            </div>

            <p><strong>What happens next?</strong></p>
            <ul>
                <li>Your child can now log into their EchoDeed account</li>
                <li>They can participate in supervised kindness activities</li>
                <li>You'll receive notifications about their positive contributions</li>
                <li>This consent record is now permanently stored for compliance</li>
            </ul>

            <p><strong>Remember:</strong> You can revoke this consent at any time by contacting your child's school or replying to this email.</p>
            
            <p>Thank you for supporting your child's character development!</p>
            
            <p>Best regards,<br><strong>The EchoDeed Team</strong></p>
        </div>
        
        <div class="footer">
            <p>EchoDeed™ - Building Character Through Kindness</p>
            <p>COPPA Compliant • Consent Record Secured</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  private generateConsentConfirmationText(data: {
    parentName: string;
    consentRecordId: string;
    approvedAt: Date;
    consentVersion: string;
  }) {
    return `
PARENTAL CONSENT CONFIRMED - EchoDeed

Dear ${data.parentName},

✅ Consent Successfully Approved!

Your child's EchoDeed account has been activated and they can now safely participate in character-building activities.

CONSENT DETAILS:
Record ID: ${data.consentRecordId}
Approved: ${data.approvedAt.toLocaleDateString()} at ${data.approvedAt.toLocaleTimeString()}
Consent Version: ${data.consentVersion}
Status: APPROVED & IMMUTABLE

WHAT HAPPENS NEXT?
• Your child can now log into their EchoDeed account
• They can participate in supervised kindness activities  
• You'll receive notifications about their positive contributions
• This consent record is now permanently stored for compliance

REMEMBER: You can revoke this consent at any time by contacting your child's school or replying to this email.

Thank you for supporting your child's character development!

Best regards,
The EchoDeed Team

---
EchoDeed™ - Building Character Through Kindness
COPPA Compliant • Consent Record Secured
    `;
  }

  private generateConsentRevocationHTML(data: {
    parentName: string;
    revokedAt: Date;
    revokedReason: string;
  }) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Parental Consent Revoked - EchoDeed</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .content { padding: 30px; }
        .revocation-box { background: #fef2f2; border: 2px solid #ef4444; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; }
        .record-box { background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; padding: 12px; font-family: monospace; font-size: 14px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛡️ Parental Consent Revoked</h1>
            <p>EchoDeed Account Deactivated</p>
        </div>
        
        <div class="content">
            <p><strong>Dear ${data.parentName},</strong></p>
            
            <div class="revocation-box">
                <h3>✋ Consent Successfully Revoked</h3>
                <p>As requested, your child's EchoDeed account has been immediately deactivated and all data access has been terminated.</p>
            </div>

            <p><strong>Revocation Details:</strong></p>
            <div class="record-box">
                Revoked: ${data.revokedAt.toLocaleDateString()} at ${data.revokedAt.toLocaleTimeString()}<br>
                Reason: ${data.revokedReason}<br>
                Status: REVOKED & ACCOUNT DEACTIVATED
            </div>

            <p><strong>What has been done:</strong></p>
            <ul>
                <li>Your child's account has been immediately deactivated</li>
                <li>All platform access has been terminated</li>
                <li>Future data collection has been stopped</li>
                <li>This revocation is permanently recorded for compliance</li>
            </ul>

            <p><strong>Your Rights:</strong> This revocation demonstrates our commitment to your parental rights and COPPA compliance. If you change your mind, your child can create a new account with fresh consent.</p>
            
            <p>Thank you for using EchoDeed. We respect your decision and your child's privacy.</p>
            
            <p>Best regards,<br><strong>The EchoDeed Team</strong></p>
        </div>
        
        <div class="footer">
            <p>EchoDeed™ - Building Character Through Kindness</p>
            <p>COPPA Compliant • Consent Rights Respected</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  private generateConsentRevocationText(data: {
    parentName: string;
    revokedAt: Date;
    revokedReason: string;
  }) {
    return `
PARENTAL CONSENT REVOKED - EchoDeed

Dear ${data.parentName},

🛡️ Consent Successfully Revoked

As requested, your child's EchoDeed account has been immediately deactivated and all data access has been terminated.

REVOCATION DETAILS:
Revoked: ${data.revokedAt.toLocaleDateString()} at ${data.revokedAt.toLocaleTimeString()}
Reason: ${data.revokedReason}
Status: REVOKED & ACCOUNT DEACTIVATED

WHAT HAS BEEN DONE:
• Your child's account has been immediately deactivated
• All platform access has been terminated
• Future data collection has been stopped  
• This revocation is permanently recorded for compliance

YOUR RIGHTS: This revocation demonstrates our commitment to your parental rights and COPPA compliance. If you change your mind, your child can create a new account with fresh consent.

Thank you for using EchoDeed. We respect your decision and your child's privacy.

Best regards,
The EchoDeed Team

---
EchoDeed™ - Building Character Through Kindness
COPPA Compliant • Consent Rights Respected
    `;
  }

  // 🔄 RENEWAL EMAIL TEMPLATE GENERATORS - BURLINGTON POLICY

  private generateConsentRenewalHTML(data: {
    parentName: string;
    studentFirstName: string;
    schoolName: string;
    renewalUrl: string;
    renewalYear: string;
    expiryDate: Date;
    verificationCode: string;
  }) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Annual Consent Renewal Required - EchoDeed</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
        .content { padding: 30px; }
        .renewal-box { background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .renewal-box h3 { margin: 0 0 10px 0; color: #92400e; font-size: 18px; }
        .renewal-button { display: block; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 18px; text-align: center; margin: 25px 0; transition: transform 0.2s; }
        .renewal-button:hover { transform: translateY(-1px); }
        .burlington-info { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; }
        .code-box { background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; padding: 12px; font-family: monospace; font-size: 16px; text-align: center; margin: 15px 0; }
        .deadline-warning { background: #fee2e2; border: 2px solid #ef4444; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔄 Annual Consent Renewal</h1>
            <p>Burlington Christian Academy - School Year ${data.renewalYear}</p>
        </div>
        
        <div class="content">
            <p><strong>Dear ${data.parentName},</strong></p>
            
            <div class="renewal-box">
                <h3>📅 Time to Renew ${data.studentFirstName}'s EchoDeed Consent</h3>
                <p>Your child's current consent expires on <strong>${data.expiryDate.toLocaleDateString()}</strong>. To ensure uninterrupted access to our character-building platform, please renew their consent for the ${data.renewalYear} school year.</p>
            </div>

            <div class="burlington-info">
                <h4>🏫 Burlington Policy Requirement</h4>
                <p>In accordance with Burlington Christian Academy policy, all student technology consents must be renewed annually. This ensures:</p>
                <ul>
                    <li>Continued COPPA compliance for grades 6-8</li>
                    <li>Updated parent contact information</li>
                    <li>Verification of current consent preferences</li>
                    <li>Alignment with current school year policies</li>
                </ul>
            </div>

            <div style="text-align: center;">
                <a href="${data.renewalUrl}" class="renewal-button">
                    🔄 Renew Consent for ${data.renewalYear}
                </a>
            </div>

            <div class="deadline-warning">
                <h4>⏰ Important Deadline</h4>
                <p><strong>Renewal must be completed by ${data.expiryDate.toLocaleDateString()}</strong></p>
                <p>After this date, ${data.studentFirstName}'s account will be temporarily restricted until consent is renewed.</p>
            </div>

            <p><strong>What's included in the renewal?</strong></p>
            <ul>
                <li>Review and update your consent preferences</li>
                <li>Confirm current contact information</li>
                <li>Digital signature authentication</li>
                <li>New school year coverage through July 31, 2026</li>
            </ul>

            <div class="code-box">
                <strong>Verification Code:</strong> ${data.verificationCode}
            </div>

            <p><strong>Questions?</strong> Contact Burlington Christian Academy or reply to this email.</p>
            
            <p>Thank you for your continued support of ${data.studentFirstName}'s character development!</p>
            
            <p>Best regards,<br><strong>${data.schoolName}<br>EchoDeed Team</strong></p>
        </div>
        
        <div class="footer">
            <p>EchoDeed™ - Building Character Through Kindness</p>
            <p>Burlington Christian Academy • COPPA Compliant • Annual Renewal Required</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  private generateConsentRenewalText(data: {
    parentName: string;
    studentFirstName: string;
    schoolName: string;
    renewalUrl: string;
    renewalYear: string;
    expiryDate: Date;
  }) {
    return `
ANNUAL CONSENT RENEWAL REQUIRED - EchoDeed
Burlington Christian Academy - School Year ${data.renewalYear}

Dear ${data.parentName},

🔄 Time to Renew ${data.studentFirstName}'s EchoDeed Consent

Your child's current consent expires on ${data.expiryDate.toLocaleDateString()}. To ensure uninterrupted access to our character-building platform, please renew their consent for the ${data.renewalYear} school year.

🏫 BURLINGTON POLICY REQUIREMENT
In accordance with Burlington Christian Academy policy, all student technology consents must be renewed annually. This ensures:
• Continued COPPA compliance for grades 6-8
• Updated parent contact information  
• Verification of current consent preferences
• Alignment with current school year policies

⏰ IMPORTANT DEADLINE
Renewal must be completed by ${data.expiryDate.toLocaleDateString()}
After this date, ${data.studentFirstName}'s account will be temporarily restricted until consent is renewed.

WHAT'S INCLUDED IN THE RENEWAL?
• Review and update your consent preferences
• Confirm current contact information
• Digital signature authentication
• New school year coverage through July 31, 2026

RENEW NOW: ${data.renewalUrl}

Questions? Contact Burlington Christian Academy or reply to this email.

Thank you for your continued support of ${data.studentFirstName}'s character development!

Best regards,
${data.schoolName}
EchoDeed Team

----
EchoDeed™ - Building Character Through Kindness
Burlington Christian Academy • COPPA Compliant • Annual Renewal Required
    `;
  }

  private generateRenewalReminderHTML(data: {
    parentName: string;
    studentFirstName: string;
    schoolName: string;
    renewalUrl: string;
    reminderType: string;
    daysUntilExpiry: number;
    expiryDate: Date;
    urgency: string;
    emoji: string;
    priority: string;
    verificationCode: string;
  }) {
    const priorityColors = {
      'info': { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
      'warning': { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
      'urgent': { bg: '#fee2e2', border: '#ef4444', text: '#dc2626' },
      'critical': { bg: '#fecaca', border: '#dc2626', text: '#991b1b' }
    };

    const colors = priorityColors[data.priority as keyof typeof priorityColors] || priorityColors.info;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.urgency} - Consent Renewal Reminder</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, ${colors.border}, ${colors.text}); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
        .content { padding: 30px; }
        .reminder-box { background: ${colors.bg}; border: 2px solid ${colors.border}; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
        .reminder-box h3 { margin: 0 0 10px 0; color: ${colors.text}; font-size: 20px; }
        .countdown { font-size: 36px; font-weight: bold; color: ${colors.text}; margin: 15px 0; }
        .renewal-button { display: block; background: linear-gradient(135deg, ${colors.border}, ${colors.text}); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 18px; text-align: center; margin: 25px 0; transition: transform 0.2s; }
        .renewal-button:hover { transform: translateY(-1px); }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; }
        .code-box { background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; padding: 12px; font-family: monospace; font-size: 16px; text-align: center; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${data.emoji} ${data.urgency}</h1>
            <p>Consent Renewal Reminder for ${data.studentFirstName}</p>
        </div>
        
        <div class="content">
            <p><strong>Dear ${data.parentName},</strong></p>
            
            <div class="reminder-box">
                <h3>${data.emoji} Consent Renewal Required</h3>
                <div class="countdown">${data.daysUntilExpiry}</div>
                <p><strong>Days Remaining</strong></p>
                <p>${data.studentFirstName}'s consent expires on <strong>${data.expiryDate.toLocaleDateString()}</strong></p>
            </div>

            <p><strong>Why this matters:</strong></p>
            <ul>
                <li>Ensures continuous access to EchoDeed activities</li>
                <li>Maintains COPPA compliance for Burlington Christian Academy</li>
                <li>Prevents temporary account restrictions</li>
                <li>Updates consent for the current school year</li>
            </ul>

            <div style="text-align: center;">
                <a href="${data.renewalUrl}" class="renewal-button">
                    ${data.emoji} Complete Renewal Now
                </a>
            </div>

            <div class="code-box">
                <strong>Verification Code:</strong> ${data.verificationCode}
            </div>

            <p><strong>Next reminders:</strong> We'll continue to notify you until the renewal is completed or the deadline passes.</p>
            
            <p>Questions? Contact ${data.schoolName} or reply to this email.</p>
            
            <p>Best regards,<br><strong>${data.schoolName}<br>EchoDeed Team</strong></p>
        </div>
        
        <div class="footer">
            <p>EchoDeed™ - Building Character Through Kindness</p>
            <p>Burlington Christian Academy • COPPA Compliant • Renewal System</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  private generateRenewalReminderText(data: {
    parentName: string;
    studentFirstName: string;
    schoolName: string;
    renewalUrl: string;
    reminderType: string;
    daysUntilExpiry: number;
    expiryDate: Date;
    urgency: string;
  }) {
    return `
${data.urgency.toUpperCase()} - CONSENT RENEWAL REMINDER
Burlington Christian Academy - EchoDeed

Dear ${data.parentName},

🔄 Consent Renewal Required for ${data.studentFirstName}

⏰ ${data.daysUntilExpiry} DAYS REMAINING

${data.studentFirstName}'s consent expires on ${data.expiryDate.toLocaleDateString()}

WHY THIS MATTERS:
• Ensures continuous access to EchoDeed activities
• Maintains COPPA compliance for Burlington Christian Academy  
• Prevents temporary account restrictions
• Updates consent for the current school year

COMPLETE RENEWAL NOW: ${data.renewalUrl}

NEXT REMINDERS: We'll continue to notify you until the renewal is completed or the deadline passes.

Questions? Contact ${data.schoolName} or reply to this email.

Best regards,
${data.schoolName}
EchoDeed Team

----
EchoDeed™ - Building Character Through Kindness
Burlington Christian Academy • COPPA Compliant • Renewal System
    `;
  }
}

// Export singleton instance
export const emailService = new NodemailerEmailService();
export type { ConsentEmailData, EmailService };