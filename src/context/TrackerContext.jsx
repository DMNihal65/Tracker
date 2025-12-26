import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchProgress, updateProgress } from '../lib/api';
import questionsData from '../data/questions.json';

const TrackerContext = createContext();

export function TrackerProvider({ children }) {
    const [progress, setProgress] = useState({});
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [streaks, setStreaks] = useState({ current: 0, best: 0 });
    const [dueRevisions, setDueRevisions] = useState([]);

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
            calculateStreaks(data);
            calculateDueRevisions(progressMap);
        } catch (error) {
            console.error('Error loading progress:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStreaks = (data) => {
        const completedDates = new Set();
        data.forEach(item => {
            if (item.completed && item.completed_at) {
                const date = new Date(item.completed_at).toISOString().split('T')[0];
                completedDates.add(date);
            }
        });

        const sortedDates = Array.from(completedDates).sort();
        if (sortedDates.length === 0) {
            setStreaks({ current: 0, best: 0 });
            return;
        }

        let current = 0;
        let best = 0;
        let tempCurrent = 0;

        // Calculate best streak
        for (let i = 0; i < sortedDates.length; i++) {
            if (i > 0) {
                const prev = new Date(sortedDates[i - 1]);
                const curr = new Date(sortedDates[i]);
                const diffTime = Math.abs(curr - prev);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    tempCurrent++;
                } else {
                    tempCurrent = 1;
                }
            } else {
                tempCurrent = 1;
            }
            if (tempCurrent > best) best = tempCurrent;
        }

        // Calculate current streak
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const lastDate = sortedDates[sortedDates.length - 1];

        if (lastDate === today || lastDate === yesterday) {
            // Recalculate current streak working backwards
            current = 1;
            for (let i = sortedDates.length - 1; i > 0; i--) {
                const curr = new Date(sortedDates[i]);
                const prev = new Date(sortedDates[i - 1]);
                const diffTime = Math.abs(curr - prev);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    current++;
                } else {
                    break;
                }
            }
        } else {
            current = 0;
        }

        setStreaks({ current, best });
    };

    const calculateDueRevisions = (progressMap) => {
        const due = [];
        const now = new Date();

        questionsData.forEach(day => {
            day.questions.forEach(q => {
                const status = progressMap[q.id];
                if (status && status.completed) {
                    const lastReviewed = status.last_reviewed ? new Date(status.last_reviewed) : new Date(status.completed_at || status.updated_at);
                    const interval = status.review_interval || 1; // Default 1 day

                    const nextReview = new Date(lastReviewed);
                    nextReview.setDate(nextReview.getDate() + interval);

                    if (nextReview <= now) {
                        due.push({ ...q, day: day.day, ...status });
                    }
                }
            });
        });
        setDueRevisions(due);
    };

    const markAsReviewed = async (questionId) => {
        const currentStatus = progress[questionId];
        if (!currentStatus) return;

        const currentInterval = currentStatus.review_interval || 1;
        // Simple SM-2 like: double the interval
        const newInterval = Math.min(currentInterval * 2, 60); // Cap at 60 days
        const newCount = (currentStatus.review_count || 0) + 1;
        const now = new Date().toISOString();

        const updates = {
            last_reviewed: now,
            review_interval: newInterval,
            review_count: newCount
        };

        // Optimistic update
        const newProgress = { ...currentStatus, ...updates };
        setProgress(prev => ({ ...prev, [questionId]: newProgress }));

        // Recalculate due revisions
        const newProgressMap = { ...progress, [questionId]: newProgress };
        calculateDueRevisions(newProgressMap);

        try {
            await updateProgress(questionId, currentStatus.completed, currentStatus.notes, currentStatus.code, updates);
        } catch (error) {
            console.error('Error updating review status:', error);
            // Revert? For now, just log
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

        // If completing for the first time, set completed_at
        if (updates.completed && !currentProgress.completed) {
            newProgress.completed_at = new Date().toISOString();
        }

        setProgress(prev => {
            const next = { ...prev, [questionId]: newProgress };
            // Recalculate streaks and revisions
            // Note: This is a bit expensive to do on every update, but safe for small data
            // For better perf, we'd update streaks incrementally
            // calculateStreaks(Object.values(next)); 
            // calculateDueRevisions(next);
            return next;
        });

        // Trigger recalc after state update (simplified)
        setTimeout(() => {
            calculateStreaks(Object.values({ ...progress, [questionId]: newProgress }));
            calculateDueRevisions({ ...progress, [questionId]: newProgress });
        }, 0);

        try {
            await updateProgress(
                questionId,
                newProgress.completed,
                newProgress.notes,
                newProgress.code,
                { completed_at: newProgress.completed_at }
            );
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
            getTotalProgress,
            streaks,
            dueRevisions,
            markAsReviewed
        }}>
            {children}
        </TrackerContext.Provider>
    );
}

export function useTracker() {
    return useContext(TrackerContext);
}
