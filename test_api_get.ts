import axios from 'axios';
async function test() {
    try {
        console.log("Fetching API...");
        const response = await axios.get("https://draw.ar-lottery01.com/WinGo/WinGo_30S/GetHistoryIssuePage.json");
        console.log("Status:", response.status);
        console.log("Data snippet:", JSON.stringify(response.data).substring(0, 500));
    } catch(e) {
        console.error("API error:", e.message);
    }
}
test();
