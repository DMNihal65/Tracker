import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTracker } from '../context/TrackerContext';
import { ChevronLeft, ChevronRight, Calendar, ArrowRight, CheckCircle, Circle, RefreshCw, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

export default function DayView() {
    const { dayId } = useParams();
    const { questionsData, getDayProgress, getQuestionStatus } = useTracker();

    const dayNum = parseInt(dayId);
    const day = questionsData.find(d => d.day === dayNum);

    if (!day) return <div>Day not found</div>;

    const progress = getDayProgress(dayNum);
    const completedCount = day.questions.filter(q => getQuestionStatus(q.id).completed).length;
    const totalCount = day.questions.length;

    // Separate new and review questions
    const newQuestions = day.questions.filter(q => q.type === 'new');
    const reviewQuestions = day.questions.filter(q => q.type === 'review');

    // Format date nicely
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="space-y-8">
            {/* Navigation Header */}
            <div className="flex items-center justify-between">
                <Link to="/calendar" className="flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Calendar
                </Link>
                <div className="flex items-center gap-2">
                    <Link
                        to={dayNum > 1 ? `/day/${dayNum - 1}` : '#'}
                        className={clsx(
                            "flex items-center px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm text-sm transition-colors",
                            dayNum > 1 ? "bg-white text-gray-600 hover:text-gray-900" : "bg-gray-50 text-gray-300 cursor-not-allowed"
                        )}
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Day {dayNum - 1}
                    </Link>
                    <div className="px-4 py-1.5 bg-gray-100 rounded-lg text-sm font-medium text-gray-600 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Day {dayNum}
                    </div>
                    <Link
                        to={dayNum < 90 ? `/day/${dayNum + 1}` : '#'}
                        className={clsx(
                            "flex items-center px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm text-sm transition-colors",
                            dayNum < 90 ? "bg-white text-gray-600 hover:text-gray-900" : "bg-gray-50 text-gray-300 cursor-not-allowed"
                        )}
                    >
                        Day {dayNum + 1}
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>
            </div>

            {/* Day Header Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-green-200">
                            {day.day}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Day {day.day}</h1>
                            <p className="text-gray-500 mt-1">{formatDate(day.date)}</p>
                            <div className="flex gap-2 mt-3">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    {day.newQuestions} New
                                </span>
                                {day.reviewQuestions > 0 && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700">
                                        <RefreshCw className="w-3 h-3 mr-1" />
                                        {day.reviewQuestions} Review
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="text-4xl font-bold text-gray-900 flex items-center justify-end gap-2">
                            {completedCount}<span className="text-gray-300 text-2xl">/{totalCount}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Questions Completed</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-8">
                    <div className="flex justify-between text-sm text-gray-500 mb-2">
                        <span>{Math.round(progress)}% complete</span>
                        <span>{totalCount - completedCount} remaining</span>
                    </div>
                    <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                        <div
                            className="bg-green-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Review Questions Section */}
            {reviewQuestions.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-orange-500" />
                        Review Questions
                        <span className="text-xs font-medium text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                            Spaced Repetition
                        </span>
                    </h3>

                    <div className="space-y-4">
                        {reviewQuestions.map((question, index) => {
                            const status = getQuestionStatus(question.id);
                            return (
                                <Link
                                    key={question.id}
                                    to={`/question/${question.id}`}
                                    className="group bg-white rounded-xl border border-orange-200 p-6 flex items-center justify-between hover:border-orange-400 hover:shadow-md transition-all"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={clsx(
                                            "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0",
                                            status.completed ? "bg-green-500 border-green-500" : "border-orange-300 group-hover:border-orange-400"
                                        )}>
                                            {status.completed ? <CheckCircle className="w-5 h-5 text-white" /> : <Circle className="w-5 h-5 text-transparent" />}
                                        </div>
                                        <div>
                                            <h4 className={clsx(
                                                "text-lg font-medium transition-colors",
                                                status.completed ? "text-gray-500 line-through" : "text-gray-900"
                                            )}>
                                                {question.title}
                                            </h4>
                                            <div className="flex gap-2 mt-2">
                                                <span className="text-xs font-medium bg-orange-50 text-orange-700 px-2 py-1 rounded-md">
                                                    Review from Day {question.originalDay}
                                                </span>
                                                <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-md">{question.topic}</span>
                                                <DifficultyBadge difficulty={question.difficulty} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-2 rounded-full bg-orange-50 group-hover:bg-orange-100 transition-colors">
                                        <ArrowRight className="w-5 h-5 text-orange-400 group-hover:text-orange-600" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* New Questions Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-green-500" />
                    New Questions
                </h3>

                <div className="space-y-4">
                    {newQuestions.map((question, index) => {
                        const status = getQuestionStatus(question.id);
                        return (
                            <Link
                                key={question.id}
                                to={`/question/${question.id}`}
                                className="group bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-between hover:border-green-500 hover:shadow-md transition-all"
                            >
                                <div className="flex items-center gap-6">
                                    <div className={clsx(
                                        "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0",
                                        status.completed ? "bg-green-500 border-green-500" : "border-gray-300 group-hover:border-green-400"
                                    )}>
                                        {status.completed ? <CheckCircle className="w-5 h-5 text-white" /> : <Circle className="w-5 h-5 text-transparent" />}
                                    </div>
                                    <div>
                                        <h4 className={clsx(
                                            "text-lg font-medium transition-colors",
                                            status.completed ? "text-gray-500 line-through" : "text-gray-900"
                                        )}>
                                            {question.title}
                                        </h4>
                                        <div className="flex gap-2 mt-2">
                                            <span className="text-xs font-medium bg-green-50 text-green-700 px-2 py-1 rounded-md">New</span>
                                            <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-md">{question.topic}</span>
                                            <DifficultyBadge difficulty={question.difficulty} />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-2 rounded-full bg-gray-50 group-hover:bg-green-50 transition-colors">
                                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function DifficultyBadge({ difficulty }) {
    const colors = {
        'Easy': 'bg-green-50 text-green-700',
        'Intermediate': 'bg-yellow-50 text-yellow-700',
        'Hard': 'bg-red-50 text-red-700'
    };
    return (
        <span className={clsx("text-xs font-medium px-2 py-1 rounded-md", colors[difficulty] || colors['Easy'])}>
            {difficulty}
        </span>
    );
}
