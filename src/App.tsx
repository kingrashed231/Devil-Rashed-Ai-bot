import React, { useEffect, useState } from 'react';

export default function App() {
  const [aiStatus, setAiStatus] = useState<any>(null);

  useEffect(() => {
    // Fetch AI Status from backend
    fetch('/api/admin/ai-status')
      .then(res => res.json())
      .then(data => {
         if (data.success) {
            setAiStatus(data);
         }
      }).catch(e => console.error("Could not fetch AI status", e));
      
    const interval = setInterval(() => {
        fetch('/api/admin/ai-status').then(res => res.json()).then(data => { if(data.success) setAiStatus(data) }).catch(()=>{});
    }, 15000); // Check every 15s

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-[#E4E3E0] font-sans flex flex-col items-center justify-center relative overflow-hidden py-10">
        {/* Subtle dynamic background */}
        <div className="absolute inset-0 bg-[#F27D26]/5 radial-gradient(circle at center, transparent, black)"></div>
        <div className="w-[600px] h-[600px] absolute bg-[#F27D26]/10 blur-[150px] rounded-full"></div>

        <div className="relative z-10 flex flex-col items-center w-full max-w-4xl px-4 space-y-10">
            <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#F27D26] to-[#d96614] flex items-center justify-center shadow-[0_0_50px_rgba(242,125,38,0.4)] border border-[#ff914d]">
                    <span className="font-black text-4xl text-black">DR</span>
                </div>
                
                <h1 className="text-5xl font-bold tracking-tight uppercase">
                    <span className="text-[#F27D26]">Devil Rashed</span> AI
                </h1>
                
                <p className="text-[#8E9299] max-w-lg text-lg text-center">
                    The most advanced WingGo probabilistic engine and ML model ensemble.
                </p>

                <div className="bg-[#151619] border border-[#333] px-6 py-4 rounded-xl flex items-center justify-center gap-4 shadow-xl">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.6)]"></span>
                        <span className="font-mono text-sm uppercase tracking-wider text-green-400">System Online</span>
                    </div>
                    <div className="border-l border-[#333] h-6"></div>
                    <div className="text-sm text-[#8E9299]">
                        Live Engine Active
                    </div>
                    <div className="border-l border-[#333] h-6"></div>
                    <button 
                       onClick={() => {
                           fetch('/api/admin/enable-webhook')
                             .then(res => res.json())
                             .then(data => alert(data.message || 'Error occurred'))
                             .catch(() => alert('Failed to enable Wake mode.'));
                       }}
                       className="bg-[#F27D26]/20 hover:bg-[#F27D26]/40 text-[#F27D26] px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
                    >
                        ⚡ Wake On Message
                    </button>
                </div>
            </div>

            {/* AI Learning Status Box */}
            <div className="w-full bg-[#111] border border-[#333] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#F27D26] to-transparent"></div>
                
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    🧠 What AI Learned Today
                </h2>

                {!aiStatus ? (
                    <div className="text-[#8E9299] animate-pulse">Fetching neural weights from Firebase...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-black/50 p-4 rounded-xl border border-[#222]">
                            <div className="text-[#8E9299] text-sm mb-1 uppercase tracking-wider">Total Historical Data Verified</div>
                            <div className="text-3xl font-mono text-[#F27D26]">{aiStatus.totalTrainedRecords} <span className="text-sm text-gray-500">Periods</span></div>
                        </div>

                        <div className="bg-black/50 p-4 rounded-xl border border-[#222]">
                            <div className="text-[#8E9299] text-sm mb-1 uppercase tracking-wider">Current Best Performing Logic</div>
                            <div className="flex flex-col gap-1 mt-2">
                                {aiStatus.topModels?.map((m: any, idx: number) => (
                                    <div key={m.model} className="flex justify-between items-center text-sm font-mono">
                                        <span className="text-green-400">#{idx + 1} {m.model} (Ranked)</span>
                                        <span className="text-gray-400 opacity-50">Weight: {(m.weight * 100).toFixed(2)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-black/50 p-4 rounded-xl border border-[#222] md:col-span-2">
                            <div className="text-[#8E9299] text-sm mb-3 uppercase tracking-wider">Artificial Brain Insights</div>
                            <p className="text-gray-300 leading-relaxed text-sm">
                                <b>Self-Correction Active:</b> Background cron engine is analyzing {aiStatus.totalTrainedRecords} rows of raw market data every 5 minutes. 
                                The AI recognized that models like <span className="text-red-400">{aiStatus.weakestModels?.map((m:any)=>m.model).join(', ')}</span> 
                                are currently performing poorly and has <b>penalized</b> their weights. Simultaneously, it heavily amplified 
                                power to <span className="text-green-400">{aiStatus.topModels?.[0]?.model}</span> based on extreme win momentum.
                            </p>
                            <div className="mt-4 pt-4 border-t border-[#333] flex justify-between items-center">
                                <span className="text-xs text-gray-500">Last Background Brain Loop: {new Date(aiStatus.lastTrainedAt).toLocaleTimeString()}</span>
                                <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded border border-green-500/20">Learning LIVE ⚡</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
        </div>
    </div>
  );
}
