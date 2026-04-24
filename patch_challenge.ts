import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

const tBotTarget = `       // Handle User ON/OFF Triggers
       if (text === '🔔 Turn ON Predictions') {`;
       
const tBotRepl = `
       // Challenge Mode Routing
       if (userModeStates[chatId]?.step === 'AWAITING_BALANCE') {
           const bal = parseInt((text || '').replace(/[^0-9]/g, ''));
           if (isNaN(bal) || bal < 50) {
               bot?.sendMessage(chatId, "⚠️ নূন্যতম ব্যালেন্স 50 টাকা হতে হবে। আপনার ব্যালেন্স অংকে লিখুন:");
               return;
           }
           userModeStates[chatId].step = 'AWAITING_TARGET';
           userModeStates[chatId].balance = bal;
           bot?.sendMessage(chatId, "🎯 আপনার টার্গেট প্রফিট (Target Profit) কতো? অংকে লিখুন:");
           return;
       }
       if (userModeStates[chatId]?.step === 'AWAITING_TARGET') {
           const target = parseInt((text || '').replace(/[^0-9]/g, ''));
           if (isNaN(target) || target <= userModeStates[chatId].balance) {
               bot?.sendMessage(chatId, "⚠️ টার্গেট অবশ্যই ব্যালেন্স এর থেকে বেশি হতে হবে! সঠিক টার্গেট লিখুন:");
               return;
           }
           
           const bal = userModeStates[chatId].balance;
           // Calculate 5 step martingale: 1+2+4+8+16 = 31 parts
           const baseBet = Math.max(1, Math.floor(bal / 31));
           const series = [baseBet, baseBet*2, baseBet*4, baseBet*8, baseBet*16];
           
           userChallenges[chatId] = {
               balance: bal,
               target: target,
               currentLossStep: 0,
               maxSteps: 5,
               betSeries: series
           };
           delete userModeStates[chatId];
           
           // Turn on signals for this user
           if (!adminData.telegramSubscribers.includes(chatId)) {
               adminData.telegramSubscribers.push(chatId);
               await saveAdminData(adminData);
           }
           
           const calcMsg = \`✅ *চ্যালেঞ্জ অ্যাক্টিভ করা হয়েছে!* 🚀\n\n📌 আপনার ব্যালেন্স: ৳\${bal}\n🎯 লক্ষ্য: ৳\${target}\n\n🤖 *বট এর 5 টি ফান্ডিং স্টেপ:*\n> Step 1: ৳\${series[0]}\n> Step 2: ৳\${series[1]}\n> Step 3: ৳\${series[2]}\n> Step 4: ৳\${series[3]}\n> Step 5: ৳\${series[4]}\n\nসবসময় স্টেপ ফলো করে ট্রেড করবেন। বট এখন সিগন্যাল দিবে!\`;
           bot?.sendMessage(chatId, calcMsg, { parse_mode: 'Markdown' });
           return;
       }

       // Handle User ON/OFF Triggers
       if (text === '🔔 Turn ON Predictions') {`;

content = content.replace(tBotTarget, tBotRepl);

// Add the Challenge menu
const startTarget = `    bot.onText(/\\/start/, async (msg) => {`;
const startRepl = `    bot.onText(/\\/challenge/, async (msg) => {
        const chatId = msg.chat.id;
        userModeStates[chatId] = { step: 'AWAITING_BALANCE' };
        bot?.sendMessage(chatId, "🎮 *টার্গেট চ্যালেঞ্জ মোড* 🎮\\n\\nআপনার বর্তমান ব্যালেন্স কতো টাকা আছে? (অংকে লিখুন)", { parse_mode: 'Markdown' });
    });

    bot.onText(/\\/start/, async (msg) => {`;
    
content = content.replace(startTarget, startRepl);

fs.writeFileSync('server.ts', content);
console.log("Challenge logic added.");
