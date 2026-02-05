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
import { Users, CheckCircle, AlertCircle, GraduationCap, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { SchoolSearchSelect } from "@/components/SchoolSearchSelect";

const teacherSignupSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "Name too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Name too long"),
  email: z.string().email("Please enter a valid school email"),
  department: z.string().min(1, "Please select your department"),
  schoolId: z.string().min(1, "Please select your school"),
  enrollmentCode: z.string().min(1, "School enrollment code is required").max(50, "Code too long"),
  subjects: z.string().optional()
});

type TeacherSignupForm = z.infer<typeof teacherSignupSchema>;

const departmentOptions = [
  { value: "english", label: "English / Language Arts" },
  { value: "math", label: "Mathematics" },
  { value: "science", label: "Science" },
  { value: "social_studies", label: "Social Studies / History" },
  { value: "world_languages", label: "World Languages" },
  { value: "arts", label: "Arts (Music, Drama, Visual)" },
  { value: "pe", label: "Physical Education / Health" },
  { value: "cte", label: "Career & Technical Education" },
  { value: "special_ed", label: "Special Education" },
  { value: "counseling", label: "Counseling / Student Services" },
  { value: "administration", label: "Administration" },
  { value: "other", label: "Other" }
];

export default function TeacherSignup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [registrationResult, setRegistrationResult] = useState<any>(null);
  const [selectedSchoolName, setSelectedSchoolName] = useState("");

  const form = useForm<TeacherSignupForm>({
    resolver: zodResolver(teacherSignupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      department: "",
      schoolId: "",
      enrollmentCode: "",
      subjects: ""
    }
  });

  const registerTeacher = useMutation({
    mutationFn: async (data: TeacherSignupForm) => {
      const response = await apiRequest("POST", "/api/teachers/register", data);
      return await response.json();
    },
    onSuccess: (result: any) => {
      setRegistrationResult(result);
      toast({
        title: "🎉 Welcome to EchoDeed!",
        description: "Your teacher account has been created successfully!",
        duration: 5000
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Please check your information and try again.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: TeacherSignupForm) => {
    registerTeacher.mutate(data);
  };

  if (registrationResult?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-700">Welcome, {registrationResult.firstName}!</CardTitle>
            <CardDescription className="text-base">
              Your teacher account at {selectedSchoolName} is ready!
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
              <p className="text-sm text-green-800">
                <strong>What's next?</strong>
              </p>
              <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
                <li>Access your Teacher Dashboard to manage students</li>
                <li>Create class claim codes for student rewards</li>
                <li>Review and verify service hour submissions</li>
                <li>Track class kindness metrics</li>
              </ul>
            </div>
            
            <Button
              onClick={() => setLocation('/app?tab=teacher-dashboard')}
              className="w-full h-12 text-base font-medium bg-green-600 hover:bg-green-700"
            >
              <Users className="w-5 h-5 mr-2" />
              Go to Teacher Dashboard
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setLocation('/')}
              className="w-full"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <Link href="/" className="inline-flex items-center text-green-600 hover:text-green-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <Card className="shadow-xl">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Teacher Registration</CardTitle>
            <CardDescription className="text-base">
              Join EchoDeed™ to support character education in your classroom
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Kim" {...field} />
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
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Jones" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="kjones@school.edu" {...field} />
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
                      <FormLabel>School</FormLabel>
                      <FormControl>
                        <SchoolSearchSelect
                          value={field.value}
                          onValueChange={(id, name) => {
                            field.onChange(id);
                            setSelectedSchoolName(name);
                          }}
                          placeholder="Search for your school..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="enrollmentCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School Enrollment Code</FormLabel>
                      <FormControl>
                        <Input placeholder="EGHS-2025" {...field} />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        Get this code from your school administrator
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departmentOptions.map((dept) => (
                            <SelectItem key={dept.value} value={dept.value}>
                              {dept.label}
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
                  name="subjects"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subjects Taught (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., English 9, AP Literature" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                  <strong>Teacher Benefits:</strong>
                  <ul className="mt-1 space-y-1 list-disc list-inside text-green-700">
                    <li>Create claim codes for student rewards</li>
                    <li>Verify service hours and community work</li>
                    <li>Track classroom kindness metrics</li>
                    <li>Access character education curriculum</li>
                  </ul>
                </div>
                
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-medium bg-green-600 hover:bg-green-700"
                  disabled={registerTeacher.isPending}
                >
                  {registerTeacher.isPending ? "Creating Account..." : "Create Teacher Account"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
