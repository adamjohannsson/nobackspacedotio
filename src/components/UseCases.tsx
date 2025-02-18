import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, GraduationCap, Megaphone, Pencil, Keyboard, BookOpen } from 'lucide-react';

const USE_CASES = [
  {
    icon: GraduationCap,
    title: "Students",
    problem: "Struggling with essay deadlines and overthinking every sentence",
    solution: "Write first drafts quickly without self-editing, focusing on getting ideas down. Perfect for research papers, essays, and assignments.",
    benefit: "Complete assignments faster and reduce academic stress"
  },
  {
    icon: Megaphone,
    title: "Marketing Professionals",
    problem: "Getting stuck on creating perfect copy for campaigns and content",
    solution: "Generate multiple versions of ad copy, email campaigns, and social posts rapidly without second-guessing.",
    benefit: "Produce more content variations for A/B testing"
  },
  {
    icon: Pencil,
    title: "Substack & Freelance Writers",
    problem: "Missing deadlines due to perfectionism and writer's block",
    solution: "Power through first drafts of newsletters and articles without getting caught in the editing loop.",
    benefit: "Maintain consistent publishing schedules"
  },
  {
    icon: Keyboard,
    title: "Speed Typing Enthusiasts",
    problem: "Hitting plateaus in typing speed and accuracy",
    solution: "Train yourself to type without relying on backspace, building muscle memory and forward momentum.",
    benefit: "Improve typing speed and reduce dependency on corrections"
  },
  {
    icon: BookOpen,
    title: "Learning Typists",
    problem: "Developing bad typing habits and slow progress",
    solution: "Force proper finger positioning and forward-only typing to build correct muscle memory from the start.",
    benefit: "Learn proper typing technique faster"
  }
];

export default function UseCases() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((currentIndex + 1) % USE_CASES.length);
  };

  const prev = () => {
    setCurrentIndex((currentIndex - 1 + USE_CASES.length) % USE_CASES.length);
  };

  return (
    <div className="editor-sidebar rounded-xl sm:rounded-2xl p-4 sm:p-8">
      <div className="relative">
        {/* Navigation Buttons - Desktop */}
        <button
          onClick={prev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-4 p-2 rounded-full editor-sidebar border shadow-lg z-10 hidden sm:block"
          aria-label="Previous use case"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        
        <button
          onClick={next}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 p-2 rounded-full editor-sidebar border shadow-lg z-10 hidden sm:block"
          aria-label="Next use case"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Content */}
        <div className="text-center max-w-3xl mx-auto">
          {/* Fixed height container for slides */}
          <div className="relative min-h-[500px] sm:min-h-[300px]">
            {USE_CASES.map((useCase, index) => (
              <div
                key={useCase.title}
                className={`transition-all duration-300 absolute inset-0 ${
                  index === currentIndex 
                    ? 'opacity-100 translate-x-0' 
                    : index < currentIndex
                      ? 'opacity-0 -translate-x-full' 
                      : 'opacity-0 translate-x-full'
                }`}
              >
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-gray-900/10 dark:bg-white/10 flex items-center justify-center">
                    <useCase.icon className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-6">{useCase.title}</h3>
                
                {/* Mobile Layout */}
                <div className="sm:hidden space-y-6 px-2">
                  <div>
                    <h4 className="font-medium mb-2 text-sm uppercase tracking-wide opacity-75">The Challenge</h4>
                    <p className="text-sm">{useCase.problem}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-sm uppercase tracking-wide opacity-75">How We Help</h4>
                    <p className="text-sm">{useCase.solution}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-sm uppercase tracking-wide opacity-75">Key Benefit</h4>
                    <p className="text-sm">{useCase.benefit}</p>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:grid sm:grid-cols-3 gap-6 px-8">
                  <div>
                    <h4 className="font-medium mb-2 text-sm uppercase tracking-wide opacity-75">The Challenge</h4>
                    <p className="text-sm">{useCase.problem}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-sm uppercase tracking-wide opacity-75">How We Help</h4>
                    <p className="text-sm">{useCase.solution}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-sm uppercase tracking-wide opacity-75">Key Benefit</h4>
                    <p className="text-sm">{useCase.benefit}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Navigation */}
          <div className="flex justify-between items-center mt-6 sm:hidden">
            <button
              onClick={prev}
              className="p-2 rounded-lg hover:bg-gray-100/10 transition-colors"
              aria-label="Previous use case"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            {/* Dots */}
            <div className="flex space-x-2">
              {USE_CASES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-gray-900 dark:bg-white w-4'
                      : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                  aria-label={`Go to use case ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="p-2 rounded-lg hover:bg-gray-100/10 transition-colors"
              aria-label="Next use case"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Desktop Dots */}
          <div className="hidden sm:flex justify-center space-x-2 mt-8">
            {USE_CASES.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-gray-900 dark:bg-white w-4'
                    : 'bg-gray-300 dark:bg-gray-700'
                }`}
                aria-label={`Go to use case ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}