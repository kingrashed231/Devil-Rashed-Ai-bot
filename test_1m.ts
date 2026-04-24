import axios from 'axios';
import https from 'https';

async function test() {
    const urls = [
        "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json",
        "https://draw.ar-lottery01.com/WinGo/GetHistoryIssuePage.json",
        "https://draw.ar-lottery01.com/WinGo/WinGo_1Min/GetHistoryIssuePage.json",
        "https://draw.ar-lottery01.com/WinGo1M/GetHistoryIssuePage.json"
    ];
    
    for (const url of urls) {
        try {
            const httpsAgent = new https.Agent({ keepAlive: true });
            console.log("Testing:", url);
            const res = await axios.get(url, {httpsAgent, timeout: 3000});
            if (res.data && res.data.data && res.data.data.list) {
                console.log("SUCCESS for", url);
                console.log("Issue:", res.data.data.list[0].issueNumber);
                break;
            }
        } catch(e) {
            console.log("Failed:", e.message);
        }
    }
}
test();
