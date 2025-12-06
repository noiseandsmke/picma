import React from 'react';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';

interface LeadDto {
    id: number;
    userInfo: string;
    propertyInfo: string;
    status: string;
    createDate: string;
}

interface LeadDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lead: LeadDto | null;
}

export const LeadDetailDialog: React.FC<LeadDetailDialogProps> = ({open, onOpenChange, lead}) => {
    if (!lead) return null;

    let propertyDetails = null;
    try {
        propertyDetails = JSON.parse(lead.propertyInfo);
    } catch {
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-[#141124] border-slate-800 text-slate-200">
                <DialogHeader>
                    <DialogTitle className="text-white">Lead Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label className="text-slate-400 text-xs uppercase tracking-wider">Lead ID</Label>
                            <div className="font-mono text-sm">{lead.id}</div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-slate-400 text-xs uppercase tracking-wider">Created Date</Label>
                            <div className="text-sm">{new Date(lead.createDate).toLocaleString()}</div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-slate-400 text-xs uppercase tracking-wider">Status</Label>
                        <div className="text-sm font-medium text-white">{lead.status}</div>
                    </div>

                    <div className="space-y-2 border-t border-slate-800 pt-3">
                        <Label className="text-slate-400 text-xs uppercase tracking-wider">User Info</Label>
                        <div className="p-3 rounded-md bg-slate-900 text-sm">
                            {lead.userInfo}
                        </div>
                    </div>

                    <div className="space-y-2 border-t border-slate-800 pt-3">
                        <Label className="text-slate-400 text-xs uppercase tracking-wider">Property Info</Label>
                        <div className="p-3 rounded-md bg-slate-900 text-sm">
                            {propertyDetails ? (
                                <div className="space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div><span
                                            className="text-slate-500">Address:</span> {propertyDetails.address || propertyDetails.location?.street}
                                        </div>
                                        <div><span
                                            className="text-slate-500">City:</span> {propertyDetails.city || propertyDetails.location?.city}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <span>{lead.propertyInfo}</span>
                            )}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}
                            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};