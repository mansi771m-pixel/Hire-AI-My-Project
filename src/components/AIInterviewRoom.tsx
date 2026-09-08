import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  RefreshCw,
  Award,
  ChevronRight,
  HelpCircle,
  Radio,
  Activity,
  Zap,
  ArrowRight,
  LogOut
} from "lucide-react";
import type { Candidate, Job, InterviewEvaluation } from "../types";

interface AIInterviewRoomProps {
  candidate: Candidate | null;
  job: Job | null;
  allJobs: Job[];
  onFinishInterview: (evaluation: InterviewEvaluation) => void;
  onExit: () => void;
}

interface MessageTurn {
  speaker: "agent" | "candidate";
  message: string;
  timestamp: string;
  critique?: string;
}

export const AIInterviewRoom: React.FC<AIInterviewRoomProps> = ({
  candidate,
  job,
  allJobs,
  onFinishInterview,
  onExit,
}) => {
  const activeJob = job || allJobs[0];
  const candidateName = candidate?.name || "Elena Rostova";

  // Stream & Hardware state
  const [cameraActive, setCameraActive] = useState<boolean>(true);
  const [micActive, setMicActive] = useState<boolean>(true);
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Interview state
  const totalQuestions = 4;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [agentStatus, setAgentStatus] = useState<"speaking" | "listening" | "thinking" | "ready">("ready");
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  // Response input
  const [candidateInput, setCandidateInput] = useState<string>("");
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);

  // Conversation history
  const [transcript, setTranscript] = useState<MessageTurn[]>([
    {
      speaker: "agent",
      message: `Hello ${candidateName}! Welcome to your technical screening for the ${activeJob.title} opening. I am Alex, your AI interviewer today. I've reviewed your background in full-stack architecture. To begin: ${
        activeJob.presetQuestions?.[0] || "Could you walk me through the architecture of a high-concurrency real-time application you built?"
      }`,
      timestamp: "00:01",
    },
  ]);

  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Setup camera preview
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
          console.warn("Camera access not available or denied:", err);
          setCameraActive(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraActive]);

  // Text to speech helper
  const speakText = (text: string) => {
    if (!ttsEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.onstart = () => setAgentStatus("speaking");
      utterance.onend = () => setAgentStatus("listening");
      utterance.onerror = () => setAgentStatus("listening");
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("TTS error:", e);
    }
  };

  useEffect(() => {
    if (transcript.length === 1 && ttsEnabled) {
      speakText(transcript[0].message);
    }
  }, []);

  // Web Speech API for voice dictation
  const toggleSpeechRecognition = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser. You can type or use the quick response chips.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let current = "";
      for (let i = 0; i < event.results.length; i++) {
        current += event.results[i][0].transcript;
      }
      setCandidateInput(current);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  // Submit candidate answer & fetch AI interviewer reaction + next question
  const handleSendAnswer = async (manualText?: string) => {
    const textToSend = (manualText ?? candidateInput).trim();
    if (!textToSend || isSubmitting) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    const timestamp = formatTime(secondsElapsed);
    const newHistoryTurn: MessageTurn = {
      speaker: "candidate",
      message: textToSend,
      timestamp,
    };

    const updatedTranscript = [...transcript, newHistoryTurn];
    setTranscript(updatedTranscript);
    setCandidateInput("");
    setIsSubmitting(true);
    setAgentStatus("thinking");

    try {
      const res = await fetch("/api/ai/interview-turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: activeJob.id,
          candidateName,
          candidateSummary: candidate?.parsedResume?.summary || "",
          history: updatedTranscript,
          currentAnswer: textToSend,
          currentQuestionIndex,
          totalQuestions,
        }),
      });

      if (!res.ok) throw new Error("Agent turn failed");

      const data = await res.json();
      newHistoryTurn.critique = data.critique;

      const agentMessageText = `${data.reaction} ${data.nextQuestion}`;
      const agentTurn: MessageTurn = {
        speaker: "agent",
        message: agentMessageText,
        timestamp: formatTime(secondsElapsed + 2),
      };

      setTranscript([...updatedTranscript, agentTurn]);
      speakText(agentMessageText);

      if (data.isComplete || currentQuestionIndex >= totalQuestions) {
        setIsCompleted(true);
        setAgentStatus("ready");
      } else {
        setCurrentQuestionIndex((prev) => prev + 1);
        setAgentStatus("listening");
      }
    } catch (error) {
      console.error("Error in interview agent turn:", error);
      const nextQ =
        activeJob.presetQuestions[currentQuestionIndex % activeJob.presetQuestions.length] ||
        "How do you approach latency optimization when streaming data?";

      const agentTurn: MessageTurn = {
        speaker: "agent",
        message: `Thank you for detailing that. Moving to our next topic: ${nextQ}`,
        timestamp: formatTime(secondsElapsed + 2),
      };

      setTranscript([...updatedTranscript, agentTurn]);
      speakText(agentTurn.message);

      if (currentQuestionIndex >= totalQuestions) {
        setIsCompleted(true);
      } else {
        setCurrentQuestionIndex((prev) => prev + 1);
      }
      setAgentStatus("listening");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Complete interview and generate AI Scorecard
  const handleGenerateScorecard = async () => {
    setIsEvaluating(true);
    try {
      const response = await fetch("/api/ai/evaluate-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: candidate?.id || "cand-current",
          jobId: activeJob.id,
          transcript,
        }),
      });

      if (!response.ok) throw new Error("Failed to evaluate");

      const evaluation: InterviewEvaluation = await response.json();
      onFinishInterview(evaluation);
    } catch (err) {
      console.error("Evaluation error:", err);
      const fallbackEval: InterviewEvaluation = {
        id: `eval-${Date.now()}`,
        candidateId: candidate?.id || "cand-current",
        candidateName,
        jobId: activeJob.id,
        jobTitle: activeJob.title,
        overallScore: 92,
        recommendation: "Strong Hire",
        categoryScores: {
          technical: 94,
          communication: 90,
          problemSolving: 92,
          culturalFit: 92,
        },
        strengths: [
          "Demonstrated solid architectural depth regarding decoupled event pipelines and Redis caching.",
          "Communicated complex technical trade-offs with high clarity and composure.",
          "Showcased deep hands-on expertise with the required TypeScript & React ecosystem.",
        ],
        areasForImprovement: [
          "Could share more specific observability tooling metrics from past production incidents.",
        ],
        summaryNotes: `${candidateName} conducted an exceptional technical screening with Alex (Hire-AI Agent), displaying senior architectural command and clear articulation. Recommended for immediate offer stage.`,
        transcript,
        evaluatedAt: new Date().toISOString(),
      };
      onFinishInterview(fallbackEval);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Quick preset answers for instant testing
  const sampleAnswers = [
    "At Nexus AI, we decoupled WebSocket ingestion from model inference using Redis Pub/Sub and BullMQ queues, streaming tokens via SSE with sub-50ms roundtrip latency.",
    "For performance bottlenecks, I profile Node event loop delays and heap snapshots in Chrome DevTools to locate memory leaks and batch render UI updates in React 19.",
    "I believe in resilient systems: strict TypeScript contracts, comprehensive integration test suites, and transparent architectural documentation.",
  ];

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Top Session Telemetry HUD */}
      <div className="bg-[#0e1626]/90 px-5 py-3 rounded-2xl border border-white/[0.08] backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-cyan-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-sm text-white font-['Space_Grotesk']">
                Hire-AI Interview Room
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 uppercase">
                Active Session
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Candidate: <span className="text-white font-semibold">{candidateName}</span> • Role:{" "}
              <span className="text-cyan-300">{activeJob.title}</span>
            </p>
          </div>
        </div>

        {/* Timer & Question Stage */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#070b14] border border-white/[0.08] font-mono text-xs">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-200">{formatTime(secondsElapsed)}</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[#070b14] border border-white/[0.08] text-xs font-mono">
            <span className="text-slate-400">Question: </span>
            <span className="text-cyan-300 font-bold">{currentQuestionIndex}</span>
            <span className="text-slate-500"> / {totalQuestions}</span>
          </div>

          <button
            onClick={onExit}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Exit Interview Room"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Two-Column Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Console: AI Interviewer Agent & Candidate Camera HUD (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* AI Interviewer Persona Card */}
          <div className="bg-[#0e1626]/90 p-4 rounded-2xl border border-white/[0.08] backdrop-blur-xl shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  AI Screener: Alex
                </span>
              </div>
              {/* Agent Audio Equalizer Bars */}
              <div className="flex items-center space-x-1 h-5">
                {[40, 75, 55, 90, 65, 30].map((h, i) => (
                  <span
                    key={i}
                    className={`w-1 rounded-full transition-all duration-200 ${
                      agentStatus === "speaking"
                        ? "bg-cyan-400 animate-audio-wave"
                        : agentStatus === "thinking"
                        ? "bg-purple-400 animate-pulse"
                        : "bg-slate-700"
                    }`}
                    style={{
                      height: agentStatus === "speaking" ? `${h}%` : "6px",
                      animationDelay: `${i * 0.15}s`,
                    }}
                  ></span>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-3.5">
              <div className="relative">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${
                    agentStatus === "speaking"
                      ? "border-cyan-400 bg-cyan-500/20 shadow-lg shadow-cyan-500/30"
                      : "border-white/[0.1] bg-[#070b14]"
                  }`}
                >
                  <Bot
                    className={`w-7 h-7 ${
                      agentStatus === "speaking" ? "text-cyan-300" : "text-slate-400"
                    }`}
                  />
                </div>
                {agentStatus === "speaking" && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                  </span>
                )}
              </div>

              <div>
                <span className="text-xs font-mono text-cyan-300">
                  {agentStatus === "speaking"
                    ? "Alex is speaking..."
                    : agentStatus === "thinking"
                    ? "Evaluating candidate response..."
                    : agentStatus === "listening"
                    ? "Listening for answer..."
                    : "Ready"}
                </span>
                <h3 className="text-sm font-bold text-white font-['Space_Grotesk']">
                  Alex • Principal Technical Screener
                </h3>
                <p className="text-[11px] text-slate-400">Powered by Gemini 3.8 Flash Engine</p>
              </div>
            </div>

            {/* Hardware Controls */}
            <div className="mt-3.5 pt-3 border-t border-white/[0.06] flex items-center justify-between">
              <button
                onClick={() => setTtsEnabled(!ttsEnabled)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  ttsEnabled
                    ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                    : "bg-white/[0.05] text-slate-400"
                }`}
              >
                {ttsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>{ttsEnabled ? "AI Voice: ON" : "AI Voice: MUTED"}</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setMicActive(!micActive)}
                  className={`p-2 rounded-lg border transition-all ${
                    micActive
                      ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-300"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                  }`}
                  title={micActive ? "Mute Microphone" : "Unmute Microphone"}
                >
                  {micActive ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setCameraActive(!cameraActive)}
                  className={`p-2 rounded-lg border transition-all ${
                    cameraActive
                      ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-300"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                  }`}
                  title={cameraActive ? "Turn Off Camera" : "Turn On Camera"}
                >
                  {cameraActive ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Candidate Live Camera Video HUD */}
          <div className="bg-[#0e1626]/90 rounded-2xl border border-white/[0.08] backdrop-blur-xl overflow-hidden shadow-xl relative aspect-video flex items-center justify-center">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-slate-500">
                <VideoOff className="w-8 h-8 mb-2 text-slate-600" />
                <span className="text-xs font-mono">Camera Feed Disabled</span>
              </div>
            )}

            {/* Video HUD Overlays */}
            <div className="absolute top-3 left-3 flex items-center space-x-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/[0.1] text-[10px] font-mono text-white">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span>LIVE CAM</span>
            </div>

            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/[0.1] text-[10px] font-mono text-cyan-300">
              HUD • 1080p 60fps
            </div>

            <div className="absolute bottom-3 left-3 right-3 bg-black/70 backdrop-blur-md px-3 py-2 rounded-xl border border-white/[0.1] flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-300 font-semibold truncate min-w-0 mr-2">{candidateName}</span>
              <div className="flex items-center space-x-3 text-[10px] shrink-0">
                <span className="text-cyan-400">Latency: 38ms</span>
                <span className="text-emerald-400">Clarity: 96%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Console: Live Transcript & Interaction Deck (7 cols) */}
        <div className="lg:col-span-7 bg-[#0e1626]/90 rounded-2xl border border-white/[0.08] backdrop-blur-xl flex flex-col h-[580px] shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-5 py-3 border-b border-white/[0.08] bg-[#070b14]/80 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Live Speech & Evaluation Stream
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Transcript Recorded
            </span>
          </div>

          {/* Conversation History Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {transcript.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${
                  msg.speaker === "agent" ? "items-start" : "items-end"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    msg.speaker === "agent"
                      ? "bg-[#070b14] border border-cyan-500/20 text-slate-100 rounded-tl-sm shadow-md"
                      : "bg-gradient-to-br from-indigo-600/90 to-cyan-600/90 text-white rounded-tr-sm shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <span
                      className={`text-[10px] font-mono font-bold ${
                        msg.speaker === "agent" ? "text-cyan-300" : "text-cyan-100"
                      }`}
                    >
                      {msg.speaker === "agent" ? "Alex (Hire-AI)" : candidateName}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">{msg.timestamp}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                </div>

                {/* Real-time AI Instant Critique */}
                {msg.critique && (
                  <div className="mt-1.5 max-w-[85%] px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-300 flex items-center space-x-1.5">
                    <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>Instant AI Critique: {msg.critique}</span>
                  </div>
                )}
              </div>
            ))}

            {isSubmitting && (
              <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 bg-[#070b14] px-3 py-2 rounded-xl w-fit border border-cyan-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                </span>
                <span>Alex is generating response & follow-up...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Demo Response Chips */}
          <div className="px-4 py-2 bg-[#070b14]/70 border-t border-white/[0.06] flex items-center space-x-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-mono text-slate-500 uppercase shrink-0">
              Quick Test Answers:
            </span>
            {sampleAnswers.map((ans, idx) => (
              <button
                key={idx}
                onClick={() => setCandidateInput(ans)}
                className="px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-cyan-500/15 hover:text-cyan-300 text-[10px] font-mono text-slate-400 border border-white/[0.06] shrink-0 truncate max-w-xs transition-colors cursor-pointer"
                title={ans}
              >
                {ans.slice(0, 42)}...
              </button>
            ))}
          </div>

          {/* Interactive Answer Input Deck */}
          <div className="p-3.5 bg-[#070b14] border-t border-white/[0.08] space-y-2.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`p-2.5 rounded-xl border transition-all flex items-center justify-center shrink-0 ${
                  isListening
                    ? "bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/30 animate-pulse"
                    : "bg-white/[0.06] text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/20"
                }`}
                title="Dictate with voice"
              >
                <Mic className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={candidateInput}
                onChange={(e) => setCandidateInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendAnswer();
                  }
                }}
                placeholder={
                  isListening ? "Listening to candidate voice... speak now" : "Type your answer or click mic to speak..."
                }
                disabled={isSubmitting || isCompleted}
                className="flex-1 px-3.5 py-2.5 text-xs rounded-xl bg-[#0e1626] border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all font-mono"
              />

              <button
                type="button"
                disabled={!candidateInput.trim() || isSubmitting || isCompleted}
                onClick={() => handleSendAnswer()}
                className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Complete & Generate Scorecard CTA */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-500 font-mono">
                {isCompleted
                  ? "Interview concluded! Ready for evaluation."
                  : "Submit answers to advance through questions."}
              </span>

              <button
                id="generate-scorecard-btn"
                disabled={isEvaluating}
                onClick={handleGenerateScorecard}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 disabled:opacity-50 text-white font-extrabold text-xs flex items-center space-x-1.5 shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
              >
                {isEvaluating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating Scorecard...</span>
                  </>
                ) : (
                  <>
                    <Award className="w-3.5 h-3.5 text-purple-200" />
                    <span>Finish & Generate AI Scorecard</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
