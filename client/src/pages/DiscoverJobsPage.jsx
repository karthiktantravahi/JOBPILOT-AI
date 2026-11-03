import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  RefreshCw,
  MapPin,
  Building2,
  DollarSign,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  X,
  Bookmark,
  Sparkles,
} from 'lucide-react';
import { jobService } from '../services/jobService';
import { applicationService } from '../services/applicationService';
import { JobCard } from '../components/JobCard';
import { JobModal } from '../components/JobModal';
import { useAuth } from '../context/AuthContext';

export const DiscoverJobsPage = () => {
  const { isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [savedJobIds, setSavedJobIds] = useState(new Set());

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [workMode, setWorkMode] = useState('all');
  const [employmentType, setEmploymentType] = useState('all');
  const [experienceLevel, setExperienceLevel] = useState('all');
  const [source, setSource] = useState('all');
  const [minSalary, setMinSalary] = useState('');
  const [minScore, setMinScore] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: 18,
          q: debouncedQuery || undefined,
          workMode: workMode !== 'all' ? workMode : undefined,
          employmentType: employmentType !== 'all' ? employmentType : undefined,
          experienceLevel: experienceLevel !== 'all' ? experienceLevel : undefined,
          source: source !== 'all' ? source : undefined,
          minSalary: minSalary ? parseInt(minSalary, 10) : undefined,
        };

        const res = await jobService.getJobs(params);
        if (res.success) {
          let list = res.data || [];
          if (minScore > 0) {
            list = list.filter((j) => (j.match?.matchPercentage || 0) >= minScore);
          }
          setJobs(list);
          setTotalCount(res.pagination?.total || list.length);
          setTotalPages(res.pagination?.totalPages || 1);
        }
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [currentPage, debouncedQuery, workMode, employmentType, experienceLevel, source, minSalary, minScore]);

  // Save job to Application Tracker
  const handleSaveJob = async (job) => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

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
      // Update local job state
      setJobs((prev) =>
        prev.map((j) => (j._id === job._id ? { ...j, applicationStatus: 'SAVED' } : j))
      );
    } catch (err) {
      console.warn('Could not save application:', err.message);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setWorkMode('all');
    setEmploymentType('all');
    setExperienceLevel('all');
    setSource('all');
    setMinSalary('');
    setMinScore(0);
    setCurrentPage(1);
  };

  const hasActiveFilters =
    workMode !== 'all' ||
    employmentType !== 'all' ||
    experienceLevel !== 'all' ||
    source !== 'all' ||
    minSalary !== '' ||
    minScore > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content flex items-center gap-2.5">
            <Briefcase className="w-7 h-7 text-primary" />
            Discover Live Opportunities
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            Real jobs ingested from Greenhouse, Lever, Remotive, and European tech boards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn btn-sm ${
              hasActiveFilters ? 'btn-primary' : 'btn-outline'
            } gap-2`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters {hasActiveFilters && '• Active'}
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-4 top-3.5 text-base-content/40" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search roles by title (e.g. Frontend, DevOps), tech skill (React, Python), or company..."
          className="input input-bordered w-full pl-12 pr-10 text-sm shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-3 btn btn-ghost btn-circle btn-xs"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Advanced Filters Drawer / Section */}
      {showFilters && (
        <div className="p-5 rounded-2xl bg-base-200/80 border border-base-300 space-y-4 text-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-base-content flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-primary" /> Advanced Filters
            </span>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="btn btn-ghost btn-xs text-error hover:bg-error/10"
              >
                Clear All Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Work Mode */}
            <div>
              <label className="label py-1 font-semibold text-base-content/70">Work Mode</label>
              <select
                value={workMode}
                onChange={(e) => {
                  setWorkMode(e.target.value);
                  setCurrentPage(1);
                }}
                className="select select-bordered select-sm w-full"
              >
                <option value="all">All Modes</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
              </select>
            </div>

            {/* Employment Type */}
            <div>
              <label className="label py-1 font-semibold text-base-content/70">Employment</label>
              <select
                value={employmentType}
                onChange={(e) => {
                  setEmploymentType(e.target.value);
                  setCurrentPage(1);
                }}
                className="select select-bordered select-sm w-full"
              >
                <option value="all">All Types</option>
                <option value="full-time">Full-time</option>
                <option value="contract">Contract</option>
                <option value="part-time">Part-time</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            {/* Experience Level */}
            <div>
              <label className="label py-1 font-semibold text-base-content/70">Experience</label>
              <select
                value={experienceLevel}
                onChange={(e) => {
                  setExperienceLevel(e.target.value);
                  setCurrentPage(1);
                }}
                className="select select-bordered select-sm w-full"
              >
                <option value="all">All Levels</option>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead / Director</option>
              </select>
            </div>

            {/* Job Source */}
            <div>
              <label className="label py-1 font-semibold text-base-content/70">Job Source</label>
              <select
                value={source}
                onChange={(e) => {
                  setSource(e.target.value);
                  setCurrentPage(1);
                }}
                className="select select-bordered select-sm w-full"
              >
                <option value="all">All Sources</option>
                <option value="Greenhouse">Greenhouse</option>
                <option value="Lever">Lever</option>
                <option value="Remotive">Remotive</option>
                <option value="Arbeitnow">Arbeitnow</option>
              </select>
            </div>

            {/* Minimum Salary */}
            <div>
              <label className="label py-1 font-semibold text-base-content/70">Min Salary ($)</label>
              <input
                type="number"
                placeholder="e.g. 100000"
                value={minSalary}
                onChange={(e) => {
                  setMinSalary(e.target.value);
                  setCurrentPage(1);
                }}
                className="input input-bordered input-sm w-full"
              />
            </div>

            {/* Minimum AI Match Score */}
            {isAuthenticated && (
              <div>
                <label className="label py-1 font-semibold text-base-content/70 flex justify-between">
                  <span>Min AI Match</span>
                  <span className="text-primary font-bold">{minScore}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="5"
                  value={minScore}
                  onChange={(e) => setMinScore(parseInt(e.target.value, 10))}
                  className="range range-primary range-xs mt-1"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-base-content/60 px-1">
        <span>
          Showing <strong>{jobs.length}</strong> of <strong>{totalCount}</strong> verified postings
        </span>
        {isAuthenticated && (
          <span className="text-primary font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> AI match scores evaluated in real time
          </span>
        )}
      </div>

      {/* Job Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card bg-base-200 h-64 animate-pulse p-5"></div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="card bg-base-100 border border-base-300 p-12 text-center space-y-3">
          <Briefcase className="w-12 h-12 text-base-content/30 mx-auto" />
          <h3 className="font-bold text-base text-base-content">No postings matched your criteria</h3>
          <p className="text-xs text-base-content/60 max-w-sm mx-auto">
            Try adjusting your search terms, removing filters, or clearing the minimum salary filter.
          </p>
          <button onClick={handleClearFilters} className="btn btn-outline btn-sm mx-auto">
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
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
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="btn btn-outline btn-sm gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <span className="text-xs font-semibold px-3 py-1 bg-base-200 rounded-lg">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="btn btn-outline btn-sm gap-1"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Full Job Modal */}
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
