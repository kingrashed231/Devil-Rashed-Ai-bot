import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

const sSuggestPretty = `const suggestPretty = nextPrediction.suggest === 'Big' ? '🟢 *B I G* 🟢' : '🔴 *S M A L L* 🔴';`;
const rSuggestPretty = `const suggestPretty = nextPrediction.suggest === 'Big' ? '🟩 ||𝗕 𝗜 𝗚|| 🟩' : (nextPrediction.suggest === 'Small' ? '🟥 ||𝗦𝗠𝗔𝗟𝗟|| 🟥' : '🛑 ||𝗦𝗞𝗜𝗣|| 🛑');`;

content = content.replace(new RegExp(sSuggestPretty.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&'), 'g'), rSuggestPretty);

const sMsg = `🔥 𝗔𝗗𝗩𝗔𝗡𝗖𝗘𝗗 𝗔𝗜 𝗘𝗡𝗚𝗜𝗡𝗘 🔥
━━━━━━━━━━━━━━━━━━━━
🔖 𝗣𝗲𝗿𝗶𝗼𝗱: \\\`\${nextPrediction.issue}\\\`

🧠 𝗔𝗜 𝗣𝗿𝗲𝗱𝗶𝗰𝘁𝗶𝗼𝗻: 
👉 \${suggestPretty} 👈

⚡ 𝗔𝗰𝗰𝘂𝗿𝗮𝗰𝘆/𝗖𝗼𝗻𝗳𝗶𝗱𝗲𝗻𝗰𝗲: \${nextPrediction.confidence.includes('%') ? nextPrediction.confidence : nextPrediction.confidence + '%'} [\${safeStr}]
📊 𝗙𝘂𝗻𝗱 𝗟𝗲𝘃𝗲𝗹: 𝗟𝘃𝗹 \${Math.min(globalLossStreak + 1, 6)}
━━━━━━━━━━━━━━━━━━━━
⏳ 𝗪𝗮𝗶𝘁𝗶𝗻𝗴 𝗳𝗼𝗿 𝗿𝗲𝘀𝘂𝗹𝘁...\${marketStatusAlert}`;

const rMsg = `💎 *𝗣𝗥𝗘𝗠𝗜𝗨𝗠 𝗦𝗨𝗣𝗘𝗥 𝗕𝗥𝗔𝗜𝗡 𝗔𝗜* 💎
*━━━━━━━━━━━━━━━━━━━━*
> 🔖 *𝗣𝗲𝗿𝗶𝗼𝗱:* \`\${nextPrediction.issue}\`
> 📊 *𝗟𝗲𝘃𝗲𝗹:*  Lvl \${Math.min(globalLossStreak + 1, 6)} Bet

🧠 *𝗔𝗜 𝗣𝗿𝗲𝗱𝗶𝗰𝘁𝗶𝗼𝗻:*
👉  *\${suggestPretty}*  👈

> 🎯 *𝗖𝗼𝗻𝗳𝗶𝗱𝗲𝗻𝗰𝗲:* \`\${nextPrediction.confidence.includes('%') ? nextPrediction.confidence : nextPrediction.confidence + '%'}\`
> 🛡️ *𝗔𝗻𝗮𝗹𝘆𝘀𝗶𝘀:* \`120 Deep Variables\`
> ⚡ \`Auto-Learning Enabled\` \${safeStr}
*━━━━━━━━━━━━━━━━━━━━*\n\${marketStatusAlert}`;

if (content.includes(sMsg)) content = content.replace(sMsg, rMsg);


const sTimerMsg = `🔥 𝗔𝗗𝗩𝗔𝗡𝗖𝗘𝗗 𝗔𝗜 𝗘𝗡𝗚𝗜𝗡𝗘 🔥
━━━━━━━━━━━━━━━━━━━━
🔖 𝗣𝗲𝗿𝗶𝗼𝗱: \\\`\${nextPrediction.issue}\\\`

🧠 𝗔𝗜 𝗣𝗿𝗲𝗱𝗶𝗰𝘁𝗶𝗼𝗻:
👉 \${suggestPretty} 👈

⚡ 𝗔𝗰𝗰𝘂𝗿𝗮𝗰𝘆/𝗖𝗼𝗻𝗳𝗶𝗱𝗲𝗻𝗰𝗲: \${nextPrediction.confidence.includes('%') ? nextPrediction.confidence : nextPrediction.confidence + '%'} 
📊 𝗙𝘂𝗻𝗱 𝗟𝗲𝘃𝗲𝗹: 𝗟𝘃𝗹 \${Math.min(globalLossStreak + 1, 6)}
━━━━━━━━━━━━━━━━━━━━
⏳ 𝗪𝗮𝗶𝘁𝗶𝗻𝗴 𝗳𝗼𝗿 𝗿𝗲𝘀𝘂𝗹𝘁...

⏱️ 𝗧𝗶𝗺𝗲 𝗟𝗲𝗳𝘁: \${remainingSeconds}s 🚀`;

const rTimerMsg = `💎 *𝗣𝗥𝗘𝗠𝗜𝗨𝗠 𝗦𝗨𝗣𝗘𝗥 𝗕𝗥𝗔𝗜𝗡 𝗔𝗜* 💎
*━━━━━━━━━━━━━━━━━━━━*
> 🔖 *𝗣𝗲𝗿𝗶𝗼𝗱:* \`\${nextPrediction.issue}\`
> 📊 *𝗟𝗲𝘃𝗲𝗹:*  Lvl \${Math.min(globalLossStreak + 1, 6)} Bet

🧠 *𝗔𝗜 𝗣𝗿𝗲𝗱𝗶𝗰𝘁𝗶𝗼𝗻:*
👉  *\${suggestPretty}*  👈

> 🎯 *𝗖𝗼𝗻𝗳𝗶𝗱𝗲𝗻𝗰𝗲:* \`\${nextPrediction.confidence.includes('%') ? nextPrediction.confidence : nextPrediction.confidence + '%'}\`
> 🛡️ *𝗔𝗻𝗮𝗹𝘆𝘀𝗶𝘀:* \`120 Deep Variables\`
> ⚡ \`Auto-Learning Enabled\`
*━━━━━━━━━━━━━━━━━━━━*

👉 ⏳ *𝗧𝗶𝗺𝗲 𝗟𝗲𝗳𝘁:* ⏱️ \`\${remainingSeconds}s\` 🚀`;

if (content.includes(sTimerMsg)) content = content.replace(sTimerMsg, rTimerMsg);

fs.writeFileSync('server.ts', content);
console.log("Formatting injected.");
