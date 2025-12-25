import React, {useEffect, useState} from 'react';
import {Button} from '@/components/ui/button';
import {Brain, FileText, Loader2} from 'lucide-react';
import {PropertyLeadDto} from '../../services/leadService';
import {DeepResearchDialog} from './DeepResearchDialog';
import {ENV} from '@/config/env';

interface DeepResearchButtonProps {
    lead: PropertyLeadDto;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
}

export const DeepResearchButton: React.FC<DeepResearchButtonProps> = ({
                                                                          lead,
                                                                          variant = 'default',
                                                                          size = 'default',
                                                                          className = '',
                                                                      }) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [status, setStatus] = useState<'idle' | 'in_progress' | 'completed'>('idle');


    useEffect(() => {
        const checkStatus = async () => {
            if (!lead?.id) return;
            try {
                const token = sessionStorage.getItem('access_token');
                const res = await fetch(`${ENV.API_URL}/picma/research/status/${lead.id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const isResearched = await res.json();
                    if (isResearched === true) {
                        setStatus('completed');
                    }
                }
            } catch {

            }
        };

        void checkStatus();
        const interval = setInterval(checkStatus, 10000);

        return () => clearInterval(interval);
    }, [lead, dialogOpen]);

    const getButtonContent = () => {
        if (status === 'completed') {
            return (
                <>
                    <FileText className="h-4 w-4"/>
                    View Report
                </>
            );
        }
        if (status === 'in_progress') {
            return (
                <>
                    <Loader2 className="h-4 w-4 animate-spin"/>
                    Researching...
                </>
            );
        }
        return (
            <>
                <Brain className="h-4 w-4"/>
                AI Deep Research
            </>
        );
    };

    return (
        <>
            <Button
                onClick={() => setDialogOpen(true)}
                variant={status === 'completed' ? 'outline' : variant}
                size={size}
                className={`gap-2 ${className} ${status === 'completed' ? 'text-green-500 hover:text-green-600 border-green-500/50 hover:bg-green-500/10' : ''}`}
            >
                {getButtonContent()}
            </Button>
            <DeepResearchDialog open={dialogOpen} onOpenChange={setDialogOpen} lead={lead}/>
        </>
    );
};