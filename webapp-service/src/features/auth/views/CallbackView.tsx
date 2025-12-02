import React, {useEffect} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {authService} from '@/services/authService';
import {useAuth} from '@/context/AuthContext';

const CallbackView: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const {fetchUser} = useAuth();

    useEffect(() => {
        const code = searchParams.get('code');
        const codeVerifier = sessionStorage.getItem('pkce_code_verifier');

        if (code && codeVerifier) {
            const redirectUri = window.location.origin + '/auth/callback';

            authService.exchangeToken({
                code,
                code_verifier: codeVerifier,
                redirect_uri: redirectUri
            })
                .then(async () => {
                    sessionStorage.removeItem('pkce_code_verifier');
                    await fetchUser();

                    navigate('/admin/dashboard');
                })
                .catch((error) => {
                    console.error("Token exchange failed", error);
                    navigate('/login?error=exchange_failed');
                });
        } else {
            navigate('/login?error=no_code');
        }
    }, [searchParams, navigate, fetchUser]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
            Processing login...
        </div>
    );
};

export default CallbackView;