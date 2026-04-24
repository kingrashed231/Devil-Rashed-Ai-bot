import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

const searchLossAudio = `                             if (lossStkToSend) await bot?.sendSticker(chatId, lossStkToSend).catch(()=>{});
                         }
                     }`;

const replaceLossAudio = `                             if (lossStkToSend) await bot?.sendSticker(chatId, lossStkToSend).catch(()=>{});
                             
                             if (adminData.lossAudioIds && adminData.lossAudioIds.length > 0) {
                                 const audioItem = adminData.lossAudioIds[Math.floor(Math.random() * adminData.lossAudioIds.length)];
                                 const aType = typeof audioItem === 'string' ? 'voice' : audioItem.type;
                                 const aId = typeof audioItem === 'string' ? audioItem : audioItem.id;
                                 if (aType === 'voice') await bot?.sendVoice(chatId, aId).catch(()=>bot?.sendAudio(chatId, aId).catch(()=>{}));
                                 else await bot?.sendAudio(chatId, aId).catch(()=>bot?.sendVoice(chatId, aId).catch(()=>{}));
                             }
                         }
                     }`;
content = content.replace(searchLossAudio, replaceLossAudio);

const searchNotifAudio = `                     // Step C: Send new prediction
                     const msg = await bot?.sendMessage(chatId, newMsgText, { 
                         parse_mode: 'Markdown'}).catch(()=>{});
                     if (msg) sentMessagesForNextPrediction[chatId] = msg.message_id;`;

const replaceNotifAudio = `                     // Step C: Send new prediction
                     const msg = await bot?.sendMessage(chatId, newMsgText, { 
                         parse_mode: 'Markdown'}).catch(()=>{});
                     if (msg) sentMessagesForNextPrediction[chatId] = msg.message_id;
                     
                     if (adminData.notifAudioIds && adminData.notifAudioIds.length > 0) {
                         const audioItem = adminData.notifAudioIds[Math.floor(Math.random() * adminData.notifAudioIds.length)];
                         const aType = typeof audioItem === 'string' ? 'voice' : audioItem.type;
                         const aId = typeof audioItem === 'string' ? audioItem : audioItem.id;
                         if (aType === 'voice') await bot?.sendVoice(chatId, aId).catch(()=>bot?.sendAudio(chatId, aId).catch(()=>{}));
                         else await bot?.sendAudio(chatId, aId).catch(()=>bot?.sendVoice(chatId, aId).catch(()=>{}));
                     }`;
content = content.replace(searchNotifAudio, replaceNotifAudio);

fs.writeFileSync('server.ts', content);
console.log("Audio playing logic added.");
