import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TrackerProvider, useTracker } from './context/TrackerContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import DayView from './components/DayView';
import ProgressPage from './pages/ProgressPage';
import RevisionPage from './pages/RevisionPage';
import QuestionPage from './pages/QuestionPage';
import QuizPage from './pages/QuizPage';
import { Lock } from 'lucide-react';

function Login() {
    const [passcode, setPasscode] = useState('');
    const { login } = useTracker();
    const [error, setError] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (login(passcode)) {
            setError(false);
        } else {
            setError(true);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-8 h-8 text-indigo-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                <p className="text-gray-500 mb-8">Enter your passcode to access the tracker.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="password"
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        placeholder="Enter passcode"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-center text-lg tracking-widest"
                        autoFocus
                    />
                    {error && <p className="text-red-500 text-sm">Incorrect passcode</p>}
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                    >
                        Access Tracker
                    </button>
                </form>
            </div>
        </div>
    );
}

function ProtectedRoute({ children }) {
    const { isAuthenticated } = useTracker();
    if (!isAuthenticated) {
        return <Login />;
    }
    return <Layout>{children}</Layout>;
}

function AppContent() {
    return (
        <Routes>
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><CalendarView /></ProtectedRoute>} />
            <Route path="/progress" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
            <Route path="/revision" element={<ProtectedRoute><RevisionPage /></ProtectedRoute>} />
            <Route path="/quiz" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
            <Route path="/day/:dayId" element={<ProtectedRoute><DayView /></ProtectedRoute>} />
            <Route path="/question/:questionId" element={<ProtectedRoute><QuestionPage /></ProtectedRoute>} />
            <Route path="/questions" element={<ProtectedRoute><Navigate to="/calendar" /></ProtectedRoute>} />
        </Routes>
    );
}

export default function App() {
    return (
        <TrackerProvider>
            <Router>
                <AppContent />
            </Router>
        </TrackerProvider>
    );
}
