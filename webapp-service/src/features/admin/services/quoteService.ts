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
    agentName: string;
    validUntil: string;
    startDate: string;
    endDate: string;
    propertyAddress: string;
    sumInsured: number;
    plan: string;
    coverages: CoverageDto[];
    premium: PremiumDto;
}

export type CreateQuoteDto =
    Omit<PropertyQuoteDto, 'id' | 'agentName' | 'validUntil' | 'startDate' | 'endDate' | 'propertyAddress'>
    & {
    // Optional or computed fields for creation
    coverages: CoverageDto[];
    premium: PremiumDto;
};

const QUOTE_SERVICE_URL = '/picma/quotes';

export const fetchAllQuotes = async (sort = 'id', order = 'asc'): Promise<PropertyQuoteDto[]> => {
    const response = await apiClient.get<PropertyQuoteDto[]>(`${QUOTE_SERVICE_URL}`, {
        params: {sort, order},
    });
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