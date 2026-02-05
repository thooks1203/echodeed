import { storage } from '../storage';
import { sendSMS, SMS_TEMPLATES } from './twilioService';

let schedulerInterval: NodeJS.Timeout | null = null;

export async function startSMSReminderScheduler() {
  if (schedulerInterval) {
    console.log('📱 SMS Reminder Scheduler already running');
    return;
  }

  console.log('📱 Starting SMS Reminder Scheduler Service...');
  
  // Check every minute
  schedulerInterval = setInterval(async () => {
    await checkAndSendReminders();
  }, 60 * 1000);

  // Run immediately on start
  await checkAndSendReminders();
  
  console.log('✅ SMS Reminder Scheduler running - checking every minute');
}

export function stopSMSReminderScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('📱 SMS Reminder Scheduler stopped');
  }
}

async function checkAndSendReminders() {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  // Only check on the hour and half hour for efficiency
  if (!['00', '30'].includes(String(now.getMinutes()).padStart(2, '0'))) {
    return;
  }
  
  // For demo purposes, also allow 4:00 PM (16:00) reminders
  const reminderTimes = [currentTime, '16:00'];
  
  for (const reminderTime of reminderTimes) {
    if (reminderTime !== currentTime) continue;
    
    try {
      const usersToRemind = await storage.getUsersForSMSReminders(reminderTime);
      
      if (usersToRemind.length === 0) {
        return;
      }
      
      console.log(`📱 Sending ${usersToRemind.length} SMS reminders for ${reminderTime}`);
      
      for (const user of usersToRemind) {
        try {
          // Check if user already logged today
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todayLog = await storage.getDailyLogForDate(user.id, today);
          
          if (todayLog) {
            // User already logged today, skip
            continue;
          }
          
          // Determine which template to use
          const firstName = user.firstName || 'Friend';
          const messageBody = SMS_TEMPLATES.MOOD_REMINDER(firstName);
          
          if (user.phoneNumber) {
            const result = await sendSMS({
              to: user.phoneNumber,
              body: messageBody,
            });
            
            // Log the reminder
            await storage.logSMSReminder(
              user.id,
              user.phoneNumber,
              'mood',
              result.sid || null
            );
            
            if (result.success) {
              console.log(`✅ SMS sent to ${firstName} (${user.phoneNumber})`);
            } else {
              console.log(`❌ SMS failed for ${firstName}: ${result.error}`);
            }
          }
        } catch (userError) {
          console.error(`Error sending SMS to user ${user.id}:`, userError);
        }
        
        // Rate limiting: wait 100ms between messages
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error('Error in SMS reminder scheduler:', error);
    }
  }
}

export async function sendTestSMS(phoneNumber: string, templateType: 'mood' | 'quest' | 'streak' = 'mood') {
  const templates = {
    mood: SMS_TEMPLATES.MOOD_REMINDER('Test User'),
    quest: SMS_TEMPLATES.QUEST_REMINDER('Test User'),
    streak: SMS_TEMPLATES.STREAK_ALERT('Test User', 5),
  };
  
  const result = await sendSMS({
    to: phoneNumber,
    body: templates[templateType],
  });
  
  return result;
}
