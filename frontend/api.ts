
import { GoogleGenAI, Type } from "@google/genai";
import { RecommendedProblem, LeetCodeStats } from "./types";

export const getGeminiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePersonalizedContent = async (expertise: string) => {
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a short, single-sentence, high-impact coding tip or algorithm fact specifically tailored for a software engineer with '${expertise}' level expertise. Do not explain, just give the insight.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to connect to Clarix AI brain. Please try again later.";
  }
};

export const generateExplanationImage = async (context: string): Promise<string | null> => {
  try {
    const ai = getGeminiClient();
    const prompt = `Create a clean, modern, high-quality educational diagram for the following programming concept: ${context}. Use a professional tech aesthetic with dark backgrounds and glowing highlights. No text except for variable names if necessary.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "16:9" } }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Generation Error:", error);
    return null;
  }
};

export const generateExplanationVideo = async (context: string, onProgress?: (status: string) => void): Promise<string | null> => {
  try {
    // Check for API key selection for Veo
    // @ts-ignore
    if (!(await window.aistudio.hasSelectedApiKey())) {
       // @ts-ignore
       await window.aistudio.openSelectKey();
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    onProgress?.("Initializing cinematic engine...");
    
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `A high-quality 3D cinematic animation showing: ${context}. Digital data structures moving through a network, sleek tech visualization, 4k, professional lighting.`,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    onProgress?.("Rendering visual frames...");
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      // Always create a fresh instance to avoid stale keys
      const pollingAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
      operation = await pollingAi.operations.getVideosOperation({ operation: operation });
      onProgress?.("Polishing animation details...");
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) return null;

    onProgress?.("Finalizing download...");
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Video Generation Error:", error);
    if (error instanceof Error && error.message.includes("Requested entity was not found")) {
        // @ts-ignore
        await window.aistudio.openSelectKey();
    }
    return null;
  }
};

export const getRecommendedProblem = async (weakTopics: string[]): Promise<RecommendedProblem> => {
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Suggest a specific LeetCode problem for a user who is weak in ${weakTopics.join(", ")}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            reason: { type: Type.STRING },
            topic: { type: Type.STRING },
          },
          required: ["title", "difficulty", "reason", "topic"],
        },
      },
    });
    
    if (response.text) {
        return JSON.parse(response.text);
    }
    throw new Error("Empty response");

  } catch (error) {
    console.error("Gemini Recommendation Error:", error);
    return {
      title: "Reverse Linked List",
      difficulty: "Easy",
      reason: "Standard recommendation due to connection issues.",
      topic: "Linked Lists"
    };
  }
};

export const compareSolutions = async (codeA: string, codeB: string): Promise<string> => {
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Compare the following two code solutions for the same algorithm problem.
      
      Solution A:
      ${codeA}
      
      Solution B:
      ${codeB}
      
      Please provide a concise analysis covering:
      1. Key Logic Differences: How do they differ in approach?
      2. Time & Space Efficiency: Which is more efficient and why?
      3. Recommendation: Which one is better for an interview setting?
      
      Keep the response structured and professional.`,
    });
    return response.text || "Analysis could not be generated.";
  } catch (error) {
    console.error("Gemini Comparison Error:", error);
    return "Error generating comparison. Please try again.";
  }
};

export const syncLeetCodeStats = async (username: string): Promise<LeetCodeStats> => {
  // Mock API call to simulate fetching data
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        username,
        totalSolved: 342,
        ranking: 145002,
        topicSkills: [
          {
            category: "Linear Structures",
            topics: [
              { name: "Arrays", solved: 120, level: 4 },
              { name: "Strings", solved: 85, level: 4 },
              { name: "Linked Lists", solved: 30, level: 3 },
              { name: "Stacks", solved: 25, level: 2 },
              { name: "Queues", solved: 15, level: 2 },
              { name: "Hash Tables", solved: 95, level: 4 },
            ]
          },
          {
            category: "Non-Linear Structures",
            topics: [
              { name: "Trees", solved: 45, level: 3 },
              { name: "Graphs", solved: 20, level: 2 },
              { name: "Heaps", solved: 10, level: 1 },
              { name: "Tries", solved: 5, level: 1 },
              { name: "BST", solved: 22, level: 2 },
            ]
          },
          {
            category: "Algorithms",
            topics: [
              { name: "Dynamic Programming", solved: 40, level: 3 },
              { name: "Backtracking", solved: 15, level: 2 },
              { name: "Greedy", solved: 20, level: 2 },
              { name: "Bit Manipulation", solved: 5, level: 1 },
              { name: "Math", solved: 12, level: 2 },
              { name: "Sorting", solved: 55, level: 3 },
            ]
          }
        ]
      });
    }, 2000);
  });
};
