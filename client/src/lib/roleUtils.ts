import { useQuery } from "@tanstack/react-query";

export type UserRole = 'employee' | 'team_lead' | 'hr_admin' | 'corporate_admin';

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