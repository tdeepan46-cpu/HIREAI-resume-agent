
import React, { useState, useEffect } from 'react';
import { Navbar } from './Components/Navbar'; 
import { Sidebar } from './Components/Sidebar';
import { ChatAgent } from './Components/Chatagent';
import { StudentList } from './Components/Studentlist';
import { ComparisonView } from './Components/Comparisonview';
import { StudentAnalysis } from './Components/Studentanalysis';
import { CollegeAnalytics } from './Components/Collegeanalytics';
import { JobMatcher } from './Components/Jobmatcher';
import { StudentPortal } from './Components/Studentportal';
import { Student } from './types';
import { MOCK_STUDENTS } from './Constants';

const App: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('hireai_students');
    return saved ? JSON.parse(saved) : MOCK_STUDENTS;
  });
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [interestList, setInterestList] = useState<string[]>(() => {
    const saved = localStorage.getItem('hireai_interest');
    return saved ? JSON.parse(saved) : [];
  });
  const [view, setView] = useState<'dashboard' | 'compare' | 'analysis' | 'colleges' | 'matcher' | 'portal'>('dashboard');
  const [analyzingStudent, setAnalyzingStudent] = useState<Student | null>(null);

  useEffect(() => {
    localStorage.setItem('hireai_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('hireai_interest', JSON.stringify(interestList));
  }, [interestList]);

  const toggleInterest = (id: string) => {
    setInterestList(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectForCompare = (id: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleAddStudent = (newStudent: Student) => {
    setStudents(prev => [...prev, newStudent]);
    setView('dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-100 overflow-hidden relative">
      {/* Decorative background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <Navbar />
      
      <div className="flex flex-1 overflow-hidden relative z-10">
        <Sidebar activeView={view} setView={setView} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {view === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
              <div className="lg:col-span-2 space-y-6">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                  <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
                      Students List
                      <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                    </h1>
                    <p className="text-slate-400 mt-1">
                      {students.length > 0 
                        ? `Analyzing ${students.length} portfolios across ${new Set(students.map(s => s.college)).size} institutions.`
                        : "Ready for incoming applications. Share the portal link with students."}
                    </p>
                  </div>
                  <button 
                    onClick={() => setView('portal')}
                    className="group relative px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-900/20 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Candidate
                  </button>
                </header>
                
                {students.length > 0 ? (
                  <StudentList 
                    students={students} 
                    interestList={interestList} 
                    toggleInterest={toggleInterest}
                    onCompare={handleSelectForCompare}
                    selectedForCompare={selectedStudentIds}
                    onAnalyze={(s) => {
                      setAnalyzingStudent(s);
                      setView('analysis');
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-16 border-2 border-dashed border-slate-800 rounded-[3rem] bg-slate-900/30 text-center">
                    <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
                      <svg className="w-12 h-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-300">Students List is currently empty</h3>
                    <p className="text-slate-500 max-w-sm mt-3">Start by navigating to the Student Portal to upload your first batch of AI-parsed resumes.</p>
                    <button 
                      onClick={() => setView('portal')}
                      className="mt-8 px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all"
                    >
                      Go to Student Portal
                    </button>
                  </div>
                )}
              </div>

              <div className="lg:col-span-1 flex flex-col gap-4 sticky top-0 h-[calc(100vh-160px)]">
                <ChatAgent students={students} onShortlist={toggleInterest} />
              </div>
            </div>
          )}

          {view === 'colleges' && <CollegeAnalytics students={students} />}
          {view === 'matcher' && <JobMatcher students={students} onShortlist={toggleInterest} />}
          {view === 'portal' && <StudentPortal onAddStudent={handleAddStudent} />}

          {view === 'compare' && (
            <ComparisonView 
              selectedStudents={students.filter(s => selectedStudentIds.includes(s.id))} 
              onBack={() => setView('dashboard')}
            />
          )}

          {view === 'analysis' && analyzingStudent && (
            <StudentAnalysis 
              student={analyzingStudent} 
              onBack={() => setView('dashboard')}
            />
          )}
        </main>
      </div>

      {/* Interest Notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {interestList.slice(-3).map((id, idx) => {
          const student = students.find(s => s.id === id);
          return (
            <div key={`${id}-${idx}`} className="bg-white/10 backdrop-blur-xl text-white px-5 py-4 rounded-2xl shadow-2xl border border-white/10 animate-in slide-in-from-right duration-300 pointer-events-auto flex items-center gap-4">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
              <div className="text-sm">
                Candidate <span className="font-extrabold text-blue-400">{student?.name}</span> notified.
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default App;
