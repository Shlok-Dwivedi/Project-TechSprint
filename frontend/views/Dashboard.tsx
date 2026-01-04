
import React from "react";
import { GeminiWidget } from "../components/GeminiWidget";
import { RecommendedProblemHero } from "../components/RecommendedProblemHero";
import { TopicCard } from "../components/TopicCard";
import { MOCK_TOPICS, MOCK_USER } from "../data";

export const Dashboard = ({ onTopicClick }: { onTopicClick: () => void }) => {
  return (
    <div className="p-8 lg:p-12 overflow-y-auto h-[calc(100vh-80px)]">
      <div className="max-w-7xl mx-auto space-y-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                 <h2 className="text-2xl font-bold text-slate-800 mb-6">Welcome back, {MOCK_USER.name}</h2>
                 <RecommendedProblemHero />
            </div>
            <div className="lg:col-span-1 pt-0 lg:pt-14">
                 <GeminiWidget expertise={MOCK_USER.expertise} />
            </div>
        </div>

        <div>
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-xl text-gray-800">Your Learning Path</h3>
                <button className="text-sm text-blue-600 font-medium hover:underline">View All Topics</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_TOPICS.map(topic => (
                    <TopicCard key={topic.id} topic={topic} onClick={onTopicClick} />
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};
