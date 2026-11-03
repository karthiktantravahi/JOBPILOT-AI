import React from 'react';
import { Bell, CheckCheck, ExternalLink, Calendar, Briefcase, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { timeAgo } from '../utils/formatters';

export const NotificationDropdown = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const getIcon = (type) => {
    switch (type) {
      case 'INTERVIEW_REMINDER':
        return <Calendar className="w-4 h-4 text-purple-400" />;
      case 'MATCHING_JOB':
        return <Briefcase className="w-4 h-4 text-blue-400" />;
      case 'SYNC_COMPLETED':
        return <RefreshCw className="w-4 h-4 text-emerald-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle btn-sm relative">
        <Bell className="w-5 h-5 text-base-content/80" />
        {unreadCount > 0 && (
          <span className="badge badge-primary badge-xs absolute -top-0.5 -right-0.5 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </div>
      <div
        tabIndex={0}
        className="dropdown-content z-50 card card-compact w-80 sm:w-96 p-3 shadow-xl bg-base-200 border border-base-300 rounded-box mt-3"
      >
        <div className="flex items-center justify-between pb-2 border-b border-base-300">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Notifications</span>
            {unreadCount > 0 && (
              <span className="badge badge-primary badge-sm">{unreadCount} new</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="btn btn-ghost btn-xs text-xs flex items-center gap-1 text-primary"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-base-300/60 mt-1">
          {notifications.length === 0 ? (
            <div className="py-6 text-center text-xs text-base-content/60">
              No notifications yet. You're all caught up!
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => !n.read && markAsRead(n._id)}
                className={`py-2.5 px-2 hover:bg-base-300/40 rounded transition-colors cursor-pointer ${
                  !n.read ? 'bg-primary/5 font-medium' : 'opacity-80'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-full bg-base-300 shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-base-content truncate">
                        {n.title}
                      </p>
                      <span className="text-[10px] text-base-content/50 shrink-0 ml-2">
                        {timeAgo(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-base-content/70 mt-0.5 line-clamp-2">
                      {n.message}
                    </p>
                    {n.link && (
                      <Link
                        to={n.link}
                        className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline mt-1"
                      >
                        View Details <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
