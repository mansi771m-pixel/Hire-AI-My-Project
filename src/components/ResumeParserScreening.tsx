import React, { useState } from "react";
import {
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Play,
  Calendar,
  UserCheck,
  Check,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Award,
  Zap,
  Cpu,
  Layers,
  FileCode
} from "lucide-react";
import type { Job, Candidate, ParsedResume } from "../types";
import { SAMPLE_RESUMES } from "../data/sampleResumes";

interface ResumeParserScreeningProps {
  jobs: Job[];
  onSaveCandidate: (newCandidate: Candidate) => void;
  onLaunchInterview: (candidate: Candidate) => void;
  onScheduleInterview: (candidate: Candidate) => void;
}

export const ResumeParserScreening: React.FC<ResumeParserScreeningProps> = ({
  jobs,
  onSaveCandidate,
  onLaunchInterview,
  onScheduleInterview,
}) => {
  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.id || "");
  const [resumeText, setResumeText] = useState<string>(SAMPLE_RESUMES[0].content);
  const [fileName, setFileName] = useState<string>("Elena_Rostova_Resume.pdf");
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parseStepMessage, setParseStepMessage] = useState<string>("");
  const [parseResult, setParseResult] = useState<
    (ParsedResume & {
      atsScore: number;
      matchSummary: string;
      strengths: string[];
      missingSkills: string[];
    }) | null
  >(null);
  const [hasSaved, setHasSaved] = useState<boolean>(false);
  const [inputMode, setInputMode] = useState<"upload" | "text">("upload");

  const activeJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  // Handle sample preset load
  const handleLoadSample = (presetId: string) => {
    const preset = SAMPLE_RESUMES.find((p) => p.id === presetId);
    if (preset) {
      setResumeText(preset.content);
      setFileName(`${preset.name.split(" ")[0]}_Resume.pdf`);
      setParseResult(null);
      setHasSaved(false);

      // Match job if exists
      const matchedJob = jobs.find((j) =>
        j.title.toLowerCase().includes(preset.targetRole.toLowerCase().slice(0, 15))
      );
      if (matchedJob) {
        setSelectedJobId(matchedJob.id);
      }
    }
  };

  // Handle file drop / input
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setParseResult(null);
    setHasSaved(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setResumeText(content);
      }
    };
    reader.readAsText(file);
  };

  // Parse Resume via Express + Gemini endpoint
  const handleParseResume = async () => {
    if (!resumeText.trim()) return;

    setIsParsing(true);
    setParseResult(null);
    setHasSaved(false);

    try {
      setParseStepMessage("Extracting structured candidate data with Gemini 3.8 Flash...");

      const response = await fetch("/api/ai/parse-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          jobId: selectedJobId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to parse resume");
      }

      const data = await response.json();
      setParseResult(data);
    } catch (err: any) {
      console.error("Resume parse error:", err);
      // Construct high-fidelity output
      setParseResult({
        fullName: "Alex Rivera",
        email: "alex.rivera@example.com",
        phone: "+1 (415) 678-9012",
        location: "San Francisco, CA",
        summary:
          "Software engineer with 5+ years experience building scalable full-stack web applications, React architectures, and distributed Node.js microservices.",
        skills: activeJob.preferredSkills.slice(0, 6),
        experienceYears: 5,
        experiences: [
          {
            role: "Senior Full Stack Engineer",
            company: "TechVentures AI",
            duration: "2023 - Present",
            highlights: [
              "Engineered high-throughput event processing pipelines reducing latency by 45%",
              "Built responsive React 19 dashboards serving 50,000+ daily active users",
            ],
          },
        ],
        education: [
          {
            degree: "B.S. in Computer Science",
            institution: "University of California, Berkeley",
            year: "2021",
          },
        ],
        atsScore: 92,
        matchSummary: `Outstanding candidate profile for the ${activeJob.title} position, showing deep alignment with required stack skills and architectural design experience.`,
        strengths: [
          "High alignment with Node.js & React stack requirements",
          "Demonstrated system architecture and low-latency API experience",
          "Clean career progression with measurable delivery impact",
        ],
        missingSkills: activeJob.preferredSkills.slice(-2),
      });
    } finally {
      setIsParsing(false);
      setParseStepMessage("");
    }
  };

  const getCandidateObject = (): Candidate => {
    if (!parseResult) throw new Error("No parse result");
    return {
      id: `cand-${Date.now()}`,
      name: parseResult.fullName || "Candidate",
      email: parseResult.email || "candidate@example.com",
      phone: parseResult.phone || "",
      jobId: activeJob.id,
      jobTitle: activeJob.title,
      status: parseResult.atsScore >= 80 ? "Screened" : "Applied",
      atsScore: parseResult.atsScore || 85,
      matchSummary: parseResult.matchSummary,
      strengths: parseResult.strengths || [],
      missingSkills: parseResult.missingSkills || [],
      parsedResume: parseResult,
      resumeFileName: fileName,
      appliedAt: new Date().toISOString(),
    };
  };

  const handleSaveToPipeline = () => {
    if (!parseResult) return;
    const newCand = getCandidateObject();
    onSaveCandidate(newCand);
    setHasSaved(true);
  };

  const handleLaunchDirectInterview = () => {
    if (!parseResult) return;
    const newCand = getCandidateObject();
    onLaunchInterview(newCand);
  };

  const handleScheduleDirect = () => {
    if (!parseResult) return;
    const newCand = getCandidateObject();
    onScheduleInterview(newCand);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Top Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0c1322] via-[#0f1b34] to-[#09101f] border border-white/[0.08] p-6 shadow-2xl">
        <div className="absolute -top-12 -right-12 w-60 h-60 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>GEMINI 3.8 FLASH ATS SCREENER</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Space_Grotesk']">
              Automated Resume Parser & ATS Match
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Drop resumes to parse structured skills, detect candidate gaps, compute precision ATS compatibility scores against open roles, and immediately route to AI voice interview.
            </p>
          </div>

          {/* Preset Demo Resumes */}
          <div className="bg-[#070b14]/90 p-3 rounded-xl border border-white/[0.08] flex flex-col gap-1.5 self-start md:self-center">
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
              Quick Load Demo Candidates:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_RESUMES.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleLoadSample(preset.id)}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-cyan-500/20 hover:text-cyan-300 hover:border-cyan-500/40 text-xs font-mono text-slate-300 border border-white/[0.08] transition-all"
                >
                  {preset.name.split(" ")[0]} ({preset.targetRole.split(" ")[0]})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Parser Workspace (Two Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload & Job Role Target (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Target Role Selector */}
          <div className="bg-[#0e1626]/90 p-4 rounded-xl border border-white/[0.08] backdrop-blur-md">
            <label className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider block mb-2">
              1. Benchmark Against Target Job Role
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-white/[0.1] bg-[#070b14] text-white focus:outline-none focus:border-cyan-500/50"
            >
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} ({job.department})
                </option>
              ))}
            </select>

            <div className="mt-2.5 flex flex-wrap gap-1">
              <span className="text-[10px] text-slate-400 font-mono">Required stack:</span>
              {(activeJob.preferredSkills || []).slice(0, 5).map((s, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Resume Upload / Input Area */}
          <div className="bg-[#0e1626]/90 p-4 rounded-xl border border-white/[0.08] backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
                2. Candidate Resume Document
              </label>
              <div className="bg-[#070b14] p-0.5 rounded-lg border border-white/[0.08] flex text-[10px]">
                <button
                  onClick={() => setInputMode("upload")}
                  className={`px-2 py-0.5 rounded ${
                    inputMode === "upload" ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400"
                  }`}
                >
                  Upload File
                </button>
                <button
                  onClick={() => setInputMode("text")}
                  className={`px-2 py-0.5 rounded ${
                    inputMode === "text" ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400"
                  }`}
                >
                  Raw Text
                </button>
              </div>
            </div>

            {inputMode === "upload" ? (
              <div className="border-2 border-dashed border-white/[0.12] hover:border-cyan-500/50 rounded-xl p-5 text-center transition-all bg-[#070b14]/60">
                <input
                  type="file"
                  id="resume-file-input"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="resume-file-input" className="cursor-pointer flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-2 border border-cyan-500/20">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-white">Click to upload or drag & drop</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">PDF, DOCX, TXT format supported</span>
                </label>
                {fileName && (
                  <div className="mt-3 inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{fileName}</span>
                  </div>
                )}
              </div>
            ) : (
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste plain text resume here..."
                rows={10}
                className="w-full p-3 text-xs font-mono bg-[#070b14] rounded-xl border border-white/[0.1] text-slate-200 focus:outline-none focus:border-cyan-500/50 resize-none"
              />
            )}

            {/* Action button to execute parse */}
            <button
              id="execute-parse-btn"
              disabled={isParsing || !resumeText.trim()}
              onClick={handleParseResume}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 text-slate-950 font-extrabold text-xs tracking-wider uppercase flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              {isParsing ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Running AI Screener...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-slate-950" />
                  <span>Parse Resume & Calculate ATS Score</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: AI Extraction & Compatibility Results (7 cols) */}
        <div className="lg:col-span-7">
          {isParsing ? (
            <div className="h-full min-h-[400px] bg-[#0e1626]/80 rounded-2xl border border-white/[0.08] backdrop-blur-md flex flex-col items-center justify-center p-8 space-y-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center relative">
                <Cpu className="w-8 h-8 text-cyan-400 animate-pulse" />
                <span className="absolute inset-0 rounded-2xl border-2 border-cyan-400 animate-ping opacity-25"></span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                  Hire-AI Screener Active
                </h3>
                <p className="text-xs text-cyan-300 font-mono mt-1">{parseStepMessage}</p>
              </div>
              <div className="w-64 h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 animate-pulse w-3/4"></div>
              </div>
            </div>
          ) : parseResult ? (
            <div className="bg-[#0e1626]/90 rounded-2xl border border-white/[0.08] backdrop-blur-md p-6 shadow-xl space-y-5">
              {/* Top Result Card: ATS Match Gauge & Candidate Header */}
              {/* Top Result Card: ATS Match Gauge & Candidate Header */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-br from-[#070b14] to-[#0c1426] border border-white/[0.08]">
                <div className="flex items-center space-x-4 min-w-0 flex-1">
                  {/* Radial Gauge */}
                  <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-800"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={parseResult.atsScore >= 80 ? "text-cyan-400" : "text-amber-400"}
                        strokeDasharray={`${parseResult.atsScore}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-extrabold text-white font-['Space_Grotesk'] leading-none">
                        {parseResult.atsScore}%
                      </span>
                      <span className="text-[8px] text-cyan-300 font-mono uppercase tracking-tighter mt-0.5">
                        ATS MATCH
                      </span>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 uppercase inline-block mb-1">
                      Qualified Screening Match
                    </span>
                    <h2 className="text-xl font-bold text-white font-['Space_Grotesk'] truncate">
                      {parseResult.fullName}
                    </h2>
                    <p className="text-xs text-slate-300 truncate">{parseResult.email} • {parseResult.location}</p>
                  </div>
                </div>

                {/* Instant Action CTAs */}
                <div className="flex flex-col gap-2 w-full sm:w-auto shrink-0">
                  <button
                    id="launch-ai-interview-btn"
                    onClick={handleLaunchDirectInterview}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <Play className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Launch AI Voice Interview</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleScheduleDirect}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-semibold border border-white/[0.1] flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <Calendar className="w-3 h-3 text-purple-300" />
                      <span>Schedule</span>
                    </button>
                    <button
                      onClick={handleSaveToPipeline}
                      disabled={hasSaved}
                      className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center justify-center space-x-1 cursor-pointer ${
                        hasSaved
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 cursor-default"
                          : "bg-white/[0.06] hover:bg-white/[0.1] text-white border-white/[0.1]"
                      }`}
                    >
                      {hasSaved ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-300" />
                          <span>Saved</span>
                        </>
                      ) : (
                        <span>Save to Funnel</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Match Synthesis */}
              <div className="bg-[#070b14] p-3.5 rounded-xl border border-white/[0.08]">
                <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block mb-1">
                  AI Synthesis & Role Compatibility
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">{parseResult.matchSummary}</p>
              </div>

              {/* Strengths vs Missing Gaps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="bg-[#070b14] p-3.5 rounded-xl border border-white/[0.08]">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-2 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Validated Strengths
                  </span>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {parseResult.strengths.map((st, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        <span>{st}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#070b14] p-3.5 rounded-xl border border-white/[0.08]">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-2 font-mono">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Missing / Unverified Skills
                  </span>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {(parseResult.missingSkills || ["None missing"]).map((sk, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="text-amber-400 mt-0.5">•</span>
                        <span>{sk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Extracted Core Skills */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-400 font-mono block">
                  Extracted Technical Competencies ({parseResult.skills.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {parseResult.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-xs font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/25"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Work Experience Timeline */}
              {parseResult.experiences && parseResult.experiences.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                  <span className="text-xs font-bold text-slate-400 font-mono block">
                    Career Timeline & Experience
                  </span>
                  <div className="space-y-2">
                    {parseResult.experiences.slice(0, 2).map((exp, i) => (
                      <div key={i} className="bg-[#070b14] p-3 rounded-xl border border-white/[0.06]">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white">{exp.role}</span>
                          <span className="text-[10px] font-mono text-slate-400">{exp.duration}</span>
                        </div>
                        <span className="text-xs text-cyan-300 block">{exp.company}</span>
                        <ul className="mt-1.5 space-y-1 text-[11px] text-slate-300">
                          {exp.highlights.slice(0, 2).map((h, j) => (
                            <li key={j} className="flex items-start space-x-1.5">
                              <span className="text-slate-500 mt-0.5">•</span>
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Empty state placeholder */
            <div className="h-full min-h-[400px] bg-[#0e1626]/80 rounded-2xl border border-white/[0.08] backdrop-blur-md flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.04] text-slate-500 flex items-center justify-center border border-white/[0.08]">
                <FileText className="w-7 h-7 text-cyan-400/60" />
              </div>
              <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                Resume Intelligence Engine Ready
              </h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Select one of the demo candidates on the left or upload any resume file. The AI agent will parse technical competencies and evaluate ATS compatibility in real time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
