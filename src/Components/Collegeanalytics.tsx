
import React, { useMemo } from 'react';
import { Student, CollegeStats } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend } from 'recharts';

interface CollegeAnalyticsProps {
  students: Student[];
}

export const CollegeAnalytics: React.FC<CollegeAnalyticsProps> = ({ students }) => {
  const stats = useMemo(() => {
    const collegeGroups: Record<string, Student[]> = {};
    students.forEach(s => {
      if (!collegeGroups[s.college]) collegeGroups[s.college] = [];
      collegeGroups[s.college].push(s);
    });

    return Object.entries(collegeGroups).map(([college, group]) => ({
      college,
      avgGpa: Number((group.reduce((acc, s) => acc + s.cgpa, 0) / group.length).toFixed(2)),
      avgExp: Number((group.reduce((acc, s) => acc + s.experience, 0) / group.length).toFixed(1)),
      studentCount: group.length,
      topSkills: Array.from(new Set(group.flatMap(s => s.skills))).slice(0, 5)
    }));
  }, [students]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <h2 className="text-3xl font-bold text-white">College Comparison</h2>
        <p className="text-slate-500">Performance and skill distribution analysis across partner institutions.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            Average CGPA by College
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="college" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis domain={[0, 4]} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="avgGpa" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900">
            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Experience Benchmarks
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="college" tick={{fill: '#64748b', fontSize: 11}} />
                <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Radar name="Avg Exp (Yrs)" dataKey="avgExp" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map(s => (
          <div key={s.college} className="bg-white p-6 rounded-3xl border hover:shadow-md transition-shadow">
            <h4 className="font-bold text-slate-800 text-lg mb-1">{s.college}</h4>
            <p className="text-xs text-slate-500 font-medium mb-4">{s.studentCount} Active Students</p>
            
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Dominant Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {s.topSkills.map(skill => (
                    <span key={skill} className="px-2 py-0.5 bg-slate-50 text-[10px] text-slate-600 rounded-md border">{skill}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
