import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

const tQueryTarget = `        if (data?.startsWith('adm_')) {
            if (!adminSessions.has(chatId)) return bot?.sendMessage(chatId, "Not authorized.");
        }
        
        if (data === 'challenge_more') {
            bot?.sendMessage(chatId, "আপনি আবার প্রেডিকশন চালু করতে চাইলে /challenge লিখে নতুন টার্গেট সেট করুন।");
        }
        if (data === 'challenge_stop') {
            bot?.sendMessage(chatId, "প্রেডিকশন বন্ধ রাখা হয়েছে।");
        }`;

// Let's add it right before verify_join and handle properly
const searchBlock = `        if (data === 'verify_join') {
            try {`;
const replBlock = `        if (data === 'challenge_more') {
            bot?.sendMessage(chatId, "আপনি আবার প্রেডিকশন চালু করতে চাইলে /challenge লিখে নতুন টার্গেট সেট করুন।");
            bot?.answerCallbackQuery(query.id);
            return;
        }
        if (data === 'challenge_stop') {
            bot?.sendMessage(chatId, "প্রেডিকশন বন্ধ রাখা হয়েছে।");
            bot?.answerCallbackQuery(query.id);
            return;
        }

        if (data === 'verify_join') {
            try {`;

content = content.replace(searchBlock, replBlock);

fs.writeFileSync('server.ts', content);
console.log("Verified callbacks.");
