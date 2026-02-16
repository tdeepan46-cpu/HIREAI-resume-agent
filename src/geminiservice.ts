
import { GoogleGenAI, Type } from "@google/genai";
import { Student, MatchResult } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const extractStudentFromResume = async (resumeText: string): Promise<Omit<Student, 'id'>> => {
  const prompt = `
    Extract student data from the following resume text and format as JSON.
    Resume Text: "${resumeText}"

    Required fields: name, college, major, skills (array), experience (number in years), specialization, summary, projects (array), cgpa (number), email.
    If a value is missing, infer a reasonable default.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          college: { type: Type.STRING },
          major: { type: Type.STRING },
          skills: { type: Type.ARRAY, items: { type: Type.STRING } },
          experience: { type: Type.NUMBER },
          specialization: { type: Type.STRING },
          summary: { type: Type.STRING },
          projects: { type: Type.ARRAY, items: { type: Type.STRING } },
          cgpa: { type: Type.NUMBER },
          email: { type: Type.STRING }
        },
        required: ["name", "college", "major", "skills", "experience", "specialization", "summary", "projects", "cgpa", "email"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const getComparisonVerdict = async (students: Student[]): Promise<{ winnerId: string; reasoning: string; comparisonPoints: { id: string; pros: string[]; cons: string[] }[] }> => {
  const prompt = `
    As a senior recruiter, compare these ${students.length} students: ${JSON.stringify(students)}
    
    Identify a "Winner" (best overall candidate) and provide a detailed analysis.
    For each student, provide 3 pros and 2 cons/growth areas.
    
    Return JSON with:
    {
      "winnerId": string,
      "reasoning": string,
      "comparisonPoints": [
        { "id": string, "pros": string[], "cons": string[] }
      ]
    }
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          winnerId: { type: Type.STRING },
          reasoning: { type: Type.STRING },
          comparisonPoints: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                cons: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          }
        }
      }
    }
  });

  return JSON.parse(response.text);
};

export const queryStudentAssistant = async (query: string, students: Student[]) => {
  const prompt = `
    You are an Expert Recruitment Assistant. 
    Here is the list of student resumes in JSON: ${JSON.stringify(students)}

    User Query: "${query}"

    Task:
    1. Search for candidates that match requirements.
    2. Recommend best matches and explain why.
    3. If multiple fit, compare them.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });

  return response.text;
};

export const matchJobToStudents = async (jd: string, students: Student[]): Promise<MatchResult[]> => {
  const prompt = `
    Analyze this Job Description: "${jd}"
    Compare it against these students: ${JSON.stringify(students)}

    For EACH student, calculate:
    1. A match score (0-100).
    2. Which of their skills match the JD.
    3. Which JD skills they are missing.
    4. A brief reasoning.

    Return a JSON array of objects.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            studentId: { type: Type.STRING },
            score: { type: Type.NUMBER },
            matchingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            reasoning: { type: Type.STRING }
          }
        }
      }
    }
  });

  return JSON.parse(response.text);
};

export const analyzeStudent = async (student: Student) => {
  const prompt = `Analyze student: ${JSON.stringify(student)}. Return strengths, roles, growth, score in JSON.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          roles: { type: Type.ARRAY, items: { type: Type.STRING } },
          growth: { type: Type.STRING },
          score: { type: Type.NUMBER }
        }
      }
    }
  });
  return JSON.parse(response.text);
};
