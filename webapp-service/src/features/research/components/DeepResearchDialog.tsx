import React, {useEffect, useRef, useState} from 'react';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {CheckCircle2, FileText, Loader2, Play, RotateCw, Sparkles} from 'lucide-react';
import {PropertyLeadDto} from '@/features/admin/services/leadService';
import {toast} from "sonner";
import {ENV} from '@/config/env';
import {EventSourcePolyfill} from 'event-source-polyfill';
import {ThinkingBlock} from './ThinkingBlock';
import ReactMarkdown from 'react-markdown';
import {Badge} from '@/components/ui/badge';
import remarkGfm from 'remark-gfm';

interface DeepResearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lead: PropertyLeadDto;
    status: string;
    onStatusChange: (status: string) => void;
}

type StreamContent = {
    index: number;
    type: 'thinking' | 'report';
    content: string;
    isComplete: boolean;
}

const MarkdownStyles: any = {
    h1: ({node, ...props}: any) => {
        const id = props.children?.toString().toLowerCase().replaceAll(/\s+/g, '-') || 'header';
        return <h1 id={id}
                   className="text-xl font-bold text-text-main mb-4 mt-6 border-b border-border-main pb-2">{props.children || 'Report Title'}</h1>;
    },
    h2: ({node, ...props}: any) => {
        const id = props.children?.toString().toLowerCase().replaceAll(/\s+/g, '-') || 'section';
        return <h2 id={id} className="text-lg font-bold text-primary mb-3 mt-5">{props.children || 'Section'}</h2>;
    },
    h3: ({node, ...props}: any) => {
        const id = props.children?.toString().toLowerCase().replaceAll(/\s+/g, '-') || 'subsection';
        return <h3 id={id}
                   className="text-base font-bold text-text-secondary mb-2 mt-4">{props.children || 'Subsection'}</h3>;
    },
    p: ({node, ...props}: any) => <p className="mb-3 leading-relaxed text-sm text-text-secondary" {...props} />,
    ul: ({node, ...props}: any) => <ul className="list-disc pl-5 mb-4 space-y-1 text-text-secondary" {...props} />,
    li: ({node, ...props}: any) => <li className="text-sm" {...props} />,
    strong: ({node, ...props}: any) => <strong className="font-semibold text-text-main" {...props} />,
    table: ({node, ...props}: any) => (
        <div className="overflow-x-auto my-4 rounded-lg border border-border-main">
            <table className="w-full text-sm border-collapse" {...props}>
                <caption className="sr-only">Research data table</caption>
                {props.children}
            </table>
        </div>
    ),
    th: ({node, ...props}: any) => <th
        className="border-b border-border-main bg-muted p-2 text-left font-semibold text-text-secondary" {...props} />,
    td: ({node, ...props}: any) => <td className="border-b border-border-main p-2 text-text-secondary" {...props} />,
    blockquote: ({node, ...props}: any) => <blockquote
        className="border-l-4 border-primary pl-4 py-1 my-4 italic text-text-muted bg-primary/5 rounded-r" {...props} />
};

export const DeepResearchDialog: React.FC<DeepResearchDialogProps> = ({
                                                                          open,
                                                                          onOpenChange,
                                                                          lead,
                                                                          onStatusChange
                                                                      }) => {
    const [activeView, setActiveView] = useState<'menu' | 'streaming' | 'report'>('menu');
    const [streamContent, setStreamContent] = useState<StreamContent[]>([]);
    const [loading, setLoading] = useState(false);
    const [initiationStatus, setInitiationStatus] = useState<{
        status: string,
        id: string,
        duration?: string
    } | null>(null);
    const [finalReport, setFinalReport] = useState<string | null>(null);

    const eventSourceRef = useRef<EventSourcePolyfill | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [streamContent]);

    useEffect(() => {
        return () => {
            if (eventSourceRef.current) eventSourceRef.current.close();
        };
    }, []);

    const formatDuration = (created: string, updated: string) => {
        const startDate = new Date(created);
        const endDate = new Date(updated);
        const durationMs = Math.max(0, endDate.getTime() - startDate.getTime());

        const seconds = Math.floor((durationMs / 1000) % 60);
        const minutes = Math.floor((durationMs / (1000 * 60)) % 60);
        const hours = Math.floor((durationMs / (1000 * 60 * 60)));

        let str = '';
        if (hours > 0) str += `${hours}h `;
        if (minutes > 0) str += `${minutes}m `;
        str += `${seconds}s`;
        return str;
    };

    const handleDeepResearch = async () => {
        setLoading(true);
        try {
            const token = sessionStorage.getItem('access_token');
            const res = await fetch(`${ENV.API_URL}/picma/research/initiate/${lead.id}`, {
                method: 'POST',
                headers: {'Authorization': `Bearer ${token}`}
            });

            if (res.ok) {
                const data = await res.json();
                setInitiationStatus({status: data.status, id: data.id});
                toast.success("Deep Research Initiated in Background");
                onStatusChange('researched');
            } else if (res.status === 409) {
                const existing = await res.json();
                const duration = (existing.status === 'completed' || existing.status === 'researched') && existing.updated
                    ? formatDuration(existing.created, existing.updated)
                    : 'In Progress...';

                setInitiationStatus({
                    status: existing.status || "already_exists",
                    id: existing.interactionId || "existing",
                    duration
                });
                onStatusChange('researched');
            } else {
                const err = await res.text();
                if (res.status === 400 && err.includes("already performed")) {
                    toast.error("Deep Research already initiated for this lead.");
                    setInitiationStatus({status: "already_exists", id: "existing"});
                    onStatusChange('researched');
                } else {
                    toast.error("Failed to initiate research");
                }
            }
        } catch (e) {
            console.error(e);
            toast.error("Connection error");
        } finally {
            setLoading(false);
        }
    };

    const handleResumeResearch = () => {
        setActiveView('streaming');
        setStreamContent([]);
        setLoading(true);

        const token = sessionStorage.getItem('access_token');
        const eventSource = new EventSourcePolyfill(`${ENV.API_URL}/picma/research/stream/${lead.id}`, {
            headers: {'Authorization': `Bearer ${token}`}
        });

        eventSourceRef.current = eventSource;
        let currentBlockIndex = -1;

        eventSource.addEventListener('content.start', (e: any) => {
            const data = JSON.parse(e.data);
            const index = data.index;
            currentBlockIndex = index;

            const type = index === 0 ? 'thinking' : 'report';

            setStreamContent(prev => {
                if (prev.some(p => p.index === index)) return prev;
                return [...prev, {index, type, content: '', isComplete: false}];
            });
        });

        eventSource.addEventListener('content.delta', (e: any) => {
            try {
                const data = JSON.parse(e.data);

                let delta = '';
                if (data.delta?.content?.text) {
                    delta = data.delta.content.text;
                } else if (data.delta?.text) {
                    delta = data.delta.text;
                }

                if (delta) {
                    const blockIndex = data.index !== undefined ? data.index : currentBlockIndex;

                    setStreamContent(prev => prev.map(block => {
                        if (block.index === blockIndex) {
                            return {...block, content: block.content + delta};
                        }
                        return block;
                    }));
                }
            } catch (err) {
                console.error("Error parsing delta", err);
            }
        });

        eventSource.addEventListener('content.stop', (e: any) => {
            const data = JSON.parse(e.data);
            const index = data.index;
            setStreamContent(prev => prev.map(block => {
                if (block.index === index) {
                    return {...block, isComplete: true};
                }
                return block;
            }));
        });

        eventSource.addEventListener('error', (e) => {
            console.error("SSE Error", e);
            eventSource.close();
            setLoading(false);
        });
    };

    const handleFinalReport = async () => {
        setLoading(true);
        try {
            const token = sessionStorage.getItem('access_token');
            const res = await fetch(`${ENV.API_URL}/picma/research/result/${lead.id}`, {
                headers: {'Authorization': `Bearer ${token}`}
            });
            if (res.ok) {
                const data = await res.json();
                // Extract text output
                let text = "";
                if (data.outputs) {
                    text = data.outputs.find((o: any) => o.type === 'text')?.text || "";
                }
                if (!text) {
                    toast.error("Report content is empty");
                    return;
                }
                setFinalReport(text);
                setActiveView('report');
            } else {
                toast.error("Report not found yet. Try 'Resume Research' to stream it.");
            }
        } catch (e) {
            toast.error("Failed to fetch report");
        } finally {
            setLoading(false);
        }
    };


    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) {
                if (eventSourceRef.current) eventSourceRef.current.close();
                setInitiationStatus(null);
                setActiveView('menu');
            }
            onOpenChange(val);
        }}>
            <DialogContent
                className="bg-surface-main border-border-main text-text-main max-w-4xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader
                    className="p-4 border-b border-border-main bg-muted/50 flex flex-row items-center justify-between shrink-0">
                    <DialogTitle className="flex items-center gap-2 text-lg font-medium text-text-main">
                        <Sparkles className="w-5 h-5 text-primary"/>
                        AI Research Assistant
                    </DialogTitle>
                </DialogHeader>

                <div
                    className="flex items-center gap-2 p-4 border-b border-border-main bg-muted/30 overflow-x-auto shrink-0">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`gap-2 border ${initiationStatus ? 'border-green-500/50 text-green-400 bg-green-500/10' : 'border-primary/30 text-text-muted hover:text-primary hover:bg-primary/10'}`}
                        onClick={handleDeepResearch}
                        disabled={loading && !initiationStatus}
                    >
                        {initiationStatus ? <CheckCircle2 className="w-4 h-4"/> : <Play className="w-4 h-4"/>}
                        Deep Research
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 border border-primary/30 text-text-muted hover:text-primary hover:bg-primary/10"
                        onClick={handleResumeResearch}
                    >
                        <RotateCw className="w-4 h-4"/>
                        Resume Research
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 border border-primary/30 text-text-muted hover:text-primary hover:bg-primary/10"
                        onClick={handleFinalReport}
                    >
                        <FileText className="w-4 h-4"/>
                        Final Report
                    </Button>
                </div>

                <div className="flex-1 overflow-hidden bg-surface-main relative flex flex-col">
                    {initiationStatus && activeView === 'menu' && (
                        <div className="p-8 text-center space-y-4">
                            <div
                                className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-8 h-8 text-green-500"/>
                            </div>
                            <h3 className="text-xl font-semibold text-green-400">Deep Research Initiated</h3>
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-text-muted">Interaction Status:</span>
                                <Badge variant="outline" className="border-green-500/50 text-green-400">
                                    {initiationStatus.status === 'already_exists' || initiationStatus.status === 'completed' || initiationStatus.status === 'researched'
                                        ? (initiationStatus.duration === 'In Progress...' ? 'In Progress' : `Completed in ${initiationStatus.duration}`)
                                        : initiationStatus.status}
                                </Badge>
                            </div>
                            <p className="text-text-muted text-sm max-w-md mx-auto">
                                The AI runs in the background. You can close this window and come back later, or click
                                "Resume Research" to watch the progress live.
                            </p>
                        </div>
                    )}

                    {activeView === 'streaming' && (
                        <div className="h-full flex flex-col p-4" ref={scrollRef}>
                            <div className="h-full overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                                {streamContent.map((block) => (
                                    <div key={block.index}>
                                        {block.type === 'thinking' ? (
                                            <ThinkingBlock content={block.content}/>
                                        ) : (
                                            <div
                                                className="prose prose-invert max-w-none bg-muted/30 p-6 rounded-lg border border-border-main">
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    components={MarkdownStyles}
                                                >{block.content}</ReactMarkdown>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {streamContent.length === 0 && (
                                    <div
                                        className="flex items-center justify-center h-40 text-indigo-400 animate-pulse gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin"/>
                                        Connecting to neural stream...
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeView === 'report' && finalReport && (
                        <div className="h-full overflow-y-auto p-6 scroll-smooth">
                            <div className="prose prose-invert max-w-none pb-12">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={MarkdownStyles}
                                >{finalReport}</ReactMarkdown>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};