import React from 'react';
import { useTracker } from '../context/TrackerContext';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { CheckCircle, Circle, Target } from 'lucide-react';

export default function ProgressPage() {
    const { getTotalProgress, questionsData, getQuestionStatus } = useTracker();
    const { total, completed, percentage } = getTotalProgress();

    // Calculate topic breakdown
    const topicStats = {};
    questionsData.forEach(day => {
        day.questions.forEach(q => {
            if (!topicStats[q.topic]) {
                topicStats[q.topic] = { total: 0, completed: 0 };
            }
            topicStats[q.topic].total++;
            if (getQuestionStatus(q.id).completed) {
                topicStats[q.topic].completed++;
            }
        });
    });

    const topicData = Object.keys(topicStats).map(topic => ({
        name: topic,
        completed: topicStats[topic].completed,
        remaining: topicStats[topic].total - topicStats[topic].completed,
        total: topicStats[topic].total
    })).sort((a, b) => b.total - a.total); // Sort by most questions

    // Calculate difficulty breakdown
    const difficultyStats = { Easy: { total: 0, completed: 0 }, Medium: { total: 0, completed: 0 }, Hard: { total: 0, completed: 0 } };
    questionsData.forEach(day => {
        day.questions.forEach(q => {
            const diff = q.difficulty || 'Medium'; // Fallback
            if (difficultyStats[diff]) {
                difficultyStats[diff].total++;
                if (getQuestionStatus(q.id).completed) {
                    difficultyStats[diff].completed++;
                }
            }
        });
    });

    const difficultyData = [
        { name: 'Easy', value: difficultyStats.Easy.completed, total: difficultyStats.Easy.total, color: '#22c55e' },
        { name: 'Medium', value: difficultyStats.Medium.completed, total: difficultyStats.Medium.total, color: '#eab308' },
        { name: 'Hard', value: difficultyStats.Hard.completed, total: difficultyStats.Hard.total, color: '#ef4444' },
    ];

    const pieData = [
        { name: 'Completed', value: completed, color: '#22c55e' },
        { name: 'Remaining', value: total - completed, color: '#e5e7eb' },
    ];

    return (
        <div className="space-y-8">
            <header>
                <h2 className="text-3xl font-bold text-gray-900">Progress Analytics</h2>
                <p className="text-gray-500 mt-1">Detailed breakdown of your preparation journey.</p>
            </header>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 flex items-center gap-4">
                    <div className="p-4 bg-green-50 rounded-full">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium uppercase">Total Solved</p>
                        <h3 className="text-3xl font-bold text-gray-900">{completed} <span className="text-lg text-gray-400 font-normal">/ {total}</span></h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 flex items-center gap-4">
                    <div className="p-4 bg-blue-50 rounded-full">
                        <Target className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium uppercase">Completion Rate</p>
                        <h3 className="text-3xl font-bold text-gray-900">{Math.round(percentage)}%</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 flex items-center gap-4">
                    <div className="p-4 bg-purple-50 rounded-full">
                        <Circle className="w-8 h-8 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium uppercase">Topics Covered</p>
                        <h3 className="text-3xl font-bold text-gray-900">{Object.keys(topicStats).length}</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Difficulty Breakdown */}
                <div className="bg-white p-8 rounded-2xl border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Difficulty Breakdown</h3>
                    <div className="space-y-6">
                        {difficultyData.map((item) => (
                            <div key={item.name}>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="font-medium text-gray-700">{item.name}</span>
                                    <span className="text-gray-500">{item.value}/{item.total}</span>
                                </div>
                                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${(item.value / item.total) * 100}%`, backgroundColor: item.color }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Overall Progress Pie */}
                <div className="bg-white p-8 rounded-2xl border border-gray-200 flex flex-col items-center justify-center">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 w-full text-left">Overall Completion</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="text-center -mt-32 mb-12">
                        <span className="text-4xl font-bold text-gray-900">{Math.round(percentage)}%</span>
                        <p className="text-gray-500 text-sm">Completed</p>
                    </div>
                </div>
            </div>

            {/* Topic Breakdown */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Progress by Topic</h3>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topicData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                            <Tooltip cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="completed" stackId="a" fill="#22c55e" radius={[0, 4, 4, 0]} barSize={20} />
                            <Bar dataKey="remaining" stackId="a" fill="#f3f4f6" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
