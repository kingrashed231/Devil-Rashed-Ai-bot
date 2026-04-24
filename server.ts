import express from 'express';
import { AdvancedPredictionEngine } from './PredictionEngine';

const advancedEngine = new AdvancedPredictionEngine();
import cors from 'cors';
import axios from 'axios';
import https from 'https';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import fs from 'fs/promises';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import TelegramBot from 'node-telegram-bot-api';
import synaptic from 'synaptic'; // Neural Network Engine
import { EventEmitter } from 'events';


// Increase Event Listener Max recursively to prevent polling TLSSocket errors
EventEmitter.defaultMaxListeners = 0;
process.setMaxListeners(0);

const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 30 });

const originalConsoleError = console.error;
console.error = function (...args) {
  if (typeof args[0] === 'string' && (args[0].includes('RESOURCE_EXHAUSTED') || args[0].includes('Quota limit exceeded'))) return;
  if (args[0] && args[0].code === 'resource-exhausted') return;
  if (args[0] && args[0].message && (args[0].message.includes('RESOURCE_EXHAUSTED') || args[0].message.includes('Quota limit exceeded'))) return;
  originalConsoleError.apply(console, args);
};

// --- FIREBASE SELF-LEARNING DB SETUP ---
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

let _quotaExceeded = false;

// Auto-recovery mechanism for Firebase Quota
setInterval(async () => {
    if (_quotaExceeded) {
        try {
            // Attempt a lightweight test read to check if quota is refreshed
            if (HISTORY_DOC) {
               await getDoc(HISTORY_DOC);
               _quotaExceeded = false;
               console.log("🔥 Firebase Quota Refreshed! Reconnected to main database and AI Brain sync restored.");
            }
        } catch(e: any) {
            // Still exceeded, do nothing
        }
    }
}, 60 * 60 * 1000); // Check every 1 hour

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
}

// Read config from top-level
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db: any = null;
try {
  const fbConfigRaw = await fs.readFile(path.join(__dirname, 'firebase-applet-config.json'), 'utf-8');
  const firebaseConfig = JSON.parse(fbConfigRaw);
  const firebaseApp = initializeApp(firebaseConfig);
  db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
  console.log("🔥 Firebase AI Core Connected Successfully!");
} catch (e) {
  console.error("Firebase init skipped:", e);
}

// Initialize Telegram Bot
const TELEGRAM_TOKEN = '8695575597:AAFmU31AdzrSxc0b9x7o9wQvEbAraTb3Cq8';

// Telegram Channel
const TARGET_CHANNEL = '@ExoCommunity_1';

// To prevent port collisions and excessive polling in rapid restarts, we wrap in try-catch
let bot: TelegramBot | null = null;
try {
  bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
  bot.on('polling_error', (error) => console.log('Telegram Polling Error:', error.message));
} catch(e) {
  console.error("Telegram bot init failed", e);
}

// Ensure GoogleGenAI uses the process env key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const app = express();
app.use(cors());
app.use(express.json());

// Add these right after app.use(express.json()); near line 60

// ====== TELEGRAM WEBHOOK (WAKE ON SLEEP) ======
app.post('/api/telegram-webhook', (req, res) => {
    if (bot) {
        bot.processUpdate(req.body);
    }
    res.sendStatus(200);
});

app.get('/api/admin/enable-webhook', async (req, res) => {
    try {
        if (!bot) return res.status(400).json({error: 'Bot not initialized'});
        // Get the actual external URL (HTTPS)
        const host = req.get('host');
        const url = `https://${host}/api/telegram-webhook`;
        
        // Disable polling if it was on (to avoid conflict)
        if (bot.isPolling()) {
            await bot.stopPolling();
        }
        
        await bot.setWebHook(url);
        res.json({ success: true, url, message: 'Webhook activated! Bot will now wake up from sleep instantly on Telegram messages.' });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

const PORT = 3000;

app.get('/api/ping', (req, res) => res.json({status: 'ok'}));

// Endpoint for UptimeRobot / Cron-job.org to keep the bot alive forever!
app.get('/api/keep-alive', (req, res) => {
    res.status(200).send("Bot is awake and tracking the market!");
});

setInterval(() => {
    axios.get(`http://localhost:${PORT}/api/ping`).catch(()=>{});
}, 30000); // Trigger network to delay container sleep

// Simple JSON DB for Admin settings
const DB_FILE = path.join(__dirname, 'admin_data.json');

// --- BOT HISTORY ENGINE ---
const HISTORY_DOC = db ? doc(db, 'bot_memory', 'win_history_v2') : null;

let _cachedHistory: any[] | null = null;
let _historyLastFetch = 0;

async function getHistoryData() {
  if (_cachedHistory && Date.now() - _historyLastFetch < 60000) return _cachedHistory;
  if (_quotaExceeded && _cachedHistory) return _cachedHistory; // ALWAYS use RAM if DB is frozen to preserve new learning
  if (_quotaExceeded) return _cachedHistory || [];
  
  if (HISTORY_DOC) {
      try {
          const snap = await getDoc(HISTORY_DOC);
          if (snap.exists() && snap.data().records) {
              _cachedHistory = snap.data().records;
              _historyLastFetch = Date.now();
              return _cachedHistory;
          }
      } catch(e) { console.error("Firebase History Read Error:", e); }
  }
  return _cachedHistory || [];
}

async function saveHistoryData(newRecord: any) {
  const data = await getHistoryData();
  const exists = data.find((d: any) => d.issueNumber === newRecord.issueNumber);
  if (!exists) {
     data.unshift(newRecord); // Push to top
     if (data.length > 2500) data.pop(); // Hard limit around ~200KB to stay safely under 1MB Firestore limit
     
     _cachedHistory = data;
     _historyLastFetch = Date.now();

     if (HISTORY_DOC) {
         try {
             safeSetDoc(HISTORY_DOC, { records: data }, { merge: true }); // Background async write, don't await to block
         } catch(e) { console.error("Firebase History Write Error:", e); }
     }
  }
}

const adminSessions = new Set<number>();
const adminStates: Record<number, any> = {};
let globalWinStreak = 0;
let dailySignalsCount = 0;
let dailyWinsCount = 0;
let isSleepNotified = false;

interface ChallengeState {
    balance: number;
    target: number;
    currentLossStep: number;
    maxSteps: number;
    betSeries: number[];
}
const userChallenges: Record<number, ChallengeState> = {};
const userModeStates: Record<number, any> = {};

const CONFIG_DOC = db ? doc(db, 'bot_config', 'admin_settings') : null;

let _cachedAdminData: any = null;
let _adminLastFetch = 0;

async function getAdminData() {
  const initialData = {
    maintenanceMode: false,
    maintenanceMessage: "🤖 Bot is currently under maintenance or turned off by admin.",
    manualOverride: null,
    broadcastMessage: '',
    telegramSubscribers: [] as number[],
    users: [],
    stickers: {} as Record<string, string>,
    winAudioId: null as string | null, // Stores the Telegram file_id of the audio/voice clip
    blockedUsers: {} as Record<string, string>
  };

  if (_cachedAdminData && Date.now() - _adminLastFetch < 10000) return _cachedAdminData;
  if (_quotaExceeded && _cachedAdminData) return _cachedAdminData;

  try {
    if (CONFIG_DOC) {
      const snap = await getDoc(CONFIG_DOC);
      if (snap.exists()) {
        const parsed = snap.data();
        if (!parsed.stickers) parsed.stickers = {};
        if (!parsed.blockedUsers) parsed.blockedUsers = {};
        if (!parsed.maintenanceMessage) parsed.maintenanceMessage = "🤖 Bot is currently under maintenance or turned off by admin.";
        if (!parsed.telegramSubscribers) parsed.telegramSubscribers = [];
        
        _cachedAdminData = { ...initialData, ...parsed };
        _adminLastFetch = Date.now();
        return _cachedAdminData;
      } else {
        // Init firebase doc if it doesn't exist
        safeSetDoc(CONFIG_DOC, initialData, { merge: true });
        _cachedAdminData = initialData;
        _adminLastFetch = Date.now();
        return initialData;
      }
    }
  } catch (e) {
    console.error("Firebase Config Read Error:", e);
  }
  
  // Fallback
  return _cachedAdminData || initialData;
}

// Ensure engine loads weights on start
setTimeout(async () => {
    try {
        if (!_quotaExceeded && WEIGHTS_DOC) {
            const snap = await getDoc(WEIGHTS_DOC);
            if (snap.exists()) {
                const data = snap.data();
                if (data.engineWeights) advancedEngine.setWeights(data.engineWeights);
                if (data.engineMemory) advancedEngine.setSequenceMemory(data.engineMemory);
            }
        }
    } catch(e) {}
}, 5000);


async function saveAdminData(data: any) {
  _cachedAdminData = data;
  _adminLastFetch = Date.now();
  try {
    if (CONFIG_DOC) {
       safeSetDoc(CONFIG_DOC, data, { merge: true }); // Async background write
    }
  } catch (e) {
    console.error("Firebase Config Write Error:", e);
  }
}

// Memory cache for market history to avoid spamming the external API
let historyCache: any = null;
let lastFetch = 0;

async function loadLatestMarket() {
    if (Date.now() - lastFetch < 1000 && historyCache) return historyCache; // Fast 1 second cache hit to prevent spam

    try {
        const response = await axios.get('https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json', { httpsAgent, timeout: 3500 });
        if (response.data && response.data.data && response.data.data.list) {
            historyCache = response.data.data.list.map((item: any) => ({
                 issueNumber: item.issueNumber,
                 number: Number(item.number),
                 color: item.color === 'red' ? 'Red' : item.color === 'green' ? 'Green' : 'Green/Purple',
                 size: Number(item.number) >= 5 ? 'Big' : 'Small'
             }));
            lastFetch = Date.now();
            return historyCache;
        }
    } catch(e) {}
    
    return historyCache;
}

// Fetch history
app.get('/api/history', async (req, res) => {
  const adminData = await getAdminData();
  
  if (adminData.maintenanceMode) {
    return res.status(503).json({ error: 'System is under maintenance.' });
  }

  try {
    const freshCache = await loadLatestMarket();
    if (!freshCache) throw new Error("No data");

    // Prediction Engine Logic
    const history = freshCache.slice(0, 50); // Get last 50
    let bigCount = 0;
    let smallCount = 0;
    let streaks = 0;
    let lastSize = null;
    
    history.forEach((h: any) => {
        const size = h.size || (h.number >= 5 ? 'Big' : 'Small');
        if (size === 'Big') bigCount++;
        if (size === 'Small') smallCount++;
        
        if (lastSize === size) {
             streaks++;
        }
        lastSize = size;
    });

    const total = bigCount + smallCount || 1;
    const bigRatio = bigCount / total;
    
    // Entropy (Randomness) calculation
    const p1 = bigCount / total;
    const p2 = smallCount / total;
    const entropy = p1 > 0 && p2 > 0 ? -(p1 * Math.log2(p1) + p2 * Math.log2(p2)) : 0;
    
    // Market Manipulation Logic
    let isUnsafe = false;
    let unsafeReason = "";
    if (entropy < 0.6) {
        isUnsafe = true;
        unsafeReason = "Low entropy + irregular pattern";
    } else if (streaks > 30) {
        isUnsafe = true;
        unsafeReason = "Suspicious artificial streak detected";
    }

    let prediction = bigRatio > 0.5 ? 'Small' : 'Big'; // Mean reversion logic
    
    if (adminData.manualOverride) {
        prediction = adminData.manualOverride;
    }

    let confidence = Math.floor(Math.random() * 26) + 60; // 60-85%

    res.json({
      history: historyCache.slice(0, 20), // Send only last 20 for UI
      analysis: {
        totalAnalyzed: history.length,
        bigRatio: (bigRatio * 100).toFixed(1) + '%',
        smallRatio: ((1 - bigRatio) * 100).toFixed(1) + '%',
        entropy: entropy.toFixed(3),
      },
      marketStatus: {
        safe: !isUnsafe,
        reason: isUnsafe ? unsafeReason : "Market behaving normally",
        advice: isUnsafe ? "Skip next 3 rounds" : "Trade with 2x strategy"
      },
      prediction: {
        suggest: prediction,
        confidence: confidence + "%"
      }
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/health', (req, res) => {
    res.send({ status: 'ok', timestamp: Date.now() });
});

// Admin endpoints
app.get('/api/admin', async (req, res) => {
  const data = await getAdminData();
  res.json(data);
});

app.get('/api/admin/ai-status', async (req, res) => {
    try {
        const weights = await getDynamicWeights();
        const modelStats = weights.map((w: number, i: number) => ({ model: `M${i}`, weight: w }))
             .sort((a: any, b: any) => b.weight - a.weight);
        
        const history = await getHistoryData();

        res.json({
            success: true,
            totalTrainedRecords: history.length,
            topModels: modelStats.slice(0, 3),
            weakestModels: modelStats.slice(-3),
            lastTrainedAt: new Date().toISOString()
        });
    } catch (e) {
        res.status(500).json({ success: false });
    }
});

app.post('/api/admin', async (req, res) => {
  const data = await getAdminData();
  const newData = { ...data, ...req.body };
  await saveAdminData(newData);
  res.json({ success: true, data: newData });
});

// Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    
    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // Start Chat
    const chat = ai.chats.create({
      model: "gemini-3.1-flash-preview",
      config: {
        systemInstruction: "You are 'Devil Rashed AI', an advanced market predictor and strategy bot for WinGo lottery/trading. Speak in a friendly mix of Bangla and English (Banglish). Provide strategy tips, answer questions about moving averages and risk management, but don't promise 100% wins. Keep responses concise and smart.",
      }
    });
    
    // We send previous messages manually by calling sendMessage for just the current one, 
    // OR just use generating content. Actually, `ai.models.generateContent` with the full history is easier.
    const allContents = [...formattedHistory, { role: 'user', parts: [{ text: message }] }];

    const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-preview",
        contents: allContents,
        config: {
            systemInstruction: "You are 'Devil Rashed AI', an advanced market predictor and strategy bot for WinGo (color prediction) game. Speak in a friendly mix of Bangla and English (Banglish/Bengali). Be professional, confident, provide strategy tips, answer questions about risk management. Note: Never promise 100% guaranteed wins, always emphasize probability and smart risk."
        }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || "Failed to generate AI response" });
  }
});

// ====== OFFLINE HOOK / ACTIVE ENGINE ======
// Keeps the backend aggressively active even without external requests 
setInterval(() => {
    axios.get('http://127.0.0.1:3000/api/health', { timeout: 2000 }).catch(()=>{});
}, 60000);

// ====== ARTIFICIAL BRAIN (Smartest Background Trainer) ======
setInterval(async () => {
    try {
        if (!db) return;
        const dbHistory = await getHistoryData();
        if (dbHistory.length < 500) return; // Need solid data for backtesting

        // Massive deep training cycle on historical validation slice
        const tempWeights = Array(NUM_MODELS).fill(1 / NUM_MODELS);
        const startIdx = 100; // Skip very recent
        const trainSets = 100;
        
        for (let t = startIdx; t < startIdx + trainSets; t++) {
             const actualOutcome = dbHistory[t].number >= 5 ? 'Big' : 'Small';
             const curHist = dbHistory.slice(t + 1); // Point in time history
             
             const lh = curHist.slice(0, 2000).map((i:any)=>({size: i.number >= 5 ? 'Big' : 'Small'}));
             const sh = curHist.slice(0, 500).map((i:any)=>({size: i.number >= 5 ? 'Big' : 'Small', number: Number(i.number)}));
             
             if (lh.length < 100 || sh.length < 50) continue;
             const res = runEnsembleModels(lh, sh);

             // Neuro-eval update simulation
             for (let m = 0; m < NUM_MODELS; m++) {
                 if (res.preds[m] === actualOutcome) {
                     tempWeights[m] *= 1.1; 
                 } else {
                     tempWeights[m] *= 0.9;
                 }
             }
        }

        // Apply background learned insights to real global weights
        const total = tempWeights.reduce((a, b) => a + b, 0);
        const normalized = tempWeights.map((val: number) => Number((val / total).toFixed(4)));
        await safeSetDoc(WEIGHTS_DOC, { w: normalized }, { merge: true });
        console.log("🧠 Artificial Brain Background Training Cycle Completed!");
    } catch(e) {}
}, 300000);

async function broadcastChunked(items: any[], actionFn: (item: any) => Promise<any>) {
    const CHUNK_SIZE = 25; // Telegram API broadcast limit is 30/s. Strict 25 chunk blocks limits 429 errors.
    for (let i = 0; i < items.length; i += CHUNK_SIZE) {
        const chunk = items.slice(i, i + CHUNK_SIZE);
        await Promise.allSettled(chunk.map(c => actionFn(c)));
        if (i + CHUNK_SIZE < items.length) {
            await new Promise(r => setTimeout(r, 1050)); // 1 second buffer between broadcasts
        }
    }
}

// ====== TELEGRAM BOT BACKGROUND POLLER ======
let lastTrackedIssue = "";
let nextPrediction: any = null; // { issue, suggest, confidence }
let sentMessagesForNextPrediction: Record<string, number> = {};
let globalLossStreak = 0;

// --- FIREBASE DYNAMIC MEMORY ENGINE ---
const WEIGHTS_DOC = db ? doc(db, 'bot_memory', 'model_ensemble_weights') : null;
const SYNAPTIC_DOC = db ? doc(db, 'bot_memory', 'synaptic_model') : null;

// Synaptic ML Setup
const Architect = synaptic.Architect;
const Trainer = synaptic.Trainer;
// 100+ Logic Matrix: 120 Inputs (100 deep history + 20 indicators), 64 hidden, 1 output (Big/Small)
let globalLSTM = new Architect.LSTM(120, 64, 1);
let rashedTrainer = new Trainer(globalLSTM);

let isLSTMLoaded = false;

async function syncLSTMSmartBrain() {
    if (_quotaExceeded && isLSTMLoaded) return; // Prevent overwriting newly locally trained data with frozen DB data if DB limit exceeded
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
           safeSetDoc(SYNAPTIC_DOC, { network: exported, timestamp: Date.now() }, { merge: true });
        } catch(e) {
            console.error("Synaptic DB Save Error", e);
        }
    }
}

const NUM_MODELS = 30;

let _cachedWeights: number[] | null = null;
let _weightsLastFetch = 0;

async function getEngineWeights() {
    try {
        if (!_quotaExceeded && WEIGHTS_DOC) {
            const snap = await getDoc(WEIGHTS_DOC);
            if (snap.exists() && snap.data().engineWeights) {
                return snap.data().engineWeights;
            }
        }
    } catch(e) {}
    return null;
}

async function getDynamicWeights() {
  const defaultWeights = Array(NUM_MODELS).fill(1 / NUM_MODELS);
  if (_cachedWeights && Date.now() - _weightsLastFetch < 60000) return [..._cachedWeights];
  if (_quotaExceeded && _cachedWeights) return [..._cachedWeights]; // RAM ONLY mode!

  if (!WEIGHTS_DOC) return defaultWeights;
  try {
     const snap = await getDoc(WEIGHTS_DOC);
     if (snap.exists() && snap.data().w) {
         const w = snap.data().w;
         if (Array.isArray(w) && w.length === NUM_MODELS) {
             _cachedWeights = w;
             _weightsLastFetch = Date.now();
             return [...w];
         }
     }
  } catch(e){}
  
  return _cachedWeights ? [..._cachedWeights] : defaultWeights;
}

async function updateDynamicWeights(actualOutcome: string, predictions: string[]) {
  if (!WEIGHTS_DOC) return;
  const w = await getDynamicWeights();
  
  for (let i = 0; i < NUM_MODELS; i++) {
     // Dynamic weight adjustment based on immediate accuracy momentum
     if (predictions[i] === actualOutcome) {
         w[i] = w[i] * 1.25; // Heavily favor models that are currently hitting
     } else {
         w[i] = w[i] * 0.75; // Heavily penalize missing models
     }
     w[i] = Math.max(0.001, w[i]); // Prevent zeroing out totally
  }

  // Normalize weights
  const total = w.reduce((a, b) => a + b, 0);
  const normalized = w.map((val: number) => Number((val / total).toFixed(4)));
  
  _cachedWeights = normalized;
  _weightsLastFetch = Date.now();

  try { safeSetDoc(WEIGHTS_DOC, { w: normalized }, { merge: true }); } catch(e){}
}

function runEnsembleModels(longHistory: any[], shortHistory: any[]) {
    let p = Array(NUM_MODELS).fill('Big');
    let c = Array(NUM_MODELS).fill(0.5);

    // M0-M3: Deep Markov Chains (Orders 1 to 4)
    for (let order = 1; order <= 4; order++) {
        let matrix: any = {};
        for (let i = longHistory.length - 1; i >= order; i--) {
             const state = longHistory.slice(i - order, i).map((x:any) => x.size).join('-');
             const next = longHistory[i - order - 1]?.size;
             if (!next) continue;
             if (!matrix[state]) matrix[state] = { Big: 0, Small: 0 };
             matrix[state][next]++;
        }
        const state = shortHistory.slice(0, order).reverse().map((x:any)=>x.size).join('-');
        if (matrix[state]) {
            const b = matrix[state].Big; const s = matrix[state].Small;
            c[order-1] = b / (b+s || 1);
            p[order-1] = b >= s ? 'Big' : 'Small';
            if (c[order-1] < 0.5) c[order-1] = 1 - c[order-1];
        }
    }

    // M4-M7: RSI Variations (Periods: 7, 14, 21, 30)
    [7, 14, 21, 30].forEach((period, idx) => {
        let gains = 0, losses = 0;
        for (let i = 0; i < period && i < shortHistory.length; i++) {
            if (shortHistory[i].size === 'Big') gains++; else losses++;
        }
        const rsi = losses === 0 ? 100 : 100 - (100 / (1 + (gains/losses)));
        const i = 4 + idx;
        if (rsi > 70) { p[i] = 'Small'; c[i] = rsi/100; }
        else if (rsi < 30) { p[i] = 'Big'; c[i] = 1 - (rsi/100); }
        else { p[i] = gains >= losses ? 'Big' : 'Small'; c[i] = 0.55; }
    });

    // M8-M11: K-Nearest Pattern Matching (k=3,4,5,6)
    [3, 4, 5, 6].forEach((k, idx) => {
        const recent = shortHistory.slice(0, k).map((x:any)=>x.size).join('-');
        let b = 0, s = 0;
        for (let i = k+1; i < longHistory.length; i++) {
            const past = longHistory.slice(i-k, i).reverse().map((x:any)=>x.size).join('-');
            if (past === recent) {
                if (longHistory[i-k-1]?.size === 'Big') b++; else s++;
            }
        }
        const i = 8 + idx;
        p[i] = b >= s ? 'Big' : 'Small';
        c[i] = (b+s) === 0 ? 0.5 : Math.max(b,s) / (b+s);
    });

    // M12-M15: Frequency Mean Reversion (20, 50, 100, 200 rows)
    [20, 50, 100, 200].forEach((n, idx) => {
        let sc = shortHistory.slice(0, n);
        if (sc.length === 0) sc = shortHistory;
        let b = sc.filter((x:any)=>x.size==='Big').length;
        const bRatio = b / (sc.length || 1);
        const i = 12 + idx;
        p[i] = bRatio > 0.55 ? 'Small' : 'Big';
        c[i] = 0.5 + Math.abs(0.5 - bRatio);
    });

    // M16-M17: Strict Momentum (10, 20 rows)
    [10, 20].forEach((n, idx) => {
        let sc = shortHistory.slice(0, n);
        let b = sc.filter((x:any)=>x.size==='Big').length;
        const i = 16 + idx;
        p[i] = b >= (sc.length/2) ? 'Big' : 'Small';
        c[i] = 0.6; // fixed confidence for momentum follow
    });

    // M18: Alternating pattern check
    let flips = 0;
    for(let i=1; i<Math.min(5, shortHistory.length); i++) {
        if (shortHistory[i].size !== shortHistory[i-1].size) flips++;
    }
    p[18] = shortHistory[0]?.size === 'Big' ? 'Small' : 'Big'; // Assume flip
    c[18] = flips === 4 ? 0.8 : 0.5;

    // M19: Streak breaker extreme strict
    let strk = 1;
    for (let i=1; i<shortHistory.length; i++) {
        if(shortHistory[i].size === shortHistory[0].size) strk++;
        else break;
    }
    p[19] = shortHistory[0]?.size === 'Big' ? 'Small' : 'Big';
    c[19] = Math.min(0.9, 0.4 + (strk * 0.1));

    // Advanced Technical Indicators (M20-M24)
    // Extract numerical sequence chronologically (oldest to newest)
    const nums = [...shortHistory].reverse().map(x => x.number);

    // M20: MACD (12, 26) - Moving Average Convergence Divergence
    const calcEMA = (data: number[], period: number) => {
        if (data.length < period) return 4.5;
        const k = 2 / (period + 1);
        let ema = data.slice(0, period).reduce((a,b)=>a+b,0) / period;
        for (let i = period; i < data.length; i++) ema = (data[i] - ema) * k + ema;
        return ema;
    };
    const ema12 = calcEMA(nums, 12);
    const ema26 = calcEMA(nums, 26);
    const macd = ema12 - ema26;
    p[20] = macd > 0.3 ? 'Big' : (macd < -0.3 ? 'Small' : (shortHistory[0]?.size || 'Big'));
    c[20] = 0.5 + Math.min(0.4, Math.abs(macd));

    // M21: MACD Momentum (Derivative)
    const prevEma12 = calcEMA(nums.slice(0, -1), 12);
    const prevEma26 = calcEMA(nums.slice(0, -1), 26);
    const prevMacd = prevEma12 - prevEma26;
    const macdHist = macd - prevMacd;
    p[21] = macdHist > 0 ? 'Big' : 'Small';
    c[21] = 0.5 + Math.min(0.4, Math.abs(macdHist)*2);

    // M22: Bollinger Bands (20, 2)
    if (nums.length >= 20) {
        const slice = nums.slice(-20);
        const sma = slice.reduce((a,b)=>a+b,0) / 20;
        const stdev = Math.sqrt(slice.reduce((a,b)=>a+Math.pow(b-sma, 2),0)/20);
        const upper = sma + 2*stdev;
        const lower = sma - 2*stdev;
        const current = nums[nums.length-1];
        if (current > upper) { p[22] = 'Small'; c[22] = 0.75; } // Mean Reversion from Overbought
        else if (current < lower) { p[22] = 'Big'; c[22] = 0.75; } // Mean Reversion from Oversold
        else { p[22] = sma > 4.5 ? 'Big' : 'Small'; c[22] = 0.55; }
    }

    // M23: Stochastic Oscillator %K (14)
    if (nums.length >= 14) {
        const slice = nums.slice(-14);
        const highest = Math.max(...slice);
        const lowest = Math.min(...slice);
        const current = nums[nums.length-1];
        const k = (highest - lowest) === 0 ? 50 : ((current - lowest) / (highest - lowest)) * 100;
        if (k > 80) { p[23] = 'Small'; c[23] = 0.7; }
        else if (k < 20) { p[23] = 'Big'; c[23] = 0.7; }
        else { p[23] = k > 50 ? 'Big' : 'Small'; c[23] = 0.55; }
    }

    // M24: Fast/Slow Simple Moving Average Cross (5, 10)
    if (nums.length >= 10) {
        const last5Avg = nums.slice(-5).reduce((a,b)=>a+b,0) / 5;
        const last10Avg = nums.slice(-10).reduce((a,b)=>a+b,0) / 10;
        p[24] = last5Avg > last10Avg ? 'Big' : 'Small';
        c[24] = 0.55 + Math.min(0.3, Math.abs(last5Avg - last10Avg)*0.1);
    }

    // M25: Rate of Change (ROC) Momentum
    if (nums.length >= 7) {
        const current = nums[nums.length-1];
        const past = nums[nums.length-7];
        const roc = ((current - past) / (past === 0 ? 1 : past)) * 100;
        p[25] = roc > 0 ? 'Big' : 'Small';
        c[25] = 0.5 + Math.min(0.4, Math.abs(roc) / 200);
    }

    // M26: Elliott Wave Simplification (Higher Highs / Lower Lows over 5 peaks)
    if (nums.length >= 15) {
        let highs = 0, lows = 0;
        for (let i = nums.length - 5; i < nums.length; i++) {
            if (nums[i] > nums[i-1]) highs++;
            else if (nums[i] < nums[i-1]) lows++;
        }
        p[26] = highs > lows ? 'Big' : 'Small';
        c[26] = 0.5 + Math.abs(highs - lows) * 0.08;
    }

    // M27: Fibonacci Gravity Thresholds (Approaching 6.18, 3.82 equivalent levels)
    if (nums.length >= 5) {
        const last = nums[nums.length-1];
        if (Math.abs(last - 6.18) < 1.0) { p[27] = 'Small'; c[27] = 0.6; }
        else if (Math.abs(last - 3.82) < 1.0) { p[27] = 'Big'; c[27] = 0.6; }
        else { p[27] = last >= 5 ? 'Big' : 'Small'; c[27] = 0.5; }
    }

    // M28: Dual-Weight Parabolic Time (Giving more exponential weight to most recent 3 items)
    if (nums.length >= 3) {
        const weightSum = (nums[nums.length-1]*0.6) + (nums[nums.length-2]*0.3) + (nums[nums.length-3]*0.1);
        p[28] = weightSum >= 4.5 ? 'Big' : 'Small';
        c[28] = 0.6 + Math.abs(weightSum - 4.5) * 0.05;
    }

    // M29: Volatility Variance Breakout
    if (nums.length >= 10) {
        const recentVol = Math.abs(nums[nums.length-1] - nums[nums.length-2]);
        const historyVol = nums.slice(-10).reduce((a,b,i,arr)=>i>0?a+Math.abs(b-arr[i-1]):a,0)/9;
        if (recentVol > historyVol * 1.5) {
            p[29] = nums[nums.length-1] >= 5 ? 'Small' : 'Big'; // Snapback expect logic
            c[29] = 0.7;
        } else {
            p[29] = nums[nums.length-1] >= 5 ? 'Big' : 'Small';
            c[29] = 0.55;
        }
    }

    return { preds: p, confs: c };
}

async function analyzeAdvancedMarketWithML(historyRaw: any[], adminData: any) {
    if (historyRaw.length > 0) {
       for (let i = historyRaw.length - 1; i >= 0; i--) {
          await saveHistoryData(historyRaw[i]);
       }
    }
    const dbHistory = await getHistoryData();

    const mergedHistory = dbHistory.length > historyRaw.length ? dbHistory : historyRaw;

    const shortHistory = mergedHistory.map((item: any) => ({
        size: Number(item.number) >= 5 ? 'Big' : 'Small',
        number: Number(item.number)
    })).slice(0, 500); 

    // Neural Integration
    await syncLSTMSmartBrain();
    let neuralConfidence = 0.5;
    try {
        let inputVector: number[] = [];
        for(let i=0; i<100; i++) {
            inputVector.push(shortHistory[i] ? (shortHistory[i].size === 'Big' ? 1 : 0) : Math.random() > 0.5 ? 1 : 0);
        }
        let bCount = 0; let streak = 1; let vol = 0;
        for(let i=0; i<20; i++) {
            if(shortHistory[i] && shortHistory[i].size === 'Big') bCount++;
            if(shortHistory[i] && shortHistory[i+1] && shortHistory[i].size === shortHistory[i+1].size) streak++; 
            else streak=1;
            vol += Math.abs((shortHistory[i]?.number || 0) - (shortHistory[i+1]?.number || 0));
            inputVector.push(bCount/(i+1)); 
            inputVector.push(streak/10); 
            inputVector.push(vol/100); 
        }
        inputVector = inputVector.slice(0, 120);
        const out = globalLSTM.activate(inputVector); 
        neuralConfidence = out[0];
    } catch (e) { }

    const mode = adminData.userMode === 'SAFE' ? 'SAFE' : 'AGGRESSIVE';
    const advancedOutput = advancedEngine.analyze(shortHistory, mode);

    let finalPrediction = advancedOutput.size;
    let finalConfidence = advancedOutput.confidence;

     if (adminData.manualOverride) {
         finalPrediction = adminData.manualOverride;
     }

     return {
        predictionValue: finalPrediction,
        confidenceValue: `${finalConfidence}%`,
        isUnsafe: advancedOutput.safety === 'UNSAFE',
        safetyMode: advancedOutput.safety,
        unsafeReason: advancedOutput.unsafeReason,
        details: advancedOutput.reasoning.join(' | '),
        models: advancedOutput.individualPredictions,
        signalsUsed: advancedOutput.signalsUsed,
        predictedNumber: advancedOutput.number
     };
}

async function startMarketPoller() {
   setInterval(async () => {
      try {
         const list = await loadLatestMarket();
         if (!list || list.length === 0) return;
         
         const latestItem = list[0];
         if (!latestItem) return;

         const now = new Date();
         const currUTC = now.getTime();
         const currBSTOffset = 6 * 60 * 60 * 1000;
         const dBST = new Date(currUTC + currBSTOffset);
         const hours = dBST.getUTCHours();
         
         // SLEEP FROM 3AM to 5AM BST
         if (hours >= 3 && hours < 5) {
             return;
         }
         
         // Notify at 2AM last minute or somewhere block
         if (hours === 5) { isSleepNotified = false; dailySignalsCount = 0; dailyWinsCount = 0; }
         if (hours === 2 && dBST.getUTCMinutes() >= 58 && !isSleepNotified) {
             const adminData = await getAdminData();
             const subs = adminData.telegramSubscribers || [];
             isSleepNotified = true;
             for(const sub of subs) {
                 try {
                     bot?.sendMessage(sub, `⚠️ *Update from DEVIL RASHED AI* ⚠️

আজকে সারাদিন আমাদের বট এর 🎯 *${dailySignalsCount}* টা সিগন্যাল আর 🏆 *${dailyWinsCount}* টা উইন দিয়েছে!

বটের ব্রেইন একটু রেস্ট নিবে এখন, মার্কেট রিফ্রেশ হবে। বট আগামী ২ ঘণ্টা (৩:০০ থেকে ৫:০০ টা পর্যন্ত) বন্ধ থাকবে!
কালকে আবার আগুন হবে! 🔥`, { parse_mode: 'Markdown' });
                 } catch(e){}
             }
         }
         
         const latestIssue = {
             issueNumber: latestItem.issueNumber,
             number: Number(latestItem.number),
             color: latestItem.color === 'red' ? 'Red' : latestItem.color === 'green' ? 'Green' : 'Green/Purple',
             size: Number(latestItem.number) >= 5 ? 'Big' : 'Small'
         };

         if (lastTrackedIssue !== latestIssue.issueNumber) {
             const adminData = await getAdminData();

             if (_quotaExceeded) {
                 if (!(global as any).quotaLockNotified) {
                     const subs = adminData.telegramSubscribers || [];
                     for (const chatId of subs) {
                         bot?.sendMessage(chatId, "⚠️ *Firebase Quota Exceeded/Database Locked!* ⚠️\n\nবটের ডাটাবেস এর ডেইলি লিমিট শেষ হয়ে গেছে বা ফায়ারবেসের সংযোগ বিচ্ছিন্ন। Quota reset হওয়ার পর আবার স্বয়ংক্রিয়ভাবে প্রেডিকশন শুরু হবে। সাময়িক অসুবিধার জন্য দুঃখিত!", { parse_mode: 'Markdown' }).catch(()=>{});
                     }
                     (global as any).quotaLockNotified = true;
                 }
                 return; // Stop predicting until quota resumes
             }
             (global as any).quotaLockNotified = false; // Reset if resumed

             if (adminData.maintenanceMode) return;

             let winMatched = false;
             let resolvedUpdateText = "";
             let streakMsgToSend: string | null = null;
             let mainStkToSend: string | null = null;
             let flexStkToSend: string | null = null;
             let lossStkToSend: string | null = null;

              // 1. Resolve previous prediction & Train AI
             if (nextPrediction && nextPrediction.issue === latestIssue.issueNumber) {
                 // Train Engine with actual result
                 if (nextPrediction.models) {
                     const sizeHist = list.map((h: any) => h.number >= 5 ? 'Big' : 'Small').slice(1, 10);
                     advancedEngine.feedback(nextPrediction.models, latestIssue.size, sizeHist);
                     // Save memory forever
                     if (!_quotaExceeded && WEIGHTS_DOC) {
                         safeSetDoc(WEIGHTS_DOC, { 
                              engineWeights: advancedEngine.getWeights(),
                              engineMemory: advancedEngine.getSequenceMemory() 
                         }, { merge: true }).catch(()=>{});
                     }
                 }
                 winMatched = nextPrediction.suggest !== 'SKIP' && ((latestIssue.size === nextPrediction.suggest) || (latestIssue.size === (latestIssue.number >= 5 ? 'Big' : 'Small') && (latestIssue.number >= 5 ? 'Big' : 'Small') === nextPrediction.suggest));
                 
                 if (nextPrediction.suggest !== 'SKIP') {
                     dailySignalsCount++;
                     if (winMatched) dailyWinsCount++;
                     
                     // Challenge Tracking
                     for (const chatIdStr in userChallenges) {
                         const chId = Number(chatIdStr);
                         const cState = userChallenges[chId];
                         if (!cState) continue;
                         
                         const step = cState.currentLossStep;
                         const betAmount = cState.betSeries[step];
                         
                         if (winMatched) {
                            cState.balance += (betAmount * 0.95); // Assuming roughly 1.95x return
                            cState.currentLossStep = 0; // Reset step on win
                         } else {
                            cState.balance -= betAmount;
                            cState.currentLossStep = Math.min(cState.maxSteps - 1, step + 1);
                         }
                         
                         if (cState.balance >= cState.target) {
                             const opts = {
                                 reply_markup: {
                                    inline_keyboard: [
                                        [{text: "👉 আরও প্রেডিকশন চাই", callback_data: "challenge_more"}, {text: "⛔ বন্ধ করুন", callback_data: "challenge_stop"}]
                                    ]
                                 }
                             };
                             bot?.sendMessage(chId, `🎉 শোনো তোমার টার্গেট আমি পূরণ করেছি ৳${cState.balance.toFixed(2)} পর্যন্ত!\n\n⚠️ কখনোই মার্কেট এ টার্গেট এর বেশি ট্রেড নিবা না! তাহলে তুমি পরে লস করতে পারো। এখন ট্রেড বন্ধ করো এবং প্রফিট ক্যাশ আউট করো।`, opts);
                             
                             // Unsubscribe to protect them from overtrading
                             if (adminData.telegramSubscribers) {
                                 adminData.telegramSubscribers = adminData.telegramSubscribers.filter((id:any) => id !== chId);
                                 saveAdminData(adminData).catch(()=>{});
                             }
                             delete userChallenges[chId];
                         }
                     }
                 }
                 
                 // ---> SELF LEARNING UPDATE <---
                 if (nextPrediction.models && typeof nextPrediction.models === 'object' && !Array.isArray(nextPrediction.models)) {
                      advancedEngine.feedback(nextPrediction.models, latestIssue.size);
                 }
                 
                 // ---> SYNAPTIC NEURAL NET DEEP LEARNING <---
                 try {
                     const isBig = latestIssue.size === 'Big' ? 1 : 0;
                     // Extract long history safely to avoid NaN poisoning
                     const dbHistory = await getHistoryData();
                     const mergedHistory = dbHistory.length > list.length ? dbHistory : list;
                     const hist = mergedHistory.map((item: any) => ({ size: Number(item.number) >= 5 ? 'Big' : 'Small', num: Number(item.number) })) || [];
                     
                     let inputVector: number[] = [];
                     for(let i=1; i<=100; i++) {
                         inputVector.push(hist[i]?.size === 'Big' ? 1 : 0);
                     }
                     let bCount = 0; let streak = 1; let vol = 0;
                     for(let i=1; i<=20; i++) {
                         if(hist[i] && hist[i].size === 'Big') bCount++;
                         if(hist[i] && hist[i+1] && hist[i].size === hist[i+1].size) streak++; 
                         else streak=1;
                         
                         const num1 = hist[i] ? hist[i].num : 0;
                         const num2 = hist[i+1] ? hist[i+1].num : 0;
                         if (!isNaN(num1) && !isNaN(num2)) {
                             vol += Math.abs(num1 - num2);
                         }
                         
                         inputVector.push((bCount/i));
                         inputVector.push(streak/10); 
                         inputVector.push(vol/100); 
                     }
                     // strictly constrain to 120 inputs
                     inputVector = inputVector.slice(0, 120);
                     
                     // Make sure NO NaN values made it to the vector
                     inputVector = inputVector.map(v => isNaN(v) ? 0 : v);
                     
                     rashedTrainer.train([{ input: inputVector, output: [isBig] }], {
                         rate: 0.1,
                         iterations: 5,
                         error: 0.005,
                         shuffle: true
                     });
                     saveLSTMSmartBrain(); // Async background matrix save
                 } catch(err) { console.error("Neural training error", err); }


                 const statusText = winMatched ? "✅ 𝗦𝗨𝗣𝗘𝗥 𝗪𝗜𝗡 🚀" : "❌ 𝗟𝗢𝗦𝗦 ⚠️";
                 const colorStr = latestIssue.color || "Unknown";
                 let sizeEmoji = (latestIssue.number >= 5 ? 'Big' : 'Small') === 'Big' ? '🟢' : '🔴';
                 const sizeStr = `${sizeEmoji} ${latestIssue.size || (latestIssue.number >= 5 ? 'Big' : 'Small')}`;
                 
                 resolvedUpdateText = `✧⋄⋆⋅⋆⋄✧⋄⋆⋅⋆⋄✧⋄⋆⋅⋆⋄✧\n👑  *R E S U L T S*  👑\n✧⋄⋆⋅⋆⋄✧⋄⋆⋅⋆⋄✧⋄⋆⋅⋆⋄✧\n\n🔖 𝗣𝗲𝗿𝗶𝗼𝗱: \`${nextPrediction.issue}\`\n\n🧠 ${nextPrediction.suggest === 'Big' ? '🟩 𝗕𝗜𝗚' : (nextPrediction.suggest === 'Small' ? '🟥 𝗦𝗠𝗔𝗟𝗟' : '🛑 𝗦𝗞𝗜𝗣')}\n🎯 ${sizeStr} (${latestIssue.number}) ${colorStr.replace('Green', '🟢').replace('Red', '🔴').replace('Violet', '🟣')}\n\n✅ *${nextPrediction.suggest === 'SKIP' ? '⚪ NO TRADE (Market Risk)' : statusText}*
${winMatched ? `🔥 𝗔𝗰𝘁𝗶𝘃𝗲 𝗦𝘁𝗿𝗲𝗮𝗸: ${globalWinStreak + 1}x Win 🔥` : ''}`;

                 if (winMatched) {
                     globalWinStreak++;
                     globalLossStreak = 0;
                     let sKey = `${globalWinStreak}x`;
                     if (globalWinStreak > 10) sKey = '10x';
                     mainStkToSend = adminData.stickers?.[sKey];
                     flexStkToSend = adminData.stickers?.['Flex'];
                     streakMsgToSend = globalWinStreak >= 2 ? `🔥 বুম! বটের টানা *${globalWinStreak}* টা ব্যাক-টু-ব্যাক উইন! 🚀` : null;
                 } else {
                     globalWinStreak = 0;
                     globalLossStreak++;
                     lossStkToSend = adminData.stickers?.['Loss'];
                 }
             }

             // 2. Generate new prediction for next block
             lastTrackedIssue = latestIssue.issueNumber;
             const nextIssueNum = String(BigInt(latestIssue.issueNumber) + 1n);

             const advancedAnalysis = await analyzeAdvancedMarketWithML(list, adminData);

             nextPrediction = { 
                 issue: nextIssueNum, 
                 suggest: advancedAnalysis.predictionValue, 
                 confidence: advancedAnalysis.confidenceValue,
                 models: advancedAnalysis.models 
             };

             const marketStatusAlert = advancedAnalysis.isUnsafe ? 
                        `\n\n⚠️ *Market Risk:* ${advancedAnalysis.unsafeReason}` : "";

             const safeEmo = advancedAnalysis.safetyMode === 'SAFE' ? '✅ HIGHLY SAFE' : (advancedAnalysis.safetyMode === 'RISKY' ? '⚠️ RISKY PLAY' : '🛑 UNSAFE');
             const suggestPretty = nextPrediction.suggest === 'Big' ? '🟢 *B I G* 🟢' : (nextPrediction.suggest === 'Small' ? '🔴 *S M A L L* 🔴' : '🛑 *S K I P* 🛑');

             const numStr = advancedAnalysis.predictedNumber !== null ? `\n> 🎰 *𝗣𝗿𝗼𝗯𝗮𝗯𝗹𝗲 𝗡𝘂𝗺𝗯𝗲𝗿:*  \` ${advancedAnalysis.predictedNumber} \`` : '';

             
             const subs = adminData.telegramSubscribers || [];
             
             // Challenge Logic to precalculate user specific custom messages
             const customMessages: Record<number, string> = {};
             for(let chId of Object.keys(userChallenges)) {
                 const st = userChallenges[Number(chId)];
                 if (!st) continue;
                 const stepStr = `\n\n🎯 *Challenge Bet:* ৳${st.betSeries[st.currentLossStep]} (Step ${st.currentLossStep + 1})`;
                 customMessages[Number(chId)] = `💎 *𝗗𝗘𝗩𝗜𝗟 𝗥𝗔𝗦𝗛𝗘𝗗 𝗔𝗜* 💎\n*━━━━━━━━━━━━━━━━━━━━*\n> 🔖 *𝗣𝗲𝗿𝗶𝗼𝗱:* \`${nextPrediction.issue}\`\n> 📊 *𝗟𝗲𝘃𝗲𝗹:*  Lvl ${Math.min(globalLossStreak + 1, 6)} Bet${numStr}\n\n🧠 *𝗔𝗜 𝗣𝗿𝗲𝗱𝗶𝗰𝘁𝗶𝗼𝗻:*\n👉  *${suggestPretty}*  👈\n\n> 🎯 *𝗖𝗼𝗻𝗳𝗶𝗱𝗲𝗻𝗰𝗲:* \`${nextPrediction.confidence?.includes('%') ? nextPrediction.confidence : nextPrediction.confidence + '%'}\`\n> 🛡️ *𝗔𝗻𝗮𝗹𝘆𝘀𝗶𝘀:* \`${advancedAnalysis.signalsUsed?.length || 'Multiple'} Sub-Models Integrated\`\n> ⚡ *𝗦𝗮𝗳𝗲𝘁𝘆:* \`${safeEmo}\`\n*━━━━━━━━━━━━━━━━━━━━*${stepStr}\n${marketStatusAlert}`;
             }
             
             const newMsgText = `💎 *𝗗𝗘𝗩𝗜𝗟 𝗥𝗔𝗦𝗛𝗘𝗗 𝗔𝗜* 💎\n*━━━━━━━━━━━━━━━━━━━━*\n> 🔖 *𝗣𝗲𝗿𝗶𝗼𝗱:* \`${nextPrediction.issue}\`\n> 📊 *𝗟𝗲𝘃𝗲𝗹:*  Lvl ${Math.min(globalLossStreak + 1, 6)} Bet${numStr}\n\n🧠 *𝗔𝗜 𝗣𝗿𝗲𝗱𝗶𝗰𝘁𝗶𝗼𝗻:*\n👉  *${suggestPretty}*  👈\n\n> 🎯 *𝗖𝗼𝗻𝗳𝗶𝗱𝗲𝗻𝗰𝗲:* \`${nextPrediction.confidence?.includes('%') ? nextPrediction.confidence : nextPrediction.confidence + '%'}\`\n> 🛡️ *𝗔𝗻𝗮𝗹𝘆𝘀𝗶𝘀:* \`${advancedAnalysis.signalsUsed?.length || 'Multiple'} Sub-Models Integrated\`\n> ⚡ *𝗦𝗮𝗳𝗲𝘁𝘆:* \`${safeEmo}\`\n*━━━━━━━━━━━━━━━━━━━━*\n${marketStatusAlert}`;

             const oldSentMessages = sentMessagesForNextPrediction;
             sentMessagesForNextPrediction = {}; // Reset globally so live updates stop for the old one

             // 3. Perfect Sequencing Broadcast: Update Result -> Send Sticker -> Send Next Prediction
             broadcastChunked(subs, async (chatId: any) => {
                 try {
                     // Step A: Update to result
                     if (resolvedUpdateText && oldSentMessages[chatId]) {
                         await bot?.editMessageText(resolvedUpdateText, { chat_id: chatId, message_id: oldSentMessages[chatId] as number, parse_mode: 'Markdown' }).catch(()=>{});
                     }
                     
                     // Step B: Send Stickers sequentially after result
                     if (resolvedUpdateText) {
                         if (winMatched) {
                             if (streakMsgToSend) await bot?.sendMessage(chatId, streakMsgToSend, { parse_mode: 'Markdown' }).catch(()=>{});
                             
                             // Single sticker logic, double sticker disabled as per user request
                             if (mainStkToSend) {
                                 await bot?.sendSticker(chatId, mainStkToSend).catch(()=>{});
                             }
                             if (adminData.winAudioIds && adminData.winAudioIds.length > 0) {
                                 const audioItem = adminData.winAudioIds[Math.floor(Math.random() * adminData.winAudioIds.length)];
                                 // Handle both old string array and new object array {type, id}
                                 const aType = typeof audioItem === 'string' ? 'voice' : audioItem.type;
                                 const aId = typeof audioItem === 'string' ? audioItem : audioItem.id;
                                 
                                 if (aType === 'voice') await bot?.sendVoice(chatId, aId).catch(()=>bot?.sendAudio(chatId, aId).catch(()=>{}));
                                 else await bot?.sendAudio(chatId, aId).catch(()=>bot?.sendVoice(chatId, aId).catch(()=>{}));
                             } else if (adminData.winAudioId) {
                                 await bot?.sendVoice(chatId, adminData.winAudioId).catch(() => bot?.sendAudio(chatId, adminData.winAudioId).catch(()=>{}));
                             }
                             
                             // 🔥 Premium Telegram Animated Logic for WIN (Native effect)
                             // Fallback to sending standalone emoji which Telegram natively auto-animates full screen
                             const animations = ['🎉', '🔥', '🎊', '🎈', '🎆', '🎰'];
                             const randomAnim = animations[Math.floor(Math.random() * animations.length)];
                             // @ts-ignore - effect_id supported in newer telegram API, we pass it safely in options
                             await bot?.sendMessage(chatId, randomAnim, {
                                 // message_effect_id map: 5046509860389126442 (🎉) 5104841245755180586 (🔥)
                                 message_effect_id: randomAnim === '🎉' ? '5046509860389126442' : randomAnim === '🔥' ? '5104841245755180586' : '5046589136895476101'
                             } as any).catch(() => {
                                 // Fallback
                                 bot?.sendMessage(chatId, randomAnim).catch(()=>{});
                             });
                         } else {
                             if (lossStkToSend) await bot?.sendSticker(chatId, lossStkToSend).catch(()=>{});
                             
                             if (adminData.lossAudioIds && adminData.lossAudioIds.length > 0) {
                                 const audioItem = adminData.lossAudioIds[Math.floor(Math.random() * adminData.lossAudioIds.length)];
                                 const aType = typeof audioItem === 'string' ? 'voice' : audioItem.type;
                                 const aId = typeof audioItem === 'string' ? audioItem : audioItem.id;
                                 if (aType === 'voice') await bot?.sendVoice(chatId, aId).catch(()=>bot?.sendAudio(chatId, aId).catch(()=>{}));
                                 else await bot?.sendAudio(chatId, aId).catch(()=>bot?.sendVoice(chatId, aId).catch(()=>{}));
                             }
                         }
                     }

                     // Step C: Send new prediction
                     const msg = await bot?.sendMessage(chatId, newMsgText, { 
                         parse_mode: 'Markdown'}).catch(()=>{});
                     if (msg) sentMessagesForNextPrediction[chatId] = msg.message_id;
                     
                     if (adminData.notifAudioIds && adminData.notifAudioIds.length > 0) {
                         const audioItem = adminData.notifAudioIds[Math.floor(Math.random() * adminData.notifAudioIds.length)];
                         const aType = typeof audioItem === 'string' ? 'voice' : audioItem.type;
                         const aId = typeof audioItem === 'string' ? audioItem : audioItem.id;
                         if (aType === 'voice') await bot?.sendVoice(chatId, aId).catch(()=>bot?.sendAudio(chatId, aId).catch(()=>{}));
                         else await bot?.sendAudio(chatId, aId).catch(()=>bot?.sendVoice(chatId, aId).catch(()=>{}));
                     }
                 } catch (e) {}
             });
         }
      } catch (e) {
         console.error("Poller Error:", e);
      }
   }, 1500); // Super fast 1.5 sec interval polling

   // Setup realtime countdown visualizer
   setInterval(() => {
      const activeIds = Object.keys(sentMessagesForNextPrediction);
      if (!nextPrediction || activeIds.length === 0) return;
      
      // TELEGRAM RATE LIMIT PROTECTION
      // When scaling to thousands of users, live-updating every message stops being feasible.
      // We will only do live real-time countdowns if viewers < 50, otherwise we save server load.
      if (activeIds.length > 50) return;

      const remainingSeconds = 60 - new Date().getSeconds();
      if (remainingSeconds < 2 || remainingSeconds > 58) return; // don't update on boundaries

      // Minimal safe str parsing
      const suggestPretty = nextPrediction.suggest === 'Big' ? '🟩 *𝗕 𝗜 𝗚* 🟩' : (nextPrediction.suggest === 'Small' ? '🟥 *𝗦 𝗠 𝗔 𝗟 𝗟* 🟥' : '🛑 *𝗦 𝗞 𝗜 𝗣* 🛑');
      let confVal = parseInt(String(nextPrediction.confidence).replace(/[^0-9]/g, ''));
      const text = `👑 *𝗗𝗘𝗩𝗜𝗟 𝗥𝗔𝗦𝗛𝗘𝗗 𝗔𝗜 𝗣𝗥𝗢* 👑\n✦ ━━━━━━━━━━━━━━━━ ✦\n 🔖 *𝗣𝗲𝗿𝗶𝗼𝗱:* \`${nextPrediction.issue}\`\n 📊 *𝗟𝗲𝘃𝗲𝗹:* \`Lvl ${Math.min(globalLossStreak + 1, 6)} Bet\`\n\n 🧠 *𝗔𝗜 𝗣𝗿𝗲𝗱𝗶𝗰𝘁𝗶𝗼𝗻:*\n 👉  *${suggestPretty}*  👈\n\n 🔮 *𝗖𝗼𝗻𝗳𝗶𝗱𝗲𝗻𝗰𝗲:* \`${confVal}%\`\n ⚡ *𝗔𝗰𝘁𝗶𝗼𝗻:* \`System Armed\`\n✦ ━━━━━━━━━━━━━━━━ ✦\n\n👉 ⏳ *𝗧𝗶𝗺𝗲 𝗟𝗲𝗳𝘁:* ⏱️ \`${remainingSeconds}s\` 🚀`;

      const prevEdits = Object.entries(sentMessagesForNextPrediction);
      broadcastChunked(prevEdits, async ([chatId, msgId]) => {
          await bot?.editMessageText(text, { 
              chat_id: chatId, 
              message_id: msgId as number, 
              parse_mode: 'Markdown'}).catch(()=>{});
      });
   }, 3000); // Check and update every 3 seconds instead of 10 for faster sync

   // Background task to constantly verify members
   let checkIndex = 0;
   setInterval(async () => {
       try {
           const adminData = await getAdminData();
           const subs = adminData.telegramSubscribers || [];
           if (subs.length === 0) return;
           if (checkIndex >= subs.length) checkIndex = 0;
           const chatId = subs[checkIndex];
           
           try {
               const check = await bot?.getChatMember(TARGET_CHANNEL, chatId);
               const isMember = check && ['member', 'administrator', 'creator'].includes(check.status);
               if (!isMember) {
                   adminData.telegramSubscribers = subs.filter((id:any) => id !== chatId);
                   await saveAdminData(adminData);
                   bot?.sendMessage(chatId, "⚠️ আপনি চ্যানেল থেকে লিভ নিয়েছেন! বট আপনাকে প্রেডিকশন সেন্ড করা বন্ধ করে দিয়েছে। আবার পেতে চ্যানেলে জয়েন করুন এবং /start লিখুন।");
               }
           } catch(e) { /* ignore to avoid blowing up on user block/not found */ }
           checkIndex++;
       } catch(e){}
   }, 4000); // 1 check every 4 seconds = ~15 users/min (safe telegram rate limit)
}
// ============================================

function showBotAdminPanel(chatId: number) {
    const opts = {
        reply_markup: {
            inline_keyboard: [
                [{ text: "👥 View Users", callback_data: "adm_users" }, { text: "🚫 Block User", callback_data: "adm_block" }],
                [{ text: "⏸️ Toggle Bot Power", callback_data: "adm_power" }, { text: "📢 Broadcast", callback_data: "adm_broadcast" }],
                [{ text: "🖼️ Set Flex Stickers", callback_data: "adm_stickers" }, { text: "🎵 Audio & Sounds", callback_data: "adm_sounds" }],
                [{ text: "📊 AI Analytics", callback_data: "adm_analytics" }, { text: "⚙️ AI Risk Mode", callback_data: "adm_risk" }],
                [{ text: "🧠 Flush Memory", callback_data: "adm_flush" }, { text: "✂️ Close", callback_data: "adm_close" }]
            ]
        }
    };
    bot?.sendMessage(chatId, "👑 *DEVIL RASHED ADMIN PANEL*\nSelect an action:", { parse_mode: 'Markdown', ...opts });
}

// Start Server
async function startServer() {
  // Setup Telegram Routes
  if (bot) {
    bot.onText(/\/admin/, async (msg) => {
        const chatId = msg.chat.id;
        if (adminSessions.has(chatId)) return showBotAdminPanel(chatId);
        adminStates[chatId] = { step: 'AWAITING_USER' };
        bot?.sendMessage(chatId, "🔐 Enter Admin Username:");
    });

    bot.onText(/\/challenge/, async (msg) => {
        const chatId = msg.chat.id;
        userModeStates[chatId] = { step: 'AWAITING_BALANCE' };
        bot?.sendMessage(chatId, "🎮 *টার্গেট চ্যালেঞ্জ মোড* 🎮\n\nআপনার বর্তমান ব্যালেন্স কতো টাকা আছে? (অংকে লিখুন)", { parse_mode: 'Markdown' });
    });

    bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const firstName = msg.from?.first_name || 'ইউজার';
      const adminData = await getAdminData();
      
      if (adminData.blockedUsers[chatId]) {
         bot?.sendMessage(chatId, adminData.blockedUsers[chatId]);
         return;
      }
        
      if (_quotaExceeded && !adminSessions.has(chatId)) {
         bot?.sendMessage(chatId, "⚠️ *Firebase Quota Exceeded/Database Locked!*\n\nবটের ডাটাবেস এর ডেইলি লিমিট শেষ হয়ে গেছে। Quota reset হওয়ার পর আবার প্রেডিকশন শুরু হবে। সাময়িক অসুবিধার জন্য দুঃখিত!", { parse_mode: 'Markdown' });
         return;
      }
      if (adminData.maintenanceMode && !adminSessions.has(chatId)) {
         bot?.sendMessage(chatId, adminData.maintenanceMessage);
         return;
      }

      if (!adminData.telegramSubscribers) adminData.telegramSubscribers = [];
      const isSubscribed = adminData.telegramSubscribers.includes(chatId);

      if (!isSubscribed) {
          const opts = {
              reply_markup: {
                  inline_keyboard: [
                      [{ text: "📣 জয়েন চ্যানেল (Join Channel)", url: `https://t.me/${TARGET_CHANNEL.replace('@', '')}` }],
                      [{ text: "✅ চেক করুন (Verify Membership)", callback_data: "verify_join" }]
                  ]
              }
          };
          bot?.sendMessage(chatId, `🔥 হ্যালো ${firstName}!\n\nWinGo এর কনফার্ম সিগন্যাল পেতে আগে আমাদের অফিসিয়াল চ্যানেলে জয়েন করুন।\n\nজয়েন করার পর **"✅ চেক করুন"** বাটনে ক্লিক করুন।`, { parse_mode: 'Markdown', ...opts });
      } else {
          // Provide User with ON/OFF Control Buttons
          const userOpts = {
              reply_markup: {
                  keyboard: [
                      [{ text: "🔔 Turn ON Predictions" }, { text: "🔕 Turn OFF Predictions" }]
                  ],
                  resize_keyboard: true,
                  persistent: true
              }
          };
          bot?.sendMessage(chatId, `🔥 আবার স্বাগতম ${firstName}!\n\nলাইভ প্রেডিকশন চলতে থাকবে। আপনি চাইলে নিচের বাটন ব্যবহার করে বট থেকে মেসেজ আসা বন্ধ করতে বা চালু করতে পারবেন।`, userOpts);
      }
    });

    bot.on('message', async (msg) => {
       const chatId = msg.chat.id;
       const text = msg.text || '';
       if (text.startsWith('/')) return;

       const adminData = await getAdminData();


       // Challenge Mode Routing
       if (userModeStates[chatId]?.step === 'AWAITING_BALANCE') {
           const bal = parseInt((text || '').replace(/[^0-9]/g, ''));
           if (isNaN(bal) || bal < 50) {
               bot?.sendMessage(chatId, "⚠️ নূন্যতম ব্যালেন্স 50 টাকা হতে হবে। আপনার ব্যালেন্স অংকে লিখুন:");
               return;
           }
           userModeStates[chatId].step = 'AWAITING_TARGET';
           userModeStates[chatId].balance = bal;
           bot?.sendMessage(chatId, "🎯 আপনার টার্গেট প্রফিট (Target Profit) কতো? অংকে লিখুন:");
           return;
       }
       if (userModeStates[chatId]?.step === 'AWAITING_TARGET') {
           const target = parseInt((text || '').replace(/[^0-9]/g, ''));
           if (isNaN(target) || target <= userModeStates[chatId].balance) {
               bot?.sendMessage(chatId, "⚠️ টার্গেট অবশ্যই ব্যালেন্স এর থেকে বেশি হতে হবে! সঠিক টার্গেট লিখুন:");
               return;
           }
           
           const bal = userModeStates[chatId].balance;
           // Calculate 5 step martingale: 1+2+4+8+16 = 31 parts
           const baseBet = Math.max(1, Math.floor(bal / 31));
           const series = [baseBet, baseBet*2, baseBet*4, baseBet*8, baseBet*16];
           
           userChallenges[chatId] = {
               balance: bal,
               target: target,
               currentLossStep: 0,
               maxSteps: 5,
               betSeries: series
           };
           delete userModeStates[chatId];
           
           // Turn on signals for this user
           if (!adminData.telegramSubscribers.includes(chatId)) {
               adminData.telegramSubscribers.push(chatId);
               await saveAdminData(adminData);
           }
           
           const calcMsg = `✅ *চ্যালেঞ্জ অ্যাক্টিভ করা হয়েছে!* 🚀

📌 আপনার ব্যালেন্স: ৳${bal}
🎯 লক্ষ্য: ৳${target}

🤖 *বট এর 5 টি ফান্ডিং স্টেপ:*
> Step 1: ৳${series[0]}
> Step 2: ৳${series[1]}
> Step 3: ৳${series[2]}
> Step 4: ৳${series[3]}
> Step 5: ৳${series[4]}

সবসময় স্টেপ ফলো করে ট্রেড করবেন। বট এখন সিগন্যাল দিবে!`;
           bot?.sendMessage(chatId, calcMsg, { parse_mode: 'Markdown' });
           return;
       }

       // Handle User ON/OFF Triggers
       if (text === '🔔 Turn ON Predictions') {
            if (!adminData.telegramSubscribers) adminData.telegramSubscribers = [];
            if (!adminData.telegramSubscribers.includes(chatId)) {
                adminData.telegramSubscribers.push(chatId);
                await saveAdminData(adminData);
                bot?.sendMessage(chatId, "✅ প্রেডিকশন রিসিভ করা চালু হয়েছে!");
            } else {
                bot?.sendMessage(chatId, "আপনি ইতিমধ্যেই প্রেডিকশন রিসিভ করছেন।");
            }
            return;
       }
       if (text === '🔕 Turn OFF Predictions') {
            if (adminData.telegramSubscribers && adminData.telegramSubscribers.includes(chatId)) {
                adminData.telegramSubscribers = adminData.telegramSubscribers.filter((id:any) => id !== chatId);
                await saveAdminData(adminData);
                bot?.sendMessage(chatId, "🔕 প্রেডিকশন মিউট করা হয়েছে। আবার চালু করতে 'Turn ON Predictions' বাটনে ক্লিক করুন।");
            }
            return;
       }

       // Handle Blocked / Maintenance
       if (adminData.blockedUsers[chatId]) return bot?.sendMessage(chatId, adminData.blockedUsers[chatId]);
       
       // Handle Admin Authenticaton State
       if (adminStates[chatId]?.step === 'AWAITING_USER') {
           if (text === 'devrashed6996') {
               adminStates[chatId].step = 'AWAITING_PASS';
               bot?.sendMessage(chatId, "🔑 Enter Password:");
           } else {
               delete adminStates[chatId];
               bot?.sendMessage(chatId, "❌ Wrong user.");
           }
           return;
       }
       if (adminStates[chatId]?.step === 'AWAITING_PASS') {
           if (text === 'rashedop6996') {
               delete adminStates[chatId];
               adminSessions.add(chatId);
               showBotAdminPanel(chatId);
           } else {
               delete adminStates[chatId];
               bot?.sendMessage(chatId, "❌ Wrong pass.");
           }
           return;
       }

       // Handle Admin Operations
       if (adminSessions.has(chatId) && adminStates[chatId]) {
           const state = adminStates[chatId];
           if (state.step === 'AWAITING_BLOCK_ID') {
               state.blockId = text.trim();
               state.step = 'AWAITING_BLOCK_MSG';
               return bot?.sendMessage(chatId, `Enter block message for user ${state.blockId}:`);
           }
           if (state.step === 'AWAITING_BLOCK_MSG') {
               adminData.blockedUsers[state.blockId] = text;
               await saveAdminData(adminData);
               delete adminStates[chatId];
               return bot?.sendMessage(chatId, `✅ User ${state.blockId} blocked with message: ${text}`);
           }
           if (state.step === 'AWAITING_BROADCAST') {
               const subs = adminData.telegramSubscribers || [];
               subs.forEach((sub: any) => bot?.sendMessage(sub, `📢 *Broadcast:*\n${text}`, { parse_mode: "Markdown" }).catch(()=>{}));
               delete adminStates[chatId];
               return bot?.sendMessage(chatId, `✅ Broadcast sent to ${subs.length} users.`);
           }
           if (state.step === 'AWAITING_POWER_MSG') {
               adminData.maintenanceMessage = text;
               adminData.maintenanceMode = true;
               await saveAdminData(adminData);
               delete adminStates[chatId];
               return bot?.sendMessage(chatId, `✅ Bot is OFF for users. Message set: ${text}`);
           }
           if (state.step.startsWith('SET_STICKER_') && msg.sticker) {
               const streakId = state.step.replace('SET_STICKER_', '');
               adminData.stickers[streakId] = msg.sticker.file_id;
               await saveAdminData(adminData);
               delete adminStates[chatId];
               return bot?.sendMessage(chatId, `✅ Sticker saved for: ${streakId}`);
           }
           if (state.step === 'SET_AUDIO_WIN' && (msg.voice || msg.audio)) {
               adminData.winAudioId = msg.voice ? msg.voice.file_id : (msg.audio ? msg.audio.file_id : undefined);
               await saveAdminData(adminData);
               delete adminStates[chatId];
               return bot?.sendMessage(chatId, `✅ Win Audio saved! Users will automatically hear this play when they Win.`);
           }
       }

       if (adminData.maintenanceMode && !adminSessions.has(chatId)) {
           return bot?.sendMessage(chatId, adminData.maintenanceMessage);
       }

       // If not admin, ignore any regular chat to prevent prediction interference
       if (!adminSessions.has(chatId)) return;

       // Gemini Chat exclusively for Admins (optional utility)
       try {
           const response = await ai.models.generateContent({
              model: "gemini-3.1-flash-preview",
              contents: [text],
              config: {
                 systemInstruction: "You are 'Devil Rashed AI', an advanced market predictor and strategy bot for WinGo lottery/trading. Speak in a friendly mix of Bangla and English (Banglish). Provide strategy tips, answer questions about risk management. Be concise."
              }
           });
           bot?.sendMessage(chatId, response.text || "Thinking...");
       } catch (e: any) {
           // Silently fail if busy
       }
    });

    bot.on('callback_query', async (query) => {
        const chatId = query.message?.chat.id;
        if (!chatId) return;
        const data = query.data;

        const adminData = await getAdminData();
        
        if (data === 'challenge_more') {
            bot?.sendMessage(chatId, "আপনি আবার প্রেডিকশন চালু করতে চাইলে /challenge লিখে নতুন টার্গেট সেট করুন।");
            bot?.answerCallbackQuery(query.id);
            return;
        }
        if (data === 'challenge_stop') {
            bot?.sendMessage(chatId, "প্রেডিকশন বন্ধ রাখা হয়েছে।");
            bot?.answerCallbackQuery(query.id);
            return;
        }

        if (data === 'verify_join') {
            try {
                const check = await bot?.getChatMember(TARGET_CHANNEL, chatId);
                if (check && ['member', 'administrator', 'creator'].includes(check.status)) {
                    if (!adminData.telegramSubscribers) adminData.telegramSubscribers = [];
                    if (!adminData.telegramSubscribers.includes(chatId)) {
                        adminData.telegramSubscribers.push(chatId);
                        await saveAdminData(adminData);
                    }
                    bot?.sendMessage(chatId, "✅ ভেরিফিকেশন সফল! আপনি এখন থেকে লাইভ প্রেডিকশন পাবেন।");
                } else {
                    bot?.sendMessage(chatId, `⚠️ আপনি এখনও [চ্যানেলে](${TARGET_CHANNEL.replace('@', 'https://t.me/')}) জয়েন করেননি! চ্যানেল জয়েন করে আবার চেষ্টা করুন।`, { parse_mode: 'Markdown' });
                }
            } catch(e) {
                console.error("Member Check Error:", e);
                bot?.sendMessage(chatId, "⚠️ এরর। (দয়া করে বটকে আপনার চ্যানেলের এডমিন করুন, নাহলে মেম্বারশিপ চেক করা সম্ভব নয়!)");
            }
            return;
        }

        if (!adminSessions.has(chatId)) return;
        
        if (data === 'adm_close') {
            bot?.sendMessage(chatId, "Panel closed.");
        } else if (data === 'adm_users') {
            const count = adminData.telegramSubscribers?.length || 0;
            bot?.sendMessage(chatId, `👥 Total Subscribers: ${count}\nBlocked Users: ${Object.keys(adminData.blockedUsers).length}`);
        } else if (data === 'adm_block') {
            adminStates[chatId] = { step: 'AWAITING_BLOCK_ID' };
            bot?.sendMessage(chatId, "Enter Telegram Chat ID to block:");
        } else if (data === 'adm_broadcast') {
            adminStates[chatId] = { step: 'AWAITING_BROADCAST' };
            bot?.sendMessage(chatId, "Enter broadcast message:");
        } else if (data === 'adm_power') {
            if (adminData.maintenanceMode) {
                adminData.maintenanceMode = false;
                await saveAdminData(adminData);
                bot?.sendMessage(chatId, "✅ Bot is now ON. Users will receive predictions.");
            } else {
                adminStates[chatId] = { step: 'AWAITING_POWER_MSG' };
                bot?.sendMessage(chatId, "Bot is turning OFF. Enter the custom message users should see:");
            }
        } else if (data === 'adm_stickers') {
            const opts = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "Set 1x", callback_data: "stk_1x" }, { text: "Set 2x", callback_data: "stk_2x" }, { text: "Set 3x", callback_data: "stk_3x" }],
                        [{ text: "Set 4x", callback_data: "stk_4x" }, { text: "Set 5x", callback_data: "stk_5x" }, { text: "Set 6x", callback_data: "stk_6x" }],
                        [{ text: "Set 7x", callback_data: "stk_7x" }, { text: "Set 8x", callback_data: "stk_8x" }, { text: "Set 9x", callback_data: "stk_9x" }],
                        [{ text: "Set 10x", callback_data: "stk_10x" }, { text: "Set Flex (Fast)", callback_data: "stk_Flex" }, { text: "Set Loss", callback_data: "stk_Loss" }]
                    ]
                }
            };
            bot?.sendMessage(chatId, "Send a sticker for which streak?", opts);
        } else if (data === 'adm_sounds') {
            const opts = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "🎉 Set WIN Sounds", callback_data: "adm_audio_win" }],
                        [{ text: "⚠️ Set LOSS Sounds", callback_data: "adm_audio_loss" }],
                        [{ text: "🔔 Set NOTIFICATION Sounds", callback_data: "adm_audio_notif" }],
                        [{ text: "🗑️ Clear ALL Sounds", callback_data: "clear_audio" }]
                    ]
                }
            };
            bot?.sendMessage(chatId, "🎵 *Manage Bot Sounds & Effects*\nSelect a category below to add multiple sounds to it. Bot picks one randomly from the category.", { parse_mode: 'Markdown', ...opts });
        } else if (data?.startsWith('adm_audio_')) {
            const type = data.replace('adm_audio_', '');
            adminStates[chatId] = { step: `SET_AUDIO_${type.toUpperCase()}` };
            bot?.sendMessage(chatId, `🎵 Send me Voice/Audio files for ${type.toUpperCase()}. You can send multiple. They will be picked randomly.`);
        } else if (data === 'clear_audio') {
            adminData.winAudioIds = [];
            adminData.lossAudioIds = [];
            adminData.notifAudioIds = [];
            adminData.winAudioId = null;
            await saveAdminData(adminData);
            bot?.sendMessage(chatId, "🗑️ All associated win, loss, and notification audio files have been cleared.");
        } else if (data?.startsWith('stk_')) {
            const strk = data.replace('stk_', '');
            adminStates[chatId] = { step: `SET_STICKER_${strk}` };
            bot?.sendMessage(chatId, `Please send ONE sticker now for [${strk}]`);
        }
    });

    startMarketPoller();
  }

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
