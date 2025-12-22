import React, { useState } from 'react';
import { CheckCircle, Circle, FileText, Code } from 'lucide-react';
import { useTracker } from '../context/TrackerContext';
import QuestionModal from './QuestionModal';
import { clsx } from 'clsx';

export default function QuestionCard({ question }) {
    const { getQuestionStatus, updateProgress } = useTracker();
    const status = getQuestionStatus(question.id);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleComplete = (e) => {
        e.stopPropagation();
        updateProgress(question.id, { completed: !status.completed });
    };

    return (
        <>
            <div
                onClick={() => setIsModalOpen(true)}
                className={clsx(
                    "group p-5 rounded-xl border transition-all cursor-pointer hover:shadow-md flex items-center justify-between",
                    status.completed
                        ? "bg-green-50 border-green-200"
                        : "bg-white border-gray-200 hover:border-indigo-200"
                )}
            >
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleComplete}
                        className={clsx(
                            "p-1 rounded-full transition-colors",
                            status.completed ? "text-green-600 hover:text-green-700" : "text-gray-300 hover:text-gray-400"
                        )}
                    >
                        {status.completed ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                    </button>

                    <div>
                        <h4 className={clsx(
                            "font-medium transition-colors",
                            status.completed ? "text-green-900 line-through decoration-green-900/30" : "text-gray-900"
                        )}>
                            {question.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">{question.type}</span>
                            {(status.notes || status.code) && (
                                <div className="flex gap-2">
                                    {status.notes && <FileText className="w-3 h-3 text-indigo-500" />}
                                    {status.code && <Code className="w-3 h-3 text-indigo-500" />}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 bg-white rounded-lg border border-gray-200 text-sm font-medium text-gray-600 shadow-sm">
                    View Details
                </div>
            </div>

            {isModalOpen && (
                <QuestionModal
                    question={question}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </>
    );
}
