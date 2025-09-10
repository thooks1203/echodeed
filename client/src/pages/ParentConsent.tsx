import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Shield, CheckCircle, XCircle, Heart, Users, GraduationCap, AlertTriangle } from "lucide-react";

interface ConsentRequest {
  id: string;
  studentAccountId: string;
  parentName: string;
  verificationCode: string;
}

export default function ParentConsent() {
  const [, params] = useRoute("/parent-consent/:verificationCode");
  const verificationCode = params?.verificationCode;
  const { toast } = useToast();
  
  const [consentData, setConsentData] = useState<ConsentRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [consentGiven, setConsentGiven] = useState<boolean | null>(null);

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
    mutationFn: async (approved: boolean) => {
      const response = await apiRequest("POST", `/api/students/consent/${verificationCode}/approve`, {
        approved,
        parentName: consentData?.parentName
      });
      return await response.json();
    },
    onSuccess: (result, approved) => {
      setConsentGiven(approved);
      toast({
        title: approved ? "✅ Consent Approved!" : "❌ Consent Denied",
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
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Parental Consent Required
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Your child wants to join EchoDeed
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Welcome Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Heart className="w-6 h-6 text-red-500" />
                Hello {consentData?.parentName}!
              </CardTitle>
              <CardDescription className="text-lg">
                Your child has requested to create an account on EchoDeed through their school.
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
                EchoDeed is a COPPA-compliant platform that helps K-8 students learn empathy and character 
                development by sharing anonymous acts of kindness.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { icon: '🔒', title: 'Anonymous & Safe', desc: 'No personal information is shared publicly' },
                  { icon: '📚', title: 'Educational Focus', desc: 'Aligned with Social-Emotional Learning (SEL) standards' },
                  { icon: '👩‍🏫', title: 'Teacher Supervised', desc: 'All content is moderated for safety' },
                  { icon: '✅', title: 'COPPA Compliant', desc: 'Meets all privacy requirements for children under 13' }
                ].map((feature, index) => (
                  <div key={index} className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{feature.icon}</span>
                      <div>
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200">{feature.title}</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">{feature.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Safety & Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-green-500" />
                Your Child's Safety & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <ul className="space-y-2 text-green-800 dark:text-green-200">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 mt-0.5 text-green-600" />
                    <span>No personal information collected beyond first name and grade</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 mt-0.5 text-green-600" />
                    <span>All posts are anonymous and cannot be traced back to your child</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 mt-0.5 text-green-600" />
                    <span>Content is automatically filtered and teacher-moderated</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 mt-0.5 text-green-600" />
                    <span>You can revoke consent and delete the account at any time</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Consent Decision */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
                Your Decision
              </CardTitle>
              <CardDescription>
                Please choose whether to approve or deny your child's EchoDeed account:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => submitConsent.mutate(true)}
                  disabled={submitConsent.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                  data-testid="button-approve-consent"
                >
                  {submitConsent.isPending ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  ) : (
                    <CheckCircle className="w-5 h-5 mr-2" />
                  )}
                  Approve & Activate Account
                </Button>
                
                <Button
                  onClick={() => submitConsent.mutate(false)}
                  disabled={submitConsent.isPending}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                  data-testid="button-deny-consent"
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  Deny Account Creation
                </Button>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>⏰ Important:</strong> This consent link expires in 72 hours. 
                  If no action is taken, your child will need to register again.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Questions? Contact your child's school for assistance.</p>
          <p className="mt-2">EchoDeed™ - Building Character Through Kindness</p>
          <p>FERPA & COPPA Compliant • Anonymous & Safe</p>
        </div>
      </div>
    </div>
  );
}