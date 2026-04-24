import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');
const search = `adminData.stickers[streakId] = msg.sticker.file_id;`;
const idx = content.indexOf(search);
if (idx !== -1) {
    const context = content.substring(idx, idx + 400);
    console.log(JSON.stringify(context));
} else {
    console.log("NOT FOUND");
}
