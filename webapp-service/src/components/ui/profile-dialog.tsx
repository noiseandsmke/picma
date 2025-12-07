import React from 'react';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {useAuth} from '@/context/AuthContext';
import {ScrollArea} from "@/components/ui/scroll-area";
import {Badge} from "@/components/ui/badge";

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
                <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</Label>
                <div
                    className="text-sm font-medium text-slate-200 bg-slate-900/50 p-2.5 rounded-md border border-slate-800 break-all">
                    {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                </div>
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-[600px] bg-[#141124] border-slate-800 text-slate-100 p-0 overflow-hidden flex flex-col max-h-[85vh]">
                <DialogHeader className="px-6 py-4 border-b border-slate-800 bg-slate-950">
                    <DialogTitle className="text-xl">Profile Details</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        View your account information and security details.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 px-6 py-6">
                    <div className="space-y-6">
                        <section>
                            <h3 className="text-sm font-semibold text-indigo-400 mb-3 flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                                Identity
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {renderField("Full Name", user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim())}
                                {renderField("Username", user.preferred_username || user.username)}
                                {renderField("Email", user.email, true)}
                                {renderField("Subject ID (sub)", user.sub, true)}
                            </div>
                        </section>

                        <section>
                            <h3 className="text-sm font-semibold text-indigo-400 mb-3 flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                                Contact & Location
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {renderField("Email Verified", user.email_verified)}
                                {renderField("Zipcode", user.zipcode)}
                                {renderField("First Name", user.given_name || user.firstName)}
                                {renderField("Last Name", user.family_name || user.lastName)}
                            </div>
                        </section>

                        <section>
                            <h3 className="text-sm font-semibold text-indigo-400 mb-3 flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                                Security Metadata
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {renderField("Issued At (iat)", user.iat ? new Date(user.iat * 1000).toLocaleString() : undefined)}
                                {renderField("Expires At (exp)", user.exp ? new Date(user.exp * 1000).toLocaleString() : undefined)}
                                {renderField("Token ID (jti)", user.jti, true)}
                                {renderField("Issuer (iss)", user.iss, true)}
                                {renderField("Audience (aud)", user.aud)}
                                {renderField("Type (typ)", user.typ)}
                                {renderField("Authorized Party (azp)", user.azp)}
                                {renderField("Session ID (sid)", user.sid, true)}
                                {renderField("Access Token Hash (at_hash)", user.at_hash, true)}
                                {renderField("Auth Context Class (acr)", user.acr)}
                            </div>
                        </section>

                        {user.roles && user.roles.length > 0 && (
                            <section>
                                <h3 className="text-sm font-semibold text-indigo-400 mb-3 flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                                    Roles
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {user.roles.map((role) => (
                                        <Badge key={role} variant="outline"
                                               className="bg-indigo-500/10 text-indigo-300 border-indigo-500/30">
                                            {role}
                                        </Badge>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </ScrollArea>

                <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
                    <button
                        onClick={() => onOpenChange(false)}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-md border border-slate-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};