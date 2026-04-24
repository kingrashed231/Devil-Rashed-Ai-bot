import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf-8');

const importSearch = `import TelegramBot from 'node-telegram-bot-api';`;
const importReplace = `import TelegramBot from 'node-telegram-bot-api';
import synaptic from 'synaptic'; // Neural Network Engine`;
content = content.replace(importSearch, importReplace);

const memCheckSearch = `const WEIGHTS_DOC = db ? doc(db, 'bot_memory', 'model_ensemble_weights') : null;`;
const memCheckReplace = `const WEIGHTS_DOC = db ? doc(db, 'bot_memory', 'model_ensemble_weights') : null;
const SYNAPTIC_DOC = db ? doc(db, 'bot_memory', 'synaptic_model') : null;

// Synaptic ML Setup
const Architect = synaptic.Architect;
const Trainer = synaptic.Trainer;
// Deep LSTM architecture: 2 inputs (Trend change, Big/Small), 6 hidden, 1 output (Big or Small)
let globalLSTM = new Architect.LSTM(2, 6, 1);
let rashedTrainer = new Trainer(globalLSTM);

let isLSTMLoaded = false;

async function syncLSTMSmartBrain() {
    if (SYNAPTIC_DOC && !isLSTMLoaded) {
        try {
            const snap = await getDoc(SYNAPTIC_DOC);
            if (snap.exists() && snap.data().network) {
                globalLSTM = synaptic.Network.fromJSON(snap.data().network);
                rashedTrainer = new Trainer(globalLSTM);
                isLSTMLoaded = true;
                console.log("🧠 Synaptic Matrix Memory Loaded from Firebase!");
            }
        } catch (e) {
            console.error("Synaptic Sync Error:", e);
        }
    }
}

async function saveLSTMSmartBrain() {
    if (SYNAPTIC_DOC) {
        try {
           const exported = globalLSTM.toJSON();
           setDoc(SYNAPTIC_DOC, { network: exported, timestamp: Date.now() }, { merge: true });
        } catch(e) {
            console.error("Synaptic DB Save Error", e);
        }
    }
}
`;
content = content.replace(memCheckSearch, memCheckReplace);

fs.writeFileSync('server.ts', content);
console.log("Memory DB Setup injected.");
