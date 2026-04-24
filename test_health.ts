import axios from 'axios';
async function test() {
    try {
        const res = await axios.get('http://127.0.0.1:3000/api/health');
        console.log("Health OK:", res.data);
    } catch(e) {
        console.error("Health ERR:", e.message);
    }
}
test();
