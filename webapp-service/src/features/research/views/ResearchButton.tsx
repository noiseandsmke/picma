import React, {useState, useEffect} from 'react';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Sparkles, FileText} from 'lucide-react';
import {ResearchReport, ResearchStep, useResearchStream} from '../services/deepResearchService';
import {ResearchProgress} from '../components/ResearchProgress';
import {ResearchReportView} from '../components/ResearchReportView';
import {ResearchReportDialog} from '../components/ResearchReportDialog';
import {PropertyLeadDto} from '@/features/admin/services/leadService';
import {toast} from "sonner";
import { ENV } from '@/config/env';

interface ResearchButtonProps {
    lead: PropertyLeadDto;
    propertyId: string;
}

export const ResearchButton: React.FC<ResearchButtonProps> = ({lead, propertyId}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isStarted, setIsStarted] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [steps, setSteps] = useState<ResearchStep[]>([]);
    const [report, setReport] = useState<ResearchReport | null>(null);
    const {startResearch} = useResearchStream();
    
    const [status, setStatus] = useState<'idle' | 'researched'>('idle');

    useEffect(() => {
        const checkStatus = async () => {
            try {
                 const res = await fetch(`${ENV.API_URL}/picma/research/status/${lead.id}`, {
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
                    }
                 });
                 if (res.ok) {
                    const isResearched = await res.json();
                     if (isResearched === true) {
                         setStatus('researched');
                     }
                 }
            } catch (e) {
                console.error("Failed to check research status", e);
            }
        };
        if (lead?.id) checkStatus();
    }, [lead]);

    useEffect(() => {
        if (isOpen && status === 'researched' && !report) {
            const fetchReport = async () => {
                try {
                    const token = sessionStorage.getItem('access_token');
                    const res = await fetch(`${ENV.API_URL}/picma/research/result/${lead.id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();


                        let fullText = '';
                        if (data.outputs && Array.isArray(data.outputs)) {
                            const textOutput = data.outputs.find((o: any) => o.type === 'text');
                            if (textOutput) fullText = textOutput.text;
                        }
                        
                        if (fullText) {


                            setReport(fullText);
                            setIsComplete(true);
                            setIsStarted(true);
                        }
                    }
                } catch (e) {
                    console.error("Failed to fetch report", e);
                }
            };
            fetchReport();
        }
    }, [isOpen, status, lead.id, report]);

    const handleStart = () => {
        setIsStarted(true);
        setSteps([]);
        setReport(null);
        setIsComplete(false);

        const query = `Analyze valuation and risks for property ${propertyId}`;

        startResearch(
            query,
            propertyId,
            lead.id,
            (step) => {
                setSteps(prev => [...prev, step]);
            },
            (finalReport) => {
                setReport(finalReport);
                setIsComplete(true);
                toast.success("Research complete!");
                setStatus('researched');
            },
            (error) => {
                toast.error(error);
                setIsStarted(false);
            }
        );
    };

    if (status === 'researched') {
        return (
            <ResearchReportDialog 
                open={isOpen} 
                onOpenChange={setIsOpen} 
                report={report}
                trigger={
                    <Button
                        variant="outline"
                        size="sm"
                        className="bg-indigo-500/10 text-green-400 border-green-500/50 hover:bg-green-500/10 px-4 font-bold"
                    >
                        <FileText className="w-4 h-4 mr-2"/>
                        View
                    </Button>
                }
            />
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="bg-indigo-500/10 text-indigo-400 border-indigo-500/50 hover:bg-indigo-500/20 px-4 font-bold"
                >
                    <Sparkles className="w-4 h-4 mr-2"/>
                    AI
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0f0e1a] border-slate-800 text-white max-w-3xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Sparkles className="w-5 h-5 text-indigo-400"/>
                        Deep Research Assistant
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {isStarted ? (
                        <div className="space-y-6">
                            {!isComplete && (
                                <ResearchProgress steps={steps} isSearching={!isComplete}/>
                            )}

                            {isComplete && report && (
                                <ResearchReportView report={report}/>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8 space-y-4">
                            <div
                                className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
                                <Sparkles className="w-8 h-8 text-indigo-400"/>
                            </div>
                            <h3 className="text-lg font-medium text-white">Ready to analyze this property?</h3>
                            <p className="text-slate-400 max-w-md mx-auto">
                                The AI will verify administrative boundaries, check government flood maps, analyze
                                market data,
                                and perform a comprehensive risk assessment.
                            </p>
                            <Button onClick={handleStart} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8">
                                Start Analysis
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};