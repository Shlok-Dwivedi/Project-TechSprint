
import React from "react";
import { View } from "../types";

export const Sidebar = ({
  currentView,
  setView,
  collapsed,
  setCollapsed
}: {
  currentView: View;
  setView: (view: View) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}) => {
  const links: { name: View; icon: string }[] = [
    { name: "Dashboard", icon: "fa-chart-line" },
    { name: "Topics", icon: "fa-book-open" },
    { name: "Community", icon: "fa-users" },
    { name: "LeetCode Sync", icon: "fa-link" },
    { name: "Profile", icon: "fa-user-astronaut" },
  ];

  return (
    <div className={`${collapsed ? 'w-20' : 'w-64'} bg-slate-900 text-white h-screen flex flex-col fixed left-0 top-0 shadow-2xl z-50 transition-all duration-300 ease-in-out`}>
      <div className={`p-6 flex items-center ${collapsed ? 'justify-center' : 'gap-3'} border-b border-slate-800 transition-all`}>
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <i className="fa-solid fa-brain text-white"></i>
        </div>
        {!collapsed && <h1 className="text-xl font-bold tracking-tight whitespace-nowrap overflow-hidden">Clarix AI</h1>}
      </div>

      <nav className="flex-1 py-6 px-3 space-y-2 overflow-x-hidden">
        {links.map((link) => (
          <button
            key={link.name}
            onClick={() => setView(link.name)}
            title={collapsed ? link.name : ""}
            className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-4 px-4'} py-3 rounded-xl transition-all duration-200 group ${
              currentView === link.name
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <i className={`fa-solid ${link.icon} w-5 text-center`}></i>
            {!collapsed && <span className="font-medium whitespace-nowrap">{link.name}</span>}
            {!collapsed && currentView === link.name && (
              <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 flex flex-col gap-4">
        {!collapsed && (
          <div className="bg-slate-800 rounded-lg p-4 animate-fade-in">
            <p className="text-xs text-slate-400 mb-2">Clarix AI Pro</p>
            <button className="w-full text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-md font-bold">
              Upgrade
            </button>
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="w-full h-10 flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
           <i className={`fa-solid ${collapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
        </button>
      </div>
    </div>
  );
};
