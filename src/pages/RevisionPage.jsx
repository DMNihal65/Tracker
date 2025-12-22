import React from 'react';
import { useTracker } from '../context/TrackerContext';
import { Link } from 'react-router-dom';
import { RotateCcw, CheckCircle, ArrowRight, Calendar } from 'lucide-react';
import { clsx } from 'clsx';

export default function RevisionPage() {
    const { questionsData, getQuestionStatus } = useTracker();

    // Spaced Repetition Logic (Simplified)
    // Intervals: 1, 3, 7, 21, 30 days after completion
    // For this demo, we'll simulate "Due" items based on completion status and random assignment
    // In a real app, we'd store `completedAt` timestamp and calculate diff

    const completedQuestions = [];
    questionsData.forEach(day => {
        day.questions.forEach(q => {
            const status = getQuestionStatus(q.id);
            if (status.completed) {
                completedQuestions.push({ ...q, day: day.day });
            }
        });
    });

    // Mocking "Due Today" - taking the first 3 completed questions as an example
    const dueQuestions = completedQuestions.slice(0, 3);

    // Mocking "Upcoming"
    const upcomingQuestions = completedQuestions.slice(3, 8);

    return (
        <div className="space-y-8">
            <header>
                <h2 className="text-3xl font-bold text-gray-900">Revision Queue</h2>
                <p className="text-gray-500 mt-1">Spaced repetition to retain what you've learned.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Queue */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <RotateCcw className="w-5 h-5 text-orange-500" />
                            Due for Review
                        </h3>

                        {dueQuestions.length > 0 ? (
                            <div className="space-y-4">
                                {dueQuestions.map((q) => (
                                    <div key={q.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-orange-50/30 hover:border-orange-200 transition-all">
                                        <div>
                                            <h4 className="font-medium text-gray-900">{q.title}</h4>
                                            <div className="flex gap-2 mt-1 text-xs text-gray-500">
                                                <span>Day {q.day}</span>
                                                <span>•</span>
                                                <span>{q.topic}</span>
                                            </div>
                                        </div>
                                        <Link
                                            to={`/question/${q.id}`}
                                            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Review
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-500" />
                                </div>
                                <h4 className="text-lg font-bold text-gray-900">All Caught Up!</h4>
                                <p className="text-gray-500 mt-1">No questions due for revision today.</p>
                            </div>
                        )}
                    </div>

                    {/* Upcoming Reviews */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-500" />
                            Upcoming Reviews
                        </h3>
                        <div className="space-y-3">
                            {upcomingQuestions.map((q) => (
                                <div key={q.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                        <span className="text-sm font-medium text-gray-700">{q.title}</span>
                                    </div>
                                    <span className="text-xs text-gray-400">Tomorrow</span>
                                </div>
                            ))}
                            {upcomingQuestions.length === 0 && (
                                <p className="text-sm text-gray-400 italic">No upcoming reviews scheduled.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-indigo-600 rounded-2xl p-6 text-white">
                        <h3 className="font-bold text-lg mb-2">How it works</h3>
                        <p className="text-indigo-100 text-sm leading-relaxed mb-4">
                            We use spaced repetition to help you remember solutions. You'll be asked to review questions at these intervals:
                        </p>
                        <div className="flex justify-between text-center">
                            {[1, 3, 7, 21, 30].map(day => (
                                <div key={day} className="bg-indigo-500/50 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold">
                                    {day}d
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
