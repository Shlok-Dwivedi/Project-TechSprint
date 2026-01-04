
import React, { useState } from "react";

export const CodeBlock = () => {
  const [lang, setLang] = useState<"cpp" | "python" | "java">("python");

  const code = {
    python: `def twoSum(nums: List[int], target: int) -> List[int]:
    prevMap = {}  # val : index
    
    for i, n in enumerate(nums):
        diff = target - n
        if diff in prevMap:
            return [prevMap[diff], i]
        prevMap[n] = i
    return []`,
    cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> prevMap;
        for (int i = 0; i < nums.size(); i++) {
            int diff = target - nums[i];
            if (prevMap.count(diff)) {
                return {prevMap[diff], i};
            }
            prevMap[nums[i]] = i;
        }
        return {};
    }
};`,
    java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> prevMap = new HashMap<>();
        
        for (int i = 0; i < nums.length; i++) {
            int diff = target - nums[i];
            
            if (prevMap.containsKey(diff)) {
                return new int[]{prevMap.get(diff), i};
            }
            prevMap.put(nums[i], i);
        }
        return new int[]{};
    }
}`
  };

  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden shadow-lg my-6 border border-slate-700">
      <div className="flex items-center px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex gap-1.5 mr-6">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="flex gap-1">
          {(["cpp", "python", "java"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                lang === l
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              {l === "cpp" ? "C++" : l === "python" ? "Python" : "Java"}
            </button>
          ))}
        </div>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="font-mono text-sm leading-relaxed text-blue-100">
          <code>{code[lang]}</code>
        </pre>
      </div>
    </div>
  );
};
