import React, {ReactNode, useState} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {useAuth} from '@/context/AuthContext';
import {UserDropdown} from '@/components/ui/user-dropdown';
import {cn} from '@/lib/utils';

interface AdminLayoutProps {
    children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({children}) => {
    const {user} = useAuth();
    const location = useLocation();
    const [isDocumentsOpen, setIsDocumentsOpen] = useState(true);

    const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

    return (
        <div className="flex h-screen bg-slate-950 font-display overflow-hidden selection:bg-sky-500/30">
            <aside className="bg-slate-900 flex flex-col w-64 shrink-0 border-r border-slate-700 h-full z-20">
                <div className="flex flex-col h-full justify-between p-4">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-3 px-2 py-2">
                            <div
                                className="bg-primary flex items-center justify-center rounded-lg size-10 text-white shadow-glow">
                                <span className="text-xl font-bold">P</span>
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-white text-base font-bold leading-tight tracking-tight">PICMA
                                    platform</h1>
                            </div>
                        </div>

                        <nav className="flex flex-col gap-1.5">
                            <Link
                                to="/admin/dashboard"
                                className={cn(
                                    "flex items-center gap-3 px-3 py-3 rounded-lg transition-all group",
                                    isActive('/admin/dashboard')
                                        ? "bg-primary/10 text-primary shadow-sm border border-primary/20"
                                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                                )}
                            >
                                <span
                                    className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">dashboard</span>
                                <p className="text-sm font-medium">Dashboard home</p>
                            </Link>

                            <Link
                                to="/admin/users"
                                className={cn(
                                    "flex items-center gap-3 px-3 py-3 rounded-lg transition-all group",
                                    isActive('/admin/users')
                                        ? "bg-primary/10 text-primary shadow-sm border border-primary/20"
                                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                                )}
                            >
                                <span
                                    className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">group</span>
                                <p className="text-sm font-medium">User management</p>
                            </Link>

                            <div className="relative group">
                                <button
                                    onClick={() => setIsDocumentsOpen(!isDocumentsOpen)}
                                    className="flex items-center justify-between px-3 py-3 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors w-full cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <span
                                            className="material-symbols-outlined text-[20px] group-hover:text-primary transition-colors">description</span>
                                        <p className="text-sm font-medium">Document management</p>
                                    </div>
                                    <span
                                        className={cn("material-symbols-outlined text-[16px] transition-transform", isDocumentsOpen && "rotate-180")}>expand_more</span>
                                </button>

                                {isDocumentsOpen && (
                                    <div
                                        className="pl-11 pr-3 flex flex-col gap-1 mt-1 border-l border-slate-700/50 ml-4 mb-2">
                                        <Link
                                            to="/admin/leads"
                                            className={cn(
                                                "py-2 text-sm block pl-2 transition-colors border-l-2",
                                                isActive('/admin/leads')
                                                    ? "text-primary font-medium border-primary bg-primary/5"
                                                    : "text-slate-500 hover:text-slate-300 border-transparent hover:bg-slate-800/30"
                                            )}
                                        >
                                            Leads
                                        </Link>
                                        <Link
                                            to="/admin/quotes"
                                            className={cn(
                                                "py-2 text-sm block pl-2 transition-colors border-l-2",
                                                isActive('/admin/quotes')
                                                    ? "text-primary font-medium border-primary bg-primary/5"
                                                    : "text-slate-500 hover:text-slate-300 border-transparent hover:bg-slate-800/30"
                                            )}
                                        >
                                            Quotes
                                        </Link>
                                        <Link
                                            to="/admin/properties"
                                            className={cn(
                                                "py-2 text-sm block pl-2 transition-colors border-l-2",
                                                isActive('/admin/properties')
                                                    ? "text-primary font-medium border-primary bg-primary/5"
                                                    : "text-slate-500 hover:text-slate-300 border-transparent hover:bg-slate-800/30"
                                            )}
                                        >
                                            Properties info
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </nav>
                    </div>

                </div>
            </aside>

            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <div
                        className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-50"></div>
                </div>

                <header
                    className="flex-shrink-0 bg-background-dark/80 backdrop-blur-md border-b border-white/5 px-8 py-5 z-10">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-white text-xl font-bold tracking-tight">Admin dashboard</h2>
                            <p className="text-slate-400 text-xs">Total system oversight</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <UserDropdown displayName={user?.name} username={user?.username} roleLabel="Administrator"/>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar z-10">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;