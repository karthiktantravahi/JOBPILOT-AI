import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Sliders,
  Briefcase,
  AlertCircle,
  FileText,
  User,
  Filter,
} from 'lucide-react';
import { jobService } from '../services/jobService';
import { applicationService } from '../services/applicationService';
import { JobCard } from '../components/JobCard';
import { JobModal } from '../components/JobModal';
import { useAuth } from '../context/AuthContext';

export const RecommendedJobsPage = () => {
  const { user } = useAuth();
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [minScore, setMinScore] = useState(40);
  const [savedJobIds, setSavedJobIds] = useState(new Set());

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      try {
        const res = await jobService.getRecommendedJobs({ minScore });
        if (res.success) {
          setRecommendedJobs(res.data || []);
        }
      } catch (err) {
        console.error('Failed to load recommended jobs:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [minScore]);

  const handleSaveJob = async (job) => {
    try {
      await applicationService.createApplication({
        jobId: job._id,
        company: job.company,
        jobTitle: job.title,
        location: job.location,
        workMode: job.workMode,
        salary: job.salary?.raw || '',
        originalUrl: job.originalUrl,
        source: job.source,
        status: 'SAVED',
      });
      setSavedJobIds((prev) => new Set([...prev, job._id]));
      setRecommendedJobs((prev) =>
        prev.map((j) => (j._id === job._id ? { ...j, applicationStatus: 'SAVED' } : j))
      );
    } catch (err) {
      console.warn('Save application error:', err.message);
    }
  };

  const userSkills = user?.profile?.skills || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            AI Match Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content">
            Your Tailored Recommendations
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            Jobs dynamically evaluated against your uploaded resume, skills, and work preferences.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/settings" className="btn btn-outline btn-sm gap-2">
            <Sliders className="w-4 h-4 text-primary" />
            Tweak Weights
          </Link>
          <Link to="/profile" className="btn btn-ghost btn-sm gap-2">
            <User className="w-4 h-4" />
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Threshold and Quick Skills Banner */}
      <div className="card bg-base-200/70 border border-base-300 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="space-y-1.5">
          <span className="font-semibold text-base-content/80 flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-primary" /> Minimum Match Threshold:
            <strong className="text-primary text-sm font-bold">{minScore}%</strong>
          </span>
          <p className="text-[11px] text-base-content/60">
            Only showing opportunities that meet or exceed this compatibility score.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-64">
          <span className="text-[11px] text-base-content/50">20%</span>
          <input
            type="range"
            min="20"
            max="85"
            step="5"
            value={minScore}
            onChange={(e) => setMinScore(parseInt(e.target.value, 10))}
            className="range range-primary range-xs flex-1"
          />
          <span className="text-[11px] text-base-content/50">85%</span>
        </div>
      </div>

      {/* Profile Notice if no skills */}
      {userSkills.length === 0 && (
        <div className="alert alert-warning text-xs py-3 flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">No skills configured in your profile yet!</p>
            <p className="text-[11px] mt-0.5">
              Upload your resume or add your tech stack in your profile to unlock high-accuracy AI matching.
            </p>
          </div>
          <Link to="/resume" className="btn btn-xs btn-primary gap-1 shrink-0">
            <FileText className="w-3.5 h-3.5" /> Upload Resume
          </Link>
        </div>
      )}

      {/* Job Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card bg-base-200 h-64 animate-pulse p-5"></div>
          ))}
        </div>
      ) : recommendedJobs.length === 0 ? (
        <div className="card bg-base-100 border border-base-300 p-12 text-center space-y-4">
          <Sparkles className="w-12 h-12 text-primary/30 mx-auto" />
          <h3 className="font-bold text-base text-base-content">
            No roles reached the {minScore}% match threshold
          </h3>
          <p className="text-xs text-base-content/60 max-w-sm mx-auto">
            Try lowering the slider threshold above, or update your profile skills and preferred titles.
          </p>
          <button onClick={() => setMinScore(20)} className="btn btn-outline btn-sm mx-auto">
            Lower Threshold to 20%
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs text-base-content/60">
            Displaying <strong>{recommendedJobs.length}</strong> top matching roles ordered by relevance.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedJobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                onSelect={(j) => setSelectedJob(j)}
                onSave={handleSaveJob}
                isSaved={savedJobIds.has(job._id) || job.applicationStatus === 'SAVED'}
                applicationStatus={job.applicationStatus}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      <JobModal
        job={selectedJob}
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        onSaveJob={handleSaveJob}
        isSaved={selectedJob && (savedJobIds.has(selectedJob._id) || selectedJob.applicationStatus === 'SAVED')}
        applicationStatus={selectedJob?.applicationStatus}
      />
    </div>
  );
};
