
import React, { useState } from "react";
import { CodeBlock } from "../components/CodeBlock";
import { CommunityFeed } from "../components/CommunityFeed";
import { ConfidenceMeter } from "../components/ConfidenceMeter";
import { AITutorChat } from "../components/AITutorChat";

// Fix: Defined VisibleSections interface to ensure robust typing for state and components
interface VisibleSections {
  intuition: boolean;
  pseudocode: boolean;
  implementation: boolean;
  complexity: boolean;
  community: boolean;
}

export const AlgorithmPage = () => {
  // Minimize AI Tutor by default
  const [aiPanelCollapsed, setAiPanelCollapsed] = useState(true);
  
  // Fix: Explicitly typed visibleSections state
  const [visibleSections, setVisibleSections] = useState<VisibleSections>({
    intuition: false,
    pseudocode: false,
    implementation: false,
    complexity: false,
    community: false
  });

  const toggleSection = (key: keyof VisibleSections) => {
    setVisibleSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Fix: Explicitly typed SectionToggle props to ensure children are recognized and keys are correctly constrained
  const SectionToggle = ({ 
    id, 
    title, 
    sectionKey, 
    icon, 
    children 
  }: { 
    id: string; 
    title: string; 
    sectionKey: keyof VisibleSections; 
    icon: string;
    children: React.ReactNode; 
  }) => {
    const isOpen = visibleSections[sectionKey];
    return (
      <section id={id} className="mb-6">
        <button 
          onClick={() => toggleSection(sectionKey)}
          className={`w-full flex items-center justify-between p-5 rounded-xl border transition-all duration-200 group ${
            isOpen 
              ? "bg-white border-slate-200 border-b-0 rounded-b-none" 
              : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-md"
          }`}
        >
          <div className="flex items-center gap-3">
             <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
                <i className={`fa-solid ${icon}`}></i>
             </div>
             <h2 className={`text-xl font-bold ${isOpen ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>
                {title}
             </h2>
          </div>
          <div className="flex items-center gap-3">
             {!isOpen && <span className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-blue-500">Click to Reveal</span>}
             <i className={`fa-solid fa-chevron-down text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
          </div>
        </button>
        
        {isOpen && (
          <div className="bg-white border border-t-0 border-slate-200 rounded-b-xl p-6 lg:p-8 pt-2 animate-fade-in-down">
            {children}
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="flex flex-row min-h-[calc(100vh-80px)] bg-slate-50/50 relative">
      {/* LEFT COLUMN: Sticky TOC (20%) */}
      <div className="w-1/5 border-r border-slate-200 bg-white hidden lg:block sticky top-20 h-[calc(100vh-80px)] overflow-y-auto shrink-0">
        <div className="p-6">
          <h3 className="font-bold text-slate-900 mb-4 px-2">On this page</h3>
          <ul className="space-y-1">
            <li>
              <a href="#overview" className="block px-2 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md">
                1. Overview
              </a>
            </li>
            <li>
              <a href="#intuition" className="block px-2 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md">
                2. Intuition
              </a>
            </li>
            <li>
              <a href="#pseudocode" className="block px-2 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md">
                3. Pseudocode
              </a>
            </li>
            <li>
              <a href="#implementation" className="block px-2 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md">
                4. Implementation
              </a>
            </li>
             <li>
              <a href="#complexity" className="block px-2 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md">
                5. Complexity Analysis
              </a>
            </li>
             <li>
              <a href="#community" className="block px-2 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md">
                6. Community
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* CENTER COLUMN: Content (Variable Width) 
          Added min-w-0 to prevent flex item overflow and allow shrinking.
      */}
      <div className={`flex-1 p-8 lg:p-12 min-w-0 transition-all duration-300`}>
        <div className="max-w-3xl mx-auto">
            
            {/* Header Area */}
            <div className="mb-8">
                <div className="mb-4 flex items-center gap-3">
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">Easy</span>
                    <span className="text-slate-500 text-sm">#1 Arrays & Hashing</span>
                </div>
                <h1 className="text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">Two Sum</h1>
            </div>
            
            {/* Overview Section (Always Visible) */}
            <section id="overview" className="mb-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-align-left text-slate-400"></i> Description
                </h2>
                <div className="prose prose-slate mb-6">
                    <p className="text-lg text-slate-600 leading-relaxed">
                        Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.
                        You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice.
                    </p>
                </div>
                
                <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                    <a 
                        href="https://leetcode.com/problems/two-sum/" 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-2 bg-[#ffa116] hover:bg-[#e68a00] text-white font-bold py-2.5 px-5 rounded-lg transition-colors shadow-sm"
                    >
                        <i className="fa-solid fa-code"></i> Solve on LeetCode
                    </a>
                    <p className="text-xs text-slate-500 italic">
                        Attempt the problem first to maximize learning retention!
                    </p>
                </div>
            </section>

            {/* Collapsible Sections */}
            <SectionToggle id="intuition" title="Intuition" sectionKey="intuition" icon="fa-lightbulb">
                <p className="text-slate-600 mb-4 leading-relaxed">
                    The brute force approach involves checking every pair of numbers, which results in O(n²) time complexity. Can we do better?
                </p>
                <p className="text-slate-600 leading-relaxed">
                    We can iterate through the array once, and for each element <code>x</code>, check if <code>target - x</code> exists in the map. If it does, we found our pair. This reduces the lookup time to O(1) using a Hash Map.
                </p>
            </SectionToggle>

            <SectionToggle id="pseudocode" title="Pseudocode" sectionKey="pseudocode" icon="fa-list-ol">
                <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 font-mono text-sm text-slate-700 shadow-inner">
                    <p>Initialize empty HashMap prevMap</p>
                    <p>For each index i, value n in nums:</p>
                    <p className="pl-4">diff = target - n</p>
                    <p className="pl-4">If diff in prevMap:</p>
                    <p className="pl-8 text-blue-600">Return [prevMap[diff], i]</p>
                    <p className="pl-4">prevMap[n] = i</p>
                    <p>Return []</p>
                </div>
            </SectionToggle>

            <SectionToggle id="implementation" title="Implementation" sectionKey="implementation" icon="fa-code">
                 <CodeBlock />
            </SectionToggle>
            
            <SectionToggle id="complexity" title="Complexity Analysis" sectionKey="complexity" icon="fa-chart-pie">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                         <h4 className="font-bold text-slate-900 mb-1">Time Complexity</h4>
                         <p className="text-blue-600 font-mono font-bold text-lg">O(n)</p>
                         <p className="text-xs text-slate-500 mt-1">We traverse the list containing n elements only once.</p>
                     </div>
                      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                         <h4 className="font-bold text-slate-900 mb-1">Space Complexity</h4>
                         <p className="text-blue-600 font-mono font-bold text-lg">O(n)</p>
                         <p className="text-xs text-slate-500 mt-1">The extra space required depends on the number of items stored in the hash table.</p>
                     </div>
                 </div>
            </SectionToggle>

            <SectionToggle id="community" title="Community Solutions" sectionKey="community" icon="fa-users">
                <CommunityFeed topicId="1" />
            </SectionToggle>
        </div>
      </div>

      {/* RIGHT COLUMN: AI Tutor (Collapsible) 
          Changed from 'fixed' to 'sticky' to be part of the flex flow, preventing overlap.
          Added shrink-0 to prevent compression.
      */}
      <div className={`${aiPanelCollapsed ? 'w-20' : 'w-[30%]'} border-l border-slate-200 bg-white sticky top-20 h-[calc(100vh-80px)] z-30 flex flex-col shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] transition-all duration-300 shrink-0`}>
        <ConfidenceMeter score={65} collapsed={aiPanelCollapsed} />
        <AITutorChat collapsed={aiPanelCollapsed} toggleCollapsed={() => setAiPanelCollapsed(!aiPanelCollapsed)} />
      </div>
    </div>
  );
};
