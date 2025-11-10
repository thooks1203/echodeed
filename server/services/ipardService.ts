import { db } from "../db";
import { 
  communityServiceLogs, 
  ipardPhaseEvents, 
  tokenTransactions, 
  userTokens,
  reflectionSkills,
  reflectionTraits,
  communityServiceLogSkills,
  communityServiceLogTraits
} from "../../shared/schema";
import { eq, and } from "drizzle-orm";

/**
 * v2.1 IPARD Service - Manages bonus token awards for GCS Service-Learning IPARD model
 * 
 * IPARD = Investigation, Preparation, Action, Reflection, Demonstration
 * 
 * Bonus Structure:
 * - Investigation + Preparation (Approval Form): 25 tokens
 * - Reflection (High-Quality, Teacher-Approved): 50 tokens
 * - Demonstration (Share Experience): 75 tokens
 * 
 * Total potential IPARD bonuses: 150 tokens per service experience
 */

const IPARD_BONUSES = {
  APPROVAL_FORM: 25,    // Investigation + Preparation
  REFLECTION: 50,        // Reflection
  DEMONSTRATION: 75,     // Demonstration
} as const;

/**
 * Award 25 bonus tokens for submitting Service-Learning Approval Form
 * This rewards Investigation + Preparation phases
 * 
 * FIXED: Wrapped in transaction to prevent race conditions and duplicate payouts
 */
export async function awardApprovalFormBonus(serviceLogId: string, userId: string) {
  return await db.transaction(async (tx) => {
    // 1. Get service log and validate ownership (with row lock)
    const [serviceLog] = await tx.select().from(communityServiceLogs)
      .where(and(
        eq(communityServiceLogs.id, serviceLogId),
        eq(communityServiceLogs.userId, userId)
      ))
      .for('update'); // Row-level lock to prevent concurrent modifications

    if (!serviceLog) {
      throw new Error('Service log not found or access denied');
    }

    // 2. Check if bonus already awarded (idempotent)
    if (serviceLog.approvalFormSubmitted) {
      return {
        success: false,
        message: 'Approval form bonus already awarded',
        tokensAwarded: 0,
        alreadyEarned: IPARD_BONUSES.APPROVAL_FORM
      };
    }

    // 3. Get user's current token balance (with row lock)
    const [userToken] = await tx.select().from(userTokens)
      .where(eq(userTokens.userId, userId))
      .for('update');

    if (!userToken) {
      throw new Error('User token record not found');
    }

    const balanceBefore = userToken.echoBalance;
    const balanceAfter = balanceBefore + IPARD_BONUSES.APPROVAL_FORM;

    // 4. Update service log with approval form submission
    await tx.update(communityServiceLogs)
      .set({
        approvalFormSubmitted: true,
        approvalFormSubmittedAt: new Date(),
        ipardPhase: 'preparation',
        ipardBonusTokensEarned: (serviceLog.ipardBonusTokensEarned || 0) + IPARD_BONUSES.APPROVAL_FORM,
        updatedAt: new Date()
      })
      .where(eq(communityServiceLogs.id, serviceLogId));

    // 5. Award tokens to user
    await tx.update(userTokens)
      .set({
        echoBalance: balanceAfter,
        totalEarned: userToken.totalEarned + IPARD_BONUSES.APPROVAL_FORM
      })
      .where(eq(userTokens.userId, userId));

    // 6. Record transaction in audit log
    await tx.insert(tokenTransactions).values({
      userId,
      transactionType: 'ipard_bonus',
      amount: IPARD_BONUSES.APPROVAL_FORM,
      sourceId: serviceLogId,
      sourceType: 'service_log',
      description: `IPARD Bonus: Approval Form Submitted (+${IPARD_BONUSES.APPROVAL_FORM} tokens)`,
      balanceBefore,
      balanceAfter,
      createdBy: userId
    });

    // 7. Record IPARD phase event
    await tx.insert(ipardPhaseEvents).values({
      serviceLogId,
      phase: 'preparation',
      actorId: userId,
      notes: 'Service-Learning Approval Form submitted',
      tokensAwarded: IPARD_BONUSES.APPROVAL_FORM
    });

    console.log(`✅ Awarded ${IPARD_BONUSES.APPROVAL_FORM} tokens to user ${userId} for approval form submission`);

    return {
      success: true,
      message: `Earned ${IPARD_BONUSES.APPROVAL_FORM} bonus tokens for submitting your approval form!`,
      tokensAwarded: IPARD_BONUSES.APPROVAL_FORM,
      newBalance: balanceAfter,
      ipardPhase: 'preparation'
    };
  });
}

/**
 * Award 50 bonus tokens for teacher-approved high-quality reflection
 * This rewards the Reflection phase
 * 
 * FIXED: Wrapped in transaction to prevent race conditions and duplicate payouts
 */
export async function awardReflectionBonus(serviceLogId: string, teacherId: string) {
  return await db.transaction(async (tx) => {
    // 1. Get service log (with row lock)
    const [serviceLog] = await tx.select().from(communityServiceLogs)
      .where(eq(communityServiceLogs.id, serviceLogId))
      .for('update');

    if (!serviceLog) {
      throw new Error('Service log not found');
    }

    // 2. Validate reflection exists
    if (!serviceLog.studentReflection || serviceLog.studentReflection.length < 50) {
      throw new Error('High-quality reflection required (minimum 50 characters)');
    }

    // 3. Check if bonus already awarded (idempotent)
    if (serviceLog.reflectionQualityApproved) {
      return {
        success: false,
        message: 'Reflection bonus already awarded',
        tokensAwarded: 0,
        alreadyEarned: IPARD_BONUSES.REFLECTION
      };
    }

    // 4. Get student's current token balance (with row lock)
    const [userToken] = await tx.select().from(userTokens)
      .where(eq(userTokens.userId, serviceLog.userId))
      .for('update');

    if (!userToken) {
      throw new Error('User token record not found');
    }

    const balanceBefore = userToken.echoBalance;
    const balanceAfter = balanceBefore + IPARD_BONUSES.REFLECTION;

    // 5. Update service log with reflection approval
    await tx.update(communityServiceLogs)
      .set({
        reflectionQualityApproved: true,
        reflectionApprovedAt: new Date(),
        ipardPhase: 'reflection',
        ipardBonusTokensEarned: (serviceLog.ipardBonusTokensEarned || 0) + IPARD_BONUSES.REFLECTION,
        updatedAt: new Date()
      })
      .where(eq(communityServiceLogs.id, serviceLogId));

    // 6. Award tokens to student
    await tx.update(userTokens)
      .set({
        echoBalance: balanceAfter,
        totalEarned: userToken.totalEarned + IPARD_BONUSES.REFLECTION
      })
      .where(eq(userTokens.userId, serviceLog.userId));

    // 7. Record transaction in audit log
    await tx.insert(tokenTransactions).values({
      userId: serviceLog.userId,
      transactionType: 'ipard_bonus',
      amount: IPARD_BONUSES.REFLECTION,
      sourceId: serviceLogId,
      sourceType: 'service_log',
      description: `IPARD Bonus: High-Quality Reflection Approved (+${IPARD_BONUSES.REFLECTION} tokens)`,
      balanceBefore,
      balanceAfter,
      createdBy: teacherId
    });

    // 8. Record IPARD phase event
    await tx.insert(ipardPhaseEvents).values({
      serviceLogId,
      phase: 'reflection',
      actorId: teacherId,
      notes: 'High-quality reflection approved by teacher',
      tokensAwarded: IPARD_BONUSES.REFLECTION
    });

    console.log(`✅ Teacher ${teacherId} awarded ${IPARD_BONUSES.REFLECTION} tokens to student ${serviceLog.userId} for reflection`);

    return {
      success: true,
      message: `Awarded ${IPARD_BONUSES.REFLECTION} bonus tokens for high-quality reflection!`,
      tokensAwarded: IPARD_BONUSES.REFLECTION,
      studentId: serviceLog.userId,
      newBalance: balanceAfter,
      ipardPhase: 'reflection'
    };
  });
}

/**
 * Award 75 bonus tokens for submitting demonstration of service experience
 * This rewards the Demonstration phase
 * 
 * FIXED: Wrapped in transaction to prevent race conditions and duplicate payouts
 */
export async function awardDemonstrationBonus(serviceLogId: string, userId: string, demonstrationUrl?: string) {
  // Validate demonstration URL before transaction
  if (!demonstrationUrl || demonstrationUrl.trim().length === 0) {
    throw new Error('Demonstration URL required (photo/link of sharing your experience)');
  }

  return await db.transaction(async (tx) => {
    // 1. Get service log and validate ownership (with row lock)
    const [serviceLog] = await tx.select().from(communityServiceLogs)
      .where(and(
        eq(communityServiceLogs.id, serviceLogId),
        eq(communityServiceLogs.userId, userId)
      ))
      .for('update');

    if (!serviceLog) {
      throw new Error('Service log not found or access denied');
    }

    // 2. Check if bonus already awarded (idempotent)
    if (serviceLog.demonstrationCompleted) {
      return {
        success: false,
        message: 'Demonstration bonus already awarded',
        tokensAwarded: 0,
        alreadyEarned: IPARD_BONUSES.DEMONSTRATION
      };
    }

    // 3. Get user's current token balance (with row lock)
    const [userToken] = await tx.select().from(userTokens)
      .where(eq(userTokens.userId, userId))
      .for('update');

    if (!userToken) {
      throw new Error('User token record not found');
    }

    const balanceBefore = userToken.echoBalance;
    const balanceAfter = balanceBefore + IPARD_BONUSES.DEMONSTRATION;

    // 4. Update service log with demonstration completion
    await tx.update(communityServiceLogs)
      .set({
        demonstrationCompleted: true,
        demonstrationUrl,
        demonstrationCompletedAt: new Date(),
        ipardPhase: 'complete',
        ipardBonusTokensEarned: (serviceLog.ipardBonusTokensEarned || 0) + IPARD_BONUSES.DEMONSTRATION,
        updatedAt: new Date()
      })
      .where(eq(communityServiceLogs.id, serviceLogId));

    // 5. Award tokens to user
    await tx.update(userTokens)
      .set({
        echoBalance: balanceAfter,
        totalEarned: userToken.totalEarned + IPARD_BONUSES.DEMONSTRATION
      })
      .where(eq(userTokens.userId, userId));

    // 6. Record transaction in audit log
    await tx.insert(tokenTransactions).values({
      userId,
      transactionType: 'ipard_bonus',
      amount: IPARD_BONUSES.DEMONSTRATION,
      sourceId: serviceLogId,
      sourceType: 'service_log',
      description: `IPARD Bonus: Demonstration Shared (+${IPARD_BONUSES.DEMONSTRATION} tokens)`,
      balanceBefore,
      balanceAfter,
      createdBy: userId
    });

    // 7. Record IPARD phase event
    await tx.insert(ipardPhaseEvents).values({
      serviceLogId,
      phase: 'demonstration',
      actorId: userId,
      notes: `Demonstration shared: ${demonstrationUrl}`,
      tokensAwarded: IPARD_BONUSES.DEMONSTRATION
    });

    console.log(`✅ Awarded ${IPARD_BONUSES.DEMONSTRATION} tokens to user ${userId} for demonstration submission`);

    return {
      success: true,
      message: `Earned ${IPARD_BONUSES.DEMONSTRATION} bonus tokens for sharing your service experience!`,
      tokensAwarded: IPARD_BONUSES.DEMONSTRATION,
      newBalance: balanceAfter,
      ipardPhase: 'complete',
      totalIpardBonusEarned: (serviceLog.ipardBonusTokensEarned || 0) + IPARD_BONUSES.DEMONSTRATION
    };
  });
}

/**
 * Get all reflection skills and character traits for tagging
 */
export async function getSkillsAndTraits() {
  const [skills, traits] = await Promise.all([
    db.select().from(reflectionSkills).where(eq(reflectionSkills.isActive, true)),
    db.select().from(reflectionTraits).where(eq(reflectionTraits.isActive, true))
  ]);

  return {
    skills: skills.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)),
    traits: traits.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
  };
}

/**
 * Tag a service log with reflection skills and character traits developed
 */
export async function tagServiceLogReflections(serviceLogId: string, skillIds: string[], traitIds: string[]) {
  // 1. Verify service log exists
  const [serviceLog] = await db.select().from(communityServiceLogs)
    .where(eq(communityServiceLogs.id, serviceLogId));

  if (!serviceLog) {
    throw new Error('Service log not found');
  }

  // 2. Delete existing tags (allow re-tagging)
  await Promise.all([
    db.delete(communityServiceLogSkills).where(eq(communityServiceLogSkills.serviceLogId, serviceLogId)),
    db.delete(communityServiceLogTraits).where(eq(communityServiceLogTraits.serviceLogId, serviceLogId))
  ]);

  // 3. Insert new skill tags
  if (skillIds && skillIds.length > 0) {
    await db.insert(communityServiceLogSkills).values(
      skillIds.map(skillId => ({
        serviceLogId,
        skillId
      }))
    );
  }

  // 4. Insert new trait tags
  if (traitIds && traitIds.length > 0) {
    await db.insert(communityServiceLogTraits).values(
      traitIds.map(traitId => ({
        serviceLogId,
        traitId
      }))
    );
  }

  console.log(`🏷️  Tagged service log ${serviceLogId} with ${skillIds.length} skills and ${traitIds.length} traits`);

  return {
    success: true,
    message: 'Reflection tags updated successfully',
    skillsTagged: skillIds.length,
    traitsTagged: traitIds.length
  };
}

// Export all IPARD service functions
export const ipardService = {
  awardApprovalFormBonus,
  awardReflectionBonus,
  awardDemonstrationBonus,
  getSkillsAndTraits,
  tagServiceLogReflections
};
