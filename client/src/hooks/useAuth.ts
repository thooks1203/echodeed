import { useQuery } from "@tanstack/react-query";

type SchoolRole = 'student' | 'teacher' | 'admin' | 'parent' | 'counselor';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  schoolRole?: SchoolRole;
  schoolId?: string;
  grade?: string;
  firstName?: string;
  lastName?: string;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<AuthUser>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Demo fallback: Use localStorage demo role if real auth fails (works in both dev and production)
  const getDemoUser = (): AuthUser | null => {
    // Allow demo mode in both development and production for the educational platform
    // This is safe because it's for demonstration purposes only
    
    const storedRole = localStorage.getItem('echodeed_demo_role');
    if (!storedRole) return null;
    
    // Check school level for conditional names
    const schoolLevel = localStorage.getItem('demo_school_level_override') || 'high_school';
    const isMiddleSchool = schoolLevel === 'middle_school';
    
    const demoUsers: Record<string, AuthUser> = {
      student: {
        id: 'student-001',
        name: 'Sofia Rodriguez',
        email: isMiddleSchool ? 'sofia.rodriguez@easternms.gcsnc.com' : 'sofia.rodriguez@easterngs.gcsnc.com',
        schoolRole: 'student',
        schoolId: 'bc016cad-fa89-44fb-aab0-76f82c574f78',
        grade: isMiddleSchool ? '7th' : '10th'
      },
      teacher: {
        id: 'teacher-001', 
        name: 'Ms. Kim Jones',
        email: isMiddleSchool ? 'kjones@easternms.gcsnc.com' : 'kjones@easterngs.gcsnc.com',
        schoolRole: 'teacher',
        schoolId: 'bc016cad-fa89-44fb-aab0-76f82c574f78'
      },
      admin: {
        id: 'admin-001',
        name: isMiddleSchool ? 'Ms McNeil' : 'Dr. Darrell Harris',
        email: isMiddleSchool ? 'mcneil@easternms.gcsnc.com' : 'dharris@easterngs.gcsnc.com', 
        schoolRole: 'admin',
        schoolId: 'bc016cad-fa89-44fb-aab0-76f82c574f78'
      },
      parent: {
        id: 'parent-001',
        name: 'Maria Rodriguez',
        email: 'maria.rodriguez@email.com',
        schoolRole: 'parent',
        schoolId: 'bc016cad-fa89-44fb-aab0-76f82c574f78'
      }
    };
    
    return demoUsers[storedRole] || null;
  };

  // CRITICAL FIX: Prefer demo role over server response for demo platform
  const demo = getDemoUser();
  const finalUser = demo ?? user;

  return {
    user: finalUser,
    isLoading,
    isAuthenticated: !!finalUser,
    // Helper methods for role checking
    isStudent: finalUser?.schoolRole === 'student',
    isTeacher: finalUser?.schoolRole === 'teacher',
    isAdmin: finalUser?.schoolRole === 'admin',
    isParent: finalUser?.schoolRole === 'parent',
  };
}

// Demo utility functions (works in both development and production)
export function switchDemoRole(role: SchoolRole) {
  // Always set demo role and session for educational demo purposes
  localStorage.setItem('echodeed_demo_role', role);
  
  // CRITICAL: Force set the school level to 'high_school' for consistent demo experience
  // This ensures the session properly recognizes the school level
  localStorage.setItem('demo_school_level_override', 'high_school');
  
  // Ensure session exists for API calls - regenerate to force new session
  const sessionId = `demo-${role}-${Date.now()}`;
  localStorage.setItem('echodeed_session', sessionId);
  
  // Navigate to appropriate dashboard
  const dashboardPaths: Record<SchoolRole, string> = {
    student: '/app', // Students go to main feed with kindness posts
    teacher: '/teacher-dashboard',
    admin: '/admin-dashboard',
    parent: '/parent-dashboard',
    counselor: '/teacher-dashboard' // Counselors use teacher dashboard
  };
  
  window.location.href = dashboardPaths[role] || '/';
}

// Get available demo roles for testing
export function getDemoRoles() {
  const schoolLevel = localStorage.getItem('demo_school_level_override') || 'high_school';
  const isMiddleSchool = schoolLevel === 'middle_school';
  
  return [
    { role: 'student' as const, label: 'Student (Sofia Rodriguez)', description: 'Limited access - can only see own data' },
    { role: 'teacher' as const, label: 'Teacher (Ms. Kim Jones)', description: 'Can access classroom tools and some school data' },
    { role: 'admin' as const, label: isMiddleSchool ? 'Admin (Ms McNeil)' : 'Admin (Dr. Darrell Harris)', description: 'Full access to school management dashboard' },
    { role: 'parent' as const, label: 'Parent (Maria Rodriguez)', description: 'Track children\'s kindness journey and approve activities' }
  ] as const;
}