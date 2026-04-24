import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

// 1. Change Poller API URL to 30S
content = content.replace("https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json", "https://draw.ar-lottery01.com/WinGo/WinGo_30S/GetHistoryIssuePage.json");

// 2. Change Countdown Timer to 30S format
const searchTimer = 'const remainingSeconds = 60 - new Date().getSeconds();';
const replaceTimer = 'const remainingSeconds = 30 - (new Date().getSeconds() % 30);';
content = content.replace(searchTimer, replaceTimer);

const searchB = 'if (remainingSeconds < 2 || remainingSeconds > 58) return;';
const replaceB = 'if (remainingSeconds < 2 || remainingSeconds > 28) return;';
content = content.replace(searchB, replaceB);

// 3. Fix Song File Array logic and Telegram Animations
const searchAudioSend = `                             if (adminData.winAudioIds && adminData.winAudioIds.length > 0) {
                                 const rId = adminData.winAudioIds[Math.floor(Math.random() * adminData.winAudioIds.length)];
                                 await bot?.sendVoice(chatId, rId).catch(() => bot?.sendAudio(chatId, rId).catch(()=>{}));
                             } else if (adminData.winAudioId) {
                                 await bot?.sendVoice(chatId, adminData.winAudioId).catch(() => bot?.sendAudio(chatId, adminData.winAudioId).catch(()=>{}));
                             }
                             
                             // 🔥 Premium Telegram Animated Logic for WIN 
                             const animations = ['🎉', '🔥', '🎊', '💸', '🤑'];
                             const randomAnim = animations[Math.floor(Math.random() * animations.length)];
                             await bot?.sendMessage(chatId, randomAnim).catch(()=>{});`;

const replaceAudioSend = `                             if (adminData.winAudioIds && adminData.winAudioIds.length > 0) {
                                 const audioItem = adminData.winAudioIds[Math.floor(Math.random() * adminData.winAudioIds.length)];
                                 // Handle both old string array and new object array {type, id}
                                 const aType = typeof audioItem === 'string' ? 'voice' : audioItem.type;
                                 const aId = typeof audioItem === 'string' ? audioItem : audioItem.id;
                                 
                                 if (aType === 'voice') await bot?.sendVoice(chatId, aId).catch(()=>bot?.sendAudio(chatId, aId).catch(()=>{}));
                                 else await bot?.sendAudio(chatId, aId).catch(()=>bot?.sendVoice(chatId, aId).catch(()=>{}));
                             } else if (adminData.winAudioId) {
                                 await bot?.sendVoice(chatId, adminData.winAudioId).catch(() => bot?.sendAudio(chatId, adminData.winAudioId).catch(()=>{}));
                             }
                             
                             // 🔥 Premium Telegram Animated Logic for WIN (Native effect)
                             // Fallback to sending standalone emoji which Telegram natively auto-animates full screen
                             const animations = ['🎉', '🔥', '🎊', '🎈', '🎆', '🎰'];
                             const randomAnim = animations[Math.floor(Math.random() * animations.length)];
                             // @ts-ignore - effect_id supported in newer telegram API, we pass it safely in options
                             await bot?.sendMessage(chatId, randomAnim, {
                                 // message_effect_id map: 5046509860389126442 (🎉) 5104841245755180586 (🔥)
                                 message_effect_id: randomAnim === '🎉' ? '5046509860389126442' : randomAnim === '🔥' ? '5104841245755180586' : '5046589136895476101'
                             }).catch(() => {
                                 // Fallback
                                 bot?.sendMessage(chatId, randomAnim).catch(()=>{});
                             });`;
content = content.replace(searchAudioSend, replaceAudioSend);

const searchStoreAudio = `                if (msg.voice || msg.audio) {
                    if (!adminData.winAudioIds) adminData.winAudioIds = [];
                    const fid = msg.voice ? msg.voice.file_id : msg.audio?.file_id;
                    if (fid) adminData.winAudioIds.push(fid);`;

const replaceStoreAudio = `                if (msg.voice || msg.audio) {
                    if (!adminData.winAudioIds) adminData.winAudioIds = [];
                    const ftype = msg.voice ? 'voice' : 'audio';
                    const fid = msg.voice ? msg.voice.file_id : msg.audio?.file_id;
                    if (fid) adminData.winAudioIds.push({ type: ftype, id: fid });`;
content = content.replace(searchStoreAudio, replaceStoreAudio);

// 4. Remove Web App config requirement from inline button (revert to pure prediction text instead of WebApp if user doesn't want WebApp)
const searchMsgText = `                     const msg = await bot?.sendMessage(chatId, newMsgText, { 
                         parse_mode: 'Markdown',
                         reply_markup: {
                             inline_keyboard: [[{ text: "🎮 PLAY NOW (WEB APP)", web_app: { url: "https://ais-dev-y4mjgg6c7rc4ivrlowknzo-347639435693.asia-southeast1.run.app" } }]]
                         }
                     }).catch(()=>{});`;

const replaceMsgText = `                     const msg = await bot?.sendMessage(chatId, newMsgText, { 
                         parse_mode: 'Markdown'
                     }).catch(()=>{});`;
content = content.replace(searchMsgText, replaceMsgText);

const searchEdit = `          await bot?.editMessageText(text, { 
              chat_id: chatId, 
              message_id: msgId as number, 
              parse_mode: 'Markdown',
              reply_markup: {
                  inline_keyboard: [[{ text: "🎮 PLAY NOW (WEB APP)", web_app: { url: "https://ais-dev-y4mjgg6c7rc4ivrlowknzo-347639435693.asia-southeast1.run.app" } }]]
              }
          }).catch(()=>{});`;

const replaceEdit = `          await bot?.editMessageText(text, { 
              chat_id: chatId, 
              message_id: msgId as number, 
              parse_mode: 'Markdown'
          }).catch(()=>{});`;
content = content.replace(searchEdit, replaceEdit);

fs.writeFileSync('server.ts', content);
console.log("Revisions applied for WinGo_30S and pure bot interface");
