import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  DollarSign,
  Clock,
  Bookmark,
  ExternalLink,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import {
  formatSalary,
  timeAgo,
  getScoreBadgeClass,
  getStatusBadgeClass,
} from '../utils/formatters';
import { MatchExplanationModal } from './MatchExplanationModal';

export const JobCard = ({
  job,
  onSelect,
  onSave,
  isSaved = false,
  applicationStatus = null,
}) => {
  const [showExplanation, setShowExplanation] = useState(false);

  const match = job.match;

  const handleScoreClick = (e) => {
    e.stopPropagation();
    if (match) {
      setShowExplanation(true);
    }
  };

  const handleSaveClick = (e) => {
    e.stopPropagation();
    onSave?.(job);
  };

  const handleApplyClick = (e) => {
    e.stopPropagation();
  };

  return (
    <>
      <div
        onClick={() => onSelect?.(job)}
        className="card bg-base-100 hover:bg-base-200/50 border border-base-300 hover:border-primary/40 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer p-5 flex flex-col justify-between group"
      >
        <div>
          {/* Top Row: Company, Badges, Match Score */}
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-base-200 border border-base-300 flex items-center justify-center font-bold text-sm text-primary shrink-0 uppercase shadow-inner">
                {job.company ? job.company.slice(0, 2) : 'JP'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-base-content/70 truncate flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-base-content/50" />
                  {job.company}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="badge badge-neutral badge-xs font-medium text-[10px]">
                    {job.source || 'Public Feed'}
                  </span>
                  <span className="text-[11px] text-base-content/50">
                    {timeAgo(job.postedDate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Match score badge */}
            {match ? (
              <button
                onClick={handleScoreClick}
                className={`badge ${getScoreBadgeClass(
                  match.matchPercentage
                )} badge-md py-3 px-2.5 gap-1 shadow-sm hover:scale-105 transition-transform`}
                title="Click for AI scoring breakdown"
              >
                <Sparkles className="w-3 h-3" />
                <span>{match.matchPercentage}%</span>
              </button>
            ) : (
              <span className="badge badge-ghost badge-sm text-[11px] text-base-content/60">
                {job.experienceLevel || 'All levels'}
              </span>
            )}
          </div>

          {/* Job Title */}
          <h3 className="font-bold text-base text-base-content group-hover:text-primary transition-colors line-clamp-2 mb-2">
            {job.title}
          </h3>

          {/* Location & Salary */}
          <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3 text-xs text-base-content/70 mb-3">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-base-content/50 shrink-0" />
              <span className="truncate max-w-[150px]">{job.location || 'Remote'}</span>
            </span>

            <span className="badge badge-outline badge-xs capitalize">
              {job.workMode || 'remote'}
            </span>

            {job.salary && job.salary.hasSalary && (
              <span className="flex items-center gap-1 text-emerald-500 font-medium">
                <DollarSign className="w-3.5 h-3.5 shrink-0" />
                <span>{formatSalary(job.salary)}</span>
              </span>
            )}
          </div>

          {/* Snippet */}
          <p className="text-xs text-base-content/60 line-clamp-2 mb-4 leading-relaxed">
            {job.descriptionSnippet || job.description?.replace(/<[^>]+>/g, '').slice(0, 140) + '...'}
          </p>

          {/* Skill chips */}
          {job.skills && job.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {job.skills.slice(0, 4).map((skill, idx) => {
                const isMatched = match?.matchedSkills?.includes(skill.toLowerCase());
                return (
                  <span
                    key={idx}
                    className={`badge badge-xs text-[10px] py-2 px-2 ${
                      isMatched
                        ? 'badge-primary badge-outline font-medium'
                        : 'badge-ghost text-base-content/70'
                    }`}
                  >
                    {skill}
                  </span>
                );
              })}
              {job.skills.length > 4 && (
                <span className="text-[10px] text-base-content/50 self-center">
                  +{job.skills.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Card Footer: Save Button & Apply Link */}
        <div className="pt-3 border-t border-base-300/70 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveClick}
              className={`btn btn-xs ${
                isSaved || applicationStatus
                  ? 'btn-success text-white'
                  : 'btn-outline border-base-300 hover:border-primary'
              } gap-1.5`}
              title={isSaved ? 'In your application tracker' : 'Save to Application Tracker'}
            >
              <Bookmark className="w-3 h-3" />
              <span>
                {applicationStatus ? applicationStatus : isSaved ? 'Saved' : 'Save'}
              </span>
            </button>
          </div>

          <a
            href={job.applyUrl || job.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleApplyClick}
            className="btn btn-xs btn-primary gap-1 shadow-sm"
          >
            <span>Apply</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Explainable Modal */}
      {match && (
        <MatchExplanationModal
          isOpen={showExplanation}
          onClose={() => setShowExplanation(false)}
          match={match}
          jobTitle={job.title}
          company={job.company}
        />
      )}
    </>
  );
};
