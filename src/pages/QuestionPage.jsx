import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTracker } from '../context/TrackerContext';
import { ChevronLeft, Save, CheckCircle, Circle, FileText, Code, ExternalLink } from 'lucide-react';
import CodeEditor from '../components/CodeEditor';
import { clsx } from 'clsx';

export default function QuestionPage() {
    const { questionId } = useParams();
    const navigate = useNavigate();
    const { questionsData, getQuestionStatus, updateQuestionProgress } = useTracker();

    // Find the question and its day
    let question = null;
    let day = null;

    for (const d of questionsData) {
        const q = d.questions.find(q => q.id === questionId);
        if (q) {
            question = q;
            day = d;
            break;
        }
    }

    const [status, setStatus] = useState(null);
    const [notes, setNotes] = useState('');
    const [code, setCode] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (question) {
            const currentStatus = getQuestionStatus(questionId);
            setStatus(currentStatus);
            setNotes(currentStatus.notes || '');
            setCode(currentStatus.code || '// Write your solution here...');
        }
    }, [questionId, question, getQuestionStatus]);

    if (!question || !status) return <div>Question not found</div>;

    const handleSave = async () => {
        setIsSaving(true);
        await updateQuestionProgress(questionId, status.completed, notes, code);
        setIsSaving(false);
    };

    const toggleComplete = async () => {
        const newCompleted = !status.completed;
        await updateQuestionProgress(questionId, newCompleted, notes, code);
        // State update will happen via context, but we can optimistically update local state if needed
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Navigation */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 text-gray-500" />
                </button>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Link to={`/day/${day.day}`} className="hover:text-gray-900">Day {day.day}</Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">{question.title}</span>
                </div>
            </div>

            {/* Header Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    <div className="flex items-start gap-4">
                        <button
                            onClick={toggleComplete}
                            className={clsx(
                                "mt-1 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                                status.completed
                                    ? "bg-green-500 border-green-500 hover:bg-green-600"
                                    : "border-gray-300 hover:border-green-400"
                            )}
                        >
                            {status.completed && <CheckCircle className="w-5 h-5 text-white" />}
                        </button>
                        <div>
                            <h1 className={clsx(
                                "text-2xl font-bold transition-colors",
                                status.completed ? "text-gray-500 line-through" : "text-gray-900"
                            )}>
                                {question.title}
                            </h1>
                            <div className="flex gap-2 mt-3">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                    {question.topic}
                                </span>
                                <span className={clsx(
                                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                    question.difficulty === 'Easy' ? "bg-green-50 text-green-700" :
                                        question.difficulty === 'Medium' ? "bg-yellow-50 text-yellow-700" :
                                            "bg-red-50 text-red-700"
                                )}>
                                    {question.difficulty}
                                </span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                    Day {day.day}
                                </span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                    Week {day.week}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <a
                            href={`https://leetcode.com/problemset/all/?search=${question.title}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
                        >
                            Solve on LeetCode
                            <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-70"
                        >
                            {isSaving ? 'Saving...' : 'Save Progress'}
                            <Save className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Notes Section */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-gray-900">Notes</h3>
                </div>
                <div className="p-6">
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add your notes, approach, complexity analysis, edge cases, etc..."
                        className="w-full min-h-[200px] p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-y text-gray-700 font-mono text-sm leading-relaxed"
                    />
                    <p className="text-xs text-gray-400 mt-2">
                        Tip: Document your approach, time/space complexity, and any tricky edge cases.
                    </p>
                </div>
            </div>

            {/* Code Editor Section */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Code className="w-5 h-5 text-orange-500" />
                        <h3 className="font-semibold text-gray-900">Solution Code</h3>
                    </div>
                    <select className="text-sm border-gray-200 rounded-md text-gray-600 bg-white px-2 py-1">
                        <option>Python</option>
                        <option>JavaScript</option>
                        <option>Java</option>
                        <option>C++</option>
                    </select>
                </div>
                <div className="p-0 bg-[#1e1e1e]">
                    <CodeEditor
                        code={code}
                        onCodeChange={setCode}
                        language="javascript" // Defaulting to JS for highlighting, but user can write anything
                    />
                </div>
            </div>
        </div>
    );
}
