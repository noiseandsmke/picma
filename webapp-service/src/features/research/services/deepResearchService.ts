import {EventSourcePolyfill} from 'event-source-polyfill';
import { ENV } from '@/config/env';

export interface ResearchStep {
    id: string;
    type: 'PLAN' | 'SEARCH' | 'MAPS' | 'ANSWER' | 'ERROR';
    content: string;
    timestamp: number;

    metadata?: Record<string, any>;
}

export type ResearchReport = string;

export const useResearchStream = () => {

    const startResearch = (
        _query: string,
        _propertyId: string,
        leadId: number,
        onStep: (step: ResearchStep) => void,
        onComplete: (report: ResearchReport) => void,
        onError: (error: string) => void
    ) => {
        const url = `${ENV.API_URL}/picma/research/stream/${leadId}`;

        const eventSource = new EventSourcePolyfill(url, {
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
            }
        });

        let fullReport = '';



        eventSource.addEventListener('interaction.start', (e: any) => {
            try {
                const data = JSON.parse(e.data);
                onStep({
                   id: Date.now().toString(),
                   type: 'PLAN',
                   content: `Starting research interaction (ID: ${data.interaction?.id || 'unknown'})...`,
                   timestamp: Date.now()
                });
            } catch {
                onStep({
                    id: Date.now().toString(),
                    type: 'PLAN',
                    content: 'Starting research interaction...',
                    timestamp: Date.now()
                });
            }
        });



        eventSource.addEventListener('interaction.status_update', (e: any) => {
            try {
                const data = JSON.parse(e.data);
                if (data.status) {
                    onStep({
                        id: Date.now().toString(),
                        type: 'PLAN',
                        content: `Status: ${data.status}`,
                        timestamp: Date.now()
                    });
                }
            } catch (err) {
                console.error("Error parsing status update", err);
            }
        });



        eventSource.addEventListener('content.delta', (e: any) => {
            try {
                const data = JSON.parse(e.data);
                const delta = data.delta;
                if (delta) {
                    if (delta.type === 'thought_summary' && delta.content?.text) {
                        onStep({
                            id: Date.now().toString(),
                            type: 'PLAN',

                            content: delta.content.text,
                            timestamp: Date.now()
                        });
                    } else if (delta.content?.text) {
                        fullReport += delta.content.text;
                    }
                }
            } catch (err) {
                 console.error("Error parsing content delta", err);
            }
        });



        eventSource.addEventListener('done', () => {
             onComplete(fullReport);
             eventSource.close();
        });



        eventSource.onerror = (err: any) => {
            console.error("SSE Error", err);
            if (eventSource.readyState === eventSource.CLOSED) {
                 return;
            }
            onError("Connection to research service interrupted.");
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    };

    return {startResearch};
};