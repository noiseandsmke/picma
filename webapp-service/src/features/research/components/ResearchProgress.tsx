import React, {useEffect, useRef} from 'react';
import {ResearchStep} from '../services/deepResearchService';
import {CheckCircle2, Circle, Loader2, Map, Search} from 'lucide-react';
import {ScrollArea} from "@/components/ui/scroll-area";

interface ResearchProgressProps {
    steps: ResearchStep[];
    isSearching: boolean;
}

export const ResearchProgress: React.FC<ResearchProgressProps> = ({steps, isSearching}) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({behavior: 'smooth', block: 'end'});
        }
    }, [steps]);

    return (
        <div className="w-full bg-slate-950 rounded-lg border border-slate-800 flex flex-col h-[300px]">
            <div className="p-3 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-300">Research Process</h3>
                {isSearching && (
                    <div className="flex items-center gap-2 text-xs text-indigo-400">
                        <Loader2 className="h-3 w-3 animate-spin"/>
                        AI Thinking...
                    </div>
                )}
            </div>
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {steps.map((step) => (
                        <div key={step.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                            <div className="mt-1 shrink-0">
                                {step.type === 'SEARCH' && <Search className="h-4 w-4 text-blue-400"/>}
                                {step.type === 'MAPS' && <Map className="h-4 w-4 text-emerald-400"/>}
                                {step.type === 'ANSWER' && <CheckCircle2 className="h-4 w-4 text-indigo-400"/>}
                                {step.type === 'PLAN' && <Circle className="h-4 w-4 text-slate-500"/>}
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="text-sm text-slate-200 font-medium">
                                    {step.type === 'SEARCH' ? 'Searching Web' :
                                        step.type === 'MAPS' ? 'Verifying Location' :
                                            step.type === 'ANSWER' ? 'Synthesizing Report' : 'Planning'}
                                </div>
                                <div className="text-xs text-slate-400 leading-relaxed">
                                    {step.content}
                                </div>
                                {step.metadata?.urls && step.metadata.urls.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {step.metadata.urls.map((url: string, i: number) => (
                                            <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                                               className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400 hover:text-white truncate max-w-[200px] block">
                                                {new URL(url).hostname}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={scrollRef}/>
                </div>
            </ScrollArea>
        </div>
    );
};