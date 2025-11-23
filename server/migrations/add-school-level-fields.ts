import { sql } from "drizzle-orm";
import db from "../db";

export async function addSchoolLevelFields() {
  console.log("🔄 Adding school_level and applicable_level columns...");
  
  try {
    // Add school_level to schools table
    await db.execute(sql`
      ALTER TABLE schools 
      ADD COLUMN IF NOT EXISTS school_level VARCHAR(20) NOT NULL DEFAULT 'high_school'
    `);
    console.log("✅ Added school_level column to schools table");
    
    // Add applicable_level to admin_rewards table
    await db.execute(sql`
      ALTER TABLE admin_rewards
      ADD COLUMN IF NOT EXISTS applicable_level VARCHAR(20) NOT NULL DEFAULT 'both'
    `);
    console.log("✅ Added applicable_level column to admin_rewards table");
    
    console.log("🎉 Migration completed successfully!");
    return true;
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

if (require.main === module) {
  addSchoolLevelFields()
    .then(() => {
      console.log("Migration complete");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}
