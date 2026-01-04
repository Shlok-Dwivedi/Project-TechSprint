
import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { Dashboard } from "./views/Dashboard";
import { AlgorithmPage } from "./views/AlgorithmPage";
import { Community } from "./views/Community";
import { LeetCodeSync } from "./components/LeetCodeSync";
import { Profile } from "./views/Profile";
import Onboarding from "./views/Onboarding";
import { MOCK_USER } from "./data";
import { View } from "./types";

const AppContent = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        setUser(MOCK_USER); // Fallback to mock user
      }
    } else {
      setUser(MOCK_USER); // Fallback to mock user
    }
  }, []);

  // Check if user is authenticated
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;

  // Redirect to onboarding if not authenticated
  useEffect(() => {
    if (!isAuthenticated && window.location.pathname !== '/onboarding') {
      navigate('/onboarding');
    }
  }, [navigate, isAuthenticated]);

  // If on onboarding page, render without layout
  if (window.location.pathname === '/onboarding') {
    return (
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
      </Routes>
    );
  }

  // If not authenticated, don't render main app
  if (!isAuthenticated) {
    return null;
  }

  // Helper to navigate to Algorithm page
  const navigateToAlgorithm = () => {
    navigate("/algorithm");
  };

  const handleViewChange = (view: View) => {
    switch (view) {
      case "Dashboard":
        navigate("/");
        break;
      case "Topics":
        navigate("/algorithm");
        break;
      case "Community":
        navigate("/community");
        break;
      case "LeetCode Sync":
        navigate("/leetcode-sync");
        break;
      case "Profile":
        navigate("/profile");
        break;
      default:
        navigate("/");
    }
  };

  const getCurrentView = (): View => {
    const path = window.location.pathname;
    if (path === "/") return "Dashboard";
    if (path === "/algorithm") return "Topics";
    if (path === "/community") return "Community";
    if (path === "/leetcode-sync") return "LeetCode Sync";
    if (path === "/profile") return "Profile";
    return "Dashboard";
  };

  const currentView = getCurrentView();

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar
        currentView={currentView}
        setView={handleViewChange}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <Header user={MOCK_USER} sidebarCollapsed={sidebarCollapsed} />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard onTopicClick={navigateToAlgorithm} user={user || MOCK_USER} />} />
            <Route path="/algorithm" element={<AlgorithmPage />} />
            <Route path="/community" element={<Community />} />
            <Route path="/leetcode-sync" element={<LeetCodeSync />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={
              <div className="p-12 text-center text-slate-500">
                <i className="fa-solid fa-person-digging text-4xl mb-4"></i>
                <h2 className="text-xl font-bold">Work in Progress</h2>
                <p>The page you're looking for is coming soon.</p>
                <button
                  onClick={() => navigate("/")}
                  className="mt-4 text-blue-600 hover:underline"
                >
                  Return to Dashboard
                </button>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
