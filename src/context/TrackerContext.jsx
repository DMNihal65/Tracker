import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchProgress, updateProgress } from '../lib/api';
import questionsData from '../data/questions.json';

const TrackerContext = createContext();

export function TrackerProvider({ children }) {
    const [progress, setProgress] = useState({});
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check for auth in localStorage
        const auth = localStorage.getItem('tracker_auth');
        if (auth === '6565') {
            setIsAuthenticated(true);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            loadProgress();
        }
    }, [isAuthenticated]);

    const loadProgress = async () => {
        try {
            const data = await fetchProgress();
            // Convert array to object for easier lookup
            const progressMap = {};
            data.forEach(item => {
                progressMap[item.question_id] = item;
            });
            setProgress(progressMap);
        } catch (error) {
            console.error('Error loading progress:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = (passcode) => {
        if (passcode === '6565') {
            localStorage.setItem('tracker_auth', passcode);
            setIsAuthenticated(true);
            return true;
        }
        return false;
    };

    const handleUpdateProgress = async (questionId, updates) => {
        // Optimistic update
        const currentProgress = progress[questionId] || {};
        const newProgress = { ...currentProgress, ...updates, question_id: questionId };

        setProgress(prev => ({
            ...prev,
            [questionId]: newProgress
        }));

        try {
            await updateProgress(questionId, newProgress.completed, newProgress.notes, newProgress.code);
        } catch (error) {
            console.error('Error updating progress:', error);
            // Revert on error
            setProgress(prev => ({
                ...prev,
                [questionId]: currentProgress
            }));
        }
    };

    const getQuestionStatus = (questionId) => {
        return progress[questionId] || { completed: false, notes: '', code: '' };
    };

    const getDayProgress = (day) => {
        const dayData = questionsData.find(d => d.day === day);
        if (!dayData) return 0;

        const totalQuestions = dayData.questions.length;
        if (totalQuestions === 0) return 0;

        const completedCount = dayData.questions.filter(q => {
            const status = progress[q.id];
            return status && status.completed;
        }).length;

        return (completedCount / totalQuestions) * 100;
    };

    const getTotalProgress = () => {
        let totalQuestions = 0;
        let completedCount = 0;

        questionsData.forEach(day => {
            day.questions.forEach(q => {
                totalQuestions++;
                if (progress[q.id]?.completed) {
                    completedCount++;
                }
            });
        });

        return {
            total: totalQuestions,
            completed: completedCount,
            percentage: totalQuestions > 0 ? (completedCount / totalQuestions) * 100 : 0
        };
    };

    return (
        <TrackerContext.Provider value={{
            questionsData,
            progress,
            loading,
            isAuthenticated,
            login: handleLogin,
            updateProgress: handleUpdateProgress,
            updateQuestionProgress: (id, completed, notes, code) => handleUpdateProgress(id, { completed, notes, code }),
            getQuestionStatus,
            getDayProgress,
            getTotalProgress
        }}>
            {children}
        </TrackerContext.Provider>
    );
}

export function useTracker() {
    return useContext(TrackerContext);
}
