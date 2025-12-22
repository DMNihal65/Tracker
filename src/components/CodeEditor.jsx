import React from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css'; // Or your preferred theme

export default function CodeEditor({ code, onCodeChange }) {
    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 font-mono text-sm">
            <Editor
                value={code}
                onValueChange={onCodeChange}
                highlight={code => highlight(code, languages.js)}
                padding={16}
                style={{
                    fontFamily: '"Fira code", "Fira Mono", monospace',
                    fontSize: 14,
                    minHeight: '200px',
                }}
                className="min-h-[200px]"
            />
        </div>
    );
}
