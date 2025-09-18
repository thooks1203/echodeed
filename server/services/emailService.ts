import nodemailer from 'nodemailer';

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

interface EmailService {
  sendParentalConsentEmail(data: ConsentEmailData): Promise<boolean>;
  sendEnhancedParentalConsentEmail(data: EnhancedConsentEmailData): Promise<boolean>;
  sendConsentConfirmationEmail(data: ConsentConfirmationEmailData): Promise<boolean>;
  sendConsentRevocationConfirmation(data: ConsentRevocationEmailData): Promise<boolean>;
}

class NodemailerEmailService implements EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // For development, we'll use a test account or log-only mode
    if (process.env.NODE_ENV === 'development') {
      // In development, we'll just log the emails instead of sending them
      console.log('📧 Email service initialized in development mode (logging only)');
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
      from: process.env.SMTP_FROM || 'EchoDeed <noreply@echodeed.com>',
      to: parentEmail,
      subject: `🔐 Parental Consent Required - ${studentFirstName}'s EchoDeed Account`,
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
                <strong>Important:</strong> This consent link will expire in 72 hours. If you do not provide consent within this time, your child will need to register again.
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

This consent link will expire in 72 hours.

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
}

// Export singleton instance
export const emailService = new NodemailerEmailService();
export type { ConsentEmailData, EmailService };