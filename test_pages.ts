import axios from 'axios';
import https from 'https';
async function test() {
    try {
        const httpsAgent = new https.Agent({ keepAlive: true });
        const p1 = await axios.get("https://draw.ar-lottery01.com/WinGo/WinGo_30S/GetHistoryIssuePage.json?pageIndex=1", {httpsAgent});
        const p2 = await axios.get("https://draw.ar-lottery01.com/WinGo/WinGo_30S/GetHistoryIssuePage.json?pageIndex=2", {httpsAgent});
        console.log("Page 1 length:", p1.data.data.list.length, "Issue:", p1.data.data.list[0].issueNumber);
        console.log("Page 2 length:", p2.data.data.list.length, "Issue:", p2.data.data.list[0].issueNumber);
    } catch(e) {
        console.error("API error:", e.message);
    }
}
test();
