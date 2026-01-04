
import React, { useState, useEffect } from "react";
import { generatePersonalizedContent } from "../api";

export const GeminiWidget = ({ expertise }: { expertise: string }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const result = await generatePersonalizedContent(expertise);
    setInsight(result);
    setLoading(false);
  };

  useEffect(() => {
    handleGenerate();
  }, [expertise]);

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
      <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-purple-500 opacity-20 rounded-full blur-2xl"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-wand-magic-sparkles text-yellow-300"></i>
            <h3 className="font-bold text-lg">Daily AI Insight</h3>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors backdrop-blur-sm"
          >
            {loading ? (
              <i className="fa-solid fa-spinner fa-spin"></i>
            ) : (
              <i className="fa-solid fa-rotate"></i>
            )}{" "}
            Refresh
          </button>
        </div>

        <div className="min-h-[60px] flex items-center">
            {loading ? (
                 <div className="animate-pulse flex space-x-4 w-full">
                     <div className="flex-1 space-y-2 py-1">
                         <div className="h-2 bg-white/20 rounded"></div>
                         <div className="h-2 bg-white/20 rounded w-5/6"></div>
                     </div>
                 </div>
            ) : (
                <p className="text-lg font-medium leading-relaxed font-serif italic">
                "{insight}"
                </p>
            )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-blue-100">
             <span>Generated for {expertise} Level</span>
             <span className="opacity-70">Powered by Gemini</span>
        </div>
      </div>
    </div>
  );
};
