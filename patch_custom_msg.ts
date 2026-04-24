import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

const nmtTarget = `             const newMsgText = \`💎 *𝗗𝗘𝗩𝗜𝗟 𝗥𝗔𝗦𝗛𝗘𝗗 𝗔𝗜* 💎\\n*━━━━━━━━━━━━━━━━━━━━*\\n> 🔖 *𝗣𝗲𝗿𝗶𝗼𝗱:* \\\`\${nextPrediction.issue}\\\`\\n> 📊 *𝗟𝗲𝘃𝗲𝗹:*  Lvl \${Math.min(globalLossStreak + 1, 6)} Bet\${numStr}\\n\\n🧠 *𝗔𝗜 𝗣𝗿𝗲𝗱𝗶𝗰𝘁𝗶𝗼𝗻:*\\n👉  *\${suggestPretty}*  👈\\n\\n> 🎯 *𝗖𝗼𝗻𝗳𝗶𝗱𝗲𝗻𝗰𝗲:* \\\`\${nextPrediction.confidence?.includes('%') ? nextPrediction.confidence : nextPrediction.confidence + '%'}\\\`\\n> 🛡️ *𝗔𝗻𝗮𝗹𝘆𝘀𝗶𝘀:* \\\`\${advancedAnalysis.signalsUsed?.length || 'Multiple'} Sub-Models Integrated\\\`\\n> ⚡ *𝗦𝗮𝗳𝗲𝘁𝘆:* \\\`\${safeEmo}\\\`\\n*━━━━━━━━━━━━━━━━━━━━*\\n\${marketStatusAlert}\`;
             
             const subs = adminData.telegramSubscribers || [];`;

const nmtRepl = `             
             const subs = adminData.telegramSubscribers || [];
             
             // Challenge Logic to precalculate user specific custom messages
             const customMessages: Record<number, string> = {};
             for(let chId of Object.keys(userChallenges)) {
                 const st = userChallenges[Number(chId)];
                 if (!st) continue;
                 const stepStr = \\\`\\n\\n🎯 *Challenge Bet:* ৳\${st.betSeries[st.currentLossStep]} (Step \${st.currentLossStep + 1})\\\`;
                 customMessages[Number(chId)] = \`💎 *𝗗𝗘𝗩𝗜𝗟 𝗥𝗔𝗦𝗛𝗘𝗗 𝗔𝗜* 💎\\n*━━━━━━━━━━━━━━━━━━━━*\\n> 🔖 *𝗣𝗲𝗿𝗶𝗼𝗱:* \\\`\${nextPrediction.issue}\\\`\\n> 📊 *𝗟𝗲𝘃𝗲𝗹:*  Lvl \${Math.min(globalLossStreak + 1, 6)} Bet\${numStr}\\n\\n🧠 *𝗔𝗜 𝗣𝗿𝗲𝗱𝗶𝗰𝘁𝗶𝗼𝗻:*\\n👉  *\${suggestPretty}*  👈\\n\\n> 🎯 *𝗖𝗼𝗻𝗳𝗶𝗱𝗲𝗻𝗰𝗲:* \\\`\${nextPrediction.confidence?.includes('%') ? nextPrediction.confidence : nextPrediction.confidence + '%'}\\\`\\n> 🛡️ *𝗔𝗻𝗮𝗹𝘆𝘀𝗶𝘀:* \\\`\${advancedAnalysis.signalsUsed?.length || 'Multiple'} Sub-Models Integrated\\\`\\n> ⚡ *𝗦𝗮𝗳𝗲𝘁𝘆:* \\\`\${safeEmo}\\\`\\n*━━━━━━━━━━━━━━━━━━━━*\${stepStr}\\n\${marketStatusAlert}\`;
             }
             
             const newMsgText = \`💎 *𝗗𝗘𝗩𝗜𝗟 𝗥𝗔𝗦𝗛𝗘𝗗 𝗔𝗜* 💎\\n*━━━━━━━━━━━━━━━━━━━━*\\n> 🔖 *𝗣𝗲𝗿𝗶𝗼𝗱:* \\\`\${nextPrediction.issue}\\\`\\n> 📊 *𝗟𝗲𝘃𝗲𝗹:*  Lvl \${Math.min(globalLossStreak + 1, 6)} Bet\${numStr}\\n\\n🧠 *𝗔𝗜 𝗣𝗿𝗲𝗱𝗶𝗰𝘁𝗶𝗼𝗻:*\\n👉  *\${suggestPretty}*  👈\\n\\n> 🎯 *𝗖𝗼𝗻𝗳𝗶𝗱𝗲𝗻𝗰𝗲:* \\\`\${nextPrediction.confidence?.includes('%') ? nextPrediction.confidence : nextPrediction.confidence + '%'}\\\`\\n> 🛡️ *𝗔𝗻𝗮𝗹𝘆𝘀𝗶𝘀:* \\\`\${advancedAnalysis.signalsUsed?.length || 'Multiple'} Sub-Models Integrated\\\`\\n> ⚡ *𝗦𝗮𝗳𝗲𝘁𝘆:* \\\`\${safeEmo}\\\`\\n*━━━━━━━━━━━━━━━━━━━━*\\n\${marketStatusAlert}\`;
`;

content = content.replace(nmtTarget, nmtRepl);

const sndTarget = `                     // Step C: Send new prediction
                     const msg = await bot?.sendMessage(chatId, newMsgText, { parse_mode: 'Markdown' }).catch(()=>{});`;

const sndRepl = `                     // Step C: Send new prediction
                     const msgToSend = customMessages[chatId] ? customMessages[chatId] : newMsgText;
                     const msg = await bot?.sendMessage(chatId, msgToSend, { parse_mode: 'Markdown' }).catch(()=>{});`;

content = content.replace(sndTarget, sndRepl);

fs.writeFileSync('server.ts', content);
console.log("Custom msg appended");
