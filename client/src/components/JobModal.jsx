import React, { useState } from 'react';
import {
  X,
  Building,
  MapPin,
  DollarSign,
  Clock,
  ExternalLink,
  Bookmark,
  Check,
  Share2,
  Sparkles,
} from 'lucide-react';
import { formatSalary, formatDate, getScoreBadgeClass, getStatusBadgeClass } from '../utils/formatters';
import { MatchExplanationModal } from './MatchExplanationModal';

export const JobModal = ({
  job,
  isOpen,
  onClose,
  onSaveJob,
  onUpdateStatus,
  isSaved,
  applicationStatus,
}) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !job) return null;

  const handleShare = () => {
    navigator.clipboard.writeText(job.originalUrl || window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="modal modal-open z-40">
        <div className="modal-box max-w-3xl bg-base-100 border border-base-300 shadow-2xl p-6 sm:p-8 max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-base-300">
            <div className="flex-1 pr-4">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="badge badge-neutral text-xs font-medium">
                  {job.source || 'Public Feed'}
                </span>
                <span className="badge badge-outline text-xs capitalize">
                  {job.workMode || 'Remote'}
                </span>
                <span className="badge badge-outline text-xs capitalize">
                  {job.employmentType || 'Full-time'}
                </span>
                {applicationStatus && (
                  <span className={`badge ${getStatusBadgeClass(applicationStatus)} text-xs`}>
                    Status: {applicationStatus}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-base-content leading-snug">
                {job.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs sm:text-sm text-base-content/70">
                <span className="flex items-center gap-1.5 font-medium text-base-content">
                  <Building className="w-4 h-4 text-primary" />
                  {job.company}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-base-content/50" />
                  {job.location || 'Remote'}
                </span>
                <span className="flex items-center gap-1.5 font-medium text-emerald-500">
                  <DollarSign className="w-4 h-4" />
                  {formatSalary(job.salary)}
                </span>
                <span className="flex items-center gap-1.5 text-base-content/50">
                  <Clock className="w-4 h-4" />
                  Posted {formatDate(job.postedDate)}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* AI Match Banner (if scored) */}
          {job.match && (
            <div
              onClick={() => setShowExplanation(true)}
              className="mt-4 p-3.5 rounded-xl bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/5 border border-primary/20 flex items-center justify-between cursor-pointer hover:border-primary/40 transition-all shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20 text-primary">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-base-content">
                      AI Match Assessment:
                    </span>
                    <span className={`badge ${getScoreBadgeClass(job.match.matchPercentage)}`}>
                      {job.match.matchPercentage}%
                    </span>
                  </div>
                  <p className="text-xs text-base-content/70 mt-0.5">
                    {job.match.reasons?.[0] || 'Click to view complete scoring criteria'}
                  </p>
                </div>
              </div>
              <button className="btn btn-xs btn-outline btn-primary shrink-0 ml-2">
                Explain Score
              </button>
            </div>
          )}

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto py-5 space-y-6 pr-2">
            {/* Required Skills */}
            {job.skills && job.skills.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/60 mb-2.5">
                  Key Technologies & Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => {
                    const isMatched = job.match?.matchedSkills?.includes(skill.toLowerCase());
                    return (
                      <span
                        key={index}
                        className={`badge ${
                          isMatched ? 'badge-primary' : 'badge-ghost'
                        } badge-sm py-2.5 px-3 text-xs`}
                      >
                        {skill}
                        {isMatched && ' ✓'}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/60 mb-2.5">
                Job Overview & Requirements
              </h3>
              <div
                className="prose prose-sm max-w-none text-base-content/80 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: job.description.replace(/\n/g, '<br/>'),
                }}
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-base-300 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSaveJob(job)}
                className={`btn btn-sm ${
                  isSaved ? 'btn-success text-white' : 'btn-outline'
                } gap-2`}
              >
                <Bookmark className="w-4 h-4" />
                {isSaved ? 'Saved in Tracker' : 'Save to Tracker'}
              </button>
              <button onClick={handleShare} className="btn btn-ghost btn-sm btn-circle" title="Copy Job Link">
                {copied ? <Check className="w-4 h-4 text-success" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={job.applyUrl || job.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-primary gap-2 shadow-md shadow-primary/20"
              >
                Apply on Official Board
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
        <div className="modal-backdrop" onClick={onClose}></div>
      </div>

      {/* Score Explanation Modal */}
      <MatchExplanationModal
        isOpen={showExplanation}
        onClose={() => setShowExplanation(false)}
        match={job.match}
        jobTitle={job.title}
        company={job.company}
      />
    </>
  );
};
