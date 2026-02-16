
import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { analyzeStudent } from '../geminiService';

interface StudentAnalysisProps {
  student: Student;
  onBack: () => void;
}

interface AnalysisResult {
  strengths: string[];
  roles: string[];
  growth: string;
  score: number;
}

export const StudentAnalysis: React.FC<StudentAnalysisProps> = ({ student, onBack }) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      try {
        const result = await analyzeStudent(student);
        setAnalysis(result);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [student]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold">Deep Analysis: {student.name}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core Info */}
        <div className="md:col-span-1 bg-white p-6 rounded-3xl border shadow-sm h-fit">
          <div className="w-20 h-20 bg-blue-100 rounded-2xl mb-4 flex items-center justify-center text-blue-600 font-bold text-2xl mx-auto">
            {student.name.charAt(0)}
          </div>
          <div className="text-center mb-6">
            <h3 className="font-bold text-lg">{student.name}</h3>
            <p className="text-sm text-slate-500">{student.major}</p>
            <p className="text-xs text-blue-600 mt-1">{student.college}</p>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">CGPA</span>
              <span className="font-bold">{student.cgpa}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Experience</span>
              <span className="font-bold">{student.experience} yrs</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Location</span>
              <span className="font-bold italic">Remote Capable</span>
            </div>
          </div>
        </div>

        {/* AI Analysis */}
        <div className="md:col-span-2 bg-white p-8 rounded-3xl border shadow-sm relative min-h-[400px]">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10 rounded-3xl">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500 font-medium">Gemini is analyzing resume data...</p>
            </div>
          ) : analysis ? (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">AI Recruitment Report</h3>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full font-bold">
                  <span className="text-2xl">{analysis.score}</span>
                  <span className="text-xs uppercase">Fit Score</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Key Strengths</h4>
                  <ul className="space-y-2">
                    {analysis.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Ideal Roles</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.roles.map((r, i) => (
                      <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Growth Recommendation
                </h4>
                <p className="text-sm text-amber-900 leading-relaxed">
                  {analysis.growth}
                </p>
              </div>

              <div className="pt-6 border-t">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Summary Overview</h4>
                <p className="text-sm text-slate-600 leading-relaxed italic">
                  "{student.summary}"
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center p-12 text-slate-500">Failed to load analysis.</div>
          )}
        </div>
      </div>
    </div>
  );
};
