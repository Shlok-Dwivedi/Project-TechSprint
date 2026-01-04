
import React from "react";

export const ConfidenceMeter = ({ score, collapsed }: { score: number, collapsed: boolean }) => {
  let colorClass = "bg-red-500";
  if (score > 40) colorClass = "bg-yellow-400";
  if (score > 75) colorClass = "bg-emerald-500";

  if (collapsed) {
    return (
      <div className="p-4 border-b border-slate-200 flex flex-col items-center gap-2">
         <div className="relative w-10 h-10 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
                <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-200" />
                <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="4" fill="transparent" 
                    className={score > 75 ? 'text-emerald-500' : score > 40 ? 'text-yellow-400' : 'text-red-500'}
                    strokeDasharray={100} strokeDashoffset={100 - score} />
            </svg>
            <span className="absolute text-[10px] font-bold text-slate-700">{score}</span>
         </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border-b border-slate-200 p-6 sticky top-0 z-10 backdrop-blur-sm bg-opacity-90">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Concept Confidence</h4>
        <span className={`text-sm font-bold ${score > 75 ? 'text-emerald-600' : 'text-slate-600'}`}>{score}%</span>
      </div>
      <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClass} transition-all duration-1000 ease-out`}
          style={{ width: `${score}%` }}
        ></div>
      </div>
      <p className="text-xs text-slate-500 mt-2">
        {score < 50 ? "Keep studying! Ask the AI Tutor for help." : score < 80 ? "Good progress. Try implementing it yourself." : "Mastered! Ready for the next topic."}
      </p>
    </div>
  );
};
