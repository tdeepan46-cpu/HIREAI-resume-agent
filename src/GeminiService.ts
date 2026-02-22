import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Student, MatchResult } from "./types";

// 1. Setup API Key
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
    console.error("API Key is missing! Ensure VITE_GEMINI_API_KEY is set in Vercel.");
}

// 2. Initialize the AI
const genAI = new GoogleGenerativeAI(apiKey || "");

// --- HELPER: Resume Extraction ---
// Upgraded to accept either a text string OR a PDF Base64 object!
export const extractStudentFromResume = async (fileData: string | { inlineData: { data: string, mimeType: string } }): Promise<Omit<Student, 'id'>> => {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });
  
  const prompt = `
    Extract student data from the following resume and format as JSON.
    Required fields: name, college, major, skills (array), experience (number), specialization, summary, projects (array), cgpa (number), email.
  `;

  // If it is text (TXT/DOCX), we pass it as a string. If it's a PDF object, we pass the object.
  const parts: any[] = [prompt];
  if (typeof fileData === 'string') {
    parts.push(`Resume Text: "${fileData}"`);
  } else {
    parts.push(fileData);
  }

  const result = await model.generateContent(parts);
  const text = result.response.text();
  return JSON.parse(text);
};

// --- HELPER: Compare Students ---
export const getComparisonVerdict = async (students: Student[]) => {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `Compare these students and pick a winner: ${JSON.stringify(students)}. 
  Return JSON: { "winnerId": string, "reasoning": string, "comparisonPoints": [] }`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
};

// --- HELPER: Chat Assistant ---
export const queryStudentAssistant = async (query: string, students: Student[]) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Context: ${JSON.stringify(students)}. User Query: "${query}"`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};

// --- HELPER: Job Matcher ---
export const matchJobToStudents = async (jd: string, students: Student[]): Promise<MatchResult[]> => {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash", 
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `Match this JD: "${jd}" against these students: ${JSON.stringify(students)}. 
  Return a JSON array of MatchResult objects.`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
};
// --- HELPER: Student Deep Analysis ---
export const analyzeStudent = async (student: Student): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
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