import React from 'react';
import { useTracker } from '../context/TrackerContext';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Trophy, Calendar, Target, Zap } from 'lucide-react';

export default function Dashboard() {
    const { getTotalProgress, questionsData } = useTracker();
    const { total, completed, percentage } = getTotalProgress();

    // Calculate streak (mock for now, or based on consecutive days with activity)
    const streak = 0;

    // Find next incomplete day
    const nextDay = questionsData.find(d => {
        // Logic to check if day is fully complete could be added here
        return true;
    });

    const data = [
        { name: 'Completed', value: completed },
        { name: 'Remaining', value: total - completed },
    ];

    const COLORS = ['#4f46e5', '#e5e7eb'];

    return (
        <div className="space-y-8">
            <header>
                <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
                <p className="text-gray-500 mt-2">Track your progress to interview mastery.</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                        <Target className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Progress</p>
                        <h3 className="text-2xl font-bold text-gray-900">{Math.round(percentage)}%</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-green-50 rounded-xl text-green-600">
                        <CheckCircleIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Questions Done</p>
                        <h3 className="text-2xl font-bold text-gray-900">{completed} <span className="text-sm text-gray-400 font-normal">/ {total}</span></h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
                        <Zap className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Current Streak</p>
                        <h3 className="text-2xl font-bold text-gray-900">{streak} Days</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Days Remaining</p>
                        <h3 className="text-2xl font-bold text-gray-900">{70 - Math.floor(completed / 3)} <span className="text-sm text-gray-400 font-normal">Est.</span></h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Progress Overview</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Next Up */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Next Up</h3>
                    {nextDay && (
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Day {nextDay.day}</span>
                                    <span className="text-xs text-gray-500">{nextDay.date}</span>
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-1">{nextDay.theme}</h4>
                                <p className="text-sm text-gray-600 line-clamp-2">{nextDay.coding_questions}</p>
                                <Link to={`/day/${nextDay.day}`} className="mt-4 block w-full text-center py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                                    Start Day
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function CheckCircleIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    );
}
