import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

const pollerStart = `         if (lastTrackedIssue !== latestIssue.issueNumber) {
             const adminData = await getAdminData();
             if (adminData.maintenanceMode) return;`;

const newPollerStart = `         if (lastTrackedIssue !== latestIssue.issueNumber) {
             const adminData = await getAdminData();

             if (_quotaExceeded) {
                 if (!(global as any).quotaLockNotified) {
                     const subs = adminData.telegramSubscribers || [];
                     for (const chatId of subs) {
                         bot?.sendMessage(chatId, "⚠️ *Firebase Quota Exceeded/Database Locked!* ⚠️\\n\\nবটের ডাটাবেস এর ডেইলি লিমিট শেষ হয়ে গেছে বা ফায়ারবেসের সংযোগ বিচ্ছিন্ন। Quota reset হওয়ার পর আবার স্বয়ংক্রিয়ভাবে প্রেডিকশন শুরু হবে। সাময়িক অসুবিধার জন্য দুঃখিত!", { parse_mode: 'Markdown' }).catch(()=>{});
                     }
                     (global as any).quotaLockNotified = true;
                 }
                 return; // Stop predicting until quota resumes
             }
             (global as any).quotaLockNotified = false; // Reset if resumed

             if (adminData.maintenanceMode) return;`;

content = content.replace(pollerStart, newPollerStart);

// Also update user text commands
const startCommand = `      if (adminData.maintenanceMode && !adminSessions.has(chatId)) {
         bot?.sendMessage(chatId, adminData.maintenanceMessage);
         return;
      }`;
const newStartCommand = `      if (_quotaExceeded && !adminSessions.has(chatId)) {
         bot?.sendMessage(chatId, "⚠️ *Firebase Quota Exceeded/Database Locked!*\\n\\nবটের ডাটাবেস এর ডেইলি লিমিট শেষ হয়ে গেছে। Quota reset হওয়ার পর আবার প্রেডিকশন শুরু হবে। সাময়িক অসুবিধার জন্য দুঃখিত!", { parse_mode: 'Markdown' });
         return;
      }
      if (adminData.maintenanceMode && !adminSessions.has(chatId)) {
         bot?.sendMessage(chatId, adminData.maintenanceMessage);
         return;
      }`;
content = content.replace(startCommand, newStartCommand);

fs.writeFileSync('server.ts', content);
