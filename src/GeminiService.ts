import { GoogleGenerativeAI } from "@google/generative-ai";
import { Student, MatchResult } from "./types";

// 1. Setup API Key
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
    console.error("API Key is missing! Ensure VITE_GEMINI_API_KEY is set in Vercel.");
}

// 2. Initialize the AI (Default uses stable v1 version)
const genAI = new GoogleGenerativeAI(apiKey || "");

// 🌟 STABLE MODEL NAME
const MODEL_NAME = "gemini-1.5-flash";

// Helper to clean AI response (removes ```json ... ``` blocks)
const cleanAIResponse = (text: string) => {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
};

// --- HELPER: Resume Extraction ---
export const extractStudentFromResume = async (fileData: string | { inlineData: { data: string, mimeType: string } }): Promise<Omit<Student, 'id'>> => {
  const model = genAI.getGenerativeModel({ 
    model: MODEL_NAME,
    generationConfig: { responseMimeType: "application/json" }
  });
  
  const prompt = `
    Extract student data from the following resume and format as JSON.
    Required fields: name, college, major, skills (array), experience (number), specialization, summary, projects (array), cgpa (number), email.
    Respond ONLY with raw JSON.
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
  const model = genAI.getGenerativeModel({ 
    model: MODEL_NAME,
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `Compare these students and pick a winner: ${JSON.stringify(students)}. 
  Return JSON: { "winnerId": string, "reasoning": string, "comparisonPoints": [] }`;

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
  const model = genAI.getGenerativeModel({ 
    model: MODEL_NAME, 
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `Match this JD: "${jd}" against these students: ${JSON.stringify(students)}. 
  Return a JSON array of MatchResult objects.`;

  const result = await model.generateContent(prompt);
  const text = cleanAIResponse(result.response.text());
  return JSON.parse(text);
};

// --- HELPER: Student Deep Analysis ---
export const analyzeStudent = async (student: Student): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  
  const prompt = `
    Perform a professional recruiter analysis on this candidate profile:
    ${JSON.stringify(student)}
    
    Format the response nicely with headings and bullet points. Include:
    1. Key Strengths & Highlights
    2. Areas for Improvement / Skill Gaps
    3. Recommended Job Roles based on their profile
    4. 3 challenging technical interview questions to ask them
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
};