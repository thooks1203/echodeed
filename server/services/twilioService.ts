import twilio from 'twilio';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=twilio',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.account_sid || !connectionSettings.settings.api_key || !connectionSettings.settings.api_key_secret)) {
    throw new Error('Twilio not connected');
  }
  return {
    accountSid: connectionSettings.settings.account_sid,
    apiKey: connectionSettings.settings.api_key,
    apiKeySecret: connectionSettings.settings.api_key_secret,
    phoneNumber: connectionSettings.settings.phone_number
  };
}

export async function getTwilioClient() {
  const { accountSid, apiKey, apiKeySecret } = await getCredentials();
  return twilio(apiKey, apiKeySecret, {
    accountSid: accountSid
  });
}

export async function getTwilioFromPhoneNumber() {
  const { phoneNumber } = await getCredentials();
  return phoneNumber;
}

export interface SMSMessage {
  to: string;
  body: string;
}

export async function sendSMS(message: SMSMessage): Promise<{ success: boolean; sid?: string; error?: string }> {
  try {
    const client = await getTwilioClient();
    const fromNumber = await getTwilioFromPhoneNumber();
    
    if (!fromNumber) {
      throw new Error('Twilio phone number not configured');
    }
    
    const result = await client.messages.create({
      body: message.body,
      from: fromNumber,
      to: message.to
    });
    
    console.log(`📱 SMS sent successfully: ${result.sid}`);
    return { success: true, sid: result.sid };
  } catch (error: any) {
    console.error('❌ SMS send failed:', error.message);
    return { success: false, error: error.message };
  }
}

export async function sendBulkSMS(messages: SMSMessage[]): Promise<{ sent: number; failed: number; results: any[] }> {
  const results: any[] = [];
  let sent = 0;
  let failed = 0;
  
  for (const message of messages) {
    const result = await sendSMS(message);
    results.push({ ...message, ...result });
    if (result.success) {
      sent++;
    } else {
      failed++;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`📱 Bulk SMS complete: ${sent} sent, ${failed} failed`);
  return { sent, failed, results };
}

export const SMS_TEMPLATES = {
  MOOD_REMINDER: (name: string) => 
    `Hey ${name}! How are you feeling today? Log your mood in EchoDeed and keep your streak alive! Reply with an emoji: 😊=Great 🙂=Good 😐=Okay 😔=Down 😢=Struggling`,
  
  QUEST_REMINDER: (name: string) => 
    `Great leaders take action! Don't forget to log your kindness act for today to stay on track for the Spring Sprint scholarship, ${name}!`,
  
  STREAK_ALERT: (name: string, days: number) => 
    `🔥 ${name}, you have a ${days}-day streak! Log today to keep it going!`,
  
  MILESTONE: (name: string, tokens: number) => 
    `🎉 Congrats ${name}! You just earned ${tokens} Echo Tokens! Check your rewards in EchoDeed!`
};

export function parseEmojiMood(text: string): number | null {
  const emojiMap: Record<string, number> = {
    '😊': 5, '😄': 5, '🤩': 5, '😁': 5,
    '🙂': 4, '😃': 4, '👍': 4,
    '😐': 3, '😶': 3, '🤔': 3,
    '😔': 2, '😕': 2, '😟': 2,
    '😢': 1, '😞': 1, '😭': 1, '😿': 1
  };
  
  for (const [emoji, score] of Object.entries(emojiMap)) {
    if (text.includes(emoji)) {
      return score;
    }
  }
  
  const numMatch = text.match(/[1-5]/);
  if (numMatch) {
    return parseInt(numMatch[0]);
  }
  
  return null;
}
