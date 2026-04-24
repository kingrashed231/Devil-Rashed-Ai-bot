import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

// There's a duplicate block of 'challenge_more' inside callback_query due to replace, let's fix
const fixTarget = `        if (data?.startsWith('adm_')) {
            if (!adminSessions.has(chatId)) return bot?.sendMessage(chatId, "Not authorized.");
        }
        
        if (data === 'challenge_more') {
            bot?.sendMessage(chatId, "আপনি আবার প্রেডিকশন চালু করতে চাইলে /challenge লিখে নতুন টার্গেট সেট করুন।");
        }
        if (data === 'challenge_stop') {
            bot?.sendMessage(chatId, "প্রেডিকশন বন্ধ রাখা হয়েছে।");
        }

        if (data === 'challenge_more') {`;

const fixRepl = `        if (data?.startsWith('adm_')) {
            if (!adminSessions.has(chatId)) return bot?.sendMessage(chatId, "Not authorized.");
        }
        
        if (data === 'challenge_more') {`;

content = content.replace(fixTarget, fixRepl);

fs.writeFileSync('server.ts', content);
