import React, {useState} from 'react';
import {useAuth} from '@/context/AuthContext';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Plus, X} from 'lucide-react';
import {toast} from 'sonner';
import {updateAgentProfile} from '@/features/agent/services/agentService';

export const AgentProfileSettings: React.FC = () => {
    const {user, login} = useAuth();
    const [zipInput, setZipInput] = useState('');
    // @ts-ignore
    const [serviceZipCodes, setServiceZipCodes] = useState<string[]>(user?.serviceZipCodes || []);
    const [isLoading, setIsLoading] = useState(false);

    const handleAddZip = () => {
        if (!zipInput) return;
        if (serviceZipCodes.includes(zipInput)) {
            toast.error("Zip code already added");
            return;
        }
        if (!/^\d{5,6}$/.test(zipInput)) {
            toast.error("Invalid zip code format");
            return;
        }
        setServiceZipCodes([...serviceZipCodes, zipInput]);
        setZipInput('');
    };

    const handleRemoveZip = (zip: string) => {
        setServiceZipCodes(serviceZipCodes.filter(z => z !== zip));
    };

    const handleSave = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const updatedUser = {
                ...user,
                serviceZipCodes: serviceZipCodes
            };

            const response = await updateAgentProfile(updatedUser);

            if (response) {
                login(sessionStorage.getItem('access_token') || '', response);
            }

            toast.success("Service areas updated successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update service areas");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto bg-slate-900 border-slate-800">
            <CardHeader>
                <CardTitle className="text-white">Service Areas</CardTitle>
                <CardDescription className="text-slate-400">
                    Manage the zip codes where you want to receive leads.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label className="text-slate-200">Add Service Zip Code</Label>
                    <div className="flex gap-2">
                        <Input
                            value={zipInput}
                            onChange={(e) => setZipInput(e.target.value)}
                            placeholder="e.g. 70000"
                            className="bg-slate-950 border-slate-700 text-white"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddZip()}
                        />
                        <Button onClick={handleAddZip} variant="secondary"
                                className="bg-primary text-white hover:bg-primary-hover">
                            <Plus className="h-4 w-4 mr-1"/> Add
                        </Button>
                    </div>
                </div>

                <div className="space-y-3">
                    <Label className="text-slate-200">Active Service Areas</Label>
                    <div
                        className="flex flex-wrap gap-2 p-4 rounded-lg bg-slate-950/50 border border-slate-800 min-h-[100px]">
                        {serviceZipCodes.length === 0 && (
                            <p className="text-slate-500 text-sm italic w-full text-center py-8">No service areas set.
                                You won't receive leads.</p>
                        )}
                        {serviceZipCodes.map(zip => (
                            <Badge key={zip} variant="secondary"
                                   className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 pl-2 pr-1 py-1 flex items-center gap-1">
                                {zip}
                                <button onClick={() => handleRemoveZip(zip)}
                                        className="hover:bg-indigo-500/20 rounded-full p-0.5 transition-colors">
                                    <X className="h-3 w-3"/>
                                </button>
                            </Badge>
                        ))}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="border-t border-slate-800 pt-6 flex justify-end">
                <Button onClick={handleSave} disabled={isLoading}
                        className="bg-primary hover:bg-primary-hover text-white">
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
            </CardFooter>
        </Card>
    );
};