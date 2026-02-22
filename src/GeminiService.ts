import { GoogleGenerativeAI } from "@google/generative-ai";
import { Student, MatchResult } from "./types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

// 🌟 THE ULTIMATE FIX: Using the versioned stable ID to bypass the 404
const MODEL_ID = "gemini-1.5-flash-001"; 

const cleanAIResponse = (text: string) => {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
};

export const extractStudentFromResume = async (fileData: string | { inlineData: { data: string, mimeType: string } }): Promise<Omit<Student, 'id'>> => {
  // Explicitly setting the model and ensuring the parts are structured for the latest SDK
  const model = genAI.getGenerativeModel({ model: MODEL_ID });
  
  const prompt = `
    Extract student data from the resume. Return valid JSON only.
    Defaults: name: "Unknown", cgpa: 0, skills: [], email: "n/a".
    Schema: { "name": "str", "college": "str", "major": "str", "skills": [], "experience": 0, "specialization": "str", "summary": "str", "projects": [], "cgpa": 0, "email": "str" }
  `;

  // Standardizing the parts array for all file types
  const parts = [];
  parts.push({ text: prompt });
  
  if (typeof fileData === 'string') {
    parts.push({ text: `Resume Text: ${fileData}` });
  } else {
    parts.push(fileData);
  }

  const result = await model.generateContent({ contents: [{ role: 'user', parts }] });
  const text = cleanAIResponse(result.response.text());
  return JSON.parse(text);
};

// --- HELPER: Compare Students ---
export const getComparisonVerdict = async (students: Student[]) => {
  const model = genAI.getGenerativeModel({ model: MODEL_ID });
  const prompt = `Compare these students: ${JSON.stringify(students)}. Return JSON: { "winnerId": "str", "reasoning": "str", "comparisonPoints": [] }`;
  const result = await model.generateContent(prompt);
  const text = cleanAIResponse(result.response.text());
  return JSON.parse(text);
};

// --- HELPER: Chat Assistant ---
export const queryStudentAssistant = async (query: string, students: Student[]) => {
  const model = genAI.getGenerativeModel({ model: MODEL_ID });
  const prompt = `Context: ${JSON.stringify(students)}. User Query: "${query}"`;
  const result = await model.generateContent(prompt);
  return result.response.text();
};

// --- HELPER: Job Matcher ---
export const matchJobToStudents = async (jd: string, students: Student[]): Promise<MatchResult[]> => {
  const model = genAI.getGenerativeModel({ model: MODEL_ID });
  const prompt = `Match JD: "${jd}" against these students: ${JSON.stringify(students)}. Return JSON array.`;
  const result = await model.generateContent(prompt);
  const text = cleanAIResponse(result.response.text());
  return JSON.parse(text);
};

// --- HELPER: Student Deep Analysis ---
export const analyzeStudent = async (student: Student): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: MODEL_ID });
  const prompt = `Analyze this profile: ${JSON.stringify(student)}. Provide a professional report.`;
  const result = await model.generateContent(prompt);
  return result.response.text();
};