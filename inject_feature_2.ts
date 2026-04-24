import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

const search = `       const prevEdits = Object.entries(sentMessagesForNextPrediction);
       broadcastChunked(prevEdits, async ([chatId, msgId]) => {
           await bot?.editMessageText(text, { chat_id: chatId, message_id: msgId as number, parse_mode: 'Markdown' }).catch(()=>{});
       });`;

const replace = `       const prevEdits = Object.entries(sentMessagesForNextPrediction);
       broadcastChunked(prevEdits, async ([chatId, msgId]) => {
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
    content = content.replace(search, replace);
    fs.writeFileSync('server.ts', content);
    console.log("WebApp on countdown injected.");
} else {
    console.log("NOT FOUND!");
}
