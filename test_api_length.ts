import axios from 'axios';
async function test() {
    try {
        const response = await axios.get("https://draw.ar-lottery01.com/WinGo/WinGo_30S/GetHistoryIssuePage.json");
        console.log("Length:", response.data.data.list.length);
    } catch(e) {
        console.error("API error:", e.message);
    }
}
test();
