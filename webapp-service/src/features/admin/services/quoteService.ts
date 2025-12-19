import apiClient from '@/services/apiClient';

export interface PremiumDto {
    net: number;
    tax: number;
    total: number;
}

export interface CoverageDto {
    id: number;
    code: string;
    limit: number;
    deductible: number;
}

export interface PropertyQuoteDto {
    id: number;
    leadId: number;
    agentId: string;


    createdDate: string;

    coverages: CoverageDto[];
    premium: PremiumDto;
    status: 'NEW' | 'ACCEPTED' | 'REJECTED';
}

export interface QuoteTrendDto {
    date: string;
    count: number;
}

export type CreateQuoteDto = {
    leadId: number;
    agentId: string;

    coverages: Array<{
        code: 'FIRE' | 'THEFT' | 'NATURAL_DISASTER';
        limit: number;
        deductible: number;
    }>;
};

const QUOTE_SERVICE_URL = '/picma/quotes';

export const fetchAllQuotes = async (sortBy = 'id', sortDirection = 'asc', status?: string, agentId?: string): Promise<PropertyQuoteDto[]> => {
    const response = await apiClient.get<PropertyQuoteDto[]>(`${QUOTE_SERVICE_URL}`, {
        params: {sortBy, sortDirection, status, agentId},
    });
    return response.data;
};

export const fetchQuoteTrend = async (): Promise<QuoteTrendDto[]> => {
    const response = await apiClient.get<QuoteTrendDto[]>(`${QUOTE_SERVICE_URL}/trend`);
    return response.data;
};

export const fetchQuotesByLeadId = async (leadId: number): Promise<PropertyQuoteDto[]> => {
    const response = await apiClient.get<PropertyQuoteDto[]>(`${QUOTE_SERVICE_URL}`);
    return response.data.filter(q => q.leadId === leadId);
};

export const fetchQuoteById = async (id: number): Promise<PropertyQuoteDto> => {
    const response = await apiClient.get<PropertyQuoteDto>(`${QUOTE_SERVICE_URL}/${id}`);
    return response.data;
};


export const createQuote = async (quote: CreateQuoteDto): Promise<PropertyQuoteDto> => {
    const response = await apiClient.post<PropertyQuoteDto>(`${QUOTE_SERVICE_URL}`, quote);
    return response.data;
};

export const updateQuote = async (quote: PropertyQuoteDto): Promise<PropertyQuoteDto> => {
    const response = await apiClient.put<PropertyQuoteDto>(`${QUOTE_SERVICE_URL}/${quote.id}`, quote);
    return response.data;
};

export const deleteQuote = async (id: number): Promise<void> => {
    await apiClient.delete(`${QUOTE_SERVICE_URL}/${id}`);
};

export const acceptQuote = async (id: number): Promise<void> => {
    await apiClient.put(`${QUOTE_SERVICE_URL}/${id}/accept`);
};

export const rejectQuote = async (id: number): Promise<void> => {
    await apiClient.put(`${QUOTE_SERVICE_URL}/${id}/reject`);
};