import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

const search = `app.get('/api/ping', (req, res) => res.json({status: 'ok'}));`;
const replace = `app.get('/api/ping', (req, res) => res.json({status: 'ok'}));

// Endpoint for UptimeRobot / Cron-job.org to keep the bot alive forever!
app.get('/api/keep-alive', (req, res) => {
    res.status(200).send("Bot is awake and tracking the market!");
});
`;
if (content.includes(search)) {
    fs.writeFileSync('server.ts', content.replace(search, replace));
    console.log("Keep alive injected");
}

