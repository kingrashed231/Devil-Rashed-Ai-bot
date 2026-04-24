import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

const searchA = `                             if (mainStkToSend) {
                                 await bot?.sendSticker(chatId, mainStkToSend).catch(()=>{});
                             }`;
const replaceA = `                             if (mainStkToSend) {
                                 await bot?.sendSticker(chatId, mainStkToSend).catch(()=>{});
                             }
                             if (adminData.winAudioId) {
                                 await bot?.sendVoice(chatId, adminData.winAudioId).catch(() => bot?.sendAudio(chatId, adminData.winAudioId).catch(()=>{}));
                             }`;
if (content.includes(searchA)) content = content.replace(searchA, replaceA); else console.log("searchA failed");

const searchB = `                     // Step C: Send new prediction
                     const msg = await bot?.sendMessage(chatId, newMsgText, { parse_mode: 'Markdown' }).catch(()=>{});`;
const replaceB = `                     // Step C: Send new prediction
                     const msg = await bot?.sendMessage(chatId, newMsgText, { 
                         parse_mode: 'Markdown',
                         reply_markup: {
                             inline_keyboard: [[{ text: "🎮 PLAY NOW (WEB APP)", web_app: { url: "https://dkwin9.com/#/saasLottery/WinGo?gameCode=WinGo_30S&lottery=WinGo" } }]]
                         }
                     }).catch(()=>{});`;
if (content.includes(searchB)) content = content.replace(searchB, replaceB); else console.log("searchB failed");

const searchC = `           await bot?.editMessageText(text, { chat_id: chatId, message_id: msgId as number, parse_mode: 'Markdown' }).catch(()=>{});`;
const replaceC = `           await bot?.editMessageText(text, { 
               chat_id: chatId, 
               message_id: msgId as number, 
               parse_mode: 'Markdown',
               reply_markup: {
                   inline_keyboard: [[{ text: "🎮 PLAY NOW (WEB APP)", web_app: { url: "https://dkwin9.com/#/saasLottery/WinGo?gameCode=WinGo_30S&lottery=WinGo" } }]]
               }
           }).catch(()=>{});`;
if (content.includes(searchC)) content = content.replace(searchC, replaceC); else console.log("searchC failed");

fs.writeFileSync('server.ts', content);
console.log("Audio and WebApp features injected");
