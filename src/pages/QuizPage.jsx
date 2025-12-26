import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, RefreshCw, Trophy, AlertCircle, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import QuizCard from '../components/quiz/QuizCard';
import { useTracker } from '../context/TrackerContext';

const QuizPage = () => {
    const [loading, setLoading] = useState(false);
    const [quizData, setQuizData] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [error, setError] = useState(null);
    const [mode, setMode] = useState(null); // 'daily' or 'revision'

    const { questionsData, dueRevisions, progress } = useTracker();

    const generateQuiz = async (selectedMode) => {
        setLoading(true);
        setError(null);
        setMode(selectedMode);

        try {
            // Determine topics/questions based on mode
            let quizContext = {};

            if (selectedMode === 'daily') {
                // Find the first day with uncompleted questions, or default to Day 1
                let targetDay = questionsData[0];
                for (const day of questionsData) {
                    const allCompleted = day.questions.every(q => progress[q.id]?.completed);
                    if (!allCompleted) {
                        targetDay = day;
                        break;
                    }
                }

                // Pick up to 3 questions from this day
                const questionsToQuiz = targetDay.questions.slice(0, 3);
                quizContext = {
                    mode: 'daily',
                    day: targetDay.day,
                    questions: questionsToQuiz.map(q => ({ title: q.title, topic: q.topic }))
                };
            } else {
                // Spaced repetition: use due revisions
                if (dueRevisions.length === 0) {
                    throw new Error("No questions due for revision!");
                }
                // Pick up to 3 due questions
                const questionsToQuiz = dueRevisions.slice(0, 3);
                quizContext = {
                    mode: 'revision',
                    questions: questionsToQuiz.map(q => ({ title: q.title, topic: q.topic }))
                };
            }

            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'quiz',
                    data: quizContext
                })
            });

            if (!response.ok) throw new Error('Failed to generate quiz');

            const data = await response.json();

            // Combine MCQs and Coding challenge into a single array
            const questions = [
                ...data.mcqs.map(q => ({ ...q, type: 'mcq' })),
                { ...data.codingChallenge, type: 'code' }
            ];

            setQuizData(questions);
            setCurrentQuestionIndex(0);
            setScore(0);
            setShowResult(false);
        } catch (err) {
            console.error(err);
            setError('Failed to generate quiz. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (isCorrect) => {
        if (isCorrect) setScore(prev => prev + 1);
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < quizData.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            setShowResult(true);
        }
    };

    const prevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const resetQuiz = () => {
        setQuizData(null);
        setMode(null);
        setShowResult(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <h2 className="text-xl font-semibold text-slate-800">Generating your personalized quiz...</h2>
                <p className="text-slate-500 mt-2">Our AI is crafting questions based on your topics.</p>
            </div>
        );
    }

    if (showResult) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-3xl shadow-xl p-8 text-center border border-slate-100"
                >
                    <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trophy className="w-10 h-10 text-yellow-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">Quiz Completed!</h2>
                    <p className="text-slate-600 mb-8">You scored {score} out of {quizData.length}</p>

                    <div className="flex justify-center gap-4">
                        <button
                            onClick={resetQuiz}
                            className="px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
                        >
                            Back to Dashboard
                        </button>
                        <button
                            onClick={() => generateQuiz(mode)}
                            className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                        >
                            Try Another
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (quizData) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <div className="mb-6 flex items-center justify-between">
                    <button
                        onClick={resetQuiz}
                        className="text-sm text-slate-500 hover:text-slate-800 transition-colors"
                    >
                        ← Exit Quiz
                    </button>
                    <div className="text-sm font-medium text-slate-600">
                        Progress: {currentQuestionIndex + 1}/{quizData.length}
                    </div>
                </div>
                <QuizCard
                    question={quizData[currentQuestionIndex]}
                    onAnswer={handleAnswer}
                    index={currentQuestionIndex}
                    total={quizData.length}
                />

                <div className="flex justify-between mt-6">
                    <button
                        onClick={prevQuestion}
                        disabled={currentQuestionIndex === 0}
                        className="px-4 py-2 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <ChevronLeft className="w-4 h-4" /> Previous
                    </button>
                    <button
                        onClick={nextQuestion}
                        className="px-4 py-2 text-white bg-slate-900 rounded-lg hover:bg-slate-800 flex items-center gap-2"
                    >
                        {currentQuestionIndex === quizData.length - 1 ? 'Finish Quiz' : 'Next Question'}
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="text-center space-y-4 mb-12">
                <h1 className="text-4xl font-bold text-slate-900 tracking-tight">AI Knowledge Check</h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                    Test your understanding with AI-generated quizzes tailored to your learning progress.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Daily Challenge Card */}
                <motion.button
                    whileHover={{ y: -4 }}
                    onClick={() => generateQuiz('daily')}
                    className="bg-gradient-to-br from-blue-500 to-blue-600 p-8 rounded-3xl text-left text-white shadow-lg shadow-blue-200 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:opacity-20 transition-opacity" />
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Daily Challenge</h3>
                        <p className="text-blue-100 mb-6">
                            Test yourself on today's topics. Reinforce what you just learned.
                        </p>
                        <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm">
                            Start Quiz <ChevronRight className="w-4 h-4" />
                        </div>
                    </div>
                </motion.button>

                {/* Spaced Repetition Card */}
                <motion.button
                    whileHover={{ y: -4 }}
                    onClick={() => generateQuiz('revision')}
                    className="bg-white p-8 rounded-3xl text-left border border-slate-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-6">
                            <RefreshCw className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Spaced Repetition</h3>
                        <p className="text-slate-600 mb-6">
                            Review past topics to ensure long-term retention.
                        </p>
                        <div className="inline-flex items-center gap-2 text-purple-600 font-medium">
                            Start Revision <ChevronRight className="w-4 h-4" />
                        </div>
                    </div>
                </motion.button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 justify-center">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}
        </div>
    );
};

// Helper component for the button icon (Removed as we imported ChevronRight)

export default QuizPage;
