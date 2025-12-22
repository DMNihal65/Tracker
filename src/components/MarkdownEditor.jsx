import React, { useState, useRef } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-markdown';
import 'prismjs/themes/prism.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    Bold, Italic, List, Heading1, Heading2, Code, Link as LinkIcon,
    Maximize2, Minimize2, Quote
} from 'lucide-react';
import { clsx } from 'clsx';

// Simple markdown highlighter using Prism
const highlightWithPrism = (code) => highlight(code, languages.markdown, 'markdown');

export default function MarkdownEditor({ value, onChange, placeholder, className }) {
    const [viewMode, setViewMode] = useState('write'); // 'write', 'preview', 'split'
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef(null);

    const insertText = (before, after = '') => {
        if (!containerRef.current) return;
        const textarea = containerRef.current.querySelector('textarea');
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end);

        const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
        onChange(newText);

        // Restore focus and selection (next tick)
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + before.length, end + before.length);
        }, 0);
    };

    const tools = [
        { icon: Bold, label: 'Bold', action: () => insertText('**', '**') },
        { icon: Italic, label: 'Italic', action: () => insertText('*', '*') },
        { icon: Heading1, label: 'H1', action: () => insertText('# ') },
        { icon: Heading2, label: 'H2', action: () => insertText('## ') },
        { icon: List, label: 'List', action: () => insertText('- ') },
        { icon: Quote, label: 'Quote', action: () => insertText('> ') },
        { icon: Code, label: 'Code', action: () => insertText('`', '`') },
        { icon: LinkIcon, label: 'Link', action: () => insertText('[', '](url)') },
    ];

    return (
        <div
            ref={containerRef}
            className={clsx(
                "flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden transition-all duration-200",
                isFullscreen ? "fixed inset-4 z-50 shadow-2xl" : "relative w-full",
                className
            )}
        >
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-1">
                    {tools.map((tool, i) => (
                        <button
                            key={i}
                            onClick={tool.action}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200/50 rounded-md transition-colors"
                            title={tool.label}
                        >
                            <tool.icon className="w-4 h-4" />
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 border-l border-gray-200 pl-4 ml-2">
                    <div className="flex bg-gray-200/50 p-0.5 rounded-lg">
                        <button
                            onClick={() => setViewMode('write')}
                            className={clsx(
                                "px-3 py-1 text-xs font-medium rounded-md transition-all",
                                viewMode === 'write' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            Write
                        </button>
                        <button
                            onClick={() => setViewMode('preview')}
                            className={clsx(
                                "px-3 py-1 text-xs font-medium rounded-md transition-all",
                                viewMode === 'preview' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            Preview
                        </button>
                        <button
                            onClick={() => setViewMode('split')}
                            className={clsx(
                                "px-3 py-1 text-xs font-medium rounded-md transition-all hidden md:block",
                                viewMode === 'split' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            Split
                        </button>
                    </div>

                    <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200/50 rounded-md transition-colors"
                        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                    >
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Editor/Preview Area */}
            <div className={clsx(
                "flex-1 overflow-hidden",
                isFullscreen ? "h-[calc(100vh-100px)]" : "min-h-[300px]"
            )}>
                <div className={clsx(
                    "h-full grid transition-all",
                    viewMode === 'split' ? "grid-cols-2 divide-x divide-gray-100" : "grid-cols-1"
                )}>
                    {/* Editor */}
                    <div className={clsx(
                        "h-full overflow-auto bg-white markdown-editor-textarea",
                        (viewMode === 'preview') && "hidden"
                    )}>
                        <Editor
                            value={value}
                            onValueChange={onChange}
                            highlight={highlightWithPrism}
                            padding={24}
                            placeholder={placeholder}
                            className="font-mono text-sm min-h-full"
                            textareaClassName="focus:outline-none"
                            style={{
                                fontFamily: '"Fira Code", "Fira Mono", monospace',
                                fontSize: 14,
                                backgroundColor: 'transparent',
                                minHeight: '100%',
                            }}
                        />
                    </div>

                    {/* Preview */}
                    <div className={clsx(
                        "h-full overflow-auto bg-gray-50/30 p-6 prose prose-sm max-w-none prose-headings:font-semibold prose-a:text-blue-600 prose-pre:bg-gray-800 prose-pre:text-gray-100",
                        (viewMode === 'write') && "hidden"
                    )}>
                        {value ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {value}
                            </ReactMarkdown>
                        ) : (
                            <div className="text-gray-400 italic">Nothing to preview</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer status */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 flex justify-between">
                <span>Markdown supported</span>
                <span>{value.length} characters</span>
            </div>
        </div>
    );
}
