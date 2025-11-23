import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { School, GraduationCap, Users, MapPin, Mail, Phone } from "lucide-react";
import { BackButton } from "@/components/BackButton";

const schoolRegistrationSchema = z.object({
  schoolName: z.string().min(1, "School name is required"),
  principalName: z.string().min(1, "Principal name is required"),
  principalEmail: z.string().email("Valid email required"),
  principalPhone: z.string().min(10, "Phone number required"),
  schoolAddress: z.string().min(1, "School address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  studentCount: z.number().min(1, "Student count is required"),
  gradeRange: z.string().min(1, "Grade range is required"),
  schoolType: z.string().min(1, "School type is required"),
  schoolLevel: z.enum(["middle_school", "high_school"]).default("high_school"),
  goals: z.string().optional(),
});

type SchoolRegistrationForm = z.infer<typeof schoolRegistrationSchema>;

interface SchoolRegistrationProps {
  onSuccess?: (schoolId: string) => void;
}

export function SchoolRegistration({ onSuccess }: SchoolRegistrationProps) {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const form = useForm<SchoolRegistrationForm>({
    resolver: zodResolver(schoolRegistrationSchema),
    defaultValues: {
      schoolName: "",
      principalName: "",
      principalEmail: "",
      principalPhone: "",
      schoolAddress: "",
      city: "",
      state: "",
      studentCount: 0,
      gradeRange: "",
      schoolType: "",
      schoolLevel: "high_school",
      goals: "",
    },
  });

  const registerSchoolMutation = useMutation({
    mutationFn: async (data: SchoolRegistrationForm) => {
      const response = await fetch("/api/schools/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to register school");
      }
      
      return await response.json();
    },
    onSuccess: (result) => {
      toast({
        title: "School Registered Successfully!",
        description: "Welcome to EchoDeed! Your school pilot is now active.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/schools"] });
      onSuccess?.(result.schoolId);
      
      // Redirect to the main app after successful registration
      setTimeout(() => {
        navigate('/app');
      }, 2000); // Give time for the user to see the success message
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again or contact support.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SchoolRegistrationForm) => {
    registerSchoolMutation.mutate(data);
  };

  const nextStep = () => {
    if (step === 1) {
      // Validate basic info
      const basicFields = ['schoolName', 'principalName', 'principalEmail'];
      const isValid = basicFields.every(field => 
        form.formState.isValid || !form.formState.errors[field as keyof SchoolRegistrationForm]
      );
      
      if (isValid) {
        setStep(2);
      } else {
        // Trigger validation
        form.trigger(basicFields as (keyof SchoolRegistrationForm)[]);
      }
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="text-center space-y-4 relative">
          {/* Back Button */}
          <div className="absolute left-4 top-4">
            <BackButton 
              onClick={() => navigate('/app')}
              label="Dashboard"
              variant="minimal"
              style={{
                color: '#6B7280',
                fontSize: '12px',
                padding: '4px 8px',
                borderRadius: '6px'
              }}
            />
          </div>
          <div className="flex justify-center">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full">
              <School className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Join EchoDeed™ Pilot Program
          </CardTitle>
          <CardDescription className="text-lg">
            Register your school for the revolutionary dual reward kindness platform
          </CardDescription>
          
          {/* Progress Indicator */}
          <div className="flex justify-center space-x-2 mt-6">
            <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-purple-500' : 'bg-gray-300'}`} />
            <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-purple-500' : 'bg-gray-300'}`} />
          </div>
          <p className="text-sm text-gray-600">
            Step {step} of 2
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">School Information</h3>
                  <p className="text-gray-600">Tell us about your school</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="schoolName" className="flex items-center gap-2">
                      <School className="w-4 h-4" />
                      School Name
                    </Label>
                    <Input
                      id="schoolName"
                      {...form.register("schoolName")}
                      placeholder="Lincoln Elementary School"
                      data-testid="input-school-name"
                    />
                    {form.formState.errors.schoolName && (
                      <p className="text-sm text-red-500 mt-1">{form.formState.errors.schoolName.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="principalName" className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      Principal Name
                    </Label>
                    <Input
                      id="principalName"
                      {...form.register("principalName")}
                      placeholder="Dr. Sarah Johnson"
                      data-testid="input-principal-name"
                    />
                    {form.formState.errors.principalName && (
                      <p className="text-sm text-red-500 mt-1">{form.formState.errors.principalName.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="principalEmail" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Principal Email
                    </Label>
                    <Input
                      id="principalEmail"
                      type="email"
                      {...form.register("principalEmail")}
                      placeholder="principal@school.edu"
                      data-testid="input-principal-email"
                    />
                    {form.formState.errors.principalEmail && (
                      <p className="text-sm text-red-500 mt-1">{form.formState.errors.principalEmail.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="principalPhone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Principal Phone
                    </Label>
                    <Input
                      id="principalPhone"
                      {...form.register("principalPhone")}
                      placeholder="(555) 123-4567"
                      data-testid="input-principal-phone"
                    />
                    {form.formState.errors.principalPhone && (
                      <p className="text-sm text-red-500 mt-1">{form.formState.errors.principalPhone.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="schoolType">School Type</Label>
                    <Select onValueChange={(value) => form.setValue("schoolType", value)}>
                      <SelectTrigger data-testid="select-school-type">
                        <SelectValue placeholder="Select school type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="elementary">Elementary School</SelectItem>
                        <SelectItem value="middle">Middle School</SelectItem>
                        <SelectItem value="high">High School</SelectItem>
                        <SelectItem value="k12">K-12 School</SelectItem>
                        <SelectItem value="private">Private School</SelectItem>
                        <SelectItem value="charter">Charter School</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.schoolType && (
                      <p className="text-sm text-red-500 mt-1">{form.formState.errors.schoolType.message}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="schoolLevel" className="text-base font-semibold">Service-Learning Program Configuration</Label>
                    <p className="text-sm text-gray-600 mb-2">Choose the service-learning track for your students:</p>
                    <Select onValueChange={(value: "middle_school" | "high_school") => form.setValue("schoolLevel", value)} defaultValue="high_school">
                      <SelectTrigger data-testid="select-school-level" className="h-auto py-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="middle_school">
                          <div className="py-2">
                            <div className="font-semibold text-purple-600">Middle School (Grades 6-8)</div>
                            <div className="text-sm text-gray-600">Optional community service • No hour requirements • Tokens: 25/75/150/300</div>
                            <div className="text-xs text-gray-500 mt-1">Students can log service activities and earn rewards - encouraged but not required</div>
                          </div>
                        </SelectItem>
                        <SelectItem value="high_school">
                          <div className="py-2">
                            <div className="font-semibold text-blue-600">High School (Grades 9-12)</div>
                            <div className="text-sm text-gray-600">200-hour Service-Learning Diploma • 5-phase IPARD • Tokens: 100/250/500/1000</div>
                            <div className="text-xs text-gray-500 mt-1">Required diploma program with VIP parking, leadership opportunities</div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.schoolLevel && (
                      <p className="text-sm text-red-500 mt-1">{form.formState.errors.schoolLevel.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    onClick={nextStep}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                    data-testid="button-next-step"
                  >
                    Next Step →
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Location & Details */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">School Details</h3>
                  <p className="text-gray-600">Help us customize your experience</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="schoolAddress" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      School Address
                    </Label>
                    <Input
                      id="schoolAddress"
                      {...form.register("schoolAddress")}
                      placeholder="123 Education St, Burlington, NC 27215"
                      data-testid="input-school-address"
                    />
                    {form.formState.errors.schoolAddress && (
                      <p className="text-sm text-red-500 mt-1">{form.formState.errors.schoolAddress.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      {...form.register("city")}
                      placeholder="Burlington"
                      data-testid="input-city"
                    />
                    {form.formState.errors.city && (
                      <p className="text-sm text-red-500 mt-1">{form.formState.errors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      {...form.register("state")}
                      placeholder="NC"
                      data-testid="input-state"
                    />
                    {form.formState.errors.state && (
                      <p className="text-sm text-red-500 mt-1">{form.formState.errors.state.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="studentCount" className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Number of Students
                    </Label>
                    <Input
                      id="studentCount"
                      type="number"
                      {...form.register("studentCount", { valueAsNumber: true })}
                      placeholder="500"
                      data-testid="input-student-count"
                    />
                    {form.formState.errors.studentCount && (
                      <p className="text-sm text-red-500 mt-1">{form.formState.errors.studentCount.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="gradeRange">Grade Range</Label>
                    <Select onValueChange={(value) => form.setValue("gradeRange", value)}>
                      <SelectTrigger data-testid="select-grade-range">
                        <SelectValue placeholder="Select grade range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6-8">6th-8th Grade (Middle School)</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.gradeRange && (
                      <p className="text-sm text-red-500 mt-1">{form.formState.errors.gradeRange.message}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="goals">Goals for EchoDeed (Optional)</Label>
                    <Textarea
                      id="goals"
                      {...form.register("goals")}
                      placeholder="What do you hope to achieve with EchoDeed? (e.g., reduce bullying, increase parent engagement, improve school culture)"
                      rows={3}
                      data-testid="textarea-goals"
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={prevStep}
                    data-testid="button-prev-step"
                  >
                    ← Previous
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={registerSchoolMutation.isPending}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                    data-testid="button-submit-registration"
                  >
                    {registerSchoolMutation.isPending ? "Registering..." : "Complete Registration"}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}