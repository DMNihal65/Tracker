import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTracker } from '../context/TrackerContext';
import { ChevronLeft } from 'lucide-react';
import QuestionCard from './QuestionCard';

export default function DayView() {
    const { dayId } = useParams();
    const { questionsData } = useTracker();

    const day = questionsData.find(d => d.day === parseInt(dayId));

    if (!day) return <div>Day not found</div>;

    return (
        <div className="space-y-8">
            <header className="flex items-center gap-4">
                <Link to="/calendar" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ChevronLeft className="w-6 h-6 text-gray-600" />
                </Link>
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Day {day.day}: {day.theme}</h2>
                    <p className="text-gray-500 mt-1">{day.date} • {day.day_name}</p>
                </div>
            </header>

            <div className="space-y-4">
                {day.questions.map(question => (
                    <QuestionCard key={question.id} question={question} />
                ))}
            </div>
        </div>
    );
}
