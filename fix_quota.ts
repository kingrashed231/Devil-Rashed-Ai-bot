import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

const targetImports = `// --- FIREBASE SELF-LEARNING DB SETUP ---
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';`;

const replacementImports = `// --- FIREBASE SELF-LEARNING DB SETUP ---
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

let _quotaExceeded = false;
async function safeSetDoc(docRef: any, data: any, options: any) {
    if (_quotaExceeded) return;
    try {
        await setDoc(docRef, data, options);
    } catch(e: any) {
        if (e.message && e.message.includes('Quota')) {
            console.error("🔥 Firebase Quota Exceeded! Switching to RAM-only memory.");
            _quotaExceeded = true;
        } else if (e.code === 'resource-exhausted') {
            console.error("🔥 Firebase Quota Exceeded! Switching to RAM-only memory.");
            _quotaExceeded = true;
        } else {
            console.error("Firebase write error:", e);
        }
    }
}`;

content = content.replace(targetImports, replacementImports);

// Manual targeted replacements
content = content.replace(/setDoc\(HISTORY_DOC/g, "safeSetDoc(HISTORY_DOC");
content = content.replace(/setDoc\(CONFIG_DOC/g, "safeSetDoc(CONFIG_DOC");
content = content.replace(/setDoc\(WEIGHTS_DOC/g, "safeSetDoc(WEIGHTS_DOC");
content = content.replace(/setDoc\(LSTM_DOC/g, "safeSetDoc(LSTM_DOC");

fs.writeFileSync('server.ts', content);
console.log("Firebase quota bypass logic installed.");
