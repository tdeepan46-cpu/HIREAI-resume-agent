
export interface Student {
  id: string;
  name: string;
  college: string;
  major: string;
  skills: string[];
  experience: number; // years
  specialization: string;
  summary: string;
  projects: string[];
  cgpa: number;
  email: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface MatchResult {
  studentId: string;
  score: number;
  matchingSkills: string[];
  missingSkills: string[];
  reasoning: string;
}

export interface CollegeStats {
  college: string;
  avgGpa: number;
  avgExp: number;
  studentCount: number;
  topSkills: string[];
}
