import Link from 'next/link';
import Image from 'next/image';
import HeaderEmailCapture from '@/components/HeaderEmailCapture';
import FeedbackButton from '@/components/FeedbackButton';
import { Sparkles, ArrowRight, Zap, Layers, Code2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col animate-fade-in">
      {/* Header */}
      <header className="border-b border-dark-700/50 bg-dark-900/90 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-center sm:justify-between justify-center gap-3 sm:gap-4">
            <Image 
              src="/specifythat-logo.png" 
              alt="SpecifyThat" 
              width={144} 
              height={32}
              style={{ height: '28px', width: 'auto' }}
              className="sm:h-8 brightness-0 invert"
              priority
            />
            <HeaderEmailCapture />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-500/10 border border-accent-500/20 mb-6">
              <Zap className="w-4 h-4 text-accent-400" />
              <span className="text-accent-300 text-sm font-medium">Planning & Prompt Engine</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">SpecifyThat</span>
            </h1>
            <p className="text-xl md:text-2xl text-dark-300 max-w-2xl mx-auto leading-relaxed">
              Transform raw ideas into <span className="text-white font-medium">build-ready specs</span> in under 60 seconds
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <Link
              href="/interview"
              className="group flex items-center gap-3 px-8 py-4 bg-accent-600 hover:bg-accent-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-accent-600/25 hover:shadow-accent-500/40 btn-pulse"
            >
              <Sparkles className="w-5 h-5" />
              Start New Spec
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <p className="text-sm text-dark-500 font-medium mb-12">
            No login required • Free to use • Works on mobile
          </p>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="p-6 rounded-2xl bg-dark-800/50 border border-dark-700/50 card-hover">
              <div className="w-12 h-12 rounded-xl bg-accent-500/10 flex items-center justify-center mb-4 mx-auto">
                <Layers className="w-6 h-6 text-accent-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">13 Strategic Questions</h3>
              <p className="text-dark-400 text-sm">Automatically answered based on your project description</p>
            </div>

            <div className="p-6 rounded-2xl bg-dark-800/50 border border-dark-700/50 card-hover">
              <div className="w-12 h-12 rounded-xl bg-accent-500/10 flex items-center justify-center mb-4 mx-auto">
                <Zap className="w-6 h-6 text-accent-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Under 60 Seconds</h3>
              <p className="text-dark-400 text-sm">From idea to complete spec faster than you can explain it</p>
            </div>

            <div className="p-6 rounded-2xl bg-dark-800/50 border border-dark-700/50 card-hover">
              <div className="w-12 h-12 rounded-xl bg-accent-500/10 flex items-center justify-center mb-4 mx-auto">
                <Code2 className="w-6 h-6 text-accent-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI-Builder Ready</h3>
              <p className="text-dark-400 text-sm">Optimized for Cursor, Claude, ChatGPT, Bolt, v0 & Emergent</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-dark-500 text-sm border-t border-dark-800">
        Built for the future of spec writing •{' '}
        <a 
          href="https://github.com/modryn-studio/specifythat" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-accent-400 underline transition-colors"
        >
          Open source on GitHub
        </a>
      </footer>

      {/* Floating Feedback Button */}
      <FeedbackButton />
    </div>
  );
}
