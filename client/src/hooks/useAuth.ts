import { useQuery } from "@tanstack/react-query";
import { SchoolRole } from "@shared/schema";
import { DEMO_USER_STUDENT } from "@shared/demoConfig";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  schoolRole: SchoolRole;
  schoolId?: string;
  grade?: string;
}

// Mock user data for different roles (for development/testing)
const MOCK_USERS: Record<string, AuthUser> = {
  student: {
    id: DEMO_USER_STUDENT.id,
    name: DEMO_USER_STUDENT.name,
    email: DEMO_USER_STUDENT.email,
    schoolRole: DEMO_USER_STUDENT.schoolRole as SchoolRole,
    schoolId: DEMO_USER_STUDENT.schoolId,
    grade: DEMO_USER_STUDENT.grade
  },
  teacher: {
    id: 'teacher-001', 
    name: 'Ms. Sarah Wilson',
    email: 'sarah.wilson@school.edu',
    schoolRole: 'teacher',
    schoolId: 'bc016cad-fa89-44fb-aab0-76f82c574f78' // GRAHAM MIDDLE SCHOOL
  },
  admin: {
    id: 'admin-001',
    name: 'Dr. Michael Brown',
    email: 'michael.brown@district.edu', 
    schoolRole: 'admin',
    schoolId: 'bc016cad-fa89-44fb-aab0-76f82c574f78' // GRAHAM MIDDLE SCHOOL
  },
  parent: {
    id: 'parent-001',
    name: 'Mrs. Sarah Johnson',
    email: 'sarah.johnson@parent.edu',
    schoolRole: 'parent',
    schoolId: 'bc016cad-fa89-44fb-aab0-76f82c574f78' // Burlington Christian Academy
  }
};

// Get current mock user from localStorage (for demo purposes)
function getCurrentMockUser(): AuthUser | null {
  const storedRole = localStorage.getItem('echodeed_demo_role') as SchoolRole;
  if (storedRole && MOCK_USERS[storedRole]) {
    return MOCK_USERS[storedRole];
  }
  // Return null if no role is selected - user must sign in first
  return null;
}

export function useAuth() {
  // Use mock data for role-based testing - require explicit role selection
  const mockUser = getCurrentMockUser();

  return {
    user: mockUser,
    isLoading: false,
    isAuthenticated: !!mockUser, // Only authenticated if user has selected a role
    // Helper methods for role checking
    isStudent: mockUser?.schoolRole === 'student',
    isTeacher: mockUser?.schoolRole === 'teacher',
    isAdmin: mockUser?.schoolRole === 'admin',
    isParent: mockUser?.schoolRole === 'parent',
  };
}

// Demo utility to switch between user roles (for testing)
export function switchDemoRole(role: SchoolRole) {
  localStorage.setItem('echodeed_demo_role', role);
  // Force page reload to update role
  window.location.reload();
}

// Get available demo roles for testing
export function getDemoRoles() {
  return [
    { role: 'student', label: 'Student (Emma Johnson)', description: 'Limited access - can only see own data' },
    { role: 'teacher', label: 'Teacher (Ms. Wilson)', description: 'Can access classroom tools and some school data' },
    { role: 'admin', label: 'Admin (Dr. Brown)', description: 'Full access to school management dashboard' },
    { role: 'parent', label: 'Parent (Mrs. Smith)', description: 'Track children\'s kindness journey and approve activities' }
  ] as const;
}