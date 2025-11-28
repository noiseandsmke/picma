import React, {ReactNode, useState} from 'react';
import {cn} from '@/lib/utils';
import {
    Activity,
    Building2,
    ChevronDown,
    ChevronRight,
    FileText,
    HelpCircle,
    LayoutDashboard,
    Settings,
    Users
} from 'lucide-react';
import {Link, useLocation} from 'react-router-dom';

interface NavItem {
    label: string;
    icon: React.ElementType;
    href?: string;
    children?: NavItem[];
}

const navItems: NavItem[] = [
    {
        label: 'Dashboard home',
        icon: LayoutDashboard,
        href: '/admin/dashboard',
    },
    {
        label: 'User management',
        icon: Users,
        href: '/admin/users',
    },
    {
        label: 'Document management',
        icon: Building2,
        children: [
            {label: 'Leads', icon: FileText, href: '/admin/leads'},
            {label: 'Quotes', icon: FileText, href: '/admin/quotes'},
            {label: 'Properties info', icon: Building2, href: '/admin/properties'},
        ]
    },
    {
        label: 'System configuration',
        icon: Settings,
        children: [
            {label: 'Service status', icon: Activity, href: '/admin/config/status'},
        ]
    },
];

interface AdminLayoutProps {
    children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({children}) => {
    const location = useLocation();
    const [openMenus, setOpenMenus] = useState<string[]>(['User management', 'Document management', 'System configuration']);

    const toggleMenu = (label: string) => {
        setOpenMenus(prev =>
            prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]
        );
    };

    return (
        <div className="flex h-screen bg-slate-950 font-sans overflow-hidden">
            <aside className="w-64 flex-shrink-0 border-r border-slate-800 bg-slate-950 text-slate-300 flex flex-col">
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">P
                        </div>
                        <span className="font-semibold text-white tracking-tight">PICMA platform</span>
                    </div>
                </div>

                <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
                        const hasChildren = item.children && item.children.length > 0;
                        const isOpen = openMenus.includes(item.label);
                        const isActive = item.href ? location.pathname.startsWith(item.href) : false;

                        return (
                            <div key={item.label}>
                                {item.href ? (
                                    <Link
                                        to={item.href}
                                        className={cn(
                                            "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors group",
                                            isActive
                                                ? "bg-indigo-600 text-white"
                                                : "hover:bg-slate-900 hover:text-white"
                                        )}
                                    >
                                        <item.icon
                                            className={cn("mr-3 h-4 w-4", isActive ? "text-white" : "text-slate-500 group-hover:text-white")}/>
                                        {item.label}
                                    </Link>
                                ) : (
                                    <button
                                        onClick={() => toggleMenu(item.label)}
                                        className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-900 hover:text-white transition-colors group text-slate-300"
                                    >
                                        <div className="flex items-center">
                                            <item.icon className="mr-3 h-4 w-4 text-slate-500 group-hover:text-white"/>
                                            {item.label}
                                        </div>
                                        {hasChildren && (
                                            isOpen ? <ChevronDown className="h-4 w-4 text-slate-500"/> :
                                                <ChevronRight className="h-4 w-4 text-slate-500"/>
                                        )}
                                    </button>
                                )}

                                {hasChildren && isOpen && (
                                    <div className="ml-4 mt-1 space-y-1 border-l border-slate-800 pl-2">
                                        {item.children!.map((child) => {
                                            const isChildActive = child.href ? location.pathname.startsWith(child.href) : false;
                                            return (
                                                <Link
                                                    key={child.label}
                                                    to={child.href || '#'}
                                                    className={cn(
                                                        "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors group",
                                                        isChildActive
                                                            ? "bg-indigo-600/10 text-indigo-400"
                                                            : "text-slate-400 hover:text-white hover:bg-slate-900"
                                                    )}
                                                >
                                                    {child.label}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="p-3 border-t border-slate-800 space-y-1">
                    <Link
                        to="/admin/support"
                        className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-400 hover:bg-slate-900 hover:text-white transition-colors group"
                    >
                        <HelpCircle className="mr-3 h-4 w-4 text-slate-500 group-hover:text-white"/>
                        Supports
                    </Link>
                    <Link
                        to="/admin/settings"
                        className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-400 hover:bg-slate-900 hover:text-white transition-colors group"
                    >
                        <Settings className="mr-3 h-4 w-4 text-slate-500 group-hover:text-white"/>
                        Settings
                    </Link>
                </div>
            </aside>

            <main className="flex-1 flex flex-col overflow-hidden bg-slate-950 relative">
                <header
                    className="h-16 flex items-center justify-between px-8 border-b border-slate-800 bg-slate-950 flex-shrink-0">
                    <div>
                        <h1 className="text-xl font-semibold text-white">Admin dashboard</h1>
                        <p className="text-xs text-slate-400">Total system oversight</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div
                            className="flex items-center gap-3 cursor-pointer hover:bg-slate-900 p-2 rounded-lg transition-colors">
                            <div
                                className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white ring-2 ring-slate-800">
                                AD
                            </div>
                            <ChevronDown className="h-4 w-4 text-slate-400"/>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;