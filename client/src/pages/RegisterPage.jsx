import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, User, Mail, Lock, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setServerError('');
    try {
      await registerAuth(data);
      navigate('/resume'); // Direct to resume upload right after registration!
    } catch (err) {
      setServerError(
        err.response?.data?.message || 'Registration failed. Please try a different email.'
      );
    }
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
            Create your JobPilot Account
          </h2>
          <p className="text-xs text-base-content/60">
            Free forever. Discover matching jobs with local AI intelligence.
          </p>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="alert alert-error text-xs py-2 shadow-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
          <div>
            <label className="label py-1 font-semibold text-base-content/80">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-base-content/40" />
              <input
                {...register('name', {
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' },
                })}
                type="text"
                placeholder="e.g. Alex Johnson"
                className="input input-bordered input-sm w-full pl-9"
              />
            </div>
            {errors.name && (
              <span className="text-error text-[11px] mt-0.5">{errors.name.message}</span>
            )}
          </div>

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
                placeholder="alex.johnson@example.com"
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
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' },
                })}
                type="password"
                placeholder="Minimum 6 characters"
                className="input input-bordered input-sm w-full pl-9"
              />
            </div>
            {errors.password && (
              <span className="text-error text-[11px] mt-0.5">{errors.password.message}</span>
            )}
          </div>

          <div className="p-3 rounded-lg bg-base-200 text-[11px] text-base-content/70 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>
              Your profile data and uploaded resume remain 100% private. We never sell data or send unsolicited emails.
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary btn-sm w-full gap-2 shadow-md mt-2"
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Creating Account...
              </>
            ) : (
              <>
                Create Free Account <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center text-xs text-base-content/60 pt-2 border-t border-base-300">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
