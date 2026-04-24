import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');
const search = `           if (state.step.startsWith('SET_STICKER_') && msg.sticker) {
               const streakId = state.step.replace('SET_STICKER_', '');
               adminData.stickers[streakId] = msg.sticker.file_id;
               await saveAdminData(adminData);
               delete adminStates[chatId];
               return bot?.sendMessage(chatId, \`✅ Sticker saved for: \${streakId}\`);
           }
       }`;
const replacement = `           if (state.step.startsWith('SET_STICKER_') && msg.sticker) {
               const streakId = state.step.replace('SET_STICKER_', '');
               adminData.stickers[streakId] = msg.sticker.file_id;
               await saveAdminData(adminData);
               delete adminStates[chatId];
               return bot?.sendMessage(chatId, \`✅ Sticker saved for: \${streakId}\`);
           }
           if (state.step === 'SET_AUDIO_WIN' && (msg.voice || msg.audio)) {
               adminData.winAudioId = msg.voice ? msg.voice.file_id : (msg.audio ? msg.audio.file_id : undefined);
               await saveAdminData(adminData);
               delete adminStates[chatId];
               return bot?.sendMessage(chatId, \`✅ Win Audio saved! Users will automatically hear this play when they Win.\`);
           }
       }`;
if (content.includes(search)) {
    fs.writeFileSync('server.ts', content.replace(search, replacement));
    console.log("Success replacing block via script!");
} else {
    console.log("Search string not found!");
}
