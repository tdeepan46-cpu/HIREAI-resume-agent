
import React from 'react';

export const Navbar: React.FC = () => {
  return (
    <nav className="h-20 border-b border-white/10 bg-[#020617]/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center border border-white/10 shadow-2xl">
            <svg className="w-7 h-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
        <div>
          <span className="text-2xl font-black bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent tracking-tighter">
            HireAI
          </span>
          <p className="text-[10px] font-bold text-slate-500 tracking-[0.1em] uppercase leading-none mt-1">AI Powered Recruitment</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 p-[1px]">
          <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center">
            <span className="text-xs font-black text-white">HI</span>
          </div>
        </div>
      </div>
    </nav>
  );
};
