import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Heart, CheckCircle, Users, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { SchoolSearchSelect } from "@/components/SchoolSearchSelect";

const parentSignupSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "Name too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Name too long"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  schoolId: z.string().min(1, "Please select your child's school"),
  childFirstName: z.string().min(1, "Child's first name is required").max(50, "Name too long"),
  childLastName: z.string().min(1, "Child's last name is required").max(50, "Name too long"),
  childGrade: z.string().min(1, "Please select your child's grade"),
  relationship: z.string().min(1, "Please select your relationship")
});

type ParentSignupForm = z.infer<typeof parentSignupSchema>;

const gradeOptions = [
  { value: "6", label: "6th Grade" },
  { value: "7", label: "7th Grade" },
  { value: "8", label: "8th Grade" },
  { value: "9", label: "9th Grade (Freshman)" },
  { value: "10", label: "10th Grade (Sophomore)" },
  { value: "11", label: "11th Grade (Junior)" },
  { value: "12", label: "12th Grade (Senior)" }
];

const relationshipOptions = [
  { value: "mother", label: "Mother" },
  { value: "father", label: "Father" },
  { value: "guardian", label: "Legal Guardian" },
  { value: "grandparent", label: "Grandparent" },
  { value: "other", label: "Other Family Member" }
];

export default function ParentSignup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [registrationResult, setRegistrationResult] = useState<any>(null);
  const [selectedSchoolName, setSelectedSchoolName] = useState("");

  const form = useForm<ParentSignupForm>({
    resolver: zodResolver(parentSignupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      schoolId: "",
      childFirstName: "",
      childLastName: "",
      childGrade: "",
      relationship: ""
    }
  });

  const registerParent = useMutation({
    mutationFn: async (data: ParentSignupForm) => {
      const response = await apiRequest("POST", "/api/parents/register", data);
      return await response.json();
    },
    onSuccess: (result: any) => {
      setRegistrationResult(result);
      toast({
        title: "🎉 Welcome to EchoDeed!",
        description: "Your parent account has been created successfully!",
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

  const onSubmit = (data: ParentSignupForm) => {
    registerParent.mutate(data);
  };

  if (registrationResult?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-pink-700">Welcome, {registrationResult.firstName}!</CardTitle>
            <CardDescription className="text-base">
              Your parent account is ready!
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 space-y-2">
              <p className="text-sm text-pink-800">
                <strong>What's next?</strong>
              </p>
              <ul className="text-sm text-pink-700 space-y-1 list-disc list-inside">
                <li>View your child's kindness activities</li>
                <li>Track service hours and achievements</li>
                <li>Receive notifications about milestones</li>
                <li>Connect with the parent community</li>
              </ul>
            </div>
            
            {registrationResult.childLinked ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                <CheckCircle className="inline w-4 h-4 mr-1" />
                <strong>Great news!</strong> We found {registrationResult.childFirstName}'s account and linked it to yours!
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                <strong>Note:</strong> When {registrationResult.childFirstName} signs up for EchoDeed, their account will automatically link to yours.
              </div>
            )}
            
            <Button
              onClick={() => setLocation('/app?tab=parent-dashboard')}
              className="w-full h-12 text-base font-medium bg-pink-600 hover:bg-pink-700"
            >
              <Heart className="w-5 h-5 mr-2" />
              Go to Parent Dashboard
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <Link href="/" className="inline-flex items-center text-pink-600 hover:text-pink-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <Card className="shadow-xl">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Parent Registration</CardTitle>
            <CardDescription className="text-base">
              Join EchoDeed™ to support your child's character journey
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="border-b pb-4 mb-4">
                  <h3 className="font-semibold text-sm text-muted-foreground mb-3">Your Information</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Maria" {...field} />
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
                            <Input placeholder="Rodriguez" {...field} />
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
                      <FormItem className="mt-4">
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="maria@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="(336) 555-1234" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="relationship"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Relationship to Student</FormLabel>
                        <select
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                          value={field.value}
                          onChange={field.onChange}
                        >
                          <option value="">Select relationship</option>
                          {relationshipOptions.map((rel) => (
                            <option key={rel.value} value={rel.value}>
                              {rel.label}
                            </option>
                          ))}
                        </select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-3">Your Child's Information</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="childFirstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Child's First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Sofia" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="childLastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Child's Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Rodriguez" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="schoolId"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Child's School</FormLabel>
                        <FormControl>
                          <SchoolSearchSelect
                            value={field.value}
                            onValueChange={(id, name) => {
                              field.onChange(id);
                              setSelectedSchoolName(name);
                            }}
                            placeholder="Search for your child's school..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="childGrade"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Child's Grade</FormLabel>
                        <select
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                          value={field.value}
                          onChange={field.onChange}
                        >
                          <option value="">Select grade</option>
                          {gradeOptions.map((grade) => (
                            <option key={grade.value} value={grade.value}>
                              {grade.label}
                            </option>
                          ))}
                        </select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-3 text-sm text-pink-800">
                  <strong>Parent Benefits:</strong>
                  <ul className="mt-1 space-y-1 list-disc list-inside text-pink-700">
                    <li>Track your child's kindness activities</li>
                    <li>Receive milestone notifications</li>
                    <li>Access exclusive parent rewards</li>
                    <li>Connect with other EchoDeed families</li>
                  </ul>
                </div>
                
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-medium bg-pink-600 hover:bg-pink-700"
                  disabled={registerParent.isPending}
                >
                  {registerParent.isPending ? "Creating Account..." : "Create Parent Account"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
