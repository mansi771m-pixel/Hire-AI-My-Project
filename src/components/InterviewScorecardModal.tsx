import React from "react";
import {
  Award,
  X,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  Briefcase,
  Calendar,
  Share2,
  Printer,
  Sparkles,
  Layers,
  BarChart3,
  ThumbsUp,
  MessageSquare
} from "lucide-react";
import type { InterviewEvaluation } from "../types";

interface InterviewScorecardModalProps {
  evaluation: InterviewEvaluation | null;
  onClose: () => void;
}

export const InterviewScorecardModal: React.FC<InterviewScorecardModalProps> = ({
  evaluation,
  onClose,
}) => {
  if (!evaluation) return null;

  const getRecommendationBadge = (rec: InterviewEvaluation["recommendation"]) => {
    switch (rec) {
      case "Strong Hire":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/20";
      case "Hire":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-cyan-500/20";
      case "Consider":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-500/20";
      case "Do Not Hire":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-rose-500/20";
    }
  };

  const categories = [
    {
      label: "Technical Competence & Architecture",
      score: evaluation.categoryScores.technical,
      desc: "Depth of engineering expertise, asynchronous event loops, system design",
    },
    {
      label: "Problem Solving & Trade-offs",
      score: evaluation.categoryScores.problemSolving,
      desc: "Analytical reasoning, fault tolerance, and pragmatic judgment",
    },
    {
      label: "Communication & Articulation",
      score: evaluation.categoryScores.communication,
      desc: "Concise clarity, listening skills, and structured explanation",
    },
    {
      label: "Cultural & Behavioral Fit",
      score: evaluation.categoryScores.culturalFit,
      desc: "Ownership mindset, mentoring inclination, and team empathy",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#0e1626] border border-white/[0.12] rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl space-y-6 text-slate-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Award className="w-6 h-6 text-purple-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  Hire-AI Autonomous Scorecard
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {new Date(evaluation.evaluatedAt).toLocaleDateString()}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white font-['Space_Grotesk'] mt-1">
                {evaluation.candidateName}
              </h2>
              <p className="text-xs text-cyan-300">{evaluation.jobTitle}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.08]"
              title="Print Scorecard"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Overall Score & Recommendation Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-gradient-to-br from-[#070b14] to-[#0d1627] border border-white/[0.08]">
          <div className="flex flex-col items-center justify-center text-center sm:border-r border-white/[0.08] sm:pr-4">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Overall Hire-AI Index
            </span>
            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-4xl font-extrabold text-white font-['Space_Grotesk']">
                {evaluation.overallScore}
              </span>
              <span className="text-sm font-mono text-cyan-400">/ 100</span>
            </div>
            <span className="text-[10px] text-cyan-300 mt-1 font-mono">Gemini 3.8 Evaluated</span>
          </div>

          <div className="sm:col-span-2 flex flex-col justify-center sm:pl-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Hiring Committee Recommendation
            </span>
            <div className="mt-1 flex items-center space-x-3">
              <span
                className={`px-3.5 py-1 rounded-xl font-bold font-['Space_Grotesk'] text-sm tracking-wide border shadow-md ${getRecommendationBadge(
                  evaluation.recommendation
                )}`}
              >
                {evaluation.recommendation}
              </span>
              <span className="text-xs text-slate-300 leading-snug">
                Qualifies for immediate advancement in recruitment workflow.
              </span>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-[#070b14] p-4 rounded-xl border border-white/[0.08] space-y-1">
          <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Executive Hiring Summary
          </span>
          <p className="text-xs text-slate-200 leading-relaxed">{evaluation.summaryNotes}</p>
        </div>

        {/* Category Dimension Scores */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider block">
            Core Evaluation Competency Dimensions
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.map((cat, i) => (
              <div key={i} className="bg-[#070b14] p-3.5 rounded-xl border border-white/[0.06] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">{cat.label}</span>
                  <span className="font-mono font-bold text-cyan-300">{cat.score}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/[0.08] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                    style={{ width: `${cat.score}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Improvement Areas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#070b14] p-4 rounded-xl border border-white/[0.08] space-y-2">
            <span className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Key Strengths Observed
            </span>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {evaluation.strengths.map((s, idx) => (
                <li key={idx} className="flex items-start space-x-1.5">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#070b14] p-4 rounded-xl border border-white/[0.08] space-y-2">
            <span className="text-xs font-bold text-amber-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              Growth Opportunities / Follow-ups
            </span>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {evaluation.areasForImprovement.map((area, idx) => (
                <li key={idx} className="flex items-start space-x-1.5">
                  <span className="text-amber-400 mt-0.5">•</span>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Interview Transcript Log */}
        {evaluation.transcript && evaluation.transcript.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-white/[0.06]">
            <span className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider block">
              Audited Conversation Transcript ({evaluation.transcript.length} turns)
            </span>
            <div className="space-y-2 max-h-48 overflow-y-auto p-3 rounded-xl bg-[#070b14] border border-white/[0.06] text-xs">
              {evaluation.transcript.map((t, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex items-center space-x-2 text-[10px] font-mono">
                    <span
                      className={
                        t.speaker === "agent" ? "text-cyan-400 font-bold" : "text-purple-400 font-bold"
                      }
                    >
                      {t.speaker === "agent" ? "Interviewer Alex" : evaluation.candidateName}
                    </span>
                    <span className="text-slate-500">[{t.timestamp || "00:00"}]</span>
                  </div>
                  <p className="text-slate-300 pl-2 border-l border-white/[0.08]">{t.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/[0.08]">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
          >
            Close Scorecard
          </button>
        </div>
      </div>
    </div>
  );
};
