import axios from 'axios';
async function test() {
    try {
        console.log("Fetching API...");
        const response = await axios.post("https://draw.ar-lottery01.com/WinGo/WinGo_30S/GetHistoryIssuePage.json", {
             lottery: "WinGo_30S",
             pageIndex: 1,
             pageSize: 100
        }, {
            headers: {
               "Content-Type": "application/json"
               // "Accept": "application/json"
            }
        });
        console.log("Status:", response.status);
        console.log("Data snippet:", JSON.stringify(response.data).substring(0, 200));
    } catch(e) {
        console.error("API error:", e.message);
        if (e.response) {
            console.error("Response data:", e.response.data);
            console.error("Response status:", e.response.status);
        }
    }
}
test();
