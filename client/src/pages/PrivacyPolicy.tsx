import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BackButton } from '@/components/BackButton';
import { Shield, Lock, Eye, Users, Server, Mail } from 'lucide-react';

export default function PrivacyPolicy() {
  const [, setLocation] = useLocation();

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
      <BackButton onClick={() => setLocation('/')} label="Back to Home" />
      
      <div style={{ marginTop: '16px', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Shield size={32} style={{ color: '#10B981' }} />
          Privacy Policy
        </h1>
        <p style={{ color: '#6B7280' }}>
          Last updated: February 2026
        </p>
      </div>

      <Card style={{ marginBottom: '24px' }}>
        <CardHeader>
          <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={20} />
            Our Commitment to Student Privacy
          </CardTitle>
        </CardHeader>
        <CardContent style={{ lineHeight: '1.8', color: '#374151' }}>
          <p style={{ marginBottom: '16px' }}>
            EchoDeed™ is committed to protecting the privacy of students, parents, and educators who use our platform. 
            As a school-based character education and leadership development application, we understand the importance 
            of safeguarding student data and maintaining compliance with applicable privacy laws.
          </p>
          <p>
            This Privacy Policy explains how we collect, use, and protect information when you use our services. 
            Our practices are designed to comply with the Family Educational Rights and Privacy Act (FERPA), 
            the Children's Online Privacy Protection Act (COPPA), and other applicable privacy regulations.
          </p>
        </CardContent>
      </Card>

      <Card style={{ marginBottom: '24px' }}>
        <CardHeader>
          <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Eye size={20} />
            Information We Collect
          </CardTitle>
        </CardHeader>
        <CardContent style={{ lineHeight: '1.8', color: '#374151' }}>
          <h4 style={{ fontWeight: '600', marginBottom: '8px' }}>Student Information:</h4>
          <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
            <li>Name and school email address (provided during registration)</li>
            <li>Grade level and school affiliation</li>
            <li>Kindness posts and community service logs (voluntarily submitted)</li>
            <li>Echo Token balance and reward redemption history</li>
            <li>Leadership Certificate Track progress</li>
          </ul>

          <h4 style={{ fontWeight: '600', marginBottom: '8px' }}>Parent/Guardian Information:</h4>
          <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
            <li>Name and email address (for consent and notifications)</li>
            <li>Communication preferences</li>
          </ul>

          <h4 style={{ fontWeight: '600', marginBottom: '8px' }}>Educator Information:</h4>
          <ul style={{ paddingLeft: '24px' }}>
            <li>Name, school email, and role within the school</li>
            <li>Classroom management data</li>
          </ul>
        </CardContent>
      </Card>

      <Card style={{ marginBottom: '24px' }}>
        <CardHeader>
          <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} />
            How We Use Information
          </CardTitle>
        </CardHeader>
        <CardContent style={{ lineHeight: '1.8', color: '#374151' }}>
          <p style={{ marginBottom: '16px' }}>
            <strong>Educational Purposes Only:</strong> All information collected is used solely for educational 
            purposes related to character education, leadership development, and community service tracking.
          </p>
          
          <p style={{ marginBottom: '16px' }}>
            We use the information to:
          </p>
          <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
            <li>Enable students to share kindness acts and earn recognition</li>
            <li>Track community service hours for the Service-Learning Diploma</li>
            <li>Administer the Leadership Certificate Track and scholarship eligibility</li>
            <li>Provide parents with visibility into their child's positive activities</li>
            <li>Allow educators to monitor classroom character education initiatives</li>
            <li>Generate aggregate, de-identified analytics for school administrators</li>
          </ul>

          <p style={{ fontWeight: '600', color: '#DC2626' }}>
            We do NOT sell, rent, or share personal information with third parties for advertising or marketing purposes.
          </p>
        </CardContent>
      </Card>

      <Card style={{ marginBottom: '24px' }}>
        <CardHeader>
          <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={20} />
            Data Security & Storage
          </CardTitle>
        </CardHeader>
        <CardContent style={{ lineHeight: '1.8', color: '#374151' }}>
          <ul style={{ paddingLeft: '24px' }}>
            <li>All data is encrypted in transit and at rest using industry-standard encryption</li>
            <li>Access to student data is strictly limited to authorized school personnel</li>
            <li>We maintain audit logs of all data access for security purposes</li>
            <li>Data is stored on secure, SOC 2 compliant servers in the United States</li>
            <li>Regular security assessments and vulnerability testing are conducted</li>
          </ul>
        </CardContent>
      </Card>

      <Card style={{ marginBottom: '24px' }}>
        <CardHeader>
          <CardTitle>Parental Rights (COPPA Compliance)</CardTitle>
        </CardHeader>
        <CardContent style={{ lineHeight: '1.8', color: '#374151' }}>
          <p style={{ marginBottom: '16px' }}>
            For students under 13 years of age, we obtain verifiable parental consent before collecting personal information.
          </p>
          <p style={{ marginBottom: '16px' }}>
            Parents and guardians have the right to:
          </p>
          <ul style={{ paddingLeft: '24px' }}>
            <li>Review their child's personal information</li>
            <li>Request deletion of their child's data</li>
            <li>Refuse further collection or use of their child's information</li>
            <li>Opt out of certain features or communications</li>
          </ul>
        </CardContent>
      </Card>

      <Card style={{ marginBottom: '24px' }}>
        <CardHeader>
          <CardTitle>Student Rights (FERPA Compliance)</CardTitle>
        </CardHeader>
        <CardContent style={{ lineHeight: '1.8', color: '#374151' }}>
          <p style={{ marginBottom: '16px' }}>
            We operate under the direction of participating schools and comply with FERPA requirements. 
            Student education records are protected and only disclosed to:
          </p>
          <ul style={{ paddingLeft: '24px' }}>
            <li>School officials with legitimate educational interests</li>
            <li>Parents/guardians (for students under 18)</li>
            <li>Students themselves (age 18+ or in post-secondary education)</li>
            <li>As otherwise required by law</li>
          </ul>
        </CardContent>
      </Card>

      <Card style={{ marginBottom: '24px' }}>
        <CardHeader>
          <CardTitle>Data Retention</CardTitle>
        </CardHeader>
        <CardContent style={{ lineHeight: '1.8', color: '#374151' }}>
          <p>
            Student data is retained for the duration of the student's enrollment in a participating school, 
            plus a reasonable period for record-keeping purposes (typically 3 years after graduation or 
            withdrawal). Schools may request earlier deletion of student data. Service-Learning Diploma 
            records may be retained longer to verify scholarship eligibility and academic achievements.
          </p>
        </CardContent>
      </Card>

      <Card style={{ marginBottom: '24px' }}>
        <CardHeader>
          <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={20} />
            Contact Us
          </CardTitle>
        </CardHeader>
        <CardContent style={{ lineHeight: '1.8', color: '#374151' }}>
          <p style={{ marginBottom: '16px' }}>
            If you have questions about this Privacy Policy or wish to exercise your privacy rights, please contact us:
          </p>
          <div style={{ 
            padding: '16px', 
            background: '#F3F4F6', 
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            <p><strong>EchoDeed™ Privacy Team</strong></p>
            <p>Email: privacy@echodeed.com</p>
            <p>Address: Greensboro, North Carolina</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>
          <p style={{ fontSize: '14px' }}>
            © 2026 EchoDeed™. All rights reserved.<br />
            This Privacy Policy may be updated periodically. We will notify users of material changes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
