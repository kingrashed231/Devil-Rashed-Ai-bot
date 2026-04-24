import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

// Update main admin panel
const searchPanel = `                [{ text: "⏸️ Toggle Bot Power", callback_data: "adm_power" }, { text: "📢 Broadcast", callback_data: "adm_broadcast" }],
                [{ text: "🖼️ Set Flex Stickers", callback_data: "adm_stickers" }, { text: "✂️ Close", callback_data: "adm_close" }]`;
const replacePanel = `                [{ text: "⏸️ Toggle Bot Power", callback_data: "adm_power" }, { text: "📢 Broadcast", callback_data: "adm_broadcast" }],
                [{ text: "🖼️ Set Flex Stickers", callback_data: "adm_stickers" }, { text: "🎵 Audio & Sounds", callback_data: "adm_sounds" }],
                [{ text: "✂️ Close", callback_data: "adm_close" }]`;
content = content.replace(searchPanel, replacePanel);

// Remove the old SET_AUDIO_WIN logic so we can replace it cleanly
content = content.replace(/if \(state.step === 'SET_AUDIO_WIN'[\\s\\S]*?return bot\?.sendMessage\(chatId, `✅ Win Audio saved! Users will automatically hear this play when they Win.`\);\s*\}/s, '');

// Add new handler logic inside bot.on('message') for all 3 types
const appendAudioHandler = `
            if (state.step && state.step.startsWith('SET_AUDIO_')) {
                if (msg.voice || msg.audio) {
                    const type = state.step.replace('SET_AUDIO_', '').toLowerCase(); // win, loss, notif
                    const key = type + 'AudioIds';
                    if (!adminData[key]) adminData[key] = [];
                    const ftype = msg.voice ? 'voice' : 'audio';
                    const fid = msg.voice ? msg.voice.file_id : msg.audio?.file_id;
                    if (fid) adminData[key].push({ type: ftype, id: fid });
                    await saveAdminData(adminData);
                    return bot?.sendMessage(chatId, \`✅ Audio saved for \${type.toUpperCase()}! Total audios in this category: \${adminData[key].length}\\n\\nSend more or click /admin when done.\`);
                }
            }
        `;
// Add it exactly right before: if (adminData.maintenanceMode && !adminSessions.has(chatId)) {
content = content.replace(/(if \(adminData\.maintenanceMode && !adminSessions\.has\(chatId\)\))/s, `${appendAudioHandler}\n        $1`);

// Update the callback queries
const searchCallback = `} else if (data === 'adm_audio') {
            adminStates[chatId] = { step: 'SET_AUDIO_WIN' };
            const opts = { reply_markup: { inline_keyboard: [[{ text: "🗑️ Clear All Audio", callback_data: "clear_audio" }]] } };
            bot?.sendMessage(chatId, "🎵 Send me Voice Messages OR Audio files (.mp3).\\n\\nYou can send multiple files one by one. The bot will pick one randomly when a user wins!\\n\\nType /done to finish or click the button below to reset.", opts);
        } else if (data === 'clear_audio') {
            adminData.winAudioIds = [];
            adminData.winAudioId = null;
            await saveAdminData(adminData);
            bot?.sendMessage(chatId, "🗑️ All associated win audio files have been cleared.");`;

const replaceCallback = `} else if (data === 'adm_sounds') {
            const opts = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "🎉 Set WIN Sounds", callback_data: "adm_audio_win" }],
                        [{ text: "⚠️ Set LOSS Sounds", callback_data: "adm_audio_loss" }],
                        [{ text: "🔔 Set NOTIFICATION Sounds", callback_data: "adm_audio_notif" }],
                        [{ text: "🗑️ Clear ALL Sounds", callback_data: "clear_audio" }]
                    ]
                }
            };
            bot?.sendMessage(chatId, "🎵 *Manage Bot Sounds & Effects*\\nSelect a category below to add multiple sounds to it. Bot picks one randomly from the category.", { parse_mode: 'Markdown', ...opts });
        } else if (data?.startsWith('adm_audio_')) {
            const type = data.replace('adm_audio_', '');
            adminStates[chatId] = { step: \`SET_AUDIO_\${type.toUpperCase()}\` };
            bot?.sendMessage(chatId, \`🎵 Send me Voice/Audio files for \${type.toUpperCase()}. You can send multiple. They will be picked randomly.\`);
        } else if (data === 'clear_audio') {
            adminData.winAudioIds = [];
            adminData.lossAudioIds = [];
            adminData.notifAudioIds = [];
            adminData.winAudioId = null;
            await saveAdminData(adminData);
            bot?.sendMessage(chatId, "🗑️ All associated win, loss, and notification audio files have been cleared.");`;

content = content.replace(searchCallback, replaceCallback);

// Also remove from stickers menu if it's there
content = content.replace(/,?\s*\[\{\s*text: "🎵 Set Win Audio", callback_data: "adm_audio"\s*\}\]/, '');

fs.writeFileSync('server.ts', content);
console.log("Admin sound logic updated.");
