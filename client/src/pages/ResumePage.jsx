import React, { useEffect, useState } from 'react';
import { FileText, Sparkles, CheckCircle2, ShieldAlert, UserCheck } from 'lucide-react';
import { ResumeUploader } from '../components/ResumeUploader';
import { resumeService } from '../services/extraServices';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/formatters';

export const ResumePage = () => {
  const { user, updateUserProfile } = useAuth();
  const [currentResume, setCurrentResume] = useState(null);

  useEffect(() => {
    const fetchCurrentResume = async () => {
      try {
        const res = await resumeService.getResume();
        if (res.success && res.resume) {
          setCurrentResume(res.resume);
        }
      } catch (err) {
        console.warn('Could not load current resume metadata:', err);
      }
    };
    fetchCurrentResume();
  }, []);

  const handleProfileUpdated = (updatedUser) => {
    if (updatedUser) {
      updateUserProfile(updatedUser);
      if (updatedUser.profile?.resume) {
        setCurrentResume(updatedUser.profile.resume);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Resume Intelligence
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content flex items-center gap-2.5">
          <FileText className="w-7 h-7 text-primary" />
          Resume Parsing & Extraction
        </h1>
        <p className="text-xs sm:text-sm text-base-content/60 mt-1">
          Upload your resume in PDF format. Extract your skills, education, and career milestones with full review control.
        </p>
      </div>

      {/* Current Active Resume Status (if uploaded previously) */}
      {currentResume && (
        <div className="card bg-base-200/70 border border-base-300 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-base-content">
                Active Resume: {currentResume.originalName || 'resume.pdf'}
              </p>
              <p className="text-[11px] text-base-content/60 mt-0.5">
                Last synchronized: {formatDate(currentResume.uploadedAt)}
              </p>
            </div>
          </div>
          <span className="badge badge-success text-white text-xs font-semibold">
            Parsed & Verified
          </span>
        </div>
      )}

      {/* Resume Uploader & Extraction Review */}
      <ResumeUploader onProfileUpdated={handleProfileUpdated} />
    </div>
  );
};
