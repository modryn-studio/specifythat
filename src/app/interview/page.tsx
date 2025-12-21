'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useInterviewSession } from '@/hooks/useInterviewSession';
import { AnswerInput } from '@/components/AnswerInput';
import { AnalysisProgress } from '@/components/AnalysisProgress';
import { SpecDisplay } from '@/components/SpecDisplay';
import { UnitSelectionCard } from '@/components/UnitSelectionCard';
import { IdeationFlow } from '@/components/IdeationFlow';
import { AutoGenerationPhase } from '@/components/AutoGenerationPhase';
import { ReviewAccordion } from '@/components/ReviewAccordion';
import FeedbackButton from '@/components/FeedbackButton';
import { Lightbulb } from 'lucide-react';

export default function InterviewPage() {
  const {
    session,
    phase,
    error,
    reset,
    // Description phase
    descriptionQuestion,
    // Q2 analysis
    isAnalyzing,
    analysisResult,
    analyzeProject,
    selectUnit,
    goBackFromUnitSelection,
    // Auto-generation
    questionsForAutoGeneration,
    onAutoGenerationComplete,
    // Review phase
    updateAnswer,
    updateProjectName,
    buildFinalAnswers,
    // Phase control
    setPhase,
    // Ideation mode
    mode,
    enterIdeationMode,
    cancelIdeationMode,
  } = useInterviewSession();

  const [generatedSpec, setGeneratedSpec] = useState<string | null>(null);
  const [specError, setSpecError] = useState<string | null>(null);
  const [isGeneratingSpec, setIsGeneratingSpec] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [prefillDescription, setPrefillDescription] = useState<string | null>(null);

  const handleSubmitDescription = async (description: string) => {
    try {
      let docContent: string | undefined;
      if (attachedFile) {
        docContent = await attachedFile.text();
      }
      await analyzeProject(description, docContent);
      setAttachedFile(null);
    } catch {
      // Error handled in hook
    }
  };

  const handleIDontKnow = () => {
    enterIdeationMode();
  };

  const handleIdeationComplete = (projectDescription: string) => {
    cancelIdeationMode();
    setPrefillDescription(projectDescription);
  };

  const handleIdeationCancel = () => {
    cancelIdeationMode();
  };

  const handleSubmitWithPrefill = async (description: string) => {
    setPrefillDescription(null);
    await handleSubmitDescription(description);
  };

  const handleFileChange = (file: File | null) => {
    setAttachedFile(file);
  };

  const handleGenerateSpec = async () => {
    setIsGeneratingSpec(true);
    setSpecError(null);
    setPhase('generating-spec');

    try {
      const answers = buildFinalAnswers();
      
      const response = await fetch('/api/generate-spec', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate spec');
      }

      const data = await response.json();
      setGeneratedSpec(data.spec);
      setPhase('complete');
    } catch (err) {
      setSpecError(err instanceof Error ? err.message : 'Something went wrong');
      setPhase('review'); // Go back to review on error
    } finally {
      setIsGeneratingSpec(false);
    }
  };

  const handleStartOver = () => {
    reset();
    setGeneratedSpec(null);
    setSpecError(null);
    setAttachedFile(null);
    setPrefillDescription(null);
  };

  // ============================================
  // RENDER: Ideation Mode
  // ============================================
  if (mode === 'ideation') {
    return (
      <div className="min-h-screen animate-fade-in">
        <header className="border-b border-dark-700/50 bg-dark-900/90 backdrop-blur-md sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 py-5">
            <div className="flex items-center justify-between">
              <Link href="/">
                <Image 
                  src="/specifythat-logo.png" 
                  alt="SpecifyThat" 
                  width={144} 
                  height={32}
                  style={{ height: '32px', width: 'auto' }}
                  className="brightness-0 invert"
                />
              </Link>
              <span className="text-sm font-medium text-accent-300 bg-accent-500/10 border border-accent-500/20 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4" /> Ideation Mode
              </span>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-12">
          <IdeationFlow
            onComplete={handleIdeationComplete}
            onCancel={handleIdeationCancel}
          />
        </main>
      </div>
    );
  }

  // ============================================
  // RENDER: Complete - Show Generated Spec
  // ============================================
  if (phase === 'complete' && generatedSpec) {
    return (
      <div className="min-h-screen animate-fade-in">
        <header className="border-b border-dark-700/50 bg-dark-900/90 backdrop-blur-md sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 py-5">
            <Link href="/">
              <Image 
                src="/specifythat-logo.png" 
                alt="SpecifyThat" 
                width={144} 
                height={32}
                style={{ height: '32px', width: 'auto' }}
                className="brightness-0 invert"
              />
            </Link>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <SpecDisplay 
            spec={generatedSpec} 
            onStartOver={handleStartOver} 
            projectName={session.projectName} 
          />
        </main>
      </div>
    );
  }

  // ============================================
  // RENDER: Generating Spec
  // ============================================
  if (phase === 'generating-spec' || isGeneratingSpec) {
    const specStages = [
      { label: 'Analyzing your answers' },
      { label: 'Structuring requirements' },
      { label: 'Generating technical spec' },
      { label: 'Finalizing document' },
    ];

    return (
      <div className="min-h-screen animate-fade-in">
        <header className="border-b border-dark-700/50 bg-dark-900/90 backdrop-blur-md sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 py-5">
            <Image 
              src="/specifythat-logo.png" 
              alt="SpecifyThat" 
              width={144} 
              height={32}
              style={{ height: '32px', width: 'auto' }}
              className="brightness-0 invert"
            />
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">Generating Your Spec</h2>
            <p className="text-dark-400">This may take a moment...</p>
          </div>
          <AnalysisProgress 
            isActive={true} 
            title="Building Spec"
            stages={specStages}
          />
        </main>
      </div>
    );
  }

  // ============================================
  // RENDER: Review Phase (Accordion)
  // ============================================
  if (phase === 'review') {
    const reviewItems = session.generatedAnswers.map(ga => ({
      id: ga.questionId,
      questionText: ga.questionText,
      answer: ga.answer,
      isAIGenerated: ga.isAIGenerated,
      section: ga.section,
    }));

    return (
      <div className="min-h-screen animate-fade-in">
        <header className="border-b border-dark-700/50 bg-dark-900/90 backdrop-blur-md sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 py-5">
            <div className="flex items-center justify-between">
              <Link href="/">
                <Image 
                  src="/specifythat-logo.png" 
                  alt="SpecifyThat" 
                  width={144} 
                  height={32}
                  style={{ height: '32px', width: 'auto' }}
                  className="brightness-0 invert"
                />
              </Link>
              <button
                onClick={handleStartOver}
                className="text-sm font-medium text-dark-400 hover:text-white transition-colors"
              >
                Start Over
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-12">
          {specError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 mb-8">
              <p className="text-red-400 font-medium">{specError}</p>
            </div>
          )}

          <ReviewAccordion
            items={reviewItems}
            projectName={session.projectName}
            onUpdateAnswer={updateAnswer}
            onUpdateProjectName={updateProjectName}
            onGenerateSpec={handleGenerateSpec}
            isGenerating={isGeneratingSpec}
          />
        </main>

        <FeedbackButton />
      </div>
    );
  }

  // ============================================
  // RENDER: Auto-Generation Phase
  // ============================================
  if (phase === 'auto-generating') {
    // Build context from Q2 analysis
    const conversationContext = [
      {
        question: descriptionQuestion?.text || "Describe your project. What does it do and who is it for?",
        answer: session.projectSummary,
        isAIGenerated: true,
      },
    ];

    return (
      <div className="min-h-screen animate-fade-in">
        <header className="border-b border-dark-700/50 bg-dark-900/90 backdrop-blur-md sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 py-5">
            <Image 
              src="/specifythat-logo.png" 
              alt="SpecifyThat" 
              width={144} 
              height={32}
              style={{ height: '32px', width: 'auto' }}
              className="brightness-0 invert"
            />
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-12">
          <AutoGenerationPhase
            questions={questionsForAutoGeneration}
            conversationContext={conversationContext}
            onComplete={onAutoGenerationComplete}
            projectDescription={session.projectSummary}
          />
        </main>
      </div>
    );
  }

  // ============================================
  // RENDER: Unit Selection (Multi-unit projects)
  // ============================================
  if (phase === 'unit-selection' && analysisResult?.type === 'multiple') {
    return (
      <div className="min-h-screen animate-fade-in">
        <header className="border-b border-dark-700/50 bg-dark-900/90 backdrop-blur-md sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 py-5">
            <div className="flex items-center justify-between">
              <Link href="/">
                <Image 
                  src="/specifythat-logo.png" 
                  alt="SpecifyThat" 
                  width={144} 
                  height={32}
                  style={{ height: '32px', width: 'auto' }}
                  className="brightness-0 invert"
                />
              </Link>
              <button
                onClick={handleStartOver}
                className="text-sm font-medium text-dark-400 hover:text-white transition-colors"
              >
                Start Over
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-12 space-y-10">
          <div className="rounded-2xl bg-dark-800/50 border border-dark-700/50 p-8 md:p-10">
            <div className="flex items-center gap-3 text-sm mb-6">
              <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide">
                Complex Project Detected
              </span>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-white leading-snug mb-3">
              Your project has {analysisResult.units.length} buildable phases
            </h2>
            <p className="text-dark-300">
              Your project is too large to build all at once. I&apos;ve broken it into logical phases that can be shipped independently.
            </p>
            <p className="text-dark-300 mt-2">
              <strong className="text-white">Which phase do you want to spec first?</strong> You can come back and spec the others later.
            </p>
          </div>

          <div className="space-y-4">
            {analysisResult.units.map((unit) => (
              <UnitSelectionCard
                key={unit.id}
                unit={unit}
                onSelect={() => selectUnit(unit)}
              />
            ))}
          </div>

          <button
            onClick={goBackFromUnitSelection}
            className="px-5 py-3 text-dark-400 hover:text-white hover:bg-dark-700 rounded-xl transition-all duration-200 font-medium"
          >
            ← Back to description
          </button>
        </main>
      </div>
    );
  }

  // ============================================
  // RENDER: Analyzing Phase
  // ============================================
  if (phase === 'analyzing' || isAnalyzing) {
    return (
      <div className="min-h-screen animate-fade-in">
        <header className="border-b border-dark-700/50 bg-dark-900/90 backdrop-blur-md sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 py-5">
            <Image 
              src="/specifythat-logo.png" 
              alt="SpecifyThat" 
              width={144} 
              height={32}
              style={{ height: '32px', width: 'auto' }}
              className="brightness-0 invert"
            />
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">Analyzing Your Project</h2>
            <p className="text-dark-400">This may take a moment...</p>
          </div>
          <AnalysisProgress isActive={true} />
        </main>
      </div>
    );
  }

  // ============================================
  // RENDER: Description Phase (Q2 Input)
  // ============================================
  return (
    <div className="min-h-screen animate-fade-in">
      <header className="border-b border-dark-700/50 bg-dark-900/90 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Image 
                src="/specifythat-logo.png" 
                alt="SpecifyThat" 
                width={144} 
                height={32}
                style={{ height: '32px', width: 'auto' }}
                className="brightness-0 invert"
              />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        {descriptionQuestion && (
          <div className="space-y-6">
            {/* Centered Title Section - v2 style */}
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Describe Your Project
              </h2>
              <p className="text-dark-400 text-lg">
                What does it do and who is it for?
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {/* Single Card with Input */}
            <AnswerInput
              onSubmit={prefillDescription ? handleSubmitWithPrefill : handleSubmitDescription}
              onIDontKnow={handleIDontKnow}
              onBack={() => {}}
              isLoading={isAnalyzing}
              canGoBack={false}
              aiGeneratedAnswer={null}
              onAcceptAI={() => {}}
              allowFileUpload={descriptionQuestion?.allowFileUpload}
              fileTypes={descriptionQuestion?.fileTypes}
              helpText={descriptionQuestion?.helpText}
              attachedFile={attachedFile}
              onFileChange={handleFileChange}
              validation={descriptionQuestion?.validation}
              questionId={descriptionQuestion?.id}
              initialValue={prefillDescription}
            />
          </div>
        )}
      </main>

      <FeedbackButton />
    </div>
  );
}
