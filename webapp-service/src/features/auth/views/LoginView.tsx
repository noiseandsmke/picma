import React from 'react';
import {useAuth} from '@/context/AuthContext';
import {useNavigate} from 'react-router-dom';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';

const LoginView: React.FC = () => {
    const {login} = useAuth();
    const navigate = useNavigate();

    const handleLogin = () => {
        // Simulate login for now
        const dummyUser = {
            id: '1',
            username: 'testuser',
            email: 'test@example.com',
            roles: ['ADMIN'],
        };
        login('dummy-token', dummyUser);
        navigate('/admin/dashboard');
    };

    return (
        <Card className="w-full border-0 shadow-none">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Login</CardTitle>
                <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="grid gap-2">
                    {/* Placeholder for inputs if needed later */}
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={handleLogin}>Sign In with IDP</Button>
            </CardFooter>
        </Card>
    );
};

export default LoginView;