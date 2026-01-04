
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { Dashboard } from "./views/Dashboard";
import { AlgorithmPage } from "./views/AlgorithmPage";
import { LeetCodeSync } from "./components/LeetCodeSync";
import { Profile } from "./views/Profile";
import { MOCK_USER } from "./data";
import { View } from "./types";

const App = () => {
  const [currentView, setView] = useState<View>("Dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Helper to switch to Algorithm page simulating clicking a topic
  const navigateToAlgorithm = () => {
      // In a real app this would take an ID, for now we just switch view
      setView("Topics"); 
  };

  const renderContent = () => {
    switch (currentView) {
      case "Dashboard":
        return <Dashboard onTopicClick={navigateToAlgorithm} />;
      case "Topics":
        // For demonstration, "Topics" view renders the specific algorithm page
        return <AlgorithmPage />;
      case "LeetCode Sync":
        return <LeetCodeSync />;
      case "Profile":
        return <Profile />;
      default:
        // Fallback for unimplemented views
        return (
            <div className="p-12 text-center text-slate-500">
                <i className="fa-solid fa-person-digging text-4xl mb-4"></i>
                <h2 className="text-xl font-bold">Work in Progress</h2>
                <p>The {currentView} view is coming soon.</p>
                <button 
                    onClick={() => setView("Dashboard")}
                    className="mt-4 text-blue-600 hover:underline"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar
        currentView={currentView}
        setView={setView}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <Header user={MOCK_USER} sidebarCollapsed={sidebarCollapsed} />
        <main>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
