
import React, { useState } from "react";
import { syncLeetCodeStats } from "../api";
import { LeetCodeStats } from "../types";
import { SkillHeatmap } from "./SkillHeatmap";

export const LeetCodeSync = () => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<LeetCodeStats | null>(null);

  const handleSync = async () => {
    if (!username.trim()) return;
    setLoading(true);
    try {
      const data = await syncLeetCodeStats(username);
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 lg:p-12 max-w-5xl mx-auto h-full overflow-y-auto">
      
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">LeetCode Integration</h1>
        <p className="text-slate-500 text-lg max-w-2xl">
          Connect your LeetCode account to automatically import your problem history and personalize your Clarix AI learning path.
        </p>
      </div>

      {/* Sync Card */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-10">
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
           <div className="flex-1 w-full">
              <label className="block text-sm font-bold text-slate-700 mb-2">LeetCode Username</label>
              <div className="relative">
                <i className="fa-solid fa-link absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. neetcode" 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
           </div>
           <button 
             onClick={handleSync}
             disabled={loading || !username}
             className="w-full sm:w-auto bg-slate-900 text-white font-bold py-3 px-8 rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
           >
             {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-arrows-rotate"></i>}
             <span>{loading ? "Syncing..." : "Sync Now"}</span>
           </button>
        </div>
      </div>

      {/* Stats Display */}
      {stats && <SkillHeatmap stats={stats} />}
    </div>
  );
};
