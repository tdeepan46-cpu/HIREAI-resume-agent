import { GoogleGenerativeAI } from "@google/generative-ai";
import { Student, MatchResult } from "./types";

// 1. Setup API Key
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
    console.error("API Key is missing! Ensure VITE_GEMINI_API_KEY is set in Vercel.");
}

// 2. Initialize the AI
const genAI = new GoogleGenerativeAI(apiKey || "");
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
    Extract student data from the resume. 
    IMPORTANT: You MUST return a valid JSON object. 
    If a field is missing, use these exact defaults:
    - name: "Candidate Name"
    - college: "Not Specified"
    - major: "Not Specified"
    - skills: []
    - experience: 0
    - specialization: "General"
    - summary: "AI-Generated profile"
    - projects: []
    - cgpa: 0.0
    - email: "not@provided.com"
    
    Required JSON Schema:
    {
      "name": "string",
      "college": "string",
      "major": "string",
      "skills": ["string"],
      "experience": number,
      "specialization": "string",
      "summary": "string",
      "projects": ["string"],
      "cgpa": number,
      "email": "string"
    }
  `;

  const parts: any[] = [prompt];
  if (typeof fileData === 'string') {
    parts.push(fileData);
  } else {
    parts.push(fileData);
  }

  const result = await model.generateContent(parts);
  const text = cleanAIResponse(result.response.text());
  
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("Failed to parse AI JSON:", text);
    throw new Error("AI returned invalid data format.");
  }
};

// --- HELPER: Compare Students ---
export const getComparisonVerdict = async (students: Student[]) => {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const prompt = `Compare these students and pick a winner: ${JSON.stringify(students)}. 
  Return ONLY a JSON object: { "winnerId": string, "reasoning": string, "comparisonPoints": [] }`;
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
  const prompt = `Match this JD: "${jd}" against these students: ${JSON.stringify(students)}. 
  Return ONLY a JSON array of MatchResult objects.`;
  const result = await model.generateContent(prompt);
  const text = cleanAIResponse(result.response.text());
  return JSON.parse(text);
};

// --- HELPER: Student Deep Analysis ---
export const analyzeStudent = async (student: Student): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const prompt = `Analyze this student: ${JSON.stringify(student)}. Provide a professional recruiter report with strengths, gaps, and job roles.`;
  const result = await model.generateContent(prompt);
  return result.response.text();
};