import axios from 'axios';

export interface PropertyQuoteDto {
    id: number;
    userInfo: string;
    propertyInfo: string;
}

export interface QuoteTypeDto {
    id: number;
    type: string;
}

export interface CoverageTypeDto {
    id: number;
    type: string;
}

export interface PolicyTypeDto {
    id: number;
    type: string;
}

export interface PropertyQuoteDetailDto {
    id: number;
    propertyQuoteDto: PropertyQuoteDto;
    quoteTypeDto: QuoteTypeDto;
    coverageTypeDto: CoverageTypeDto;
    policyTypeDto: PolicyTypeDto;
}

const QUOTE_SERVICE_URL = import.meta.env.VITE_QUOTE_SERVICE_URL || 'http://localhost:7102/property-quote';

export const fetchAllQuotes = async (sort = 'id', order = 'asc'): Promise<PropertyQuoteDetailDto[]> => {
    const response = await axios.get<PropertyQuoteDetailDto[]>(`${QUOTE_SERVICE_URL}`, {
        params: {sort, order},
    });
    return response.data;
};

export const createQuote = async (quote: Omit<PropertyQuoteDetailDto, 'id'>): Promise<PropertyQuoteDetailDto> => {
    const response = await axios.post<PropertyQuoteDetailDto>(`${QUOTE_SERVICE_URL}`, quote);
    return response.data;
};

export const updateQuote = async (quote: PropertyQuoteDetailDto): Promise<PropertyQuoteDetailDto> => {
    const response = await axios.put<PropertyQuoteDetailDto>(`${QUOTE_SERVICE_URL}/${quote.id}`, quote);
    return response.data;
};

export const deleteQuote = async (id: number): Promise<void> => {
    await axios.delete(`${QUOTE_SERVICE_URL}/${id}`);
};

export const fetchAllQuoteTypes = async (): Promise<QuoteTypeDto[]> => {
    const response = await axios.get<QuoteTypeDto[]>(`${QUOTE_SERVICE_URL}/types/quote`);
    return response.data;
};

export const fetchAllCoverageTypes = async (): Promise<CoverageTypeDto[]> => {
    const response = await axios.get<CoverageTypeDto[]>(`${QUOTE_SERVICE_URL}/types/coverage`);
    return response.data;
};

export const fetchAllPolicyTypes = async (): Promise<PolicyTypeDto[]> => {
    const response = await axios.get<PolicyTypeDto[]>(`${QUOTE_SERVICE_URL}/types/policy`);
    return response.data;
};