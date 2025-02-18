import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { 
  PenTool, 
  LogOut, 
  Settings,
  BarChart2,
  FileText,
  Delete,
  Type,
  Flame,
  ArrowLeft,
  Menu,
  X,
  Trophy
} from 'lucide-react';

interface StatsData {
  totalNotes: number;
  totalCharacters: number;
  totalBackspaces: number;
  avgCharactersPerNote: number;
  avgBackspacesPerNote: number;
  longestStreak: number;
}

export default function Stats() {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [stats, setStats] = useState<StatsData>({
    totalNotes: 0,
    totalCharacters: 0,
    totalBackspaces: 0,
    avgCharactersPerNote: 0,
    avgBackspacesPerNote: 0,
    longestStreak: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        const { data: notes, error } = await supabase
          .from('notes')
          .select('content, backspace_count, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (error) throw error;

        if (!notes || notes.length === 0) {
          setLoading(false);
          return;
        }

        const totalCharacters = notes.reduce((sum, note) => sum + note.content.length, 0);
        const totalBackspaces = notes.reduce((sum, note) => sum + note.backspace_count, 0);

        let currentStreak = 1;
        let longestStreak = 1;
        let lastDate = new Date(notes[0].created_at);

        for (let i = 1; i < notes.length; i++) {
          const currentDate = new Date(notes[i].created_at);
          const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            currentStreak++;
            longestStreak = Math.max(longestStreak, currentStreak);
          } else if (diffDays > 1) {
            currentStreak = 1;
          }
          
          lastDate = currentDate;
        }

        setStats({
          totalNotes: notes.length,
          totalCharacters,
          totalBackspaces,
          avgCharactersPerNote: Math.round(totalCharacters / notes.length),
          avgBackspacesPerNote: Math.round(totalBackspaces / notes.length),
          longestStreak
        });

      } catch (error) {
        console.error('Error fetching stats:', error);
      }

      setLoading(false);
    };

    fetchStats();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen editor-container">
      <header className="editor-header border-b">
        <div className="max-w-7xl mx-auto px-4 h-18">
          <div className="flex justify-between items-center h-full">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
              <PenTool className="h-6 w-6" />
              <span className="text-xl font-semibold hidden sm:inline">nobackspace.io</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="btn btn-secondary inline-flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </button>
              <button
                onClick={() => navigate('/account')}
                className="btn btn-secondary inline-flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Account</span>
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
                  navigate('/dashboard');
                  setShowMobileMenu(false);
                }}
                className="w-full btn btn-secondary inline-flex items-center justify-between"
              >
                <span className="inline-flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Dashboard</span>
                </span>
              </button>
              <button
                onClick={() => {
                  navigate('/account');
                  setShowMobileMenu(false);
                }}
                className="w-full btn btn-secondary inline-flex items-center justify-between"
              >
                <span className="inline-flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Account</span>
                </span>
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
          <BarChart2 className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Your Stats</h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse opacity-75">Loading stats...</div>
          </div>
        ) : stats.totalNotes === 0 ? (
          <div className="editor-sidebar rounded-lg p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 opacity-75" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No Stats Yet</h2>
            <p className="opacity-75 mb-6">Start writing to see your statistics here.</p>
            <button
              onClick={() => navigate('/write')}
              className="btn btn-primary"
            >
              Start Writing
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {/* Writing Stats */}
            <div className="editor-sidebar rounded-lg overflow-hidden">
              <div className="p-4 sm:p-6 border-b">
                <div className="flex items-center space-x-2 mb-4">
                  <FileText className="h-5 w-5 opacity-75" />
                  <h2 className="text-lg font-semibold">Writing Stats</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <div className="text-2xl font-bold">{stats.totalNotes}</div>
                    <div className="text-sm opacity-75">Total Notes</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.totalCharacters.toLocaleString()}</div>
                    <div className="text-sm opacity-75">Characters</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.avgCharactersPerNote.toLocaleString()}</div>
                    <div className="text-sm opacity-75">Avg. Chars/Note</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.longestStreak}</div>
                    <div className="text-sm opacity-75">Day Streak</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Backspace Stats */}
            <div className="editor-sidebar rounded-lg overflow-hidden">
              <div className="p-4 sm:p-6 border-b">
                <div className="flex items-center space-x-2 mb-4">
                  <Delete className="h-5 w-5 opacity-75" />
                  <h2 className="text-lg font-semibold">Backspace Stats</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold">{stats.totalBackspaces.toLocaleString()}</div>
                    <div className="text-sm opacity-75">Total Backspaces</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.avgBackspacesPerNote.toLocaleString()}</div>
                    <div className="text-sm opacity-75">Avg. Backspaces/Note</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/write')}
                className="btn btn-primary h-12"
              >
                Start Writing
              </button>
              <button
                onClick={() => navigate('/leaderboard')}
                className="btn btn-secondary h-12 inline-flex items-center justify-center space-x-2"
              >
                <Trophy className="h-4 w-4" />
                <span>View Leaderboard</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}