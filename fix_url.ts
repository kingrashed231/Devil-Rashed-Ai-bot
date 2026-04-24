import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');
const search = `web_app: { url: "https://dkwin9.com/#/saasLottery/WinGo?gameCode=WinGo_30S&lottery=WinGo" }`;
const replace = `web_app: { url: "https://ais-dev-y4mjgg6c7rc4ivrlowknzo-347639435693.asia-southeast1.run.app" }`;
content = content.replace(new RegExp(search.replace(/[.*+?^$()|[\\]\\\\]/g, '\\\\$&'), 'g'), replace);
fs.writeFileSync('server.ts', content);
console.log("WebApp URL updated to our domain!");
