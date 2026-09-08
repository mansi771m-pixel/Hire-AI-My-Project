import React, { useState } from "react";
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Briefcase,
  Play,
  Calendar,
  Sparkles,
  TrendingUp,
  FileText,
  ChevronRight,
  ChevronLeft,
  X,
  Layers,
  Award,
  Zap,
  Trash2,
  List,
  LayoutGrid,
} from "lucide-react";
import type { Candidate, Job, PlatformStats, InterviewEvaluation } from "../types";

interface RecruiterDashboardProps {
  candidates: Candidate[];
  jobs: Job[];
  stats: PlatformStats | null;
  onSelectCandidateForInterview: (candidate: Candidate) => void;
  onOpenSchedulerForCandidate: (candidate: Candidate) => void;
  onOpenParser: () => void;
  onOpenEvaluation: (evalData: InterviewEvaluation) => void;
  onUpdateCandidateStatus: (candidateId: string, status: Candidate["status"]) => void;
  onDeleteCandidate: (candidateId: string) => void;
}

const PIPELINE_STAGES: Candidate["status"][] = [
  "Applied",
  "Screened",
  "Interview Scheduled",
  "Interviewed",
  "Offered",
];

export const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({
  candidates,
  jobs,
  stats,
  onSelectCandidateForInterview,
  onOpenSchedulerForCandidate,
  onOpenParser,
  onOpenEvaluation,
  onUpdateCandidateStatus,
  onDeleteCandidate,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJobFilter, setSelectedJobFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [activeCandidateModal, setActiveCandidateModal] = useState<Candidate | null>(null);

  // Filter candidates
  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.parsedResume?.skills || []).some((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesJob = selectedJobFilter === "all" || c.jobId === selectedJobFilter;
    const matchesStatus = selectedStatusFilter === "all" || c.status === selectedStatusFilter;

    return matchesSearch && matchesJob && matchesStatus;
  });

  const getStatusBadge = (status: Candidate["status"]) => {
    switch (status) {
      case "Applied":
        return "bg-slate-800 text-slate-300 border-slate-700";
      case "Screened":
        return "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";
      case "Interview Scheduled":
        return "bg-purple-500/15 text-purple-300 border-purple-500/30";
      case "Interviewed":
        return "bg-indigo-500/15 text-indigo-300 border-indigo-500/30";
      case "Offered":
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
      case "Rejected":
        return "bg-rose-500/15 text-rose-300 border-rose-500/30";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    if (score >= 75) return "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
    if (score >= 60) return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    return "text-rose-400 bg-rose-500/10 border-rose-500/30";
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Top Banner with HUD Aesthetic */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0c1426] via-[#101d3b] to-[#0a1122] border border-white/[0.08] p-6 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold mb-2">
              <Zap className="w-3.5 h-3.5" />
              <span>AUTONOMOUS TALENT PIPELINE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Space_Grotesk']">
              Hire-AI Recruiter Command Center
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Real-time pipeline monitoring, automated resume match verification, live AI voice interview screenings, and instant evaluation scorecards.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="header-open-parser-btn"
              onClick={onOpenParser}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>Parse & Screen Resume</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats HUD Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-[#0e1626]/90 p-4 rounded-xl border border-white/[0.07] backdrop-blur-md relative overflow-hidden group hover:border-cyan-500/30 transition-all min-w-0">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider truncate">Total Pipeline</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white font-['Space_Grotesk']">
              {stats?.totalCandidates ?? candidates.length}
            </span>
            <span className="text-[11px] text-cyan-400 font-medium">Candidates</span>
          </div>
        </div>

        <div className="bg-[#0e1626]/90 p-4 rounded-xl border border-white/[0.07] backdrop-blur-md relative overflow-hidden group hover:border-indigo-500/30 transition-all min-w-0">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider truncate">Active Jobs</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white font-['Space_Grotesk']">
              {stats?.activeJobs ?? jobs.length}
            </span>
            <span className="text-[11px] text-indigo-400 font-medium">Openings</span>
          </div>
        </div>

        <div className="bg-[#0e1626]/90 p-4 rounded-xl border border-white/[0.07] backdrop-blur-md relative overflow-hidden group hover:border-purple-500/30 transition-all min-w-0">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider truncate">AI Screened</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white font-['Space_Grotesk']">
              {candidates.filter((c) => c.status === "Interviewed" || c.status === "Offered").length}
            </span>
            <span className="text-[11px] text-purple-400 font-medium">Completed</span>
          </div>
        </div>

        <div className="bg-[#0e1626]/90 p-4 rounded-xl border border-white/[0.07] backdrop-blur-md relative overflow-hidden group hover:border-emerald-500/30 transition-all min-w-0">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider truncate">Avg ATS Score</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white font-['Space_Grotesk']">
              {stats?.avgAtsScore ?? 87}%
            </span>
            <span className="text-[11px] text-emerald-400 font-medium">AI Match</span>
          </div>
        </div>

        <div className="bg-[#0e1626]/90 p-4 rounded-xl border border-white/[0.07] backdrop-blur-md relative overflow-hidden group hover:border-amber-500/30 transition-all col-span-2 sm:col-span-1 min-w-0">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider truncate">Pass Benchmark</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white font-['Space_Grotesk']">
              {stats?.passRatePercent ?? 75}%
            </span>
            <span className="text-[11px] text-amber-400 font-medium">Qualified</span>
          </div>
        </div>
      </div>

      {/* Filter & View Toolbar */}
      <div className="bg-[#0e1626]/90 p-3.5 rounded-xl border border-white/[0.07] backdrop-blur-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            id="candidate-search-input"
            type="text"
            placeholder="Search candidate, skill, role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-white/[0.08] bg-[#070b14] text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all font-mono"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 justify-between md:justify-end">
          {/* Job Filter */}
          <select
            id="job-filter-select"
            value={selectedJobFilter}
            onChange={(e) => setSelectedJobFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-white/[0.08] bg-[#070b14] text-slate-200 focus:outline-none focus:border-cyan-500/50"
          >
            <option value="all">All Job Openings</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            id="status-filter-select"
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-white/[0.08] bg-[#070b14] text-slate-200 focus:outline-none focus:border-cyan-500/50"
          >
            <option value="all">All Stages</option>
            <option value="Applied">Applied</option>
            <option value="Screened">Screened (ATS)</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Interviewed">Interviewed</option>
            <option value="Offered">Offered</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* View Toggle: Kanban vs Table */}
          <div className="bg-[#070b14] p-0.5 rounded-lg border border-white/[0.08] flex items-center shrink-0">
            <button
              onClick={() => setViewMode("kanban")}
              title="Kanban Board View"
              className={`p-1.5 rounded-md text-xs transition-all cursor-pointer ${
                viewMode === "kanban"
                  ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              title="Table View"
              className={`p-1.5 rounded-md text-xs transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Pipeline Content */}
      {filteredCandidates.length === 0 ? (
        <div className="p-12 text-center bg-[#0e1626]/80 rounded-2xl border border-white/[0.08] backdrop-blur-md">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.05] text-cyan-400 flex items-center justify-center mx-auto mb-3 border border-white/[0.08]">
            <Users className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-white">No candidates match current criteria</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try resetting your search query or upload a new candidate resume to run the ATS screening agent.
          </p>
          <button
            onClick={onOpenParser}
            className="mt-4 inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Screen Resume with AI</span>
          </button>
        </div>
      ) : viewMode === "kanban" ? (
        /* KANBAN BOARD VIEW - Clean, Scrollable on narrow screens, perfectly spaced */
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar lg:grid lg:grid-cols-5">
          {PIPELINE_STAGES.map((stage) => {
            const stageCandidates = filteredCandidates.filter((c) => c.status === stage);
            return (
              <div
                key={stage}
                className="w-[280px] lg:w-auto shrink-0 bg-[#0e1626]/70 rounded-xl border border-white/[0.06] flex flex-col p-3 backdrop-blur-md min-h-[480px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
                  <div className="flex items-center space-x-2 truncate">
                    <span className="text-xs font-bold text-slate-200 font-['Space_Grotesk'] tracking-wide truncate">
                      {stage}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/[0.06] text-slate-400 shrink-0">
                    {stageCandidates.length}
                  </span>
                </div>

                {/* Candidate Cards */}
                <div className="space-y-2.5 flex-1 overflow-y-auto pr-0.5">
                  {stageCandidates.length === 0 ? (
                    <div className="h-28 flex items-center justify-center border border-dashed border-white/[0.06] rounded-xl text-[11px] text-slate-500">
                      Empty stage
                    </div>
                  ) : (
                    stageCandidates.map((cand) => (
                      <div
                        key={cand.id}
                        className="bg-[#070b14]/90 rounded-xl p-3.5 border border-white/[0.08] hover:border-cyan-500/40 transition-all duration-200 shadow-md group relative"
                      >
                        {/* Top candidate info */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <button
                              onClick={() => setActiveCandidateModal(cand)}
                              className="text-xs font-bold text-white hover:text-cyan-300 transition-colors text-left block truncate w-full cursor-pointer"
                            >
                              {cand.name}
                            </button>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">{cand.jobTitle}</p>
                          </div>
                          {/* ATS Score Radial Badge */}
                          <div
                            className={`px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold shrink-0 ${getScoreColor(
                              cand.atsScore
                            )}`}
                          >
                            {cand.atsScore}%
                          </div>
                        </div>

                        {/* Key Skills Preview */}
                        <div className="mt-2 flex flex-wrap gap-1">
                          {(cand.parsedResume?.skills || []).slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-white/[0.04] text-slate-300 border border-white/[0.06] truncate max-w-[110px]"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                        {/* Action buttons - Cleanly spaced to prevent overlap */}
                        <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between gap-1.5 text-[11px]">
                          <button
                            onClick={() => onSelectCandidateForInterview(cand)}
                            title="Start AI Voice Interview"
                            className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold px-2 py-1 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 transition-all shrink-0 cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Interview</span>
                          </button>

                          {cand.evaluation ? (
                            <button
                              onClick={() => onOpenEvaluation(cand.evaluation!)}
                              className="inline-flex items-center gap-1 text-purple-300 hover:text-purple-200 font-medium px-2 py-1 rounded-md bg-purple-500/10 hover:bg-purple-500/20 transition-all shrink-0 cursor-pointer"
                            >
                              <Award className="w-3 h-3" />
                              <span>Scorecard</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => onOpenSchedulerForCandidate(cand)}
                              className="inline-flex items-center gap-1 text-slate-400 hover:text-white px-2 py-1 rounded-md hover:bg-white/[0.05] transition-all shrink-0 cursor-pointer"
                            >
                              <Calendar className="w-3 h-3" />
                              <span>Schedule</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* HIGH-DENSITY TABLE VIEW - Wrapped in horizontal scroll container to prevent overlap */
        <div className="bg-[#0e1626]/90 rounded-2xl border border-white/[0.08] backdrop-blur-md overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-xs">
              <thead className="bg-[#070b14]/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-white/[0.06]">
                <tr>
                  <th className="px-5 py-3">Candidate</th>
                  <th className="px-5 py-3">Target Role</th>
                  <th className="px-5 py-3">ATS Match</th>
                  <th className="px-5 py-3">Stage Status</th>
                  <th className="px-5 py-3">Core Skills</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredCandidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 text-cyan-300 font-bold flex items-center justify-center text-xs shrink-0">
                          {candidate.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <button
                            onClick={() => setActiveCandidateModal(candidate)}
                            className="font-bold text-white hover:text-cyan-300 transition-colors text-left block truncate cursor-pointer"
                          >
                            {candidate.name}
                          </button>
                          <div className="text-[11px] text-slate-400 truncate">{candidate.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-200 truncate">{candidate.jobTitle}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {new Date(candidate.appliedAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${getScoreColor(
                          candidate.atsScore
                        )}`}
                      >
                        {candidate.atsScore}%
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <select
                        value={candidate.status}
                        onChange={(e) =>
                          onUpdateCandidateStatus(candidate.id, e.target.value as Candidate["status"])
                        }
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer bg-[#070b14] ${getStatusBadge(
                          candidate.status
                        )}`}
                      >
                        <option value="Applied">Applied</option>
                        <option value="Screened">Screened (ATS)</option>
                        <option value="Interview Scheduled">Interview Scheduled</option>
                        <option value="Interviewed">Interviewed</option>
                        <option value="Offered">Offered</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(candidate.parsedResume?.skills || []).slice(0, 3).map((s, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-white/[0.04] text-slate-300 border border-white/[0.06] truncate max-w-[90px]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onSelectCandidateForInterview(candidate)}
                          className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 text-[11px] font-bold flex items-center space-x-1 cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-cyan-300" />
                          <span>AI Room</span>
                        </button>

                        {candidate.evaluation && (
                          <button
                            onClick={() => onOpenEvaluation(candidate.evaluation!)}
                            className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 text-[11px] font-bold flex items-center space-x-1 cursor-pointer"
                          >
                            <Award className="w-3 h-3" />
                            <span>Scorecard</span>
                          </button>
                        )}

                        <button
                          onClick={() => onDeleteCandidate(candidate.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Remove Candidate"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Candidate Profile Details Drawer / Modal */}
      {activeCandidateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0e1626] border border-white/[0.12] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5 text-slate-200">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-white font-bold text-lg flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
                  {activeCandidateModal.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-white font-['Space_Grotesk'] truncate">
                    {activeCandidateModal.name}
                  </h3>
                  <p className="text-xs text-cyan-300 truncate">{activeCandidateModal.jobTitle}</p>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-2">
                    <span>{activeCandidateModal.email}</span>
                    <span>•</span>
                    <span>{activeCandidateModal.phone || "No phone listed"}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveCandidateModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.06] shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ATS Score Overview */}
            <div className="p-4 rounded-xl bg-[#070b14] border border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <div
                  className={`w-14 h-14 rounded-xl border flex flex-col items-center justify-center font-bold font-mono text-xl ${getScoreColor(
                    activeCandidateModal.atsScore
                  )}`}
                >
                  {activeCandidateModal.atsScore}%
                  <span className="text-[8px] font-sans font-normal opacity-80 uppercase">Match</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                    ATS Compatibility Synthesis
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                    {activeCandidateModal.matchSummary ||
                      "Candidate meets baseline engineering requirements."}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  onSelectCandidateForInterview(activeCandidateModal);
                  setActiveCandidateModal(null);
                }}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-cyan-500/20 shrink-0 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>Interview Now</span>
              </button>
            </div>

            {/* Core Competencies */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-2">
                Validated Skills
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {(activeCandidateModal.parsedResume?.skills || activeCandidateModal.strengths || []).map(
                  (skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                    >
                      {skill}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Experience timeline */}
            {activeCandidateModal.parsedResume?.experience &&
              activeCandidateModal.parsedResume.experience.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-2">
                    Work History
                  </h4>
                  <div className="space-y-2">
                    {activeCandidateModal.parsedResume.experience.map((exp, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-[#070b14] border border-white/[0.04] text-xs"
                      >
                        <div className="flex items-center justify-between font-bold text-white">
                          <span>
                            {exp.role} @ {exp.company}
                          </span>
                          <span className="text-slate-400 font-mono text-[11px]">{exp.duration}</span>
                        </div>
                        <p className="text-slate-400 mt-1 text-[11px] leading-relaxed">
                          {exp.highlights}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Close Button */}
            <div className="pt-3 border-t border-white/[0.06] flex justify-end">
              <button
                onClick={() => setActiveCandidateModal(null)}
                className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-semibold cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
