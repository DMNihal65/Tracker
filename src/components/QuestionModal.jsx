import React, { useState, useEffect } from 'react';
import { X, Save, Check } from 'lucide-react';
import CodeEditor from './CodeEditor';
import { useTracker } from '../context/TrackerContext';

export default function QuestionModal({ question, onClose }) {
    const { getQuestionStatus, updateProgress } = useTracker();
    const status = getQuestionStatus(question.id);

    const [notes, setNotes] = useState(status.notes || '');
    const [code, setCode] = useState(status.code || '');
    const [completed, setCompleted] = useState(status.completed || false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // Disable body scroll when modal is open
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        await updateProgress(question.id, { completed, notes, code });
        setIsSaving(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{question.title}</h2>
                        <p className="text-gray-500 mt-1">{question.topic} • {question.type}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Status Toggle */}
                    <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                            <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${completed ? 'bg-indigo-600 border-indigo-600' : 'border-gray-400 bg-white'}`}>
                                {completed && <Check className="w-4 h-4 text-white" />}
                            </div>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={completed}
                                onChange={(e) => setCompleted(e.target.checked)}
                            />
                            <span className="font-medium text-indigo-900">Mark as Completed</span>
                        </label>
                    </div>

                    {/* Notes Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Notes & Thoughts</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Write down your approach, complexity analysis, or key takeaways..."
                            className="w-full h-32 p-4 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-all"
                        />
                    </div>

                    {/* Code Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Solution Code</label>
                        <CodeEditor code={code} onChange={setCode} />
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-lg text-gray-600 font-medium hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center gap-2"
                    >
                        {isSaving ? 'Saving...' : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Progress
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
