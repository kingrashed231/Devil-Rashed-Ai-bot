import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

const searchMsgText = `                         reply_markup: {
                             inline_keyboard: [[{ text: "🎮 PLAY NOW (WEB APP)", web_app: { url: "https://dkwin9.com/#/saasLottery/WinGo?gameCode=WinGo_30S&lottery=WinGo" } }]]
                         }`;
content = content.replace(searchMsgText, '');

const searchEdit = `              reply_markup: {
                  inline_keyboard: [[{ text: "🎮 PLAY NOW (WEB APP)", web_app: { url: "https://dkwin9.com/#/saasLottery/WinGo?gameCode=WinGo_30S&lottery=WinGo" } }]]
              }`;
content = content.replace(searchEdit, '');

// Clean up trailing commas
content = content.replace(/parse_mode: 'Markdown',\s*}/g, "parse_mode: 'Markdown'}");

fs.writeFileSync('server.ts', content);
