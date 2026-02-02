import { db } from "../db";
import { schools, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { getSchoolLevelConfig, type SchoolLevel, type SchoolLevelConfig } from "@shared/config/schoolLevels";

export class SchoolConfigService {
  /**
   * Fetch school-level configuration based on schoolId
   * Returns configuration for middle school or high school experience
   */
  async getSchoolConfig(schoolId: string): Promise<SchoolLevelConfig> {
    try {
      const school = await db
        .select({ schoolLevel: schools.schoolLevel })
        .from(schools)
        .where(eq(schools.id, schoolId))
        .limit(1);
      
      if (!school.length) {
        // Default to high school if school not found
        return getSchoolLevelConfig('high_school');
      }
      
      const schoolLevel = (school[0].schoolLevel || 'high_school') as SchoolLevel;
      return getSchoolLevelConfig(schoolLevel);
    } catch (error) {
      console.error(`[SchoolConfigService] Error fetching config for school ${schoolId}:`, error);
      // Fail safe - return high school config
      return getSchoolLevelConfig('high_school');
    }
  }
  
  /**
   * Fetch school level (middle_school | high_school) for a given schoolId
   */
  async getSchoolLevel(schoolId: string): Promise<SchoolLevel> {
    try {
      const school = await db
        .select({ schoolLevel: schools.schoolLevel })
        .from(schools)
        .where(eq(schools.id, schoolId))
        .limit(1);
      
      if (!school.length) {
        return 'high_school'; // Default fallback
      }
      
      return (school[0].schoolLevel || 'high_school') as SchoolLevel;
    } catch (error) {
      console.error(`[SchoolConfigService] Error fetching level for school ${schoolId}:`, error);
      return 'high_school'; // Fail safe
    }
  }
  
  /**
   * Fetch school level for a given user (via their schoolId)
   */
  async getSchoolLevelForUser(userId: string): Promise<SchoolLevel> {
    try {
      const user = await db
        .select({ schoolId: users.schoolId })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      
      if (!user.length || !user[0].schoolId) {
        return 'high_school'; // Default fallback
      }
      
      return await this.getSchoolLevel(user[0].schoolId);
    } catch (error) {
      console.error(`[SchoolConfigService] Error fetching level for user ${userId}:`, error);
      return 'high_school'; // Fail safe
    }
  }
}

export const schoolConfigService = new SchoolConfigService();
