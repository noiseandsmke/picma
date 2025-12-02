export const generateCodeVerifier = (): string => {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return base64UrlEncode(array);
};

export const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return base64UrlEncode(new Uint8Array(digest));
};

const base64UrlEncode = (array: Uint8Array): string => {
    let str = '';
    for (let i = 0; i < array.length; i++) {
        str += String.fromCharCode(array[i]);
    }
    return btoa(str)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
};