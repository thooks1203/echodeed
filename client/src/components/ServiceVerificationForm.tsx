import { useAuth } from '@/hooks/useAuth';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ServiceVerificationFormDownload() {
  const { user } = useAuth();

  const downloadVerificationForm = () => {
    const studentName = user?.name || 'Student Name';
    const studentEmail = user?.email || '';
    
    const formHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>EchoDeed Service Hour Verification Form</title>
  <style>
    @media print {
      @page { margin: 0.5in; }
      button { display: none; }
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 20px;
      background: white;
      color: #1a1a1a;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #6366f1;
    }
    
    .echodeed-brand {
      flex: 1;
    }
    
    .echodeed-logo {
      font-size: 32px;
      font-weight: 900;
      background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 5px;
    }
    
    .echodeed-tagline {
      font-size: 12px;
      color: #6b7280;
      font-style: italic;
    }
    
    .school-info {
      text-align: right;
      font-size: 13px;
      line-height: 1.6;
    }
    
    .school-name {
      font-weight: 700;
      color: #1f2937;
      font-size: 16px;
    }
    
    .school-address {
      color: #4b5563;
    }
    
    .form-title {
      text-align: center;
      font-size: 24px;
      font-weight: 700;
      color: #1f2937;
      margin: 30px 0 10px 0;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .form-subtitle {
      text-align: center;
      color: #6b7280;
      font-size: 14px;
      margin-bottom: 30px;
    }
    
    .section {
      margin-bottom: 25px;
    }
    
    .section-title {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      padding: 8px 15px;
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 15px;
      border-radius: 4px;
    }
    
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 15px;
    }
    
    .form-field {
      margin-bottom: 15px;
    }
    
    .form-field.full-width {
      grid-column: 1 / -1;
    }
    
    .field-label {
      display: block;
      font-weight: 600;
      color: #374151;
      margin-bottom: 6px;
      font-size: 13px;
    }
    
    .field-value {
      display: block;
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      min-height: 36px;
      background: #f9fafb;
      font-size: 14px;
    }
    
    .field-value.pre-filled {
      background: #eff6ff;
      border-color: #93c5fd;
      color: #1e40af;
      font-weight: 500;
    }
    
    .field-input {
      display: block;
      width: 100%;
      padding: 8px 12px;
      border: 2px solid #d1d5db;
      border-radius: 4px;
      font-size: 14px;
      box-sizing: border-box;
    }
    
    .textarea {
      min-height: 80px;
      resize: vertical;
    }
    
    .signature-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
    }
    
    .signature-box {
      border: 2px solid #9ca3af;
      border-radius: 4px;
      padding: 15px;
      min-height: 80px;
      background: white;
    }
    
    .signature-label {
      font-size: 11px;
      color: #6b7280;
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 30px;
    }
    
    .signature-line {
      border-top: 2px solid #1f2937;
      margin-top: 10px;
      padding-top: 5px;
    }
    
    .signature-text {
      font-size: 11px;
      color: #6b7280;
      text-align: center;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 11px;
    }
    
    .instructions {
      background: #fef3c7;
      border: 2px solid #fbbf24;
      border-radius: 6px;
      padding: 15px;
      margin-bottom: 25px;
    }
    
    .instructions-title {
      font-weight: 700;
      color: #92400e;
      margin-bottom: 8px;
      font-size: 14px;
    }
    
    .instructions-text {
      color: #78350f;
      font-size: 13px;
      line-height: 1.5;
    }
    
    .print-button {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      padding: 12px 30px;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      display: block;
      margin: 20px auto;
    }
    
    .print-button:hover {
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <button class="print-button" onclick="window.print()">🖨️ Print This Form</button>
  
  <div class="header">
    <div class="echodeed-brand">
      <div class="echodeed-logo">EchoDeed™</div>
      <div class="echodeed-tagline">Character Education in Action</div>
    </div>
    <div class="school-info">
      <div class="school-name">Eastern Guilford High School</div>
      <div class="school-address">3609 Terrace Drive</div>
      <div class="school-address">Gibsonville, NC 27249</div>
      <div class="school-address">(336) 449-4521</div>
    </div>
  </div>
  
  <div class="form-title">Service Hour Verification Form</div>
  <div class="form-subtitle">Official Documentation for Community Service Hours</div>
  
  <div class="instructions">
    <div class="instructions-title">📋 Instructions for Student:</div>
    <div class="instructions-text">
      1. Print this form and bring it to your service organization<br>
      2. Have your supervisor complete and sign this form<br>
      3. Take a clear photo of the completed form<br>
      4. Upload the photo when submitting your service hours on EchoDeed
    </div>
  </div>
  
  <div class="section">
    <div class="section-title">Student Information</div>
    <div class="form-row">
      <div class="form-field">
        <label class="field-label">Student Name</label>
        <div class="field-value pre-filled">${studentName}</div>
      </div>
      <div class="form-field">
        <label class="field-label">Student Grade</label>
        <input type="text" class="field-input" placeholder="Grade level (9-12)" />
      </div>
    </div>
    <div class="form-field">
      <label class="field-label">Student Email (Optional)</label>
      <div class="field-value">${studentEmail}</div>
    </div>
  </div>
  
  <div class="section">
    <div class="section-title">Service Details (To be completed by Student)</div>
    <div class="form-row">
      <div class="form-field">
        <label class="field-label">Organization Name</label>
        <input type="text" class="field-input" />
      </div>
      <div class="form-field">
        <label class="field-label">Service Date</label>
        <input type="date" class="field-input" />
      </div>
    </div>
    
    <div class="form-row">
      <div class="form-field">
        <label class="field-label">Start Time</label>
        <input type="time" class="field-input" />
      </div>
      <div class="form-field">
        <label class="field-label">End Time</label>
        <input type="time" class="field-input" />
      </div>
    </div>
    
    <div class="form-field">
      <label class="field-label">Total Hours</label>
      <input type="text" class="field-input" placeholder="Calculate total hours (e.g., 3.5)" />
    </div>
    
    <div class="form-field">
      <label class="field-label">Description of Service Performed</label>
      <textarea class="field-input textarea" placeholder="Describe the work you did during your service..."></textarea>
    </div>
  </div>
  
  <div class="section">
    <div class="section-title">Organization Verification (To be completed by Supervisor)</div>
    <div class="form-row">
      <div class="form-field">
        <label class="field-label">Supervisor Name (Print)</label>
        <input type="text" class="field-input" />
      </div>
      <div class="form-field">
        <label class="field-label">Supervisor Title/Position</label>
        <input type="text" class="field-input" />
      </div>
    </div>
    
    <div class="form-row">
      <div class="form-field">
        <label class="field-label">Organization Contact Phone</label>
        <input type="tel" class="field-input" />
      </div>
      <div class="form-field">
        <label class="field-label">Organization Contact Email</label>
        <input type="email" class="field-input" />
      </div>
    </div>
    
    <div class="signature-section">
      <div class="signature-box">
        <div class="signature-label">Supervisor Signature</div>
        <div class="signature-line">
          <div class="signature-text">Signature</div>
        </div>
      </div>
      <div class="signature-box">
        <div class="signature-label">Date</div>
        <div class="signature-line">
          <div class="signature-text">Date Signed</div>
        </div>
      </div>
    </div>
  </div>
  
  <div class="footer">
    <p><strong>For Teacher Use Only:</strong> This form has been verified and approved for EchoDeed service hour credit.</p>
    <p>EchoDeed™ Platform | Eastern Guilford High School Character Education Program</p>
    <p style="margin-top: 10px; font-style: italic;">This standardized form ensures accurate tracking and x2vol export compatibility</p>
  </div>
</body>
</html>
    `;

    // Create blob and download
    const blob = new Blob([formHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EchoDeed_Verification_Form_${studentName.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={downloadVerificationForm}
      className="w-full border-2 border-orange-500 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold shadow-lg hover:shadow-xl transition-all"
      data-testid="button-download-verification-form"
    >
      <Download className="w-4 h-4 mr-2" />
      Download Verification Form (Print & Bring to Organization)
    </Button>
  );
}
