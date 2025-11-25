import React, {ReactNode, useState} from 'react';
import {cn} from '@/lib/utils';
import {
    ChevronDown,
    ChevronRight,
    FileText,
    HelpCircle,
    Home,
    LayoutDashboard,
    LogOut,
    Search,
    Settings,
    User
} from 'lucide-react';
import {Link, useLocation} from 'react-router-dom';
import {useAuth} from '@/context/AuthContext';

interface NavItem {
    label: string;
    icon: React.ElementType;
    href?: string;
    children?: NavItem[];
}

const navItems: NavItem[] = [
    {
        label: 'Dashboard Home',
        icon: LayoutDashboard,
        href: '/owner/dashboard',
    },
    {
        label: 'My Assets',
        icon: Home,
        children: [
            {label: 'Properties', icon: Home, href: '/owner/properties'},
            {label: 'Quotes', icon: FileText, href: '/owner/quotes'},
        ]
    },
    {
        label: 'Directory',
        icon: Search,
        children: [
            {label: 'Find Agents', icon: Search, href: '/owner/agents'},
        ]
    },
];

interface OwnerLayoutProps {
    children: ReactNode;
}

const OwnerLayout: React.FC<OwnerLayoutProps> = ({children}) => {
    const {user, logout} = useAuth();
    const location = useLocation();
    const [openMenus, setOpenMenus] = useState<string[]>(['My Assets', 'Directory']);

    const toggleMenu = (label: string) => {
        setOpenMenus(prev =>
            prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]
        );
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
            <aside
                className="w-64 flex-shrink-0 border-r border-slate-200 bg-white text-slate-600 flex flex-col shadow-sm">
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">P
                        </div>
                        <span className="font-semibold text-slate-800 tracking-tight">PICMA Owner</span>
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
                                                ? "bg-indigo-50 text-indigo-700"
                                                : "hover:bg-slate-50 hover:text-slate-900"
                                        )}
                                    >
                                        <item.icon
                                            className={cn("mr-3 h-4 w-4", isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")}/>
                                        {item.label}
                                    </Link>
                                ) : (
                                    <button
                                        onClick={() => toggleMenu(item.label)}
                                        className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors group text-slate-600"
                                    >
                                        <div className="flex items-center">
                                            <item.icon
                                                className="mr-3 h-4 w-4 text-slate-400 group-hover:text-slate-600"/>
                                            {item.label}
                                        </div>
                                        {hasChildren && (
                                            isOpen ? <ChevronDown className="h-4 w-4 text-slate-400"/> :
                                                <ChevronRight className="h-4 w-4 text-slate-400"/>
                                        )}
                                    </button>
                                )}

                                {hasChildren && isOpen && (
                                    <div className="ml-4 mt-1 space-y-1 border-l border-slate-200 pl-2">
                                        {item.children!.map((child) => {
                                            const isChildActive = child.href ? location.pathname.startsWith(child.href) : false;
                                            return (
                                                <Link
                                                    key={child.label}
                                                    to={child.href || '#'}
                                                    className={cn(
                                                        "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors group",
                                                        isChildActive
                                                            ? "text-indigo-600 font-semibold"
                                                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
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

                <div className="p-3 border-t border-slate-100 space-y-1">
                    <Link
                        to="/owner/profile"
                        className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors group"
                    >
                        <User className="mr-3 h-4 w-4 text-slate-400 group-hover:text-slate-600"/>
                        Profile
                    </Link>
                    <Link
                        to="/owner/support"
                        className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors group"
                    >
                        <HelpCircle className="mr-3 h-4 w-4 text-slate-400 group-hover:text-slate-600"/>
                        Support
                    </Link>
                    <Link
                        to="/owner/settings"
                        className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors group"
                    >
                        <Settings className="mr-3 h-4 w-4 text-slate-400 group-hover:text-slate-600"/>
                        Settings
                    </Link>
                    <button
                        onClick={logout}
                        className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-700 transition-colors group"
                    >
                        <LogOut className="mr-3 h-4 w-4 text-slate-400 group-hover:text-red-600"/>
                        Logout
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col overflow-hidden bg-slate-50 relative">
                <header
                    className="h-16 flex items-center justify-between px-8 border-b border-slate-200 bg-white flex-shrink-0 shadow-sm z-10">
                    <div>
                        <h1 className="text-xl font-semibold text-slate-800">Owner Dashboard</h1>
                        <p className="text-xs text-slate-500">Manage your property assets</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div
                            className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
                            <div
                                className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white ring-2 ring-white shadow-sm">
                                {user?.username.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-slate-700">{user?.username}</span>
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

export default OwnerLayout;