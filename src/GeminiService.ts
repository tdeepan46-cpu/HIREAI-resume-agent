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
const MODEL_NAME = "gemini-2.5-flash";

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
  const prompt = `
    Compare these candidates: ${JSON.stringify(students)}. 
    You MUST return ONLY a valid JSON object. Do not include markdown formatting or backticks.
    
    Required JSON Structure:
    {
      "winnerId": "exact id of the best student",
      "reasoning": "A solid paragraph explaining why they are the better choice.",
      "comparisonPoints": [
        {
          "id": "exact id of the first student",
          "pros": ["Strong cloud skills", "AWS certified"],
          "cons": ["Less experience in Java", "Needs more project work"]
        },
        {
          "id": "exact id of the second student",
          "pros": ["Strong core programming", "Good foundation"],
          "cons": ["Lacks cloud exposure", "No specialized certifications"]
        }
      ]
    }
  `;
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
export const matchJobToStudents = async (jd: string, students: Student[]): Promise<any[]> => {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const prompt = `
    Match this Job Description: "${jd}" against these students: ${JSON.stringify(students)}. 
    You MUST return ONLY a valid JSON array of objects. Do not include markdown formatting.
    
    Required JSON Array Structure:
    [
      {
        "studentId": "exact id of the student",
        "score": 85,
        "matchingSkills": ["Matched Skill 1", "Matched Skill 2"],
        "missingSkills": ["Missing Skill 1", "Missing Skill 2"],
        "reasoning": "A brief explanation of why they scored this match percentage."
      }
    ]
  `;
  const result = await model.generateContent(prompt);
  const text = cleanAIResponse(result.response.text());
  return JSON.parse(text);
};
// --- HELPER: Student Deep Analysis ---
export const analyzeStudent = async (student: Student): Promise<any> => {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  
  const prompt = `
    Analyze this candidate profile: ${JSON.stringify(student)}. 
    You MUST return ONLY a valid JSON object. 
    Do not use markdown formatting. Do not include extra text.
    
    Required JSON Structure:
    {
      "strengths": ["strength 1", "strength 2", "strength 3"],
      "roles": ["Recommended Job 1", "Recommended Job 2"],
      "growth": "A short paragraph explaining one key area they need to improve.",
      "score": 85
    }
  `;
  
  const result = await model.generateContent(prompt);
  const text = cleanAIResponse(result.response.text());
  return JSON.parse(text);
};