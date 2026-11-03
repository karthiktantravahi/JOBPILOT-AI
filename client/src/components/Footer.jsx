import React from 'react';
import { Compass, Github, Shield, Cpu, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-base-200/80 border-t border-base-300 py-12 text-base-content/80 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Mission */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center font-bold">
                <Compass className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-sm tracking-tight text-base-content">
                JOBPILOT AI
              </span>
            </div>
            <p className="text-xs text-base-content/60 leading-relaxed">
              Global AI-powered job discovery and application management platform. 100% Free and Open-Source Software.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-500 font-medium">
              <Shield className="w-3.5 h-3.5" />
              <span>Zero-cost architecture • Privacy first</span>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-base-content mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/jobs" className="hover:text-primary transition-colors">
                  Discover Jobs
                </Link>
              </li>
              <li>
                <Link to="/recommended" className="hover:text-primary transition-colors">
                  Recommended Matches
                </Link>
              </li>
              <li>
                <Link to="/applications" className="hover:text-primary transition-colors">
                  Application Tracker
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="hover:text-primary transition-colors">
                  Real Analytics
                </Link>
              </li>
              <li>
                <Link to="/resume" className="hover:text-primary transition-colors">
                  Resume Intelligence
                </Link>
              </li>
            </ul>
          </div>

          {/* Job Sources */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-base-content mb-3">
              Legitimate Public Sources
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://remotive.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary flex items-center gap-1"
                >
                  Remotive API <ExternalLink className="w-3 h-3 text-base-content/40" />
                </a>
              </li>
              <li>
                <a
                  href="https://boards.greenhouse.io"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary flex items-center gap-1"
                >
                  Greenhouse Public Boards <ExternalLink className="w-3 h-3 text-base-content/40" />
                </a>
              </li>
              <li>
                <a
                  href="https://jobs.lever.co"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary flex items-center gap-1"
                >
                  Lever Postings <ExternalLink className="w-3 h-3 text-base-content/40" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.arbeitnow.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary flex items-center gap-1"
                >
                  Arbeitnow Tech Feeds <ExternalLink className="w-3 h-3 text-base-content/40" />
                </a>
              </li>
            </ul>
          </div>

          {/* Architecture & AI */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-base-content mb-3">
              Open-Source AI & Stack
            </h4>
            <p className="text-xs text-base-content/60 leading-relaxed mb-3">
              Powered by browser-native Transformers.js embeddings, Explainable Matching algorithms, Node.js, Express, and MongoDB.
            </p>
            <div className="flex flex-wrap gap-1.5">
              <span className="badge badge-neutral badge-xs font-mono">React 18</span>
              <span className="badge badge-neutral badge-xs font-mono">Tailwind CSS</span>
              <span className="badge badge-neutral badge-xs font-mono">DaisyUI</span>
              <span className="badge badge-neutral badge-xs font-mono">Transformers.js</span>
              <span className="badge badge-neutral badge-xs font-mono">MongoDB</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-base-300 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-base-content/50">
          <p>© {new Date().getFullYear()} JOBPILOT AI. All rights reserved. Free & Open-Source.</p>
          <div className="flex items-center gap-4">
            <Link to="/settings" className="hover:text-primary">
              AI Settings
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary flex items-center gap-1"
            >
              <Github className="w-3.5 h-3.5" /> Source Code
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
