import React, { useState, useRef, useEffect } from 'react';
import { extractStudentFromResume } from '../GeminiService';
import { supabase } from '../supabaseClient';
import { Student } from '../types';
import * as mammoth from 'mammoth';

interface StudentPortalProps {
  onAddStudent: (student: Student) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({ onAddStudent }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  const clearInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!userId) {
      setError("Error: You must be logged in to upload a resume.");
      return;
    }

    const isPDF = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    const isDOCX = file.name.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    const isTXT = file.name.endsWith('.txt') || file.type === 'text/plain';

    if (!isPDF && !isDOCX && !isTXT) {
      setError("Please upload a .txt, .pdf, or .docx file!");
      clearInput();
      return;
    }

    setFileName(file.name);
    setIsParsing(true);
    setError(null);

    try {
      let aiInput: string | { inlineData: { data: string, mimeType: string } };

      if (isPDF) {
        aiInput = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64 = (event.target?.result as string).split(',')[1];
            resolve({ inlineData: { data: base64, mimeType: 'application/pdf' } });
          };
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        });
      } else if (isDOCX) {
        aiInput = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async (event) => {
            try {
              const arrayBuffer = event.target?.result as ArrayBuffer;
              const result = await mammoth.extractRawText({ arrayBuffer });
              resolve(result.value);
            } catch (err) {
              reject(err);
            }
          };
          reader.onerror = (err) => reject(err);
          reader.readAsArrayBuffer(file);
        });
      } else {
        aiInput = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target?.result as string);
          reader.onerror = (err) => reject(err);
          reader.readAsText(file);
        });
      }

      const parsed = await extractStudentFromResume(aiInput);
      
      const safeSkills = Array.isArray(parsed.skills) 
        ? parsed.skills 
        : (typeof parsed.skills === 'string' ? parsed.skills.split(',') : ['No skills listed']);

      const newResume = {
        user_id: userId,
        name: parsed.name || 'Unknown Candidate',
        college: parsed.college || 'Unknown College',
        major: parsed.major || 'Unknown Major',
        cgpa: Number(parsed.cgpa) || 0,
        skills: safeSkills,
        summary: parsed.summary || 'No summary generated.'
      };

      const { data, error: dbError } = await supabase.from('resumes').insert([newResume]).select();

      if (dbError) throw new Error(dbError.message);

      if (data && data.length > 0) {
        alert("Success! Your AI-parsed resume is saved securely to the database.");
        onAddStudent(data[0] as Student);
      }

    } catch (err: any) {
      console.error(err);
      setError('We had trouble reading or saving your resume. Please try a different file.');
    } finally {
      setIsParsing(false);
      clearInput();
    }
  };

  const triggerInput = () => fileInputRef.current?.click();

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in zoom-in-95 duration-700 pb-20">
      <div className="relative text-center space-y-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-blue-600/10 blur-[60px] rounded-full pointer-events-none"></div>
        <h2 className="text-5xl font-black text-white tracking-tighter">Student Resume Upload</h2>
        <p className="text-slate-400 text-lg max-w-xl mx-auto font-medium">
          Upload your resume below. Our AI system will read it and securely save your professional profile to the database.
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
              {isParsing ? "AI is reading your resume..." : fileName || "Click to upload a resume"}
            </h3>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Supports PDF, DOCX, & TXT files</p>
          </div>

          {error && (
            <div className="px-6 py-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-bold rounded-2xl animate-bounce">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};