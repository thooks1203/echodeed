import { useQuery } from "@tanstack/react-query";
import { type SchoolLevel, type SchoolLevelConfig } from "@shared/config/schoolLevels";

interface UseSchoolLevelResult {
  schoolLevel: SchoolLevel;
  config: SchoolLevelConfig | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * React hook to fetch the current user's school-level configuration
 * Returns middle_school or high_school config with appropriate:
 * - Service hour goals (40-60 for MS, 200 for HS)
 * - Token milestones (25/75/150/300 for MS, 100/250/500/1000 for HS)
 * - Workflow type (3-phase for MS, 5-phase IPARD for HS)
 * - Parental oversight level (COPPA strict for MS, FERPA standard for HS)
 */
export function useSchoolLevel(): UseSchoolLevelResult {
  const { data, isLoading, error } = useQuery<SchoolLevelConfig>({
    queryKey: ['/api/school-level/config'],
  });
  
  return {
    schoolLevel: data?.level || 'high_school',
    config: data || null,
    isLoading,
    error: error as Error | null,
  };
}

/**
 * Hook to get only the school level enum (middle_school | high_school)
 * without the full configuration
 */
export function useSchoolLevelOnly(): { level: SchoolLevel; isLoading: boolean } {
  const { schoolLevel, isLoading } = useSchoolLevel();
  return { level: schoolLevel, isLoading };
}
