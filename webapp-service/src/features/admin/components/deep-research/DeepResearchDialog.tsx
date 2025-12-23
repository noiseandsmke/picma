import React, {useEffect, useRef, useState} from 'react';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Badge} from '@/components/ui/badge';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {AlertTriangle, Brain, CheckCircle2, Copy, Download, Loader2, Sparkles, XCircle} from 'lucide-react';
import {PropertyLeadDto} from '../../services/leadService';

import {EventSourcePolyfill} from 'event-source-polyfill';
import {ENV} from '@/config/env';

interface DeepResearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lead: PropertyLeadDto | null;
}

interface ResearchState {
    status: 'idle' | 'starting' | 'researching' | 'resuming' | 'completed' | 'failed';
    interactionId: string | null;
    leadId: number | null;
    messages: Array<{ type: string; content: string; timestamp: Date }>;
    error: string | null;
    fullReport: string;
}

const DEEP_RESEARCH_API = `${ENV.API_URL}/picma/research`;

export const DeepResearchDialog: React.FC<DeepResearchDialogProps> = ({open, onOpenChange, lead}) => {
    const [research, setResearch] = useState<ResearchState>({
        status: 'idle',
        interactionId: null,
        leadId: null,
        messages: [],
        error: null,
        fullReport: '',
    });

    const eventSourceRef = useRef<EventSourcePolyfill | null>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollElement) {
                scrollElement.scrollTop = scrollElement.scrollHeight;
            }
        }
    }, [research.messages]);

    const addMessage = (type: string, content: string) => {
        setResearch(prev => ({
            ...prev,
            messages: [...prev.messages, {type, content, timestamp: new Date()}],
        }));
    };

    useEffect(() => {
        if (open && lead) {
            fetch(`${DEEP_RESEARCH_API}/result/${lead.id}`, {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
                }
            })
                .then(res => {
                    if (res.ok) {
                        return res.json();
                    }
                    throw new Error('No result found');
                })
                .then(data => {
                    if (data) {
                        setResearch(prev => ({
                            ...prev,
                            status: data.status === 'in_progress' ? 'researching' : 'completed',
                            interactionId: data.id,
                            leadId: lead.id,
                            fullReport: '',
                            messages: []
                        }));


                        if (data.status === 'in_progress') {
                            addMessage('status', 'Research is in progress...');
                        } else if (data.status === 'completed') {
                            addMessage('success', 'Research completed!');
                        }


                        if (data?.outputs && Array.isArray(data.outputs)) {
                            processOutputs(data.outputs);
                        }
                    }
                })
                .catch(() => {
                });
        }
    }, [open, lead]);

    const processOutputs = (outputs: any[]) => {
        outputs.forEach((output: any) => {
            if (output.type === 'thought' && Array.isArray(output.summary)) {
                output.summary.forEach((thought: any) => {
                    if (thought.text) {
                        addMessage('thinking', thought.text);
                    }
                });
            } else if (output.text) {
                setResearch(prev => ({
                    ...prev,
                    fullReport: prev.fullReport + output.text
                }));
            }
        });
    };

    const startResearch = () => {
        if (!lead) return;

        setResearch({
            status: 'starting',
            interactionId: null,
            leadId: lead.id,
            messages: [],
            error: null,
            fullReport: '',
        });

        addMessage('system', `Starting Deep Research for Lead #${lead.id}...`);

        const eventSource = new EventSourcePolyfill(`${DEEP_RESEARCH_API}/stream/${lead.id}`, {
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
            }
        });
        eventSourceRef.current = eventSource;

        eventSource.addEventListener('interaction.start', (e) => {
            const messageEvent = e as MessageEvent;
            try {
                const data = JSON.parse(messageEvent.data);
                const interaction = data.interaction;
                if (interaction) {
                    setResearch(prev => ({
                        ...prev,
                        interactionId: interaction.id,
                        status: 'researching'
                    }));
                    addMessage('interaction', `Interaction ID: ${interaction.id}`);
                    console.log('=== Deep Research Started ===');
                    console.log('Interaction ID:', interaction.id);
                }
            } catch (error) {
                console.error('Error parsing interaction.start:', error);
            }
        });

        eventSource.addEventListener('interaction.status_update', (e) => {
            const messageEvent = e as MessageEvent;
            try {
                const data = JSON.parse(messageEvent.data);
                if (data.status) {
                    addMessage('status', `Status: ${data.status}`);
                }
            } catch (error) {
                console.error('Error parsing status update:', error);
            }
        });

        eventSource.addEventListener('content.delta', (e) => {
            const messageEvent = e as MessageEvent;
            if (messageEvent.data && messageEvent.data.trim()) {
                try {
                    const parsed = JSON.parse(messageEvent.data);
                    const delta = parsed.delta;

                    if (delta?.content?.text) {
                        if (delta.type === 'thought_summary') {
                            addMessage('thinking', delta.content.text);
                        } else {
                            setResearch(prev => ({
                                ...prev,
                                fullReport: prev.fullReport + delta.content.text,
                            }));
                            updateScroll();
                        }
                    }
                } catch (error) {
                    console.error('Error parsing content.delta:', error);
                }
            }
        });

        const updateScroll = () => {
            if (scrollAreaRef.current) {
                const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
                if (scrollElement) {
                    scrollElement.scrollTop = scrollElement.scrollHeight;
                }
            }
        };

        eventSource.addEventListener('resuming', (e) => {
            const messageEvent = e as MessageEvent;
            try {
                const data = JSON.parse(messageEvent.data);
                setResearch(prev => ({...prev, status: 'resuming'}));
                addMessage('warning', `Deadline exceeded - Resuming stream...`);
                console.log('=== Resuming Stream ===');
                console.log('Interaction ID:', data.interactionId);
            } catch (error) {
                console.error('Error parsing resuming:', error);
            }
        });


        eventSource.addEventListener('done', () => {

            setResearch(prev => ({...prev, status: 'completed'}));
            addMessage('success', 'Research completed!');
            eventSource.close();
            eventSourceRef.current = null;
        });

        eventSource.addEventListener('error', (e) => {
            console.error('SSE Error:', e);
            let errorMsg = 'An error occurred during research';
            const messageEvent = e as MessageEvent;

            if (messageEvent.data) {
                try {
                    const data = JSON.parse(messageEvent.data);
                    errorMsg = data.error || errorMsg;
                } catch {
                    errorMsg = messageEvent.data;
                }
            }

            setResearch(prev => ({
                ...prev,
                status: 'failed',
                error: errorMsg,
            }));
            addMessage('error', errorMsg);
            eventSource.close();
            eventSourceRef.current = null;
        });

        eventSource.onerror = () => {
            if (research.status !== 'completed' && research.status !== 'failed') {
                setResearch(prev => ({
                    ...prev,
                    status: 'failed',
                    error: 'Connection lost',
                }));
                addMessage('error', 'Connection to research server lost');
            }
            eventSource.close();
            eventSourceRef.current = null;
        };
    };

    const stopResearch = () => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
        setResearch(prev => ({
            ...prev,
            status: 'idle',
        }));
        addMessage('system', 'Research stopped by user');
    };

    const copyReport = () => {
        if (research.fullReport) {
            void navigator.clipboard.writeText(research.fullReport);
            addMessage('system', 'Report copied to clipboard');
        }
    };

    const downloadReport = () => {
        if (research.fullReport) {
            const blob = new Blob([research.fullReport], {type: 'text/markdown'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `deep-research-lead-${lead?.id}-${Date.now()}.md`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            addMessage('system', 'Report downloaded');
        }
    };

    const handleClose = () => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
        onOpenChange(false);
    };

    useEffect(() => {
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, []);

    const getStatusColor = () => {
        switch (research.status) {
            case 'starting':
            case 'researching':
            case 'resuming':
                return 'blue';
            case 'completed':
                return 'green';
            case 'failed':
                return 'red';
            default:
                return 'gray';
        }
    };

    const getStatusIcon = () => {
        switch (research.status) {
            case 'starting':
            case 'researching':
                return <Loader2 className="h-4 w-4 animate-spin"/>;
            case 'resuming':
                return <AlertTriangle className="h-4 w-4 animate-pulse"/>;
            case 'completed':
                return <CheckCircle2 className="h-4 w-4"/>;
            case 'failed':
                return <XCircle className="h-4 w-4"/>;
            default:
                return <Brain className="h-4 w-4"/>;
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-500"/>
                        AI Deep Research - Lead #{lead?.id}
                    </DialogTitle>
                    <DialogDescription>
                        Comprehensive property insurance risk analysis powered by Gemini AI
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 flex flex-col gap-4 min-h-0">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Badge variant="outline" className={`bg-${getStatusColor()}-50`}>
                                        <span className="flex items-center gap-2">
                                            {getStatusIcon()}
                                            {research.status.toUpperCase()}
                                        </span>
                                    </Badge>
                                    {research.interactionId && (
                                        <div className="text-xs text-muted-foreground">
                                            ID: {research.interactionId.split('/').pop()?.substring(0, 12)}...
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {research.status === 'idle' && (
                                        <Button onClick={startResearch} className="gap-2">
                                            <Brain className="h-4 w-4"/>
                                            Start Research
                                        </Button>
                                    )}
                                    {(research.status === 'researching' || research.status === 'resuming') && (
                                        <Button onClick={stopResearch} variant="destructive" className="gap-2">
                                            <XCircle className="h-4 w-4"/>
                                            Stop
                                        </Button>
                                    )}
                                    {research.status === 'completed' && research.fullReport && (
                                        <>
                                            <Button onClick={copyReport} variant="outline" size="sm" className="gap-2">
                                                <Copy className="h-4 w-4"/>
                                                Copy
                                            </Button>
                                            <Button onClick={downloadReport} variant="outline" size="sm"
                                                    className="gap-2">
                                                <Download className="h-4 w-4"/>
                                                Download
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {research.error && (
                        <Alert variant="destructive">
                            <XCircle className="h-4 w-4"/>
                            <AlertDescription>{research.error}</AlertDescription>
                        </Alert>
                    )}

                    <Card className="flex-1 min-h-0">
                        <CardContent className="pt-6 h-full">
                            <ScrollArea ref={scrollAreaRef} className="h-[400px] w-full rounded-md border p-4">
                                {research.messages.length === 0 && (
                                    <div className="text-center text-muted-foreground py-8">
                                        <Brain className="h-12 w-12 mx-auto mb-4 opacity-20"/>
                                        <p>Click "Start Research" to begin AI-powered analysis</p>
                                        <p className="text-sm mt-2">This process typically takes 5-20 minutes</p>
                                    </div>
                                )}
                                <div className="space-y-3">
                                    {research.messages.map((msg, idx) => (
                                        <div key={`msg-${msg.timestamp.getTime()}-${idx}`}
                                             className="flex items-start gap-2">
                                            <div className="mt-0.5">
                                                {msg.type === 'system' &&
                                                    <div className="h-2 w-2 rounded-full bg-gray-400"/>}
                                                {msg.type === 'status' &&
                                                    <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"/>}
                                                {msg.type === 'interaction' &&
                                                    <div className="h-2 w-2 rounded-full bg-purple-400"/>}
                                                {msg.type === 'thinking' &&
                                                    <div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse"/>}
                                                {msg.type === 'warning' &&
                                                    <div className="h-2 w-2 rounded-full bg-orange-400 animate-pulse"/>}
                                                {msg.type === 'success' &&
                                                    <div className="h-2 w-2 rounded-full bg-green-400"/>}
                                                {msg.type === 'error' &&
                                                    <div className="h-2 w-2 rounded-full bg-red-400"/>}
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-xs text-muted-foreground">
                                                    {msg.timestamp.toLocaleTimeString()}
                                                </div>
                                                <div
                                                    className={`text-sm ${msg.type === 'error' ? 'text-red-600' : ''}`}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    {research.fullReport && (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-sm font-medium mb-2">Research Report Preview</div>
                                <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                                    <pre className="text-xs whitespace-pre-wrap font-mono">
                                        {research.fullReport.substring(0, 1000)}
                                        {research.fullReport.length > 1000 && '...'}
                                    </pre>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};