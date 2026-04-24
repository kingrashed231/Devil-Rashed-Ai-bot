import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

const searchCount = `       // Minimal safe str parsing
       const suggestPretty = nextPrediction.suggest === 'Big' ? '🟩 *B I G* 🟩' : (nextPrediction.suggest === 'Small' ? '🟥 *S M A L L* 🟥' : '🛑 *S K I P* 🛑');
       
       const text = \`💎 *𝗣𝗥𝗘𝗠𝗜𝗨𝗠 𝗦𝗨𝗣𝗘𝗥 𝗕𝗥𝗔𝗜𝗡 𝗔𝗜* 💎\\n*━━━━━━━━━━━━━━━━━━━━*\\n> 🔖 *𝗣𝗲𝗿𝗶𝗼𝗱:* \\\`\${nextPrediction.issue}\\\`\\n> 📊 *𝗟𝗲𝘃𝗲𝗹:*  Lvl \${Math.min(globalLossStreak + 1, 6)} Bet\\n\\n🧠 *𝗔𝗜 𝗣𝗿𝗲𝗱𝗶𝗰𝘁𝗶𝗼𝗻:*\\n👉  *\${suggestPretty}*  👈\\n\\n> 🎯 *𝗖𝗼𝗻𝗳𝗶𝗱𝗲𝗻𝗰𝗲:* \\\`\${nextPrediction.confidence.includes('%') ? nextPrediction.confidence : nextPrediction.confidence + '%'}\\\`\\n> 🛡️ *𝗔𝗻𝗮𝗹𝘆𝘀𝗶𝘀:* \\\`120 Deep ML Variables\\\`\\n> ⚡ \\\`Auto-Learning Enabled\\\`\\n*━━━━━━━━━━━━━━━━━━━━*\\n\\n👉 ⏳ *𝗧𝗶𝗺𝗲 𝗟𝗲𝗳𝘁:* ⏱️ \\\`\${remainingSeconds}s\\\` 🚀\`;`;

const replaceCount = `       // Minimal safe str parsing
       const suggestPretty = nextPrediction.suggest === 'Big' ? '🟩 *B I G* 🟩' : (nextPrediction.suggest === 'Small' ? '🟥 *S M A L L* 🟥' : '🛑 *S K I P* 🛑');
       
       const text = \`💎 *𝗣𝗥𝗘𝗠𝗜𝗨𝗠 𝗦𝗨𝗣𝗘𝗥 𝗕𝗥𝗔𝗜𝗡 𝗔𝗜* 💎\\n*━━━━━━━━━━━━━━━━━━━━*\\n> 🔖 *𝗣𝗲𝗿𝗶𝗼𝗱:* \\\`\${nextPrediction.issue}\\\`\\n> 📊 *𝗟𝗲𝘃𝗲𝗹:*  Lvl \${Math.min(globalLossStreak + 1, 6)} Bet\\n\\n🧠 *𝗔𝗜 𝗣𝗿𝗲𝗱𝗶𝗰𝘁𝗶𝗼𝗻:*\\n👉  *\${suggestPretty}*  👈\\n\\n> 🎯 *𝗖𝗼𝗻𝗳𝗶𝗱𝗲𝗻𝗰𝗲:* \\\`\${nextPrediction.confidence.includes && nextPrediction.confidence.includes('%') ? nextPrediction.confidence : nextPrediction.confidence + '%'}\\\`\\n> 🛡️ *𝗔𝗻𝗮𝗹𝘆𝘀𝗶𝘀:* \\\`Advanced Prediction Engine\\\`\\n> ⚡ *𝗔𝗰𝘁𝗶𝗼𝗻:* \\\`System Armed\\\`\\n*━━━━━━━━━━━━━━━━━━━━*\\n\\n👉 ⏳ *𝗧𝗶𝗺𝗲 𝗟𝗲𝗳𝘁:* ⏱️ \\\`\${remainingSeconds}s\\\` 🚀\`;`;

content = content.replace(searchCount, replaceCount);

fs.writeFileSync('server.ts', content);
console.log("Realtime UI formatting updated as well.");
