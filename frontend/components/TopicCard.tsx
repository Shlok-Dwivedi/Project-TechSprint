
import React from "react";
import { Topic } from "../types";

// Fix: Added optional key to props type to resolve TypeScript error in Dashboard.tsx when mapping over topics
export const TopicCard = ({ topic, onClick }: { topic: Topic, onClick?: () => void, key?: React.Key }) => {
  const isWeak = topic.status === "Weak";
  const isMastered = topic.status === "Mastered";

  return (
    <div 
        onClick={onClick}
        className={`relative p-5 rounded-xl border transition-all duration-300 cursor-pointer group hover:-translate-y-1 ${
        isWeak 
        ? "bg-red-50/30 border-red-200 shadow-[0_0_20px_rgba(239,68,68,0.1)] hover:shadow-[0_0_25px_rgba(239,68,68,0.2)]" 
        : isMastered
        ? "bg-amber-50/30 border-amber-200 hover:shadow-lg hover:shadow-amber-100"
        : "bg-white border-gray-100 hover:shadow-md hover:border-blue-200"
    }`}>
        {isMastered && (
            <div className="absolute -top-3 -right-3 bg-gradient-to-br from-amber-400 to-amber-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md z-10">
                <i className="fa-solid fa-check text-sm"></i>
            </div>
        )}
        
        <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${
                isWeak ? "bg-red-100 text-red-600" : isMastered ? "bg-amber-100 text-amber-600" : "bg-blue-50 text-blue-600"
            }`}>
                <i className={`fa-solid ${topic.icon}`}></i>
            </div>
            {isWeak && (
                <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                    Weak Spot
                </span>
            )}
        </div>

        <h3 className="font-bold text-gray-900 mb-1">{topic.title}</h3>
        <p className="text-xs text-gray-500 mb-4">{topic.progress}/{topic.total} Problems Solved</p>

        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
                className={`h-full rounded-full ${
                    isWeak ? "bg-red-500" : isMastered ? "bg-amber-500" : "bg-blue-500"
                }`} 
                style={{ width: `${(topic.progress / topic.total) * 100}%` }}
            ></div>
        </div>
    </div>
  );
};
