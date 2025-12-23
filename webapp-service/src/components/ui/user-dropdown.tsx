import React, {useState} from 'react';
import {ChevronDown, LogOut, User} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {useAuth} from '@/context/AuthContext';
import {getUserInitials} from '@/lib/utils';
import {ProfileDialog} from '@/components/ui/profile-dialog';

interface UserDropdownProps {
    displayName?: string;
    username?: string;
    roleLabel?: string;
}

export const UserDropdown: React.FC<UserDropdownProps> = ({displayName, username = 'User', roleLabel = 'User'}) => {
    const {logout} = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const display = displayName || username;
    const initials = getUserInitials(display);

    return (
        <>
            <ProfileDialog open={isProfileOpen} onOpenChange={setIsProfileOpen}/>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div
                        className="flex items-center gap-3 cursor-pointer hover:bg-muted p-2 rounded-lg transition-colors outline-none">
                        <div
                            className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white ring-2 ring-primary/30 shadow-sm">
                            {initials}
                        </div>
                        <div className="hidden md:block text-left">
                            <div className="text-sm font-medium text-text-secondary leading-none">{display}</div>
                            <div className="text-sm text-text-muted mt-1">{roleLabel}</div>
                        </div>
                        <ChevronDown className="h-4 w-4 text-text-muted"/>
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none text-text-main">{display}</p>
                            <p className="text-xs leading-none text-text-muted">{roleLabel}</p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border-main"/>
                    <DropdownMenuItem
                        className="focus:bg-primary/10 focus:text-primary cursor-pointer transition-colors"
                        onClick={() => setIsProfileOpen(true)}
                    >
                        <User className="mr-2 h-4 w-4"/>
                        <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border-main"/>
                    <DropdownMenuItem className="focus:bg-red-900/20 focus:text-red-500 text-red-400 cursor-pointer"
                                      onClick={logout}>
                        <LogOut className="mr-2 h-4 w-4"/>
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};