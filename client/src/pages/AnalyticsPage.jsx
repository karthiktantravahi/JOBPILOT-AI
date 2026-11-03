import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Bookmark,
  Send,
  Calendar,
  Award,
  XCircle,
  Sparkles,
  PieChart,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import { analyticsService } from '../services/extraServices';

export const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await analyticsService.getAnalytics();
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-xs text-base-content/60">Computing application pipeline metrics...</p>
      </div>
    );
  }

  const {
    counts = {},
    totalTracked = 0,
    totalSaved = 0,
    totalApplied = 0,
    interviews = 0,
    offers = 0,
    rejections = 0,
    successRate = 0,
    interviewRate = 0,
    avgMatchScore = null,
    sourceDistribution = [],
    weeklyActivity = [],
    platformMetrics = {},
  } = data || {};

  // Find max weekly count for scaling chart
  const maxWeeklyCount = Math.max(...weeklyActivity.map((w) => w.count), 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-bold mb-2">
          <Activity className="w-3.5 h-3.5" />
          Live Metrics
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content flex items-center gap-2.5">
          <BarChart3 className="w-7 h-7 text-primary" />
          Application Analytics & Pipeline Insights
        </h1>
        <p className="text-xs sm:text-sm text-base-content/60 mt-1">
          Actual database-derived metrics calculated in real-time from your job activity.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Saved */}
        <div className="card bg-base-100 p-4 border border-base-300 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-base-content/50">
            <span className="text-xs font-semibold">Saved Roles</span>
            <Bookmark className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-base-content">{totalSaved}</div>
          <span className="text-[10px] text-base-content/50">Bookmarked to review</span>
        </div>

        {/* Applied */}
        <div className="card bg-base-100 p-4 border border-base-300 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-base-content/50">
            <span className="text-xs font-semibold">Submitted</span>
            <Send className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-primary">{totalApplied}</div>
          <span className="text-[10px] text-base-content/50">Active outreach</span>
        </div>

        {/* Interviews */}
        <div className="card bg-base-100 p-4 border border-base-300 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-base-content/50">
            <span className="text-xs font-semibold">Interviews</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400">{interviews}</div>
          <span className="text-[10px] text-purple-400 font-medium">{interviewRate}% conv. rate</span>
        </div>

        {/* Offers */}
        <div className="card bg-base-100 p-4 border border-base-300 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-base-content/50">
            <span className="text-xs font-semibold">Offers Received</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{offers}</div>
          <span className="text-[10px] text-emerald-500 font-medium">{successRate}% success rate</span>
        </div>

        {/* Rejections */}
        <div className="card bg-base-100 p-4 border border-base-300 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-base-content/50">
            <span className="text-xs font-semibold">Rejections</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-base-content/60">{rejections}</div>
          <span className="text-[10px] text-base-content/50">Completed cycles</span>
        </div>

        {/* Average Match */}
        <div className="card bg-base-100 p-4 border border-base-300 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-base-content/50">
            <span className="text-xs font-semibold">Avg Match</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">
            {avgMatchScore ? `${avgMatchScore}%` : 'N/A'}
          </div>
          <span className="text-[10px] text-base-content/50">AI quality score</span>
        </div>
      </div>

      {/* Main Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity Bar Chart */}
        <div className="lg:col-span-2 card bg-base-100 border border-base-300 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-base-content flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Weekly Application Activity
              </h3>
              <p className="text-xs text-base-content/60 mt-0.5">
                Number of job applications submitted and saved per week.
              </p>
            </div>
            <span className="badge badge-neutral text-xs">Past 8 Weeks</span>
          </div>

          {/* SVG / CSS Bar Chart */}
          <div className="pt-6 pb-2">
            <div className="h-48 flex items-end gap-3 sm:gap-6 justify-between px-2 border-b border-base-300">
              {weeklyActivity.map((w, idx) => {
                const heightPercent = Math.max(Math.round((w.count / maxWeeklyCount) * 100), 8);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      {w.count}
                    </span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[40px] bg-gradient-to-t from-primary/60 to-primary rounded-t-md transition-all duration-300 group-hover:from-primary group-hover:to-accent"
                    ></div>
                    <span className="text-[10px] text-base-content/60 font-medium truncate">
                      {w.week}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Source Distribution */}
        <div className="card bg-base-100 border border-base-300 shadow-sm p-6 space-y-4">
          <div>
            <h3 className="font-bold text-sm text-base-content flex items-center gap-2">
              <PieChart className="w-4 h-4 text-primary" /> Application Sources
            </h3>
            <p className="text-xs text-base-content/60 mt-0.5">
              Breakdown of platforms and adapters where your jobs were discovered.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {sourceDistribution.length === 0 ? (
              <p className="text-xs text-base-content/50 py-6 text-center">
                No tracked sources recorded yet.
              </p>
            ) : (
              sourceDistribution.map((s, idx) => {
                const percent = totalTracked > 0 ? Math.round((s.count / totalTracked) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex justify-between font-medium">
                      <span className="text-base-content">{s.name}</span>
                      <span className="text-base-content/70">
                        {s.count} ({percent}%)
                      </span>
                    </div>
                    <progress
                      className="progress progress-primary w-full h-1.5"
                      value={percent}
                      max="100"
                    ></progress>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Global Ingestion Benchmark */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-base-200 via-base-300/50 to-base-200 border border-base-300 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-sm text-base-content block">
              Global Platform Ingestion Status
            </span>
            <p className="text-base-content/60 mt-0.5">
              Currently indexing <strong>{platformMetrics.totalGlobalJobs || 0}</strong> active public tech postings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
