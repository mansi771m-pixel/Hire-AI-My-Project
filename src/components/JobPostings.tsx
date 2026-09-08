import React, { useState } from "react";
import {
  Briefcase,
  Plus,
  Sparkles,
  MapPin,
  DollarSign,
  Users,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle2,
  Trash2,
  HelpCircle,
  Clock,
  Layers,
  Building,
  ArrowRight
} from "lucide-react";
import type { Job } from "../types";

interface JobPostingsProps {
  jobs: Job[];
  onCreateJob: (newJob: Omit<Job, "id" | "createdAt" | "applicantCount">) => void;
  onDeleteJob: (jobId: string) => void;
  onScreenCandidateForJob: (job: Job) => void;
}

export const JobPostings: React.FC<JobPostingsProps> = ({
  jobs,
  onCreateJob,
  onDeleteJob,
  onScreenCandidateForJob,
}) => {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(jobs[0]?.id || null);

  // Form State
  const [title, setTitle] = useState<string>("");
  const [department, setDepartment] = useState<string>("Engineering");
  const [location, setLocation] = useState<string>("San Francisco, CA (Hybrid)");
  const [type, setType] = useState<Job["type"]>("Full-time");
  const [experienceLevel, setExperienceLevel] = useState<Job["experienceLevel"]>("Senior");
  const [salaryRange, setSalaryRange] = useState<string>("$140,000 - $180,000");
  const [description, setDescription] = useState<string>("");
  const [skillsInput, setSkillsInput] = useState<string>("React, Node.js, TypeScript, MongoDB, AI Agents");
  const [requirementsInput, setRequirementsInput] = useState<string>(
    "5+ years full-stack engineering experience\nProduction Node.js & React architecture\nExperience with LLM APIs and streaming responses\nDatabase design & indexing with MongoDB"
  );
  const [presetQuestions, setPresetQuestions] = useState<string[]>([
    "Can you describe how you architect high-concurrency real-time systems using Node.js?",
    "How do you handle rate limits and streaming token latency when integrating LLMs?",
  ]);
  const [newQuestion, setNewQuestion] = useState<string>("");
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState<boolean>(false);

  // AI Question Generator for Job Openings
  const handleGenerateQuestionsWithAI = async () => {
    if (!title) {
      alert("Please enter a job title first.");
      return;
    }

    setIsGeneratingQuestions(true);
    try {
      const response = await fetch("/api/ai/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: title,
          department,
          description: description || `Screening interview for ${title} role.`,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate questions");
      const data = await response.json();
      if (Array.isArray(data.questions) && data.questions.length > 0) {
        setPresetQuestions(data.questions);
      }
    } catch (err) {
      console.error("AI question generation error:", err);
      // Fallback
      setPresetQuestions([
        `Walk me through your most complex technical project relevant to ${title}.`,
        "How do you evaluate performance bottlenecks and optimize memory usage in asynchronous code?",
        "Describe how you ensure API security, authentication tokens, and secret safety in production.",
        "How do you collaborate with product managers and mentors to ship high quality software?",
      ]);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;
    setPresetQuestions([...presetQuestions, newQuestion.trim()]);
    setNewQuestion("");
  };

  const handleRemoveQuestion = (index: number) => {
    setPresetQuestions(presetQuestions.filter((_, i) => i !== index));
  };

  const handleSubmitNewJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    const skills = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const requirements = requirementsInput
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean);

    onCreateJob({
      title,
      department,
      location,
      type,
      experienceLevel,
      salaryRange,
      description,
      requirements: requirements.length > 0 ? requirements : ["Relevant technical experience"],
      preferredSkills: skills.length > 0 ? skills : ["TypeScript", "React"],
      presetQuestions: presetQuestions.length > 0 ? presetQuestions : ["Tell me about your background."],
      status: "Active",
    });

    setShowCreateModal(false);
    // Reset
    setTitle("");
    setDescription("");
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0c1322] via-[#101b33] to-[#09101f] border border-white/[0.08] p-6 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold mb-2">
              <Briefcase className="w-3.5 h-3.5" />
              <span>ROLE DIRECTORY & QUESTION STUDIO</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Space_Grotesk']">
              Job Postings & AI Question Studio
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Manage hiring requisitions, configure technical skill profiles, and use Gemini 3.8 to generate tailored screening questions for the AI interviewer agent.
            </p>
          </div>

          <button
            id="create-new-job-btn"
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all self-start md:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Job Opening</span>
          </button>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 gap-4">
        {jobs.map((job) => {
          const isExpanded = expandedJobId === job.id;
          return (
            <div
              key={job.id}
              className="bg-[#0e1626]/90 rounded-2xl border border-white/[0.08] backdrop-blur-xl p-5 shadow-xl transition-all duration-200 hover:border-cyan-500/30"
            >
              {/* Main Card Summary */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      {job.department}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.05] text-slate-300">
                      {job.type}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.05] text-slate-300">
                      {job.experienceLevel}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                      {job.status}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-white font-['Space_Grotesk']">
                    {job.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1 text-slate-300">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      {job.salaryRange}
                    </span>
                    <span className="flex items-center gap-1 text-purple-300">
                      <Users className="w-3.5 h-3.5 text-purple-400" />
                      {job.applicantCount} Candidates
                    </span>
                  </div>
                </div>

                {/* Right Side Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => onScreenCandidateForJob(job)}
                    className="px-3.5 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Screen Candidates for Role</span>
                  </button>

                  <button
                    onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                    className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 border border-white/[0.08] transition-all cursor-pointer"
                    title={isExpanded ? "Collapse Details" : "Expand Details"}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => onDeleteJob(job.id)}
                    className="p-2 rounded-xl hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 border border-transparent transition-all cursor-pointer"
                    title="Delete Job"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-4 animate-fade-in text-xs text-slate-300">
                  <div>
                    <span className="font-bold text-slate-400 font-mono block mb-1 uppercase tracking-wider text-[11px]">
                      Role Description
                    </span>
                    <p className="leading-relaxed text-slate-300">{job.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Requirements */}
                    <div className="bg-[#070b14] p-3.5 rounded-xl border border-white/[0.06]">
                      <span className="font-bold text-cyan-300 font-mono block mb-2 uppercase tracking-wider text-[11px]">
                        Role Requirements
                      </span>
                      <ul className="space-y-1 text-slate-300">
                        {job.requirements.map((req, i) => (
                          <li key={i} className="flex items-start space-x-1.5">
                            <span className="text-cyan-400 mt-0.5">•</span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* AI Screening Questions */}
                    <div className="bg-[#070b14] p-3.5 rounded-xl border border-white/[0.06]">
                      <span className="font-bold text-purple-300 font-mono block mb-2 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5" />
                        AI Agent Preset Questions ({job.presetQuestions.length})
                      </span>
                      <ul className="space-y-1.5 text-slate-300">
                        {job.presetQuestions.map((q, i) => (
                          <li key={i} className="flex items-start space-x-1.5">
                            <span className="text-purple-400 font-mono text-[10px] mt-0.5">{i + 1}.</span>
                            <span className="italic">"{q}"</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Skills Tags */}
                  <div>
                    <span className="font-bold text-slate-400 font-mono block mb-1.5 uppercase tracking-wider text-[11px]">
                      Benchmark Stack Competencies
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {job.preferredSkills.map((skill, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-xs font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create New Job Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0e1626] border border-white/[0.12] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4 text-slate-200">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
                  Create New Job Opening
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewJob} className="space-y-4 text-xs">
              {/* Title & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 font-mono uppercase tracking-wider block mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior AI Systems Engineer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#070b14] border border-white/[0.1] text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 font-mono uppercase tracking-wider block mb-1">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#070b14] border border-white/[0.1] text-white focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product</option>
                    <option value="AI & Data Science">AI & Data Science</option>
                    <option value="Design">Design</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              </div>

              {/* Location & Salary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 font-mono uppercase tracking-wider block mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#070b14] border border-white/[0.1] text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 font-mono uppercase tracking-wider block mb-1">
                    Salary Range
                  </label>
                  <input
                    type="text"
                    value={salaryRange}
                    onChange={(e) => setSalaryRange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#070b14] border border-white/[0.1] text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 font-mono uppercase tracking-wider block mb-1">
                  Job Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe role responsibilities, mission, and architecture..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#070b14] border border-white/[0.1] text-white focus:outline-none focus:border-cyan-500/50 resize-none"
                />
              </div>

              {/* Skills */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 font-mono uppercase tracking-wider block mb-1">
                  Preferred Skills (comma separated)
                </label>
                <input
                  type="text"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#070b14] border border-white/[0.1] text-white focus:outline-none focus:border-cyan-500/50 font-mono"
                />
              </div>

              {/* AI Question Studio Generator */}
              <div className="bg-[#070b14] p-3.5 rounded-xl border border-white/[0.08] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-purple-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    AI Screening Questions
                  </span>

                  <button
                    type="button"
                    disabled={isGeneratingQuestions || !title}
                    onClick={handleGenerateQuestionsWithAI}
                    className="px-3 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-[10px] font-bold flex items-center space-x-1 transition-all"
                  >
                    {isGeneratingQuestions ? (
                      <span>Generating with Gemini...</span>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" />
                        <span>Auto-Generate with AI</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {presetQuestions.map((q, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] text-slate-300 border border-white/[0.04]"
                    >
                      <span className="italic pr-2">{q}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(i)}
                        className="text-slate-500 hover:text-rose-400 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add custom question..."
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-[#0e1626] border border-white/[0.1] text-white text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] text-white text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center space-x-1.5 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Publish Job Requisition</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
