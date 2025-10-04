import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  type DemoSchoolConfig, 
  type SchoolKey, 
  getSchoolConfig, 
  DEFAULT_SCHOOL_KEY,
  getSchoolKeys 
} from '@shared/demoConfig';

interface DemoSchoolContextType {
  currentSchoolKey: SchoolKey;
  schoolConfig: DemoSchoolConfig;
  setSchool: (schoolKey: SchoolKey) => void;
  availableSchools: SchoolKey[];
}

const DemoSchoolContext = createContext<DemoSchoolContextType | undefined>(undefined);

const STORAGE_KEY = 'echodeed_selected_school';

export function DemoSchoolProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage or use default
  const [currentSchoolKey, setCurrentSchoolKey] = useState<SchoolKey>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (stored === 'dudley' || stored === 'eastern-guilford')) {
      return stored as SchoolKey;
    }
    return DEFAULT_SCHOOL_KEY;
  });

  const [schoolConfig, setSchoolConfig] = useState<DemoSchoolConfig>(() => 
    getSchoolConfig(currentSchoolKey)
  );

  // Update school configuration and persist selection
  const setSchool = (schoolKey: SchoolKey) => {
    setCurrentSchoolKey(schoolKey);
    setSchoolConfig(getSchoolConfig(schoolKey));
    localStorage.setItem(STORAGE_KEY, schoolKey);
    
    // Also update the schoolId in session storage for API calls
    const config = getSchoolConfig(schoolKey);
    localStorage.setItem('echodeed_school_id', config.school.id);
  };

  // Sync school config when key changes
  useEffect(() => {
    const config = getSchoolConfig(currentSchoolKey);
    setSchoolConfig(config);
    localStorage.setItem('echodeed_school_id', config.school.id);
  }, [currentSchoolKey]);

  const value: DemoSchoolContextType = {
    currentSchoolKey,
    schoolConfig,
    setSchool,
    availableSchools: getSchoolKeys()
  };

  return (
    <DemoSchoolContext.Provider value={value}>
      {children}
    </DemoSchoolContext.Provider>
  );
}

// Custom hook to use the demo school context
export function useDemoSchool() {
  const context = useContext(DemoSchoolContext);
  if (!context) {
    throw new Error('useDemoSchool must be used within DemoSchoolProvider');
  }
  return context;
}

// Hook to get school-specific demo user
export function useDemoUser(role: 'student' | 'teacher' | 'admin' | 'parent') {
  const { schoolConfig } = useDemoSchool();
  return schoolConfig.users[role];
}

// Hook to get school sponsors
export function useSchoolSponsors() {
  const { schoolConfig } = useDemoSchool();
  return schoolConfig.sponsors.filter(s => s.active);
}

// Hook to get school info
export function useSchoolInfo() {
  const { schoolConfig } = useDemoSchool();
  return schoolConfig.school;
}
