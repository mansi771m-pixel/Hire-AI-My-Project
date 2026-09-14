import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import type { Job, Candidate, InterviewSlot, InterviewEvaluation, PlatformStats } from "./src/types";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Lazy AI Client Helper
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// In-Memory Database Store (Simulating MERN MongoDB persistence)
let jobsStore: Job[] = [
  {
    id: "job-1",
    title: "Senior Full-Stack Engineer (MERN & AI)",
    department: "Engineering",
    location: "San Francisco, CA (Hybrid)",
    type: "Full-time",
    experienceLevel: "Senior",
    salaryRange: "$150,000 - $185,000",
    description:
      "We are seeking an experienced Full-Stack Engineer to lead the architecture and development of our next-generation AI recruitment and workflow platforms. You will design resilient Node/Express backends, modern React UIs, and integrate LLM agents.",
    requirements: [
      "5+ years of production experience with Node.js, Express, and React",
      "Strong proficiency in TypeScript, RESTful API design, and asynchronous state handling",
      "Demonstrated experience integrating Large Language Models (Gemini, OpenAI, or LangChain)",
      "Deep understanding of database schema design (MongoDB, PostgreSQL) and indexing",
      "Experience deploying containerized applications with Docker and Cloud Run / AWS",
    ],
    preferredSkills: ["TypeScript", "React", "Node.js", "MongoDB", "Tailwind CSS", "Gemini API", "WebSockets"],
    presetQuestions: [
      "Walk me through the architecture of a high-concurrency real-time application you built using Node.js and React.",
      "How do you handle API rate limits, streaming responses, and latency when integrating LLMs into web apps?",
      "Can you explain how you structure data indexing and caching in MongoDB or Redis to optimize query performance?",
      "Describe a time when you had to debug a difficult race condition or memory leak in a production Node server.",
      "How do you approach writing clean, testable code while maintaining high delivery velocity in a startup?",
    ],
    status: "Active",
    createdAt: "2026-02-15T09:00:00.000Z",
    applicantCount: 14,
  },
  {
    id: "job-2",
    title: "AI & Machine Learning Prompt Specialist",
    department: "AI Research & Solutions",
    location: "Remote",
    type: "Full-time",
    experienceLevel: "Mid-Level",
    salaryRange: "$130,000 - $160,000",
    description:
      "Join our Applied AI team to design, evaluate, and benchmark autonomous AI agent screening workflows, synthetic candidate evaluations, and structured knowledge extraction pipelines.",
    requirements: [
      "3+ years in Applied AI, Natural Language Processing, or Prompt Architecture",
      "Hands-on experience with Python or TypeScript SDKs for Gemini, Anthropic, or OpenAI",
      "Familiarity with structured output validation (JSON schema, Pydantic, Zod)",
      "Knowledge of few-shot prompting, chain-of-thought, and agentic tool use",
    ],
    preferredSkills: ["Prompt Engineering", "Python", "TypeScript", "LLM Evaluation", "Retrieval Augmented Generation (RAG)"],
    presetQuestions: [
      "How do you evaluate and minimize hallucinations when deploying an LLM into an automated scoring pipeline?",
      "Explain your technique for designing system instructions that strictly adhere to JSON schemas.",
      "What are the trade-offs between zero-shot, few-shot prompting, and fine-tuning for specialized domain tasks?",
    ],
    status: "Active",
    createdAt: "2026-02-20T14:30:00.000Z",
    applicantCount: 9,
  },
  {
    id: "job-3",
    title: "Product Manager - AI Platform & Developer Tools",
    department: "Product",
    location: "New York, NY (Hybrid)",
    type: "Full-time",
    experienceLevel: "Senior",
    salaryRange: "$140,000 - $175,000",
    description:
      "Looking for a technical Product Manager to spearhead our AI recruitment automation roadmap. You will bridge candidate experience, recruiter analytics, and cutting-edge GenAI agent workflows.",
    requirements: [
      "4+ years of product management experience in B2B SaaS or TalentTech",
      "Strong technical intuition for AI/ML capabilities, APIs, and developer workflows",
      "Proven track record of defining product metrics, driving discovery, and shipping 0-to-1 features",
    ],
    preferredSkills: ["Product Strategy", "User Research", "Agile Roadmap", "Data Analytics", "HRTech / ATS Knowledge"],
    presetQuestions: [
      "How do you balance AI autonomy with human-in-the-loop oversight in sensitive domains like hiring?",
      "Tell me about a time you had to pivot a product feature based on user telemetry and behavioral feedback.",
      "How do you prioritize your roadmap when balancing enterprise customer requests against core platform scalability?",
    ],
    status: "Active",
    createdAt: "2026-02-25T11:00:00.000Z",
    applicantCount: 6,
  },
];

let candidatesStore: Candidate[] = [
  {
    id: "cand-1",
    name: "Elena Rostova",
    email: "elena.rostova@example.com",
    phone: "+1 (415) 890-2134",
    jobId: "job-1",
    jobTitle: "Senior Full-Stack Engineer (MERN & AI)",
    status: "Interviewed",
    atsScore: 94,
    matchSummary:
      "Exceptional match. Elena brings 6+ years of specialized MERN stack engineering with deep production experience deploying generative AI pipelines on GCP and Node.js microservices.",
    strengths: [
      "6+ years full-stack TypeScript, React 18/19, and Node.js",
      "Production deployment of Gemini & OpenAI API streaming agents",
      "Strong MongoDB schema design and sharding background",
      "Clean architectural approach with 90%+ automated test coverage",
    ],
    missingSkills: ["Kubernetes (listed as familiar, not expert)"],
    parsedResume: {
      fullName: "Elena Rostova",
      email: "elena.rostova@example.com",
      phone: "+1 (415) 890-2134",
      location: "San Francisco, CA",
      summary:
        "Senior Full-Stack Software Engineer with 6+ years designing high-throughput web architectures, real-time collaboration engines, and LLM-powered enterprise tooling.",
      skills: ["React", "TypeScript", "Node.js", "Express", "MongoDB", "Gemini API", "Tailwind CSS", "Docker", "Redis"],
      experienceYears: 6,
      experiences: [
        {
          role: "Senior Full Stack Engineer",
          company: "Nexus AI Technologies",
          duration: "2023 - Present",
          highlights: [
            "Architected real-time AI assistant backend serving 50,000+ daily active users using Express & WebSockets.",
            "Decreased average response latency by 45% using streaming token responses and Redis caching.",
            "Mentored team of 4 junior engineers on clean asynchronous patterns and React performance.",
          ],
        },
        {
          role: "Full Stack Developer",
          company: "CloudVibe Software",
          duration: "2020 - 2023",
          highlights: [
            "Built MERN stack client dashboards with granular RBAC and dynamic data reporting.",
            "Migrated relational schemas to MongoDB Atlas, improving write throughput by 3x.",
          ],
        },
      ],
      education: [
        {
          degree: "B.S. in Computer Science",
          institution: "University of California, Berkeley",
          year: "2020",
        },
      ],
      certifications: ["GCP Professional Cloud Architect", "MongoDB Certified Developer"],
    },
    appliedAt: "2026-03-01T10:15:00.000Z",
    interviewId: "int-1",
    evaluation: {
      id: "eval-1",
      candidateId: "cand-1",
      candidateName: "Elena Rostova",
      jobId: "job-1",
      jobTitle: "Senior Full-Stack Engineer (MERN & AI)",
      overallScore: 92,
      recommendation: "Strong Hire",
      categoryScores: {
        technical: 95,
        communication: 90,
        problemSolving: 92,
        culturalFit: 91,
      },
      strengths: [
        "Articulated microservice event loop concepts and memory management with crystal clarity.",
        "Proactively brought up security considerations regarding client vs server LLM key safety.",
        "Demonstrated deep empathy for end-user latency and streaming UX.",
      ],
      areasForImprovement: ["Could elaborate more on distributed tracing across multi-region clusters."],
      summaryNotes:
        "Elena demonstrated outstanding technical competence, high architectural maturity, and concise communication. Highly recommended for immediate offer.",
      transcript: [
        {
          speaker: "agent",
          message:
            "Hello Elena! I'm Alex, your AI technical screener today. Let's start with your architectural experience: Can you walk me through how you designed your high-concurrency real-time application using Node.js and React at Nexus AI?",
          timestamp: "00:01",
        },
        {
          speaker: "candidate",
          message:
            "At Nexus AI, our system received thousands of concurrent WebSocket connections. We decoupled the ingestion layer from the heavy LLM inference queue using a lightweight Node.js event broker with Redis Pub/Sub, and streamed tokens directly via server-sent events to a customized React hook that batch-rendered updates using requestAnimationFrame.",
          timestamp: "00:45",
          critique: "Superb architectural explanation. Correctly highlighted decoupling, streaming, and UI batch rendering.",
        },
        {
          speaker: "agent",
          message:
            "That's a very solid approach. How did you handle API rate limits and token exhaustion when communicating with the upstream LLM providers?",
          timestamp: "01:10",
        },
        {
          speaker: "candidate",
          message:
            "We implemented a token-bucket rate limiter combined with an exponential backoff jitter queue in BullMQ. If an upstream provider returned a 429 status code, our fallback router would gracefully downgrade non-critical requests to a lighter flash model while preserving user session continuity.",
          timestamp: "01:55",
          critique: "Demonstrated strong fault tolerance principles and graceful model fallback design.",
        },
      ],
      evaluatedAt: "2026-03-03T16:20:00.000Z",
    },
  },
  {
    id: "cand-2",
    name: "Marcus Vance",
    email: "marcus.vance@example.com",
    phone: "+1 (512) 674-9021",
    jobId: "job-1",
    jobTitle: "Senior Full-Stack Engineer (MERN & AI)",
    status: "Interview Scheduled",
    atsScore: 88,
    matchSummary:
      "Solid candidate with 5 years of full-stack JavaScript/TypeScript engineering, REST API architecture, and React application development.",
    strengths: [
      "5 years Node.js and React expertise",
      "Hands-on experience with MongoDB Atlas & Mongoose",
      "Skilled in building responsive web applications and dashboards",
    ],
    missingSkills: ["Limited production GenAI agent tooling experience"],
    parsedResume: {
      fullName: "Marcus Vance",
      email: "marcus.vance@example.com",
      phone: "+1 (512) 674-9021",
      location: "Austin, TX",
      summary:
        "Full-Stack Developer with 5 years of experience delivering robust web applications using the MERN stack, GraphQL, and modern DevOps tools.",
      skills: ["JavaScript", "TypeScript", "React", "Node.js", "Express", "MongoDB", "Docker", "GraphQL"],
      experienceYears: 5,
      experiences: [
        {
          role: "Senior Software Engineer",
          company: "Austin Digital Labs",
          duration: "2022 - Present",
          highlights: [
            "Built customer-facing portal using React, Tailwind CSS, and Express backend.",
            "Implemented CI/CD pipelines with GitHub Actions, reducing deployment errors by 30%.",
          ],
        },
      ],
      education: [
        {
          degree: "B.S. in Software Engineering",
          institution: "University of Texas at Austin",
          year: "2021",
        },
      ],
    },
    appliedAt: "2026-03-02T11:45:00.000Z",
    interviewId: "int-2",
  },
  {
    id: "cand-3",
    name: "Aaliyah Chen",
    email: "aaliyah.chen@example.com",
    phone: "+1 (206) 441-7890",
    jobId: "job-2",
    jobTitle: "AI & Machine Learning Prompt Specialist",
    status: "Screened",
    atsScore: 91,
    matchSummary:
      "Strong background in LLM prompt optimization, structured JSON extraction, and RAG architectures. Highly suitable for our AI agent engineering pipeline.",
    strengths: [
      "Published benchmarks on few-shot reasoning models",
      "Expertise in Python, TypeScript, and JSON Schema validation",
      "Demonstrated experience building automated test suites for LLM outputs",
    ],
    missingSkills: ["Direct recruitment technology domain experience"],
    parsedResume: {
      fullName: "Aaliyah Chen",
      email: "aaliyah.chen@example.com",
      phone: "+1 (206) 441-7890",
      location: "Seattle, WA",
      summary:
        "Applied AI Engineer specializing in prompt design, hallucination reduction, and autonomous agents with 4 years in software and data engineering.",
      skills: ["Prompt Engineering", "Python", "TypeScript", "Gemini API", "RAG", "LangChain", "Vector Databases"],
      experienceYears: 4,
      experiences: [
        {
          role: "AI Workflow Engineer",
          company: "Cognitive Synthetics",
          duration: "2023 - Present",
          highlights: [
            "Designed automated prompt evaluation system reducing false positives in text classification from 14% to under 2%.",
            "Built agentic tool-use pipelines for financial report parsing.",
          ],
        },
      ],
      education: [
        {
          degree: "M.S. in Information Systems & AI",
          institution: "University of Washington",
          year: "2022",
        },
      ],
    },
    appliedAt: "2026-03-04T08:30:00.000Z",
  },
  {
    id: "cand-4",
    name: "David Kim",
    email: "david.kim@example.com",
    phone: "+1 (646) 332-9011",
    jobId: "job-3",
    jobTitle: "Product Manager - AI Platform & Developer Tools",
    status: "Applied",
    atsScore: 78,
    matchSummary:
      "Experienced B2B product manager with 4 years leading SaaS growth initiatives. Possesses general software familiarity, but limited technical depth in machine learning pipelines.",
    strengths: ["Strong user research and requirement framing", "Agile scrum methodology leadership"],
    missingSkills: ["Hands-on LLM agent design", "Developer API ecosystem depth"],
    parsedResume: {
      fullName: "David Kim",
      email: "david.kim@example.com",
      phone: "+1 (646) 332-9011",
      location: "New York, NY",
      summary: "Customer-centric Product Manager with 4+ years scaling SaaS workflow applications.",
      skills: ["Product Management", "Roadmapping", "Jira", "Mixpanel", "User Research", "Agile"],
      experienceYears: 4,
      experiences: [
        {
          role: "Product Manager",
          company: "WorkflowHub",
          duration: "2022 - Present",
          highlights: ["Increased user activation rate by 22% across enterprise onboardings."],
        },
      ],
      education: [
        {
          degree: "B.A. in Economics",
          institution: "Columbia University",
          year: "2021",
        },
      ],
    },
    appliedAt: "2026-03-05T14:10:00.000Z",
  },
];

let interviewsStore: InterviewSlot[] = [
  {
    id: "int-1",
    candidateId: "cand-1",
    candidateName: "Elena Rostova",
    candidateEmail: "elena.rostova@example.com",
    jobId: "job-1",
    jobTitle: "Senior Full-Stack Engineer (MERN & AI)",
    scheduledAt: "2026-03-03T16:00:00.000Z",
    durationMinutes: 30,
    interviewType: "AI Screening",
    status: "Completed",
    meetingLink: "https://meet.google.com/ais-rec-elena",
    interviewerAgentName: "Alex (AI Talent Screener)",
    notes: "AI Screening Completed with 92% overall candidate score. Fast-track recommendation.",
  },
  {
    id: "int-2",
    candidateId: "cand-2",
    candidateName: "Marcus Vance",
    candidateEmail: "marcus.vance@example.com",
    jobId: "job-1",
    jobTitle: "Senior Full-Stack Engineer (MERN & AI)",
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    durationMinutes: 30,
    interviewType: "AI Screening",
    status: "Scheduled",
    meetingLink: "https://meet.google.com/ais-rec-marcus",
    interviewerAgentName: "Alex (AI Talent Screener)",
    notes: "Candidate confirmed via calendar invite.",
  },
];

// Health Check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Platform Statistics
app.get("/api/stats", (_req, res) => {
  const totalCandidates = candidatesStore.length;
  const activeJobs = jobsStore.filter((j) => j.status === "Active").length;
  const scheduledInterviews = interviewsStore.filter((i) => i.status === "Scheduled").length;
  const completedInterviews = interviewsStore.filter((i) => i.status === "Completed").length;
  const avgAtsScore =
    totalCandidates > 0
      ? Math.round(candidatesStore.reduce((acc, c) => acc + (c.atsScore || 0), 0) / totalCandidates)
      : 0;
  const passedCandidates = candidatesStore.filter((c) => (c.atsScore || 0) >= 80).length;
  const passRatePercent = totalCandidates > 0 ? Math.round((passedCandidates / totalCandidates) * 100) : 0;

  const stats: PlatformStats = {
    totalCandidates,
    activeJobs,
    scheduledInterviews,
    completedInterviews,
    avgAtsScore,
    passRatePercent,
  };
  res.json(stats);
});

// Jobs Endpoints
app.get("/api/jobs", (_req, res) => {
  // Update applicant count dynamically
  const jobsWithCount = jobsStore.map((job) => ({
    ...job,
    applicantCount: candidatesStore.filter((c) => c.jobId === job.id).length,
  }));
  res.json(jobsWithCount);
});

app.get("/api/jobs/:id", (req, res) => {
  const job = jobsStore.find((j) => j.id === req.params.id);
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }
  res.json({
    ...job,
    applicantCount: candidatesStore.filter((c) => c.jobId === job.id).length,
  });
});

app.post("/api/jobs", (req, res) => {
  const {
    title,
    department,
    location,
    type,
    experienceLevel,
    salaryRange,
    description,
    requirements,
    preferredSkills,
    presetQuestions,
  } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: "Title and description are required" });
  }

  const newJob: Job = {
    id: `job-${Date.now()}`,
    title,
    department: department || "General",
    location: location || "Remote",
    type: type || "Full-time",
    experienceLevel: experienceLevel || "Mid-Level",
    salaryRange: salaryRange || "$100,000 - $130,000",
    description,
    requirements: Array.isArray(requirements) ? requirements : requirements ? [requirements] : [],
    preferredSkills: Array.isArray(preferredSkills) ? preferredSkills : preferredSkills ? [preferredSkills] : [],
    presetQuestions: Array.isArray(presetQuestions) && presetQuestions.length > 0
      ? presetQuestions
      : [
          "Describe your most relevant project experience for this role.",
          "How do you approach learning unfamiliar technologies under tight deadlines?",
          "Can you share an example of a technical challenge you resolved?",
        ],
    status: "Active",
    createdAt: new Date().toISOString(),
    applicantCount: 0,
  };

  jobsStore.unshift(newJob);
  res.status(201).json(newJob);
});

// Candidates Endpoints
app.get("/api/candidates", (req, res) => {
  const { jobId, status, minScore } = req.query;
  let filtered = [...candidatesStore];

  if (jobId && typeof jobId === "string") {
    filtered = filtered.filter((c) => c.jobId === jobId);
  }
  if (status && typeof status === "string") {
    filtered = filtered.filter((c) => c.status === status);
  }
  if (minScore && !isNaN(Number(minScore))) {
    filtered = filtered.filter((c) => c.atsScore >= Number(minScore));
  }

  res.json(filtered);
});

app.get("/api/candidates/:id", (req, res) => {
  const candidate = candidatesStore.find((c) => c.id === req.params.id);
  if (!candidate) {
    return res.status(404).json({ error: "Candidate not found" });
  }
  res.json(candidate);
});

app.post("/api/candidates", (req, res) => {
  const { name, email, phone, jobId, atsScore, matchSummary, strengths, missingSkills, parsedResume, resumeFileName } =
    req.body;

  if (!name || !email || !jobId) {
    return res.status(400).json({ error: "Name, email, and target job are required" });
  }

  const targetJob = jobsStore.find((j) => j.id === jobId);
  const newCandidate: Candidate = {
    id: `cand-${Date.now()}`,
    name,
    email,
    phone: phone || "",
    jobId,
    jobTitle: targetJob ? targetJob.title : "Unknown Role",
    status: (atsScore || 0) >= 80 ? "Screened" : "Applied",
    atsScore: Number(atsScore) || 75,
    matchSummary: matchSummary || "Candidate application parsed and queued for review.",
    strengths: Array.isArray(strengths) ? strengths : [],
    missingSkills: Array.isArray(missingSkills) ? missingSkills : [],
    parsedResume: parsedResume || {
      fullName: name,
      email,
      phone: phone || "",
      summary: "Resume uploaded directly.",
      skills: [],
      experienceYears: 2,
      experiences: [],
      education: [],
    },
    resumeFileName: resumeFileName || "resume.pdf",
    appliedAt: new Date().toISOString(),
  };

  candidatesStore.unshift(newCandidate);
  res.status(201).json(newCandidate);
});

app.patch("/api/candidates/:id", (req, res) => {
  const index = candidatesStore.findIndex((c) => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Candidate not found" });
  }

  candidatesStore[index] = {
    ...candidatesStore[index],
    ...req.body,
  };

  res.json(candidatesStore[index]);
});

app.delete("/api/candidates/:id", (req, res) => {
  const index = candidatesStore.findIndex((c) => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Candidate not found" });
  }
  const deleted = candidatesStore.splice(index, 1);
  res.json(deleted[0]);
});

// AI Resume Parsing & Screening ATS Match Engine
app.post("/api/ai/parse-resume", async (req, res) => {
  try {
    const { resumeText, jobId } = req.body;

    if (!resumeText || typeof resumeText !== "string" || resumeText.trim().length < 20) {
      return res.status(400).json({ error: "Please provide valid resume text to parse." });
    }

    const targetJob = jobsStore.find((j) => j.id === jobId) || jobsStore[0];

    const ai = getGeminiClient();

    if (!ai) {
      // Fallback heuristics if API key is not yet set
      const lines = resumeText.split("\n").map((l) => l.trim()).filter(Boolean);
      const nameGuess = lines[0]?.substring(0, 40) || "Alex Applicant";
      const emailMatch = resumeText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      const phoneMatch = resumeText.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);

      const mockSkills = targetJob.preferredSkills.slice(0, 4);
      return res.json({
        fullName: nameGuess,
        email: emailMatch ? emailMatch[0] : "applicant@example.com",
        phone: phoneMatch ? phoneMatch[0] : "+1 (555) 019-2834",
        summary: lines.slice(1, 3).join(" ") || "Experienced technology specialist with cross-functional background.",
        skills: mockSkills,
        experienceYears: 4,
        experiences: [
          {
            role: "Software Developer",
            company: "Tech Systems Co.",
            duration: "2022 - Present",
            highlights: ["Built scalable backend services", "Collaborated with cross-functional teams"],
          },
        ],
        education: [
          {
            degree: "B.S. in Computer Science",
            institution: "State University",
            year: "2022",
          },
        ],
        atsScore: 85,
        matchSummary: `Strong alignment with the ${targetJob.title} position, demonstrating relevant foundational skills and experience.`,
        strengths: ["Relevant technical background", "Clear communication in work history", "Strong core skills"],
        missingSkills: targetJob.preferredSkills.slice(-2),
      });
    }

    const prompt = `
You are an expert ATS (Applicant Tracking System) and Senior Technical Recruiter at a premier technology company.
Your task is to parse the candidate's resume and perform an in-depth screening evaluation against the following Target Job Opening.

TARGET JOB DETAILS:
Title: ${targetJob.title}
Department: ${targetJob.department}
Experience Level: ${targetJob.experienceLevel}
Description: ${targetJob.description}
Key Requirements:
${targetJob.requirements.join("\n")}
Preferred Skills:
${targetJob.preferredSkills.join(", ")}

CANDIDATE RESUME TEXT:
"""
${resumeText}
"""

Instructions:
1. Extract the candidate's fullName, email, phone, location, summary, skills list, years of experience, work experiences (role, company, duration, bullet highlights), and education.
2. Evaluate the match against the Target Job:
   - Calculate an objective 'atsScore' from 0 to 100 (where 90+ is a stellar fit, 75-89 is a solid match, 60-74 is potential with gaps, <60 is not a fit).
   - Provide a concise 'matchSummary' (2-3 sentences analyzing fit for this specific job).
   - Identify 3-5 concrete 'strengths' (proven skills or accomplishments matching requirements).
   - Identify 1-3 'missingSkills' or areas where the candidate needs further verification.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fullName: { type: Type.STRING },
            email: { type: Type.STRING },
            phone: { type: Type.STRING },
            location: { type: Type.STRING },
            summary: { type: Type.STRING },
            skills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            experienceYears: { type: Type.NUMBER },
            experiences: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  role: { type: Type.STRING },
                  company: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  highlights: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ["role", "company", "highlights"],
              },
            },
            education: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  degree: { type: Type.STRING },
                  institution: { type: Type.STRING },
                  year: { type: Type.STRING },
                },
                required: ["degree", "institution"],
              },
            },
            atsScore: { type: Type.INTEGER },
            matchSummary: { type: Type.STRING },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            missingSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            "fullName",
            "email",
            "skills",
            "atsScore",
            "matchSummary",
            "strengths",
            "missingSkills",
          ],
        },
      },
    });

    const parsedJson = JSON.parse(response.text?.trim() || "{}");
    res.json(parsedJson);
  } catch (error: any) {
    console.error("Error parsing resume with Gemini:", error);
    res.status(500).json({
      error: "Failed to parse resume with AI agent.",
      details: error?.message || "Unknown error",
    });
  }
});

// AI Interview Agent: Live Conversational Turn
app.post("/api/ai/interview-turn", async (req, res) => {
  try {
    const {
      jobId,
      candidateName,
      candidateSummary,
      history, // Array of { speaker: 'agent' | 'candidate', message: string }
      currentAnswer,
      currentQuestionIndex,
      totalQuestions = 5,
    } = req.body;

    const targetJob = jobsStore.find((j) => j.id === jobId) || jobsStore[0];
    const ai = getGeminiClient();

    // Fallback if no API key
    if (!ai) {
      const isLast = (currentQuestionIndex || 1) >= totalQuestions;
      const presetQ =
        targetJob.presetQuestions[(currentQuestionIndex || 1) % targetJob.presetQuestions.length] ||
        "Can you share how you collaborate with cross-functional teams?";

      return res.json({
        reaction: "Thank you for explaining that clearly. I appreciate your practical perspective.",
        nextQuestion: isLast
          ? "Thank you so much! That concludes our screening questions for today. Do you have any questions for our hiring team?"
          : presetQ,
        isComplete: isLast,
        critique: "Clear explanation with good contextual delivery.",
      });
    }

    const formattedHistory = Array.isArray(history)
      ? history
          .map((h: any) => `${h.speaker === "agent" ? "Interviewer Alex" : candidateName || "Candidate"}: ${h.message}`)
          .join("\n\n")
      : "";

    const isLastQuestion = Number(currentQuestionIndex) >= Number(totalQuestions);

    const systemPrompt = `
You are "Alex", an intelligent, warm, highly experienced AI Senior Technical Recruiter conducting an interactive screening interview for the role of "${targetJob.title}" at our organization.

JOB CONTEXT:
Title: ${targetJob.title}
Requirements: ${targetJob.requirements.join("; ")}
Preset Suggested Questions for this role:
${targetJob.presetQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

CANDIDATE INFO:
Name: ${candidateName || "Candidate"}
Background summary: ${candidateSummary || "Software applicant"}

CURRENT INTERVIEW STATUS:
Question #${currentQuestionIndex} of ${totalQuestions}.
Is this the final closing response? ${isLastQuestion ? "YES (conclude the interview gracefully)" : "NO (react and proceed to the next question)"}.

CONVERSATION TRANSCRIPT SO FAR:
${formattedHistory}

CANDIDATE'S LATEST ANSWER:
"${currentAnswer || ""}"

YOUR TASK:
1. Provide a brief, natural, conversational reaction (1-2 sentences) acknowledging what the candidate just shared. Be supportive, professional, and authentic (avoid generic robotic clichés).
2. If the interview is NOT complete:
   - Formulate the next question. You can either take inspiration from the preset questions or ask an intelligent follow-up diving deeper into their specific experience or project they mentioned.
3. If the interview IS complete (isLastQuestion = true):
   - Provide a warm, encouraging closing statement summarizing that their interview has been recorded and will be evaluated by the hiring committee, and ask if they have any final remarks.
4. Provide a brief internal critique/score note on their latest answer (e.g., whether they addressed the core question, clarity, depth).
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reaction: {
              type: Type.STRING,
              description: "Conversational reaction to the candidate's last answer.",
            },
            nextQuestion: {
              type: Type.STRING,
              description: "The next interview question, or concluding wrap-up if complete.",
            },
            isComplete: {
              type: Type.BOOLEAN,
              description: "Whether the interview has reached its conclusion.",
            },
            critique: {
              type: Type.STRING,
              description: "Brief evaluation note on technical depth, relevance, or delivery.",
            },
          },
          required: ["reaction", "nextQuestion", "isComplete", "critique"],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Error in interview turn:", error);
    res.status(500).json({
      error: "Interview agent response error",
      details: error?.message,
    });
  }
});

// AI Comprehensive Post-Interview Evaluation & Scorecard
app.post("/api/ai/evaluate-interview", async (req, res) => {
  try {
    const { candidateId, jobId, transcript } = req.body;

    const candidate = candidatesStore.find((c) => c.id === candidateId) || candidatesStore[0];
    const targetJob = jobsStore.find((j) => j.id === jobId) || jobsStore[0];

    const ai = getGeminiClient();

    if (!ai) {
      // Fallback evaluation
      const fallbackEval: InterviewEvaluation = {
        id: `eval-${Date.now()}`,
        candidateId: candidate ? candidate.id : "cand-demo",
        candidateName: candidate ? candidate.name : "Candidate",
        jobId: targetJob.id,
        jobTitle: targetJob.title,
        overallScore: 88,
        recommendation: "Hire",
        categoryScores: {
          technical: 90,
          communication: 88,
          problemSolving: 86,
          culturalFit: 88,
        },
        strengths: [
          "Articulated system design and architectural choices effectively",
          "Demonstrated positive, team-first demeanor during technical questions",
          "Showed structured problem-solving approach",
        ],
        areasForImprovement: [
          "Could provide more quantified business impact metrics for past achievements",
        ],
        summaryNotes: `${candidate ? candidate.name : "The candidate"} conducted a strong screening interview, answering technical questions with competence and composure. Recommended for on-site round.`,
        transcript: Array.isArray(transcript) ? transcript : [],
        evaluatedAt: new Date().toISOString(),
      };

      if (candidate) {
        candidate.status = "Interviewed";
        candidate.evaluation = fallbackEval;
      }

      return res.json(fallbackEval);
    }

    const formattedTranscript = Array.isArray(transcript)
      ? transcript
          .map(
            (t: any) =>
              `[${t.timestamp || "00:00"}] ${t.speaker === "agent" ? "Interviewer Alex" : candidate.name}: ${t.message}`
          )
          .join("\n")
      : "No transcript recorded";

    const evalPrompt = `
You are the Head of Talent Acquisition and Lead Engineering Hiring Director.
Evaluate the following complete AI Screening Interview transcript for candidate "${candidate.name}" applying for "${targetJob.title}".

JOB SPECIFICATIONS:
Title: ${targetJob.title}
Requirements: ${targetJob.requirements.join("; ")}

CANDIDATE INTERVIEW TRANSCRIPT:
${formattedTranscript}

Generate a comprehensive, rigorous hiring scorecard:
1. 'overallScore': 0 - 100 overall assessment grade.
2. 'recommendation': Exactly one of ["Strong Hire", "Hire", "Consider", "Do Not Hire"].
3. 'categoryScores': Individual scores (0 - 100) for:
   - 'technical': Depth of engineering/domain competence.
   - 'communication': Clarity, concise articulation, listening.
   - 'problemSolving': Analytical methodology, handling trade-offs.
   - 'culturalFit': Collaboration mindset, professional maturity.
4. 'strengths': 3-4 bullet points noting standout answers or attributes.
5. 'areasForImprovement': 1-3 constructive areas where the candidate could grow.
6. 'summaryNotes': A 3-sentence executive summary for the hiring manager.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: evalPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER },
            recommendation: {
              type: Type.STRING,
              description: "Must be 'Strong Hire', 'Hire', 'Consider', or 'Do Not Hire'",
            },
            categoryScores: {
              type: Type.OBJECT,
              properties: {
                technical: { type: Type.INTEGER },
                communication: { type: Type.INTEGER },
                problemSolving: { type: Type.INTEGER },
                culturalFit: { type: Type.INTEGER },
              },
              required: ["technical", "communication", "problemSolving", "culturalFit"],
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            areasForImprovement: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            summaryNotes: { type: Type.STRING },
          },
          required: [
            "overallScore",
            "recommendation",
            "categoryScores",
            "strengths",
            "areasForImprovement",
            "summaryNotes",
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");

    const evaluation: InterviewEvaluation = {
      id: `eval-${Date.now()}`,
      candidateId: candidate.id,
      candidateName: candidate.name,
      jobId: targetJob.id,
      jobTitle: targetJob.title,
      overallScore: parsed.overallScore || 85,
      recommendation: parsed.recommendation || "Hire",
      categoryScores: parsed.categoryScores || {
        technical: 85,
        communication: 85,
        problemSolving: 85,
        culturalFit: 85,
      },
      strengths: parsed.strengths || [],
      areasForImprovement: parsed.areasForImprovement || [],
      summaryNotes: parsed.summaryNotes || "Screening completed successfully.",
      transcript: Array.isArray(transcript) ? transcript : [],
      evaluatedAt: new Date().toISOString(),
    };

    // Update candidate in store
    if (candidate) {
      candidate.status = "Interviewed";
      candidate.evaluation = evaluation;
    }

    res.json(evaluation);
  } catch (error: any) {
    console.error("Error evaluating interview:", error);
    res.status(500).json({ error: "Failed to generate evaluation", details: error?.message });
  }
});

// Recruiter AI Tool: Generate Custom Job Questions
app.post("/api/ai/generate-questions", async (req, res) => {
  try {
    const { title, description, requirements } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        questions: [
          `Can you walk me through your relevant background for this ${title || "role"}?`,
          "Describe a challenging technical problem you solved recently and the trade-offs you considered.",
          "How do you ensure maintainability and test coverage when building fast-moving features?",
          "Tell me about a time you resolved a disagreement with a team member regarding system design.",
          "What questions do you have about our technical roadmap and team structure?",
        ],
      });
    }

    const prompt = `
Generate 5 sharp, high-signal interview screening questions for a "${title || "Software Specialist"}" position.
Role Description: ${description || "Building modern cloud and web applications"}
Key Requirements: ${Array.isArray(requirements) ? requirements.join(", ") : requirements || "Full stack engineering"}

Include:
- 1 background & architectural project walkthrough question
- 2 specific technical / scenario deep dives
- 1 behavioral & cross-team collaboration question
- 1 cultural fit / adaptability question

Return a JSON array of 5 concise strings.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["questions"],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{"questions": []}');
    res.json(parsed);
  } catch (error: any) {
    console.error("Error generating questions:", error);
    res.status(500).json({ error: "Failed to generate questions" });
  }
});

// Interviews Endpoints
app.get("/api/interviews", (_req, res) => {
  res.json(interviewsStore);
});

app.post("/api/interviews", (req, res) => {
  const { candidateId, candidateName, candidateEmail, jobId, scheduledAt, durationMinutes, interviewType, notes } =
    req.body;

  if (!candidateName || !scheduledAt) {
    return res.status(400).json({ error: "Candidate name and scheduled time are required" });
  }

  const job = jobsStore.find((j) => j.id === jobId) || jobsStore[0];
  const newInterview: InterviewSlot = {
    id: `int-${Date.now()}`,
    candidateId: candidateId || `cand-${Date.now()}`,
    candidateName,
    candidateEmail: candidateEmail || "candidate@example.com",
    jobId: job.id,
    jobTitle: job.title,
    scheduledAt,
    durationMinutes: Number(durationMinutes) || 30,
    interviewType: interviewType || "AI Screening",
    status: "Scheduled",
    meetingLink: `https://meet.google.com/ais-rec-${Math.random().toString(36).substring(2, 7)}`,
    interviewerAgentName: "Alex (AI Talent Screener)",
    notes: notes || "Interview scheduled through candidate portal.",
  };

  interviewsStore.push(newInterview);

  // Update candidate status if found
  const candidate = candidatesStore.find((c) => c.id === candidateId || c.email === candidateEmail);
  if (candidate) {
    candidate.status = "Interview Scheduled";
    candidate.interviewId = newInterview.id;
  }

  res.status(201).json(newInterview);
});

app.patch("/api/interviews/:id", (req, res) => {
  const index = interviewsStore.findIndex((i) => i.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Interview not found" });
  }

  interviewsStore[index] = {
    ...interviewsStore[index],
    ...req.body,
  };

  res.json(interviewsStore[index]);
});

app.delete("/api/interviews/:id", (req, res) => {
  const index = interviewsStore.findIndex((i) => i.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Interview not found" });
  }
  const deleted = interviewsStore.splice(index, 1);
  res.json(deleted[0]);
});

// Data reset endpoint for easy testing
app.post("/api/reset-data", (_req, res) => {
  res.json({ message: "Store refreshed" });
});

export { app };

// Vite middleware and static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

if (process.env.VERCEL) {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  startServer();
}
