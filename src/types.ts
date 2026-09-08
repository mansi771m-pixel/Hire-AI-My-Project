export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  experienceLevel: 'Entry-Level' | 'Mid-Level' | 'Senior' | 'Lead / Staff';
  salaryRange: string;
  description: string;
  requirements: string[];
  preferredSkills: string[];
  presetQuestions: string[];
  status: 'Active' | 'Draft' | 'Closed';
  createdAt: string;
  applicantCount?: number;
}

export interface CandidateExperience {
  role: string;
  company: string;
  duration: string;
  highlights: string[];
}

export interface CandidateEducation {
  degree: string;
  institution: string;
  year: string;
}

export interface ParsedResume {
  fullName: string;
  email: string;
  phone: string;
  location?: string;
  summary: string;
  skills: string[];
  experienceYears: number;
  experiences: CandidateExperience[];
  education: CandidateEducation[];
  certifications?: string[];
  rawText?: string;
}

export interface InterviewEvaluation {
  id: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  overallScore: number; // 0-100
  recommendation: 'Strong Hire' | 'Hire' | 'Consider' | 'Do Not Hire';
  categoryScores: {
    technical: number;
    communication: number;
    problemSolving: number;
    culturalFit: number;
  };
  strengths: string[];
  areasForImprovement: string[];
  summaryNotes: string;
  transcript: {
    speaker: 'agent' | 'candidate';
    message: string;
    timestamp: string;
    critique?: string;
  }[];
  evaluatedAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  jobId: string;
  jobTitle: string;
  status: 'Applied' | 'Screened' | 'Interview Scheduled' | 'Interviewed' | 'Offered' | 'Rejected';
  atsScore: number; // 0 - 100
  matchSummary: string;
  strengths: string[];
  missingSkills: string[];
  parsedResume: ParsedResume;
  resumeFileName?: string;
  appliedAt: string;
  interviewId?: string;
  evaluation?: InterviewEvaluation;
}

export interface InterviewSlot {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  jobId: string;
  jobTitle: string;
  scheduledAt: string; // ISO string
  durationMinutes: number;
  interviewType: 'AI Screening' | 'Technical Round' | 'Hiring Manager' | 'Culture Fit';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  meetingLink: string;
  interviewerAgentName: string;
  notes?: string;
}

export interface PlatformStats {
  totalCandidates: number;
  activeJobs: number;
  scheduledInterviews: number;
  completedInterviews: number;
  avgAtsScore: number;
  passRatePercent: number;
}
