import React from 'react';
import { useTracker } from '../context/TrackerContext';
import { Link } from 'react-router-dom';
import { CheckCircle, Target, Flame, Trophy, ArrowRight, Circle } from 'lucide-react';
import { clsx } from 'clsx';

export default function Dashboard() {
    const { getTotalProgress, questionsData, getDayProgress, getQuestionStatus, streaks, dueRevisions } = useTracker();
    const { total, completed, percentage } = getTotalProgress();

    // Find "Today's" content - for now just picking the first incomplete day or Day 1
    const currentDay = questionsData.find(d => getDayProgress(d.day) < 100) || questionsData[0];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Day {currentDay.day} of 70</h2>
                    <p className="text-gray-500 mt-1">Foundation Phase • {currentDay.day_name}, {currentDay.date}</p>
                </div>
                <Link to={`/day/${currentDay.day}`} className="bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-800 transition-colors flex items-center gap-2 shadow-sm">
                    Continue Learning
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    value={completed}
                    label="Questions Solved"
                    icon={CheckCircle}
                    iconColor="text-green-600"
                    iconBg="bg-green-50"
                />
                <StatCard
                    value={`${Math.round(percentage)}%`}
                    label="Progress"
                    icon={Target}
                    iconColor="text-orange-500"
                    iconBg="bg-orange-50"
                />
                <StatCard
                    value={streaks?.current || 0}
                    label="Day Streak"
                    icon={Flame}
                    iconColor="text-orange-500"
                    iconBg="bg-orange-50"
                />
                <StatCard
                    value={streaks?.best || 0}
                    label="Best Streak"
                    icon={Trophy}
                    iconColor="text-yellow-600"
                    iconBg="bg-yellow-50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Column: Today's Questions */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <span className="w-1 h-6 bg-green-600 rounded-full"></span>
                                Today's Questions
                            </h3>
                            <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                                {currentDay.questions.filter(q => getQuestionStatus(q.id).completed).length}/{currentDay.questions.length}
                            </span>
                        </div>

                        <div className="space-y-3">
                            {currentDay.questions.map((question) => {
                                const status = getQuestionStatus(question.id);
                                return (
                                    <Link
                                        key={question.id}
                                        to={`/question/${question.id}`}
                                        className="group flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50/30 transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={clsx(
                                                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                                                status.completed ? "bg-green-500 border-green-500" : "border-gray-300 group-hover:border-green-400"
                                            )}>
                                                {status.completed && <CheckCircle className="w-4 h-4 text-white" />}
                                            </div>
                                            <div>
                                                <h4 className={clsx(
                                                    "font-medium transition-colors",
                                                    status.completed ? "text-gray-500 line-through" : "text-gray-900"
                                                )}>{question.title}</h4>
                                                <div className="flex gap-2 mt-1">
                                                    <span className="text-[10px] font-semibold bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{question.topic}</span>
                                                    <span className={clsx(
                                                        "text-[10px] font-semibold px-2 py-0.5 rounded",
                                                        question.difficulty === 'Easy' ? "bg-green-50 text-green-600" :
                                                            question.difficulty === 'Medium' ? "bg-yellow-50 text-yellow-600" :
                                                                "bg-red-50 text-red-600"
                                                    )}>{question.difficulty}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-green-600 transition-colors" />
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Day Progress Bar */}
                        <div className="mt-8">
                            <div className="flex justify-between text-xs text-gray-500 mb-2">
                                <span>Day Progress</span>
                                <span>{Math.round(getDayProgress(currentDay.day))}%</span>
                            </div>
                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                <div
                                    className="bg-green-500 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${getDayProgress(currentDay.day)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Widgets */}
                <div className="space-y-6">
                    {/* Weekly Progress Widget */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            Weekly Progress
                        </h3>
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map(week => (
                                <div key={week} className="space-y-1">
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Week {week}</span>
                                        <span>0/21</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-blue-500 h-full w-0 rounded-full"></div>
                                    </div>
                                </div>
                            ))}
                            <button className="w-full mt-2 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                View All Progress
                            </button>
                        </div>
                    </div>

                    {/* Revision Widget */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <RotateCcw className="w-5 h-5 text-orange-500" />
                            Due for Revision
                        </h3>
                        {dueRevisions && dueRevisions.length > 0 ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">{dueRevisions.length} questions due</span>
                                    <Link to="/revision" className="text-xs font-medium text-orange-600 hover:text-orange-700">Review Now</Link>
                                </div>
                                <div className="space-y-2">
                                    {dueRevisions.slice(0, 3).map(q => (
                                        <div key={q.id} className="text-xs p-2 bg-orange-50 rounded-lg text-gray-700 truncate">
                                            {q.title}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
                                    <CheckCircle className="w-6 h-6 text-green-500" />
                                </div>
                                <p className="text-sm text-gray-500">All caught up!</p>
                                <p className="text-xs text-gray-400 mt-1">No questions due for revision today.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ value, label, icon: Icon, iconColor, iconBg }) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 flex items-center justify-between">
            <div>
                <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
                <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-wide">{label}</p>
            </div>
            <div className={`p-3 rounded-xl ${iconBg}`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
        </div>
    );
}

function Calendar(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
    );
}

function RotateCcw(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
        </svg>
    );
}
