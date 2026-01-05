import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchProgressV2, updateProgressV2 } from '../lib/api';
import questionsData from '../data/questions_v2.json';

const TrackerContext = createContext();

export function TrackerProvider({ children }) {
    const [progress, setProgress] = useState({});
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [streaks, setStreaks] = useState({ current: 0, best: 0 });

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
            const data = await fetchProgressV2();
            // Convert array to object for easier lookup
            const progressMap = {};
            data.forEach(item => {
                progressMap[item.question_id] = item;
            });
            setProgress(progressMap);
            calculateStreaks(data);
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
            return next;
        });

        // Trigger recalc after state update
        setTimeout(() => {
            calculateStreaks(Object.values({ ...progress, [questionId]: newProgress }));
        }, 0);

        try {
            await updateProgressV2(
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

    // Get current day based on calendar dates
    const getCurrentDay = () => {
        const today = new Date().toISOString().split('T')[0];
        const dayData = questionsData.find(d => d.date === today);
        if (dayData) return dayData.day;

        // If today's date not found, find the closest day
        const todayDate = new Date(today);
        for (let i = questionsData.length - 1; i >= 0; i--) {
            const dayDate = new Date(questionsData[i].date);
            if (dayDate <= todayDate) {
                return questionsData[i].day;
            }
        }
        return 1;
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
            getCurrentDay,
            streaks
        }}>
            {children}
        </TrackerContext.Provider>
    );
}

export function useTracker() {
    return useContext(TrackerContext);
}
