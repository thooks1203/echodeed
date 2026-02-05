import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Shield, Heart, Users, CheckCircle, AlertCircle, Sparkles } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useSchoolRole } from "@/lib/roleUtils";
import { BackButton } from "@/components/BackButton";
import { SchoolSearchSelect } from "@/components/SchoolSearchSelect";

const createStudentSignupSchema = (requiresCode: boolean) => z.object({
  firstName: z.string().min(1, "First name is required").max(50, "Name too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Name too long"),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  phoneNumber: z.string().regex(/^(\+1)?[0-9]{10}$/, "Please enter a valid 10-digit phone number").optional().or(z.literal("")),
  grade: z.string().min(1, "Please select your grade"),
  birthYear: z.coerce.number()
    .min(2006, "Please enter a valid birth year (ages 14-18)") 
    .max(2011, "Please enter a valid birth year (ages 14-18)"),
  schoolId: z.string().min(1, "Please select your school"),
  enrollmentCode: requiresCode 
    ? z.string().min(1, "School enrollment code is required").max(50, "Code too long")
    : z.string().max(50, "Code too long").optional(),
  parentEmail: z.string().email("Please enter a valid parent email"),
  parentName: z.string().min(1, "Parent name is required").max(100, "Name too long")
});

type StudentSignupForm = z.infer<ReturnType<typeof createStudentSignupSchema>>;

const gradeOptions = [
  { value: "9", label: "9th Grade (Freshman)" },
  { value: "10", label: "10th Grade (Sophomore)" },
  { value: "11", label: "11th Grade (Junior)" },
  { value: "12", label: "12th Grade (Senior)" }
];

export default function StudentSignup() {
  const [, setLocation] = useLocation();
  const { canAccessSchoolsDashboard } = useSchoolRole();
  const { toast } = useToast();
  const [registrationResult, setRegistrationResult] = useState<any>(null);
  const [selectedSchoolName, setSelectedSchoolName] = useState("");
  const [requiresEnrollmentCode, setRequiresEnrollmentCode] = useState(true);

  const form = useForm<StudentSignupForm>({
    resolver: zodResolver(createStudentSignupSchema(requiresEnrollmentCode)),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      grade: "",
      birthYear: new Date().getFullYear() - 16,
      schoolId: "",
      enrollmentCode: "",
      parentEmail: "",
      parentName: ""
    }
  });

  const registerStudent = useMutation({
    mutationFn: async (data: StudentSignupForm) => {
      const response = await apiRequest("POST", "/api/students/register", data);
      return await response.json();
    },
    onSuccess: (result: any) => {
      console.log("Registration successful:", result);
      setRegistrationResult(result);
      
      if (result.requiresParentalConsent) {
        toast({
          title: "🎉 Almost Done!",
          description: "Please ask your parent to check their email and approve your account!",
          duration: 8000
        });
      } else {
        toast({
          title: "🎉 Welcome to EchoDeed!",
          description: "Your account is ready! Start sharing kindness today.",
          duration: 5000
        });
        setTimeout(() => setLocation("/?show=roles"), 2000);
      }
    },
    onError: (error: any) => {
      console.error("Registration failed:", error);
      toast({
        title: "Registration Failed",
        description: error.message || "Please check your information and try again.",
        variant: "destructive"
      });
    }
  });

  const handleSchoolSelect = (schoolId: string, schoolName: string, requiresCode: boolean) => {
    form.setValue("schoolId", schoolId);
    setSelectedSchoolName(schoolName);
    setRequiresEnrollmentCode(requiresCode);
    
    if (!requiresCode) {
      form.setValue("enrollmentCode", "");
      form.clearErrors("enrollmentCode");
    }
  };

  const onSubmit = (data: StudentSignupForm) => {
    registerStudent.mutate(data);
  };

  if (registrationResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              {registrationResult.requiresParentalConsent ? (
                <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
              ) : (
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-green-700 dark:text-green-300">
              {registrationResult.requiresParentalConsent ? "Almost There!" : "Welcome to EchoDeed!"}
            </CardTitle>
            <CardDescription className="text-lg">
              {registrationResult.message}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {registrationResult.requiresParentalConsent ? (
              <div className="space-y-3">
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <p className="font-medium">What happens next?</p>
                      <ul className="mt-2 space-y-1 list-disc list-inside">
                        <li>Your parent will receive an email</li>
                        <li>They need to click the link and approve</li>
                        <li>Once approved, you can start using EchoDeed!</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={() => {
                    if (canAccessSchoolsDashboard) {
                      setLocation("/app?tab=schools");
                    } else {
                      setLocation("/app?tab=student-dashboard"); 
                    }
                  }} 
                  className="w-full"
                  data-testid="button-go-dashboard"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    🎉 Your account is active! You can now share acts of kindness and earn rewards!
                  </p>
                </div>
                
                <Button 
                  onClick={() => setLocation("/")} 
                  className="w-full"
                  data-testid="button-start-exploring"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Start Exploring EchoDeed!
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link 
            href={canAccessSchoolsDashboard ? "/app?tab=schools" : "/app?tab=student-dashboard"} 
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 mb-4 font-semibold"
            data-testid="link-back-dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Join EchoDeed!
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Start your kindness journey today 🌟
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border text-center">
            <Shield className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Safe & Secure</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">COPPA compliant with parent approval</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border text-center">
            <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Anonymous</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Share kindness without revealing identity</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border text-center">
            <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Fun Rewards</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Earn tokens and awesome prizes!</p>
          </div>
        </div>

        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl">Create Your Account</CardTitle>
            <CardDescription>
              Fill out the form below to join your school's kindness community!
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="form-student-signup">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your first name" 
                            {...field} 
                            data-testid="input-first-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your last name" 
                            {...field} 
                            data-testid="input-last-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Email <span className="text-sm text-gray-500">(optional)</span></FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="your.email@school.edu" 
                            {...field} 
                            data-testid="input-student-email"
                          />
                        </FormControl>
                        <p className="text-xs text-gray-500">For notifications and password reset</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number <span className="text-sm text-gray-500">(optional)</span></FormLabel>
                        <FormControl>
                          <Input 
                            type="tel"
                            placeholder="1234567890" 
                            {...field}
                            onChange={(e) => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            data-testid="input-phone-number"
                          />
                        </FormControl>
                        <p className="text-xs text-gray-500">For daily mood check-in reminders via SMS</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-grade">
                            <SelectValue placeholder="Select your grade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {gradeOptions.map((grade) => (
                            <SelectItem key={grade.value} value={grade.value}>
                              {grade.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="birthYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Birth Year * <span className="text-sm text-gray-500">(for age verification)</span></FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 2014" 
                          {...field} 
                          data-testid="input-birth-year"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="schoolId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School *</FormLabel>
                      <FormControl>
                        <SchoolSearchSelect
                          value={field.value}
                          onValueChange={handleSchoolSelect}
                          placeholder="Type to search for your school (e.g., Burlington)"
                        />
                      </FormControl>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Start typing your school name to find it
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {requiresEnrollmentCode ? (
                  <FormField
                    control={form.control}
                    name="enrollmentCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>School Enrollment Code *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter code from your teacher" 
                            {...field}
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            data-testid="input-enrollment-code"
                            className="uppercase"
                          />
                        </FormControl>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Your teacher or principal will give you this code
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <div className="bg-emerald-50 dark:bg-emerald-950 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-start space-x-3">
                      <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                      <div className="text-sm text-emerald-800 dark:text-emerald-200">
                        <p className="font-medium">Open Enrollment School</p>
                        <p className="mt-1">
                          {selectedSchoolName} allows direct signup! No enrollment code needed.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Parent/Guardian Information
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    We need a parent or guardian's email to approve your account for safety.
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="parentName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parent/Guardian Name *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Mom, Dad, Guardian" 
                              {...field} 
                              data-testid="input-parent-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="parentEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parent/Guardian Email *</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="parent@example.com" 
                              {...field} 
                              data-testid="input-parent-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <p className="font-medium">How account approval works:</p>
                      <ul className="mt-2 space-y-1 list-disc list-inside">
                        <li>If you're under 13, your parent will get an email to approve your account</li>
                        <li>If you're 13 or older, your account activates immediately</li>
                        <li>All accounts are safe, anonymous, and COPPA compliant</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={registerStudent.isPending}
                  data-testid="button-create-account"
                >
                  {registerStudent.isPending ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4 mr-2" />
                      Create My Account
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
