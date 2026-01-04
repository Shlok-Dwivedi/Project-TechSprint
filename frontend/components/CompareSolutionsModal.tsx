
import React, { useEffect, useState } from "react";
import { CommunityPost } from "../types";
import { compareSolutions } from "../api";

interface CompareSolutionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  solutionA: CommunityPost;
  solutionB: CommunityPost;
}

export const CompareSolutionsModal = ({
  isOpen,
  onClose,
  solutionA,
  solutionB,
}: CompareSolutionsModalProps) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && solutionA && solutionB) {
      const fetchAnalysis = async () => {
        setLoading(true);
        setAnalysis(null);
        const result = await compareSolutions(solutionA.code, solutionB.code);
        setAnalysis(result);
        setLoading(false);
      };
      fetchAnalysis();
    }
  }, [isOpen, solutionA, solutionB]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-code-compare text-xl"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Solution Comparison</h2>
              <p className="text-xs text-slate-500">AI-Powered Diff & Efficiency Analysis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100/50">
          
          {/* Side by Side Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Solution A */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-[400px]">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <img src={solutionA.author.avatar} className="w-6 h-6 rounded-full" />
                   <span className="font-bold text-sm text-slate-700">{solutionA.author.name}</span>
                </div>
                <span className="text-xs font-mono text-slate-400">Solution A</span>
              </div>
              <div className="flex-1 overflow-auto bg-slate-900 p-4">
                <pre className="text-xs font-mono text-blue-100 leading-relaxed">
                  <code>{solutionA.code}</code>
                </pre>
              </div>
            </div>

            {/* Solution B */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-[400px]">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <img src={solutionB.author.avatar} className="w-6 h-6 rounded-full" />
                   <span className="font-bold text-sm text-slate-700">{solutionB.author.name}</span>
                </div>
                <span className="text-xs font-mono text-slate-400">Solution B</span>
              </div>
              <div className="flex-1 overflow-auto bg-slate-900 p-4">
                <pre className="text-xs font-mono text-blue-100 leading-relaxed">
                  <code>{solutionB.code}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* AI Analysis Box */}
          <div className="bg-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden">
             <div className="px-6 py-3 bg-gradient-to-r from-indigo-50 to-white border-b border-indigo-50 flex items-center gap-2">
                <i className="fa-solid fa-robot text-indigo-500"></i>
                <h3 className="font-bold text-slate-800">Gemini Analysis</h3>
             </div>
             
             <div className="p-6 min-h-[150px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-4 space-y-3">
                        <div className="flex gap-1">
                            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></div>
                            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce delay-75"></div>
                            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce delay-150"></div>
                        </div>
                        <p className="text-sm text-slate-500 animate-pulse">Analyzing time complexity and logic...</p>
                    </div>
                ) : (
                    <div className="prose prose-sm prose-slate max-w-none">
                        {analysis?.split('\n').map((line, i) => (
                            <p key={i} className="mb-2 leading-relaxed text-slate-700">{line}</p>
                        ))}
                    </div>
                )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};
