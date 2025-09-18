import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, School, Users, TrendingUp, Shield, Calendar } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

const trialSignupSchema = z.object({
  schoolName: z.string().min(3, 'School name must be at least 3 characters'),
  districtName: z.string().min(3, 'District name must be at least 3 characters'),
  adminName: z.string().min(2, 'Administrator name is required'),
  adminEmail: z.string().email('Please enter a valid email address'),
  adminRole: z.enum(['principal', 'vice_principal', 'district_admin', 'superintendent']),
  studentCount: z.number().min(50, 'Minimum 50 students required for pilot').max(10000, 'Maximum 10,000 students for pilot'),
  contactPhone: z.string().min(10, 'Please enter a valid phone number').optional(),
});

type TrialSignupForm = z.infer<typeof trialSignupSchema>;

interface TrialResponse {
  success: boolean;
  schoolId: string;
  adminId: string;
  trialEndDate: string;
  message: string;
}

export default function TrialSignup() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [trialDetails, setTrialDetails] = useState<TrialResponse | null>(null);
  const [formData, setFormData] = useState<TrialSignupForm | null>(null);
  const { toast } = useToast();

  const form = useForm<TrialSignupForm>({
    resolver: zodResolver(trialSignupSchema),
    defaultValues: {
      schoolName: '',
      districtName: '',
      adminName: '',
      adminEmail: '',
      adminRole: 'principal',
      studentCount: 300,
      contactPhone: '',
    },
  });

  const trialMutation = useMutation({
    mutationFn: async (data: TrialSignupForm) => {
      const response = await fetch('/api/admin/trial-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create trial account');
      }
      
      return response.json() as Promise<TrialResponse>;
    },
    onSuccess: (data: TrialResponse) => {
      setTrialDetails(data);
      setIsSuccess(true);
      toast({
        title: "Trial Account Created!",
        description: "Your 30-day pilot program has been set up successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again or contact support.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TrialSignupForm) => {
    setFormData(data); // Store form data for use in success screen
    trialMutation.mutate(data);
  };

  if (isSuccess && trialDetails) {
    return (
      <div className="container max-w-4xl mx-auto p-6 space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-green-600">Trial Account Created Successfully!</h1>
          <p className="text-lg text-gray-600">
            Your 30-day EchoDeed pilot program is now active and ready to use.
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Your Trial Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-gray-700">School ID</p>
                <p className="text-sm text-gray-600">{trialDetails.schoolId}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Trial End Date</p>
                <p className="text-sm text-gray-600">
                  {new Date(trialDetails.trialEndDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Registration Complete - What's Next?
              </h3>
              <div className="space-y-3 text-sm text-green-700">
                <div className="bg-white p-3 rounded border border-green-200">
                  <p className="font-semibold text-green-800 mb-1">📧 Account Approval Process:</p>
                  <p>Our team will review your registration and send login credentials to <strong>{formData?.adminEmail}</strong> within <strong>1-2 business days</strong>.</p>
                </div>
                <div className="bg-white p-3 rounded border border-green-200">
                  <p className="font-semibold text-green-800 mb-1">🎯 Next Steps:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Watch for our approval email with login instructions</li>
                    <li>Access your secure admin dashboard</li>
                    <li>Set up teacher accounts and student claim codes</li>
                    <li>Schedule a 15-minute onboarding call with our team</li>
                  </ol>
                </div>
                <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                  <p className="font-semibold text-yellow-800 mb-1">⚠️ Important:</p>
                  <p className="text-yellow-700">Please allow students to register only AFTER you receive your approval email and set up claim codes.</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => window.location.href = '/'} data-testid="button-return-home">
                Return to Homepage
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => window.open('mailto:support@echodeed.com?subject=Trial%20Registration%20-%20' + encodeURIComponent(formData?.schoolName || 'School'), '_blank')} data-testid="button-contact-support">
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Start Your 30-Day Pilot Program</h1>
        <p className="text-xl text-gray-600">
          Join forward-thinking schools using EchoDeed to build empathy and community
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Badge variant="secondary" className="px-3 py-1">
            <School className="w-4 h-4 mr-2" />
            K-8 Focus
          </Badge>
          <Badge variant="secondary" className="px-3 py-1">
            <Users className="w-4 h-4 mr-2" />
            500+ Students
          </Badge>
          <Badge variant="secondary" className="px-3 py-1">
            <TrendingUp className="w-4 h-4 mr-2" />
            85% Engagement
          </Badge>
          <Badge variant="secondary" className="px-3 py-1">
            <Shield className="w-4 h-4 mr-2" />
            COPPA Compliant
          </Badge>
        </div>
      </div>

      {/* Benefits */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Anonymous & Safe</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              No personal data collection. Students share kindness acts anonymously, creating a safe space for emotional expression.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">SEL Standards Aligned</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Supports Social-Emotional Learning standards with measurable outcomes and progress tracking for administrators.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Real-Time Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Dashboard with engagement metrics, participation rates, and wellness insights to demonstrate program impact.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trial Form */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Request Your Pilot Program</CardTitle>
          <CardDescription>
            Complete this form to start your free 30-day trial. No payment required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* School Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">School Information</h3>
                
                <FormField
                  control={form.control}
                  name="schoolName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Lincoln Elementary School" {...field} data-testid="input-school-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="districtName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>District Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Riverside Unified School District" {...field} data-testid="input-district-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="studentCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Approximate Student Count *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="300" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-student-count"
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum 50 students required for meaningful pilot data
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Administrator Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Administrator Contact</h3>
                
                <FormField
                  control={form.control}
                  name="adminName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Dr. Sarah Johnson" {...field} data-testid="input-admin-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="adminEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input placeholder="sarah.johnson@school.edu" type="email" {...field} data-testid="input-admin-email" />
                      </FormControl>
                      <FormDescription>
                        We'll send your trial access credentials to this email
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="adminRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-admin-role">
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="principal">Principal</SelectItem>
                          <SelectItem value="vice_principal">Vice Principal</SelectItem>
                          <SelectItem value="district_admin">District Administrator</SelectItem>
                          <SelectItem value="superintendent">Superintendent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" type="tel" {...field} data-testid="input-contact-phone" />
                      </FormControl>
                      <FormDescription>
                        For scheduling demo calls and support
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={trialMutation.isPending}
                data-testid="button-submit-trial"
              >
                {trialMutation.isPending ? "Setting up your trial..." : "Start 30-Day Pilot Program"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 space-y-2">
        <p>Questions? Email us at <a href="mailto:pilots@echodeed.com" className="text-blue-600 hover:underline">pilots@echodeed.com</a></p>
        <p>Your trial includes full access, dedicated support, and detailed analytics reporting.</p>
      </div>
    </div>
  );
}