import React, {ReactNode, useState} from 'react';
import {cn} from '@/lib/utils';
import {LayoutDashboard} from 'lucide-react';
import {useAuth} from '@/context/AuthContext';
import SidebarNavigation, {NavItem} from '@/components/ui/sidebar-navigation';
import {UserDropdown} from '@/components/ui/user-dropdown';

const navItems: NavItem[] = [
    {
        label: 'Dashboard home',
        icon: LayoutDashboard,
        href: '/agent/dashboard',
    },
];

interface AgentLayoutProps {
    children: ReactNode;
}

const AgentLayout: React.FC<AgentLayoutProps> = ({children}) => {
    const {user} = useAuth();
    const [openMenus, setOpenMenus] = useState<string[]>([]);

    const toggleMenu = (label: string) => {
        setOpenMenus(prev =>
            prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]
        );
    };

    return (
        <div className="flex h-screen bg-background-main font-sans overflow-hidden">
            <aside
                className="w-64 flex-shrink-0 border-r border-border-main bg-surface-main text-text-secondary flex flex-col shadow-sm">
                <div className="h-16 flex items-center justify-between px-4 border-b border-border-main">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">P
                        </div>
                        <span className="font-semibold text-text-main tracking-tight">PICMA Agent</span>
                    </div>
                </div>

                <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                    <SidebarNavigation items={navItems} openMenus={openMenus} toggleMenu={toggleMenu}/>
                </div>
            </aside>

            <main className="flex-1 flex flex-col overflow-hidden bg-background-main relative">
                <header
                    className="h-16 flex items-center justify-between px-8 border-b border-border-main bg-surface-main flex-shrink-0 shadow-sm z-10">
                    <div>
                        <h1 className="text-xl font-semibold text-text-main">Agent dashboard</h1>
                        <div className="flex items-center gap-2">
                            <span
                                className={cn("text-xs font-medium px-2 py-0.5 rounded-full", "bg-primary/10 text-primary")}>
                                Insurance agent
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <UserDropdown displayName={user?.name} username={user?.username} roleLabel="Agent"/>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AgentLayout;