import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

const searchA = `             const suggestPretty = nextPrediction.suggest === 'Big' ? '🟢 *B I G* 🟢' : '🔴 *S M A L L* 🔴';`;
const replaceA = `             const suggestPretty = nextPrediction.suggest === 'Big' ? '🟢 *B I G* 🟢' : (nextPrediction.suggest === 'Small' ? '🔴 *S M A L L* 🔴' : '🛑 *S K I P (Market Risk)* 🛑');`;

content = content.replace(searchA, replaceA);

const searchB = `             const newMsgText = \`🔥 𝗔𝗗𝗩𝗔𝗡𝗖𝗘𝗗 𝗔𝗜 𝗘𝗡𝗚𝗜𝗡𝗘 🔥\\n━━━━━━━━━━━━━━━━━━━━\\n🔖 𝗣𝗲𝗿𝗶𝗼𝗱: \\\`\${nextPrediction.issue}\\\`\\n\\n🧠 𝗔𝗜 𝗣𝗿𝗲𝗱𝗶𝗰𝘁𝗶𝗼𝗻: \\n👉 \${suggestPretty} 👈\\n\\n⚡ 𝗔𝗰𝗰𝘂𝗿𝗮𝗰𝘆/𝗖𝗼𝗻𝗳𝗶𝗱𝗲𝗻𝗰𝗲: \${nextPrediction.confidence.includes('%') ? nextPrediction.confidence : nextPrediction.confidence + '%'} [\${safeStr}]\\n📊 𝗙𝘂𝗻𝗱 𝗟𝗲𝘃𝗲𝗹: 𝗟𝘃𝗹 \${Math.min(globalLossStreak + 1, 6)}\\n━━━━━━━━━━━━━━━━━━━━\\n⏳ 𝗪𝗮𝗶𝘁𝗶𝗻𝗴 𝗳𝗼𝗿 𝗿𝗲𝘀𝘂𝗹𝘁...\${marketStatusAlert}\`;`;

const replaceB = `             const newMsgText = \`💎 *𝗣𝗥𝗘𝗠𝗜𝗨𝗠 𝗦𝗨𝗣𝗘𝗥 𝗕𝗥𝗔𝗜𝗡 𝗔𝗜* 💎\\n*━━━━━━━━━━━━━━━━━━━━*\\n> 🔖 *𝗣𝗲𝗿𝗶𝗼𝗱:* \\\`\${nextPrediction.issue}\\\`\\n> 📊 *𝗟𝗲𝘃𝗲𝗹:*  Lvl \${Math.min(globalLossStreak + 1, 6)} Bet\\n\\n🧠 *𝗔𝗜 𝗣𝗿𝗲𝗱𝗶𝗰𝘁𝗶𝗼𝗻:*\\n👉  *\${suggestPretty}*  👈\\n\\n> 🎯 *𝗖𝗼𝗻𝗳𝗶𝗱𝗲𝗻𝗰𝗲:* \\\`\${nextPrediction.confidence.includes('%') ? nextPrediction.confidence : nextPrediction.confidence + '%'}\\\`\\n> 🛡️ *𝗔𝗻𝗮𝗹𝘆𝘀𝗶𝘀:* \\\`120 Deep ML Variables\\\`\\n> ⚡ \\\`Auto-Learning Enabled\\\` \${safeStr}\\n*━━━━━━━━━━━━━━━━━━━━*\\n\${marketStatusAlert}\`;`;

content = content.replace(searchB, replaceB);

fs.writeFileSync('server.ts', content);
