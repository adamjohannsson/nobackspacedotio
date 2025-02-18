import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNoteStore } from '../store/noteStore';
import { useAuthStore } from '../store/authStore';
import { 
  PenTool, 
  LogOut, 
  Delete, 
  Settings, 
  BarChart2, 
  Plus, 
  Trophy,
  LayoutGrid,
  List,
  Calendar,
  Type,
  ArrowUp,
  ArrowDown,
  Search,
  FileText,
  Menu,
  X
} from 'lucide-react';

export default function Dashboard() {
  const { notes, loading, fetchNotes } = useNoteStore();
  const { signOut } = useAuthStore();
  const navigate = useNavigate();
  const [isGridView, setIsGridView] = useState(true);
  const [sortField, setSortField] = useState<'created_at' | 'title'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScope, setSearchScope] = useState<'title' | 'all'>('all');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getWordCount = (content: string) => {
    return content.trim() ? content.trim().split(/\s+/).length : 0;
  };

  const handleNewNote = () => {
    navigate('/write');
  };

  const handleNoteClick = (note: typeof notes[0]) => {
    navigate('/write', { state: { note } });
  };

  const toggleSort = (field: 'created_at' | 'title') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const highlightSearchTerm = (text: string) => {
    if (!searchQuery) return text;
    
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === searchQuery.toLowerCase() ? 
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">{part}</mark> : 
        part
    );
  };

  const filteredAndSortedNotes = [...notes]
    .filter(note => {
      const query = searchQuery.toLowerCase();
      if (!query) return true;
      
      if (searchScope === 'title') {
        return note.title.toLowerCase().includes(query);
      }
      
      return (
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      if (sortField === 'created_at') {
        return sortDirection === 'asc'
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return sortDirection === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
    });

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
                onClick={() => navigate('/leaderboard')}
                className="btn btn-secondary inline-flex items-center space-x-2"
              >
                <Trophy className="h-4 w-4" />
                <span>Leaderboard</span>
              </button>
              <button
                onClick={() => navigate('/stats')}
                className="btn btn-secondary inline-flex items-center space-x-2"
              >
                <BarChart2 className="h-4 w-4" />
                <span>Stats</span>
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
                  navigate('/stats');
                  setShowMobileMenu(false);
                }}
                className="w-full btn btn-secondary inline-flex items-center justify-between"
              >
                <span className="inline-flex items-center space-x-2">
                  <BarChart2 className="h-4 w-4" />
                  <span>Stats</span>
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

      <main className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex flex-col space-y-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <h1 className="text-3xl font-bold">Your Notes</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleNewNote}
                className="btn btn-primary inline-flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>New Note</span>
              </button>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsGridView(true)}
                  className={`view-toggle-button ${isGridView ? 'active' : ''}`}
                  title="Grid view"
                >
                  <LayoutGrid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setIsGridView(false)}
                  className={`view-toggle-button ${!isGridView ? 'active' : ''}`}
                  title="List view"
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 opacity-40" />
              </div>
              <input
                type="text"
                placeholder={`Search notes by ${searchScope === 'title' ? 'title' : 'title and content'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border editor-input focus:ring-1 focus:ring-gray-900 dark:focus:ring-white"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSearchScope('title')}
                className={`btn ${
                  searchScope === 'title' 
                    ? 'btn-primary' 
                    : 'btn-secondary'
                } inline-flex items-center space-x-2 text-sm`}
              >
                <FileText className="h-4 w-4" />
                <span>Search Titles</span>
              </button>
              <button
                onClick={() => setSearchScope('all')}
                className={`btn ${
                  searchScope === 'all' 
                    ? 'btn-primary' 
                    : 'btn-secondary'
                } inline-flex items-center space-x-2 text-sm`}
              >
                <Search className="h-4 w-4" />
                <span>Search All</span>
              </button>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse opacity-75">Loading notes...</div>
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="opacity-75 mb-4">You haven't written any notes yet.</p>
            <button
              onClick={handleNewNote}
              className="btn btn-primary"
            >
              Start writing
            </button>
          </div>
        ) : filteredAndSortedNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="opacity-75">No notes found matching "{searchQuery}"</p>
          </div>
        ) : isGridView ? (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <div
              onClick={handleNewNote}
              className="editor-sidebar rounded-lg p-6 border-2 border-dashed border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 flex flex-col items-center justify-center text-center cursor-pointer transition-colors h-[220px]"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Plus className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-semibold mb-2">Create New Note</h2>
              <p className="text-sm opacity-75">Start writing without looking back</p>
            </div>

            {filteredAndSortedNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => handleNoteClick(note)}
                className="editor-sidebar rounded-lg p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                <h2 className="text-lg font-semibold mb-2">
                  {highlightSearchTerm(note.title)}
                </h2>
                <p className="opacity-75 mb-4 line-clamp-3">
                  {highlightSearchTerm(note.content)}
                </p>
                <div className="flex justify-between items-center">
                  <time className="text-sm opacity-50">
                    {formatDate(note.created_at)}
                  </time>
                  <div className="flex items-center space-x-1.5 opacity-50">
                    <Delete className="h-4 w-4" />
                    <span className="text-sm">{note.backspace_count} attempts</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="editor-sidebar rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              {/* Desktop Table */}
              <table className="w-full hidden sm:table">
                <thead>
                  <tr className="border-b">
                    <th className="p-4 text-left font-medium">
                      <button 
                        onClick={() => toggleSort('title')}
                        className="inline-flex items-center space-x-2 hover:opacity-75 transition-opacity"
                      >
                        <span>Title</span>
                        {sortField === 'title' && (
                          sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="p-4 text-left font-medium whitespace-nowrap">
                      <button 
                        onClick={() => toggleSort('created_at')}
                        className="inline-flex items-center space-x-2 hover:opacity-75 transition-opacity"
                      >
                        <Calendar className="h-4 w-4" />
                        <span>Date</span>
                        {sortField === 'created_at' && (
                          sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="p-4 text-right font-medium whitespace-nowrap">
                      <div className="inline-flex items-center space-x-2">
                        <Type className="h-4 w-4" />
                        <span>Words</span>
                      </div>
                    </th>
                    <th className="p-4 text-right font-medium whitespace-nowrap">
                      <div className="inline-flex items-center space-x-2">
                        <Delete className="h-4 w-4" />
                        <span>Backspaces</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedNotes.map((note) => (
                    <tr 
                      key={note.id}
                      onClick={() => handleNoteClick(note)}
                      className="border-b cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="p-4 font-medium">
                        {highlightSearchTerm(note.title)}
                        {searchScope === 'all' && searchQuery && note.content.toLowerCase().includes(searchQuery.toLowerCase()) && (
                          <p className="text-sm opacity-75 mt-1 line-clamp-1">
                            {highlightSearchTerm(note.content)}
                          </p>
                        )}
                      </td>
                      <td className="p-4 opacity-75 whitespace-nowrap">{formatDate(note.created_at)}</td>
                      <td className="p-4 text-right opacity-75">{getWordCount(note.content)}</td>
                      <td className="p-4 text-right opacity-75">{note.backspace_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile Table */}
              <table className="w-full sm:hidden">
                <thead>
                  <tr className="border-b">
                    <th className="p-4 text-left font-medium">
                      <button 
                        onClick={() => toggleSort('title')}
                        className="inline-flex items-center space-x-2 hover:opacity-75 transition-opacity"
                      >
                        <span>Title</span>
                        {sortField === 'title' && (
                          sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="p-4 text-right font-medium whitespace-nowrap">
                      <button 
                        onClick={() => toggleSort('created_at')}
                        className="inline-flex items-center space-x-2 hover:opacity-75 transition-opacity"
                      >
                        <Calendar className="h-4 w-4" />
                        <span>Date</span>
                        {sortField === 'created_at' && (
                          sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedNotes.map((note) => (
                    <tr 
                      key={note.id}
                      onClick={() => handleNoteClick(note)}
                      className="border-b cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="p-4 font-medium">
                        {highlightSearchTerm(note.title)}
                      </td>
                      <td className="p-4 text-right opacity-75 whitespace-nowrap">
                        {formatDate(note.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}