import React from "react";
import {
  Bot,
  FileText,
  Calendar,
  Users,
  Briefcase,
  Zap,
  Radio,
  Sparkles,
} from "lucide-react";

export type TabType = "pipeline" | "parser" | "interview" | "scheduler" | "jobs";

interface NavbarProps {
  currentTab?: string;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  setActiveTab?: (tab: TabType) => void;
  userRole?: "recruiter" | "candidate";
  setUserRole?: (role: "recruiter" | "candidate") => void;
  candidateCount?: number;
  scheduledCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  activeTab,
  onSelectTab,
  setActiveTab,
  userRole = "recruiter",
  setUserRole,
  candidateCount = 0,
  scheduledCount = 0,
}) => {
  const current = (activeTab || currentTab || "pipeline") as TabType;

  const handleTabClick = (tab: TabType) => {
    if (setActiveTab) setActiveTab(tab);
    if (onSelectTab) onSelectTab(tab);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#080d1a]/95 backdrop-blur-xl border-b border-white/[0.08] shadow-2xl">
      {/* Top micro-bar for platform status */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-[#070b14]/80 to-indigo-950/40 border-b border-white/[0.04] px-4 py-1 text-[11px] font-mono text-slate-400">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5 truncate">
            <span className="flex items-center text-cyan-400 gap-1.5 font-medium shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
              </span>
              HIRE-AI AGENT ACTIVE
            </span>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <span className="text-slate-400 hidden sm:inline truncate">
              Autonomous Resume Screening • Voice AI Interviewer • Smart Scheduling
            </span>
          </div>
          <div className="flex items-center space-x-2.5 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/[0.05] text-slate-300 text-[10px] font-mono border border-white/[0.06]">
              <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
              Gemini 3.8 Flash Online
            </span>
            <span className="text-slate-500 text-[10px] hidden md:inline font-mono">MERN Stack</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[64px] py-2 gap-3 sm:gap-6">
          {/* Brand Logo with Glowing AI Core */}
          <div
            id="brand-logo"
            className="flex items-center space-x-3 cursor-pointer group shrink-0"
            onClick={() => handleTabClick("pipeline")}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-purple-600 p-[1px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300">
                <div className="w-full h-full bg-[#080d1a] rounded-[11px] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400 border-2 border-[#080d1a]"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white font-['Space_Grotesk']">
                  Hire<span className="text-cyan-400">-AI</span>
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400 tracking-tight hidden sm:block">
                AI Interview & Recruitment Platform
              </p>
            </div>
          </div>

          {/* Navigation Links with Futuristic Active Indicators */}
          <nav className="hidden md:flex items-center space-x-1 bg-[#0d1424] p-1 rounded-xl border border-white/[0.08]">
            <button
              id="nav-tab-pipeline"
              onClick={() => handleTabClick("pipeline")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                current === "pipeline"
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Users className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Candidates</span>
              {candidateCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {candidateCount}
                </span>
              )}
            </button>

            <button
              id="nav-tab-parser"
              onClick={() => handleTabClick("parser")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                current === "parser"
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Resume Screener</span>
              <span className="hidden xl:inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                ATS AI
              </span>
            </button>

            <button
              id="nav-tab-interview"
              onClick={() => handleTabClick("interview")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                current === "interview"
                  ? "bg-gradient-to-r from-cyan-500/30 to-indigo-500/30 text-white border border-cyan-400/50 shadow-md shadow-cyan-500/20 animate-pulse-glow"
                  : "text-slate-300 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
              <span>AI Interview Room</span>
              <span className="relative flex h-1.5 w-1.5 ml-0.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400"></span>
              </span>
            </button>

            <button
              id="nav-tab-scheduler"
              onClick={() => handleTabClick("scheduler")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                current === "scheduler"
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>Scheduler</span>
              {scheduledCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {scheduledCount}
                </span>
              )}
            </button>

            <button
              id="nav-tab-jobs"
              onClick={() => handleTabClick("jobs")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                current === "jobs"
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Job Openings</span>
            </button>
          </nav>

          {/* Right Controls: Role Switcher */}
          <div className="flex items-center space-x-2 shrink-0">
            {setUserRole && (
              <div className="bg-[#0c1424] p-1 rounded-xl flex items-center border border-white/[0.08] shadow-inner">
                <button
                  id="role-toggle-recruiter"
                  onClick={() => setUserRole("recruiter")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    userRole === "recruiter"
                      ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Recruiter
                </button>
                <button
                  id="role-toggle-candidate"
                  onClick={() => setUserRole("candidate")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    userRole === "candidate"
                      ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Candidate View
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Navigation Bar - Prevents any overlapping with main screen */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#080d1a]/95 backdrop-blur-2xl border-t border-white/[0.1] px-1.5 py-2 shadow-2xl flex items-center justify-around">
        {setUserRole && (
          <button
            id="mobile-role-toggle"
            aria-label={`Switch to ${userRole === "recruiter" ? "candidate" : "recruiter"} view`}
            onClick={() => setUserRole(userRole === "recruiter" ? "candidate" : "recruiter")}
            className="flex flex-col items-center space-y-1 py-1 px-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-orange-300" />
            <span className="text-[9px] font-mono">{userRole === "recruiter" ? "Candidate" : "Recruiter"}</span>
          </button>
        )}
        <button
          onClick={() => handleTabClick("pipeline")}
          className={`flex flex-col items-center space-y-1 py-1 px-2.5 rounded-lg transition-colors ${
            current === "pipeline" ? "text-cyan-400 font-bold bg-cyan-500/10" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="text-[10px] font-mono">Pipeline</span>
        </button>
        <button
          onClick={() => handleTabClick("parser")}
          className={`flex flex-col items-center space-y-1 py-1 px-2.5 rounded-lg transition-colors ${
            current === "parser" ? "text-cyan-400 font-bold bg-cyan-500/10" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span className="text-[10px] font-mono">Resume</span>
        </button>
        <button
          onClick={() => handleTabClick("interview")}
          className={`flex flex-col items-center space-y-1 py-1 px-2.5 rounded-lg transition-colors ${
            current === "interview" ? "text-cyan-300 font-bold bg-cyan-500/20 border border-cyan-500/30" : "text-slate-300 hover:text-white"
          }`}
        >
          <Bot className="w-4 h-4 text-cyan-400" />
          <span className="text-[10px] font-mono">AI Room</span>
        </button>
        <button
          onClick={() => handleTabClick("scheduler")}
          className={`flex flex-col items-center space-y-1 py-1 px-2.5 rounded-lg transition-colors ${
            current === "scheduler" ? "text-cyan-400 font-bold bg-cyan-500/10" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span className="text-[10px] font-mono">Calendar</span>
        </button>
        <button
          onClick={() => handleTabClick("jobs")}
          className={`flex flex-col items-center space-y-1 py-1 px-2.5 rounded-lg transition-colors ${
            current === "jobs" ? "text-cyan-400 font-bold bg-cyan-500/10" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span className="text-[10px] font-mono">Jobs</span>
        </button>
      </div>
    </header>
  );
};
