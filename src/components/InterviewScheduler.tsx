import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  Users,
  Briefcase,
  Play,
  Copy,
  Check,
  Plus,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Trash2,
  CalendarCheck2,
  Radio
} from "lucide-react";
import type { InterviewSlot, Candidate, Job } from "../types";

interface InterviewSchedulerProps {
  interviews: InterviewSlot[];
  candidates: Candidate[];
  jobs: Job[];
  preselectedCandidate?: Candidate | null;
  onScheduleInterview: (newInterview: Omit<InterviewSlot, "id">) => void;
  onUpdateInterviewStatus: (id: string, status: InterviewSlot["status"]) => void;
  onDeleteInterview: (id: string) => void;
  onStartInterviewForSlot: (candidate: Candidate) => void;
}

export const InterviewScheduler: React.FC<InterviewSchedulerProps> = ({
  interviews,
  candidates,
  jobs,
  preselectedCandidate,
  onScheduleInterview,
  onUpdateInterviewStatus,
  onDeleteInterview,
  onStartInterviewForSlot,
}) => {
  // Form State
  const [candidateId, setCandidateId] = useState<string>(
    preselectedCandidate?.id || candidates[0]?.id || ""
  );
  const [candidateName, setCandidateName] = useState<string>(
    preselectedCandidate?.name || candidates[0]?.name || ""
  );
  const [candidateEmail, setCandidateEmail] = useState<string>(
    preselectedCandidate?.email || candidates[0]?.email || ""
  );
  const [jobId, setJobId] = useState<string>(
    preselectedCandidate?.jobId || jobs[0]?.id || ""
  );
  const [interviewType, setInterviewType] = useState<InterviewSlot["interviewType"]>("AI Screening");
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [selectedTime, setSelectedTime] = useState<string>("10:00 AM");
  const [timezone, setTimezone] = useState<string>("PST (UTC-8)");
  const [meetingUrl, setMeetingUrl] = useState<string>(
    `https://meet.hire-ai.internal/room-${Math.random().toString(36).substring(2, 7)}`
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const timeSlots = [
    "09:00 AM",
    "10:00 AM",
    "11:30 AM",
    "01:00 PM",
    "02:30 PM",
    "04:00 PM",
    "05:30 PM",
  ];

  // Auto update candidate details when selected
  const handleSelectCandidate = (id: string) => {
    setCandidateId(id);
    const found = candidates.find((c) => c.id === id);
    if (found) {
      setCandidateName(found.name);
      setCandidateEmail(found.email);
      setJobId(found.jobId);
    }
  };

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName || !jobId) return;

    const targetJob = jobs.find((j) => j.id === jobId);

    onScheduleInterview({
      candidateId: candidateId || `cand-${Date.now()}`,
      candidateName,
      candidateEmail,
      jobId,
      jobTitle: targetJob?.title || "Engineering Position",
      interviewType,
      scheduledDate: selectedDate,
      scheduledTime: selectedTime,
      durationMinutes,
      status: "Scheduled",
      meetingUrl,
      notes: "AI voice interview session coordinated through Hire-AI.",
    });

    // Reset meeting URL
    setMeetingUrl(`https://meet.hire-ai.internal/room-${Math.random().toString(36).substring(2, 7)}`);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredInterviews = interviews.filter((item) => {
    if (statusFilter === "all") return true;
    return item.status === statusFilter;
  });

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0c1322] via-[#121c35] to-[#09101f] border border-white/[0.08] p-6 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-semibold mb-2">
              <CalendarCheck2 className="w-3.5 h-3.5" />
              <span>SEAMLESS CALENDAR DISPATCH</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Space_Grotesk']">
              Hire-AI Interview Scheduler
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Coordinate candidate screening slots, dispatch automated calendar invitations, generate private AI room meeting links, and manage interview schedules.
            </p>
          </div>

          <div className="bg-[#070b14]/90 p-3 rounded-xl border border-white/[0.08] flex items-center space-x-4 self-start md:self-center">
            <div className="text-center">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Active Slots</span>
              <span className="text-xl font-bold text-white font-['Space_Grotesk']">
                {interviews.filter((i) => i.status === "Scheduled").length}
              </span>
            </div>
            <div className="h-7 w-[1px] bg-white/[0.1]"></div>
            <div className="text-center">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Completed</span>
              <span className="text-xl font-bold text-purple-400 font-['Space_Grotesk']">
                {interviews.filter((i) => i.status === "Completed").length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Booking Form (5 cols) */}
        <div className="lg:col-span-5 bg-[#0e1626]/90 p-5 rounded-2xl border border-white/[0.08] backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-white/[0.06]">
            <Plus className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white font-['Space_Grotesk'] uppercase tracking-wider">
              Book Candidate Session
            </h2>
          </div>

          <form onSubmit={handleCreateSchedule} className="space-y-3.5">
            {/* Candidate Selector */}
            <div>
              <label className="text-[11px] font-bold text-slate-300 font-mono uppercase tracking-wider block mb-1">
                Select Candidate
              </label>
              <select
                value={candidateId}
                onChange={(e) => handleSelectCandidate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-white/[0.1] bg-[#070b14] text-white focus:outline-none focus:border-cyan-500/50"
              >
                {candidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.jobTitle} - {c.atsScore}% ATS)
                  </option>
                ))}
              </select>
            </div>

            {/* Candidate Email */}
            <div>
              <label className="text-[11px] font-bold text-slate-300 font-mono uppercase tracking-wider block mb-1">
                Candidate Email
              </label>
              <input
                type="email"
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-white/[0.1] bg-[#070b14] text-white focus:outline-none focus:border-cyan-500/50 font-mono"
              />
            </div>

            {/* Target Job Role */}
            <div>
              <label className="text-[11px] font-bold text-slate-300 font-mono uppercase tracking-wider block mb-1">
                Interview Position
              </label>
              <select
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-white/[0.1] bg-[#070b14] text-white focus:outline-none focus:border-cyan-500/50"
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Interview Type */}
            <div>
              <label className="text-[11px] font-bold text-slate-300 font-mono uppercase tracking-wider block mb-1">
                Assessment Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["AI Screening", "Technical Deep Dive", "System Design", "Behavioral"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setInterviewType(type)}
                    className={`py-1.5 px-2 text-[11px] font-mono rounded-lg border transition-all ${
                      interviewType === type
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold"
                        : "bg-[#070b14] text-slate-400 border-white/[0.08] hover:text-white"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Duration */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-300 font-mono uppercase tracking-wider block mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-white/[0.1] bg-[#070b14] text-white focus:outline-none focus:border-cyan-500/50 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 font-mono uppercase tracking-wider block mb-1">
                  Duration
                </label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-white/[0.1] bg-[#070b14] text-white focus:outline-none focus:border-cyan-500/50"
                >
                  <option value={15}>15 minutes (Quick Screen)</option>
                  <option value={30}>30 minutes (Standard AI)</option>
                  <option value={45}>45 minutes (In-depth)</option>
                  <option value={60}>60 minutes (Comprehensive)</option>
                </select>
              </div>
            </div>

            {/* Time Slots */}
            <div>
              <label className="text-[11px] font-bold text-slate-300 font-mono uppercase tracking-wider block mb-1.5">
                Time Slot ({timezone})
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTime(slot)}
                    className={`py-1.5 rounded-lg text-[11px] font-mono border transition-all ${
                      selectedTime === slot
                        ? "bg-purple-500/20 text-purple-300 border-purple-500/40 font-bold shadow-xs"
                        : "bg-[#070b14] text-slate-400 border-white/[0.08] hover:text-white"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Meeting Link Preview */}
            <div>
              <label className="text-[11px] font-bold text-slate-300 font-mono uppercase tracking-wider block mb-1">
                AI Room Meeting Link
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={meetingUrl}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-white/[0.1] bg-[#070b14] text-slate-300 font-mono truncate"
                />
                <button
                  type="button"
                  onClick={() => handleCopy("form-link", meetingUrl)}
                  className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-cyan-300 border border-white/[0.1]"
                  title="Copy link"
                >
                  {copiedId === "form-link" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-extrabold text-xs tracking-wider uppercase flex items-center justify-center space-x-1.5 shadow-lg shadow-purple-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <CalendarCheck2 className="w-4 h-4" />
              <span>Confirm & Dispatch Invitation</span>
            </button>
          </form>
        </div>

        {/* Right Column: Scheduled Pipeline Sessions (7 cols) */}
        <div className="lg:col-span-7 bg-[#0e1626]/90 p-5 rounded-2xl border border-white/[0.08] backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
            <div>
              <h2 className="text-sm font-bold text-white font-['Space_Grotesk'] uppercase tracking-wider">
                Scheduled Interview Calendar
              </h2>
              <p className="text-[11px] text-slate-400">Showing {filteredInterviews.length} sessions</p>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-1 bg-[#070b14] p-0.5 rounded-lg border border-white/[0.08] text-xs">
              {(["all", "Scheduled", "Completed", "Cancelled"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all ${
                    statusFilter === filter
                      ? "bg-cyan-500 text-slate-950 font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {filter === "all" ? "All" : filter}
                </button>
              ))}
            </div>
          </div>

          {/* List of Scheduled Sessions */}
          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {filteredInterviews.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/[0.08] rounded-xl text-slate-500">
                <Calendar className="w-8 h-8 mb-2 text-slate-600" />
                <span className="text-xs">No interviews scheduled in this view</span>
                <span className="text-[11px] text-slate-600 mt-0.5">Use the booking form to schedule a slot</span>
              </div>
            ) : (
              filteredInterviews.map((slot) => {
                const matchedCand = candidates.find((c) => c.id === slot.candidateId);
                return (
                  <div
                    key={slot.id}
                    className="p-4 rounded-xl bg-[#070b14]/90 border border-white/[0.08] hover:border-cyan-500/30 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 text-purple-300 font-bold flex items-center justify-center text-xs">
                          {slot.candidateName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">{slot.candidateName}</h3>
                          <p className="text-[11px] text-slate-400">{slot.jobTitle}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                            slot.status === "Scheduled"
                              ? "bg-sky-500/15 text-sky-300 border-sky-500/30"
                              : slot.status === "Completed"
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                              : "bg-rose-500/15 text-rose-300 border-rose-500/30"
                          }`}
                        >
                          {slot.status}
                        </span>

                        <select
                          value={slot.status}
                          onChange={(e) =>
                            onUpdateInterviewStatus(slot.id, e.target.value as InterviewSlot["status"])
                          }
                          className="px-2 py-0.5 text-[10px] font-mono rounded bg-white/[0.06] text-slate-300 border border-white/[0.1] focus:outline-none"
                        >
                          <option value="Scheduled">Scheduled</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-300 pt-1">
                      <span className="flex items-center gap-1.5 text-cyan-300">
                        <Calendar className="w-3.5 h-3.5" />
                        {slot.scheduledDate}
                      </span>
                      <span className="flex items-center gap-1.5 text-purple-300">
                        <Clock className="w-3.5 h-3.5" />
                        {slot.scheduledTime} ({slot.durationMinutes} min)
                      </span>
                      <span className="px-2 py-0.2 rounded bg-white/[0.05] text-[10px] text-slate-400">
                        {slot.interviewType}
                      </span>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-2.5 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleCopy(slot.id, slot.meetingUrl)}
                          className="flex items-center space-x-1 text-[11px] font-mono text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                        >
                          {copiedId === slot.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span className={copiedId === slot.id ? "text-emerald-400" : ""}>
                            {copiedId === slot.id ? "Link Copied!" : "Copy Meet Link"}
                          </span>
                        </button>
                      </div>

                      <div className="flex items-center space-x-2">
                        {matchedCand && (
                          <button
                            onClick={() => onStartInterviewForSlot(matchedCand)}
                            className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 text-xs font-bold flex items-center space-x-1 cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-cyan-300" />
                            <span>Launch Room</span>
                          </button>
                        )}

                        <button
                          onClick={() => onDeleteInterview(slot.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Remove session"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
