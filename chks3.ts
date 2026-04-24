import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

const search = `      broadcastChunked(prevEdits, async ([chatId, msgId]) => {
          await bot?.editMessageText(text, { chat_id: chatId, message_id: msgId as number, parse_mode: 'Markdown' }).catch(()=>{});
      });`;
const replace = `      broadcastChunked(prevEdits, async ([chatId, msgId]) => {
          await bot?.editMessageText(text, { 
              chat_id: chatId, 
              message_id: msgId as number, 
              parse_mode: 'Markdown',
              reply_markup: {
                  inline_keyboard: [[{ text: "🎮 PLAY NOW (WEB APP)", web_app: { url: "https://dkwin9.com/#/saasLottery/WinGo?gameCode=WinGo_30S&lottery=WinGo" } }]]
              }
          }).catch(()=>{});
      });`;
if (content.includes(search)) {
    fs.writeFileSync('server.ts', content.replace(search, replace));
    console.log("Success");
} else console.log("Fail");
