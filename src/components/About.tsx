import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  PenTool, 
  Zap, 
  XCircle, 
  AlertTriangle,
  ArrowRight,
  Quote,
  Brain,
  Target,
  CheckCircle2,
  Timer,
  Lock,
  Crown,
  Users,
  Menu,
  Twitter
} from 'lucide-react';
import UseCases from './UseCases';
import CommunityStats from './CommunityStats';

export default function About() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleLogoClick = () => {
    if (user) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen editor-container">
      <header className="editor-header border-b">
        <div className="max-w-7xl mx-auto px-4 h-18">
          <div className="flex justify-between items-center h-full">
            <div 
              className="flex items-center space-x-3 cursor-pointer" 
              onClick={handleLogoClick}
            >
              <PenTool className="h-6 w-6" />
              <span className="text-xl font-semibold">nobackspace.io</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/auth')}
                className="btn btn-secondary hidden sm:inline-flex"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/write')}
                className="btn btn-primary hidden sm:inline-flex"
              >
                Start Writing
              </button>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 sm:hidden hover:bg-gray-100/10 rounded-lg transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        {/* Mobile Menu */}
        {menuOpen && (
          <div className="sm:hidden border-t">
            <div className="px-4 py-2 space-y-2">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/auth');
                }}
                className="w-full btn btn-secondary mb-2"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/write');
                }}
                className="w-full btn btn-primary"
              >
                Start Writing
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-4xl mx-auto py-8 sm:py-12 px-4">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            Break Through Writer's Block with FBR
          </h1>
          <p className="text-lg sm:text-xl opacity-75 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Unlock your creativity with the Fast, Bad, Wrong approach to writing, 
            powered by our unique backspace-disabled editor.
          </p>
          <button
            onClick={() => navigate('/write')}
            className="btn btn-primary h-12 px-6 sm:px-8 inline-flex items-center space-x-2"
          >
            <PenTool className="h-5 w-5" />
            <span>Try It Now</span>
          </button>
        </div>

        {/* FBR Explanation */}
        <div className="editor-sidebar rounded-xl sm:rounded-2xl p-6 sm:p-8 mb-8 sm:mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <Brain className="h-8 w-8" />
            <h2 className="text-2xl sm:text-3xl font-bold">What is FBR?</h2>
          </div>
          
          <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Zap className="h-5 w-5 text-yellow-500" />
                <h3 className="text-lg sm:text-xl font-semibold">Fast</h3>
              </div>
              <p className="opacity-75">
                Write quickly without stopping. Speed past your inner critic and let your ideas flow freely.
              </p>
            </div>
            
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <XCircle className="h-5 w-5 text-red-500" />
                <h3 className="text-lg sm:text-xl font-semibold">Bad</h3>
              </div>
              <p className="opacity-75">
                Embrace imperfection. Your first draft doesn't need to be perfect—it just needs to exist.
              </p>
            </div>
            
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <h3 className="text-lg sm:text-xl font-semibold">Wrong</h3>
              </div>
              <p className="opacity-75">
                Allow yourself to be wrong. Write without worrying about accuracy or correctness—you can fact-check later.
              </p>
            </div>
          </div>
        </div>

        {/* Quote Section */}
        <div className="mb-8 sm:mb-16">
          <blockquote className="editor-sidebar rounded-xl sm:rounded-2xl p-6 sm:p-8">
            <div className="flex items-start space-x-4">
              <Quote className="h-8 w-8 flex-shrink-0 opacity-50" />
              <div>
                <p className="text-base sm:text-lg mb-4">
                  "The FBR rule changed how I write completely. Instead of agonizing over every word, 
                  I learned to embrace the messy first draft and just get my ideas down."
                </p>
                <footer className="opacity-75 text-sm sm:text-base">
                  — Ali Abdaal, 
                  <a 
                    href="https://aliabdaal.com/newsletter/the-acronym-that-changed-how-i-write/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline ml-1 hover:opacity-100"
                  >
                    The Acronym That Changed How I Write
                  </a>
                </footer>
              </div>
            </div>
          </blockquote>
        </div>

        {/* Features Section */}
        <div className="mb-8 sm:mb-16">
          <div className="flex items-center space-x-3 mb-6 sm:mb-8">
            <Target className="h-8 w-8" />
            <h2 className="text-2xl sm:text-3xl font-bold">How nobackspace.io Helps</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
            <div className="editor-sidebar rounded-lg p-4 sm:p-6">
              <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                <Lock className="h-5 w-5 opacity-75" />
                <h3 className="font-semibold">Backspace Disabled</h3>
              </div>
              <p className="opacity-75 text-sm sm:text-base">
                Our editor prevents you from editing or deleting text, forcing you to keep moving forward 
                with your writing.
              </p>
            </div>

            <div className="editor-sidebar rounded-lg p-4 sm:p-6">
              <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                <Timer className="h-5 w-5 opacity-75" />
                <h3 className="font-semibold">Writing Timer</h3>
              </div>
              <p className="opacity-75 text-sm sm:text-base">
                Set focused writing sessions with our built-in timer to maintain momentum and track your progress.
              </p>
            </div>

            <div className="editor-sidebar rounded-lg p-4 sm:p-6">
              <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                <Crown className="h-5 w-5 opacity-75" />
                <h3 className="font-semibold">Difficulty Levels</h3>
              </div>
              <p className="opacity-75 text-sm sm:text-base">
                Choose your challenge level, from simply disabling backspace to more extreme options that 
                push your boundaries.
              </p>
            </div>

            <div className="editor-sidebar rounded-lg p-4 sm:p-6">
              <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                <CheckCircle2 className="h-5 w-5 opacity-75" />
                <h3 className="font-semibold">Progress Tracking</h3>
              </div>
              <p className="opacity-75 text-sm sm:text-base">
                Monitor your writing streaks, word count, and improvement over time with detailed statistics.
              </p>
            </div>
          </div>

          {/* Use Cases Section */}
          <div className="mb-8 sm:mb-16">
            <div className="flex items-center justify-center space-x-3 mb-6 sm:mb-8">
              <Users className="h-8 w-8" />
              <h2 className="text-2xl sm:text-3xl font-bold">Who Uses nobackspace.io?</h2>
            </div>
            <UseCases />
            
            {/* Add Community Stats below UseCases */}
            <div className="mt-8 sm:mt-12">
              <CommunityStats />
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="editor-sidebar rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Ready to Break Through Writer's Block?</h2>
          <p className="opacity-75 mb-4 sm:mb-6 max-w-xl mx-auto text-sm sm:text-base">
            Be among the first to experience the power of FBR writing with nobackspace.io.
          </p>
          <button
            onClick={() => navigate('/write')}
            className="btn btn-primary h-12 px-6 sm:px-8 inline-flex items-center space-x-2"
          >
            <ArrowRight className="h-5 w-5" />
            <span>Get Started</span>
          </button>
        </div>

        {/* References */}
        <div className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t">
          <h3 className="text-sm font-medium mb-3 sm:mb-4">Learn More About FBR:</h3>
          <ul className="space-y-2 text-sm opacity-75">
            <li>
              <a 
                href="https://aliabdaal.com/newsletter/the-acronym-that-changed-how-i-write/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Ali Abdaal: The Acronym That Changed How I Write
              </a>
            </li>
            <li>
              <a 
                href="https://productivecounsel.com/the-fbr-rule-to-overcoming-writers-block/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Productive Counsel: The FBR Rule to Overcoming Writer's Block
              </a>
            </li>
            <li>
              <a 
                href="https://x.com/heynobackspace" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 hover:underline"
              >
                <Twitter className="h-4 w-4" />
                <span>Follow us on X</span>
              </a>
            </li>
          </ul>
        </div>

      </main>
    </div>
  );
}