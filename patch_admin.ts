import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

const tSearch = `                [{ text: "🖼️ Set Flex Stickers", callback_data: "adm_stickers" }, { text: "🎵 Audio & Sounds", callback_data: "adm_sounds" }],
                [{ text: "✂️ Close", callback_data: "adm_close" }]`;

const tRepl = `                [{ text: "🖼️ Set Flex Stickers", callback_data: "adm_stickers" }, { text: "🎵 Audio & Sounds", callback_data: "adm_sounds" }],
                [{ text: "📊 AI Analytics", callback_data: "adm_analytics" }, { text: "⚙️ AI Risk Mode", callback_data: "adm_risk" }],
                [{ text: "🧠 Flush Memory", callback_data: "adm_flush" }, { text: "✂️ Close", callback_data: "adm_close" }]`;

content = content.replace(tSearch, tRepl);

const callbacksSearch = `        if (data === 'adm_stickers') {
            bot?.sendMessage(chatId, "Stickers configuration:\\nUse /setmainsticker [Sticker_ID] to set the main sticker.\\nUse /setwin1 [Sticker_ID] and /setwin2 [Sticker_ID] for dual win stickers.");
            bot?.answerCallbackQuery(query.id);
            return;
        }`;

const callbacksRepl = `        if (data === 'adm_stickers') {
            bot?.sendMessage(chatId, "Stickers configuration:\\nUse /setmainsticker [Sticker_ID] to set the main sticker.\\nUse /setwin1 [Sticker_ID] and /setwin2 [Sticker_ID] for dual win stickers.");
            bot?.answerCallbackQuery(query.id);
            return;
        }
        
        if (data === 'adm_analytics') {
            const hist = await getHistoryData();
            const txt = \`📊 *AI BRAIN ANALYTICS*\\n\\n🧠 Neural Weights:\\n\${JSON.stringify(_cachedWeights?.slice(0, 3) || [])} ...\\n\\n🔍 Data Processed: \${hist.length} draws\\n⚡ Server RAM cache: \${hist.length ? 'Active' : 'Empty'}\\n🚨 DB Quota Trigger: \${_quotaExceeded ? 'YES (Frozen Mode)' : 'NO (Live DB)'}\`;
            bot?.sendMessage(chatId, txt, {parse_mode: 'Markdown'});
            bot?.answerCallbackQuery(query.id);
            return;
        }

        if (data === 'adm_risk') {
            const currentMode = adminData.userMode === 'SAFE' ? 'SAFE' : 'AGGRESSIVE';
            const nextMode = currentMode === 'SAFE' ? 'AGGRESSIVE' : 'SAFE';
            adminData.userMode = nextMode;
            await saveAdminData(adminData);
            bot?.sendMessage(chatId, \`⚙️ Risk mode switched to: *\${nextMode}*\\n\\n(Prediction Engine will adapt to \${nextMode})\`, {parse_mode: 'Markdown'});
            bot?.answerCallbackQuery(query.id);
            return;
        }

        if (data === 'adm_flush') {
            _cachedHistory = null;
            _cachedWeights = null;
            bot?.sendMessage(chatId, \`🧠 RAM Memory cache flushed. The AI will resync from Firebase on next tick.\`);
            bot?.answerCallbackQuery(query.id);
            return;
        }
`;

content = content.replace(callbacksSearch, callbacksRepl);

fs.writeFileSync('server.ts', content);
console.log("Admin buttons added.");
