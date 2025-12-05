import React, {ReactNode, useState} from 'react';
import {ChevronDown, HelpCircle, LayoutDashboard, LogOut, Settings, User} from 'lucide-react';
import {Link} from 'react-router-dom';
import {useAuth} from '@/context/AuthContext';
import SidebarNavigation, {NavItem} from '@/components/ui/sidebar-navigation';

const navItems: NavItem[] = [
    {
        label: 'Dashboard Home',
        icon: LayoutDashboard,
        href: '/owner/dashboard',
    },
];

interface OwnerLayoutProps {
    children: ReactNode;
}

const OwnerLayout: React.FC<OwnerLayoutProps> = ({children}) => {
    const {user, logout} = useAuth();
    const [openMenus, setOpenMenus] = useState<string[]>([]);

    const toggleMenu = (label: string) => {
        setOpenMenus(prev =>
            prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]
        );
    };

    return (
        <div className="flex h-screen bg-slate-950 font-sans overflow-hidden">
            <aside
                className="w-64 flex-shrink-0 border-r border-slate-800 bg-slate-950 text-slate-300 flex flex-col shadow-sm">
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">P
                        </div>
                        <span className="font-semibold text-white tracking-tight">PICMA Owner</span>
                    </div>
                </div>

                <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                    <SidebarNavigation items={navItems} openMenus={openMenus} toggleMenu={toggleMenu}/>
                </div>

                <div className="p-3 border-t border-slate-800 space-y-1">
                    <Link
                        to="/owner/profile"
                        className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-400 hover:bg-slate-900 hover:text-white transition-colors group"
                    >
                        <User className="mr-3 h-4 w-4 text-slate-500 group-hover:text-white"/>
                        Profile
                    </Link>
                    <Link
                        to="/owner/support"
                        className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-400 hover:bg-slate-900 hover:text-white transition-colors group"
                    >
                        <HelpCircle className="mr-3 h-4 w-4 text-slate-500 group-hover:text-white"/>
                        Support
                    </Link>
                    <Link
                        to="/owner/settings"
                        className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-400 hover:bg-slate-900 hover:text-white transition-colors group"
                    >
                        <Settings className="mr-3 h-4 w-4 text-slate-500 group-hover:text-white"/>
                        Settings
                    </Link>
                    <button
                        onClick={logout}
                        className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg text-slate-400 hover:bg-red-900/10 hover:text-red-500 transition-colors group"
                    >
                        <LogOut className="mr-3 h-4 w-4 text-slate-500 group-hover:text-red-500"/>
                        Logout
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col overflow-hidden bg-slate-950 relative">
                <header
                    className="h-16 flex items-center justify-between px-8 border-b border-slate-800 bg-slate-950 flex-shrink-0 shadow-sm z-10">
                    <div>
                        <h1 className="text-xl font-semibold text-white">Owner Dashboard</h1>
                        <p className="text-xs text-slate-400">Manage your property assets</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div
                            className="flex items-center gap-3 cursor-pointer hover:bg-slate-900 p-2 rounded-lg transition-colors">
                            <div
                                className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white ring-2 ring-slate-800 shadow-sm">
                                {user?.username ? user.username.substring(0, 2).toUpperCase() : 'OW'}
                            </div>
                            <span className="text-sm font-medium text-slate-300">{user?.username || 'Owner'}</span>
                            <ChevronDown className="h-4 w-4 text-slate-500"/>
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