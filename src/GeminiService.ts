import { GoogleGenerativeAI } from "@google/generative-ai";
import { Student, MatchResult } from "./types";

// 1. Setup API Key
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// 2. Initialize the AI
const genAI = new GoogleGenerativeAI(apiKey || "");

// 🌟 THE ULTIMATE FIX: Using the full model path with v1beta
const MODEL_ID = "gemini-1.5-flash"; 

// Helper to clean AI response
const cleanAIResponse = (text: string) => {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
};

// --- HELPER: Resume Extraction ---
export const extractStudentFromResume = async (fileData: string | { inlineData: { data: string, mimeType: string } }): Promise<Omit<Student, 'id'>> => {
  // We use v1beta here as it's the most compatible with 1.5-flash for media uploads
  const model = genAI.getGenerativeModel({ model: MODEL_ID });
  
  const prompt = `
    Extract student data from the resume. Return valid JSON only.
    Defaults: name: "Unknown", cgpa: 0, skills: [], email: "n/a".
    Schema: { "name": "str", "college": "str", "major": "str", "skills": [], "experience": 0, "specialization": "str", "summary": "str", "projects": [], "cgpa": 0, "email": "str" }
  `;

  const parts: any[] = [prompt];
  if (typeof fileData === 'string') {
    parts.push({ text: `Resume Text: ${fileData}` });
  } else {
    parts.push(fileData);
  }

  const result = await model.generateContent(parts);
  const text = cleanAIResponse(result.response.text());
  return JSON.parse(text);
};

// --- HELPER: Compare Students ---
export const getComparisonVerdict = async (students: Student[]) => {
  const model = genAI.getGenerativeModel({ model: MODEL_ID });
  const prompt = `Compare: ${JSON.stringify(students)}. Return JSON: { "winnerId": "str", "reasoning": "str", "comparisonPoints": [] }`;
  const result = await model.generateContent(prompt);
  const text = cleanAIResponse(result.response.text());
  return JSON.parse(text);
};

// --- HELPER: Chat Assistant ---
export const queryStudentAssistant = async (query: string, students: Student[]) => {
  const model = genAI.getGenerativeModel({ model: MODEL_ID });
  const prompt = `Context: ${JSON.stringify(students)}. Query: "${query}"`;
  const result = await model.generateContent(prompt);
  return result.response.text();
};

// --- HELPER: Job Matcher ---
export const matchJobToStudents = async (jd: string, students: Student[]): Promise<MatchResult[]> => {
  const model = genAI.getGenerativeModel({ model: MODEL_ID });
  const prompt = `Match JD: "${jd}" against: ${JSON.stringify(students)}. Return JSON array.`;
  const result = await model.generateContent(prompt);
  const text = cleanAIResponse(result.response.text());
  return JSON.parse(text);
};

// --- HELPER: Student Deep Analysis ---
export const analyzeStudent = async (student: Student): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: MODEL_ID });
  const prompt = `Analyze: ${JSON.stringify(student)}. Provide recruiter report.`;
  const result = await model.generateContent(prompt);
  return result.response.text();
};