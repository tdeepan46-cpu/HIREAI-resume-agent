
import React, { useState } from 'react';
import { Student, MatchResult } from '../types';
import { matchJobToStudents } from '../geminiService';

interface JobMatcherProps {
  students: Student[];
  onShortlist: (id: string) => void;
}

export const JobMatcher: React.FC<JobMatcherProps> = ({ students, onShortlist }) => {
  const [jd, setJd] = useState('');
  const [results, setResults] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleMatch = async () => {
    if (!jd.trim()) return;
    setLoading(true);
    try {
      const matchResults = await matchJobToStudents(jd, students);
      setResults(matchResults.sort((a, b) => b.score - a.score));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-bold">Skill Matcher</h2>
        <p className="text-slate-500">Paste a job description to find the best students for the role instantly.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-[2rem] border shadow-sm">
            <label className="text-sm font-bold text-slate-700 block mb-3 uppercase tracking-wider">Job Details</label>
            <textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Example: We need a designer who knows Figma and basic HTML..."
              className="w-full h-64 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all resize-none"
            />
            <button
              onClick={handleMatch}
              disabled={loading || !jd.trim()}
              className="w-full mt-4 bg-blue-600 text-white font-bold py-3 rounded-2xl hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : 'Find Best Matches'}
            </button>
          </div>

          <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4">
             <div className="w-10 h-10 bg-blue-600 rounded-xl shrink-0 flex items-center justify-center text-white">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </div>
             <div>
               <p className="text-sm font-bold text-blue-900 mb-1">How it works</p>
               <p className="text-xs text-blue-700 leading-relaxed">
                 Our AI reads the job you post and compares it to all student resumes. It quickly finds which students have the skills you need and shows you exactly what they might be missing.
               </p>
             </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          {results.length > 0 ? (
            results.map((res) => {
              const student = students.find(s => s.id === res.studentId);
              if (!student) return null;

              return (
                <div key={res.studentId} className="bg-white p-6 rounded-[2rem] border shadow-sm hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-lg text-slate-900">{student.name}</h4>
                      <p className="text-xs text-blue-600 font-medium">{student.college} • {student.major}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-blue-600">{res.score}%</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Match Score</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-4">
                    <div>
                      <p className="text-[10px] font-bold text-green-600 uppercase mb-2">Matched Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {res.matchingSkills.map(s => (
                          <span key={s} className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold rounded-lg border border-green-100">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-rose-600 uppercase mb-2">Missing Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {res.missingSkills.map(s => (
                          <span key={s} className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-bold rounded-lg border border-rose-100">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed italic border-t pt-4 mb-4">
                    "{res.reasoning}"
                  </p>

                  <button 
                    onClick={() => onShortlist(student.id)}
                    className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
                  >
                    Notify Candidate of Interest
                  </button>
                </div>
              );
            })
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 bg-slate-50 border border-dashed border-slate-300 rounded-[3rem]">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4 text-slate-400">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <h3 className="font-bold text-slate-400">No Matching Results Yet</h3>
              <p className="text-slate-400 text-sm max-w-xs mt-2">Enter a job description on the left to find the best students for the role.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
