import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NavItem {
    label: string;
    icon: React.ElementType;
    href?: string;
    children?: NavItem[];
}

interface SidebarNavigationProps {
    items: NavItem[];
    openMenus: string[];
    toggleMenu: (label: string) => void;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ items, openMenus, toggleMenu }) => {
    const location = useLocation();

    return (
        <div className="space-y-1">
            {items.map((item) => {
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
                                        ? "bg-primary text-white shadow-sm shadow-blue-500/20"
                                        : "hover:bg-slate-900 hover:text-white"
                                )}
                            >
                                <item.icon
                                    className={cn("mr-3 h-4 w-4", isActive ? "text-white" : "text-slate-500 group-hover:text-white")} />
                                {item.label}
                            </Link>
                        ) : (
                            <button
                                onClick={() => toggleMenu(item.label)}
                                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-900 hover:text-white transition-colors group text-slate-300"
                            >
                                <div className="flex items-center">
                                    <item.icon
                                        className="mr-3 h-4 w-4 text-slate-500 group-hover:text-white" />
                                    {item.label}
                                </div>
                                {hasChildren && (
                                    isOpen ? <ChevronDown className="h-4 w-4 text-slate-500" /> :
                                        <ChevronRight className="h-4 w-4 text-slate-500" />
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
                                                    ? "bg-primary/10 text-primary"
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
    );
};

export default SidebarNavigation;