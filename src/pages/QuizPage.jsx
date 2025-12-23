import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, RefreshCw, Trophy, AlertCircle, Loader2 } from 'lucide-react';
import QuizCard from '../components/quiz/QuizCard';
import seedData from '../data/seed_data.json';

const QuizPage = () => {
    const [loading, setLoading] = useState(false);
    const [quizData, setQuizData] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [error, setError] = useState(null);
    const [mode, setMode] = useState(null); // 'daily' or 'revision'

    const generateQuiz = async (selectedMode) => {
        setLoading(true);
        setError(null);
        setMode(selectedMode);

        try {
            // Determine topics based on mode
            let topics = [];
            const today = new Date(); // In a real app, use the actual tracker date
            // For demo, let's pick some topics from seed data

            if (selectedMode === 'daily') {
                // Pick today's topics (mocking "today" as day 1 for demo if needed, or random)
                const day1 = seedData.find(d => d.day === 1);
                topics = [day1.theme, ...day1.coding_questions.split(',')];
            } else {
                // Spaced repetition: pick random topics from past
                const pastDays = seedData.slice(0, 10);
                const randomDay = pastDays[Math.floor(Math.random() * pastDays.length)];
                topics = [randomDay.theme, ...randomDay.coding_questions.split(',')];
            }

            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'quiz',
                    data: {
                        topics: topics,
                        difficulty: 'Medium'
                    }
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

        // Wait a bit before moving to next question
        setTimeout(() => {
            if (currentQuestionIndex < quizData.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
            } else {
                setShowResult(true);
            }
        }, 1500);
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

// Helper component for the button icon
const ChevronRight = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
);

export default QuizPage;
