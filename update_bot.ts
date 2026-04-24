import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

const s1 = `        } else if (data === 'adm_audio') {
            adminStates[chatId] = { step: 'SET_AUDIO_WIN' };
            bot?.sendMessage(chatId, "🎵 Send me a Voice Message OR an Audio file (.mp3). It will auto-play/send to users automatically when they WIN.");
        } else if (data?.startsWith('stk_')) {`;

const r1 = `        } else if (data === 'adm_audio') {
            adminStates[chatId] = { step: 'SET_AUDIO_WIN' };
            const opts = { reply_markup: { inline_keyboard: [[{ text: "🗑️ Clear All Audio", callback_data: "clear_audio" }]] } };
            bot?.sendMessage(chatId, "🎵 Send me Voice Messages OR Audio files (.mp3).\\n\\nYou can send multiple files one by one. The bot will pick one randomly when a user wins!\\n\\nType /done to finish or click the button below to reset.", opts);
        } else if (data === 'clear_audio') {
            adminData.winAudioIds = [];
            adminData.winAudioId = null;
            await saveAdminData(adminData);
            bot?.sendMessage(chatId, "🗑️ All associated win audio files have been cleared.");
        } else if (data?.startsWith('stk_')) {`;

content = content.replace(s1, r1);

const s2 = `            if (state.step === 'SET_AUDIO_WIN' && (msg.voice || msg.audio)) {
                adminData.winAudioId = msg.voice ? msg.voice.file_id : (msg.audio ? msg.audio.file_id : undefined);
                await saveAdminData(adminData);
                delete adminStates[chatId];
                return bot?.sendMessage(chatId, \`✅ Win Audio saved! Users will automatically hear this play when they Win.\`);
            }`;

const r2 = `            if (state.step === 'SET_AUDIO_WIN') {
                if (msg.voice || msg.audio) {
                    if (!adminData.winAudioIds) adminData.winAudioIds = [];
                    const fid = msg.voice ? msg.voice.file_id : msg.audio?.file_id;
                    if (fid) adminData.winAudioIds.push(fid);
                    await saveAdminData(adminData);
                    return bot?.sendMessage(chatId, \`✅ Audio saved! Total randomly assigned audios: \${adminData.winAudioIds.length}\\n\\nSend more or type /done if finished.\`);
                }
                if (text === '/done') {
                    delete adminStates[chatId];
                    return bot?.sendMessage(chatId, \`✅ Finished adding audios.\`);
                }
            }`;

content = content.replace(s2, r2);

const s3 = `                             if (adminData.winAudioId) {
                                 await bot?.sendVoice(chatId, adminData.winAudioId).catch(() => bot?.sendAudio(chatId, adminData.winAudioId).catch(()=>{}));
                             }`;

const r3 = `                             if (adminData.winAudioIds && adminData.winAudioIds.length > 0) {
                                 const rId = adminData.winAudioIds[Math.floor(Math.random() * adminData.winAudioIds.length)];
                                 await bot?.sendVoice(chatId, rId).catch(() => bot?.sendAudio(chatId, rId).catch(()=>{}));
                             } else if (adminData.winAudioId) {
                                 await bot?.sendVoice(chatId, adminData.winAudioId).catch(() => bot?.sendAudio(chatId, adminData.winAudioId).catch(()=>{}));
                             }
                             
                             // 🔥 Premium Telegram Animated Logic for WIN 
                             const animations = ['🎉', '🔥', '🎊', '💸', '🤑'];
                             const randomAnim = animations[Math.floor(Math.random() * animations.length)];
                             await bot?.sendMessage(chatId, randomAnim).catch(()=>{});`;

content = content.replace(s3, r3);

const s4 = `const statusText = winMatched ? "Win😎" : "Loss🛑";`;
const r4 = `const statusText = winMatched ? "✅ 𝗦𝗨𝗣𝗘𝗥 𝗪𝗜𝗡 🚀" : "❌ 𝗟𝗢𝗦𝗦 ⚠️";`;
content = content.replace(s4, r4);

fs.writeFileSync('server.ts', content);
console.log("Features added!");
