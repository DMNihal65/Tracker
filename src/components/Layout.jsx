import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, BarChart2, RotateCcw, CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';

export default function Layout({ children }) {
    const location = useLocation();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Calendar, label: 'Calendar', path: '/calendar' },
        { icon: BarChart2, label: 'Progress', path: '/progress' },
        { icon: RotateCcw, label: 'Revision', path: '/revision' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            {/* Top Navigation */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-8">
                            {/* Logo */}
                            <div className="flex items-center gap-2">
                                <div className="bg-green-600 p-1.5 rounded-lg">
                                    <CheckCircle className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-gray-900 leading-tight">CodePath 70</h1>
                                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Interview Prep Tracker</p>
                                </div>
                            </div>

                            {/* Desktop Nav */}
                            <div className="hidden md:flex space-x-1">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={clsx(
                                                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                                                isActive
                                                    ? 'bg-gray-100 text-gray-900'
                                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                            )}
                                        >
                                            <Icon className={clsx("w-4 h-4", isActive ? "text-green-600" : "text-gray-400")} />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Mobile Menu Button (Placeholder) */}
                        <div className="flex items-center md:hidden">
                            {/* Mobile menu implementation can go here */}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-3 z-50 pb-safe">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                'flex flex-col items-center gap-1 text-xs font-medium',
                                isActive ? 'text-green-600' : 'text-gray-400'
                            )}
                        >
                            <Icon className="w-6 h-6" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
