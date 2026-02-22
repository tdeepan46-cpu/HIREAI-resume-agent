
import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { getComparisonVerdict } from '../GeminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ComparisonViewProps {
  selectedStudents: Student[];
  onBack: () => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ selectedStudents, onBack }) => {
  const [verdict, setVerdict] = useState<{ winnerId: string; reasoning: string; comparisonPoints: any[] } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedStudents.length >= 2) {
      const fetchVerdict = async () => {
        setLoading(true);
        try {
          const res = await getComparisonVerdict(selectedStudents);
          setVerdict(res);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
      fetchVerdict();
    }
  }, [selectedStudents]);

  if (selectedStudents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border border-dashed border-slate-300">
        <p className="text-slate-500 mb-4">No students selected for comparison.</p>
        <button onClick={onBack} className="text-blue-600 font-semibold hover:underline">Go back to Students List</button>
      </div>
    );
  }

  const chartData = [
    { name: 'CGPA', ...selectedStudents.reduce((acc, s) => ({ ...acc, [s.name]: s.cgpa }), {}) },
    { name: 'Experience', ...selectedStudents.reduce((acc, s) => ({ ...acc, [s.name]: s.experience }), {}) },
  ];

  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h2 className="text-3xl font-black tracking-tight">Student Comparison</h2>
      </div>

      {/* AI VERDICT SECTION */}
      {selectedStudents.length >= 2 && (
        <div className="bg-slate-900 text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden border border-slate-800">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-10">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-400 font-bold animate-pulse">Analyzing given data...</p>
            </div>
          ) : verdict ? (
            <div className="space-y-8">
              <div className="flex items-start justify-between">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500 text-white text-[10px] font-black uppercase rounded-full">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                    AI Choice Recommendation
                  </div>
                  <h3 className="text-4xl font-black">
                    Why <span className="text-blue-400">{selectedStudents.find(s => s.id === verdict.winnerId)?.name}</span> is the better choice
                  </h3>
                  <p className="text-slate-400 text-lg leading-relaxed">{verdict.reasoning}</p>
                </div>
                <div className="hidden lg:block">
                  <div className="w-32 h-32 bg-blue-600 rounded-3xl flex items-center justify-center text-5xl rotate-6 shadow-2xl">🏆</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {verdict.comparisonPoints?.map(point => {
                  const s = selectedStudents.find(st => st.id === point.id);
                  const isWinner = s?.id === verdict.winnerId;
                  return (
                    <div key={point.id} className={`p-6 rounded-[2rem] border transition-all ${isWinner ? 'bg-white/10 border-blue-500/50 scale-105' : 'bg-white/5 border-slate-800 opacity-80'}`}>
                      <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                        {s?.name}
                        {isWinner && <span className="text-xs bg-blue-500 px-2 py-0.5 rounded text-white">Best Fit</span>}
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] uppercase font-black text-green-400 mb-2">Key Strengths</p>
                          <ul className="text-xs space-y-1.5">
                           {point.pros?.map((p: string, i: number) => <li key={i} className="flex gap-2"><span>•</span>{p}</li>)}
                          </ul>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-black text-rose-400 mb-2">Risks / Gaps</p>
                          <ul className="text-xs space-y-1.5">
                            {point.cons?.map((p: string, i: number) => <li key={i} className="flex gap-2"><span>•</span>{p}</li>)}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* CHART SECTION */}
      <div className="bg-white p-8 rounded-[3rem] border shadow-sm">
        <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-slate-900">
          <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
          Quantitative Metrics
        </h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)' }}
              />
              <Legend verticalAlign="top" height={36}/>
              {selectedStudents.map((s, i) => (
                <Bar key={s.id} dataKey={s.name} fill={colors[i % colors.length]} radius={[8, 8, 0, 0]} barSize={40} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CARDS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {selectedStudents.map((s) => (
          <div key={s.id} className="bg-white p-8 rounded-[3rem] border shadow-md flex flex-col h-full hover:-translate-y-2 transition-transform">
            <div className="mb-6">
              <h4 className="text-2xl font-black text-slate-900">{s.name}</h4>
              <p className="text-sm font-bold text-blue-600">{s.college}</p>
              <p className="text-xs text-slate-400 mt-1">{s.major}</p>
            </div>
            
            <div className="space-y-6 flex-1 text-slate-700">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Key Competencies</p>
                <div className="flex flex-wrap gap-2">
                  {s.skills?.map(skill => (
                    <span key={skill} className="text-[11px] font-bold px-3 py-1 bg-slate-50 border rounded-xl">{skill}</span>
                  ))}
                </div>
              </div>
              
              <div className="pt-6 border-t">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Flagship Projects</p>
                <div className="space-y-2">
                  {s.projects?.map(p => (
                    <div key={p} className="text-sm font-medium text-slate-700 bg-slate-50 p-3 rounded-2xl border-l-4 border-blue-500">
                      {p}
                    </div>
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
