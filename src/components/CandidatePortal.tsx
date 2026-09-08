import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Bot,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Briefcase,
  FileText,
  Calendar,
  ShieldCheck,
  Zap,
  Activity,
  Award
} from "lucide-react";
import type { Candidate, Job, InterviewSlot } from "../types";

interface CandidatePortalProps {
  candidate: Candidate | null;
  jobs: Job[];
  interviews: InterviewSlot[];
  onEnterInterview: () => void;
  onOpenResumeParser: () => void;
}

export const CandidatePortal: React.FC<CandidatePortalProps> = ({
  candidate,
  jobs,
  interviews,
  onEnterInterview,
  onOpenResumeParser,
}) => {
  const activeCand = candidate || {
    id: "demo-cand",
    name: "Elena Rostova",
    email: "elena.rostova@example.com",
    phone: "+1 (415) 890-1234",
    jobId: jobs[0]?.id || "job-1",
    jobTitle: jobs[0]?.title || "Senior Full-Stack Engineer (MERN & AI)",
    status: "Screened" as const,
    atsScore: 92,
    matchSummary: "Strong match for Senior Full-Stack Engineer role.",
    strengths: ["Node.js & React architecture", "Decoupled streaming systems", "TypeScript"],
    missingSkills: [],
    appliedAt: new Date().toISOString(),
  };

  const activeJob = jobs.find((j) => j.id === activeCand.jobId) || jobs[0];
  const candidateInterviews = interviews.filter(
    (i) => i.candidateEmail === activeCand.email || i.candidateName === activeCand.name
  );

  // Hardware check states
  const [cameraActive, setCameraActive] = useState<boolean>(true);
  const [micActive, setMicActive] = useState<boolean>(true);
  const [audioLevel, setAudioLevel] = useState<number>(65);
  const [isPlayingTestTone, setIsPlayingTestTone] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Initialize camera for hardware check
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (cameraActive && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch((err) => {
          console.warn("Camera preview unavailable:", err);
          setCameraActive(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraActive]);

  // Audio level animation
  useEffect(() => {
    const interval = setInterval(() => {
      if (micActive) {
        setAudioLevel(Math.floor(40 + Math.random() * 50));
      } else {
        setAudioLevel(0);
      }
    }, 400);
    return () => clearInterval(interval);
  }, [micActive]);

  const testAudioTone = () => {
    if (typeof window === "undefined") return;
    setIsPlayingTestTone(true);
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
      console.warn("Audio test unavailable:", e);
    }
    setTimeout(() => setIsPlayingTestTone(false), 700);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Candidate Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0c1426] via-[#101e3d] to-[#0a1120] border border-white/[0.08] p-6 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
              {activeCand.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  Candidate Assessment Portal
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: {activeCand.id}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Space_Grotesk'] mt-1">
                Welcome, {activeCand.name}
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Applied for: <span className="text-cyan-300 font-semibold">{activeJob.title}</span> •{" "}
                {activeJob.department}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onEnterInterview}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-extrabold text-xs tracking-wider uppercase flex items-center space-x-2 shadow-lg shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <Bot className="w-4 h-4 fill-slate-950" />
              <span>Enter AI Screening Room</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pre-Flight Hardware Check (6 cols) */}
        <div className="lg:col-span-6 bg-[#0e1626]/90 p-5 rounded-2xl border border-white/[0.08] backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white font-['Space_Grotesk'] uppercase tracking-wider">
                Pre-Flight Hardware Check
              </h2>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Systems Operational
            </span>
          </div>

          {/* Camera Preview HUD */}
          <div className="relative aspect-video rounded-xl overflow-hidden bg-[#070b14] border border-white/[0.08] flex items-center justify-center">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500 p-4">
                <VideoOff className="w-8 h-8 mb-2" />
                <span className="text-xs font-mono">Camera Disabled</span>
              </div>
            )}

            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/[0.1] text-[10px] font-mono text-cyan-300">
              WEBCAM TEST • 1080P
            </div>

            <div className="absolute bottom-3 left-3 right-3 bg-black/70 backdrop-blur-md p-2 rounded-xl border border-white/[0.1] flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCameraActive(!cameraActive)}
                  className={`p-1.5 rounded-lg text-xs ${
                    cameraActive ? "text-cyan-300 bg-cyan-500/20" : "text-rose-400 bg-rose-500/20"
                  }`}
                >
                  {cameraActive ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setMicActive(!micActive)}
                  className={`p-1.5 rounded-lg text-xs ${
                    micActive ? "text-cyan-300 bg-cyan-500/20" : "text-rose-400 bg-rose-500/20"
                  }`}
                >
                  {micActive ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Decibel level */}
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono text-slate-400">Mic Input:</span>
                <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300 rounded-full"
                    style={{ width: `${audioLevel}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Audio Speaker Test Tone Button */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#070b14] border border-white/[0.06]">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Speaker & Audio Output</span>
                <span className="text-[10px] text-slate-400">Test if you can clearly hear Alex's voice</span>
              </div>
            </div>

            <button
              onClick={testAudioTone}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                isPlayingTestTone
                  ? "bg-cyan-500 text-slate-950 border-cyan-400"
                  : "bg-white/[0.06] hover:bg-white/[0.1] text-cyan-300 border-white/[0.1]"
              }`}
            >
              {isPlayingTestTone ? "Playing Chime..." : "Play Test Sound"}
            </button>
          </div>

          {/* Quick tips */}
          <div className="p-3 rounded-xl bg-[#070b14] border border-white/[0.06] space-y-1.5 text-xs text-slate-300">
            <span className="font-bold text-slate-400 font-mono text-[10px] uppercase tracking-wider block">
              Interview Tips:
            </span>
            <ul className="space-y-1 text-[11px] text-slate-400">
              <li className="flex items-start space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                <span>Speak naturally; Alex listens to technical trade-offs and structural choices.</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                <span>You can speak using the microphone button or type responses using your keyboard.</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                <span>Instant evaluation scorecards are delivered immediately after completion.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Application Status & Resume Compatibility (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* ATS Compatibility Card */}
          <div className="bg-[#0e1626]/90 p-5 rounded-2xl border border-white/[0.08] backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-white font-['Space_Grotesk'] uppercase tracking-wider">
                  Resume Match Profile
                </h2>
              </div>
              <button
                onClick={onOpenResumeParser}
                className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
              >
                <span>Re-scan Resume</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-center space-x-4 p-3.5 rounded-xl bg-[#070b14] border border-white/[0.06]">
              <div className="w-16 h-16 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex flex-col items-center justify-center shrink-0">
                <span className="text-2xl font-extrabold text-cyan-300 font-['Space_Grotesk'] leading-none">
                  {activeCand.atsScore}%
                </span>
                <span className="text-[8px] text-cyan-400 font-mono mt-0.5 uppercase">ATS MATCH</span>
              </div>

              <div className="min-w-0 flex-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 uppercase font-bold inline-block mb-1">
                  Qualified Profile
                </span>
                <h3 className="text-sm font-bold text-white truncate">{activeJob?.title || "Engineering Role"}</h3>
                <p className="text-xs text-slate-300 mt-0.5 leading-snug line-clamp-2">
                  {activeCand.matchSummary}
                </p>
              </div>
            </div>

            {/* Strengths */}
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                Matched Technical Strengths:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(activeCand.strengths || []).map((s, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded text-xs font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Scheduled Interviews */}
          <div className="bg-[#0e1626]/90 p-5 rounded-2xl border border-white/[0.08] backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                <h2 className="text-sm font-bold text-white font-['Space_Grotesk'] uppercase tracking-wider">
                  Upcoming Interview Appointments
                </h2>
              </div>
            </div>

            {candidateInterviews.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#070b14] border border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block">Immediate AI Voice Screening</span>
                  <span className="text-[11px] text-slate-400">Available on-demand 24/7 with Alex</span>
                </div>
                <button
                  onClick={onEnterInterview}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shrink-0 cursor-pointer"
                >
                  Start Now
                </button>
              </div>
            ) : (
              candidateInterviews.map((slot) => (
                <div
                  key={slot.id}
                  className="p-3.5 rounded-xl bg-[#070b14] border border-white/[0.06] flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block truncate">{slot.interviewType}</span>
                    <span className="text-[11px] font-mono text-cyan-300 truncate block">
                      {slot.scheduledDate} at {slot.scheduledTime} ({slot.durationMinutes} min)
                    </span>
                  </div>
                  <button
                    onClick={onEnterInterview}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shrink-0 cursor-pointer"
                  >
                    Join Room
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
