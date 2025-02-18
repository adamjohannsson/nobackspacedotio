import React, { useState, useEffect, KeyboardEvent, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNoteStore } from '../store/noteStore';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import PremiumPrompt from './PremiumPrompt';
import type { Font, Difficulty } from '../store/themeStore';
import { 
  PenTool,
  Clock,
  Delete,
  Download,
  Copy,
  Check,
  Sun,
  Moon,
  Monitor,
  Coffee,
  Maximize,
  Minimize,
  Type,
  AlertCircle,
  Timer,
  Trophy,
  Save,
  LogIn,
  Skull,
  Zap,
  Flame,
  Heart
} from 'lucide-react';

const DIFFICULTY_SETTINGS: {
  id: Difficulty;
  icon: typeof Heart;
  label: string;
  description: string;
  color: string;
}[] = [
  {
    id: 'normal',
    icon: Heart,
    label: 'Normal',
    description: 'Backspace is disabled',
    color: 'text-green-500'
  },
  {
    id: 'hard',
    icon: Flame,
    label: 'Hard',
    description: 'Random characters are inserted when backspace is pressed',
    color: 'text-orange-500'
  },
  {
    id: 'extra-hard',
    icon: Zap,
    label: 'Extra Hard',
    description: 'Shows a warning when backspace is pressed',
    color: 'text-yellow-500'
  },
  {
    id: 'suicide',
    icon: Skull,
    label: 'Suicide',
    description: 'Deletes entire note when backspace is pressed',
    color: 'text-red-500'
  }
];

const FONTS: Font[] = ['sans', 'montserrat', 'roboto-mono', 'courier-prime'];

function Editor() {
  const location = useLocation();
  const initialNote = location.state?.note;
  const initialDraft = location.state?.draft;
  const navigate = useNavigate();

  const [title, setTitle] = useState(initialNote?.title || '');
  const [content, setContent] = useState(initialNote?.content || '');
  const [showPrompt, setShowPrompt] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showWordCount, setShowWordCount] = useState(false);
  const [showTimerMenu, setShowTimerMenu] = useState(false);
  const [showTimerAlert, setShowTimerAlert] = useState(false);
  const [customTimerInput, setCustomTimerInput] = useState('');
  const [timerError, setTimerError] = useState('');
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showDifficultyMenu, setShowDifficultyMenu] = useState(false);

  const { 
    createNote, 
    getFreeNotesCount, 
    notes, 
    fetchNotes, 
    currentBackspaceCount, 
    incrementBackspaceCount, 
    setCurrentBackspaceCount,
    saveDraft,
    getDraft,
    checkPremiumStatus
  } = useNoteStore();
  
  const { user } = useAuthStore();
  const { theme, font, setFont, setTheme, isFullscreen, toggleFullscreen, difficulty, setDifficulty } = useThemeStore();

  const timerRef = useRef<number>();
  const intervalRef = useRef<number>();
  const timerMenuRef = useRef<HTMLDivElement>(null);
  const timerAudioRef = useRef<HTMLAudioElement | null>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    timerAudioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
    timerAudioRef.current.preload = 'auto';
    
    return () => {
      if (timerAudioRef.current) {
        timerAudioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (timerMenuRef.current && !timerMenuRef.current.contains(event.target as Node)) {
        setShowTimerMenu(false);
      }
    }

    if (showTimerMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTimerMenu]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = document.fullscreenElement !== null;
      useThemeStore.getState().setIsFullscreen(isFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const checkNoteCount = async () => {
      if (user && notes.length >= 4) {
        const isPremium = await checkPremiumStatus();
        if (!isPremium) {
          setShowPremiumModal(true);
        }
      }
    };

    checkNoteCount();
  }, [user, notes.length, checkPremiumStatus]);

  const handleFontCycle = () => {
    const currentIndex = FONTS.indexOf(font);
    const nextIndex = (currentIndex + 1) % FONTS.length;
    setFont(FONTS[nextIndex]);
  };

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const hasSelection = textarea.selectionStart !== textarea.selectionEnd;

    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      incrementBackspaceCount();

      switch (difficulty) {
        case 'normal':
          return;

        case 'hard':
          const randomChar = String.fromCharCode(Math.floor(Math.random() * 26) + 97);
          const pos = textarea.selectionStart;
          setContent(
            content.slice(0, pos) +
            randomChar +
            content.slice(pos)
          );
          textarea.selectionStart = textarea.selectionEnd = pos + 1;
          return;

        case 'extra-hard':
          window.confirm('You pressed backspace! Click OK to continue writing.');
          return;

        case 'suicide':
          setContent('');
          return;
      }
      return;
    }

    if (hasSelection && !e.ctrlKey && !e.metaKey && !e.altKey && e.key.length === 1) {
      incrementBackspaceCount();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = 
        content.substring(0, start) +
        e.key +
        content.substring(end);
      setContent(newContent);
      textarea.selectionStart = textarea.selectionEnd = start + 1;
      e.preventDefault();
      return;
    }

    const start = textarea.selectionStart;
    const lines = content.substring(0, start).split('\n');
    const currentLine = lines[lines.length - 1];
    const isAtLineStart = currentLine === '';

    if (e.key === 'Enter') {
      const previousLine = lines[lines.length - 2] || '';
      const bulletMatch = previousLine.match(/^[•-] /);
      const numberMatch = previousLine.match(/^\d+\. /);

      if (bulletMatch && isAtLineStart) {
        e.preventDefault();
        const newContent = 
          content.substring(0, start) +
          '• ' +
          content.substring(start);
        setContent(newContent);
        textarea.selectionStart = textarea.selectionEnd = start + 2;
        return;
      }

      if (numberMatch && isAtLineStart) {
        e.preventDefault();
        const prevNumber = parseInt(numberMatch[0]);
        const nextNumber = prevNumber + 1;
        const newContent = 
          content.substring(0, start) +
          `${nextNumber}. ` +
          content.substring(start);
        setContent(newContent);
        textarea.selectionStart = textarea.selectionEnd = start + nextNumber.toString().length + 2;
        return;
      }
    }

    if (e.key === ' ') {
      if (currentLine === '-') {
        e.preventDefault();
        const newContent = 
          content.substring(0, start - 1) +
          '• ' +
          content.substring(start);
        setContent(newContent);
        textarea.selectionStart = textarea.selectionEnd = start + 1;
        return;
      }

      const numberMatch = currentLine.match(/^(\d+)$/);
      if (numberMatch && numberMatch[1]) {
        e.preventDefault();
        const number = numberMatch[1];
        const newContent = 
          content.substring(0, start) +
          '. ' +
          content.substring(start);
        setContent(newContent);
        textarea.selectionStart = textarea.selectionEnd = start + 2;
        return;
      }
    }
  }, [content, incrementBackspaceCount, difficulty]);

  const startTimer = (minutes: number) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    const endTime = Date.now() + minutes * 60 * 1000;
    setRemainingTime(minutes * 60);
    
    intervalRef.current = window.setInterval(() => {
      const remaining = Math.ceil((endTime - Date.now()) / 1000);
      if (remaining <= 0) {
        clearInterval(intervalRef.current);
        setRemainingTime(null);
      } else {
        setRemainingTime(remaining);
      }
    }, 1000);
    
    timerRef.current = window.setTimeout(() => {
      setShowTimerAlert(true);
      setRemainingTime(null);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timerAudioRef.current) {
        timerAudioRef.current.currentTime = 0;
        timerAudioRef.current.play().catch(error => {
          console.error('Error playing timer sound:', error);
        });
      }
    }, minutes * 60 * 1000);
    
    setShowTimerMenu(false);
  };

  const formatRemainingTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (initialDraft) {
      setTitle(initialDraft.title);
      setContent(initialDraft.content);
      setCurrentBackspaceCount(initialDraft.backspace_count);
    } else if (!initialNote) {
      const draft = getDraft();
      if (draft) {
        setTitle(draft.title);
        setContent(draft.content);
        setCurrentBackspaceCount(draft.backspace_count);
      }
    }
  }, [initialNote, initialDraft, getDraft, setCurrentBackspaceCount]);

  useEffect(() => {
    if (!user && (title || content)) {
      saveDraft({
        title,
        content,
        backspace_count: currentBackspaceCount,
      });
    }
  }, [title, content, currentBackspaceCount, user, saveDraft]);

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user, fetchNotes]);

  useEffect(() => {
    if (initialNote) {
      setCurrentBackspaceCount(initialNote.backspace_count);
    }
  }, [initialNote, setCurrentBackspaceCount]);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const getWordCount = () => {
    return content.trim() ? content.trim().split(/\s+/).length : 0;
  };

  const handleSave = async () => {
    if (!content.trim()) return;

    if (!user) {
      setShowAuthPrompt(true);
      return;
    }

    if (notes.length >= 4) {
      const isPremium = await checkPremiumStatus();
      if (!isPremium) {
        setShowPremiumModal(true);
        return;
      }
    }

    try {
      await createNote(title, content, currentBackspaceCount, initialNote?.id);
      setContent('');
      setTitle('');
      setCurrentBackspaceCount(0);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const formatNoteContent = () => {
    const now = new Date();
    const formattedDate = now.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    return `Title: ${title || 'Untitled'}
Date Exported: ${formattedDate}
Backspace Attempts: ${currentBackspaceCount}
-----------------
${content}`;
  };

  const handleExport = () => {
    if (!content.trim()) return;

    const noteContent = formatNoteContent();
    const blob = new Blob([noteContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title || 'untitled'}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    if (!content.trim()) return;

    try {
      await navigator.clipboard.writeText(formatNoteContent());
      setCopied(true);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleCustomTimer = (e: React.FormEvent) => {
    e.preventDefault();
    const minutes = parseInt(customTimerInput);
    
    if (isNaN(minutes) || minutes <= 0) {
      setTimerError('Please enter a valid number');
      return;
    }

    if (minutes > 1000) {
      setTimerError('Maximum time limit is 1000 minutes');
      return;
    }

    setTimerError('');
    startTimer(minutes);
    setCustomTimerInput('');
  };

  const handleDifficultyToggle = () => {
    const currentIndex = DIFFICULTY_SETTINGS.findIndex(s => s.id === difficulty);
    const nextIndex = (currentIndex + 1) % DIFFICULTY_SETTINGS.length;
    setDifficulty(DIFFICULTY_SETTINGS[nextIndex].id);
  };

  const handleThemeToggle = () => {
    const themes = ['light', 'dark', 'dim', 'cream'] as const;
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const handleTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      contentTextareaRef.current?.focus();
    }
  };

  return (
    <div className="min-h-screen editor-container">
      <header className="fixed top-0 left-0 right-0 editor-header backdrop-blur-sm border-b z-50">
        <div className="max-w-7xl mx-auto px-4 h-18">
          <div className="flex justify-between items-center h-full">
            <div 
              className="flex items-center space-x-3 cursor-pointer" 
              onClick={() => navigate('/')}
            >
              <PenTool className="h-6 w-6" />
              <span className="text-xl font-semibold hidden sm:inline">nobackspace.io</span>
            </div>

            <div className="hidden sm:flex items-center space-x-4">
              <button
                onClick={handleDifficultyToggle}
                className="p-2 hover:bg-gray-100/10 rounded-lg transition-colors relative group"
                title="Change difficulty"
              >
                {(() => {
                  const setting = DIFFICULTY_SETTINGS.find(s => s.id === difficulty);
                  const Icon = setting?.icon || Heart;
                  return (
                    <>
                      <Icon className={`h-5 w-5 ${setting?.color}`} />
                      <span className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        {setting?.label}: {setting?.description}
                      </span>
                    </>
                  );
                })()}
              </button>

              <button
                onClick={handleFontCycle}
                className="p-2 hover:bg-gray-100/10 rounded-lg transition-colors relative group"
                title="Change font"
              >
                <Type className="h-5 w-5" />
                <span className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity capitalize">
                  Font: {font.replace('-', ' ')}
                </span>
              </button>

              <button
                onClick={handleThemeToggle}
                className="p-2 hover:bg-gray-100/10 rounded-lg transition-colors relative group"
                title="Change theme"
              >
                {theme === 'light' && <Sun className="h-5 w-5" />}
                {theme === 'dark' && <Moon className="h-5 w-5" />}
                {theme === 'dim' && <Monitor className="h-5 w-5" />}
                {theme === 'cream' && <Coffee className="h-5 w-5" />}
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowTimerMenu(!showTimerMenu)}
                  className="p-2 hover:bg-gray-100/10 rounded-lg transition-colors"
                  aria-label="Set timer"
                >
                  <Timer className="h-5 w-5" />
                  {remainingTime !== null && (
                    <span className="absolute -bottom-1 -right-1 bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-xs px-1.5 py-0.5 rounded-full font-medium">
                      {formatRemainingTime(remainingTime)}
                    </span>
                  )}
                </button>

                {showTimerMenu && (
                  <div ref={timerMenuRef} className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg editor-sidebar border z-50">
                    <div className="p-4">
                      <h3 className="font-medium mb-4">Set Timer</h3>
                      <div className="space-y-2 mb-4">
                        <button
                          onClick={() => startTimer(5)}
                          className="w-full text-left px-3 py-2 rounded hover:bg-gray-100/10 transition-colors"
                        >
                          5 minutes
                        </button>
                        <button
                          onClick={() => startTimer(15)}
                          className="w-full text-left px-3 py-2 rounded hover:bg-gray-100/10 transition-colors"
                        >
                          15 minutes
                        </button>
                        <button
                          onClick={() => startTimer(30)}
                          className="w-full text-left px-3 py-2 rounded hover:bg-gray-100/10 transition-colors"
                        >
                          30 minutes
                        </button>
                        <button
                          onClick={() => startTimer(60)}
                          className="w-full text-left px-3 py-2 rounded hover:bg-gray-100/10 transition-colors"
                        >
                          60 minutes
                        </button>
                      </div>
                      
                      <div className="border-t pt-4">
                        <form onSubmit={handleCustomTimer}>
                          <label className="block text-sm font-medium mb-2">
                            Custom Duration (1-1000 min)
                          </label>
                          <div className="flex space-x-2">
                            <input
                              type="number"
                              min="1"
                              max="1000"
                              className="flex-1 rounded-lg border border-gray-300 shadow-sm editor-input focus:border-gray-900 focus:ring-gray-900 sm:text-sm px-3"
                              value={customTimerInput}
                              onChange={(e) => {
                                setCustomTimerInput(e.target.value);
                                setTimerError('');
                              }}
                              placeholder="Enter minutes"
                            />
                            <button
                              type="submit"
                              className="btn btn-primary"
                            >
                              Set
                            </button>
                          </div>
                          {timerError && (
                            <p className="mt-2 text-sm text-red-600">{timerError}</p>
                          )}
                        </form>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-gray-100/10 rounded-lg transition-colors"
                aria-label="Toggle fullscreen"
              >
                {isFullscreen ? (
                  <Minimize className="h-5 w-5" />
                ) : (
                  <Maximize className="h-5 w-5" />
                )}
              </button>

              <div className="flex items-center space-x-2 hover:opacity-75 transition-opacity">
                {showWordCount ? (
                  <>
                    <Type className="h-4 w-4" />
                    <span className="text-sm font-medium">{getWordCount()} words</span>
                  </>
                ) : (
                  <>
                    <Delete className="h-4 w-4" />
                    <span className="text-sm font-medium">{currentBackspaceCount} attempts</span>
                  </>
                )}
              </div>

              {content.trim() && (
                <>
                  <button
                    onClick={handleCopy}
                    className="p-2 hover:bg-gray-100/10 rounded-lg transition-colors"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={handleExport}
                    className="p-2 hover:bg-gray-100/10 rounded-lg transition-colors"
                    title="Export as TXT"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                </>
              )}

              {!user && (
                <button
                  onClick={() => navigate('/auth')}
                  className="btn btn-secondary"
                >
                  Sign in
                </button>
              )}

              {content.trim() && (
                <button
                  onClick={handleSave}
                  className="btn btn-primary"
                >
                  {initialNote ? 'Update' : 'Save'}
                </button>
              )}
            </div>

            <div className="flex sm:hidden items-center space-x-2">
              <button
                onClick={() => setShowWordCount(!showWordCount)}
                className="p-2 hover:bg-gray-100/10 rounded-lg transition-colors"
                title={showWordCount ? "Show backspace attempts" : "Show word count"}
              >
                {showWordCount ? (
                  <Type className="h-5 w-5" />
                ) : (
                  <Delete className="h-5 w-5" />
                )}
              </button>

              <button
                onClick={handleThemeToggle}
                className="p-2 hover:bg-gray-100/10 rounded-lg transition-colors"
                title="Change theme"
              >
                {theme === 'light' && <Sun className="h-5 w-5" />}
                {theme === 'dark' && <Moon className="h-5 w-5" />}
                {theme === 'dim' && <Monitor className="h-5 w-5" />}
                {theme === 'cream' && <Coffee className="h-5 w-5" />}
              </button>

              {content.trim() && (
                <button
                  onClick={handleSave}
                  className="btn btn-primary"
                >
                  {initialNote ? 'Update' : 'Save'}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="sm:hidden border-t px-4 py-2 flex justify-between items-center text-sm">
          <div className="flex items-center space-x-1">
            {showWordCount ? (
              <>
                <Type className="h-4 w-4" />
                <span>{getWordCount()} words</span>
              </>
            ) : (
              <>
                <Delete className="h-4 w-4" />
                <span>{currentBackspaceCount} attempts</span>
              </>
            )}
          </div>
          {remainingTime !== null && (
            <div className="flex items-center space-x-1">
              <Timer className="h-4 w-4" />
              <span>{formatRemainingTime(remainingTime)}</span>
            </div>
          )}
        </div>
      </header>

      <main className="pt-18 transition-all duration-300">
        <div className="px-4 max-w-3xl mx-auto pt-12">
          <input
            type="text"
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleTitleKeyDown}
            className={`w-full text-3xl font-bold mb-6 border-none outline-none editor-input focus:ring-0 font-${font}`}
          />
          <textarea
            ref={contentTextareaRef}
            className={`w-full h-[calc(100vh-10rem)] resize-none border-none outline-none text-lg leading-relaxed editor-input focus:ring-0 font-${font}`}
            placeholder="Start writing... (backspace disabled)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </main>

      {showAuthPrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="editor-sidebar rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <Save className="h-6 w-6 text-gray-900 dark:text-white" />
              <h2 className="text-2xl font-bold">Save Your Note</h2>
            </div>
            <p className="opacity-75 mb-6">
              Sign in or create an account to save your note and access it from anywhere.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => {
                  saveDraft({
                    title,
                    content,
                    backspace_count: currentBackspaceCount,
                  });
                  navigate('/auth', { state: { returnTo: '/write' } });
                }}
                className="btn btn-primary w-full h-12 inline-flex items-center justify-center space-x-2"
              >
                <LogIn className="h-5 w-5" />
                <span>Sign in or Sign up</span>
              </button>
              <button
                onClick={() => setShowAuthPrompt(false)}
                className="btn btn-secondary w-full"
              >
                Continue Writing
              </button>
              <p className="text-sm text-center opacity-75">
                Your note will be saved locally until you sign in
              </p>
            </div>
          </div>
        </div>
      )}

      {showTimerAlert && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle className="h-6 w-6 text-yellow-500" />
              <h2 className="text-2xl font-bold">Time's Up!</h2>
            </div>
            <p className="opacity-75 mb-8">
              Your writing session has ended. Don't forget to save your work!
            </p>
            <button
              onClick={() => setShowTimerAlert(false)}
              className="btn btn-primary w-full"
            >
              Continue Writing
            </button>
          </div>
        </div>
      )}

      {showPremiumModal && (
        <PremiumPrompt
          onClose={() => setShowPremiumModal(false)}
          onUpgrade={() => navigate('/account')}
        />
      )}
    </div>
  );
}

export default Editor;