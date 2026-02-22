import { GoogleGenerativeAI } from "@google/generative-ai";
import { Student, MatchResult } from "./types";

// 1. Setup API Key
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  console.error("API Key is missing! Ensure VITE_GEMINI_API_KEY is set in your environment.");
}

// 2. Initialize the AI
const genAI = new GoogleGenerativeAI(apiKey || "");

// 3. Define the standard, stable model name
const MODEL_NAME = "gemini-1.5-flash"; 

// Helper to strip markdown formatting from AI JSON responses
const cleanAIResponse = (text: string) => {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
};

// --- MAIN FEATURE: Resume Extraction ---
export const extractStudentFromResume = async (fileData: string | { inlineData: { data: string, mimeType: string } }): Promise<Omit<Student, 'id'>> => {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  
  const prompt = `
    Extract student data from the resume. Return valid JSON only. 
    Defaults: name: "Unknown", cgpa: 0, skills: [], email: "n/a". 
    Schema: { "name": "str", "college": "str", "major": "str", "skills": ["str"], "experience": 0, "specialization": "str", "summary": "str", "projects": ["str"], "cgpa": 0, "email": "str" }
  `;

  // Standard parts array structure for maximum SDK compatibility
  const parts: any[] = [prompt];
  
  if (typeof fileData === 'string') {
    parts.push(`Resume Text: ${fileData}`);
  } else {
    parts.push(fileData); 
  }

  const result = await model.generateContent(parts);
  const text = cleanAIResponse(result.response.text());
  
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("JSON Parsing failed on AI response:", text);
    throw new Error("AI returned an invalid data format.");
  }
};

// --- HELPER: Compare Students ---
export const getComparisonVerdict = async (students: Student[]) => {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const prompt = `Compare these students: ${JSON.stringify(students)}. Return JSON: { "winnerId": "str", "reasoning": "str", "comparisonPoints": ["str"] }`;
  
  const result = await model.generateContent(prompt);
  const text = cleanAIResponse(result.response.text());
  return JSON.parse(text);
};

// --- HELPER: Chat Assistant ---
export const queryStudentAssistant = async (query: string, students: Student[]) => {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const prompt = `Context: ${JSON.stringify(students)}. User Query: "${query}"`;
  
  const result = await model.generateContent(prompt);
  return result.response.text();
};

// --- HELPER: Job Matcher ---
export const matchJobToStudents = async (jd: string, students: Student[]): Promise<MatchResult[]> => {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const prompt = `Match JD: "${jd}" against these students: ${JSON.stringify(students)}. Return JSON array.`;
  
  const result = await model.generateContent(prompt);
  const text = cleanAIResponse(result.response.text());
  return JSON.parse(text);
};

// --- HELPER: Student Deep Analysis ---
export const analyzeStudent = async (student: Student): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const prompt = `Analyze this profile: ${JSON.stringify(student)}. Provide a professional recruiter report.`;
  
  const result = await model.generateContent(prompt);
  return result.response.text();
};