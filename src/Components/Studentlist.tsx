import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { Student } from '../types';

interface StudentListProps {
  students: Student[];
  interestList: string[];
  toggleInterest: (id: string) => void;
  onCompare: (id: string) => void;
  onAnalyze: (student: Student) => void;
  selectedForCompare: string[];
}

export const StudentList: React.FC<StudentListProps> = ({ 
  students, 
  interestList, 
  toggleInterest, 
  onCompare, 
  onAnalyze,
  selectedForCompare 
}) => {
  // --- AUTH & DELETE STATES ---
  const [userEmail, setUserEmail] = useState<string>('');
  const [deletedIds, setDeletedIds] = useState<string[]>([]); // Keeps track of what we just deleted
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // CHECK WHO IS LOGGED IN
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUserEmail(session.user.email || '');
    });
  }, []);

  // ⚠️ CHANGE THIS TO YOUR EXACT ADMIN EMAIL ⚠️
  const isAdmin = userEmail === 'tdeepan46@gmail.com'; 

  // --- FILTER STATES ---
  const [searchQuery, setSearchQuery] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('');
  const [majorFilter, setMajorFilter] = useState('');

  const colleges = useMemo(() => Array.from(new Set(students.map(s => s.college))), [students]);
  const majors = useMemo(() => Array.from(new Set(students.map(s => s.major))), [students]);

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // If we just deleted it, filter it out immediately
      if (deletedIds.includes(student.id)) return false;

      const matchesSearch = 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCollege = collegeFilter === '' || student.college === collegeFilter;
      const matchesMajor = majorFilter === '' || student.major === majorFilter;

      return matchesSearch && matchesCollege && matchesMajor;
    });
  }, [students, searchQuery, collegeFilter, majorFilter, deletedIds]);

  // --- DELETE FUNCTION ---
  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to permanently delete this candidate?");
    if (!confirmDelete) return;

    setIsDeleting(id);
    
    // Tell Supabase to delete the row
    const { error } = await supabase.from('resumes').delete().eq('id', id);

    if (error) {
      alert("Error deleting resume: " + error.message);
      setIsDeleting(null);
    } else {
      // Hide it from the UI immediately
      setDeletedIds(prev => [...prev, id]);
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-slate-900/40 border border-white/5 rounded-[2rem] backdrop-blur-sm">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Search Candidates</label>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Name or skills..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">College</label>
          <select 
            value={collegeFilter}
            onChange={(e) => setCollegeFilter(e.target.value)}
            className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none"
          >
            <option value="">All Institutions</option>
            {colleges.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Field of Study</label>
          <select 
            value={majorFilter}
            onChange={(e) => setMajorFilter(e.target.value)}
            className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none"
          >
            <option value="">All Majors</option>
            {majors.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center px-2">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Showing {filteredStudents.length} of {students.length - deletedIds.length} students
        </p>
      </div>

      {/* Student Cards */}
      {filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredStudents.map((student) => {
            const isSelected = selectedForCompare.includes(student.id);
            const isInterested = interestList.includes(student.id);

            return (
              <div key={student.id} className="group relative bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 hover:bg-slate-900/60 hover:border-blue-500/30 transition-all duration-500 shadow-2xl">
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-2xl text-white tracking-tight group-hover:text-blue-400 transition-colors">
                      {student.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">{student.college}</span>
                      <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{student.major}</span>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-slate-800 rounded-lg border border-white/5 text-[10px] font-black text-slate-400">
                    GPA {student.cgpa}
                  </div>
                </div>

                <p className="text-sm text-slate-400 line-clamp-2 mb-6 font-medium leading-relaxed">
                  {student.summary}
                </p>

                <div className="flex flex-wrap gap-2 mb-8">
                  {student.skills.slice(0, 4).map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-blue-500/5 text-blue-400 text-[10px] font-black uppercase tracking-tighter rounded-full border border-blue-500/20">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => onAnalyze(student)}
                    className="py-3 px-4 bg-white text-slate-900 rounded-2xl text-xs font-black hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    Deep Analysis
                  </button>
                  <button
                    onClick={() => toggleInterest(student.id)}
                    className={`py-3 px-4 rounded-2xl text-xs font-black border transition-all flex items-center justify-center gap-2 ${
                      isInterested 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : 'bg-transparent border-white/10 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    {isInterested ? 'Following' : 'Shortlist'}
                  </button>
                </div>

                {/* THE ADMIN DELETE BUTTON */}
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(student.id)}
                    disabled={isDeleting === student.id}
                    className="mt-3 w-full py-2 px-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl text-xs font-black hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    {isDeleting === student.id ? 'Deleting...' : 'Remove Resume'}
                  </button>
                )}

                <button
                  onClick={() => onCompare(student.id)}
                  className={`absolute top-6 right-6 w-8 h-8 rounded-xl border flex items-center justify-center transition-all duration-500 ${
                    isSelected 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/20' 
                      : 'bg-slate-900 border-white/10 text-transparent hover:border-blue-500/50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-16 border-2 border-dashed border-slate-800 rounded-[3rem] bg-slate-900/20 text-center">
          <p className="text-slate-500 font-bold">No students match your current filters.</p>
        </div>
      )}
    </div>
  );
};