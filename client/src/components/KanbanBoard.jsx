import React from 'react';
import {
  Building2,
  Calendar,
  DollarSign,
  MapPin,
  MoreVertical,
  Trash2,
  Edit2,
  Sparkles,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { formatDate, getScoreBadgeClass } from '../utils/formatters';

const COLUMNS = [
  { id: 'SAVED', title: 'Saved', color: 'border-slate-500/40 text-slate-400' },
  { id: 'APPLIED', title: 'Applied', color: 'border-blue-500/40 text-blue-400' },
  { id: 'ASSESSMENT', title: 'Assessment', color: 'border-amber-500/40 text-amber-400' },
  { id: 'INTERVIEW', title: 'Interview', color: 'border-purple-500/40 text-purple-400' },
  { id: 'OFFER', title: 'Offer', color: 'border-emerald-500/40 text-emerald-400' },
  { id: 'REJECTED', title: 'Rejected', color: 'border-rose-500/40 text-rose-400' },
  { id: 'WITHDRAWN', title: 'Withdrawn', color: 'border-base-300 text-base-content/40' },
];

export const KanbanBoard = ({
  applications = [],
  onUpdateStatus,
  onEditApplication,
  onDeleteApplication,
}) => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-6 pt-2 snap-x select-none min-h-[600px]">
      {COLUMNS.map((col) => {
        const columnApps = applications.filter((app) => app.status === col.id);

        return (
          <div
            key={col.id}
            className="flex-1 min-w-[270px] max-w-[320px] bg-base-200/60 rounded-xl border border-base-300 flex flex-col snap-start shrink-0"
          >
            {/* Column Header */}
            <div className={`p-3.5 border-b border-base-300 flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${col.color.split(' ')[1].replace('text-', 'bg-')}`}></span>
                <span className="font-bold text-xs uppercase tracking-wider text-base-content">
                  {col.title}
                </span>
              </div>
              <span className="badge badge-sm badge-neutral text-xs font-semibold">
                {columnApps.length}
              </span>
            </div>

            {/* Column Cards */}
            <div className="p-2.5 flex-1 overflow-y-auto space-y-2.5 max-h-[75vh]">
              {columnApps.length === 0 ? (
                <div className="py-8 text-center text-xs text-base-content/40 border border-dashed border-base-300 rounded-lg">
                  No applications
                </div>
              ) : (
                columnApps.map((app) => (
                  <div
                    key={app._id}
                    className="card bg-base-100 hover:bg-base-100/90 border border-base-300/80 shadow-sm hover:shadow transition-all p-3.5 rounded-lg group text-xs"
                  >
                    {/* Header: Company & Actions */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="font-semibold text-xs text-base-content/70 flex items-center gap-1 truncate">
                        <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                        {app.company}
                      </span>

                      <div className="dropdown dropdown-end">
                        <div
                          tabIndex={0}
                          role="button"
                          className="btn btn-ghost btn-xs btn-circle opacity-50 group-hover:opacity-100"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </div>
                        <ul
                          tabIndex={0}
                          className="dropdown-content z-30 menu p-1.5 shadow-lg bg-base-200 border border-base-300 rounded-box w-36 text-xs"
                        >
                          <li>
                            <button
                              onClick={() => onEditApplication(app)}
                              className="flex items-center gap-1.5 text-xs py-1"
                            >
                              <Edit2 className="w-3 h-3 text-info" /> Edit
                            </button>
                          </li>
                          <li>
                            <button
                              onClick={() => onDeleteApplication(app._id)}
                              className="flex items-center gap-1.5 text-xs text-error py-1"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Job Title */}
                    <h4 className="font-bold text-sm text-base-content mb-2 line-clamp-2">
                      {app.jobTitle}
                    </h4>

                    {/* Location & Mode */}
                    <div className="flex flex-wrap items-center gap-2 text-base-content/60 text-[11px] mb-2.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate max-w-[120px]">{app.location}</span>
                      </span>
                      <span className="badge badge-outline badge-xs capitalize">
                        {app.workMode}
                      </span>
                    </div>

                    {/* Salary or Dates */}
                    <div className="space-y-1 mb-2.5 text-[11px]">
                      {app.salary && (
                        <div className="flex items-center gap-1 text-emerald-500 font-medium">
                          <DollarSign className="w-3 h-3" />
                          <span>{app.salary}</span>
                        </div>
                      )}

                      {app.interviewDate && (
                        <div className="flex items-center gap-1 text-purple-400 font-semibold bg-purple-500/10 px-2 py-0.5 rounded">
                          <Calendar className="w-3 h-3" />
                          <span>Interview: {formatDate(app.interviewDate)}</span>
                        </div>
                      )}

                      {app.appliedDate && !app.interviewDate && (
                        <div className="flex items-center gap-1 text-base-content/50">
                          <Calendar className="w-3 h-3" />
                          <span>Applied: {formatDate(app.appliedDate)}</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Row: Match score & Move Column Dropdown */}
                    <div className="pt-2 border-t border-base-300/60 flex items-center justify-between gap-1">
                      {app.matchScore ? (
                        <span
                          className={`badge ${getScoreBadgeClass(
                            app.matchScore
                          )} badge-xs py-1 px-1.5 font-bold gap-0.5 text-[10px]`}
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          {app.matchScore}%
                        </span>
                      ) : (
                        <span className="text-[10px] text-base-content/40">
                          {app.notes?.length > 0 && (
                            <span className="flex items-center gap-0.5">
                              <MessageSquare className="w-2.5 h-2.5" />
                              {app.notes.length} note(s)
                            </span>
                          )}
                        </span>
                      )}

                      {/* Move to status select */}
                      <select
                        value={app.status}
                        onChange={(e) => onUpdateStatus(app._id, e.target.value)}
                        className="select select-bordered select-xs text-[10px] h-6 min-h-0 bg-base-200 py-0"
                      >
                        {COLUMNS.map((c) => (
                          <option key={c.id} value={c.id}>
                            Move: {c.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
