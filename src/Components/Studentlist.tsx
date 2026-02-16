
import React, { useState, useMemo } from 'react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('');
  const [majorFilter, setMajorFilter] = useState('');

  const colleges = useMemo(() => Array.from(new Set(students.map(s => s.college))), [students]);
  const majors = useMemo(() => Array.from(new Set(students.map(s => s.major))), [students]);

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCollege = collegeFilter === '' || student.college === collegeFilter;
      const matchesMajor = majorFilter === '' || student.major === majorFilter;

      return matchesSearch && matchesCollege && matchesMajor;
    });
  }, [students, searchQuery, collegeFilter, majorFilter]);

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
            <svg className="absolute right-3 top-3 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
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
          Showing {filteredStudents.length} of {students.length} students
        </p>
        {(searchQuery || collegeFilter || majorFilter) && (
          <button 
            onClick={() => {setSearchQuery(''); setCollegeFilter(''); setMajorFilter('');}}
            className="text-[10px] font-black text-blue-500 uppercase hover:text-blue-400 transition-colors"
          >
            Clear Filters
          </button>
        )}
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
                  {student.skills.length > 4 && (
                    <span className="text-[10px] text-slate-600 font-bold ml-1">+{student.skills.length - 4}</span>
                  )}
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
                    <svg className={`w-4 h-4 ${isInterested ? 'fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {isInterested ? 'Following' : 'Shortlist'}
                  </button>
                </div>

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
          <button 
            onClick={() => {setSearchQuery(''); setCollegeFilter(''); setMajorFilter('');}}
            className="mt-4 text-sm font-bold text-blue-500 hover:underline"
          >
            Reset all filters
          </button>
        </div>
      )}
    </div>
  );
};
