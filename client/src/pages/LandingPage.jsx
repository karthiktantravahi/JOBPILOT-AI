import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  ShieldCheck,
  Zap,
  Briefcase,
  CheckCircle2,
  Sliders,
  DollarSign,
  ArrowRight,
  RefreshCw,
  Search,
  Kanban,
  FileText,
  BarChart2,
} from 'lucide-react';
import { jobService } from '../services/jobService';
import { JobCard } from '../components/JobCard';
import { JobModal } from '../components/JobModal';

export const LandingPage = () => {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await jobService.getJobs({ limit: 4 });
        if (res.success) {
          setFeaturedJobs(res.data || []);
        }
      } catch (err) {
        console.warn('Failed to load featured jobs:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>100% Free & Open-Source AI Job Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-base-content tracking-tight max-w-4xl mx-auto leading-tight">
            Find the right job. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-500 to-accent">
              Apply smarter.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-base-content/70 max-w-2xl mx-auto leading-relaxed">
            Discover verified tech positions from Greenhouse, Lever, Remotive, and Arbeitnow.
            Receive explainable match scores calculated locally in your browser. Zero subscription fees.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/jobs"
              className="btn btn-primary btn-md gap-2 shadow-lg shadow-primary/25 px-6"
            >
              <Search className="w-4 h-4" />
              Discover Live Jobs
            </Link>
            <Link to="/register" className="btn btn-outline btn-md gap-2 px-6">
              Create Profile & Match
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Feature Highlights Banner */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-base-content/60">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> No Paid APIs Required
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Zap className="w-4 h-4 text-amber-500" /> Browser-Native Transformers.js
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-blue-500" /> Real Public Postings
            </span>
          </div>
        </div>
      </section>

      {/* Live Discovered Jobs Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-base-content flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-primary" />
              Latest Discovered Opportunities
            </h2>
            <p className="text-xs text-base-content/60 mt-1">
              Synchronized from authentic company job boards and public endpoints.
            </p>
          </div>
          <Link to="/jobs" className="btn btn-outline btn-sm gap-1.5">
            View All Jobs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="card bg-base-200 h-48 animate-pulse p-6"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredJobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                onSelect={(j) => setSelectedJob(j)}
                onSave={() => {}}
              />
            ))}
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="bg-base-200/50 py-16 border-y border-base-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl font-extrabold text-base-content">
              How JobPilot AI Works
            </h2>
            <p className="text-xs text-base-content/60">
              A transparent, private, and explainable job application workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card bg-base-100 p-6 border border-base-300 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-bold text-base text-base-content">Resume Intelligence</h3>
              <p className="text-xs text-base-content/70 leading-relaxed">
                Upload your PDF resume. Our local parser identifies skills, education, and career history for your verification.
              </p>
            </div>

            <div className="card bg-base-100 p-6 border border-base-300 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-bold text-base text-base-content">Multi-Source Ingestion</h3>
              <p className="text-xs text-base-content/70 leading-relaxed">
                Legitimate adapters fetch live jobs from Greenhouse, Lever, Remotive, and Arbeitnow, deduplicating records automatically.
              </p>
            </div>

            <div className="card bg-base-100 p-6 border border-base-300 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-bold text-base text-base-content">Explainable Matching</h3>
              <p className="text-xs text-base-content/70 leading-relaxed">
                AI evaluates skills, years of experience, titles, and compensation to calculate an explainable score with clear rationale.
              </p>
            </div>

            <div className="card bg-base-100 p-6 border border-base-300 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                4
              </div>
              <h3 className="font-bold text-base text-base-content">Kanban Application Tracker</h3>
              <p className="text-xs text-base-content/70 leading-relaxed">
                Manage applications through Saved, Applied, Assessment, Interview, and Offer stages with notes and interview dates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cost & Transparency Commitment */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card bg-gradient-to-br from-base-200 to-base-300 border border-base-300 shadow-xl p-8 sm:p-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="badge badge-success text-white font-bold text-xs">
                100% Free & Open-Source
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-base-content mt-2">
                Zero API Fees. Zero Hidden Upgrades.
              </h2>
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-primary">$0.00</div>
              <span className="text-xs text-base-content/60">Forever free software</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-base-content/70 leading-relaxed">
            JobPilot AI is architected from the ground up to never rely on paid proprietary LLM APIs
            (such as OpenAI or Gemini). All semantic sentence embeddings and parsing run locally inside
            your web browser and server. Job feeds are sourced exclusively through public, open APIs.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-base-100 border border-base-300">
              <p className="font-bold text-sm text-base-content">Browser AI</p>
              <p className="text-xs text-base-content/60 mt-1">Transformers.js runs locally on your device.</p>
            </div>
            <div className="p-4 rounded-xl bg-base-100 border border-base-300">
              <p className="font-bold text-sm text-base-content">Public Job Boards</p>
              <p className="text-xs text-base-content/60 mt-1">Greenhouse, Lever & Remotive endpoints.</p>
            </div>
            <div className="p-4 rounded-xl bg-base-100 border border-base-300">
              <p className="font-bold text-sm text-base-content">Zero-Config DB</p>
              <p className="text-xs text-base-content/60 mt-1">Works out of the box with embedded MongoDB.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center max-w-3xl mx-auto px-4 space-y-5">
        <h2 className="text-3xl font-bold text-base-content">
          Ready to take control of your job search?
        </h2>
        <p className="text-xs sm:text-sm text-base-content/70">
          Create your free professional profile, upload your resume, and discover matching roles in seconds.
        </p>
        <div className="pt-2">
          <Link to="/register" className="btn btn-primary btn-wide shadow-md">
            Get Started For Free
          </Link>
        </div>
      </section>

      {/* Modal */}
      <JobModal
        job={selectedJob}
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        onSaveJob={() => {}}
      />
    </div>
  );
};
