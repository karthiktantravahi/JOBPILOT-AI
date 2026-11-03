import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Compass, Mail, Lock, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setServerError('');
    try {
      await login(data);
      const from = location.state?.from?.pathname || '/jobs';
      navigate(from, { replace: true });
    } catch (err) {
      if (!err.response) {
        setServerError('Cannot connect to backend API server. Please check that the backend is running.');
      } else {
        setServerError(
          err.response?.data?.message || 'Login failed. Please check your credentials.'
        );
      }
    }
  };

  const handleFillDemo = () => {
    setValue('email', 'alex.johnson@jobpilot.test');
    setValue('password', 'Password123!');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-base-100 p-8 rounded-2xl border border-base-300 shadow-xl">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-accent text-white shadow-md shadow-primary/20">
            <Compass className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-base-content tracking-tight">
            Welcome back to JobPilot AI
          </h2>
          <p className="text-xs text-base-content/60">
            Sign in to track applications and view your AI job matches.
          </p>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="alert alert-error text-xs py-2 shadow-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
          <div>
            <label className="label py-1 font-semibold text-base-content/80">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-base-content/40" />
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: 'Please enter a valid email address',
                  },
                })}
                type="email"
                placeholder="name@example.com"
                className="input input-bordered input-sm w-full pl-9"
              />
            </div>
            {errors.email && (
              <span className="text-error text-[11px] mt-0.5">{errors.email.message}</span>
            )}
          </div>

          <div>
            <label className="label py-1 font-semibold text-base-content/80">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-base-content/40" />
              <input
                {...register('password', { required: 'Password is required' })}
                type="password"
                placeholder="••••••••"
                className="input input-bordered input-sm w-full pl-9"
              />
            </div>
            {errors.password && (
              <span className="text-error text-[11px] mt-0.5">{errors.password.message}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary btn-sm w-full gap-2 shadow-md mt-2"
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Signing In...
              </>
            ) : (
              <>
                Sign In <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo login shortcut */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleFillDemo}
            className="btn btn-outline btn-xs w-full gap-1.5 text-base-content/70"
          >
            <Sparkles className="w-3 h-3 text-primary" /> Fill Demo Account Credentials
          </button>
        </div>

        {/* Footer Link */}
        <div className="text-center text-xs text-base-content/60 pt-2 border-t border-base-300">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};
