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

    validUntil: string;
    startDate: string;
    endDate: string;
    propertyAddress: string;
    sumInsured: number;
    plan: string;
    coverages: CoverageDto[];
    premium: PremiumDto;
    status: 'DRAFT' | 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export type CreateQuoteDto =
    Omit<PropertyQuoteDto, 'id' | 'validUntil' | 'startDate' | 'endDate' | 'propertyAddress' | 'status'>
    & {
        coverages: CoverageDto[];
        premium: PremiumDto;
    };

const QUOTE_SERVICE_URL = '/picma/quotes';

export const fetchAllQuotes = async (sort = 'id', order = 'asc'): Promise<PropertyQuoteDto[]> => {
    const response = await apiClient.get<PropertyQuoteDto[]>(`${QUOTE_SERVICE_URL}`, {
        params: { sort, order },
    });
    return response.data;
};

export const fetchQuotesByLeadId = async (leadId: number): Promise<PropertyQuoteDto[]> => {
    const response = await apiClient.get<PropertyQuoteDto[]>(`${QUOTE_SERVICE_URL}`);
    return response.data.filter(q => q.leadId === leadId);
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