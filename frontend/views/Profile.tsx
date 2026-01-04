
import React, { useEffect, useState } from "react";
import { MOCK_USER } from "../data";
import { syncLeetCodeStats } from "../api";
import { LeetCodeStats } from "../types";
import { SkillHeatmap } from "../components/SkillHeatmap";

export const Profile = () => {
  const [stats, setStats] = useState<LeetCodeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        setUser(MOCK_USER); // Fallback to mock user
      }
    } else {
      setUser(MOCK_USER); // Fallback to mock user
    }

    const fetchStats = async () => {
      // Simulate fetching linked account data automatically
      const data = await syncLeetCodeStats("alexdev_leetcode");
      setStats(data);
      setLoading(false);
    };
    fetchStats();
  }, []);

  return (
    <div className="p-8 lg:p-12 overflow-y-auto h-[calc(100vh-80px)]">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-slate-900 to-blue-900"></div>
          <div className="px-8 pb-8 relative">
            <div className="flex flex-col sm:flex-row items-end sm:items-center -mt-12 mb-6 gap-6">
              <img
                src={user?.avatar || MOCK_USER.avatar}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-white"
              />
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-slate-900">{user?.name || MOCK_USER.name}</h1>
                <p className="text-slate-500">Software Engineer • {user?.location || 'Location not set'}</p>
              </div>
              <div className="flex gap-3 mt-4 sm:mt-0">
                <button className="bg-white border border-slate-300 text-slate-700 font-bold py-2 px-4 rounded-lg hover:bg-slate-50 transition-colors">
                  Edit Profile
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-8 py-4 border-t border-slate-100">
                <div>
                    <span className="block text-xl font-bold text-slate-900">{user?.reputation || MOCK_USER.reputation}</span>
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Reputation</span>
                </div>
                <div>
                    <span className="block text-xl font-bold text-slate-900">142</span>
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Contributions</span>
                </div>
                <div>
                    <span className="block text-xl font-bold text-slate-900">Top 5%</span>
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Global Rank</span>
                </div>
            </div>
          </div>
        </div>

        {/* LeetCode Integration Section (Auto-shown) */}
        <div>
            <div className="flex items-center gap-3 mb-6">
                <i className="fa-solid fa-code text-blue-600 text-xl"></i>
                <h2 className="text-2xl font-bold text-slate-900">Linked Accounts</h2>
            </div>
            
            {loading ? (
                <div className="bg-white p-12 rounded-2xl border border-slate-200 flex flex-col items-center justify-center">
                    <i className="fa-solid fa-spinner fa-spin text-3xl text-blue-500 mb-4"></i>
                    <p className="text-slate-500 font-medium">Syncing profile data...</p>
                </div>
            ) : (
                stats && <SkillHeatmap stats={stats} />
            )}
        </div>
      </div>
    </div>
  );
};
