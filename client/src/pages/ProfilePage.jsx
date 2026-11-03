import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
  Plus,
  Trash2,
  Save,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Globe,
  Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/extraServices';
import { TECH_SKILLS } from '../ai/skillsTaxonomy';

export const ProfilePage = () => {
  const { user, updateUserProfile } = useAuth();
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [newSkillInput, setNewSkillInput] = useState('');

  const profile = user?.profile || {};

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      headline: profile.headline || '',
      bio: profile.bio || '',
      phone: profile.phone || '',
      city: profile.location?.city || '',
      country: profile.location?.country || '',
      skills: profile.skills || [],
      preferredJobTitles: (profile.preferredJobTitles || []).join(', '),
      preferredCountries: (profile.preferredCountries || []).join(', '),
      preferredWorkModes: profile.preferredWorkModes || ['remote'],
      preferredEmploymentTypes: profile.preferredEmploymentTypes || ['full-time'],
      minSalary: profile.expectedSalary?.min || '',
      maxSalary: profile.expectedSalary?.max || '',
      noticePeriod: profile.noticePeriod || 'Immediate',
      visaSponsorshipRequired: profile.visaSponsorshipRequired || false,
      education: profile.education?.length
        ? profile.education
        : [{ degree: "Bachelor's Degree", field: 'Computer Science', institution: '', graduationYear: 2024 }],
      experience: profile.experience?.length
        ? profile.experience
        : [{ title: 'Software Engineer', company: '', startDate: '2022', endDate: 'Present', description: '' }],
    },
  });

  const {
    fields: eduFields,
    append: appendEdu,
    remove: removeEdu,
  } = useFieldArray({ control, name: 'education' });

  const {
    fields: expFields,
    append: appendExp,
    remove: removeExp,
  } = useFieldArray({ control, name: 'experience' });

  const currentSkills = watch('skills') || [];

  const handleAddSkill = (skillToAdd) => {
    const trimmed = skillToAdd.trim();
    if (trimmed && !currentSkills.includes(trimmed)) {
      setValue('skills', [...currentSkills, trimmed]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setValue(
      'skills',
      currentSkills.filter((s) => s !== skillToRemove)
    );
  };

  const onSubmit = async (formData) => {
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const payload = {
        name: formData.name,
        headline: formData.headline,
        bio: formData.bio,
        phone: formData.phone,
        location: {
          city: formData.city,
          country: formData.country,
        },
        skills: formData.skills,
        preferredJobTitles: formData.preferredJobTitles
          ? formData.preferredJobTitles.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
        preferredCountries: formData.preferredCountries
          ? formData.preferredCountries.split(',').map((c) => c.trim()).filter(Boolean)
          : [],
        preferredWorkModes: formData.preferredWorkModes,
        preferredEmploymentTypes: formData.preferredEmploymentTypes,
        expectedSalary: {
          min: formData.minSalary ? parseInt(formData.minSalary, 10) : 0,
          max: formData.maxSalary ? parseInt(formData.maxSalary, 10) : 0,
          currency: 'USD',
          period: 'yearly',
        },
        noticePeriod: formData.noticePeriod,
        visaSponsorshipRequired: formData.visaSponsorshipRequired,
        education: formData.education,
        experience: formData.experience,
      };

      const res = await profileService.updateProfile(payload);
      if (res.success && res.user) {
        updateUserProfile(res.user);
        setSuccessMsg('Profile updated successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save profile changes.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content flex items-center gap-2.5">
            <User className="w-7 h-7 text-primary" />
            Professional Profile & Preferences
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            Configure your technical expertise, career history, and target role criteria.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="alert alert-success text-xs py-2 shadow-sm text-white flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-error text-xs py-2 shadow-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-xs">
        {/* Personal Details Card */}
        <div className="card bg-base-100 border border-base-300 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-base text-base-content flex items-center gap-2 pb-2 border-b border-base-300">
            <User className="w-4 h-4 text-primary" /> Personal Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label py-1 font-semibold text-base-content/80">Full Name *</label>
              <input
                {...register('name', { required: true })}
                className="input input-bordered input-sm w-full"
              />
            </div>

            <div>
              <label className="label py-1 font-semibold text-base-content/80">Email</label>
              <input
                value={user?.email || ''}
                disabled
                className="input input-bordered input-sm w-full bg-base-200 opacity-70"
              />
            </div>

            <div>
              <label className="label py-1 font-semibold text-base-content/80">Headline</label>
              <input
                {...register('headline')}
                placeholder="e.g. Senior Full Stack Engineer (React/Node)"
                className="input input-bordered input-sm w-full"
              />
            </div>

            <div>
              <label className="label py-1 font-semibold text-base-content/80">Phone</label>
              <input
                {...register('phone')}
                placeholder="+1 (555) 012-3456"
                className="input input-bordered input-sm w-full"
              />
            </div>

            <div>
              <label className="label py-1 font-semibold text-base-content/80">City</label>
              <input
                {...register('city')}
                placeholder="e.g. San Francisco"
                className="input input-bordered input-sm w-full"
              />
            </div>

            <div>
              <label className="label py-1 font-semibold text-base-content/80">Country</label>
              <input
                {...register('country')}
                placeholder="e.g. United States"
                className="input input-bordered input-sm w-full"
              />
            </div>
          </div>

          <div>
            <label className="label py-1 font-semibold text-base-content/80">
              Professional Bio
            </label>
            <textarea
              {...register('bio')}
              rows={3}
              placeholder="Brief summary of your professional background, focus areas, and achievements..."
              className="textarea textarea-bordered text-xs w-full"
            ></textarea>
          </div>
        </div>

        {/* Skills Card */}
        <div className="card bg-base-100 border border-base-300 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-base-300">
            <h3 className="font-bold text-base text-base-content flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> Skills & Tech Stack ({currentSkills.length})
            </h3>
          </div>

          <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-base-200/50 border border-base-300 min-h-[60px]">
            {currentSkills.length === 0 ? (
              <span className="text-base-content/40 italic py-2">No skills added yet.</span>
            ) : (
              currentSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="badge badge-primary badge-outline text-xs gap-1.5 py-2.5 px-3"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-error text-base-content/50"
                  >
                    ×
                  </button>
                </span>
              ))
            )}
          </div>

          {/* Add skill input */}
          <div className="flex gap-2 max-w-sm">
            <input
              type="text"
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
              placeholder="Type skill name..."
              className="input input-bordered input-sm flex-1 text-xs"
            />
            <button
              type="button"
              onClick={() => handleAddSkill(newSkillInput)}
              className="btn btn-outline btn-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>

        {/* Job Preferences Card */}
        <div className="card bg-base-100 border border-base-300 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-base text-base-content flex items-center gap-2 pb-2 border-b border-base-300">
            <Briefcase className="w-4 h-4 text-primary" /> Job & Employment Preferences
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label py-1 font-semibold text-base-content/80">
                Target Job Titles (Comma-separated)
              </label>
              <input
                {...register('preferredJobTitles')}
                placeholder="Full Stack Developer, Frontend Engineer"
                className="input input-bordered input-sm w-full"
              />
            </div>

            <div>
              <label className="label py-1 font-semibold text-base-content/80">
                Target Countries (Comma-separated)
              </label>
              <input
                {...register('preferredCountries')}
                placeholder="United States, Canada, Remote"
                className="input input-bordered input-sm w-full"
              />
            </div>
          </div>

          {/* Work Modes */}
          <div className="space-y-2">
            <label className="label py-1 font-semibold text-base-content/80">
              Acceptable Work Modes
            </label>
            <div className="flex flex-wrap gap-4">
              {['remote', 'hybrid', 'onsite'].map((mode) => (
                <label key={mode} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    value={mode}
                    {...register('preferredWorkModes')}
                    className="checkbox checkbox-primary checkbox-xs"
                  />
                  <span className="capitalize">{mode}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Salary Expectation */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="label py-1 font-semibold text-base-content/80">Min Salary ($/yr)</label>
              <input
                type="number"
                {...register('minSalary')}
                placeholder="100000"
                className="input input-bordered input-sm w-full"
              />
            </div>
            <div>
              <label className="label py-1 font-semibold text-base-content/80">Max Salary ($/yr)</label>
              <input
                type="number"
                {...register('maxSalary')}
                placeholder="160000"
                className="input input-bordered input-sm w-full"
              />
            </div>
            <div>
              <label className="label py-1 font-semibold text-base-content/80">Notice Period</label>
              <select {...register('noticePeriod')} className="select select-bordered select-sm w-full">
                <option value="Immediate">Immediate</option>
                <option value="2 weeks">2 weeks</option>
                <option value="1 month">1 month</option>
                <option value="2 months">2 months</option>
              </select>
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('visaSponsorshipRequired')}
                  className="checkbox checkbox-primary checkbox-xs"
                />
                <span>Requires Visa Sponsorship</span>
              </label>
            </div>
          </div>
        </div>

        {/* Work Experience */}
        <div className="card bg-base-100 border border-base-300 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-base-300">
            <h3 className="font-bold text-base text-base-content flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" /> Work History
            </h3>
            <button
              type="button"
              onClick={() => appendExp({ title: '', company: '', startDate: '', endDate: 'Present', description: '' })}
              className="btn btn-outline btn-xs gap-1"
            >
              <Plus className="w-3 h-3" /> Add Experience
            </button>
          </div>

          <div className="space-y-4">
            {expFields.map((field, index) => (
              <div key={field.id} className="p-4 rounded-xl bg-base-200/50 border border-base-300 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-base-content">Position #{index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeExp(index)}
                    className="text-error hover:opacity-80"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    {...register(`experience.${index}.title`)}
                    placeholder="Role Title (e.g. Senior Frontend Developer)"
                    className="input input-bordered input-sm w-full"
                  />
                  <input
                    {...register(`experience.${index}.company`)}
                    placeholder="Company (e.g. Stripe)"
                    className="input input-bordered input-sm w-full"
                  />
                  <input
                    {...register(`experience.${index}.startDate`)}
                    placeholder="Start Date (e.g. 2021)"
                    className="input input-bordered input-sm w-full"
                  />
                  <input
                    {...register(`experience.${index}.endDate`)}
                    placeholder="End Date (e.g. Present)"
                    className="input input-bordered input-sm w-full"
                  />
                </div>
                <textarea
                  {...register(`experience.${index}.description`)}
                  rows={2}
                  placeholder="Key responsibilities and achievements..."
                  className="textarea textarea-bordered text-xs w-full"
                ></textarea>
              </div>
            ))}
          </div>
        </div>

        {/* Education History */}
        <div className="card bg-base-100 border border-base-300 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-base-300">
            <h3 className="font-bold text-base text-base-content flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-primary" /> Education History
            </h3>
            <button
              type="button"
              onClick={() => appendEdu({ degree: "Bachelor's Degree", field: '', institution: '', graduationYear: 2024 })}
              className="btn btn-outline btn-xs gap-1"
            >
              <Plus className="w-3 h-3" /> Add Education
            </button>
          </div>

          <div className="space-y-4">
            {eduFields.map((field, index) => (
              <div key={field.id} className="p-4 rounded-xl bg-base-200/50 border border-base-300 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-base-content">Education #{index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeEdu(index)}
                    className="text-error hover:opacity-80"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    {...register(`education.${index}.degree`)}
                    placeholder="Degree (e.g. Bachelor of Science)"
                    className="input input-bordered input-sm w-full"
                  />
                  <input
                    {...register(`education.${index}.field`)}
                    placeholder="Field of Study (e.g. Computer Science)"
                    className="input input-bordered input-sm w-full"
                  />
                  <input
                    {...register(`education.${index}.institution`)}
                    placeholder="University or College"
                    className="input input-bordered input-sm w-full"
                  />
                  <input
                    type="number"
                    {...register(`education.${index}.graduationYear`, { valueAsNumber: true })}
                    placeholder="Graduation Year (e.g. 2023)"
                    className="input input-bordered input-sm w-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Bar */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary btn-md gap-2 shadow-lg shadow-primary/25 px-8"
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Saving Profile...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Profile Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
