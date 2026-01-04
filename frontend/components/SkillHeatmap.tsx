
import React from "react";
import { LeetCodeStats } from "../types";

export const SkillHeatmap = ({ stats }: { stats: LeetCodeStats }) => {
  const getColor = (level: number) => {
    switch (level) {
      case 1: return "bg-blue-200";
      case 2: return "bg-blue-400";
      case 3: return "bg-blue-600";
      case 4: return "bg-blue-900";
      default: return "bg-slate-200";
    }
  };

  const getLevelLabel = (level: number) => {
    switch (level) {
      case 4: return "Master";
      case 3: return "Advanced";
      case 2: return "Intermediate";
      case 1: return "Beginner";
      default: return "Novice";
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Skill Breakdown</h2>
          <p className="text-sm text-slate-500">Detailed problem stats by category</p>
        </div>
        <div className="flex items-center gap-4 text-sm hidden sm:flex">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm">
            <span className="text-slate-500">Total Solved:</span>
            <span className="font-bold text-slate-900">{stats.totalSolved}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm">
            <span className="text-slate-500">Rank:</span>
            <span className="font-bold text-slate-900">#{stats.ranking.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {stats.topicSkills.map((category) => (
          <div key={category.category} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            {/* Category Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs">
                {category.category}
              </h3>
              <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {category.topics.length} Topics
              </span>
            </div>

            {/* List of Topics */}
            <div className="p-4 space-y-3 flex-1">
              {category.topics.map((topic) => (
                <div 
                  key={topic.name} 
                  className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    {/* Visual Level Indicator */}
                    <div className={`w-1.5 h-10 rounded-full ${getColor(topic.level)}`}></div>
                    
                    <div>
                      <p className="font-bold text-slate-800 text-sm group-hover:text-blue-700 transition-colors">
                        {topic.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {getLevelLabel(topic.level)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="block font-bold text-slate-900 text-base">
                      {topic.solved}
                    </span>
                    <span className="text-[9px] text-slate-400 uppercase tracking-wide">
                      Solved
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
