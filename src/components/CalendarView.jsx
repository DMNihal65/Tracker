import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sparkles, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';

export default function CalendarView() {
    const { questionsData, getDayProgress, getQuestionStatus } = useTracker();
    const [viewMode, setViewMode] = useState('weekly'); // 'weekly' or 'monthly'
    const [currentWeek, setCurrentWeek] = useState(1);

    // Group days by week (13 weeks for 90 days)
    const totalWeeks = Math.ceil(questionsData.length / 7);
    const weeks = [];
    for (let i = 0; i < totalWeeks; i++) {
        weeks.push(questionsData.slice(i * 7, (i + 1) * 7));
    }

    const currentWeekData = weeks[currentWeek - 1] || [];

    // Calculate week progress
    const getWeekProgress = (weekDays) => {
        const weekQuestions = weekDays.reduce((acc, d) => acc + d.questions.length, 0);
        const weekCompleted = weekDays.reduce((acc, d) => {
            return acc + d.questions.filter(q => getQuestionStatus(q.id).completed).length;
        }, 0);
        return { completed: weekCompleted, total: weekQuestions };
    };

    const weekProgress = getWeekProgress(currentWeekData);

    // Format date nicely
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    };

    return (
        <div className="space-y-8">
            <header>
                <h2 className="text-3xl font-bold text-gray-900">Calendar</h2>
                <p className="text-gray-500 mt-1">Track your 90-day journey</p>
            </header>

            {/* Toggle */}
            <div className="bg-gray-100 p-1 rounded-xl inline-flex">
                <button
                    onClick={() => setViewMode('weekly')}
                    className={clsx(
                        "px-6 py-2 rounded-lg text-sm font-medium transition-all",
                        viewMode === 'weekly' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                    )}
                >
                    Weekly View
                </button>
                <button
                    onClick={() => setViewMode('monthly')}
                    className={clsx(
                        "px-6 py-2 rounded-lg text-sm font-medium transition-all",
                        viewMode === 'monthly' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                    )}
                >
                    Full Overview
                </button>
            </div>

            {viewMode === 'weekly' ? (
                <div className="space-y-6">
                    {/* Week Navigation */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 flex items-center justify-between">
                        <button
                            onClick={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
                            disabled={currentWeek === 1}
                            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-30 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div className="text-center">
                            <h3 className="text-lg font-bold text-gray-900">Week {currentWeek}</h3>
                            <p className="text-sm text-gray-500">Days {(currentWeek - 1) * 7 + 1} - {Math.min(currentWeek * 7, 90)}</p>
                        </div>
                        <button
                            onClick={() => setCurrentWeek(Math.min(totalWeeks, currentWeek + 1))}
                            disabled={currentWeek === totalWeeks}
                            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-30 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    {/* Week Progress Bar */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <div className="flex justify-between text-sm text-gray-500 mb-2">
                            <span>Week Progress</span>
                            <span>{weekProgress.completed}/{weekProgress.total} questions</span>
                        </div>
                        <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                            <div
                                className="bg-green-600 h-full rounded-full transition-all duration-500"
                                style={{ width: weekProgress.total > 0 ? `${(weekProgress.completed / weekProgress.total) * 100}%` : '0%' }}
                            />
                        </div>
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                        {currentWeekData.map((day) => {
                            const progress = getDayProgress(day.day);
                            const completedCount = day.questions.filter(q => getQuestionStatus(q.id).completed).length;

                            return (
                                <Link
                                    key={day.day}
                                    to={`/day/${day.day}`}
                                    className="bg-white rounded-xl border border-gray-200 p-4 hover:border-green-500 hover:shadow-md transition-all group h-48 flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-2xl font-bold text-gray-300 group-hover:text-green-600 transition-colors">{day.day}</span>
                                            {progress === 100 && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                                        </div>
                                        <p className="text-[10px] text-gray-400">{formatDate(day.date)}</p>
                                    </div>

                                    <div>
                                        <div className="flex gap-2 mb-3">
                                            <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-green-50 text-green-600 px-1.5 py-0.5 rounded">
                                                <Sparkles className="w-2.5 h-2.5" />
                                                {day.newQuestions}
                                            </span>
                                            {day.reviewQuestions > 0 && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded">
                                                    <RefreshCw className="w-2.5 h-2.5" />
                                                    {day.reviewQuestions}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                            <span>{completedCount}/{day.questions.length}</span>
                                            <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-green-500 h-full rounded-full transition-all duration-300"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Week Selector Footer */}
                    <div className="flex justify-center gap-2 mt-8 flex-wrap">
                        {Array.from({ length: totalWeeks }, (_, i) => i + 1).map(w => (
                            <button
                                key={w}
                                onClick={() => setCurrentWeek(w)}
                                className={clsx(
                                    "w-8 h-8 rounded-lg text-xs font-medium transition-colors",
                                    currentWeek === w
                                        ? "bg-green-600 text-white"
                                        : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
                                )}
                            >
                                W{w}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                /* Full Overview */
                <div className="bg-white rounded-2xl border border-gray-200 p-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-green-600" />
                        90-Day Overview
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-3">
                        {questionsData.map((day) => {
                            const progress = getDayProgress(day.day);
                            return (
                                <Link
                                    key={day.day}
                                    to={`/day/${day.day}`}
                                    className={clsx(
                                        "aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all border gap-1",
                                        progress === 100
                                            ? "bg-green-100 border-green-200 text-green-700 hover:bg-green-200"
                                            : progress > 0
                                                ? "bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
                                                : "bg-gray-50 border-transparent text-gray-500 hover:bg-white hover:border-gray-200 hover:shadow-sm"
                                    )}
                                >
                                    <span>{day.day}</span>
                                    <span className="text-[8px] opacity-70">{Math.round(progress)}%</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
