import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

const searchC = `           await bot?.editMessageText(text, { chat_id: chatId, message_id: msgId as number, parse_mode: 'Markdown' }).catch(()=>{});`;
const idx = content.indexOf(`bot?.editMessageText`);
if (idx !== -1) {
    console.log(content.substring(idx, idx + 150));
}
