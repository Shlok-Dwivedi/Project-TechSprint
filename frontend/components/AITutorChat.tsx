
import React, { useState, useEffect, useRef } from "react";
import { Chat, GenerateContentResponse } from "@google/genai";
import { getGeminiClient, generateExplanationImage, generateExplanationVideo } from "../api";
import { ChatMessage } from "../types";

export const AITutorChat = ({ collapsed, toggleCollapsed }: { collapsed: boolean, toggleCollapsed: () => void }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "model", text: "Hello! I'm your AI Tutor for the **Two Sum** algorithm. Ask me anything about hash maps, time complexity, or edge cases!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      if (scrollHeight > clientHeight) {
          chatContainerRef.current.scrollTo({
            top: scrollHeight,
            behavior: "smooth"
          });
      }
    }
  };

  useEffect(() => {
    if (!collapsed) {
        setTimeout(scrollToBottom, 100);
    }
  }, [messages, collapsed]);

  useEffect(() => {
    const ai = getGeminiClient();
    chatRef.current = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: "You are an expert Data Structures and Algorithms tutor. You are currently helping a student understand the 'Two Sum' problem. Be concise, encouraging, and use Socratic questioning to help them arrive at the answer. Do not give the full code immediately unless asked. Use Markdown for code snippets.",
      },
    });
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !chatRef.current) return;

    const userMsg = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const result: GenerateContentResponse = await chatRef.current.sendMessage({ message: userMsg });
      const text = result.text || "I'm having trouble thinking right now.";
      setMessages((prev) => [...prev, { role: "model", text }]);
    } catch (e) {
        console.error(e);
      setMessages((prev) => [...prev, { role: "model", text: "Error connecting to AI Tutor." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaGen = async (type: 'image' | 'video') => {
    const lastModelMessage = [...messages].reverse().find(m => m.role === 'model');
    const context = lastModelMessage?.text || "The Two Sum algorithm with HashMaps";

    setMessages(prev => [...prev, { 
      role: 'model', 
      text: type === 'image' ? 'Generating visual diagram...' : 'Rendering cinematic animation...', 
      isGenerating: true,
      statusText: type === 'image' ? 'Crafting Diagram...' : 'Initializing Cinematic Engine...'
    }]);

    try {
      if (type === 'image') {
        const url = await generateExplanationImage(context);
        setMessages(prev => prev.map((msg, i) => 
          i === prev.length - 1 ? { ...msg, text: 'Here is a visual explanation:', imageUrl: url || undefined, isGenerating: false } : msg
        ));
      } else {
        const url = await generateExplanationVideo(context, (status) => {
          setMessages(prev => prev.map((msg, i) => 
            i === prev.length - 1 ? { ...msg, statusText: status } : msg
          ));
        });
        setMessages(prev => prev.map((msg, i) => 
          i === prev.length - 1 ? { ...msg, text: 'I have generated a cinematic animation for you:', videoUrl: url || undefined, isGenerating: false } : msg
        ));
      }
    } catch (e) {
      setMessages(prev => prev.map((msg, i) => 
        i === prev.length - 1 ? { ...msg, text: 'Sorry, I failed to generate that visual. Please try again.', isGenerating: false } : msg
      ));
    }
  };

  if (collapsed) {
      return (
        <div className="flex flex-col items-center p-4 gap-4">
             <button 
                onClick={toggleCollapsed}
                className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors"
                title="Expand AI Tutor"
            >
                 <i className="fa-solid fa-comment-dots"></i>
            </button>
        </div>
      );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px-120px)] relative">
      <button 
        onClick={toggleCollapsed}
        className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 z-20"
        title="Minimize"
      >
         <i className="fa-solid fa-compress-alt"></i>
      </button>

      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200 shadow-sm"
              }`}
            >
              <div className="prose prose-sm">
                {msg.text.split('\n').map((line, i) => (
                    <p key={i} className="mb-1">{line}</p>
                ))}
              </div>

              {msg.isGenerating && (
                <div className="mt-2 p-3 bg-white/50 rounded-lg border border-slate-200 flex flex-col items-center gap-2">
                   <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></div>
                   </div>
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{msg.statusText}</span>
                </div>
              )}

              {msg.imageUrl && (
                <div className="mt-3 rounded-lg overflow-hidden border border-slate-200 bg-slate-200 animate-fade-in">
                  <img src={msg.imageUrl} alt="AI Generated Explanation" className="w-full h-auto cursor-zoom-in hover:opacity-90 transition-opacity" />
                </div>
              )}

              {msg.videoUrl && (
                <div className="mt-3 rounded-lg overflow-hidden border border-slate-200 bg-black aspect-video animate-fade-in relative group">
                  <video src={msg.videoUrl} controls className="w-full h-full" />
                  <div className="absolute top-2 left-2 bg-indigo-600 text-white text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <i className="fa-solid fa-video mr-1"></i> Cinematic AI
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-slate-100 rounded-2xl rounded-bl-none p-3 border border-slate-200">
                <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                </div>
             </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex items-center gap-2 mb-3">
           <button 
             onClick={() => handleMediaGen('image')}
             disabled={loading}
             className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-all border border-indigo-100 disabled:opacity-50"
           >
              <i className="fa-solid fa-wand-magic-sparkles"></i> Visualize
           </button>
           <button 
             onClick={() => handleMediaGen('video')}
             disabled={loading}
             className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-bold transition-all border border-purple-100 disabled:opacity-50"
           >
              <i className="fa-solid fa-film"></i> Animate
           </button>
        </div>
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask a question..."
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-full py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <i className="fa-solid fa-paper-plane text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  );
};
