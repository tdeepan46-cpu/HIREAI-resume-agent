
import React from 'react';

interface SidebarProps {
  activeView: 'dashboard' | 'compare' | 'analysis' | 'colleges' | 'matcher' | 'portal';
  setView: (view: 'dashboard' | 'compare' | 'analysis' | 'colleges' | 'matcher' | 'portal') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setView }) => {
  const items = [
    { id: 'dashboard', label: 'Students List', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { id: 'compare', label: 'Student Comparison', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: 'colleges', label: 'College Comparison', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { id: 'matcher', label: 'Skill Matcher', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { id: 'portal', label: 'Student Portal', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
  ];

  return (
    <aside className="w-72 bg-[#020617] border-r border-white/5 hidden md:flex flex-col py-8 px-4">
      <div className="space-y-1">
        <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4">Main Menu</p>
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as any)}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 relative group ${
              activeView === item.id 
                ? 'bg-white/5 text-white shadow-inner' 
                : 'text-slate-500 hover:text-slate-200'
            }`}
          >
            {activeView === item.id && (
              <div className="absolute left-0 w-1 h-5 bg-blue-500 rounded-full"></div>
            )}
            <svg className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeView === item.id ? 'text-blue-500' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            {item.label}
          </button>
        ))}
      </div>
    </aside>
  );
};
