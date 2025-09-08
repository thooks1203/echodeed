import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  // Temporarily disable auth check for admin access
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: false // Disable auth check
  });

  // Mock authenticated user for demo purposes
  const mockUser = {
    id: 'demo-user',
    name: 'Demo Admin',
    role: 'admin',
    email: 'admin@demo.com'
  };

  return {
    user: mockUser,
    isLoading: false,
    isAuthenticated: true, // Always authenticated for demo
  };
}