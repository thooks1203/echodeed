import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { type SchoolLevel, type SchoolLevelConfig, SCHOOL_LEVEL_CONFIGS } from "@shared/config/schoolLevels";

interface UseSchoolLevelResult {
  schoolLevel: SchoolLevel;
  config: SchoolLevelConfig | null;
  isLoading: boolean;
  error: Error | null;
  isDemoOverride: boolean;
}

const DEMO_SCHOOL_LEVEL_KEY = 'demo_school_level_override';

/**
 * React hook to fetch the current user's school-level configuration
 * Returns middle_school or high_school config with appropriate:
 * - Service hour goals (0 for MS optional, 200 for HS required)
 * - Token milestones (25/75/150/300 for MS, 100/250/500/1000 for HS)
 * - Workflow type (3-phase for MS, 5-phase IPARD for HS)
 * - Parental oversight level (COPPA strict for MS, FERPA standard for HS)
 * 
 * DEMO MODE: Checks localStorage for demo_school_level_override to allow
 * switching between MS and HS experiences for demonstrations
 */
export function useSchoolLevel(): UseSchoolLevelResult {
  const [demoOverride, setDemoOverride] = useState<SchoolLevel | null>(null);
  
  // Check for demo override in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(DEMO_SCHOOL_LEVEL_KEY);
      if (stored === 'middle_school' || stored === 'high_school') {
        setDemoOverride(stored);
      }
    }
  }, []);
  
  const { data, isLoading, error } = useQuery<SchoolLevelConfig>({
    queryKey: ['/api/school-level/config'],
  });
  
  // If demo override exists, use it instead of API data
  if (demoOverride) {
    return {
      schoolLevel: demoOverride,
      config: SCHOOL_LEVEL_CONFIGS[demoOverride],
      isLoading: false,
      error: null,
      isDemoOverride: true,
    };
  }
  
  return {
    schoolLevel: data?.level || 'high_school',
    config: data || null,
    isLoading,
    error: error as Error | null,
    isDemoOverride: false,
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
