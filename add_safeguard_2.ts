import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

const sPretty = `const suggestPretty = nextPrediction.suggest === 'Big' ? '🟢 *B I G* 🟢' : '🔴 *S M A L L* 🔴';`;
const rPretty = `const suggestPretty = nextPrediction.suggest === 'Big' ? '🟢 *B I G* 🟢' : (nextPrediction.suggest === 'Small' ? '🔴 *S M A L L* 🔴' : '🛑 *S K I P (Market Risk)* 🛑');`;
content = content.replace(new RegExp(sPretty.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&'), 'g'), rPretty);

const sResult = `🧠 𝗣𝗿𝗲𝗱𝗶𝗰𝘁𝗶𝗼𝗻: \${nextPrediction.suggest === 'Big' ? '🟩 𝗕𝗜𝗚' : '🟥 𝗦𝗠𝗔𝗟𝗟'}
🎯 𝗠𝗮𝗿𝗸𝗲𝘁 𝗢𝘂𝘁: \${sizeStr} (\${latestIssue.number}) - \${colorStr}
✅ 𝗦𝘁𝗮𝘁𝘂𝘀: *\${statusText}*`;

const rResult = `🧠 𝗣𝗿𝗲𝗱𝗶𝗰𝘁𝗶𝗼𝗻: \${nextPrediction.suggest === 'Big' ? '🟩 𝗕𝗜𝗚' : (nextPrediction.suggest === 'Small' ? '🟥 𝗦𝗠𝗔𝗟𝗟' : '🛑 𝗦𝗞𝗜𝗣')}
🎯 𝗠𝗮𝗿𝗸𝗲𝘁 𝗢𝘂𝘁: \${sizeStr} (\${latestIssue.number}) - \${colorStr}
✅ 𝗦𝘁𝗮𝘁𝘂𝘀: *\${nextPrediction.suggest === 'SKIP' ? 'Neutral ⚪' : statusText}*`;

const sResolveText = `🧠 𝗣𝗿𝗲𝗱𝗶𝗰𝘁𝗶𝗼𝗻: \${nextPrediction.suggest === 'Big' ? '🟩 𝗕𝗜𝗚' : '🟥 𝗦𝗠𝗔𝗟𝗟'}`;
const rResolveText = `🧠 𝗣𝗿𝗲𝗱𝗶𝗰𝘁𝗶𝗼𝗻: \${nextPrediction.suggest === 'Big' ? '🟩 𝗕𝗜𝗚' : (nextPrediction.suggest === 'Small' ? '🟥 𝗦𝗠𝗔𝗟𝗟' : '🛑 𝗦𝗞𝗜𝗣')}`;

const sStatusText = `✅ 𝗦𝘁𝗮𝘁𝘂𝘀: *\${statusText}*`;
const rStatusText = `✅ 𝗦𝘁𝗮𝘁𝘂𝘀: *\${nextPrediction.suggest === 'SKIP' ? 'Skip ⚪' : statusText}*`;

if (content.includes(sResolveText)) content = content.replace(sResolveText, rResolveText);
if (content.includes(sStatusText)) content = content.replace(sStatusText, rStatusText);


const sWinMatch = `winMatched = (latestIssue.size === nextPrediction.suggest) || (latestIssue.size === (latestIssue.number >= 5 ? 'Big' : 'Small') && (latestIssue.number >= 5 ? 'Big' : 'Small') === nextPrediction.suggest);`;

const rWinMatch = `winMatched = nextPrediction.suggest !== 'SKIP' && ((latestIssue.size === nextPrediction.suggest) || (latestIssue.size === (latestIssue.number >= 5 ? 'Big' : 'Small') && (latestIssue.number >= 5 ? 'Big' : 'Small') === nextPrediction.suggest));`;

if (content.includes(sWinMatch)) content = content.replace(sWinMatch, rWinMatch);
fs.writeFileSync('server.ts', content);
console.log("SKIP logic injected perfectly");
