import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Auth from './Auth';
import { Navbar } from './Components/Navbar'; 
import { Sidebar } from './Components/Sidebar';
import { ChatAgent } from './Components/ChatAgent';
import { StudentList } from './Components/Studentlist';
import { ComparisonView } from './Components/Comparisonview';
import { StudentAnalysis } from './Components/Studentanalysis';
import { CollegeAnalytics } from './Components/Collegeanalytics';
import { JobMatcher } from './Components/JobMatcher';
import { StudentPortal } from './Components/Studentportal';
import { Student } from './types';
import { MOCK_STUDENTS } from './Constants';

const App: React.FC = () => {
  // --- AUTHENTICATION STATE ---
  const [session, setSession] = useState<any>(null);

  // --- EXISTING UI STATES ---
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

  // --- SUPABASE LOGIN LISTENER ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  // --- EXISTING LOCAL STORAGE EFFECTS ---
  useEffect(() => localStorage.setItem('hireai_students', JSON.stringify(students)), [students]);
  useEffect(() => localStorage.setItem('hireai_interest', JSON.stringify(interestList)), [interestList]);

  // --- IF NOT LOGGED IN, SHOW LOGIN SCREEN ---
  if (!session) {
    return <Auth />;
  }

  // --- DEFINE ROLES BASED ON EMAIL ---
  const userEmail = session.user.email;
  const isAdmin = userEmail === 'tdeepan46@gmail.com'; // CHANGE THIS TO YOUR EMAIL!
  const isRecruiter = userEmail === 'recruiter@gmail.com';
  const isStudent = !isAdmin && !isRecruiter;

  // --- FORCE STUDENTS TO ONLY SEE THE PORTAL ---
  if (isStudent && view !== 'portal') {
    setView('portal');
  }

  // --- HELPER FUNCTIONS ---
  const toggleInterest = (id: string) => {
    setInterestList(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectForCompare = (id: string) => {
    setSelectedStudentIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleAddStudent = (newStudent: Student) => {
    setStudents(prev => [...prev, newStudent]);
    if (isAdmin) setView('dashboard'); // Admins go back to dashboard, students stay on portal
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-100 overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* NAVBAR WITH LOGOUT BUTTON */}
      <div className="flex justify-between items-center w-full z-20 bg-[#020617] border-b border-slate-800">
        <Navbar />
        <div className="flex items-center gap-4 pr-8">
          <span className="text-sm text-slate-400">
            {isAdmin ? '👑 Admin' : isRecruiter ? '👔 Recruiter' : '🎓 Student'} | {userEmail}
          </span>
          <button onClick={() => supabase.auth.signOut()} className="px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-sm transition-all">
            Sign Out
          </button>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* HIDE SIDEBAR FOR STUDENTS */}
        {!isStudent && <Sidebar activeView={view} setView={setView} />}
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {view === 'dashboard' && !isStudent && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
              <div className="lg:col-span-2 space-y-6">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                  <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
                      Students List
                      <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                    </h1>
                    <p className="text-slate-400 mt-1">Analyzing {students.length} portfolios.</p>
                  </div>
                  
                  {/* ONLY ADMINS SEE THE ADD CANDIDATE BUTTON */}
                  {isAdmin && (
                    <button onClick={() => setView('portal')} className="group relative px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-900/20 flex items-center gap-2">
                      Add Candidate
                    </button>
                  )}
                </header>
                
                {students.length > 0 ? (
                  <StudentList 
                    students={students} 
                    interestList={interestList} 
                    toggleInterest={toggleInterest}
                    onCompare={handleSelectForCompare}
                    selectedForCompare={selectedStudentIds}
                    onAnalyze={(s) => { setAnalyzingStudent(s); setView('analysis'); }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-16 border-2 border-dashed border-slate-800 rounded-[3rem] bg-slate-900/30 text-center">
                    <h3 className="text-2xl font-bold text-slate-300">Students List is empty</h3>
                  </div>
                )}
              </div>

              <div className="lg:col-span-1 flex flex-col gap-4 sticky top-0 h-[calc(100vh-160px)]">
                <ChatAgent students={students} onShortlist={toggleInterest} />
              </div>
            </div>
          )}

          {view === 'colleges' && !isStudent && <CollegeAnalytics students={students} />}
          {view === 'matcher' && !isStudent && <JobMatcher students={students} onShortlist={toggleInterest} />}
          
          {/* EVERYONE CAN SEE THE PORTAL TO UPLOAD, BUT STUDENTS ARE LOCKED HERE */}
          {view === 'portal' && <StudentPortal onAddStudent={handleAddStudent} />}

          {view === 'compare' && !isStudent && (
            <ComparisonView selectedStudents={students.filter(s => selectedStudentIds.includes(s.id))} onBack={() => setView('dashboard')} />
          )}

          {view === 'analysis' && analyzingStudent && !isStudent && (
            <StudentAnalysis student={analyzingStudent} onBack={() => setView('dashboard')} />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;