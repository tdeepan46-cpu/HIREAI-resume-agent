
import React, { useState, useRef } from 'react';
import { extractStudentFromResume } from '../GeminiService';
import { Student } from '../types';

interface StudentPortalProps {
  onAddStudent: (student: Student) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({ onAddStudent }) => {
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsParsing(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result;
      if (typeof content !== 'string') {
        setError("We couldn't read this file. Try a different one.");
        setIsParsing(false);
        clearInput();
        return;
      }

      try {
        const parsed = await extractStudentFromResume(content);
        const newStudent: Student = {
          ...parsed,
          id: Math.random().toString(36).substr(2, 9),
        };
        onAddStudent(newStudent);
      } catch (err) {
        setError('We had trouble reading your resume. Please make sure it is a clear text file or PDF.');
      } finally {
        setIsParsing(false);
        clearInput();
      }
    };

    reader.onerror = () => {
      setError("Something went wrong while opening the file.");
      setIsParsing(false);
      clearInput();
    };

    reader.readAsText(file);
  };

  const triggerInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in zoom-in-95 duration-700 pb-20">
      <div className="relative text-center space-y-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-blue-600/10 blur-[60px] rounded-full pointer-events-none"></div>
        <h2 className="text-5xl font-black text-white tracking-tighter">Student Resume Upload</h2>
        <p className="text-slate-400 text-lg max-w-xl mx-auto font-medium">
          Upload your resume below. Our system will read it and create a professional profile for you in just a few seconds.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-8">
        <div 
          onClick={triggerInput}
          className={`relative group cursor-pointer border-2 border-dashed rounded-[3rem] p-16 transition-all duration-500 flex flex-col items-center justify-center gap-8 ${
            isParsing ? 'border-blue-500/50 bg-blue-500/5 scale-[0.98]' : 'border-slate-800 bg-slate-900/40 hover:border-blue-500/50 hover:bg-slate-900/60'
          }`}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".txt,.pdf,.doc,.docx"
          />
          
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 blur-[30px] opacity-0 group-hover:opacity-20 transition-opacity"></div>
            <div className="w-24 h-24 bg-slate-800 rounded-3xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500">
              {isParsing ? (
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              )}
            </div>
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-xl font-extrabold text-white">
              {isParsing ? "Reading your resume..." : fileName || "Click to upload or drag resume here"}
            </h3>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Supports PDF, DOCX, or TXT files</p>
          </div>

          {error && (
            <div className="px-6 py-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-bold rounded-2xl animate-bounce">
              {error}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/40 border border-white/5 flex flex-col items-center text-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-500">
               <span className="text-xl">1</span>
             </div>
             <div>
               <p className="text-sm font-bold text-slate-200">Upload File</p>
               <p className="text-[11px] text-slate-500">Pick your resume from your computer.</p>
             </div>
          </div>
          <div className="p-6 rounded-3xl bg-slate-900/40 border border-white/5 flex flex-col items-center text-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-500">
               <span className="text-xl">2</span>
             </div>
             <div>
               <p className="text-sm font-bold text-slate-200">Wait a Moment</p>
               <p className="text-[11px] text-slate-500">Our AI reads your skills and experience.</p>
             </div>
          </div>
          <div className="p-6 rounded-3xl bg-slate-900/40 border border-white/5 flex flex-col items-center text-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-green-600/20 flex items-center justify-center text-green-500">
               <span className="text-xl">3</span>
             </div>
             <div>
               <p className="text-sm font-bold text-slate-200">Get Listed</p>
               <p className="text-[11px] text-slate-500">You are now ready to be found by companies!</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
