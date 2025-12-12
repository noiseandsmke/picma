import {EventSourcePolyfill} from 'event-source-polyfill';

export interface ResearchStep {
    id: string;
    type: 'PLAN' | 'SEARCH' | 'MAPS' | 'ANSWER' | 'ERROR';
    content: string;
    timestamp: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata?: Record<string, any>;
}

export interface ResearchReport {
    valuation: {
        estimatedValue: number;
        currency: string;
        pricePerM2: number;
        comparables: string[];
    };
    riskAssessment: {
        floodRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
        floodDetails: string;
        fireRiskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
        nearbyHazards: string[];
    };
    marketAnalysis: {
        trend: 'RISING' | 'STABLE' | 'FALLING';
        demandLevel: string;
    };
    quoteRecommendation: {
        recommendedSumInsured: number;
        reasoning: string;
    };
}

export const useResearchStream = () => {

    const startResearch = (
        query: string,
        propertyId: string,
        leadId: number,
        onStep: (step: ResearchStep) => void,
        onComplete: (report: ResearchReport) => void,
        onError: (error: string) => void
    ) => {
        const url = `/picma/research/stream?query=${encodeURIComponent(query)}&propertyId=${propertyId}&leadId=${leadId}`;

        const eventSource = new EventSourcePolyfill(url, {
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            }
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        eventSource.onmessage = (event: any) => {
            try {
                const data = JSON.parse(event.data);

                if (data.actionType === 'ANSWER') {
                    try {
                        const jsonMatch = data.answer.match(/```json\n([\s\S]*?)\n```/);
                        const jsonStr = jsonMatch ? jsonMatch[1] : data.answer;
                        const report = JSON.parse(jsonStr);
                        onComplete(report);
                    } catch (e) {
                        console.warn("Could not parse report JSON", e);
                        onStep({
                            id: Date.now().toString(),
                            type: 'ANSWER',
                            content: data.answer,
                            timestamp: Date.now()
                        });
                    }
                    eventSource.close();
                } else {
                    onStep({
                        id: Date.now().toString(),
                        type: data.actionType,
                        content: data.reasoning || data.query || "Processing...",
                        timestamp: Date.now(),
                        metadata: {
                            query: data.query,
                            urls: data.urls
                        }
                    });
                }
            } catch (e) {
                console.error("Error parsing SSE data", e);
            }
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        eventSource.onerror = (err: any) => {
            console.error("SSE Error", err);
            onError("Connection to research service failed.");
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    };

    return {startResearch};
};