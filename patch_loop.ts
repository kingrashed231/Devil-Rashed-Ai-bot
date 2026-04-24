import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

const tTarget = `                 if (nextPrediction.suggest !== 'SKIP') {
                     dailySignalsCount++;
                     if (winMatched) dailyWinsCount++;
                 }`;
                 
const tRepl = `                 if (nextPrediction.suggest !== 'SKIP') {
                     dailySignalsCount++;
                     if (winMatched) dailyWinsCount++;
                     
                     // Challenge Tracking
                     for (const chatIdStr in userChallenges) {
                         const chId = Number(chatIdStr);
                         const cState = userChallenges[chId];
                         if (!cState) continue;
                         
                         const step = cState.currentLossStep;
                         const betAmount = cState.betSeries[step];
                         
                         if (winMatched) {
                            cState.balance += (betAmount * 0.95); // Assuming roughly 1.95x return
                            cState.currentLossStep = 0; // Reset step on win
                         } else {
                            cState.balance -= betAmount;
                            cState.currentLossStep = Math.min(cState.maxSteps - 1, step + 1);
                         }
                         
                         if (cState.balance >= cState.target) {
                             const opts = {
                                 reply_markup: {
                                    inline_keyboard: [
                                        [{text: "👉 আরও প্রেডিকশন চাই", callback_data: "challenge_more"}, {text: "⛔ বন্ধ করুন", callback_data: "challenge_stop"}]
                                    ]
                                 }
                             };
                             bot?.sendMessage(chId, \`🎉 শোনো তোমার টার্গেট আমি পূরণ করেছি ৳\${cState.balance.toFixed(2)} পর্যন্ত!\\n\\n⚠️ কখনোই মার্কেট এ টার্গেট এর বেশি ট্রেড নিবা না! তাহলে তুমি পরে লস করতে পারো। এখন ট্রেড বন্ধ করো এবং প্রফিট ক্যাশ আউট করো।\`, opts);
                             
                             // Unsubscribe to protect them from overtrading
                             if (adminData.telegramSubscribers) {
                                 adminData.telegramSubscribers = adminData.telegramSubscribers.filter((id:any) => id !== chId);
                                 saveAdminData(adminData).catch(()=>{});
                             }
                             delete userChallenges[chId];
                         }
                     }
                 }`;
content = content.replace(tTarget, tRepl);


// Add the callback query listener for the buttons
const cbTarget = `        if (data?.startsWith('adm_')) {
            if (!adminSessions.has(chatId)) return bot?.sendMessage(chatId, "Not authorized.");
        }

        if (data === 'verify_join') {`;
        
const cbRepl = `        if (data?.startsWith('adm_')) {
            if (!adminSessions.has(chatId)) return bot?.sendMessage(chatId, "Not authorized.");
        }
        
        if (data === 'challenge_more') {
            bot?.sendMessage(chatId, "আপনি আবার প্রেডিকশন চালু করতে চাইলে /challenge লিখে নতুন টার্গেট সেট করুন।");
        }
        if (data === 'challenge_stop') {
            bot?.sendMessage(chatId, "প্রেডিকশন বন্ধ রাখা হয়েছে।");
        }

        if (data === 'verify_join') {`;

content = content.replace(cbTarget, cbRepl);

fs.writeFileSync('server.ts', content);
console.log("Challenge loop patched");
