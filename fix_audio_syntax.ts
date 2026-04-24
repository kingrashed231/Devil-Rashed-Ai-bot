import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

const target = `            if (state.step === 'SET_AUDIO_WIN' && (msg.voice || msg.audio)) {
                adminData.winAudioId = msg.voice ? msg.voice.file_id : (msg.audio ? msg.audio.file_id : undefined);
                await saveAdminData(adminData);
                delete adminStates[chatId];
                return bot?.sendMessage(chatId, \`✅ Win Audio saved! Users will automatically hear this play when they Win.\`);
            }`;

const replace = `            if (state.step && state.step.startsWith('SET_AUDIO_')) {
                if (msg.voice || msg.audio) {
                    const type = state.step.replace('SET_AUDIO_', '').toLowerCase();
                    const key = type + 'AudioIds';
                    const adminDataRef = adminData as any;
                    if (!adminDataRef[key]) adminDataRef[key] = [];
                    const ftype = msg.voice ? 'voice' : 'audio';
                    const fid = msg.voice ? msg.voice.file_id : msg.audio?.file_id;
                    if (fid) adminDataRef[key].push({ type: ftype, id: fid });
                    await saveAdminData(adminData);
                    return bot?.sendMessage(chatId, \`✅ Audio saved for \${type.toUpperCase()}! Total audios in this category: \${adminDataRef[key].length}\\n\\nSend more or click /admin when done.\`);
                }
            }`;
content = content.replace(target, replace);
fs.writeFileSync('server.ts', content);
