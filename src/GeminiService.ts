import { GoogleGenerativeAI } from "@google/generative-ai";
import { Student, MatchResult } from "./types";

// 1. Setup API Key
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// 2. Initialize the AI - FORCING STABLE VERSION
const genAI = new GoogleGenerativeAI(apiKey || "");

// Helper to clean AI response
const cleanAIResponse = (text: string) => {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
};

// --- HELPER: Resume Extraction ---
export const extractStudentFromResume = async (fileData: string | { inlineData: { data: string, mimeType: string } }): Promise<Omit<Student, 'id'>> => {
  // 🌟 THE FIX: We explicitly tell it to use 'v1' instead of 'v1beta'
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash" 
  }, { apiVersion: 'v1' }); 
  
  const prompt = `
    Extract student data from the resume. Return valid JSON only.
    Defaults: name: "Unknown", cgpa: 0, skills: [], email: "n/a".
    Schema: { "name": "str", "college": "str", "major": "str", "skills": [], "experience": 0, "specialization": "str", "summary": "str", "projects": [], "cgpa": 0, "email": "str" }
  `;

  const parts: any[] = [prompt];
  if (typeof fileData === 'string') {
    parts.push(`Resume Text: "${fileData}"`);
  } else {
    parts.push(fileData);
  }

  const result = await model.generateContent(parts);
  const text = cleanAIResponse(result.response.text());
  return JSON.parse(text);
};

// --- HELPER: Compare Students ---
export const getComparisonVerdict = async (students: Student[]) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: 'v1' });
  const prompt = `Compare: ${JSON.stringify(students)}. Return JSON: { "winnerId": "str", "reasoning": "str", "comparisonPoints": [] }`;
  const result = await model.generateContent(prompt);
  const text = cleanAIResponse(result.response.text());
  return JSON.parse(text);
};

// --- HELPER: Chat Assistant ---
export const queryStudentAssistant = async (query: string, students: Student[]) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: 'v1' });
  const prompt = `Context: ${JSON.stringify(students)}. Query: "${query}"`;
  const result = await model.generateContent(prompt);
  return result.response.text();
};

// --- HELPER: Job Matcher ---
export const matchJobToStudents = async (jd: string, students: Student[]): Promise<MatchResult[]> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: 'v1' });
  const prompt = `Match JD: "${jd}" against: ${JSON.stringify(students)}. Return JSON array.`;
  const result = await model.generateContent(prompt);
  const text = cleanAIResponse(result.response.text());
  return JSON.parse(text);
};

// --- HELPER: Student Deep Analysis ---
export const analyzeStudent = async (student: Student): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: 'v1' });
  const prompt = `Analyze: ${JSON.stringify(student)}. Provide recruiter report.`;
  const result = await model.generateContent(prompt);
  return result.response.text();
};