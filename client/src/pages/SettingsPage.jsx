import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Database,
  Cpu,
  Layers,
  Save,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { profileService, syncService } from '../services/extraServices';
import { formatDate, timeAgo } from '../utils/formatters';

export const SettingsPage = () => {
  const { user, updateUserProfile } = useAuth();
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Match weights state
  const userWeights = user?.profile?.matchSettings?.weights || {};
  const [skillsWeight, setSkillsWeight] = useState(userWeights.skills ?? 0.35);
  const [experienceWeight, setExperienceWeight] = useState(userWeights.experience ?? 0.20);
  const [titleWeight, setTitleWeight] = useState(userWeights.title ?? 0.15);
  const [educationWeight, setEducationWeight] = useState(userWeights.education ?? 0.10);
  const [locationWeight, setLocationWeight] = useState(userWeights.location ?? 0.10);
  const [employmentTypeWeight, setEmploymentTypeWeight] = useState(userWeights.employmentType ?? 0.05);
  const [salaryWeight, setSalaryWeight] = useState(userWeights.salary ?? 0.05);

  const [minScore, setMinScore] = useState(user?.profile?.matchSettings?.minScore ?? 40);
  const [enableAI, setEnableAI] = useState(user?.profile?.matchSettings?.enableAI ?? true);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state
  const [syncStatus, setSyncStatus] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState(null);

  useEffect(() => {
    const fetchSync = async () => {
      try {
        const res = await syncService.getStatus();
        if (res.success) {
          setSyncStatus(res.data);
        }
      } catch (err) {
        console.warn('Could not load sync status:', err);
      }
    };
    fetchSync();
  }, []);

  const totalRawWeight =
    skillsWeight +
    experienceWeight +
    titleWeight +
    educationWeight +
    locationWeight +
    employmentTypeWeight +
    salaryWeight;

  const toPercent = (val) => Math.round((val / (totalRawWeight || 1)) * 100);

  const applyPreset = (preset) => {
    if (preset === 'balanced') {
      setSkillsWeight(0.35);
      setExperienceWeight(0.20);
      setTitleWeight(0.15);
      setEducationWeight(0.10);
      setLocationWeight(0.10);
      setEmploymentTypeWeight(0.05);
      setSalaryWeight(0.05);
    } else if (preset === 'skills_first') {
      setSkillsWeight(0.55);
      setExperienceWeight(0.15);
      setTitleWeight(0.15);
      setEducationWeight(0.05);
      setLocationWeight(0.05);
      setEmploymentTypeWeight(0.025);
      setSalaryWeight(0.025);
    } else if (preset === 'remote_first') {
      setSkillsWeight(0.30);
      setExperienceWeight(0.15);
      setTitleWeight(0.10);
      setEducationWeight(0.05);
      setLocationWeight(0.30);
      setEmploymentTypeWeight(0.05);
      setSalaryWeight(0.05);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const payload = {
        weights: {
          skills: skillsWeight,
          experience: experienceWeight,
          title: titleWeight,
          education: educationWeight,
          location: locationWeight,
          employmentType: employmentTypeWeight,
          salary: salaryWeight,
        },
        minScore,
        enableAI,
      };

      const res = await profileService.updateMatchSettings(payload);
      if (res.success) {
        setSuccessMsg('Matching settings updated successfully.');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await syncService.triggerSync('all');
      if (res.success) {
        setSyncFeedback(`Successfully synchronized! Added ${res.data.totalNewJobs} new live postings.`);
        // Refresh status
        const statusRes = await syncService.getStatus();
        if (statusRes.success) setSyncStatus(statusRes.data);
      }
    } catch (err) {
      setSyncFeedback(`Sync failed: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content flex items-center gap-2.5">
          <Sliders className="w-7 h-7 text-primary" />
          AI Match Engine & Platform Settings
        </h1>
        <p className="text-xs sm:text-sm text-base-content/60 mt-1">
          Customize matching score dimensions, toggle local inference, and trigger job synchronization.
        </p>
      </div>

      {successMsg && (
        <div className="alert alert-success text-xs py-2 shadow-sm text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-error text-xs py-2 shadow-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Matching Weights Configuration */}
      <div className="card bg-base-100 border border-base-300 shadow-sm p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-base-300">
          <div>
            <h3 className="font-bold text-base text-base-content flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> Scoring Dimension Weights
            </h3>
            <p className="text-xs text-base-content/60 mt-0.5">
              Adjust how much emphasis each factor contributes to your overall match score.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => applyPreset('balanced')}
              className="btn btn-xs btn-outline"
            >
              Default
            </button>
            <button
              onClick={() => applyPreset('skills_first')}
              className="btn btn-xs btn-outline"
            >
              Skills-First
            </button>
            <button
              onClick={() => applyPreset('remote_first')}
              className="btn btn-xs btn-outline"
            >
              Location-First
            </button>
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-4 text-xs">
          {/* Skills */}
          <div className="space-y-1">
            <div className="flex justify-between font-semibold">
              <span>Technical Skills Match</span>
              <span className="text-primary">{toPercent(skillsWeight)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.80"
              step="0.05"
              value={skillsWeight}
              onChange={(e) => setSkillsWeight(parseFloat(e.target.value))}
              className="range range-primary range-xs"
            />
          </div>

          {/* Experience */}
          <div className="space-y-1">
            <div className="flex justify-between font-semibold">
              <span>Experience & Seniority Compatibility</span>
              <span className="text-emerald-500">{toPercent(experienceWeight)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.60"
              step="0.05"
              value={experienceWeight}
              onChange={(e) => setExperienceWeight(parseFloat(e.target.value))}
              className="range range-success range-xs"
            />
          </div>

          {/* Job Title */}
          <div className="space-y-1">
            <div className="flex justify-between font-semibold">
              <span>Role Title & Focus Fit</span>
              <span className="text-purple-400">{toPercent(titleWeight)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.50"
              step="0.05"
              value={titleWeight}
              onChange={(e) => setTitleWeight(parseFloat(e.target.value))}
              className="range range-secondary range-xs"
            />
          </div>

          {/* Education */}
          <div className="space-y-1">
            <div className="flex justify-between font-semibold">
              <span>Education & Degree Requirements</span>
              <span className="text-indigo-400">{toPercent(educationWeight)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.40"
              step="0.05"
              value={educationWeight}
              onChange={(e) => setEducationWeight(parseFloat(e.target.value))}
              className="range range-accent range-xs"
            />
          </div>

          {/* Location */}
          <div className="space-y-1">
            <div className="flex justify-between font-semibold">
              <span>Location & Remote Flexibility</span>
              <span className="text-rose-400">{toPercent(locationWeight)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.50"
              step="0.05"
              value={locationWeight}
              onChange={(e) => setLocationWeight(parseFloat(e.target.value))}
              className="range range-warning range-xs"
            />
          </div>

          {/* Employment Type */}
          <div className="space-y-1">
            <div className="flex justify-between font-semibold">
              <span>Employment Type Alignment (Full-time / Contract)</span>
              <span className="text-base-content/80">{toPercent(employmentTypeWeight)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.30"
              step="0.05"
              value={employmentTypeWeight}
              onChange={(e) => setEmploymentTypeWeight(parseFloat(e.target.value))}
              className="range range-neutral range-xs"
            />
          </div>

          {/* Salary */}
          <div className="space-y-1">
            <div className="flex justify-between font-semibold">
              <span>Compensation Compatibility</span>
              <span className="text-amber-400">{toPercent(salaryWeight)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.30"
              step="0.05"
              value={salaryWeight}
              onChange={(e) => setSalaryWeight(parseFloat(e.target.value))}
              className="range range-info range-xs"
            />
          </div>
        </div>

        {/* AI Engine Switch */}
        <div className="pt-4 border-t border-base-300 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-base-content block">
                Local AI Model Inference
              </span>
              <span className="text-base-content/60">
                When enabled, uses Transformers.js client semantic analysis. When disabled, falls back to rapid keyword overlap.
              </span>
            </div>
            <input
              type="checkbox"
              checked={enableAI}
              onChange={(e) => setEnableAI(e.target.checked)}
              className="toggle toggle-primary toggle-sm"
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-base-content block">
                Default Minimum Recommendation Score
              </span>
              <span className="text-base-content/60">
                Hide roles with score below this percentage in recommended views.
              </span>
            </div>
            <span className="badge badge-primary font-bold">{minScore}%</span>
          </div>
        </div>

        {/* Save button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="btn btn-primary btn-sm gap-2 px-6"
          >
            {isSaving ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Weight Configuration
              </>
            )}
          </button>
        </div>
      </div>

      {/* Manual Job Synchronization Panel */}
      <div className="card bg-base-100 border border-base-300 shadow-sm p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-base-300">
          <div>
            <h3 className="font-bold text-base text-base-content flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" /> Public Job Feeds & Synchronization
            </h3>
            <p className="text-xs text-base-content/60 mt-0.5">
              Status of all legitimate public job adapters and automated background ingestion.
            </p>
          </div>

          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="btn btn-primary btn-sm gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Ingesting Jobs...' : 'Trigger Full Sync Now'}
          </button>
        </div>

        {syncFeedback && (
          <div className="alert alert-info text-xs py-2 shadow-sm flex items-center gap-2">
            <span>{syncFeedback}</span>
          </div>
        )}

        {/* Adapter breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-base-200 border border-base-300">
            <span className="font-bold text-base-content block">Greenhouse</span>
            <span className="text-[11px] text-base-content/60">GitLab & Cloudflare</span>
            <span className="badge badge-success badge-xs text-white mt-2">Active</span>
          </div>
          <div className="p-3 rounded-xl bg-base-200 border border-base-300">
            <span className="font-bold text-base-content block">Lever</span>
            <span className="text-[11px] text-base-content/60">Kinsta & tech boards</span>
            <span className="badge badge-success badge-xs text-white mt-2">Active</span>
          </div>
          <div className="p-3 rounded-xl bg-base-200 border border-base-300">
            <span className="font-bold text-base-content block">Remotive</span>
            <span className="text-[11px] text-base-content/60">Worldwide Remote</span>
            <span className="badge badge-success badge-xs text-white mt-2">Active</span>
          </div>
          <div className="p-3 rounded-xl bg-base-200 border border-base-300">
            <span className="font-bold text-base-content block">Arbeitnow</span>
            <span className="text-[11px] text-base-content/60">European Tech Postings</span>
            <span className="badge badge-success badge-xs text-white mt-2">Active</span>
          </div>
        </div>

        {/* Sync logs table */}
        {syncStatus?.recentSyncs?.length > 0 && (
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-base-content/80">Recent Synchronization History</h4>
            <div className="overflow-x-auto rounded-lg border border-base-300">
              <table className="table table-xs">
                <thead>
                  <tr className="bg-base-200">
                    <th>Source</th>
                    <th>Status</th>
                    <th>Jobs Found</th>
                    <th>Jobs Added</th>
                    <th>Duration</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {syncStatus.recentSyncs.slice(0, 5).map((log) => (
                    <tr key={log._id}>
                      <td className="font-semibold">{log.source}</td>
                      <td>
                        <span
                          className={`badge badge-xs ${
                            log.status === 'SUCCESS' ? 'badge-success text-white' : 'badge-error text-white'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td>{log.jobsFound}</td>
                      <td>{log.jobsAdded}</td>
                      <td>{log.durationMs}ms</td>
                      <td className="text-base-content/60">{timeAgo(log.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
