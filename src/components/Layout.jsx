import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, BookOpen, CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';

export default function Layout({ children }) {
    const location = useLocation();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Calendar, label: 'Calendar', path: '/calendar' },
        { icon: BookOpen, label: 'All Questions', path: '/questions' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 fixed h-full hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-100">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <CheckCircle className="w-8 h-8 text-indigo-600" />
                        Tracker
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">70-Day Interview Prep</p>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-indigo-50 text-indigo-700'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="bg-indigo-50 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-indigo-900">Keep it up!</h3>
                        <p className="text-xs text-indigo-700 mt-1">Consistency is key to success.</p>
                    </div>
                </div>
            </aside>

            {/* Mobile Nav (Bottom) */}
            <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around p-3 z-50">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                'flex flex-col items-center gap-1 text-xs font-medium',
                                isActive ? 'text-indigo-600' : 'text-gray-500'
                            )}
                        >
                            <Icon className="w-6 h-6" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 mb-16 md:mb-0 overflow-y-auto">
                <div className="max-w-5xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
