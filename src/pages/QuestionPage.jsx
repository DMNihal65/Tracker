import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTracker } from '../context/TrackerContext';
import { ChevronLeft, Save, CheckCircle, Circle, FileText, Code, ExternalLink, Brain, Sparkles, AlertCircle } from 'lucide-react';
import CodeEditor from '../components/CodeEditor';
import MarkdownEditor from '../components/MarkdownEditor';
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

    // AI Mentor State
    const [showAIMentor, setShowAIMentor] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState(null);
    const [aiMode, setAiMode] = useState('hint'); // 'hint' or 'review'

    useEffect(() => {
        if (question) {
            const currentStatus = getQuestionStatus(questionId);
            setStatus(currentStatus);
            setNotes(currentStatus.notes || '');
            setCode(currentStatus.code || '// Write your solution here...');
        }
    }, [questionId, question, getQuestionStatus]);

    // Autosave Logic
    useEffect(() => {
        if (!status) return;

        const timer = setTimeout(async () => {
            // Only save if content changed from initial load (optimization)
            // But here we just save if not saving
            if (!isSaving) {
                // We don't want to trigger full loading state for autosave, maybe just a small indicator
                // But updateQuestionProgress is fast enough usually.
                // Let's use a separate "saving" indicator if we want, but reusing isSaving is fine for now
                // actually, let's not block UI with isSaving for autosave

                // Check if changed
                const currentStatus = getQuestionStatus(questionId);
                if (notes !== currentStatus.notes || code !== currentStatus.code) {
                    // console.log("Autosaving...");
                    await updateQuestionProgress(questionId, status.completed, notes, code);
                }
            }
        }, 2000); // Autosave after 2 seconds of inactivity

        return () => clearTimeout(timer);
    }, [notes, code, status, questionId, updateQuestionProgress, getQuestionStatus]);

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

    const handleAIRequest = async (mode) => {
        setAiMode(mode);
        setAiLoading(true);
        setAiResponse(null);
        setShowAIMentor(true);

        try {
            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: mode,
                    data: {
                        problemTitle: question.title,
                        problemDescription: "Standard LeetCode problem", // AI usually knows common problems
                        code: code
                    }
                })
            });

            const data = await response.json();
            setAiResponse(data);
        } catch (error) {
            console.error(error);
            setAiResponse({ error: "Failed to get AI response." });
        } finally {
            setAiLoading(false);
        }
    };

    const handleRewriteNotes = async () => {
        if (!notes.trim()) return;
        setAiLoading(true);
        try {
            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'rewrite_notes',
                    data: { notes }
                })
            });
            const data = await response.json();
            if (data.message) {
                setNotes(data.message);
            }
        } catch (error) {
            console.error("Failed to rewrite notes:", error);
        } finally {
            setAiLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto relative">
            {/* AI Mentor Modal */}
            {showAIMentor && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Brain className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">AI Mentor</h3>
                                    <p className="text-xs text-gray-500">Powered by Groq Llama 3</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAIMentor(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <ChevronLeft className="w-6 h-6 rotate-180" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            {aiLoading ? (
                                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                    <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                                    <p className="text-gray-500 font-medium">Analyzing your code...</p>
                                </div>
                            ) : aiResponse ? (
                                <div className="prose prose-sm max-w-none">
                                    {aiMode === 'review' && aiResponse.bugs ? (
                                        <div className="space-y-6">
                                            {aiResponse.bugs.length > 0 && (
                                                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                                    <h4 className="text-red-800 font-semibold mb-2 flex items-center gap-2">
                                                        <AlertCircle className="w-4 h-4" /> Potential Issues
                                                    </h4>
                                                    <ul className="list-disc list-inside text-red-700 space-y-1">
                                                        {aiResponse.bugs.map((bug, i) => <li key={i}>{bug}</li>)}
                                                    </ul>
                                                </div>
                                            )}

                                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                                <h4 className="text-blue-800 font-semibold mb-2">Feedback</h4>
                                                <p className="text-blue-700">{aiResponse.feedback}</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                                    <h4 className="text-gray-700 font-semibold mb-1 text-xs uppercase tracking-wider">Time Complexity</h4>
                                                    <p className="text-gray-900 font-mono text-lg">{aiResponse.complexity}</p>
                                                </div>
                                                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                                                    <h4 className="text-green-800 font-semibold mb-1 text-xs uppercase tracking-wider">Better Approach</h4>
                                                    <p className="text-green-700 text-sm">{aiResponse.betterApproach}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 text-purple-900">
                                            <p className="whitespace-pre-wrap leading-relaxed">{aiResponse.message || JSON.stringify(aiResponse)}</p>
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
                            <button
                                onClick={() => handleAIRequest('hint')}
                                disabled={aiLoading}
                                className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-purple-300 transition-all shadow-sm flex items-center justify-center gap-2"
                            >
                                <Sparkles className="w-4 h-4 text-yellow-500" />
                                Get a Hint
                            </button>
                            <button
                                onClick={() => handleAIRequest('review')}
                                disabled={aiLoading}
                                className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 flex items-center justify-center gap-2"
                            >
                                <Code className="w-4 h-4" />
                                Review Code
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                            <div className="flex gap-2 mt-3 flex-wrap">
                                {question.type === 'review' ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700">
                                        Review from Day {question.originalDay}
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                        New
                                    </span>
                                )}
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                    {question.topic}
                                </span>
                                <span className={clsx(
                                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                    question.difficulty === 'Easy' ? "bg-green-50 text-green-700" :
                                        question.difficulty === 'Intermediate' ? "bg-yellow-50 text-yellow-700" :
                                            "bg-red-50 text-red-700"
                                )}>
                                    {question.difficulty}
                                </span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                    Day {day.day}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowAIMentor(true)}
                            className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors flex items-center gap-2 border border-purple-100"
                        >
                            <Brain className="w-4 h-4" />
                            AI Mentor
                        </button>
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
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-green-600" />
                        <h3 className="font-semibold text-gray-900">Notes</h3>
                    </div>
                    <button
                        onClick={handleRewriteNotes}
                        disabled={aiLoading || !notes.trim()}
                        className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50"
                    >
                        <Sparkles className="w-3 h-3" />
                        {aiLoading ? 'Rewriting...' : 'Rewrite with AI'}
                    </button>
                </div>
                <div className="p-6">
                    <MarkdownEditor
                        value={notes}
                        onChange={setNotes}
                        placeholder="Add your notes, approach, complexity analysis, edge cases, etc... (Markdown supported)"
                        className="min-h-[400px] border-0 shadow-none"
                    />
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
