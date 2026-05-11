# HireAI 🚀 

**An AI-Powered Recruitment Platform & Intelligent Resume Chat Agent**

HireAI is a full-stack web application designed to streamline the recruitment process. It leverages artificial intelligence to parse candidate resumes, intelligently match them against specific job descriptions, and feature an interactive chat agent that can discuss applicant qualifications in real-time. 

This project demonstrates a practical application of AI in human resources, focusing on reducing manual screening time and improving candidate-job alignment.

## ✨ Key Features

* **Intelligent Resume Parsing:** Automatically extracts key skills, experience, and education from uploaded candidate resumes.
* **Job Description Matching:** Evaluates parsed resume data against targeted job descriptions to calculate alignment scores and recommend top candidates.
* **Interactive Chat Agent:** An AI-driven conversational interface that allows recruiters to ask specific questions about a candidate's resume and get instant, context-aware answers.
* **Responsive User Interface:** A clean, intuitive dashboard for uploading documents and interacting with the AI agent.

## 🛠️ Technology Stack

**Frontend:**
* HTML5
* CSS3
* JavaScript (ES6+)

**Backend:**
* Python
* Gemini AI API
* 

## 🏗️ Architecture & Workflow

1. **User Input:** The recruiter uploads a candidate's resume and inputs the target job description via the frontend interface.
2. **Processing:** The frontend sends the data asynchronously to the Python backend.
3. **AI Analysis:** The backend utilizes natural language processing models to extract data points, cross-reference them with the job requirements, and generate a contextual embedding of the resume.
4. **Chat Interaction:** When the recruiter queries the chat agent, the backend retrieves the relevant context from the parsed resume and generates a precise, natural language response.

## 🚀 Getting Started

### Prerequisites
* Python 3.8+
* A modern web browser

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/HireAI.git](https://github.com/your-username/HireAI.git)
   cd HireAI
