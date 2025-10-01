import { db } from '../server/db';
import { users, userTokens, communityServiceLogs, studentServiceSummaries } from '../shared/schema';
import { eq } from 'drizzle-orm';

/**
 * ONE-TIME SCRIPT: Seed Emma Johnson's demo data into production database
 * Run this once to initialize Emma's 7.5 service hours and tokens
 */
async function seedEmmaData() {
  const studentUserId = 'student-001';
  const schoolId = 'bc016cad-fa89-44fb-aab0-76f82c574f78';

  console.log('🚀 Starting Emma Johnson production data seeding...');
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🗄️  Database: ${process.env.DATABASE_URL?.substring(0, 50)}...`);

  try {
    // 1. Ensure Emma's user record exists
    console.log('\n👤 Creating/verifying Emma Johnson user record...');
    const existingUser = await db.select().from(users).where(eq(users.id, studentUserId));
    
    if (existingUser.length === 0) {
      await db.insert(users).values({
        id: studentUserId,
        firstName: 'Emma',
        lastName: 'Johnson',
        email: 'emma.johnson@bca.edu'
      });
      console.log('✅ Created Emma Johnson user record');
    } else {
      console.log('✅ Emma Johnson user record already exists');
    }

    // 2. Clear any existing data for clean slate
    console.log('\n🧹 Clearing any existing Emma data...');
    await db.delete(communityServiceLogs).where(eq(communityServiceLogs.userId, studentUserId));
    await db.delete(studentServiceSummaries).where(eq(studentServiceSummaries.userId, studentUserId));
    await db.delete(userTokens).where(eq(userTokens.userId, studentUserId));
    console.log('✅ Existing data cleared');

    // 3. Create service logs (7.5 total hours)
    console.log('\n📝 Creating service logs...');
    
    const foodBankLog = await db.insert(communityServiceLogs).values({
      id: crypto.randomUUID(),
      userId: studentUserId,
      schoolId: schoolId,
      serviceName: 'Food Bank Volunteer',
      serviceDescription: 'Helped sort and package food donations for local families',
      organizationName: 'Burlington Community Food Bank',
      contactPerson: 'Ms. Johnson',
      contactEmail: 'volunteer@burlingtonfoodbank.org',
      contactPhone: '(336) 123-4567',
      hoursLogged: 4.5,
      serviceDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      location: 'Burlington, NC',
      category: 'Community Support',
      studentReflection: 'It felt great knowing I helped families have meals. I learned about food insecurity in our community.',
      verificationStatus: 'approved',
      verifiedBy: 'teacher-001',
      verifiedAt: new Date(),
      verificationNotes: 'Excellent community service work!',
      tokensEarned: 22,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    const parkCleanupLog = await db.insert(communityServiceLogs).values({
      id: crypto.randomUUID(),
      userId: studentUserId,
      schoolId: schoolId,
      serviceName: 'Park Cleanup',
      serviceDescription: 'Picked up litter and helped maintain trails at City Park',
      organizationName: 'Burlington Parks & Recreation',
      contactPerson: 'Mr. Williams',
      contactEmail: 'parks@burlington.nc.gov',
      contactPhone: '(336) 222-5555',
      hoursLogged: 3.0,
      serviceDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      location: 'Burlington, NC',
      category: 'Environmental',
      studentReflection: 'Working outside was refreshing and I could see the immediate impact of our work making the park beautiful.',
      verificationStatus: 'approved',
      verifiedBy: 'teacher-001',
      verifiedAt: new Date(),
      verificationNotes: 'Great environmental stewardship!',
      tokensEarned: 15,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    console.log(`✅ Created Food Bank log: 4.5 hours, 22 tokens`);
    console.log(`✅ Created Park Cleanup log: 3.0 hours, 15 tokens`);

    // 4. Create service summary
    console.log('\n📊 Creating service summary...');
    await db.insert(studentServiceSummaries).values({
      id: crypto.randomUUID(),
      userId: studentUserId,
      schoolId: schoolId,
      totalHours: 7.5,
      totalVerified: 7.5,
      totalPending: 0,
      totalRejected: 0,
      goalHours: 30,
      lastServiceDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✅ Service summary created: 7.5 verified hours');

    // 5. Create token record with streak
    console.log('\n💰 Creating token record...');
    await db.insert(userTokens).values({
      id: crypto.randomUUID(),
      userId: studentUserId,
      echoBalance: 1103,
      totalEarned: 1380,
      totalSpent: 277,
      streakDays: 4,
      longestStreak: 4,
      lastActiveDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✅ Token record created: 1103 balance, 1380 earned, 4-day streak');

    // 6. Verify everything was created
    console.log('\n🔍 VERIFICATION:');
    const tokens = await db.select().from(userTokens).where(eq(userTokens.userId, studentUserId));
    const logs = await db.select().from(communityServiceLogs).where(eq(communityServiceLogs.userId, studentUserId));
    const summary = await db.select().from(studentServiceSummaries).where(eq(studentServiceSummaries.userId, studentUserId));

    console.log(`   💰 Tokens: ${tokens[0]?.echoBalance} balance, ${tokens[0]?.totalEarned} earned, ${tokens[0]?.streakDays}/${tokens[0]?.longestStreak} streak`);
    console.log(`   📝 Service Logs: ${logs.length} records`);
    logs.forEach(log => {
      console.log(`      - ${log.serviceName}: ${log.hoursLogged} hours, ${log.tokensEarned} tokens (${log.verificationStatus})`);
    });
    console.log(`   📊 Summary: ${summary[0]?.totalHours} hours verified`);

    console.log('\n✅ PRODUCTION SEEDING COMPLETE!');
    console.log('🌐 Emma Johnson data is now live at www.echodeed.com');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run the seeding
seedEmmaData();
