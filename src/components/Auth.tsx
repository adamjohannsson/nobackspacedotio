import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useNoteStore } from '../store/noteStore';
import { useThemeStore } from '../store/themeStore';
import { PenTool, ArrowLeft, AlertCircle } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { signIn, signUp, resetPassword } = useAuthStore();
  const { getDraft, createNote, clearDraft } = useNoteStore();
  const { theme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const draft = getDraft();

      if (isForgotPassword) {
        await resetPassword(email);
        setSuccess('Password reset instructions have been sent to your email.');
        return;
      }

      if (isLogin) {
        await signIn(email || 'halfinney@email.com', password || "it's a secret");
        if (draft) {
          navigate('/write', { state: { draft } });
        } else {
          navigate('/dashboard');
        }
      } else {
        await signUp(email || 'halfinney@email.com', password || "it's a secret");
        if (draft) {
          clearDraft();
          navigate('/write', { state: { draft } });
        } else {
          navigate('/write');
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('invalid_credentials')) {
          setError('Invalid email or password. Please try again.');
        } else if (err.message.includes('Email not confirmed')) {
          setError('Please check your email to confirm your account.');
        } else if (err.message.includes('User already registered')) {
          setError('An account with this email already exists. Please sign in instead.');
        } else {
          setError('An error occurred. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleBack = () => {
    if (isForgotPassword) {
      setIsForgotPassword(false);
    } else {
      navigate('/');
    }
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen editor-container flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <button
        onClick={handleBack}
        className="absolute top-4 left-4 p-2 hover:bg-gray-100/10 rounded-lg transition-colors inline-flex items-center space-x-2 opacity-75 hover:opacity-100"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>{isForgotPassword ? 'Back to Sign In' : 'Back to Home'}</span>
      </button>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <PenTool className="h-12 w-12" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold">
          {isForgotPassword 
            ? 'Reset your password'
            : isLogin 
              ? 'Welcome back' 
              : 'Create your account'}
        </h2>
        <p className="mt-2 text-center opacity-75">
          {isForgotPassword 
            ? 'Enter your email to receive reset instructions'
            : isLogin 
              ? 'Sign in to access your notes' 
              : 'Start writing without limits'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="editor-sidebar py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {(error || success) && (
              <div className={`text-sm text-center ${error ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'} p-3 rounded-md`}>
                {error || success}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                className="mt-1 block w-full h-12 rounded-md border border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm editor-input px-4"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="halfinney@email.com"
              />
            </div>

            {!isForgotPassword && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  className="mt-1 block w-full h-12 rounded-md border border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm editor-input px-4"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="it's a secret"
                />
                {!isLogin && (
                  <p className="mt-1 text-sm opacity-75">
                    Password must be at least 6 characters long
                  </p>
                )}
              </div>
            )}

            <div>
              <button
                type="submit"
                className="btn btn-primary w-full h-12"
              >
                {isForgotPassword 
                  ? 'Send Reset Instructions'
                  : isLogin 
                    ? 'Sign in' 
                    : 'Sign up'}
              </button>
            </div>
          </form>

          <div className="mt-6 space-y-4">
            {!isForgotPassword && (
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="w-full text-center text-sm opacity-75 hover:opacity-100 transition-opacity"
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </button>
            )}
            
            {isLogin && !isForgotPassword && (
              <button
                onClick={() => {
                  setIsForgotPassword(true);
                  setError('');
                  setSuccess('');
                }}
                className="w-full text-center text-sm opacity-75 hover:opacity-100 transition-opacity"
              >
                Forgot your password?
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}