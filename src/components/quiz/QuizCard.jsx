import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, HelpCircle, Code, ChevronRight } from 'lucide-react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-tomorrow.css';

const QuizCard = ({ question, onAnswer, index, total }) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [codeAnswer, setCodeAnswer] = useState(question.starterCode || '');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const isMCQ = !!question.options;

    const handleOptionClick = (idx) => {
        if (isSubmitted) return;
        setSelectedOption(idx);
        setIsSubmitted(true);
        onAnswer(idx === question.correctAnswer);
    };

    const handleCodeSubmit = () => {
        setIsSubmitted(true);
        // For coding questions, we might need a more complex validation or just self-assessment
        // For now, we'll just show the solution/explanation
        onAnswer(true); // Assume correct for self-assessment flow
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
        >
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                        Question {index + 1} of {total}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${isMCQ ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                        {isMCQ ? 'Multiple Choice' : 'Coding Challenge'}
                    </span>
                </div>

                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                    {question.question || question.title}
                </h3>

                {!isMCQ && (
                    <p className="text-slate-600 mb-4 text-sm">{question.description}</p>
                )}

                {isMCQ ? (
                    <div className="space-y-3">
                        {question.options.map((option, idx) => {
                            let optionClass = "w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between group ";

                            if (isSubmitted) {
                                if (idx === question.correctAnswer) {
                                    optionClass += "bg-emerald-50 border-emerald-200 text-emerald-700";
                                } else if (idx === selectedOption) {
                                    optionClass += "bg-red-50 border-red-200 text-red-700";
                                } else {
                                    optionClass += "bg-slate-50 border-slate-100 text-slate-400 opacity-60";
                                }
                            } else {
                                optionClass += "bg-white border-slate-200 hover:border-blue-400 hover:shadow-md text-slate-700";
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleOptionClick(idx)}
                                    disabled={isSubmitted}
                                    className={optionClass}
                                >
                                    <span className="font-medium">{option}</span>
                                    {isSubmitted && idx === question.correctAnswer && (
                                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                                    )}
                                    {isSubmitted && idx === selectedOption && idx !== question.correctAnswer && (
                                        <XCircle className="w-5 h-5 text-red-500" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <Editor
                                value={codeAnswer}
                                onValueChange={setCodeAnswer}
                                highlight={code => highlight(code, languages.js)}
                                padding={16}
                                style={{
                                    fontFamily: '"Fira Code", "Fira Mono", monospace',
                                    fontSize: 14,
                                    backgroundColor: '#f8fafc',
                                }}
                                className="min-h-[200px]"
                                disabled={isSubmitted}
                            />
                        </div>
                        {!isSubmitted && (
                            <button
                                onClick={handleCodeSubmit}
                                className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                            >
                                <Code className="w-4 h-4" />
                                Submit Solution
                            </button>
                        )}
                    </div>
                )}

                <AnimatePresence>
                    {isSubmitted && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-6 pt-6 border-t border-slate-100"
                        >
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600 mt-1">
                                    <HelpCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-800 mb-1">Explanation</h4>
                                    <p className="text-slate-600 text-sm leading-relaxed">
                                        {question.explanation || "Great job attempting this problem! Review the test cases and optimal solution to verify your understanding."}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default QuizCard;
