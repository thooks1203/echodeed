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
import { Shield, CheckCircle, ArrowLeft, Building } from "lucide-react";
import { Link, useLocation } from "wouter";
import { SchoolSearchSelect } from "@/components/SchoolSearchSelect";

const adminSignupSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "Name too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Name too long"),
  title: z.string().min(1, "Please select your title"),
  email: z.string().email("Please enter a valid school email"),
  schoolId: z.string().min(1, "Please select your school"),
  adminCode: z.string().min(1, "Administrator code is required").max(50, "Code too long"),
  phone: z.string().optional()
});

type AdminSignupForm = z.infer<typeof adminSignupSchema>;

const titleOptions = [
  { value: "principal", label: "Principal" },
  { value: "assistant_principal", label: "Assistant Principal" },
  { value: "dean", label: "Dean of Students" },
  { value: "counselor_head", label: "Head Counselor" },
  { value: "activities_director", label: "Activities Director" },
  { value: "district_admin", label: "District Administrator" },
  { value: "other_admin", label: "Other Administrator" }
];

export default function AdminSignup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [registrationResult, setRegistrationResult] = useState<any>(null);
  const [selectedSchoolName, setSelectedSchoolName] = useState("");

  const form = useForm<AdminSignupForm>({
    resolver: zodResolver(adminSignupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      title: "",
      email: "",
      schoolId: "",
      adminCode: "",
      phone: ""
    }
  });

  const registerAdmin = useMutation({
    mutationFn: async (data: AdminSignupForm) => {
      const response = await apiRequest("POST", "/api/admins/register", data);
      return await response.json();
    },
    onSuccess: (result: any) => {
      setRegistrationResult(result);
      toast({
        title: "🎉 Welcome to EchoDeed!",
        description: "Your administrator account has been created successfully!",
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

  const onSubmit = (data: AdminSignupForm) => {
    registerAdmin.mutate(data);
  };

  if (registrationResult?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-purple-700">Welcome, {registrationResult.title} {registrationResult.lastName}!</CardTitle>
            <CardDescription className="text-base">
              Your administrator account at {selectedSchoolName} is ready!
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-2">
              <p className="text-sm text-purple-800">
                <strong>Administrator Capabilities:</strong>
              </p>
              <ul className="text-sm text-purple-700 space-y-1 list-disc list-inside">
                <li>Full school-wide analytics dashboard</li>
                <li>Manage teacher accounts and permissions</li>
                <li>Configure school rewards and milestones</li>
                <li>Access behavioral climate monitoring</li>
                <li>Generate reports for district compliance</li>
              </ul>
            </div>
            
            <Button
              onClick={() => setLocation('/admin')}
              className="w-full h-12 text-base font-medium bg-purple-600 hover:bg-purple-700"
            >
              <Shield className="w-5 h-5 mr-2" />
              Go to Admin Dashboard
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <Link href="/" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <Card className="shadow-xl">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Administrator Registration</CardTitle>
            <CardDescription className="text-base">
              Set up your school's EchoDeed™ administration account
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your title" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {titleOptions.map((title) => (
                            <SelectItem key={title.value} value={title.value}>
                              {title.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Darrell" {...field} />
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
                          <Input placeholder="Harris" {...field} />
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
                        <Input type="email" placeholder="dharris@school.edu" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="(336) 449-4521" {...field} />
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
                  name="adminCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Administrator Code</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        Contact EchoDeed support or your district to obtain this code
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm text-purple-800">
                  <strong>Administrator Access Includes:</strong>
                  <ul className="mt-1 space-y-1 list-disc list-inside text-purple-700">
                    <li>Full school-wide analytics and reports</li>
                    <li>Teacher and staff account management</li>
                    <li>Configure rewards, badges, and milestones</li>
                    <li>Behavioral climate monitoring dashboard</li>
                    <li>District compliance reporting tools</li>
                  </ul>
                </div>
                
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-medium bg-purple-600 hover:bg-purple-700"
                  disabled={registerAdmin.isPending}
                >
                  {registerAdmin.isPending ? "Creating Account..." : "Create Administrator Account"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
