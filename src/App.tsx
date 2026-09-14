import React, { useState, useEffect } from "react";
import { Navbar, TabType } from "./components/Navbar";
import { RecruiterDashboard } from "./components/RecruiterDashboard";
import { ResumeParserScreening } from "./components/ResumeParserScreening";
import { AIInterviewRoom } from "./components/AIInterviewRoom";
import { InterviewScheduler } from "./components/InterviewScheduler";
import { JobPostings } from "./components/JobPostings";
import { InterviewScorecardModal } from "./components/InterviewScorecardModal";
import { CandidatePortal } from "./components/CandidatePortal";
import type { Candidate, Job, InterviewSlot, PlatformStats, InterviewEvaluation } from "./types";
import { Bot, Sparkles, CheckCircle2, ShieldAlert } from "lucide-react";

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>("pipeline");
  const [userRole, setUserRole] = useState<"recruiter" | "candidate">("recruiter");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [interviews, setInterviews] = useState<InterviewSlot[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Active candidate for Interview Room or Scheduler
  const [activeInterviewCandidate, setActiveInterviewCandidate] = useState<Candidate | null>(null);
  const [activeScorecard, setActiveScorecard] = useState<InterviewEvaluation | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" } | null>(null);

  // Show banner alert
  const showToast = (message: string, type: "success" | "info" = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Fetch initial data from Express backend
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [jobsRes, candsRes, interviewsRes, statsRes] = await Promise.all([
        fetch("/api/jobs"),
        fetch("/api/candidates"),
        fetch("/api/interviews"),
        fetch("/api/stats"),
      ]);

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setJobs(jobsData);
      }
      if (candsRes.ok) {
        const candsData = await candsRes.json();
        setCandidates(candsData);
      }
      if (interviewsRes.ok) {
        const interviewsData = await interviewsRes.json();
        setInterviews(interviewsData);
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error("Error loading platform data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Save new candidate from resume parser
  const handleSaveCandidate = async (newCand: Candidate) => {
    try {
      const res = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCand),
      });

      if (res.ok) {
        const saved = await res.json();
        setCandidates((prev) => [saved, ...prev.filter((c) => c.id !== saved.id)]);
        showToast(`Candidate ${saved.name} added to pipeline with ${saved.atsScore}% ATS score!`);
        fetchData();
      }
    } catch (e) {
      setCandidates((prev) => [newCand, ...prev.filter((c) => c.id !== newCand.id)]);
      showToast(`Candidate ${newCand.name} saved!`);
    }
  };

  // Update candidate status
  const handleUpdateCandidateStatus = async (candidateId: string, status: Candidate["status"]) => {
    try {
      const res = await fetch(`/api/candidates/${candidateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        const updated = await res.json();
        setCandidates((prev) => prev.map((c) => (c.id === candidateId ? updated : c)));
        showToast(`Candidate status set to "${status}".`);
      }
    } catch (e) {
      setCandidates((prev) =>
        prev.map((c) => (c.id === candidateId ? { ...c, status } : c))
      );
    }
  };

  // Delete candidate
  const handleDeleteCandidate = async (candidateId: string) => {
    try {
      await fetch(`/api/candidates/${candidateId}`, { method: "DELETE" });
      setCandidates((prev) => prev.filter((c) => c.id !== candidateId));
      showToast("Candidate removed from pipeline.", "info");
    } catch (e) {
      setCandidates((prev) => prev.filter((c) => c.id !== candidateId));
    }
  };

  // Schedule interview
  const handleScheduleInterview = async (newSlot: Omit<InterviewSlot, "id">) => {
    try {
      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSlot),
      });

      if (res.ok) {
        const created = await res.json();
        setInterviews((prev) => [created, ...prev]);
        handleUpdateCandidateStatus(created.candidateId, "Interview Scheduled");
        showToast(`Interview scheduled for ${created.candidateName}! Calendar invite dispatched.`);
      }
    } catch (e) {
      const fallbackSlot: InterviewSlot = {
        id: `slot-${Date.now()}`,
        ...newSlot,
      };
      setInterviews((prev) => [fallbackSlot, ...prev]);
    }
  };

  // Update interview status
  const handleUpdateInterviewStatus = async (id: string, status: InterviewSlot["status"]) => {
    try {
      const res = await fetch(`/api/interviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setInterviews((prev) => prev.map((i) => (i.id === id ? updated : i)));
        showToast(`Interview status set to ${status}`);
      }
    } catch (e) {
      setInterviews((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    }
  };

  // Delete interview
  const handleDeleteInterview = async (id: string) => {
    try {
      await fetch(`/api/interviews/${id}`, { method: "DELETE" });
      setInterviews((prev) => prev.filter((i) => i.id !== id));
      showToast("Interview session removed from schedule.", "info");
    } catch (e) {
      setInterviews((prev) => prev.filter((i) => i.id !== id));
    }
  };

  // Create new job
  const handleCreateJob = async (newJobData: Omit<Job, "id" | "createdAt" | "applicantCount">) => {
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newJobData),
      });
      if (res.ok) {
        const created = await res.json();
        setJobs((prev) => [created, ...prev]);
        showToast(`New opening "${created.title}" published!`);
      }
    } catch (e) {
      const fallbackJob: Job = {
        id: `job-${Date.now()}`,
        createdAt: new Date().toISOString(),
        applicantCount: 0,
        ...newJobData,
      };
      setJobs((prev) => [fallbackJob, ...prev]);
    }
  };

  // Delete job
  const handleDeleteJob = async (jobId: string) => {
    try {
      await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      showToast("Job position closed.", "info");
    } catch (e) {
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    }
  };

  // Handle interview finish in AI Interview Room
  const handleFinishInterview = async (evaluation: InterviewEvaluation) => {
    if (activeInterviewCandidate) {
      const updatedCandidate: Candidate = {
        ...activeInterviewCandidate,
        status: "Interviewed",
        evaluation,
      };

      setCandidates((prev) =>
        prev.map((c) => (c.id === activeInterviewCandidate.id ? updatedCandidate : c))
      );

      // Persist to backend
      fetch(`/api/candidates/${activeInterviewCandidate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Interviewed",
          evaluation,
        }),
      }).catch(console.error);
    }

    setActiveScorecard(evaluation);
    setCurrentTab("pipeline");
    showToast(`AI Interview complete! Scorecard generated with ${evaluation.overallScore}% score.`);
  };

  return (
    <div className="app-shell min-h-screen flex flex-col selection:bg-orange-200 selection:text-[#20241f]">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 bg-[#0e1626] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-cyan-500/40 flex items-center space-x-3 text-xs font-semibold animate-slide-up backdrop-blur-xl">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        activeTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab as TabType)}
        setActiveTab={setCurrentTab}
        userRole={userRole}
        setUserRole={setUserRole}
        candidateCount={candidates.length}
        scheduledCount={interviews.filter((i) => i.status === "Scheduled").length}
      />

      {/* Main Content Workspace */}
      <main className="app-main flex-1 w-full mx-auto p-4 sm:p-6 lg:p-10 pb-28 md:pb-10">
        {isLoading ? (
          <div className="py-28 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
              Initializing Hire-AI Intelligence Core...
            </p>
          </div>
        ) : userRole === "candidate" ? (
          /* Dedicated Candidate Portal Experience */
          <CandidatePortal
            candidate={activeInterviewCandidate || candidates[0] || null}
            jobs={jobs}
            interviews={interviews}
            onEnterInterview={() => {
              if (!activeInterviewCandidate && candidates[0]) {
                setActiveInterviewCandidate(candidates[0]);
              }
              setCurrentTab("interview");
            }}
            onOpenResumeParser={() => {
              setUserRole("recruiter");
              setCurrentTab("parser");
            }}
          />
        ) : (
          /* Recruiter Command Center */
          <>
            {/* View: Recruiter Pipeline Dashboard */}
            {currentTab === "pipeline" && (
              <RecruiterDashboard
                candidates={candidates}
                jobs={jobs}
                stats={stats}
                onSelectCandidateForInterview={(cand) => {
                  setActiveInterviewCandidate(cand);
                  setCurrentTab("interview");
                }}
                onOpenSchedulerForCandidate={(cand) => {
                  setActiveInterviewCandidate(cand);
                  setCurrentTab("scheduler");
                }}
                onOpenParser={() => setCurrentTab("parser")}
                onOpenEvaluation={(evalData) => setActiveScorecard(evalData)}
                onUpdateCandidateStatus={handleUpdateCandidateStatus}
                onDeleteCandidate={handleDeleteCandidate}
              />
            )}

            {/* View: Automated Resume Parser & Screening */}
            {currentTab === "parser" && (
              <ResumeParserScreening
                jobs={jobs}
                onSaveCandidate={handleSaveCandidate}
                onLaunchInterview={(cand) => {
                  handleSaveCandidate(cand);
                  setActiveInterviewCandidate(cand);
                  setCurrentTab("interview");
                }}
                onScheduleInterview={(cand) => {
                  handleSaveCandidate(cand);
                  setActiveInterviewCandidate(cand);
                  setCurrentTab("scheduler");
                }}
              />
            )}

            {/* View: Interactive Live AI Interview Room */}
            {currentTab === "interview" && (
              <AIInterviewRoom
                candidate={activeInterviewCandidate}
                job={
                  activeInterviewCandidate
                    ? jobs.find((j) => j.id === activeInterviewCandidate.jobId) || jobs[0]
                    : jobs[0]
                }
                allJobs={jobs}
                onFinishInterview={handleFinishInterview}
                onExit={() => setCurrentTab("pipeline")}
              />
            )}

            {/* View: Seamless Interview Scheduler */}
            {currentTab === "scheduler" && (
              <InterviewScheduler
                interviews={interviews}
                candidates={candidates}
                jobs={jobs}
                preselectedCandidate={activeInterviewCandidate}
                onScheduleInterview={handleScheduleInterview}
                onUpdateInterviewStatus={handleUpdateInterviewStatus}
                onDeleteInterview={handleDeleteInterview}
                onStartInterviewForSlot={(cand) => {
                  setActiveInterviewCandidate(cand);
                  setCurrentTab("interview");
                }}
              />
            )}

            {/* View: Job Openings & AI Questions */}
            {currentTab === "jobs" && (
              <JobPostings
                jobs={jobs}
                onCreateJob={handleCreateJob}
                onDeleteJob={handleDeleteJob}
                onScreenCandidateForJob={(job) => {
                  setCurrentTab("parser");
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Scorecard Modal */}
      {activeScorecard && (
        <InterviewScorecardModal
          evaluation={activeScorecard}
          onClose={() => setActiveScorecard(null)}
        />
      )}

      {/* High-Tech Futuristic Footer */}
      <footer className="app-footer mt-auto border-t py-5 px-6 pb-24 md:pb-5 text-center text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[10px] border border-cyan-500/30">
              H
            </div>
            <span className="font-bold text-white font-['Space_Grotesk']">
              Hire<span className="text-cyan-400">-AI</span> Recruitment Intelligence
            </span>
            <span className="text-slate-600">•</span>
            <span className="font-mono text-[11px] text-cyan-300">MERN + Gemini 3.8 Flash</span>
          </div>
          <p className="text-slate-400 text-[11px] font-mono">
            Candidate Screening • Automated Resume Parsing • Seamless Interview Scheduling
          </p>
        </div>
      </footer>
    </div>
  );
}
