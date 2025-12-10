import React, {ReactNode, useState} from 'react';
import {Building2, FileText, LayoutDashboard, Users} from 'lucide-react';
import SidebarNavigation, {NavItem} from '@/components/ui/sidebar-navigation';
import {UserDropdown} from '@/components/ui/user-dropdown';
import {useAuth} from '@/context/AuthContext';

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
];

interface AdminLayoutProps {
    children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({children}) => {
    const {user} = useAuth();
    const [openMenus, setOpenMenus] = useState<string[]>(['User management', 'Document management']);

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
                    <SidebarNavigation items={navItems} openMenus={openMenus} toggleMenu={toggleMenu}/>
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
                        <UserDropdown displayName={user?.name} username={user?.username} roleLabel="Administrator"/>
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