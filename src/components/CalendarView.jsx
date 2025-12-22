import React from 'react';
import { useTracker } from '../context/TrackerContext';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';

export default function CalendarView() {
    const { questionsData, getDayProgress } = useTracker();

    return (
        <div className="space-y-8">
            <header>
                <h2 className="text-3xl font-bold text-gray-900">Calendar</h2>
                <p className="text-gray-500 mt-2">Your 70-day roadmap to success.</p>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {questionsData.map((day) => {
                    const progress = getDayProgress(day.day);
                    const isComplete = progress === 100;
                    const isStarted = progress > 0;

                    return (
                        <Link
                            key={day.day}
                            to={`/day/${day.day}`}
                            className={clsx(
                                'aspect-square p-4 rounded-xl border transition-all hover:shadow-md flex flex-col justify-between group relative overflow-hidden',
                                isComplete
                                    ? 'bg-green-50 border-green-200 hover:border-green-300'
                                    : isStarted
                                        ? 'bg-white border-indigo-200 hover:border-indigo-300'
                                        : 'bg-white border-gray-200 hover:border-gray-300'
                            )}
                        >
                            {isComplete && (
                                <div className="absolute top-0 right-0 p-1 bg-green-500 rounded-bl-lg">
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            )}

                            <div>
                                <span className={clsx(
                                    "text-xs font-bold uppercase tracking-wider",
                                    isComplete ? "text-green-700" : "text-gray-500"
                                )}>Day {day.day}</span>
                                <p className="text-xs text-gray-400 mt-1">{day.date}</p>
                            </div>

                            <div>
                                <p className={clsx(
                                    "text-sm font-medium line-clamp-2 mb-2",
                                    isComplete ? "text-green-900" : "text-gray-900"
                                )}>
                                    {day.theme}
                                </p>

                                {/* Progress Bar */}
                                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                    <div
                                        className={clsx("h-full rounded-full transition-all duration-500",
                                            isComplete ? "bg-green-500" : "bg-indigo-500"
                                        )}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
