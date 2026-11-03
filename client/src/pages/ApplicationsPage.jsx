import React, { useState, useEffect } from 'react';
import {
  Kanban,
  List,
  Plus,
  Search,
  Filter,
  Building2,
  Calendar,
  DollarSign,
  MoreVertical,
  Edit2,
  Trash2,
  ExternalLink,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { applicationService } from '../services/applicationService';
import { KanbanBoard } from '../components/KanbanBoard';
import { ApplicationModal } from '../components/ApplicationModal';
import { formatDate, getStatusBadgeClass, getScoreBadgeClass } from '../utils/formatters';

export const ApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const res = await applicationService.getApplications();
      if (res.success) {
        setApplications(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await applicationService.updateStatus(id, newStatus);
      if (res.success) {
        setApplications((prev) =>
          prev.map((app) => (app._id === id ? res.data : app))
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleCreateOrUpdate = async (formData) => {
    try {
      if (editingApp) {
        const res = await applicationService.updateApplication(editingApp._id, formData);
        if (res.success) {
          setApplications((prev) =>
            prev.map((app) => (app._id === editingApp._id ? res.data : app))
          );
        }
      } else {
        const res = await applicationService.createApplication(formData);
        if (res.success) {
          setApplications((prev) => [res.data, ...prev]);
        }
      }
      setEditingApp(null);
    } catch (err) {
      console.error('Failed to save application:', err);
    }
  };

  const handleDeleteApplication = async (id) => {
    if (!window.confirm('Are you sure you want to remove this application from your tracker?')) {
      return;
    }
    try {
      await applicationService.deleteApplication(id);
      setApplications((prev) => prev.filter((app) => app._id !== id));
    } catch (err) {
      console.error('Failed to delete application:', err);
    }
  };

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      (app.company || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.jobTitle || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content flex items-center gap-2.5">
            <Kanban className="w-7 h-7 text-primary" />
            Application Tracker
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            Organize your job search pipeline across custom stages from Saved to Offer.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="join border border-base-300">
            <button
              onClick={() => setViewMode('kanban')}
              className={`join-item btn btn-sm ${
                viewMode === 'kanban' ? 'btn-primary' : 'btn-ghost'
              }`}
            >
              <Kanban className="w-4 h-4" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`join-item btn btn-sm ${
                viewMode === 'list' ? 'btn-primary' : 'btn-ghost'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>

          <button
            onClick={() => {
              setEditingApp(null);
              setIsModalOpen(true);
            }}
            className="btn btn-sm btn-primary gap-1.5 shadow-md shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            Track Application
          </button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-base-200/50 p-3 rounded-xl border border-base-300 text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-base-content/40" />
          <input
            type="text"
            placeholder="Search tracked companies or titles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-bordered input-sm w-full pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {['all', 'SAVED', 'APPLIED', 'ASSESSMENT', 'INTERVIEW', 'OFFER', 'REJECTED'].map(
            (st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`btn btn-xs capitalize ${
                  statusFilter === st ? 'btn-neutral font-bold' : 'btn-ghost text-base-content/60'
                }`}
              >
                {st.toLowerCase()}
              </button>
            )
          )}
        </div>
      </div>

      {/* Main View Area */}
      {isLoading ? (
        <div className="py-20 text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-xs text-base-content/60 mt-2">Loading your tracker...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="card bg-base-100 border border-base-300 p-12 text-center space-y-4">
          <Kanban className="w-12 h-12 text-base-content/30 mx-auto" />
          <h3 className="font-bold text-base text-base-content">
            Your application pipeline is empty
          </h3>
          <p className="text-xs text-base-content/60 max-w-sm mx-auto">
            Discover roles in the job feed and save them, or click "Track Application" to add an external role.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setEditingApp(null);
                setIsModalOpen(true);
              }}
              className="btn btn-primary btn-sm gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Application
            </button>
          </div>
        </div>
      ) : viewMode === 'kanban' ? (
        /* Kanban View */
        <KanbanBoard
          applications={filteredApps}
          onUpdateStatus={handleUpdateStatus}
          onEditApplication={(app) => {
            setEditingApp(app);
            setIsModalOpen(true);
          }}
          onDeleteApplication={handleDeleteApplication}
        />
      ) : (
        /* List View */
        <div className="overflow-x-auto bg-base-100 rounded-xl border border-base-300 shadow-sm">
          <table className="table table-sm text-xs">
            <thead className="bg-base-200/60 text-base-content/70">
              <tr>
                <th>Company & Role</th>
                <th>Status</th>
                <th>Work Mode</th>
                <th>Dates</th>
                <th>Match Score</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app) => (
                <tr key={app._id} className="hover:bg-base-200/30">
                  <td>
                    <div>
                      <span className="font-bold text-sm text-base-content block">
                        {app.jobTitle}
                      </span>
                      <span className="text-xs text-base-content/70 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-primary" />
                        {app.company}
                        {app.originalUrl && (
                          <a
                            href={app.originalUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline ml-1"
                          >
                            <ExternalLink className="w-3 h-3 inline" />
                          </a>
                        )}
                      </span>
                    </div>
                  </td>
                  <td>
                    <select
                      value={app.status}
                      onChange={(e) => handleUpdateStatus(app._id, e.target.value)}
                      className={`select select-bordered select-xs font-semibold ${getStatusBadgeClass(
                        app.status
                      )}`}
                    >
                      <option value="SAVED">SAVED</option>
                      <option value="APPLIED">APPLIED</option>
                      <option value="ASSESSMENT">ASSESSMENT</option>
                      <option value="INTERVIEW">INTERVIEW</option>
                      <option value="OFFER">OFFER</option>
                      <option value="REJECTED">REJECTED</option>
                      <option value="WITHDRAWN">WITHDRAWN</option>
                    </select>
                  </td>
                  <td>
                    <span className="badge badge-outline badge-xs capitalize">
                      {app.workMode || 'Remote'}
                    </span>
                  </td>
                  <td>
                    <div className="space-y-0.5 text-[11px]">
                      {app.interviewDate && (
                        <div className="text-purple-400 font-semibold flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Interview: {formatDate(app.interviewDate)}
                        </div>
                      )}
                      {app.appliedDate && (
                        <div className="text-base-content/60 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Applied: {formatDate(app.appliedDate)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    {app.matchScore ? (
                      <span className={`badge ${getScoreBadgeClass(app.matchScore)} badge-xs py-1 px-1.5 gap-1`}>
                        <Sparkles className="w-2.5 h-2.5" />
                        {app.matchScore}%
                      </span>
                    ) : (
                      <span className="text-base-content/40">—</span>
                    )}
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          setEditingApp(app);
                          setIsModalOpen(true);
                        }}
                        className="btn btn-ghost btn-xs btn-circle text-info"
                        title="Edit details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteApplication(app._id)}
                        className="btn btn-ghost btn-xs btn-circle text-error"
                        title="Delete application"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingApp(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingApp}
      />
    </div>
  );
};
