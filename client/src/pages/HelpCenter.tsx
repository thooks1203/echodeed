import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BackButton } from '@/components/BackButton';
import { 
  HelpCircle, 
  MessageSquare, 
  Bug, 
  Lightbulb, 
  Send,
  CheckCircle,
  BookOpen,
  Mail,
  Phone
} from 'lucide-react';

export default function HelpCenter() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [issueType, setIssueType] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [submitted, setSubmitted] = useState(false);

  const submitIssueMutation = useMutation({
    mutationFn: async (data: { issueType: string; subject: string; description: string; contactEmail: string }) => {
      return await apiRequest('POST', '/api/support/report-issue', data);
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({ title: "Issue Reported", description: "We'll get back to you as soon as possible!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit issue. Please try again.", variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueType || !subject || !description) {
      toast({ title: "Missing Fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    submitIssueMutation.mutate({ issueType, subject, description, contactEmail });
  };

  const faqItems = [
    { q: "How do I earn Echo Tokens?", a: "Post about kind acts you've done or witnessed, complete weekly challenges, and maintain your kindness streak!" },
    { q: "How do I redeem my rewards?", a: "Visit the Rewards page and browse available offers. Click 'Redeem' on any reward you have enough tokens for." },
    { q: "What is the Leadership Certificate Track?", a: "High school students can complete 5 mentor training modules, log community service quests, and present a portfolio to earn the $500 EchoDeed Scholarship." },
    { q: "How do I log community service hours?", a: "Go to your dashboard and click 'Log Service Hours'. Fill in the details and upload any evidence if required." },
    { q: "My tokens aren't showing up - what do I do?", a: "Try refreshing the page. If the issue persists, use the Report Issue form below and we'll investigate." }
  ];

  if (submitted) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px', textAlign: 'center' }}>
        <BackButton onClick={() => setLocation('/app')} label="Back to Home" />
        
        <Card style={{ marginTop: '40px' }}>
          <CardContent style={{ padding: '48px' }}>
            <CheckCircle size={64} style={{ color: '#10B981', margin: '0 auto 24px' }} />
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>Issue Reported!</h2>
            <p style={{ color: '#6B7280', marginBottom: '24px' }}>
              Thank you for letting us know. We'll review your issue and get back to you within 24-48 hours.
            </p>
            <Button onClick={() => setLocation('/app')}>
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
      <BackButton onClick={() => setLocation('/app')} label="Back to Home" />
      
      <div style={{ marginTop: '16px', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <HelpCircle size={32} style={{ color: '#6366F1' }} />
          Help Center
        </h1>
        <p style={{ color: '#6B7280' }}>
          Find answers to common questions or report an issue
        </p>
      </div>

      {/* Quick Contact Info */}
      <Card style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)', border: '1px solid #C7D2FE' }}>
        <CardContent style={{ padding: '20px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={18} style={{ color: '#4F46E5' }} />
              <span style={{ fontSize: '14px' }}>support@echodeed.com</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={18} style={{ color: '#4F46E5' }} />
              <span style={{ fontSize: '14px' }}>School Admin Contact</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card style={{ marginBottom: '24px' }}>
        <CardHeader>
          <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={20} />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {faqItems.map((faq, idx) => (
              <div key={idx} style={{ 
                padding: '16px', 
                background: '#F9FAFB', 
                borderRadius: '8px',
                border: '1px solid #E5E7EB'
              }}>
                <h4 style={{ fontWeight: '600', marginBottom: '8px', color: '#1F2937' }}>{faq.q}</h4>
                <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.5' }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Issue Form */}
      <Card>
        <CardHeader>
          <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={20} />
            Report an Issue
          </CardTitle>
          <CardDescription>
            Having a problem? Let us know and we'll help you out.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <Label htmlFor="issueType">Issue Type *</Label>
              <Select value={issueType} onValueChange={setIssueType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select issue type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Bug size={16} /> Bug / Something's broken
                    </div>
                  </SelectItem>
                  <SelectItem value="feature">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Lightbulb size={16} /> Feature Request
                    </div>
                  </SelectItem>
                  <SelectItem value="account">Account / Login Issue</SelectItem>
                  <SelectItem value="tokens">Tokens / Rewards Issue</SelectItem>
                  <SelectItem value="service-hours">Service Hours Issue</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input 
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of the issue"
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea 
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe the issue in detail. Include any error messages you saw, what you were trying to do, and what happened instead."
                style={{ minHeight: '120px' }}
              />
            </div>

            <div>
              <Label htmlFor="contactEmail">Your Email (for follow-up)</Label>
              <Input 
                id="contactEmail"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="your.email@school.edu"
              />
            </div>

            <Button 
              type="submit" 
              disabled={submitIssueMutation.isPending}
              style={{ 
                background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                color: 'white'
              }}
            >
              {submitIssueMutation.isPending ? (
                'Submitting...'
              ) : (
                <>
                  <Send size={16} style={{ marginRight: '8px' }} />
                  Submit Issue
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
