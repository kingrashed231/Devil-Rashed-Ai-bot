import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

const sResult = `                 resolvedUpdateText = \`✧⋄⋆⋅⋆⋄✧⋄⋆⋅⋆⋄✧⋄⋆⋅⋆⋄✧\\n👑 𝗗𝗘𝗩𝗜𝗟 𝗥𝗔𝗦𝗛𝗘𝗗 𝗔𝗜 👑\\n        [  𝗥𝗘𝗦𝗨𝗟𝗧  ]\\n✧⋄⋆⋅⋆⋄✧⋄⋆⋅⋆⋄✧⋄⋆⋅⋆⋄✧\\n\\n🔖 𝗣𝗲𝗿𝗶𝗼𝗱: \\\`\${nextPrediction.issue}\\\`\\n🧠 𝗣𝗿𝗲𝗱𝗶𝗰𝘁𝗶𝗼𝗻: \${nextPrediction.suggest === 'Big' ? '🟩 𝗕𝗜𝗚' : (nextPrediction.suggest === 'Small' ? '🟥 𝗦𝗠𝗔𝗟𝗟' : '🛑 𝗦𝗞𝗜𝗣')}\\n🎯 𝗠𝗮𝗿𝗸𝗲𝘁 𝗢𝘂𝘁: \${sizeStr} (\${latestIssue.number}) - \${colorStr}\\n✅ 𝗦𝘁𝗮𝘁𝘂𝘀: *\${nextPrediction.suggest === 'SKIP' ? 'Skip ⚪' : statusText}*\\n\\n⚡ 𝗡𝗲𝘂𝗿𝗮𝗹 𝗡𝗲𝘁𝘄𝗼𝗿𝗸 𝗦𝘆𝗻𝗰𝗲𝗱 ✅\`;`;

const rResult = `                 resolvedUpdateText = \`✧⋄⋆⋅⋆⋄✧⋄⋆⋅⋆⋄✧⋄⋆⋅⋆⋄✧\\n👑  *R E S U L T S*  👑\\n✧⋄⋆⋅⋆⋄✧⋄⋆⋅⋆⋄✧⋄⋆⋅⋆⋄✧\\n\\n🔖 𝗣𝗲𝗿𝗶𝗼𝗱: \\\`\${nextPrediction.issue}\\\`\\n\\n🧠 \${nextPrediction.suggest === 'Big' ? '🟩 𝗕𝗜𝗚' : (nextPrediction.suggest === 'Small' ? '🟥 𝗦𝗠𝗔𝗟𝗟' : '🛑 𝗦𝗞𝗜𝗣')}\\n🎯 \${sizeStr} (\${latestIssue.number}) \${colorStr.replace('Green', '🟢').replace('Red', '🔴').replace('Violet', '🟣')}\\n\\n✅ *\${nextPrediction.suggest === 'SKIP' ? '⚪ NO TRADE (Market Risk)' : statusText}*\n\${winMatched ? \`🔥 𝗔𝗰𝘁𝗶𝘃𝗲 𝗦𝘁𝗿𝗲𝗮𝗸: \${globalWinStreak + 1}x Win 🔥\` : ''}\`;`;

content = content.replace(sResult, rResult);

const sMsg = `             const newMsgText = \`💎 *𝗣𝗥𝗘𝗠𝗜𝗨𝗠 𝗦𝗨𝗣𝗘𝗥 𝗕𝗥𝗔𝗜𝗡 𝗔𝗜* 💎\\n*━━━━━━━━━━━━━━━━━━━━*\\n> 🔖 *𝗣𝗲𝗿𝗶𝗼𝗱:* \\\`\${nextPrediction.issue}\\\`\\n> 📊 *𝗟𝗲𝘃𝗲𝗹:*  Lvl \${Math.min(globalLossStreak + 1, 6)} Bet\\n\\n🧠 *𝗔𝗜 𝗣𝗿𝗲𝗱𝗶𝗰𝘁𝗶𝗼𝗻:*\\n👉  *\${suggestPretty}*  👈\\n\\n> 🎯 *𝗖𝗼𝗻𝗳𝗶𝗱𝗲𝗻𝗰𝗲:* \\\`\${nextPrediction.confidence.includes('%') ? nextPrediction.confidence : nextPrediction.confidence + '%'}\\\`\\n> 🛡️ *𝗔𝗻𝗮𝗹𝘆𝘀𝗶𝘀:* \\\`120 Deep ML Variables\\\`\\n> ⚡ \\\`Auto-Learning Enabled\\\` \${safeStr}\\n*━━━━━━━━━━━━━━━━━━━━*\\n\${marketStatusAlert}\`;`;

const rMsg = `             const newMsgText = \`💎 *𝗣𝗥𝗘𝗠𝗜𝗨𝗠 𝗦𝗨𝗣𝗘𝗥 𝗕𝗥𝗔𝗜𝗡 𝗔𝗜* 💎\\n*━━━━━━━━━━━━━━━━━━━━*\\n> 🔖 *𝗣𝗲𝗿𝗶𝗼𝗱:* \\\`\${nextPrediction.issue}\\\`\\n> 📊 *𝗟𝗲𝘃𝗲𝗹:*  Lvl \${Math.min(globalLossStreak + 1, 6)} Bet\\n\\n🧠 *𝗔𝗜 𝗣𝗿𝗲𝗱𝗶𝗰𝘁𝗶𝗼𝗻:*\\n👉  *\${suggestPretty}*  👈\\n\\n> 🎯 *𝗖𝗼𝗻𝗳𝗶𝗱𝗲𝗻𝗰𝗲:* \\\`\${nextPrediction.confidence.includes('%') ? nextPrediction.confidence : nextPrediction.confidence + '%'}\\\`\\n> 🛡️ *𝗔𝗻𝗮𝗹𝘆𝘀𝗶𝘀:* \\\`120 Deep ML Array\\\`\\n> ⚡ \\\`Auto-Learning Active\\\` \${safeStr}\\n*━━━━━━━━━━━━━━━━━━━━*\\n\${marketStatusAlert}\`;`;

content = content.replace(sMsg, rMsg);

fs.writeFileSync('server.ts', content);
console.log("Formatting injected.");
