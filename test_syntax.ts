const nextPrediction = { issue: "123", confidence: "99%" };
const numStr = "3";
const globalLossStreak = 1;
const suggestPretty = "Big";
const advancedAnalysis = { signalsUsed: ["Bayesian"] };
const safeEmo = "SAFE";
const stepStr = "Step 1";
const marketStatusAlert = "Alert";

const newMsgText = `💎 *𝗗𝗘𝗩𝗜𝗟 𝗥𝗔𝗦𝗛𝗘𝗗 𝗔𝗜* 💎\n*━━━━━━━━━━━━━━━━━━━━*\n> 🔖 *𝗣𝗲𝗿𝗶𝗼𝗱:* \`${nextPrediction.issue}\`\n> 📊 *𝗟𝗲𝘃𝗲𝗹:*  Lvl ${Math.min(globalLossStreak + 1, 6)} Bet${numStr}\n\n🧠 *𝗔𝗜 𝗣𝗿𝗲𝗱𝗶𝗰𝘁𝗶𝗼𝗻:*\n👉  *${suggestPretty}*  👈\n\n> 🎯 *𝗖𝗼𝗻𝗳𝗶𝗱𝗲𝗻𝗰𝗲:* \`${nextPrediction.confidence?.includes('%') ? nextPrediction.confidence : nextPrediction.confidence + '%'}\`\n> 🛡️ *𝗔𝗻𝗮𝗹𝘆𝘀𝗶𝘀:* \`${advancedAnalysis.signalsUsed?.length || 'Multiple'} Sub-Models Integrated\`\n> ⚡ *𝗦𝗮𝗳𝗲𝘁𝘆:* \`${safeEmo}\`\n*━━━━━━━━━━━━━━━━━━━━*\n${marketStatusAlert}`;
console.log(newMsgText);
