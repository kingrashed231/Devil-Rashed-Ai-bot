import fs from 'fs';
if (fs.existsSync('/app/applet/nohup.out')) {
    const logs = fs.readFileSync('/app/applet/nohup.out', 'utf8');
    const lines = logs.split('\n');
    console.log("LAST 50 LOGS:");
    console.log(lines.slice(-50).join('\n'));
} else {
    console.log("No nohup.out found");
}
