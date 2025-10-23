import { db } from '../db';
import { 
  communityServiceLogs, 
  communityServiceVerifications, 
  userTokens,
  users,
  studentServiceSummaries
} from '@shared/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
// Import email service dynamically to avoid circular dependency

export interface CommunityServiceSubmission {
  userId: string;
  schoolId?: string;
  serviceName: string;
  serviceDescription: string;
  organizationName?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  hoursLogged: number;
  serviceDate: Date;
  location?: string;
  category: string;
  studentReflection: string;
  photoEvidence?: string;
}

export interface ServiceVerificationRequest {
  serviceLogId: string;
  verifierType: 'teacher' | 'parent' | 'organization' | 'peer';
  verifierId: string;
  verificationMethod: 'photo' | 'form' | 'interview' | 'organization_contact';
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  requestedChanges?: string;
}

export class CommunityServiceEngine {
  
  // Log community service hours
  async logServiceHours(submission: CommunityServiceSubmission) {
    console.log(`🏥 Logging community service for user ${submission.userId}: ${submission.hoursLogged} hours`);
    
    try {
      // Insert the service log
      const [serviceLog] = await db.insert(communityServiceLogs)
        .values({
          userId: submission.userId,
          schoolId: submission.schoolId,
          serviceName: submission.serviceName,
          serviceDescription: submission.serviceDescription,
          organizationName: submission.organizationName,
          contactPerson: submission.contactPerson,
          contactEmail: submission.contactEmail,
          contactPhone: submission.contactPhone,
          hoursLogged: submission.hoursLogged.toString(),
          serviceDate: submission.serviceDate,
          location: submission.location,
          category: submission.category,
          studentReflection: submission.studentReflection,
          photoEvidence: submission.photoEvidence,
          verificationStatus: 'pending',
          tokensEarned: 0, // Tokens awarded after verification
          parentNotified: false,
        })
        .returning();

      // Update or create student service summary
      await this.updateStudentSummary(submission.userId, submission.hoursLogged, 'pending');
      
      // 📧 Send parent notification email
      try {
        const studentInfo = await db.select().from(users).where(eq(users.id, submission.userId));
        if (studentInfo.length > 0) {
          const student = studentInfo[0];
          
          // Dynamically import email service to avoid circular dependency
          const { emailService } = await import('../services/emailService');
          
          // Send notification to parent (using demo data for parent info)
          const emailSent = await emailService.sendServiceHoursNotificationEmail({
            parentEmail: `parent+${student.id}@example.edu`, // Demo email format
            parentName: 'Parent Guardian',
            studentFirstName: student.firstName || 'Student',
            schoolName: 'Burlington Christian Academy',
            serviceName: submission.serviceName,
            hoursLogged: submission.hoursLogged,
            serviceDate: submission.serviceDate,
            organizationName: submission.organizationName,
            studentReflection: submission.studentReflection,
            category: submission.category
          });

          if (emailSent) {
            // Mark as parent notified
            await db.update(communityServiceLogs)
              .set({ parentNotified: true })
              .where(eq(communityServiceLogs.id, serviceLog.id));
            console.log('✅ Parent notification email sent successfully');
          }
        }
      } catch (emailError) {
        console.error('⚠️ Failed to send parent notification email:', emailError);
        // Don't throw error as the main logging was successful
      }
      
      console.log(`✅ Service hours logged successfully: ${serviceLog.id}`);
      return serviceLog;
      
    } catch (error) {
      console.error('❌ Error logging service hours:', error);
      throw error;
    }
  }

  // Update student service summary totals
  async updateStudentSummary(userId: string, hours: number, status: 'pending' | 'verified' | 'rejected') {
    try {
      // Check if summary exists
      const existingSummary = await db.select()
        .from(studentServiceSummaries)
        .where(eq(studentServiceSummaries.userId, userId));

      if (existingSummary.length === 0) {
        // Create new summary
        await db.insert(studentServiceSummaries)
          .values({
            userId,
            totalHours: status === 'pending' ? hours.toString() : '0',
            verifiedHours: status === 'verified' ? hours.toString() : '0',
            pendingHours: status === 'pending' ? hours.toString() : '0',
            totalTokensEarned: status === 'verified' ? Math.floor(hours * 5) : 0,
            lastServiceDate: new Date(),
            lastUpdated: new Date()
          });
      } else {
        // Update existing summary
        const current = existingSummary[0];
        const currentTotal = parseFloat((current.totalHours || 0).toString());
        const currentVerified = parseFloat((current.verifiedHours || 0).toString());
        const currentPending = parseFloat((current.pendingHours || 0).toString());

        let newTotal = currentTotal;
        let newVerified = currentVerified;
        let newPending = currentPending;

        if (status === 'pending') {
          newTotal += hours;
          newPending += hours;
        } else if (status === 'verified') {
          newVerified += hours;
          // Move from pending to verified (assume it was pending before)
          newPending = Math.max(0, newPending - hours);
        }

        const tokensFromVerified = Math.floor(newVerified * 5);

        await db.update(studentServiceSummaries)
          .set({
            totalHours: newTotal.toString(),
            verifiedHours: newVerified.toString(),
            pendingHours: newPending.toString(),
            totalTokensEarned: tokensFromVerified,
            lastServiceDate: new Date(),
            lastUpdated: new Date()
          })
          .where(eq(studentServiceSummaries.userId, userId));
      }
    } catch (error) {
      console.error('❌ Error updating student summary:', error);
    }
  }

  // Verify service hours (approve/reject)
  async verifyServiceHours(request: ServiceVerificationRequest) {
    console.log(`🔍 Verifying service hours: ${request.serviceLogId} by ${request.verifierId}`);
    
    try {
      // Create verification record
      const [verification] = await db.insert(communityServiceVerifications)
        .values({
          serviceLogId: request.serviceLogId,
          verifierType: request.verifierType,
          verifierId: request.verifierId,
          verificationMethod: request.verificationMethod,
          status: request.status,
          feedback: request.feedback,
          requestedChanges: request.requestedChanges,
          followUpRequired: request.status === 'rejected' && !!request.requestedChanges,
          verifiedAt: request.status !== 'pending' ? new Date() : null
        })
        .returning();

      // Update service log status
      const tokensToAward = request.status === 'approved' ? 5 : 0; // 5 tokens per verified hour
      
      await db.update(communityServiceLogs)
        .set({
          verificationStatus: request.status === 'approved' ? 'approved' : 'rejected',
          verifiedBy: request.verifierId,
          verifiedAt: request.status === 'approved' ? new Date() : null,
          verificationNotes: request.feedback,
          tokensEarned: tokensToAward,
          parentNotified: false, // Will trigger notification
          updatedAt: new Date()
        })
        .where(eq(communityServiceLogs.id, request.serviceLogId));

      // If approved, award tokens and update summary
      if (request.status === 'approved') {
        const serviceLog = await db.select()
          .from(communityServiceLogs)
          .where(eq(communityServiceLogs.id, request.serviceLogId));

        if (serviceLog.length > 0) {
          const hours = parseFloat(serviceLog[0].hoursLogged.toString());
          const userId = serviceLog[0].userId;
          
          // Award tokens to user
          await this.awardTokensForService(userId, Math.floor(hours * 5));
          
          // Update student summary 
          await this.updateStudentSummary(userId, hours, 'verified');
        }
      }

      console.log(`✅ Service verification completed: ${verification.id}`);
      return verification;
      
    } catch (error) {
      console.error('❌ Error verifying service hours:', error);
      throw error;
    }
  }

  // Award tokens for verified service hours
  async awardTokensForService(userId: string, tokens: number) {
    try {
      const userTokenRecord = await db.select()
        .from(userTokens)
        .where(eq(userTokens.userId, userId));

      if (userTokenRecord.length > 0) {
        await db.update(userTokens)
          .set({
            echoBalance: sql`${userTokens.echoBalance} + ${tokens}`,
            totalEarned: sql`${userTokens.totalEarned} + ${tokens}`,
            lastActive: new Date()
          })
          .where(eq(userTokens.userId, userId));

        console.log(`🏆 Awarded ${tokens} tokens for community service to user ${userId}`);
      }
    } catch (error) {
      console.error('❌ Error awarding service tokens:', error);
    }
  }

  // Get student's service hours summary
  async getStudentServiceSummary(userId: string) {
    try {
      const summary = await db.select()
        .from(studentServiceSummaries)
        .where(eq(studentServiceSummaries.userId, userId));

      if (summary.length === 0) {
        // Ensure user exists first
        const existingUser = await db.select().from(users).where(eq(users.id, userId));
        if (existingUser.length === 0) {
          try {
            // Create demo user for service hours
            await db.insert(users).values({
              email: `${userId}@demo.echoDeed.com`,
              firstName: 'Sarah',
              lastName: 'Chen',
              schoolRole: 'student',
              schoolId: 'bc016cad-fa89-44fb-aab0-76f82c574f78', // Burlington Christian Academy
              grade: '9th'
            });
            console.log(`✅ Created demo user for service hours: ${userId}`);
          } catch (insertError: any) {
            // User might already exist with different ID, try to find by email
            if (insertError.code === '23505') {
              console.log(`⚠️ User email already exists, using existing user for ${userId}`);
            } else {
              throw insertError;
            }
          }
        }

        // Create default summary if it doesn't exist
        const [newSummary] = await db.insert(studentServiceSummaries)
          .values({
            userId,
            totalHours: '0.00',
            verifiedHours: '0.00',
            pendingHours: '0.00',
            rejectedHours: '0.00',
            totalTokensEarned: 0,
            totalServiceSessions: 0,
            currentStreak: 0,
            longestStreak: 0
          })
          .returning();
        
        // Transform field names to match frontend expectations
        return {
          ...newSummary,
          totalHoursCompleted: newSummary.totalHours,
          totalHoursVerified: newSummary.verifiedHours,
          totalHoursPending: newSummary.pendingHours,
          totalHoursRejected: newSummary.rejectedHours
        };
      }

      // Transform field names to match frontend expectations
      const s = summary[0];
      return {
        ...s,
        totalHoursCompleted: s.totalHours,
        totalHoursVerified: s.verifiedHours,
        totalHoursPending: s.pendingHours,
        totalHoursRejected: s.rejectedHours
      };
    } catch (error) {
      console.error('❌ Error getting student summary:', error);
      throw error;
    }
  }

  // Get student's service log history
  async getStudentServiceLogs(userId: string, limit = 20) {
    try {
      return await db.select()
        .from(communityServiceLogs)
        .where(eq(communityServiceLogs.userId, userId))
        .orderBy(desc(communityServiceLogs.serviceDate))
        .limit(limit);
    } catch (error) {
      console.error('❌ Error getting service logs:', error);
      throw error;
    }
  }

  // Get pending verifications for teachers/admins
  async getPendingVerifications(schoolId?: string, verifierType?: string) {
    try {
      console.log('🔍 Getting pending verifications for schoolId:', schoolId);
      
      let conditions = eq(communityServiceLogs.verificationStatus, 'pending');

      if (schoolId) {
        conditions = and(
          eq(communityServiceLogs.verificationStatus, 'pending'),
          eq(communityServiceLogs.schoolId, schoolId)
        );
      }

      const results = await db.select({
        serviceLog: communityServiceLogs,
        student: users
      })
      .from(communityServiceLogs)
      .leftJoin(users, eq(users.id, communityServiceLogs.userId))
      .where(conditions)
      .orderBy(desc(communityServiceLogs.createdAt));
      
      console.log('✅ Found', results.length, 'pending service logs');
      
      return results;
    } catch (error) {
      console.error('❌ Error getting pending verifications:', error);
      throw error;
    }
  }

  // Get recently approved/verified service hours for teachers
  async getRecentlyApprovedHours(schoolId?: string, limit = 20) {
    try {
      let conditions = eq(communityServiceLogs.verificationStatus, 'approved');

      if (schoolId) {
        conditions = and(
          eq(communityServiceLogs.verificationStatus, 'approved'),
          eq(communityServiceLogs.schoolId, schoolId)
        );
      }

      return await db.select({
        serviceLog: communityServiceLogs,
        student: users
      })
      .from(communityServiceLogs)
      .leftJoin(users, eq(users.id, communityServiceLogs.userId))
      .where(conditions)
      .orderBy(desc(communityServiceLogs.verifiedAt))
      .limit(limit);
    } catch (error) {
      console.error('❌ Error getting recently approved hours:', error);
      throw error;
    }
  }

  // Generate service hours report for school
  async generateSchoolServiceReport(schoolId: string) {
    try {
      const report = await db.select({
        totalStudents: sql<number>`count(distinct ${studentServiceSummaries.userId})`,
        totalHoursVerified: sql<number>`sum(${studentServiceSummaries.totalHoursVerified}::numeric)`,
        totalHoursPending: sql<number>`sum(${studentServiceSummaries.totalHoursPending}::numeric)`,
        studentsAtGoal: sql<number>`count(case when ${studentServiceSummaries.goalProgress}::numeric >= 100 then 1 end)`,
        averageProgress: sql<number>`avg(${studentServiceSummaries.goalProgress}::numeric)`,
        totalTokensAwarded: sql<number>`sum(${studentServiceSummaries.tokensEarnedFromService})`
      })
      .from(studentServiceSummaries)
      .where(eq(studentServiceSummaries.schoolId, schoolId));

      return report[0] || {
        totalStudents: 0,
        totalHoursVerified: 0,
        totalHoursPending: 0,
        studentsAtGoal: 0,
        averageProgress: 0,
        totalTokensAwarded: 0
      };
    } catch (error) {
      console.error('❌ Error generating school report:', error);
      throw error;
    }
  }
}

export const communityServiceEngine = new CommunityServiceEngine();