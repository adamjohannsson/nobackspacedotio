import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Trophy,
  Users,
  FileText,
  Type,
  Delete,
  Crown,
  Flame,
  Rocket,
  ChevronRight
} from 'lucide-react';

// Types remain the same
interface GlobalStats {
  totalNotes: number;
  totalCharacters: number;
  avgCharactersPerNote: number;
  avgBackspacesPerNote: number;
}

interface UserRanking {
  username: string;
  streak: number;
  avg_characters: number;
}

// Updated Stat Card for better mobile display
function StatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon?: React.ElementType }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <div className="flex items-center space-x-2 min-w-0 flex-1">
        {Icon && <Icon className="h-4 w-4 opacity-75 flex-shrink-0" />}
        <span className="text-sm opacity-75 truncate">{label}</span>
      </div>
      <span className="text-sm font-medium ml-2 flex-shrink-0">{value.toLocaleString()}</span>
    </div>
  );
}

// Updated Top Writer Card for better mobile display
function TopWriterCard({ rank, username, avgCharacters, streak }: { 
  rank: number; 
  username: string; 
  avgCharacters: number; 
  streak: number;
}) {
  return (
    <div className="flex flex-col p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <div className="flex items-center space-x-3 min-w-0">
        <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-medium text-sm flex-shrink-0">
          {rank}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-sm truncate">@{username}</div>
          <div className="flex items-center justify-between mt-1">
            <div className="text-xs opacity-75">
              {avgCharacters.toLocaleString()} chars/note
            </div>
            <div className="flex items-center space-x-1 text-xs">
              <Flame className="h-3 w-3 text-orange-500 flex-shrink-0" />
              <span>{streak} day streak</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Updated Empty Leaderboard for better mobile display
function EmptyLeaderboard({ onStartWriting }: { onStartWriting: () => void }) {
  return (
    <div className="text-center py-4">
      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
        <Rocket className="h-6 w-6 text-orange-500" />
      </div>
      <h4 className="font-semibold mb-2 text-sm">Be Our First Champion!</h4>
      <p className="text-sm opacity-75 mb-3 max-w-[200px] mx-auto">
        Start your journey to the top of the leaderboard today.
      </p>
      <button
        onClick={onStartWriting}
        className="btn btn-primary inline-flex items-center space-x-2 text-sm"
      >
        <Crown className="h-4 w-4" />
        <span>Claim #1 Spot</span>
      </button>
    </div>
  );
}

// Updated Loading State for better mobile display
function LoadingState() {
  return (
    <div className="editor-sidebar rounded-xl p-4">
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-5 w-1/2 bg-gray-100 dark:bg-gray-800 rounded"></div>
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 dark:bg-gray-800 rounded"></div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-5 w-1/2 bg-gray-100 dark:bg-gray-800 rounded"></div>
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Component with improved mobile layout
export default function CommunityStats() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<GlobalStats>({
    totalNotes: 0,
    totalCharacters: 0,
    avgCharactersPerNote: 0,
    avgBackspacesPerNote: 0
  });
  const [topUsers, setTopUsers] = useState<UserRanking[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
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

        setStats({
          totalNotes,
          totalCharacters,
          avgCharactersPerNote: Math.round(totalCharacters / totalNotes),
          avgBackspacesPerNote: Math.round(totalBackspaces / totalNotes)
        });

        const { data: rankings } = await supabase
          .from('user_stats')
          .select('*')
          .order('streak', { ascending: false })
          .limit(3);

        if (rankings) {
          setTopUsers(rankings);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }

      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="editor-sidebar rounded-xl p-4 sm:p-6">
      {/* Header with improved mobile layout */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6" />
          <h2 className="text-xl font-bold">Community</h2>
        </div>
        <button
          onClick={() => navigate('/leaderboard')}
          className="btn btn-secondary inline-flex items-center justify-center space-x-2 w-full sm:w-auto text-sm"
        >
          <Trophy className="h-4 w-4" />
          <span>View Leaderboard</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Content with improved mobile layout */}
      <div className="space-y-6">
        {/* Global Stats */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 opacity-75" />
            <h3 className="text-sm font-semibold">Global Stats</h3>
          </div>
          <div className="space-y-1">
            <StatCard label="Total Notes" value={stats.totalNotes} icon={FileText} />
            <StatCard label="Characters Written" value={stats.totalCharacters} icon={Type} />
            <StatCard label="Avg. Characters/Note" value={stats.avgCharactersPerNote} />
            <StatCard label="Avg. Backspaces/Note" value={stats.avgBackspacesPerNote} icon={Delete} />
          </div>
        </div>

        {/* Top Writers */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Crown className="h-4 w-4 opacity-75" />
            <h3 className="text-sm font-semibold">Top Writers</h3>
          </div>
          {topUsers.length > 0 ? (
            <div className="space-y-2">
              {topUsers.map((user, index) => (
                <TopWriterCard
                  key={user.username}
                  rank={index + 1}
                  username={user.username}
                  avgCharacters={user.avg_characters}
                  streak={user.streak}
                />
              ))}
            </div>
          ) : (
            <EmptyLeaderboard onStartWriting={() => navigate('/write')} />
          )}
        </div>
      </div>
    </div>
  );
}