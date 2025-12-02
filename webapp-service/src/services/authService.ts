import apiClient from './apiClient';

export interface ExchangeRequest {
    code: string;
    code_verifier: string;
    redirect_uri: string;
}

export const authService = {
    exchangeToken: async (data: ExchangeRequest) => {
        return apiClient.post('/auth/exchange', data);
    },

    getLoginUrl: (redirectUri: string, codeChallenge: string) => {
        return `http://localhost:8180/realms/picma/protocol/openid-connect/auth?client_id=picma-web&response_type=code&scope=openid profile email&redirect_uri=${encodeURIComponent(redirectUri)}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
    }
};