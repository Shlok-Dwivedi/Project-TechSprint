
import React, { useState } from "react";
import { MOCK_COMMUNITY_POSTS } from "../data";
import { CommunityPost } from "../types";
import { CompareSolutionsModal } from "./CompareSolutionsModal";

export const CommunityFeed = ({ topicId }: { topicId?: string }) => {
  // Filter posts by topic if topicId provided
  const initialPosts = topicId 
    ? MOCK_COMMUNITY_POSTS.filter(p => p.topicId === topicId)
    : MOCK_COMMUNITY_POSTS;

  const [posts, setPosts] = useState<CommunityPost[]>(initialPosts);
  const [sortMethod, setSortMethod] = useState<"score" | "relevance">("score");
  const [userVotes, setUserVotes] = useState<Record<string, "up" | "down" | null>>({});
  
  // Selection State
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const handleVote = (postId: string, direction: "up" | "down") => {
    setPosts(currentPosts => currentPosts.map(post => {
      if (post.id !== postId) return post;

      const currentVote = userVotes[postId];
      let scoreChange = 0;

      if (currentVote === direction) {
        scoreChange = direction === "up" ? -1 : 1;
        setUserVotes(prev => ({ ...prev, [postId]: null }));
      } else if (currentVote) {
        scoreChange = direction === "up" ? 2 : -2;
        setUserVotes(prev => ({ ...prev, [postId]: direction }));
      } else {
        scoreChange = direction === "up" ? 1 : -1;
        setUserVotes(prev => ({ ...prev, [postId]: direction }));
      }

      return { ...post, weightedScore: post.weightedScore + scoreChange };
    }));
  };

  const toggleSelection = (postId: string) => {
    if (selectedPostIds.includes(postId)) {
      setSelectedPostIds(prev => prev.filter(id => id !== postId));
    } else {
      if (selectedPostIds.length < 2) {
        setSelectedPostIds(prev => [...prev, postId]);
      } else {
        // Optional: Replace the first one or alert user. 
        // For now, we allow replacing the first selected item to keep interaction fluid
        setSelectedPostIds(prev => [prev[1], postId]);
      }
    }
  };

  const sortedPosts = [...posts].sort((a, b) => {
    if (sortMethod === "relevance") {
      return b.aiRelevance - a.aiRelevance;
    }
    return b.weightedScore - a.weightedScore;
  });

  const getSelectedPosts = () => {
    return posts.filter(p => selectedPostIds.includes(p.id));
  };

  return (
    <div className="mt-16 border-t border-slate-200 pt-10 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Community Solutions</h3>
            <p className="text-slate-500 text-sm mt-1">Peer solutions analyzed by Clarix AI</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 rounded-lg p-1 flex text-xs font-semibold">
                <button 
                    onClick={() => setSortMethod("score")}
                    className={`px-3 py-1.5 rounded-md transition-all ${sortMethod === "score" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                    Top Rated
                </button>
                <button 
                    onClick={() => setSortMethod("relevance")}
                    className={`px-3 py-1.5 rounded-md transition-all ${sortMethod === "relevance" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                    AI Relevance
                </button>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
                <i className="fa-solid fa-pen-to-square"></i>
                <span className="hidden sm:inline">Post Solution</span>
            </button>
          </div>
      </div>
      
      <div className="space-y-6">
        {sortedPosts.map((post) => {
          const isSelected = selectedPostIds.includes(post.id);
          return (
          <div key={post.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all duration-300 ${isSelected ? 'border-blue-500 ring-2 ring-blue-100 shadow-lg' : 'border-slate-200 hover:shadow-md'}`}>
            {/* Card Header */}
            <div className="p-5 flex items-start sm:items-center justify-between border-b border-slate-100 bg-slate-50/50">
               <div className="flex items-center gap-3">
                   {/* Selection Checkbox */}
                   <button 
                      onClick={() => toggleSelection(post.id)}
                      className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300 hover:border-blue-400'}`}
                      title="Select to compare"
                   >
                      {isSelected && <i className="fa-solid fa-check text-xs"></i>}
                   </button>

                   <div className="relative">
                        <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full border border-white shadow-sm" />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white ${
                            post.author.expertise === "Expert" ? "bg-purple-600" :
                            post.author.expertise === "Intermediate" ? "bg-blue-500" : "bg-green-500"
                        }`}>
                            <i className="fa-solid fa-star"></i>
                        </div>
                   </div>
                   <div>
                       <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-sm">{post.author.name}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                                post.author.expertise === "Expert" ? "bg-purple-50 text-purple-700 border-purple-200" :
                                post.author.expertise === "Intermediate" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                "bg-green-50 text-green-700 border-green-200"
                            }`}>
                                {post.author.expertise}
                            </span>
                       </div>
                       <p className="text-xs text-slate-500">{post.timestamp}</p>
                   </div>
               </div>
               
               <div className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold shadow-sm ${
                   post.aiRelevance >= 80 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : 
                   post.aiRelevance >= 50 ? "bg-yellow-50 text-yellow-700 border-yellow-200" : 
                   "bg-red-50 text-red-700 border-red-200"
               }`}>
                   <i className={`fa-solid ${post.aiRelevance >= 80 ? 'fa-check-circle' : 'fa-triangle-exclamation'}`}></i>
                   <span>AI Match: {post.aiRelevance}%</span>
               </div>
            </div>

            {/* Card Body */}
            <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                    <h4 className="text-lg font-bold text-slate-800">{post.title}</h4>
                </div>

                {post.aiWarning && (
                    <div className="mb-4 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg flex gap-3 animate-fade-in">
                        <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                             <i className="fa-solid fa-triangle-exclamation"></i>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-amber-900">AI Warning: Misconception Detected</p>
                            <p className="text-sm text-amber-800 mt-1 leading-relaxed">{post.aiWarning}</p>
                        </div>
                    </div>
                )}

                <div className="relative group">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-xs bg-slate-800 text-white px-2 py-1 rounded hover:bg-slate-700">Copy</button>
                    </div>
                    <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto border border-slate-800 shadow-inner">
                        <pre className="text-sm font-mono text-blue-100 leading-relaxed">
                            <code>{post.code}</code>
                        </pre>
                    </div>
                </div>
            </div>

            {/* Card Footer / Voting */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                     {/* Vote Counter */}
                     <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm select-none">
                         <button 
                            onClick={() => handleVote(post.id, "up")}
                            className={`px-3 py-1.5 transition-colors border-r border-slate-200 ${userVotes[post.id] === 'up' ? 'bg-orange-50 text-orange-600' : 'hover:bg-slate-100 text-slate-600'}`}
                         >
                             <i className="fa-solid fa-caret-up text-lg"></i>
                         </button>
                         <span className={`px-3 py-1.5 text-sm font-bold min-w-[40px] text-center ${post.weightedScore < 0 ? "text-red-500" : "text-slate-700"}`}>
                             {post.weightedScore}
                         </span>
                         <button 
                            onClick={() => handleVote(post.id, "down")}
                            className={`px-3 py-1.5 transition-colors border-l border-slate-200 ${userVotes[post.id] === 'down' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-100 text-slate-600'}`}
                         >
                             <i className="fa-solid fa-caret-down text-lg"></i>
                         </button>
                     </div>

                     <button className="text-slate-500 text-sm hover:text-blue-600 flex items-center gap-1.5 font-medium transition-colors">
                         <i className="fa-regular fa-comment-dots"></i> 
                         <span className="hidden sm:inline">Discussion</span>
                     </button>
                </div>
                
                <button className="text-slate-400 hover:text-blue-500 transition-colors" title="Share">
                    <i className="fa-solid fa-share-nodes"></i>
                </button>
            </div>
          </div>
        );})}

        {sortedPosts.length === 0 && (
             <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                 <i className="fa-solid fa-ghost text-slate-300 text-4xl mb-3"></i>
                 <p className="text-slate-500">No solutions yet. Be the first to post!</p>
             </div>
        )}
      </div>
      
      {/* Floating Compare Action Bar */}
      {selectedPostIds.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
              <div className="bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 border border-slate-700">
                  <span className="text-sm font-medium">{selectedPostIds.length} selected</span>
                  <div className="h-4 w-px bg-slate-700"></div>
                  {selectedPostIds.length === 2 ? (
                      <button 
                        onClick={() => setIsCompareModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-4 py-2 rounded-full transition-colors flex items-center gap-2"
                      >
                          <i className="fa-solid fa-code-compare"></i> Compare Solutions
                      </button>
                  ) : (
                      <span className="text-sm text-slate-400">Select 2 to compare</span>
                  )}
                  <button 
                    onClick={() => setSelectedPostIds([])}
                    className="text-slate-400 hover:text-white"
                  >
                      <i className="fa-solid fa-xmark"></i>
                  </button>
              </div>
          </div>
      )}

      {selectedPostIds.length === 2 && (
          <CompareSolutionsModal 
            isOpen={isCompareModalOpen}
            onClose={() => setIsCompareModalOpen(false)}
            solutionA={getSelectedPosts()[0]}
            solutionB={getSelectedPosts()[1]}
          />
      )}
    </div>
  )
}
