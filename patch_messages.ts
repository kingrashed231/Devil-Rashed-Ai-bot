import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

// The main message block
const target1 = `             const safeEmo = advancedAnalysis.safetyMode === 'SAFE' ? '✅ HIGHLY SAFE' : (advancedAnalysis.safetyMode === 'RISKY' ? '⚠️ RISKY PLAY' : '🛑 UNSAFE');
             const suggestPretty = nextPrediction.suggest === 'Big' ? '🟢 *B I G* 🟢' : (nextPrediction.suggest === 'Small' ? '🔴 *S M A L L* 🔴' : '🛑 *S K I P* 🛑');

             const numStr = advancedAnalysis.predictedNumber !== null ? \`\\n> 🎰 *𝗣𝗿𝗼𝗯𝗮𝗯𝗹𝗲 𝗡𝘂𝗺𝗯𝗲𝗿:*  \\\` \${advancedAnalysis.predictedNumber} \\\`\` : '';

             
             const subs = adminData.telegramSubscribers || [];
             const customMessages: Record<number, string> = {};
             // Update logic for challenge users
             for(let chId of Object.keys(userChallenges)) {
                 const st = userChallenges[Number(chId)];
                 if (!st) continue;
                 const stepStr = \`\\n\\n🎯 *Challenge Bet:* ৳\${st.betSeries[st.currentLossStep]} (Step \${st.currentLossStep + 1})\`;
                 customMessages[Number(chId)] = \`💎 *𝗗𝗘𝗩𝗜𝗟 𝗥𝗔𝗦𝗛𝗘𝗗 𝗔𝗜* 💎\\n*━━━━━━━━━━━━━━━━━━━━*\\n> 🔖 *𝗣𝗲𝗿𝗶𝗼𝗱:* \\\`\${nextPrediction.issue}\\\`\\n> 📊 *𝗟𝗲𝘃𝗲𝗹:*  Lvl \${Math.min(globalLossStreak + 1, 6)} Bet\${numStr}\\n\\n🧠 *𝗔𝗜 𝗣𝗿𝗲𝗱𝗶𝗰𝘁𝗶𝗼𝗻:*\\n👉  *\${suggestPretty}*  👈\\n\\n> 🎯 *𝗖𝗼𝗻𝗳𝗶𝗱𝗲𝗻𝗰𝗲:* \\\`\${nextPrediction.confidence?.includes('%') ? nextPrediction.confidence : nextPrediction.confidence + '%'}\\\`\\n> 🛡️ *𝗔𝗻𝗮𝗹𝘆𝘀𝗶𝘀:* \\\`\${advancedAnalysis.signalsUsed?.length || 'Multiple'} Sub-Models Integrated\\\`\\n> ⚡ *𝗦𝗮𝗳𝗲𝘁𝘆:* \\\`\${safeEmo}\\\`\\n*━━━━━━━━━━━━━━━━━━━━*\${stepStr}\\n\${marketStatusAlert}\`;
             }
             
             const newMsgText = \`💎 *𝗗𝗘𝗩𝗜𝗟 𝗥𝗔𝗦𝗛𝗘𝗗 𝗔𝗜* 💎\\n*━━━━━━━━━━━━━━━━━━━━*\\n> 🔖 *𝗣𝗲𝗿𝗶𝗼𝗱:* \\\`\${nextPrediction.issue}\\\`\\n> 📊 *𝗟𝗲𝘃𝗲𝗹:*  Lvl \${Math.min(globalLossStreak + 1, 6)} Bet\${numStr}\\n\\n🧠 *𝗔𝗜 𝗣𝗿𝗲𝗱𝗶𝗰𝘁𝗶𝗼𝗻:*\\n👉  *\${suggestPretty}*  👈\\n\\n> 🎯 *𝗖𝗼𝗻𝗳𝗶𝗱𝗲𝗻𝗰𝗲:* \\\`\${nextPrediction.confidence?.includes('%') ? nextPrediction.confidence : nextPrediction.confidence + '%'}\\\`\\n> 🛡️ *𝗔𝗻𝗮𝗹𝘆𝘀𝗶𝘀:* \\\`\${advancedAnalysis.signalsUsed?.length || 'Multiple'} Sub-Models Integrated\\\`\\n> ⚡ *𝗦𝗮𝗳𝗲𝘁𝘆:* \\\`\${safeEmo}\\\`\\n*━━━━━━━━━━━━━━━━━━━━*\\n\${marketStatusAlert}\`;`;

const repl1 = `             const safeEmo = advancedAnalysis.safetyMode === 'SAFE' ? '🟢 SAFE' : (advancedAnalysis.safetyMode === 'RISKY' ? '⚠️ RISKY' : '🛑 UNSAFE');
             const suggestPretty = nextPrediction.suggest === 'Big' ? '🟩 *𝗕 𝗜 𝗚* 🟩' : (nextPrediction.suggest === 'Small' ? '🟥 *𝗦 𝗠 𝗔 𝗟 𝗟* 🟥' : '🛑 *𝗦 𝗞 𝗜 𝗣* 🛑');

             let numStr = '';
             let confVal = parseInt(String(nextPrediction.confidence).replace(/[^0-9]/g, ''));
             if (advancedAnalysis.predictedNumber !== null && confVal > 75) {
                 const extraNum = advancedAnalysis.predictedNumber === 9 ? 8 : (advancedAnalysis.predictedNumber === 0 ? 1 : advancedAnalysis.predictedNumber + 1);
                 numStr = \`\\n\\n 🎰 *𝗣𝗿𝗼𝗯𝗮𝗯𝗹𝗲 𝗡𝘂𝗺𝗯𝗲𝗿:* [ \${advancedAnalysis.predictedNumber}, \${extraNum} ]\`;
             }

             const subs = adminData.telegramSubscribers || [];
             const customMessages: Record<number, string> = {};
             
             for(let chId of Object.keys(userChallenges)) {
                 const st = userChallenges[Number(chId)];
                 if (!st) continue;
                 const stepStr = \`\\n\\n🎯 *𝗖𝗵𝗮𝗹𝗹𝗲𝗻𝗴𝗲 𝗕𝗲𝘁:* ৳\${st.betSeries[st.currentLossStep]} (Step \${st.currentLossStep + 1})\`;
                 customMessages[Number(chId)] = \`👑 *𝗗𝗘𝗩𝗜𝗟 𝗥𝗔𝗦𝗛𝗘𝗗 𝗔𝗜 𝗣𝗥𝗢* 👑\\n✦ ━━━━━━━━━━━━━━━━ ✦\\n 🔖 *𝗣𝗲𝗿𝗶𝗼𝗱:* \\\`\${nextPrediction.issue}\\\`\\n 📊 *𝗟𝗲𝘃𝗲𝗹:* \\\`Lvl \${Math.min(globalLossStreak + 1, 6)} Bet\\\`\\n\\n 🧠 *𝗔𝗜 𝗣𝗿𝗲𝗱𝗶𝗰𝘁𝗶𝗼𝗻:*\\n 👉  *\${suggestPretty}*  👈\${numStr}\\n\\n 🔮 *𝗖𝗼𝗻𝗳𝗶𝗱𝗲𝗻𝗰𝗲:* \\\`\${confVal}%\\\`\\n 📈 *𝗦𝗮𝗳𝗲𝘁𝘆:* \\\`\${safeEmo}\\\`\\n 🛡️ *𝗔𝗻𝗮𝗹𝘆𝘀𝗶𝘀:* \\\`\${advancedAnalysis.signalsUsed?.length || 5} Market Patterns\\\`\\n✦ ━━━━━━━━━━━━━━━━ ✦\${stepStr}\\n\${marketStatusAlert}\`;
             }
             
             const newMsgText = \`👑 *𝗗𝗘𝗩𝗜𝗟 𝗥𝗔𝗦𝗛𝗘𝗗 𝗔𝗜 𝗣𝗥𝗢* 👑\\n✦ ━━━━━━━━━━━━━━━━ ✦\\n 🔖 *𝗣𝗲𝗿𝗶𝗼𝗱:* \\\`\${nextPrediction.issue}\\\`\\n 📊 *𝗟𝗲𝘃𝗲𝗹:* \\\`Lvl \${Math.min(globalLossStreak + 1, 6)} Bet\\\`\\n\\n 🧠 *𝗔𝗜 𝗣𝗿𝗲𝗱𝗶𝗰𝘁𝗶𝗼𝗻:*\\n 👉  *\${suggestPretty}*  👈\${numStr}\\n\\n 🔮 *𝗖𝗼𝗻𝗳𝗶𝗱𝗲𝗻𝗰𝗲:* \\\`\${confVal}%\\\`\\n 📈 *𝗦𝗮𝗳𝗲𝘁𝘆:* \\\`\${safeEmo}\\\`\\n 🛡️ *𝗔𝗻𝗮𝗹𝘆𝘀𝗶𝘀:* \\\`\${advancedAnalysis.signalsUsed?.length || 5} Market Patterns\\\`\\n✦ ━━━━━━━━━━━━━━━━ ✦\\n\${marketStatusAlert}\`;`;

const target2 = `      // Minimal safe str parsing
      const suggestPretty = nextPrediction.suggest === 'Big' ? '🟩 *B I G* 🟩' : (nextPrediction.suggest === 'Small' ? '🟥 *S M A L L* 🟥' : '🛑 *S K I P* 🛑');
      
      const text = \`💎 *𝗗𝗘𝗩𝗜𝗟 𝗥𝗔𝗦𝗛𝗘𝗗 𝗔𝗜* 💎\\n*━━━━━━━━━━━━━━━━━━━━*\\n> 🔖 *𝗣𝗲𝗿𝗶𝗼𝗱:* \\\`\${nextPrediction.issue}\\\`\\n> 📊 *𝗟𝗲𝘃𝗲𝗹:*  Lvl \${Math.min(globalLossStreak + 1, 6)} Bet\\n\\n🧠 *𝗔𝗜 𝗣𝗿𝗲𝗱𝗶𝗰𝘁𝗶𝗼𝗻:*\\n👉  *\${suggestPretty}*  👈\\n\\n> 🎯 *𝗖𝗼𝗻𝗳𝗶𝗱𝗲𝗻𝗰𝗲:* \\\`\${String(nextPrediction.confidence).includes('%') ? nextPrediction.confidence : nextPrediction.confidence + '%'}\\\`\\n> 🛡️ *𝗔𝗻𝗮𝗹𝘆𝘀𝗶𝘀:* \\\`Advanced Prediction Engine\\\`\\n> ⚡ *𝗔𝗰𝘁𝗶𝗼𝗻:* \\\`System Armed\\\`\\n*━━━━━━━━━━━━━━━━━━━━*\\n\\n👉 ⏳ *𝗧𝗶𝗺𝗲 𝗟𝗲𝗳𝘁:* ⏱️ \\\`\${remainingSeconds}s\\\` 🚀\`;`;

const repl2 = `      // Minimal safe str parsing
      const suggestPretty = nextPrediction.suggest === 'Big' ? '🟩 *𝗕 𝗜 𝗚* 🟩' : (nextPrediction.suggest === 'Small' ? '🟥 *𝗦 𝗠 𝗔 𝗟 𝗟* 🟥' : '🛑 *𝗦 𝗞 𝗜 𝗣* 🛑');
      let confVal = parseInt(String(nextPrediction.confidence).replace(/[^0-9]/g, ''));
      const text = \`👑 *𝗗𝗘𝗩𝗜𝗟 𝗥𝗔𝗦𝗛𝗘𝗗 𝗔𝗜 𝗣𝗥𝗢* 👑\\n✦ ━━━━━━━━━━━━━━━━ ✦\\n 🔖 *𝗣𝗲𝗿𝗶𝗼𝗱:* \\\`\${nextPrediction.issue}\\\`\\n 📊 *𝗟𝗲𝘃𝗲𝗹:* \\\`Lvl \${Math.min(globalLossStreak + 1, 6)} Bet\\\`\\n\\n 🧠 *𝗔𝗜 𝗣𝗿𝗲𝗱𝗶𝗰𝘁𝗶𝗼𝗻:*\\n 👉  *\${suggestPretty}*  👈\\n\\n 🔮 *𝗖𝗼𝗻𝗳𝗶𝗱𝗲𝗻𝗰𝗲:* \\\`\${confVal}%\\\`\\n ⚡ *𝗔𝗰𝘁𝗶𝗼𝗻:* \\\`System Armed\\\`\\n✦ ━━━━━━━━━━━━━━━━ ✦\\n\\n👉 ⏳ *𝗧𝗶𝗺𝗲 𝗟𝗲𝗳𝘁:* ⏱️ \\\`\${remainingSeconds}s\\\` 🚀\`;`;

// Actually replace
if (content.includes("const suggestPretty = nextPrediction.suggest === 'Big' ? '🟢 *B I G* 🟢'")) {
    content = content.replace(target1, repl1);
    content = content.replace(target2, repl2);
    fs.writeFileSync('server.ts', content);
    console.log("Replaced message formatting");
} else {
    console.log("Could not find targets");
}
