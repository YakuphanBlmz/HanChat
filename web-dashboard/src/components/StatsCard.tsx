import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    color?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, description, color = "blue" }) => {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600 ring-blue-100",
        green: "bg-emerald-50 text-emerald-600 ring-emerald-100",
        purple: "bg-violet-50 text-violet-600 ring-violet-100",
        orange: "bg-orange-50 text-orange-600 ring-orange-100",
    };



    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue} ring-1`}>
                    <Icon size={24} className="group-hover:scale-110 transition-transform duration-300" />
                </div>
            </div>
            <div>
                <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{value}</h3>
                <p className="text-sm font-medium text-gray-500 mt-1">{title}</p>
            </div>
            {description && (
                <div className="mt-4 pt-4 border-t border-gray-50">
                    <p className="text-xs text-gray-400">{description}</p>
                </div>
            )}
        </div>
    );
};
