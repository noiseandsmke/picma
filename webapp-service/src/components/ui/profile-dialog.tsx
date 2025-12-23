import React from 'react';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {useAuth} from '@/context/AuthContext';
import {ScrollArea} from "@/components/ui/scroll-area";


interface ProfileDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const ProfileDialog: React.FC<ProfileDialogProps> = ({open, onOpenChange}) => {
    const {user} = useAuth();

    if (!user) return null;

    const renderField = (label: string, value: string | number | boolean | undefined, fullWidth = false) => {
        if (value === undefined || value === null || value === '') return null;

        return (
            <div className={`space-y-1.5 ${fullWidth ? 'col-span-2' : ''}`}>
                <Label className="text-xs font-medium text-text-muted uppercase tracking-wider">{label}</Label>
                <div
                    className="text-sm font-medium text-text-main bg-muted p-2.5 rounded-md border border-border-main hover:border-primary/50 transition-colors break-all">
                    {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                </div>
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-[600px] bg-surface-main border-border-main text-text-main p-0 overflow-hidden flex flex-col max-h-[85vh]">
                <DialogHeader
                    className="px-6 py-4 border-b border-border-main bg-surface-main relative overflow-hidden">
                    <DialogTitle className="text-xl">Profile Details</DialogTitle>
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-border-main"></div>
                    <div className="absolute bottom-0 left-6 w-16 h-[2px] bg-primary"></div>
                    <DialogDescription className="text-text-muted">
                        View your account information and security details.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 px-6 py-6">
                    <div className="space-y-6">
                        <section>
                            <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                                Identity
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {renderField("Full Name", user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim())}
                                {renderField("Username", user.preferred_username || user.username)}
                                {renderField("Email", user.email, true)}
                                {renderField("Platform ID", user.sub, true)}
                            </div>
                        </section>

                        <section>
                            <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                                Contact & Location
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {renderField("Email Verified", user.email_verified)}
                                {renderField("Zipcode", user.zipcode)}
                                {renderField("First Name", user.given_name || user.firstName)}
                                {renderField("Last Name", user.family_name || user.lastName)}
                            </div>
                        </section>


                    </div>
                </ScrollArea>

                <div className="p-4 border-t border-border-main bg-surface-main flex justify-end">
                    <button
                        onClick={() => onOpenChange(false)}
                        className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-md shadow-lg transition-colors"
                    >
                        Close
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};