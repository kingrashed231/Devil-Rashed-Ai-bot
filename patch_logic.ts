import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

// 1. Add Daily Variables & Challenge States near existing variables
const varTarget = `let globalWinStreak = 0;`;
const varRepl = `let globalWinStreak = 0;
let dailySignalsCount = 0;
let dailyWinsCount = 0;
let isSleepNotified = false;

interface ChallengeState {
    balance: number;
    target: number;
    currentLossStep: parseInt;
    maxSteps: number;
    betSeries: number[];
}
const userChallenges: Record<number, ChallengeState> = {};
const userModeStates: Record<number, any> = {};`;
content = content.replace(varTarget, varRepl);

fs.writeFileSync('server.ts', content);
console.log("Variables added.");
