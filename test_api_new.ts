import axios from 'axios';
async function test() {
    try {
        const res = await axios.get('https://draw.ar-lottery01.com/WinGo/WinGo_30S/GetHistoryIssuePage.json');
        console.log("30S:", res.data?.data?.list?.[0]);
    } catch(e) {
        console.log("30S ERR:", e.message);
    }
    
    try {
        const res2 = await axios.get('https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json');
        console.log("1M:", res2.data?.data?.list?.[0]);
    } catch(e) {
        console.log("1M ERR:", e.message);
    }
}
test();
