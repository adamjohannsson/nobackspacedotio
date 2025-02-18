import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { supabase } from '../lib/supabase';
import { 
  User, 
  Settings, 
  Mail, 
  Key, 
  CreditCard, 
  Bell,
  ChevronRight,
  PenTool,
  LogOut,
  AtSign,
  Crown,
  Menu,
  X,
  Sun,
  Moon,
  Monitor,
  Coffee,
  Type,
  Trophy,
  Sparkles,
  HelpCircle
} from 'lucide-react';

type Font = 'sans' | 'montserrat' | 'roboto-mono' | 'courier-prime';

const FONTS: Font[] = ['sans', 'montserrat', 'roboto-mono', 'courier-prime'];
const THEMES = [
  { id: 'light', icon: Sun, label: 'Light' },
  { id: 'dark', icon: Moon, label: 'Dark' },
  { id: 'dim', icon: Monitor, label: 'Dim' },
  { id: 'cream', icon: Coffee, label: 'Cream' }
] as const;

export default function Account() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const { theme, font, setTheme, setFont } = useThemeStore();
  const [loading, setLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [profile, setProfile] = useState({
    username: '',
    full_name: '',
    email_marketing: false,
    is_premium: false
  });

  // Check if user is coming from password reset
  const isPasswordReset = location.search.includes('type=recovery') || location.search.includes('reset=true');

  useEffect(() => {
    if (isPasswordReset) {
      setShowChangePassword(true);
      // Clear any existing password form data
      setPasswordForm({ current: '', new: '', confirm: '' });
    }
  }, [isPasswordReset]);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (!error && data) {
          setProfile({
            username: data.username || '',
            full_name: data.full_name || '',
            email_marketing: data.email_marketing || false,
            is_premium: data.is_premium || false
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (!profile.username) {
      setUsernameAvailable(true);
      return;
    }

    const checkUsername = async () => {
      setCheckingUsername(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', profile.username)
          .neq('id', user?.id || '')
          .maybeSingle();

        setUsernameAvailable(!data);
      } catch (error) {
        console.error('Error checking username:', error);
        setUsernameAvailable(false);
      }
      setCheckingUsername(false);
    };

    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [profile.username, user?.id]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !usernameAvailable) return;

    setLoading(true);
    setError('');
    setSuccess('');

    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(profile.username)) {
      setError('Username must be 3-20 characters long and can only contain letters, numbers, and underscores');
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        username: profile.username,
        full_name: profile.full_name,
        email_marketing: profile.email_marketing,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      setError('Failed to update profile. Please try again.');
    } else {
      setSuccess('Profile updated successfully!');
    }
    setLoading(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');
    setSuccess('');

    if (passwordForm.new !== passwordForm.confirm) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordForm.new.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.new
      });

      if (error) throw error;

      setSuccess('Password updated successfully!');
      setShowChangePassword(false);
      setPasswordForm({ current: '', new: '', confirm: '' });
      
      // Clear the reset parameter from URL
      if (isPasswordReset) {
        navigate('/account', { replace: true });
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(`Failed to update password. Please try again. ${error.message}`);
      } else {
        setError('Failed to update password. Please try again.');
      }
    }
    
    setLoading(false);
  };

  const handleFontChange = (newFont: Font) => {
    setFont(newFont);
    setSuccess('Preferences updated successfully!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleThemeChange = (newTheme: typeof THEMES[number]['id']) => {
    setTheme(newTheme);
    setSuccess('Preferences updated successfully!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleContactSupport = () => {
    window.location.href = 'mailto:hey@nobackspace.io';
  };

  const handleCancelPasswordChange = () => {
    setShowChangePassword(false);
    setPasswordForm({ current: '', new: '', confirm: '' });
    if (isPasswordReset) {
      navigate('/account', { replace: true });
    }
  };

  // If user is not authenticated and not in password reset flow, redirect to auth
  useEffect(() => {
    if (!user && !isPasswordReset) {
      navigate('/auth');
    }
  }, [user, isPasswordReset, navigate]);

  return (
    <div className="min-h-screen editor-container">
      <header className="editor-header border-b">
        <div className="max-w-7xl mx-auto px-4 h-18">
          <div className="flex justify-between items-center h-full">
            <div 
              className="flex items-center space-x-3 cursor-pointer" 
              onClick={() => navigate('/')}
            >
              <PenTool className="h-6 w-6" />
              <span className="text-xl font-semibold hidden sm:inline">nobackspace.io</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center space-x-4">
              <button
                onClick={() => navigate('/leaderboard')}
                className="btn btn-secondary inline-flex items-center space-x-2"
              >
                <Trophy className="h-4 w-4" />
                <span>Leaderboard</span>
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="btn btn-secondary"
              >
                Dashboard
              </button>
              <button
                onClick={handleSignOut}
                className="btn btn-secondary inline-flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="sm:hidden p-2 hover:bg-gray-100/10 rounded-lg transition-colors"
            >
              {showMobileMenu ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="sm:hidden border-t">
            <div className="px-4 py-2 space-y-2">
              <button
                onClick={() => {
                  navigate('/leaderboard');
                  setShowMobileMenu(false);
                }}
                className="w-full btn btn-secondary inline-flex items-center justify-between"
              >
                <span className="inline-flex items-center space-x-2">
                  <Trophy className="h-4 w-4" />
                  <span>Leaderboard</span>
                </span>
              </button>
              <button
                onClick={() => {
                  navigate('/dashboard');
                  setShowMobileMenu(false);
                }}
                className="w-full btn btn-secondary inline-flex items-center justify-between"
              >
                <span>Dashboard</span>
              </button>
              <button
                onClick={handleSignOut}
                className="w-full btn btn-secondary inline-flex items-center justify-between"
              >
                <span className="inline-flex items-center space-x-2">
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </span>
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-3xl mx-auto py-8 px-4">
        <div className="flex items-center space-x-3 mb-8">
          <Settings className="h-8 w-8" />
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold">Account Settings</h1>
            {profile.is_premium && (
              <div className="flex items-center bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                <Sparkles className="h-4 w-4 mr-1" />
                Premium
              </div>
            )}
          </div>
        </div>

        {(error || success) && (
          <div className={`p-4 rounded-lg mb-6 ${error ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            {error || success}
          </div>
        )}

        <div className="space-y-6">
          {/* Appearance Section */}
          <section className="editor-sidebar rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Type className="h-5 w-5 mr-2" />
              Appearance
            </h2>
            <div className="space-y-6">
              {/* Theme Selection */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Theme
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {THEMES.map(({ id, icon: Icon, label }) => (
                    <button
                      key={id}
                      onClick={() => handleThemeChange(id)}
                      className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                        theme === id 
                          ? 'bg-gray-900 dark:bg-white border-gray-900 dark:border-white text-white dark:text-gray-900' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Selection */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Font
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {FONTS.map((fontOption) => (
                    <button
                      key={fontOption}
                      onClick={() => handleFontChange(fontOption)}
                      className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                        font === fontOption 
                          ? 'bg-gray-900 dark:bg-white border-gray-900 dark:border-white text-white dark:text-gray-900' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <Type className="h-5 w-5" />
                      <span className={`font-${fontOption}`}>
                        {fontOption.split('-').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Profile Section */}
          <section className="editor-sidebar rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Profile Information
            </h2>
            <form onSubmit={updateProfile} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-1">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AtSign className="h-4 w-4 opacity-50" />
                  </div>
                  <input
                    type="text"
                    id="username"
                    className={`w-full pl-9 rounded-lg border shadow-sm editor-input ${
                      !usernameAvailable ? 'border-red-300' : 'border-gray-300'
                    }`}
                    value={profile.username}
                    onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                    placeholder="your_username"
                    pattern="^[a-zA-Z0-9_]{3,20}$"
                    required
                  />
                </div>
                {checkingUsername ? (
                  <p className="mt-1 text-sm opacity-75">Checking availability...</p>
                ) : !usernameAvailable ? (
                  <p className="mt-1 text-sm text-red-600">This username is already taken</p>
                ) : profile.username && (
                  <p className="mt-1 text-sm text-green-600">Username is available</p>
                )}
                <p className="mt-1 text-sm opacity-75">
                  3-20 characters, letters, numbers, and underscores only
                </p>
              </div>
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="full_name"
                  className="w-full rounded-lg border border-gray-300 shadow-sm editor-input"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full rounded-lg border border-gray-300 shadow-sm editor-input opacity-75"
                  value={user?.email || ''}
                  disabled
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary w-full sm:w-auto" 
                disabled={loading || !usernameAvailable}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </section>

          {/* Password Section */}
          {isPasswordReset ? (
            <section className="editor-sidebar rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <Key className="h-5 w-5 mr-2" />
                Set New Password
              </h2>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label htmlFor="new_password" className="block text-sm font-medium mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="new_password"
                    className="w-full rounded-lg border border-gray-300 shadow-sm editor-input"
                    value={passwordForm.new}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                    required
                    minLength={6}
                    autoFocus
                  />
                </div>
                <div>
                  <label htmlFor="confirm_password" className="block text-sm font-medium mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirm_password"
                    className="w-full rounded-lg border border-gray-300 shadow-sm editor-input"
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={loading}>
                    {loading ? 'Updating...' : 'Set Password'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelPasswordChange}
                    className="btn btn-secondary w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </section>
          ) : (
            <section className="editor-sidebar rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <Key className="h-5 w-5 mr-2" />
                Password
              </h2>
              {!showChangePassword ? (
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="btn btn-secondary inline-flex items-center w-full sm:w-auto justify-center"
                >
                  Change Password
                  <ChevronRight className="h-4 w-4 ml-2" />
                </button>
              ) : (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label htmlFor="current_password" className="block text-sm font-medium mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="current_password"
                      className="w-full rounded-lg border border-gray-300 shadow-sm editor-input"
                      value={passwordForm.current}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="new_password" className="block text-sm font-medium mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="new_password"
                      className="w-full rounded-lg border border-gray-300 shadow-sm editor-input"
                      value={passwordForm.new}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                  <div>
                    <label htmlFor="confirm_password" className="block text-sm font-medium mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirm_password"
                      className="w-full rounded-lg border border-gray-300 shadow-sm editor-input"
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={loading}>
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelPasswordChange}
                      className="btn btn-secondary w-full sm:w-auto"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </section>
          )}

          {/* Notifications Section */}
          <section className="editor-sidebar rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notifications
            </h2>
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-gray-900 shadow-sm"
                  checked={profile.email_marketing}
                  onChange={(e) => setProfile({ ...profile, email_marketing: e.target.checked })}
                />
                <span>Receive updates about new features and writing tips</span>
              </label>
              <button onClick={updateProfile} className="btn btn-primary w-full sm:w-auto" disabled={loading}>
                {loading ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </section>

          {/* Subscription Section */}
          <section className="editor-sidebar rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Subscription
            </h2>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="mb-4 sm:mb-0">
                  {profile.is_premium ? (
                    <>
                      <p className="font-medium">Premium Plan</p>
                      <p className="text-sm opacity-75">Unlimited notes and premium features</p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium">Free Plan</p>
                      <p className="text-sm opacity-75">Basic writing features</p>
                    </>
                  )}
                </div>
                <div className="flex flex-col items-stretch sm:items-end space-y-2">
                  {profile.is_premium ? (
                    <div className="text-lg font-bold">Premium Active</div>
                  ) : (
                    <>
                      <div className="text-lg font-bold">$10<span className="text-sm opacity-75">/month</span></div>
                      <stripe-buy-button
                        buy-button-id="buy_btn_1QqLR0EWwDIsISN7FeurKkbs"
                        publishable-key="pk_live_51OG4stEWwDIsISN7XykWAuxMFMMzlJ1MSTq9HqJQQQdOPyZtz3pYsTBSmHz6JjIKO7ZVYnlpJM80N4V2LxHGVehN00VbWGtNyC"
                      >
                      </stripe-buy-button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Support Section */}
          <section className="editor-sidebar rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <HelpCircle className="h-5 w-5 mr-2" />
              Support
            </h2>
            <div className="space-y-4">
              <p className="opacity-75">
                Need help? Have a feature request? We're here to help!
              </p>
              <button
                onClick={handleContactSupport}
                className="btn btn-secondary inline-flex items-center space-x-2"
              >
                <Mail className="h-4 w-4" />
                <span>Contact Support</span>
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}