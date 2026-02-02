// Type augmentation for Express Request
declare global {
  namespace Express {
    interface Request {
      // Authentication context
      user?: {
        id?: string;
        claims?: {
          sub: string;
          email?: string;
          [key: string]: any;
        };
        [key: string]: any;
      };
      
      // Teacher authorization context
      teacherContext?: {
        userId: string;
        schoolRole: string;
        schoolId: string;
      };
      
      // School access context (populated by requireSchoolAccess)
      userSchools?: Array<{
        schoolId: string;
        schoolName: string;
        role: string;
      }>;
      
      // Primary school ID for the current request
      primarySchoolId?: string;
    }
  }
}

export {};
