import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, School, Loader2, CheckCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface SchoolData {
  id: string;
  name: string;
  type?: string;
  city?: string;
  state?: string;
  requiresEnrollmentCode?: boolean;
  hasCommunityCode?: boolean;
}

interface SchoolSearchSelectProps {
  value?: string;
  onValueChange: (schoolId: string, schoolName: string, requiresCode: boolean) => void;
  placeholder?: string;
  className?: string;
}

export function SchoolSearchSelect({ 
  value, 
  onValueChange, 
  placeholder = "Search for your school...",
  className 
}: SchoolSearchSelectProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSchoolName, setSelectedSchoolName] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: schools = [], isLoading } = useQuery<SchoolData[]>({
    queryKey: ['/api/schools/search', searchQuery],
    queryFn: async () => {
      if (searchQuery.length < 2) return [];
      const response = await fetch(`/api/schools/search?query=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: searchQuery.length >= 2
  });

  const { data: allSchools = [] } = useQuery<SchoolData[]>({
    queryKey: ['/api/schools']
  });

  useEffect(() => {
    if (value && allSchools.length > 0) {
      const school = allSchools.find((s: SchoolData) => s.id === value);
      if (school) {
        setSelectedSchoolName(school.name);
      }
    }
  }, [value, allSchools]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (school: SchoolData) => {
    setSelectedSchoolName(school.name);
    setSearchQuery("");
    setIsOpen(false);
    onValueChange(school.id, school.name, school.requiresEnrollmentCode !== false);
  };

  const displaySchools = searchQuery.length >= 2 ? schools : allSchools.slice(0, 10);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          value={isOpen ? searchQuery : (selectedSchoolName || searchQuery)}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10 pr-10"
          data-testid="input-school-search"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
        )}
        {selectedSchoolName && !isOpen && (
          <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
        )}
      </div>

      {isOpen && (
        <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-auto shadow-lg border">
          {searchQuery.length < 2 && displaySchools.length === 0 ? (
            <div className="p-3 text-sm text-gray-500 text-center">
              Type at least 2 characters to search
            </div>
          ) : displaySchools.length === 0 && !isLoading ? (
            <div className="p-4 text-center">
              <School className="h-8 w-8 mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No schools found for "{searchQuery}"</p>
              <p className="text-xs text-gray-400 mt-1">
                Ask your school to register with EchoDeed
              </p>
            </div>
          ) : (
            <ul className="py-1">
              {displaySchools.map((school) => (
                <li
                  key={school.id}
                  onClick={() => handleSelect(school)}
                  className={cn(
                    "px-4 py-3 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors flex items-center gap-3",
                    value === school.id && "bg-emerald-50 dark:bg-emerald-900/20"
                  )}
                  data-testid={`school-option-${school.id}`}
                >
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <School className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {school.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      {school.requiresEnrollmentCode === false ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Users className="h-3 w-3" /> Open Enrollment
                        </span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">
                          Code required from teacher
                        </span>
                      )}
                    </div>
                  </div>
                  {value === school.id && (
                    <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}
