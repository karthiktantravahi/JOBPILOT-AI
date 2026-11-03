import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
        <Compass className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-black text-base-content">404 - Page Not Found</h1>
      <p className="text-xs sm:text-sm text-base-content/60 max-w-md">
        The destination you are navigating to does not exist or has moved.
      </p>
      <Link to="/" className="btn btn-primary btn-sm gap-2">
        <ArrowLeft className="w-4 h-4" /> Return to Discover Jobs
      </Link>
    </div>
  );
};
