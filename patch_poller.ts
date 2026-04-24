import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

// 2. Patch startMarketPoller to collect daily stats and shutdown
const pollerTarget = `         if (!latestItem) return;
         
         const latestIssue = {`;
const pollerRepl = `         if (!latestItem) return;

         const now = new Date();
         const currUTC = now.getTime();
         const currBSTOffset = 6 * 60 * 60 * 1000;
         const dBST = new Date(currUTC + currBSTOffset);
         const hours = dBST.getUTCHours();
         
         // SLEEP FROM 3AM to 5AM BST
         if (hours >= 3 && hours < 5) {
             return;
         }
         
         // Notify at 2AM last minute or somewhere block
         if (hours === 5) { isSleepNotified = false; dailySignalsCount = 0; dailyWinsCount = 0; }
         if (hours === 2 && dBST.getUTCMinutes() >= 58 && !isSleepNotified) {
             const adminData = await getAdminData();
             const subs = adminData.telegramSubscribers || [];
             isSleepNotified = true;
             for(const sub of subs) {
                 try {
                     bot?.sendMessage(sub, \`⚠️ *Update from DEVIL RASHED AI* ⚠️\n\nআজকে সারাদিন আমাদের বট এর 🎯 *\${dailySignalsCount}* টা সিগন্যাল আর 🏆 *\${dailyWinsCount}* টা উইন দিয়েছে!\n\nবটের ব্রেইন একটু রেস্ট নিবে এখন, মার্কেট রিফ্রেশ হবে। বট আগামী ২ ঘণ্টা (৩:০০ থেকে ৫:০০ টা পর্যন্ত) বন্ধ থাকবে!\nকালকে আবার আগুন হবে! 🔥\`, { parse_mode: 'Markdown' });
                 } catch(e){}
             }
         }
         
         const latestIssue = {`;

content = content.replace(pollerTarget, pollerRepl);

// 3. Patch win/loss counters
const statTarget = `             if (nextPrediction && nextPrediction.issue === latestIssue.issueNumber) {
                 winMatched = nextPrediction.suggest !== 'SKIP' && ((latestIssue.size === nextPrediction.suggest) || (latestIssue.size === (latestIssue.number >= 5 ? 'Big' : 'Small') && (latestIssue.number >= 5 ? 'Big' : 'Small') === nextPrediction.suggest));`;
                 
const statRepl = `             if (nextPrediction && nextPrediction.issue === latestIssue.issueNumber) {
                 winMatched = nextPrediction.suggest !== 'SKIP' && ((latestIssue.size === nextPrediction.suggest) || (latestIssue.size === (latestIssue.number >= 5 ? 'Big' : 'Small') && (latestIssue.number >= 5 ? 'Big' : 'Small') === nextPrediction.suggest));
                 
                 if (nextPrediction.suggest !== 'SKIP') {
                     dailySignalsCount++;
                     if (winMatched) dailyWinsCount++;
                 }`;

content = content.replace(statTarget, statRepl);


fs.writeFileSync('server.ts', content);
console.log("Stats logic patched");
