import React, {useEffect, useState} from 'react';
import {Button} from "@/components/ui/button";
import {Sparkles} from 'lucide-react';
import {DeepResearchDialog} from '../components/DeepResearchDialog';
import {PropertyLeadDto} from '@/features/admin/services/leadService';
import {ENV} from '@/config/env';

interface ResearchButtonProps {
    lead: PropertyLeadDto;
}

export const ResearchButton: React.FC<ResearchButtonProps> = ({lead}) => {
    const [isOpen, setIsOpen] = useState(false);

    const [isResearched, setIsResearched] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await fetch(`${ENV.API_URL}/picma/research/status/${lead.id}`, {
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
                    }
                });
                if (res.ok) {
                    const status = await res.json();
                    setIsResearched(status === true);
                }
            } catch (e) {
                console.error("Failed to check research status", e);
            }
        };
        if (lead?.id) void checkStatus();
    }, [lead]);

    const buttonClass = isResearched
        ? "bg-green-500/10 text-green-400 border-green-500/50 hover:bg-green-500/20"
        : "bg-red-500/10 text-red-400 border-red-500/50 hover:bg-red-500/20";

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                className={`${buttonClass} px-4 font-bold border transition-colors`}
                onClick={() => setIsOpen(true)}
            >
                <Sparkles className="w-4 h-4 mr-2"/>
                AI
            </Button>

            <DeepResearchDialog
                open={isOpen}
                onOpenChange={setIsOpen}
                lead={lead}
                status={isResearched ? 'researched' : 'idle'}
                onStatusChange={(s) => setIsResearched(s === 'researched')}
            />
        </>
    );
};