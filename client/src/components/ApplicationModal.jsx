import React from 'react';
import { useForm } from 'react-hook-form';
import { X, Building2, Briefcase, MapPin, DollarSign, Calendar, FileText } from 'lucide-react';

const STATUS_OPTIONS = [
  'SAVED',
  'APPLIED',
  'ASSESSMENT',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
  'WITHDRAWN',
];

export const ApplicationModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: initialData || {
      company: '',
      jobTitle: '',
      location: 'Remote',
      workMode: 'remote',
      salary: '',
      status: 'APPLIED',
      originalUrl: '',
      notes: '',
      appliedDate: new Date().toISOString().split('T')[0],
      interviewDate: '',
    },
  });

  if (!isOpen) return null;

  const handleFormSubmit = async (data) => {
    await onSubmit(data);
    reset();
    onClose();
  };

  return (
    <div className="modal modal-open z-50">
      <div className="modal-box max-w-lg bg-base-100 border border-base-300 shadow-2xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-base-300">
          <h3 className="font-bold text-lg text-base-content flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            {initialData ? 'Edit Application' : 'Track New Application'}
          </h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4 text-xs">
          {/* Company */}
          <div>
            <label className="label py-1 font-semibold text-base-content/80">Company *</label>
            <div className="relative">
              <Building2 className="w-4 h-4 absolute left-3 top-3 text-base-content/40" />
              <input
                {...register('company', { required: 'Company is required' })}
                type="text"
                placeholder="e.g. Stripe, Cloudflare, Figma"
                className="input input-bordered input-sm w-full pl-9"
              />
            </div>
            {errors.company && (
              <span className="text-error text-[11px] mt-0.5">{errors.company.message}</span>
            )}
          </div>

          {/* Job Title */}
          <div>
            <label className="label py-1 font-semibold text-base-content/80">Job Title *</label>
            <div className="relative">
              <Briefcase className="w-4 h-4 absolute left-3 top-3 text-base-content/40" />
              <input
                {...register('jobTitle', { required: 'Job title is required' })}
                type="text"
                placeholder="e.g. Senior Frontend Engineer"
                className="input input-bordered input-sm w-full pl-9"
              />
            </div>
            {errors.jobTitle && (
              <span className="text-error text-[11px] mt-0.5">{errors.jobTitle.message}</span>
            )}
          </div>

          {/* Status & Work Mode */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label py-1 font-semibold text-base-content/80">Status</label>
              <select {...register('status')} className="select select-bordered select-sm w-full">
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label py-1 font-semibold text-base-content/80">Work Mode</label>
              <select {...register('workMode')} className="select select-bordered select-sm w-full">
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
              </select>
            </div>
          </div>

          {/* Location & Salary */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label py-1 font-semibold text-base-content/80">Location</label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-base-content/40" />
                <input
                  {...register('location')}
                  type="text"
                  placeholder="e.g. Remote, San Francisco"
                  className="input input-bordered input-sm w-full pl-9"
                />
              </div>
            </div>

            <div>
              <label className="label py-1 font-semibold text-base-content/80">Salary / Rate</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3 top-3 text-base-content/40" />
                <input
                  {...register('salary')}
                  type="text"
                  placeholder="e.g. $140,000 / yr"
                  className="input input-bordered input-sm w-full pl-9"
                />
              </div>
            </div>
          </div>

          {/* Dates: Applied & Interview */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label py-1 font-semibold text-base-content/80">Date Applied</label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-3 text-base-content/40" />
                <input
                  {...register('appliedDate')}
                  type="date"
                  className="input input-bordered input-sm w-full pl-9"
                />
              </div>
            </div>

            <div>
              <label className="label py-1 font-semibold text-base-content/80">Interview Date</label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-3 text-purple-400" />
                <input
                  {...register('interviewDate')}
                  type="date"
                  className="input input-bordered input-sm w-full pl-9"
                />
              </div>
            </div>
          </div>

          {/* Job Posting URL */}
          <div>
            <label className="label py-1 font-semibold text-base-content/80">Application / Job URL</label>
            <input
              {...register('originalUrl')}
              type="url"
              placeholder="https://..."
              className="input input-bordered input-sm w-full"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="label py-1 font-semibold text-base-content/80">Notes</label>
            <textarea
              {...register('notes')}
              rows={3}
              placeholder="Notes on referral, recruiter contact, tech stack, or prep..."
              className="textarea textarea-bordered text-xs w-full"
            ></textarea>
          </div>

          {/* Modal Actions */}
          <div className="modal-action pt-2 border-t border-base-300">
            <button type="button" onClick={onClose} className="btn btn-sm btn-ghost">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-sm btn-primary px-5"
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Save Changes' : 'Track Application'}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};
