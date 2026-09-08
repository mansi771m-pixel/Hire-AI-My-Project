export interface SampleResumePreset {
  id: string;
  name: string;
  targetRole: string;
  content: string;
}

export const SAMPLE_RESUMES: SampleResumePreset[] = [
  {
    id: "mern-senior",
    name: "Elena Rostova (Senior MERN & AI)",
    targetRole: "Senior Full-Stack Engineer (MERN & AI)",
    content: `ELENA ROSTOVA
San Francisco, CA | (415) 890-2134 | elena.rostova@example.com | github.com/erostova | linkedin.com/in/erostova

PROFESSIONAL SUMMARY:
Senior Full-Stack Software Engineer with 6+ years designing high-throughput web architectures, real-time collaboration engines, and LLM-powered enterprise tooling. Proven success building resilient Node/Express backends, modern React applications, and integrating generative AI streaming APIs.

TECHNICAL SKILLS:
- Languages & Frameworks: TypeScript, JavaScript, React 19/18, Node.js, Express, HTML5, Tailwind CSS
- Databases & Storage: MongoDB (Atlas, Aggregation Pipeline, Indexing), Redis, PostgreSQL
- AI & LLM Systems: Google Gemini API, OpenAI SDK, Prompt Engineering, Streaming SSE, Tool Calling
- Cloud & Infrastructure: Docker, GCP (Cloud Run, Compute), AWS, CI/CD GitHub Actions, WebSockets

EXPERIENCE:
Senior Full Stack Engineer | Nexus AI Technologies, San Francisco, CA
June 2023 - Present
- Architected real-time AI assistant backend serving 50,000+ daily active users using Express, TypeScript, and WebSockets.
- Decreased average response latency by 45% using streaming token responses and Redis caching layers.
- Designed MongoDB collections with optimized compound indexes, reducing p99 database query time from 280ms to 42ms.
- Mentored team of 4 junior engineers on clean asynchronous patterns, React performance, and test-driven development.

Full Stack Developer | CloudVibe Software, San Jose, CA
August 2020 - May 2023
- Developed MERN stack client dashboards with granular RBAC permissions and dynamic data reporting.
- Migrated legacy relational schemas to MongoDB Atlas, improving write throughput by 3x.
- Built reusable component library using React and Tailwind CSS adopted across 3 engineering divisions.

EDUCATION:
B.S. in Computer Science | University of California, Berkeley (2016 - 2020)
GPA: 3.85 / 4.0

CERTIFICATIONS:
- Google Cloud Certified Professional Cloud Architect
- MongoDB Certified Developer Associate`,
  },
  {
    id: "ai-prompt-engineer",
    name: "Aaliyah Chen (Applied AI & Prompting)",
    targetRole: "AI & Machine Learning Prompt Specialist",
    content: `AALIYAH CHEN
Seattle, WA | (206) 441-7890 | aaliyah.chen@example.com | linkedin.com/in/aaliyah-chen

PROFESSIONAL SUMMARY:
Applied AI Engineer with 4 years specializing in prompt design, structured JSON output validation, hallucination minimization, and autonomous agent workflows. Skilled at bridging business domain needs with cutting-edge LLMs.

CORE COMPETENCIES:
- AI & LLM: Gemini 3.8/Flash, Prompt Optimization, RAG (Retrieval Augmented Generation), LangChain, Vector DBs (Pinecone, Chroma)
- Languages: Python, TypeScript, SQL, Node.js
- Frameworks & Tools: FastAPI, Express, React, Zod, Git, Docker

PROFESSIONAL EXPERIENCE:
AI Workflow Engineer | Cognitive Synthetics, Seattle, WA
January 2023 - Present
- Designed automated prompt evaluation system reducing false positives in classification from 14% to under 2%.
- Created agentic tool-use pipelines for financial report parsing utilizing Gemini and structured schema enforcement.
- Benchmarked response latency vs accuracy across leading commercial models to optimize operational cloud spend by 30%.

Machine Learning Associate | DataPulse Analytics, Bellevue, WA
June 2021 - December 2022
- Built text embedding semantic search engine indexing 500k+ customer support documents.
- Partnered with product teams to design guardrails preventing prompt injection and toxic completions.

EDUCATION:
M.S. in Information Systems & AI | University of Washington (2020 - 2022)
B.S. in Applied Mathematics | University of Washington (2016 - 2020)`,
  },
  {
    id: "junior-developer",
    name: "Leo Garcia (Junior Web Developer)",
    targetRole: "Senior Full-Stack Engineer (MERN & AI)",
    content: `LEO GARCIA
Austin, TX | (512) 330-9921 | leo.garcia@example.com

SUMMARY:
Motivated Junior Web Developer with 1.5 years of experience building frontend interfaces and simple REST endpoints using React and JavaScript. Eager to expand into large-scale full stack engineering.

TECHNICAL SKILLS:
HTML5, CSS3, JavaScript, React, basic Node.js, Git, Bootstrap

EXPERIENCE:
Junior Web Developer | PixelCraft Studio, Austin, TX
March 2024 - Present
- Created responsive landing pages for local business clients using HTML5, CSS3, and React.
- Fixed frontend UI bugs and updated styling using Tailwind CSS.
- Assisted backend team with basic Express CRUD endpoints.

EDUCATION:
Full Stack Web Development Certificate | Austin Coding Academy (2023)
B.A. in Communications | Texas State University (2022)`,
  },
];
