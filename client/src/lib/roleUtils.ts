import { useQuery } from "@tanstack/react-query";

// Corporate roles (existing)
export type UserRole = 'employee' | 'team_lead' | 'hr_admin' | 'corporate_admin';

// School roles (new security system)
export type SchoolRole = 'student' | 'teacher' | 'admin' | 'parent' | 'counselor';

export interface CorporateEmployee {
  id: string;
  userId: string;
  corporateAccountId: string;
  teamId?: string;
  employeeEmail: string;
  displayName?: string;
  role: UserRole;
  department?: string;
  isActive: number;
  enrolledAt: string;
}

export function hasAdminRole(role: UserRole): boolean {
  return role === 'hr_admin' || role === 'corporate_admin';
}

export function hasTeamLeadRole(role: UserRole): boolean {
  return role === 'team_lead' || hasAdminRole(role);
}

export function canAccessEmployeeData(currentUserRole: UserRole, targetUserId: string, currentUserId: string): boolean {
  // Users can always access their own data
  if (targetUserId === currentUserId) {
    return true;
  }
  
  // Admins can access all employee data
  if (hasAdminRole(currentUserRole)) {
    return true;
  }
  
  // Team leads can access their team member data (implementation would require team membership check)
  if (hasTeamLeadRole(currentUserRole)) {
    // In a real implementation, you'd check if the target user is in the team lead's team
    return true;
  }
  
  return false;
}

export function canCreateCorporateChallenge(role: UserRole): boolean {
  return hasAdminRole(role) || hasTeamLeadRole(role);
}

export function canViewAnalytics(role: UserRole): boolean {
  return hasAdminRole(role);
}

export function canManageTeams(role: UserRole): boolean {
  return hasAdminRole(role);
}

export function canExportReports(role: UserRole): boolean {
  return hasAdminRole(role);
}

export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case 'employee':
      return 'Employee';
    case 'team_lead':
      return 'Team Lead';
    case 'hr_admin':
      return 'HR Admin';
    case 'corporate_admin':
      return 'Corporate Admin';
    default:
      return 'Employee';
  }
}

export function getRoleColor(role: UserRole): string {
  switch (role) {
    case 'employee':
      return 'bg-blue-100 text-blue-800';
    case 'team_lead':
      return 'bg-green-100 text-green-800';
    case 'hr_admin':
      return 'bg-purple-100 text-purple-800';
    case 'corporate_admin':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// React hook to get current user's corporate employee info and role
export function useCorporateRole() {
  const { data: employee, isLoading, error } = useQuery<CorporateEmployee | null>({
    queryKey: ["/api/corporate/employee"],
    retry: false,
  });

  return {
    employee,
    role: employee?.role || 'employee' as UserRole,
    isAdmin: employee ? hasAdminRole(employee.role) : false,
    isTeamLead: employee ? hasTeamLeadRole(employee.role) : false,
    canViewAnalytics: employee ? canViewAnalytics(employee.role) : false,
    canManageTeams: employee ? canManageTeams(employee.role) : false,
    canCreateChallenges: employee ? canCreateCorporateChallenge(employee.role) : false,
    canExportReports: employee ? canExportReports(employee.role) : false,
    isLoading,
    error,
  };
}

// ==========================================
// SCHOOL ROLE SECURITY SYSTEM
// ==========================================

// School role authentication utilities
export function isStudent(role: SchoolRole): boolean {
  return role === 'student';
}

export function isTeacher(role: SchoolRole): boolean {
  return role === 'teacher';
}

export function isAdmin(role: SchoolRole): boolean {
  return role === 'admin';
}

export function hasTeacherAccess(role: SchoolRole): boolean {
  return role === 'teacher' || role === 'admin';
}

export function hasAdminAccess(role: SchoolRole): boolean {
  return role === 'admin';
}

// Permission checks for school features
export function canAccessSchoolsDashboard(role: SchoolRole): boolean {
  // CRITICAL SECURITY: Only teachers and admins can access Schools Dashboard
  return role === 'teacher' || role === 'admin';
}

export function canViewStudentData(currentRole: SchoolRole, targetStudentId?: string, currentUserId?: string): boolean {
  // Admins can view all student data
  if (currentRole === 'admin') {
    return true;
  }
  
  // Teachers can view student data from their classes (simplified for now)
  if (currentRole === 'teacher') {
    return true;
  }
  
  // Students can only view their own data
  if (currentRole === 'student') {
    return targetStudentId === currentUserId;
  }
  
  return false;
}

export function canAccessAdminTools(role: SchoolRole): boolean {
  return role === 'admin';
}

export function canManageTeachers(role: SchoolRole): boolean {
  return role === 'admin';
}

export function canViewSchoolAnalytics(role: SchoolRole): boolean {
  // Only admins can view school analytics and performance data
  return role === 'admin';
}

export function canAccessDistrictData(role: SchoolRole): boolean {
  // Only admins can access district-level data
  return role === 'admin';
}

export function getSchoolRoleDisplayName(role: SchoolRole): string {
  switch (role) {
    case 'student':
      return 'Student';
    case 'teacher':
      return 'Teacher';
    case 'admin':
      return 'Administrator';
    default:
      return 'Student';
  }
}

export function getSchoolRoleColor(role: SchoolRole): string {
  switch (role) {
    case 'student':
      return 'bg-green-100 text-green-800';
    case 'teacher':
      return 'bg-blue-100 text-blue-800';
    case 'admin':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// React hook to get current user's school role
export function useSchoolRole() {
  const { data: user, isLoading, error } = useQuery<{schoolRole: SchoolRole, schoolId?: string, grade?: string} | null>({
    queryKey: ["/api/auth/school-user"],
    retry: false,
  });

  const role = user?.schoolRole || 'student';

  return {
    user,
    role,
    schoolId: user?.schoolId,
    grade: user?.grade,
    isStudent: isStudent(role),
    isTeacher: isTeacher(role),
    isAdmin: isAdmin(role),
    hasTeacherAccess: hasTeacherAccess(role),
    hasAdminAccess: hasAdminAccess(role),
    canAccessSchoolsDashboard: canAccessSchoolsDashboard(role),
    canViewSchoolAnalytics: canViewSchoolAnalytics(role),
    canAccessAdminTools: canAccessAdminTools(role),
    canManageTeachers: canManageTeachers(role),
    canAccessDistrictData: canAccessDistrictData(role),
    isLoading,
    error,
  };
}