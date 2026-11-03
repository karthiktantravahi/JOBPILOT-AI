import React from 'react';
import { X, CheckCircle2, AlertCircle, Sparkles, Sliders, Info, Briefcase, MapPin, DollarSign, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getScoreBadgeClass } from '../utils/formatters';

export const MatchExplanationModal = ({ isOpen, onClose, match, jobTitle, company }) => {
  if (!isOpen || !match) return null;

  const { matchPercentage, matchedSkills = [], missingSkills = [], scoreBreakdown = {}, reasons = [], weights = {} } = match;

  return (
    <div className="modal modal-open z-50">
      <div className="modal-box max-w-2xl bg-base-100 border border-base-300 shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-base-300">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-base-content flex items-center gap-2">
                AI Match Score Breakdown
                <span className={`badge ${getScoreBadgeClass(matchPercentage)}`}>
                  {matchPercentage}% Match
                </span>
              </h3>
              <p className="text-xs text-base-content/70">
                Evaluation for <strong className="text-base-content">{jobTitle}</strong> at <strong>{company}</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Explainable Metric Bars */}
        <div className="py-4 space-y-3.5">
          <div className="flex items-center justify-between text-xs font-semibold text-base-content/80">
            <span>Weighted Scoring Dimensions</span>
            <Link to="/settings" className="text-primary hover:underline flex items-center gap-1 text-[11px]">
              <Sliders className="w-3 h-3" /> Customize Weights
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Skills */}
            <div className="p-3 rounded-lg bg-base-200 border border-base-300">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                  Skills ({Math.round((weights.skills || 0.35) * 100)}%)
                </span>
                <span className="font-bold text-base-content">{scoreBreakdown.skills ?? 50}%</span>
              </div>
              <progress
                className="progress progress-primary w-full h-1.5"
                value={scoreBreakdown.skills ?? 50}
                max="100"
              ></progress>
            </div>

            {/* Experience */}
            <div className="p-3 rounded-lg bg-base-200 border border-base-300">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Experience ({Math.round((weights.experience || 0.20) * 100)}%)
                </span>
                <span className="font-bold text-base-content">{scoreBreakdown.experience ?? 70}%</span>
              </div>
              <progress
                className="progress progress-success w-full h-1.5"
                value={scoreBreakdown.experience ?? 70}
                max="100"
              ></progress>
            </div>

            {/* Title Similarity */}
            <div className="p-3 rounded-lg bg-base-200 border border-base-300">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Role Fit ({Math.round((weights.title || 0.15) * 100)}%)
                </span>
                <span className="font-bold text-base-content">{scoreBreakdown.title ?? 40}%</span>
              </div>
              <progress
                className="progress progress-secondary w-full h-1.5"
                value={scoreBreakdown.title ?? 40}
                max="100"
              ></progress>
            </div>

            {/* Education */}
            <div className="p-3 rounded-lg bg-base-200 border border-base-300">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                  Education ({Math.round((weights.education || 0.10) * 100)}%)
                </span>
                <span className="font-bold text-base-content">{scoreBreakdown.education ?? 80}%</span>
              </div>
              <progress
                className="progress progress-accent w-full h-1.5"
                value={scoreBreakdown.education ?? 80}
                max="100"
              ></progress>
            </div>

            {/* Location / Work Mode */}
            <div className="p-3 rounded-lg bg-base-200 border border-base-300">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  Location ({Math.round((weights.location || 0.10) * 100)}%)
                </span>
                <span className="font-bold text-base-content">{scoreBreakdown.location ?? 60}%</span>
              </div>
              <progress
                className="progress progress-warning w-full h-1.5"
                value={scoreBreakdown.location ?? 60}
                max="100"
              ></progress>
            </div>

            {/* Salary */}
            <div className="p-3 rounded-lg bg-base-200 border border-base-300">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                  Salary ({Math.round((weights.salary || 0.05) * 100)}%)
                </span>
                <span className="font-bold text-base-content">{scoreBreakdown.salary ?? 70}%</span>
              </div>
              <progress
                className="progress progress-info w-full h-1.5"
                value={scoreBreakdown.salary ?? 70}
                max="100"
              ></progress>
            </div>
          </div>

          {/* Skill Breakdown Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-lg bg-base-200/70 border border-base-300">
              <h4 className="text-xs font-semibold text-emerald-500 flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" /> Matched Skills ({matchedSkills.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {matchedSkills.length > 0 ? (
                  matchedSkills.map((s, idx) => (
                    <span key={idx} className="badge badge-success badge-sm text-[11px] text-white">
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-base-content/50 italic">No direct skill matches</span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-base-200/70 border border-base-300">
              <h4 className="text-xs font-semibold text-amber-500 flex items-center gap-1.5 mb-2">
                <AlertCircle className="w-3.5 h-3.5" /> Missing / Unlisted Skills ({missingSkills.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {missingSkills.length > 0 ? (
                  missingSkills.map((s, idx) => (
                    <span key={idx} className="badge badge-ghost badge-sm text-[11px]">
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-base-content/50 italic">All key skills matched!</span>
                )}
              </div>
            </div>
          </div>

          {/* Explainable Rationale */}
          {reasons.length > 0 && (
            <div className="p-3.5 rounded-lg bg-primary/5 border border-primary/20 mt-3">
              <h4 className="text-xs font-semibold text-primary flex items-center gap-1.5 mb-2">
                <Info className="w-4 h-4" /> Why this score?
              </h4>
              <ul className="space-y-1.5 text-xs text-base-content/80">
                {reasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary font-bold mt-0.5">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-action border-t border-base-300 pt-3 mt-2">
          <button onClick={onClose} className="btn btn-sm btn-primary">
            Got it
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};
