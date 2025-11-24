import React, {ReactNode} from 'react';
import {cn} from '@/lib/utils';
import {Building2, ChevronDown, FileText, HelpCircle, LayoutDashboard, Settings, Users} from 'lucide-react';
import {Link, useLocation} from 'react-router-dom';

interface NavItem {
    label: string;
    icon: React.ElementType;
    href: string;
}

const navItems: NavItem[] = [
    {
        label: 'Admin dashboard',
        icon: LayoutDashboard,
        href: '/admin/dashboard',
    },
    {
        label: 'User management',
        icon: Users,
        href: '/admin/users',
    },
    {
        label: 'Lead management',
        icon: Building2,
        href: '/admin/leads',
    },
    {
        label: 'Reports',
        icon: FileText,
        href: '/admin/reports',
    },
];

interface AdminLayoutProps {
    children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({children}) => {
    const location = useLocation();

    return (
        <div className="flex h-screen bg-slate-950 font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 border-r border-slate-800 bg-slate-950 text-slate-300 flex flex-col">
                {/* Logo Area */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">P
                        </div>
                        <span className="font-semibold text-white tracking-tight">PICMA platform</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-500"/>
                </div>

                {/* Navigation */}
                <div className="flex-1 py-6 px-3 space-y-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.label}
                                to={item.href}
                                className={cn(
                                    "flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors group",
                                    isActive
                                        ? "bg-indigo-600 text-white"
                                        : "hover:bg-slate-900 hover:text-white"
                                )}
                            >
                                <item.icon
                                    className={cn("mr-3 h-5 w-5", isActive ? "text-white" : "text-slate-500 group-hover:text-white")}/>
                                {item.label}
                            </Link>
                        );
                    })}
                </div>

                {/* Bottom Actions */}
                <div className="p-3 border-t border-slate-800 space-y-1">
                    <Link
                        to="/admin/support"
                        className="flex items-center px-3 py-3 text-sm font-medium rounded-lg text-slate-400 hover:bg-slate-900 hover:text-white transition-colors group"
                    >
                        <HelpCircle className="mr-3 h-5 w-5 text-slate-500 group-hover:text-white"/>
                        Supports
                    </Link>
                    <Link
                        to="/admin/settings"
                        className="flex items-center px-3 py-3 text-sm font-medium rounded-lg text-slate-400 hover:bg-slate-900 hover:text-white transition-colors group"
                    >
                        <Settings className="mr-3 h-5 w-5 text-slate-500 group-hover:text-white"/>
                        Settings
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden bg-slate-900">
                {/* Global Header */}
                <header className="h-16 flex items-center justify-between px-8 border-b border-slate-800 bg-slate-950">
                    <div>
                        <h1 className="text-xl font-semibold text-white">Admin dashboard</h1>
                        <p className="text-xs text-slate-400">Tracking ongoing activities and evaluating performance
                            trends</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* User Profile */}
                        <div className="flex items-center gap-3 cursor-pointer">
                            <div
                                className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white border-2 border-slate-800">
                                AD
                            </div>
                            <ChevronDown className="h-4 w-4 text-slate-400"/>
                        </div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;