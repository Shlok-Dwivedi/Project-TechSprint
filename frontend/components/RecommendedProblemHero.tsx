
import React, { useState, useEffect } from "react";
import { RecommendedProblem } from "../types";
import { getRecommendedProblem } from "../api";
import { MOCK_TOPICS } from "../data";

export const RecommendedProblemHero = () => {
  const [problem, setProblem] = useState<RecommendedProblem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblem = async () => {
      const weakTopics = MOCK_TOPICS.filter(t => t.status === "Weak").map(t => t.title);
      const result = await getRecommendedProblem(weakTopics);
      setProblem(result);
      setLoading(false);
    };
    fetchProblem();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center min-h-[200px] animate-pulse">
         <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
         <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
         <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  return (
    <div className="relative bg-white rounded-2xl shadow-sm border border-indigo-100 p-0 overflow-hidden group hover:shadow-md transition-shadow">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
      
      <div className="p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
               <i className="fa-solid fa-bullseye mr-1"></i> Gemini Recommended
            </span>
            <span className={`text-xs font-bold px-2 py-1 rounded border ${
                problem?.difficulty === "Easy" ? "bg-green-50 text-green-700 border-green-200" :
                problem?.difficulty === "Medium" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                "bg-red-50 text-red-700 border-red-200"
            }`}>
              {problem?.difficulty}
            </span>
          </div>
          
          <h2 className="text-2xl font-extrabold text-gray-900 group-hover:text-indigo-600 transition-colors">
            {problem?.title}
          </h2>
          
          <p className="text-gray-600 leading-relaxed max-w-2xl">
            <span className="font-semibold text-gray-800">Why this problem:</span> {problem?.reason}
          </p>
        </div>

        <button className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center gap-2">
           Solve Now <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </div>
  );
};
