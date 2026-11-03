import React, { useState } from 'react';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Plus,
  Trash2,
  Save,
  Check,
} from 'lucide-react';
import { resumeService } from '../services/extraServices';

export const ResumeUploader = ({ onProfileUpdated }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Editable fields for extracted data
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.type !== 'application/pdf' && !selected.name.endsWith('.pdf')) {
        setError('Please select a valid PDF document.');
        return;
      }
      if (selected.size > 5 * 1024 * 1024) {
        setError('File size exceeds the 5MB limit.');
        return;
      }
      setError(null);
      setFile(selected);
    }
  };

  const handleUploadAndParse = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await resumeService.uploadResume(formData);
      if (res.success && res.extractedData) {
        const data = res.extractedData;
        setExtractedData(data);
        setName(data.name || '');
        setPhone(data.phone || '');
        setBio(data.bio || '');
        setSkills(data.skills || []);
        setEducation(data.education || []);
        setExperience(data.experience || []);
        setProjects(data.projects || []);
        setCertifications(data.certifications || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to parse resume.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleConfirmAndSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        name,
        phone,
        bio,
        skills,
        education,
        experience,
        projects,
        certifications,
      };

      const res = await resumeService.confirmExtraction(payload);
      if (res.success) {
        setSaveSuccess(true);
        onProfileUpdated?.(res.user);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Drop Zone */}
      <div className="card bg-base-100 border border-base-300 shadow-sm p-6 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Upload className="w-7 h-7" />
          </div>

          <div>
            <h3 className="font-bold text-base text-base-content">
              Upload Your Resume (PDF)
            </h3>
            <p className="text-xs text-base-content/60 mt-1">
              Antigravity Resume Intelligence will parse your skills, work experience,
              and education using local NLP heuristics.
            </p>
          </div>

          {/* Input file button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <label className="btn btn-outline btn-sm gap-2 cursor-pointer">
              <FileText className="w-4 h-4" />
              <span>{file ? file.name : 'Choose PDF File'}</span>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <button
              onClick={handleUploadAndParse}
              disabled={!file || isUploading}
              className="btn btn-primary btn-sm gap-2"
            >
              {isUploading ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Analyzing PDF...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Parse Resume
                </>
              )}
            </button>
          </div>

          <div className="text-[11px] text-base-content/50">
            Maximum file size: 5MB • 100% Free & Private (Never leaves your server)
          </div>

          {error && (
            <div className="alert alert-error text-xs py-2 shadow-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="alert alert-success text-xs py-2 shadow-sm text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Profile successfully updated from your confirmed resume!</span>
            </div>
          )}
        </div>
      </div>

      {/* Extracted Intelligence Review Panel */}
      {extractedData && (
        <div className="card bg-base-100 border border-base-300 shadow-md p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-base-300">
            <div>
              <h3 className="font-bold text-lg text-base-content flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Review & Confirm Extracted Data
              </h3>
              <p className="text-xs text-base-content/60 mt-0.5">
                Inspect and refine the extracted fields below before updating your profile.
                Your profile will NOT be changed until you click "Confirm & Save".
              </p>
            </div>

            <button
              onClick={handleConfirmAndSave}
              disabled={isSaving}
              className="btn btn-primary btn-sm gap-2 shadow-sm"
            >
              {isSaving ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Confirm & Update My Profile
                </>
              )}
            </button>
          </div>

          {/* Basic Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="label py-1 font-semibold text-base-content/80">Extracted Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input input-bordered input-sm w-full"
                placeholder="Full Name"
              />
            </div>

            <div>
              <label className="label py-1 font-semibold text-base-content/80">Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input input-bordered input-sm w-full"
                placeholder="Phone Number"
              />
            </div>
          </div>

          {/* Bio / Summary */}
          <div className="text-xs">
            <label className="label py-1 font-semibold text-base-content/80">
              Professional Summary
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="textarea textarea-bordered text-xs w-full"
              placeholder="Summary of experience and expertise..."
            ></textarea>
          </div>

          {/* Extracted Skills */}
          <div className="text-xs space-y-2">
            <label className="label py-1 font-semibold text-base-content/80 flex items-center justify-between">
              <span>Detected Skills ({skills.length})</span>
              <span className="text-[11px] text-base-content/50">Click x to remove, or add new below</span>
            </label>

            <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-base-200/60 border border-base-300 min-h-[50px]">
              {skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="badge badge-primary badge-outline text-xs gap-1.5 py-2.5 px-3"
                >
                  {skill}
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-error text-base-content/50"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <form onSubmit={handleAddSkill} className="flex gap-2 max-w-sm pt-1">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add additional skill..."
                className="input input-bordered input-sm flex-1 text-xs"
              />
              <button type="submit" className="btn btn-outline btn-sm">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </form>
          </div>

          {/* Extracted Education */}
          <div className="text-xs space-y-3">
            <h4 className="font-semibold text-base-content/80">
              Education History ({education.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {education.map((edu, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-base-200 border border-base-300 space-y-1"
                >
                  <p className="font-bold text-sm text-base-content">{edu.degree}</p>
                  <p className="text-base-content/70">{edu.field}</p>
                  <p className="text-base-content/50 text-[11px]">
                    {edu.institution} {edu.graduationYear ? `• ${edu.graduationYear}` : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Extracted Experience */}
          <div className="text-xs space-y-3">
            <h4 className="font-semibold text-base-content/80">
              Work Experience ({experience.length})
            </h4>
            <div className="space-y-3">
              {experience.map((exp, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg bg-base-200 border border-base-300 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-sm text-base-content">{exp.title}</p>
                    <span className="text-[11px] text-base-content/50">
                      {exp.startDate} – {exp.endDate}
                    </span>
                  </div>
                  <p className="font-medium text-xs text-primary">{exp.company}</p>
                  <p className="text-base-content/70 text-xs leading-relaxed">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
