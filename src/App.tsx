// Waking up Vercel server
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
import { MOCK_STUDENTS } from './Constants'; // Kept in case you need it later, but no longer used for rendering

const App: React.FC = () => {
  // --- AUTHENTICATION STATE ---
  const [session, setSession] = useState<any>(null);

  // --- START WITH AN EMPTY LIST (NO FAKE DATA) ---
  const [students, setStudents] = useState<Student[]>([]);
  
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  
  // Keep interest list in local storage
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

  // --- FETCH REAL RESUMES FROM DATABASE ---
  useEffect(() => {
    const fetchResumes = async () => {
      const { data, error } = await supabase.from('resumes').select('*');
      if (error) {
        console.error("Error fetching resumes:", error.message);
      } else if (data) {
        setStudents(data); // Display the real database records
      }
    };

    // Only fetch if a user is successfully logged in
    if (session) {
      fetchResumes();
    }
  }, [session]);

  // --- SAVE INTERESTS TO LOCAL STORAGE (BUT NOT STUDENTS) ---
  useEffect(() => {
    localStorage.setItem('hireai_interest', JSON.stringify(interestList));
  }, [interestList]);

  // --- IF NOT LOGGED IN, SHOW LOGIN SCREEN ---
  if (!session) {
    return <Auth />;
  }

  // --- DEFINE ROLES BASED ON EMAIL ---
  const userEmail = session.user.email;
  const isAdmin = userEmail === 'tdeepan46@gmail.com'; 
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
    if (isAdmin) setView('dashboard'); //