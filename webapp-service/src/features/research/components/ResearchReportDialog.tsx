import React from 'react';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Sparkles} from 'lucide-react';
import {ResearchReport} from '../services/deepResearchService';
import {ResearchReportView} from './ResearchReportView';

interface ResearchReportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    report: ResearchReport | null;
    trigger?: React.ReactNode;
}

export const ResearchReportDialog: React.FC<ResearchReportDialogProps> = ({open, onOpenChange, report, trigger}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="bg-[#0c0c14] border-slate-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
                <DialogHeader className="p-6 border-b border-indigo-500/10 bg-indigo-500/5">
                    <DialogTitle className="flex items-center gap-2 text-xl text-white">
                        <Sparkles className="w-5 h-5 text-indigo-400"/>
                        AI Research Report
                    </DialogTitle>
                </DialogHeader>
                <div className="p-6">
                    {report ? (
                        <ResearchReportView report={report} hideTitle={true} />
                    ) : (
                        <div className="flex justify-center py-12">
                             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
