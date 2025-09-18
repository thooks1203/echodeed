import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Shield, CheckCircle, XCircle, Heart, Users, GraduationCap, AlertTriangle, FileText, Phone, Mail, Clock, Lock, Eye, Trash2, Settings, ChevronRight, ChevronLeft, Info, BookOpen, Database, UserCheck } from "lucide-react";

interface ConsentRequest {
  id: string;
  studentAccountId: string;
  parentName: string;
  verificationCode: string;
  studentFirstName?: string;
  schoolName?: string;
  grade?: string;
}

// COPPA Compliance Form Schema with Digital Signature
const consentFormSchema = z.object({
  // Required acknowledgments
  understandDataCollection: z.boolean().refine(val => val === true, {
    message: "You must acknowledge understanding of data collection practices"
  }),
  consentToEducationalUse: z.boolean().refine(val => val === true, {
    message: "Consent to educational use is required for account activation"
  }),
  consentToProgressTracking: z.boolean().refine(val => val === true, {
    message: "Consent to progress tracking is required"
  }),
  consentToSafetyMonitoring: z.boolean().refine(val => val === true, {
    message: "Consent to safety monitoring is required for student protection"
  }),
  
  // Optional features (can be unchecked)
  allowWellnessReports: z.boolean().optional(),
  allowParentNotifications: z.boolean().optional(),
  allowAnonymousSharing: z.boolean().optional(),
  
  // Rights acknowledgment
  understandRights: z.boolean().refine(val => val === true, {
    message: "You must acknowledge understanding of your rights"
  }),
  
  // Legal agreement
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions"
  }),
  acceptPrivacyPolicy: z.boolean().refine(val => val === true, {
    message: "You must accept the privacy policy"
  }),
  
  // ✍️ DIGITAL SIGNATURE REQUIREMENTS
  signerFullName: z.string().min(2, {
    message: "Please enter your full legal name for digital signature"
  }).max(100, {
    message: "Name must be less than 100 characters"
  }),
  
  // Final consent with digital signature confirmation
  finalConsentConfirmed: z.boolean().refine(val => val === true, {
    message: "You must check this box to provide your digital signature"
  }),
  
  giveConsent: z.boolean().refine(val => val === true, {
    message: "Final consent is required to activate the account"
  })
});

type ConsentFormData = z.infer<typeof consentFormSchema>;

export default function ParentConsent() {
  const [, params] = useRoute("/parent-consent/:verificationCode");
  const verificationCode = params?.verificationCode;
  const { toast } = useToast();
  
  const [consentData, setConsentData] = useState<ConsentRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [consentGiven, setConsentGiven] = useState<boolean | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formStartTime] = useState(new Date());
  
  const form = useForm<ConsentFormData>({
    resolver: zodResolver(consentFormSchema),
    defaultValues: {
      understandDataCollection: false,
      consentToEducationalUse: false,
      consentToProgressTracking: false,
      consentToSafetyMonitoring: false,
      allowWellnessReports: true,
      allowParentNotifications: true,
      allowAnonymousSharing: true,
      understandRights: false,
      acceptTerms: false,
      acceptPrivacyPolicy: false,
      signerFullName: "",
      finalConsentConfirmed: false,
      giveConsent: false
    }
  });
  
  const totalSteps = 5;
  const progressPercentage = (currentStep / totalSteps) * 100;

  // Fetch consent request details
  useEffect(() => {
    if (!verificationCode) {
      setError("Invalid consent link - verification code missing");
      setLoading(false);
      return;
    }

    const fetchConsentData = async () => {
      try {
        const response = await apiRequest("GET", `/api/students/consent/${verificationCode}`);
        const result = await response.json();
        
        if (result.success) {
          setConsentData(result.consentRequest);
        } else {
          setError(result.error || "Invalid consent request");
        }
      } catch (error: any) {
        setError(error.message || "Failed to load consent request");
      } finally {
        setLoading(false);
      }
    };

    fetchConsentData();
  }, [verificationCode]);

  const submitConsent = useMutation({
    mutationFn: async (data: { approved: boolean; formData?: ConsentFormData }) => {
      const submissionData = {
        approved: data.approved,
        parentName: consentData?.parentName,
        // ✍️ DIGITAL SIGNATURE: Include signature data for legal verification
        signerFullName: data.approved ? data.formData?.signerFullName : undefined,
        finalConsentConfirmed: data.approved ? data.formData?.finalConsentConfirmed : undefined,
        consentDetails: data.approved ? {
          formData: data.formData,
          consentVersion: "2.1", // Burlington NC District COPPA v2.1
          submissionTimestamp: new Date().toISOString(),
          formCompletionTime: new Date().getTime() - formStartTime.getTime(),
          ipAddress: undefined, // Backend will capture this
          userAgent: navigator.userAgent
        } : null
      };
      
      // ✍️ DIGITAL SIGNATURE: Use the enhanced consent approval endpoint with signature capability
      const response = await apiRequest("POST", `/api/parental-consent/approve/${verificationCode}`, submissionData);
      return await response.json();
    },
    onSuccess: (result, data) => {
      setConsentGiven(data.approved);
      toast({
        title: data.approved ? "✅ Consent Approved!" : "❌ Consent Denied",
        description: result.message,
        duration: 5000
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process consent",
        variant: "destructive"
      });
    }
  });
  
  const handleApproveConsent = async (formData: ConsentFormData) => {
    await submitConsent.mutateAsync({ approved: true, formData });
  };
  
  const handleDenyConsent = async () => {
    await submitConsent.mutateAsync({ approved: false });
  };
  
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
            <span className="ml-3 text-lg">Loading consent request...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-700 dark:text-red-300">
              Invalid Consent Link
            </CardTitle>
            <CardDescription className="text-lg">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-200">
                This link may have expired (72-hour limit) or is invalid. Please contact your child's school for assistance.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (consentGiven !== null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              {consentGiven ? (
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="w-8 h-8 text-gray-600 dark:text-gray-400" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              {consentGiven ? "Consent Approved!" : "Consent Denied"}
            </CardTitle>
            <CardDescription className="text-lg">
              {consentGiven 
                ? "Your child's EchoDeed account is now active!"
                : "Your child's account will remain inactive."
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {consentGiven ? (
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-200">
                  <strong>Next steps:</strong> Your child can now log in to EchoDeed at school and start sharing acts of kindness! 
                  You'll receive weekly progress updates via email.
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  Your child's account will remain inactive. If you change your mind, they can register again 
                  and you'll receive a new consent email.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 p-4">
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Parental Consent Required
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300">
            {consentData?.studentFirstName ? `${consentData.studentFirstName} wants to join EchoDeed` : 'Your child wants to join EchoDeed'}
          </p>
        </div>

        {/* Progress Indicator */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                {Math.round(progressPercentage)}% Complete
              </span>
            </div>
            <Progress value={progressPercentage} className="w-full" data-testid="progress-consent-form" />
            <div className="hidden sm:flex justify-between mt-2 text-xs text-gray-500">
              <span>Introduction</span>
              <span>Data Collection</span>
              <span>Permissions</span>
              <span>Rights & Legal</span>
              <span>Final Consent</span>
            </div>
          </CardContent>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleApproveConsent)} className="space-y-6">
            
            {/* Step 1: Introduction & Overview */}
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Welcome Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Heart className="w-6 h-6 text-red-500" />
                      Hello {consentData?.parentName}!
                    </CardTitle>
                    <CardDescription className="text-lg">
                      Your child has requested to create an account on EchoDeed through {consentData?.schoolName || 'their school'}.
                    </CardDescription>
                  </CardHeader>
                </Card>

                {/* What is EchoDeed */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="w-6 h-6 text-blue-500" />
                      What is EchoDeed?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700 dark:text-gray-300">
                      EchoDeed is a COPPA-compliant educational platform that helps K-8 students develop social-emotional learning (SEL) skills 
                      through guided kindness activities and character development exercises.
                    </p>
                    
                    <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
                      {[
                        { icon: '🔒', title: 'Privacy First', desc: 'Full anonymity with no personal data sharing' },
                        { icon: '📚', title: 'Educational Focus', desc: 'Aligned with SEL and character education standards' },
                        { icon: '👩‍🏫', title: 'Teacher Supervised', desc: 'All content reviewed by licensed educators' },
                        { icon: '✅', title: 'COPPA Compliant', desc: 'Exceeds federal privacy requirements for children' }
                      ].map((feature, index) => (
                        <div key={index} className="bg-blue-50 dark:bg-blue-950 p-3 sm:p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="flex items-start gap-2 sm:gap-3">
                            <span className="text-xl sm:text-2xl">{feature.icon}</span>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold text-blue-800 dark:text-blue-200 text-sm sm:text-base">{feature.title}</h4>
                              <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">{feature.desc}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Burlington NC District Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-6 h-6 text-green-500" />
                      Burlington, NC School District Partnership
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-green-800 dark:text-green-200">
                        EchoDeed has been carefully evaluated and approved by Burlington schools administration for use in character education programs. 
                        This consent process meets all federal COPPA requirements and NC state privacy standards for educational technology.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button onClick={nextStep} size="lg" className="w-full sm:w-auto" data-testid="button-next-step-1">
                    Begin Consent Process
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Data Collection Practices */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-6 h-6 text-blue-500" />
                      Data Collection & Usage Practices
                    </CardTitle>
                    <CardDescription>
                      Detailed explanation of what information we collect and how it's used (COPPA Requirement)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    
                    {/* Data Collection Breakdown */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Information We Collect:
                      </h3>
                      
                      <div className="grid gap-4">
                        {[
                          {
                            category: "Student Account Information",
                            icon: "👤",
                            items: ["First name only", "Grade level (6th, 7th, or 8th)", "School assignment"],
                            purpose: "Account identification and age-appropriate content delivery",
                            retention: "Until account deletion or graduation"
                          },
                          {
                            category: "Educational Activity Data",
                            icon: "📚",
                            items: ["Anonymous kindness posts", "Participation in challenges", "Educational progress metrics"],
                            purpose: "Social-emotional learning assessment and curriculum improvement",
                            retention: "Academic year + 1 year for progress analysis"
                          },
                          {
                            category: "Safety & Wellness Monitoring",
                            icon: "🛡️",
                            items: ["Content flagged for review", "Crisis intervention triggers", "Anonymous wellness check-ins"],
                            purpose: "Student safety, bullying prevention, and mental health support",
                            retention: "Immediately processed then deleted, except for mandatory reporting cases"
                          },
                          {
                            category: "Technical Information",
                            icon: "⚙️",
                            items: ["Login timestamps", "Device type (for optimization)", "Anonymous usage analytics"],
                            purpose: "Platform security, performance optimization, and compliance auditing",
                            retention: "90 days for security logs, anonymized analytics retained for improvements"
                          }
                        ].map((dataType, index) => (
                          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex items-start gap-3 mb-3">
                              <span className="text-2xl">{dataType.icon}</span>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white">{dataType.category}</h4>
                                <ul className="text-sm text-gray-600 dark:text-gray-400 mt-1 list-disc list-inside">
                                  {dataType.items.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm">
                              <p><strong>Purpose:</strong> {dataType.purpose}</p>
                              <p className="mt-1"><strong>Retention:</strong> {dataType.retention}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Data Sharing Policy */}
                    <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg border border-red-200 dark:border-red-800">
                      <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2 flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Data Sharing Policy - Important!
                      </h4>
                      <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                        <li>• <strong>We NEVER sell or share personal information with third parties</strong></li>
                        <li>• Student data stays within the school district and authorized educational personnel</li>
                        <li>• Anonymous, aggregated data may be used for educational research (no individual identification)</li>
                        <li>• Crisis situations may require sharing with school counselors or administrators for student safety</li>
                        <li>• Law enforcement sharing only occurs for mandatory reporting situations</li>
                      </ul>
                    </div>

                    {/* Understanding Acknowledgment */}
                    <FormField
                      control={form.control}
                      name="understandDataCollection"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-understand-data-collection"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-medium">
                              I understand and acknowledge the data collection practices described above
                            </FormLabel>
                            <FormDescription>
                              Required: You must acknowledge understanding of how your child's information will be collected and used.
                            </FormDescription>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
                  <Button onClick={prevStep} variant="outline" size="lg" className="w-full sm:w-auto" data-testid="button-prev-step-2">
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <Button 
                    onClick={nextStep} 
                    disabled={!form.watch('understandDataCollection')}
                    size="lg" 
                    className="w-full sm:w-auto"
                    data-testid="button-next-step-2"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Explicit Permissions */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCheck className="w-6 h-6 text-green-500" />
                      Explicit Permission for Data Use
                    </CardTitle>
                    <CardDescription>
                      Please grant or deny permission for each specific use of your child's information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    
                    {/* Required Permissions */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        Required for Account Activation
                      </h3>
                      
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="consentToEducationalUse"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950 p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="checkbox-consent-educational-use"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-medium">
                                  I consent to my child's participation in educational activities and SEL curriculum
                                </FormLabel>
                                <FormDescription>
                                  This includes sharing anonymous kindness posts and participating in character development exercises.
                                </FormDescription>
                                <FormMessage />
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="consentToProgressTracking"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950 p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="checkbox-consent-progress-tracking"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-medium">
                                  I consent to progress tracking for educational assessment and improvement
                                </FormLabel>
                                <FormDescription>
                                  Anonymous metrics help teachers understand student engagement and curriculum effectiveness.
                                </FormDescription>
                                <FormMessage />
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="consentToSafetyMonitoring"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950 p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="checkbox-consent-safety-monitoring"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-medium">
                                  I consent to safety monitoring and crisis intervention protocols
                                </FormLabel>
                                <FormDescription>
                                  AI-powered content analysis helps identify bullying, self-harm, or other safety concerns for immediate intervention.
                                </FormDescription>
                                <FormMessage />
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Optional Features */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-blue-500" />
                        Optional Features (You can opt out)
                      </h3>
                      
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="allowWellnessReports"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="checkbox-allow-wellness-reports"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-medium">
                                  Allow weekly wellness and kindness reports to be generated
                                </FormLabel>
                                <FormDescription>
                                  You'll receive anonymous summaries of your child's positive engagement and social-emotional growth.
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="allowParentNotifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="checkbox-allow-parent-notifications"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-medium">
                                  Allow notifications about significant positive achievements or milestones
                                </FormLabel>
                                <FormDescription>
                                  Receive alerts when your child reaches kindness milestones or demonstrates exceptional character growth.
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="allowAnonymousSharing"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="checkbox-allow-anonymous-sharing"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-medium">
                                  Allow anonymous kindness posts to inspire other students across the district
                                </FormLabel>
                                <FormDescription>
                                  Your child's anonymous posts may be shared (with no identifying information) to inspire kindness in other schools.
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
                  <Button onClick={prevStep} variant="outline" size="lg" className="w-full sm:w-auto" data-testid="button-prev-step-3">
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <Button 
                    onClick={nextStep} 
                    disabled={!form.watch('consentToEducationalUse') || !form.watch('consentToProgressTracking') || !form.watch('consentToSafetyMonitoring')}
                    size="lg" 
                    className="w-full sm:w-auto"
                    data-testid="button-next-step-3"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Rights & Legal Disclosures */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-6 h-6 text-purple-500" />
                      Your Rights & Legal Disclosures
                    </CardTitle>
                    <CardDescription>
                      Important legal information and your rights regarding your child's data
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    
                    {/* Parent Rights */}
                    <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        Your Rights as a Parent/Guardian
                      </h3>
                      <div className="grid gap-4">
                        <div className="flex items-start gap-3">
                          <Eye className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-blue-900 dark:text-blue-100">Right to Review</h4>
                            <p className="text-sm text-blue-800 dark:text-blue-200">You can request to review any personal information we have collected about your child</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Trash2 className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-blue-900 dark:text-blue-100">Right to Delete</h4>
                            <p className="text-sm text-blue-800 dark:text-blue-200">You can request deletion of your child's account and all associated data at any time</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <XCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-blue-900 dark:text-blue-100">Right to Revoke Consent</h4>
                            <p className="text-sm text-blue-800 dark:text-blue-200">You can withdraw consent at any time, which will immediately deactivate the account</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Settings className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-blue-900 dark:text-blue-100">Right to Modify Permissions</h4>
                            <p className="text-sm text-blue-800 dark:text-blue-200">You can change optional feature permissions without affecting core educational functionality</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-green-50 dark:bg-green-950 p-6 rounded-lg border border-green-200 dark:border-green-800">
                      <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4 flex items-center gap-2">
                        <Phone className="w-5 h-5" />
                        Data Protection Contact Information
                      </h3>
                      <div className="space-y-3 text-sm text-green-800 dark:text-green-200">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span><strong>Privacy Officer:</strong> privacy@burlingtonschools.org</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span><strong>School District:</strong> (336) 570-6060</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span><strong>Response Time:</strong> We respond to data requests within 48 hours</span>
                        </div>
                        <p className="mt-3">
                          <strong>For immediate concerns about your child's data or privacy:</strong> Contact your school's principal 
                          or the district privacy officer using the information above.
                        </p>
                      </div>
                    </div>

                    {/* Legal Disclosures */}
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="coppa">
                        <AccordionTrigger className="text-left">
                          COPPA Compliance Statement
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                          <p>
                            This application complies with the Children's Online Privacy Protection Act (COPPA) of 1998. 
                            We do not collect personal information from children under 13 except as necessary for educational purposes 
                            and with verifiable parental consent.
                          </p>
                          <p>
                            All data collection is limited to what is necessary for the educational service and is used solely 
                            for educational purposes within the school environment.
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="ferpa">
                        <AccordionTrigger className="text-left">
                          FERPA Educational Records Protection
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                          <p>
                            Student information is protected under the Family Educational Rights and Privacy Act (FERPA). 
                            Educational records are maintained securely and shared only with authorized school personnel 
                            who have legitimate educational interest.
                          </p>
                          <p>
                            Parents have the right to review educational records and request corrections to inaccurate information.
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="nc-privacy">
                        <AccordionTrigger className="text-left">
                          North Carolina Student Privacy Standards
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                          <p>
                            Burlington School District follows NC state guidelines for educational technology privacy. 
                            All vendor agreements include data protection clauses that exceed state minimum requirements.
                          </p>
                          <p>
                            Student data is hosted in secure, COPPA-compliant data centers within the United States 
                            and is never transferred internationally.
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="data-security">
                        <AccordionTrigger className="text-left">
                          Data Security Measures
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                          <p>
                            • End-to-end encryption for all data transmission<br/>
                            • Multi-factor authentication for all administrator accounts<br/>
                            • Regular security audits and penetration testing<br/>
                            • Automated backup and disaster recovery systems<br/>
                            • SOC 2 Type II compliance certification
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    {/* Rights Acknowledgment */}
                    <FormField
                      control={form.control}
                      name="understandRights"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-understand-rights"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-medium">
                              I understand my rights regarding my child's data and how to exercise them
                            </FormLabel>
                            <FormDescription>
                              Required: You must acknowledge understanding of your rights before proceeding.
                            </FormDescription>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="acceptTerms"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="checkbox-accept-terms"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-medium">
                                I accept the Terms of Service for educational use
                              </FormLabel>
                              <FormDescription>
                                <a href="#" className="text-blue-600 hover:underline">View full Terms of Service</a>
                              </FormDescription>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="acceptPrivacyPolicy"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="checkbox-accept-privacy-policy"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-medium">
                                I accept the Privacy Policy for student data protection
                              </FormLabel>
                              <FormDescription>
                                <a href="#" className="text-blue-600 hover:underline">View full Privacy Policy</a>
                              </FormDescription>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
                  <Button onClick={prevStep} variant="outline" size="lg" className="w-full sm:w-auto" data-testid="button-prev-step-4">
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <Button 
                    onClick={nextStep} 
                    disabled={!form.watch('understandRights') || !form.watch('acceptTerms') || !form.watch('acceptPrivacyPolicy')}
                    size="lg" 
                    className="w-full sm:w-auto"
                    data-testid="button-next-step-4"
                  >
                    Review Final Consent
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 5: Final Consent */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                      Final Consent Decision
                    </CardTitle>
                    <CardDescription>
                      Review your choices and provide final consent for your child's EchoDeed account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    
                    {/* Consent Summary */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Consent Summary for {consentData?.studentFirstName || 'your child'}
                      </h3>
                      
                      <div className="grid gap-4 text-sm">
                        <div className="flex justify-between">
                          <span>Educational activities:</span>
                          <span className={form.watch('consentToEducationalUse') ? 'text-green-600 font-medium' : 'text-red-600'}>
                            {form.watch('consentToEducationalUse') ? '✓ Approved' : '✗ Not approved'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Progress tracking:</span>
                          <span className={form.watch('consentToProgressTracking') ? 'text-green-600 font-medium' : 'text-red-600'}>
                            {form.watch('consentToProgressTracking') ? '✓ Approved' : '✗ Not approved'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Safety monitoring:</span>
                          <span className={form.watch('consentToSafetyMonitoring') ? 'text-green-600 font-medium' : 'text-red-600'}>
                            {form.watch('consentToSafetyMonitoring') ? '✓ Approved' : '✗ Not approved'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Wellness reports:</span>
                          <span className={form.watch('allowWellnessReports') ? 'text-blue-600' : 'text-gray-600'}>
                            {form.watch('allowWellnessReports') ? '✓ Enabled' : '✗ Disabled'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Parent notifications:</span>
                          <span className={form.watch('allowParentNotifications') ? 'text-blue-600' : 'text-gray-600'}>
                            {form.watch('allowParentNotifications') ? '✓ Enabled' : '✗ Disabled'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Anonymous sharing:</span>
                          <span className={form.watch('allowAnonymousSharing') ? 'text-blue-600' : 'text-gray-600'}>
                            {form.watch('allowAnonymousSharing') ? '✓ Enabled' : '✗ Disabled'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Consent Versioning */}
                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800 dark:text-blue-200">
                          <p><strong>Consent Version:</strong> Burlington NC District COPPA v2.1</p>
                          <p><strong>Effective Date:</strong> {new Date().toLocaleDateString()}</p>
                          <p><strong>Consent ID:</strong> {verificationCode}</p>
                          <p className="mt-2">
                            This consent will be stored securely and can be updated by contacting your school's privacy officer.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Final Consent Checkbox */}
                    <FormField
                      control={form.control}
                      name="giveConsent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border-2 border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950 p-6">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-give-final-consent"
                              className="mt-1"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-base font-semibold text-green-800 dark:text-green-200">
                              I hereby give my informed consent for my child to participate in EchoDeed
                            </FormLabel>
                            <FormDescription className="text-green-700 dark:text-green-300">
                              By checking this box, I confirm that I have read, understood, and agree to all the terms outlined in this consent process. 
                              I understand that I can revoke this consent at any time by contacting the school or privacy officer.
                            </FormDescription>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
                  <Button onClick={prevStep} variant="outline" size="lg" className="w-full sm:w-auto order-2 sm:order-1" data-testid="button-prev-step-5">
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 order-1 sm:order-2">
                    <Button 
                      onClick={handleDenyConsent}
                      disabled={submitConsent.isPending}
                      variant="outline"
                      size="lg" 
                      className="w-full sm:w-auto"
                      data-testid="button-deny-final-consent"
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      <span className="hidden sm:inline">Deny Account Creation</span>
                      <span className="sm:hidden">Deny</span>
                    </Button>
                    <Button 
                      type="submit"
                      disabled={!form.watch('giveConsent') || submitConsent.isPending}
                      size="lg" 
                      className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                      data-testid="button-approve-final-consent"
                    >
                      {submitConsent.isPending ? (
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      ) : (
                        <CheckCircle className="w-5 h-5 mr-2" />
                      )}
                      <span className="hidden sm:inline">Approve & Activate Account</span>
                      <span className="sm:hidden">Approve & Activate</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </Form>

        {/* Enhanced Footer */}
        <div className="mt-8 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 space-y-2 px-4">
          <p><strong>Questions or concerns?</strong> Contact your child's school or the district privacy officer</p>
          <p className="break-words">Burlington School District • Privacy Officer: privacy@burlingtonschools.org • (336) 570-6060</p>
          <p className="mt-3">EchoDeed™ - Building Character Through Kindness</p>
          <p>FERPA & COPPA Compliant • Anonymous & Safe • Educational Technology</p>
          <p className="text-xs mt-2 break-words">
            Consent Version: Burlington NC v2.1 • Form ID: {verificationCode?.slice(-8)} • Generated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}