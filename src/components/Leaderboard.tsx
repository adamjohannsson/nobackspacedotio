import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { 
  PenTool, 
  Trophy,
  Users,
  FileText,
  Type,
  Delete,
  Calendar,
  Flame,
  SwitchCamera,
  ArrowLeft,
  AlertCircle,
  Menu,
  X,
  Hash,
  AtSign,
  Target,
  Award
} from 'lucide-react';

interface GlobalStats {
  totalUsers: number;
  totalNotes: number;
  totalCharacters: number;
  avgNotesPerDay: number;
  avgCharactersPerNote: number;
  avgBackspacesPerNote: number;
}

interface UserRanking {
  username: string;
  streak: number;
  avg_characters: number;
  backspaces_per_note: number;
}

const USER_LIMIT = 20;

function RankingCard({ rank, user, showStreaks }: { 
  rank: number; 
  user: UserRanking; 
  showStreaks: boolean;
}) {
  return (
    <div className="editor-sidebar rounded-lg p-4">
      <div className="flex items-center space-x-3 mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
            <span className="font-medium text-sm">#{rank}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-1">
              <AtSign className="h-4 w-4 opacity-75 flex-shrink-0" />
              <span className="font-medium truncate">{user.username}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="min-w-0">
          <div className="flex items-center space-x-1 text-sm opacity-75 mb-1">
            <Target className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Avg. Characters</span>
          </div>
          <div className="font-medium">{user.avg_characters.toLocaleString()}</div>
        </div>
        <div className="min-w-0">
          <div className="flex items-center space-x-1 text-sm opacity-75 mb-1">
            {showStreaks ? (
              <>
                <Flame className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Day Streak</span>
              </>
            ) : (
              <>
                <Delete className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Backspaces/Note</span>
              </>
            )}
          </div>
          <div className="font-medium">
            {showStreaks 
              ? user.streak 
              : user.backspaces_per_note.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [loadingRankings, setLoadingRankings] = useState(true);
  const [showStreaks, setShowStreaks] = useState(true);
  const [rankings, setRankings] = useState<UserRanking[]>([]);
  const [userHasUsername, setUserHasUsername] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [stats, setStats] = useState<GlobalStats>({
    totalUsers: 0,
    totalNotes: 0,
    totalCharacters: 0,
    avgNotesPerDay: 0,
    avgCharactersPerNote: 0,
    avgBackspacesPerNote: 0
  });

  useEffect(() => {
    const checkUsername = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .maybeSingle();

      setUserHasUsername(!!data?.username);
    };

    checkUsername();
  }, [user]);

  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        const { count: userCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        const { data: notes } = await supabase
          .from('notes')
          .select('content, backspace_count, created_at');

        if (!notes) {
          setLoading(false);
          return;
        }

        const totalNotes = notes.length;
        const totalCharacters = notes.reduce((sum, note) => sum + note.content.length, 0);
        const totalBackspaces = notes.reduce((sum, note) => sum + note.backspace_count, 0);

        const dates = notes.map(note => new Date(note.created_at));
        const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
        const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
        const daysDiff = Math.max(1, Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)));

        setStats({
          totalUsers: userCount || 0,
          totalNotes,
          totalCharacters,
          avgNotesPerDay: Math.round((totalNotes / daysDiff) * 10) / 10,
          avgCharactersPerNote: Math.round(totalCharacters / totalNotes),
          avgBackspacesPerNote: Math.round(totalBackspaces / totalNotes)
        });

      } catch (error) {
        console.error('Error fetching global stats:', error);
      }

      setLoading(false);
    };

    const fetchRankings = async () => {
      try {
        const { data: userStats } = await supabase
          .from('user_stats')
          .select(`
            username,
            streak,
            avg_characters,
            backspaces_per_note
          `)
          .order(showStreaks ? 'streak' : 'backspaces_per_note', { ascending: !showStreaks })
          .limit(USER_LIMIT);

        if (userStats) {
          setRankings(userStats);
        }
      } catch (error) {
        console.error('Error fetching rankings:', error);
      }

      setLoadingRankings(false);
    };

    fetchGlobalStats();
    fetchRankings();
  }, [showStreaks]);

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
                onClick={() => navigate(user ? '/dashboard' : '/')}
                className="btn btn-secondary inline-flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to {user ? 'Dashboard' : 'Home'}</span>
              </button>
              <button
                onClick={() => navigate('/write')}
                className="btn btn-primary"
              >
                Start Writing
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
                  navigate(user ? '/dashboard' : '/');
                  setShowMobileMenu(false);
                }}
                className="w-full btn btn-secondary inline-flex items-center justify-between"
              >
                <span className="inline-flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to {user ? 'Dashboard' : 'Home'}</span>
                </span>
              </button>
              <button
                onClick={() => {
                  navigate('/write');
                  setShowMobileMenu(false);
                }}
                className="w-full btn btn-primary"
              >
                Start Writing
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4">
        {user && !userHasUsername && (
          <div className="mb-8 p-4 editor-sidebar rounded-lg border-l-4 border-yellow-500 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium mb-1">Set up your profile to appear on the leaderboard</h3>
              <p className="opacity-75 mb-3">You need to set a username in your profile to be included in the rankings.</p>
              <button
                onClick={() => navigate('/account')}
                className="btn btn-secondary text-sm"
              >
                Complete Profile
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-8">
          <div className="flex items-center space-x-3">
            <Trophy className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Global Stats</h1>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-pulse opacity-75">Loading global stats...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            <div className="editor-sidebar rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Users className="h-5 w-5 opacity-75" />
                <h3 className="font-medium">Community</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                  <div className="text-sm opacity-75">Total Users</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.totalNotes.toLocaleString()}</div>
                  <div className="text-sm opacity-75">Total Notes</div>
                </div>
              </div>
            </div>

            <div className="editor-sidebar rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Type className="h-5 w-5 opacity-75" />
                <h3 className="font-medium">Writing</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-2xl font-bold">{stats.totalCharacters.toLocaleString()}</div>
                  <div className="text-sm opacity-75">Total Characters</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.avgCharactersPerNote.toLocaleString()}</div>
                  <div className="text-sm opacity-75">Avg. Characters per Note</div>
                </div>
              </div>
            </div>

            <div className="editor-sidebar rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Calendar className="h-5 w-5 opacity-75" />
                <h3 className="font-medium">Activity</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-2xl font-bold">{stats.avgNotesPerDay.toLocaleString()}</div>
                  <div className="text-sm opacity-75">Avg. Notes per Day</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.avgBackspacesPerNote.toLocaleString()}</div>
                  <div className="text-sm opacity-75">Avg. Backspaces per Note</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div className="flex items-center space-x-3">
            <Flame className="h-8 w-8" />
            <h2 className="text-3xl font-bold">Leaderboard</h2>
          </div>
          <button
            onClick={() => setShowStreaks(!showStreaks)}
            className="btn btn-secondary inline-flex items-center space-x-2 w-full sm:w-auto justify-center"
          >
            <SwitchCamera className="h-4 w-4" />
            <span>{showStreaks ? 'Show Backspaces' : 'Show Streaks'}</span>
          </button>
        </div>

        {loadingRankings ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse opacity-75">Loading rankings...</div>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="sm:hidden space-y-4">
              {rankings.map((user, index) => (
                <RankingCard
                  key={user.username}
                  rank={index + 1}
                  user={user}
                  showStreaks={showStreaks}
                />
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block editor-sidebar rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-4 text-left font-medium">Rank</th>
                      <th className="p-4 text-left font-medium">Username</th>
                      <th className="p-4 text-right font-medium whitespace-nowrap">Avg. Characters</th>
                      <th className="p-4 text-right font-medium whitespace-nowrap">
                        {showStreaks ? 'Streak (days)' : 'Backspaces/Note'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankings.map((user, index) => (
                      <tr key={user.username} className={index < rankings.length - 1 ? 'border-b' : ''}>
                        <td className="p-4 font-medium">#{index + 1}</td>
                        <td className="p-4">@{user.username}</td>
                        <td className="p-4 text-right">{user.avg_characters.toLocaleString()}</td>
                        <td className="p-4 text-right">
                          {showStreaks 
                            ? user.streak 
                            : user.backspaces_per_note.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}