# HireAI 🚀 

**An AI-Powered Recruitment Platform & Intelligent Resume Chat Agent**

HireAI is a full-stack web application designed to streamline the recruitment process. It leverages artificial intelligence to parse candidate resumes, intelligently match them against specific job descriptions, and feature an interactive chat agent that can discuss applicant qualifications in real-time. 

## 🧠 Development Methodology: AI-Assisted Architecture

This project was built using an **AI-driven development workflow**. My primary role in this project was **System Architecture and Integration**. 

Rather than manually scripting the frontend and backend modules, I utilized advanced Large Language Models (LLMs) to generate the core codebases, focusing my efforts on the higher-level engineering challenges:
* **System Integration:** Connecting the isolated React frontend, Supabase database, and Google Gemini API into a seamless, unified pipeline.
* **Prompt Engineering:** Designing highly specific prompts to generate functional, secure, and optimized code components.
* **Debugging & Orchestration:** Troubleshooting integration errors, resolving dependency conflicts, and ensuring data flowed correctly between the client, server, and external AI APIs.
* **Environment Configuration:** Managing API keys, database schemas, and deployment environments.

## ✨ Key Features

* **Intelligent Resume Parsing:** Automatically extracts key skills, experience, and education from uploaded candidate resumes.
* **Job Description Matching:** Evaluates parsed resume data against targeted job descriptions to calculate alignment scores.
* **Interactive Chat Agent:** An AI-driven conversational interface that allows recruiters to ask specific questions about a candidate's resume and get instant answers.
* **Responsive User Interface:** A clean, intuitive dashboard for uploading documents and interacting with the AI agent.

## 🛠️ System Architecture & Tech Stack

While the code was AI-generated, the architectural design and stack selection were deliberately chosen for performance and scalability:

**Frontend Ecosystem:**
* React.js & Vite
* Tailwind CSS
* HTML5 / JavaScript (ES6+)

**Backend, Database & AI:**
* Supabase (PostgreSQL & Authentication)
* Google Gemini API (NLP & Chat Generation)

**Infrastructure:**
* Terraform (Infrastructure as Code)

## 🏗️ How The System Integrates

1. **Client Interface:** The user uploads a resume via the React frontend.
2. **Data Routing:** The application securely routes the file data to the Supabase backend for storage and structuring.
3. **AI Handshake:** The system calls the Google Gemini API, passing the structured resume data and system prompts to extract insights.
4. **Data Return:** Gemini returns the parsed data and alignment scores, which are rendered dynamically back on the React dashboard.

## 🚀 Getting Started

### Prerequisites
* Node.js (v16 or higher)
* npm or yarn

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/tdeepan46-cpu/HIREAI-resume-agent.git](https://github.com/tdeepan46-cpu/HIREAI-resume-agent.git)
   cd HIREAI-resume-agent
