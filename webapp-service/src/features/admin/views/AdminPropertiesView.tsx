import React, {useState} from 'react';
import {Building2, MapPin, MoreHorizontal, Search} from 'lucide-react';
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";
import {useQuery} from '@tanstack/react-query';
import {fetchAllProperties} from '../services/propertyService';
import {Skeleton} from '@/components/ui/skeleton';
import AdminLayout from '../layouts/AdminLayout';

const AdminPropertiesView: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const {data: properties, isLoading} = useQuery({
        queryKey: ['admin-properties'],
        queryFn: fetchAllProperties
    });

    const filteredProperties = properties?.filter(prop => {
        const term = searchTerm.toLowerCase();
        return (
            prop.address.toLowerCase().includes(term) ||
            prop.city.toLowerCase().includes(term) ||
            prop.zipCode.toLowerCase().includes(term)
        );
    });

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Property Info</h2>
                        <p className="text-slate-400">Search and manage physical assets by address or location.</p>
                    </div>
                </div>

                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="border-b border-slate-800 pb-4">
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500"/>
                                <Input
                                    placeholder="Search by Address, City, or Zip Code..."
                                    className="pl-8 bg-slate-950 border-slate-800 text-slate-200"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button variant="outline"
                                    className="border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white">
                                Filters
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-950/50">
                                <TableRow className="border-slate-800 hover:bg-slate-900/50">
                                    <TableHead className="text-slate-400">Property Address</TableHead>
                                    <TableHead className="text-slate-400">Type</TableHead>
                                    <TableHead className="text-slate-400">Owner (Reference)</TableHead>
                                    <TableHead className="text-right text-slate-400">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({length: 4}).map((_, i) => (
                                        <TableRow key={i} className="border-slate-800">
                                            <TableCell><Skeleton className="h-8 w-48 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-6 w-20 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-4 w-32 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-8 w-8 ml-auto bg-slate-800"/></TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredProperties?.map((prop) => (
                                    <TableRow key={prop.id} className="border-slate-800 hover:bg-slate-800/50 group">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500">
                                                    <Building2 className="h-4 w-4"/>
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-200">{prop.address}</div>
                                                    <div className="text-xs text-slate-500 flex items-center gap-1">
                                                        <MapPin className="h-3 w-3"/>
                                                        {prop.city}, {prop.zipCode}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary"
                                                   className="bg-slate-800 text-slate-300 hover:bg-slate-700">
                                                {prop.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-slate-400">
                                            <span className="text-indigo-400 hover:underline cursor-pointer">
                                                {prop.ownerId || "Unknown"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button size="icon" variant="ghost"
                                                    className="text-slate-500 hover:text-white hover:bg-slate-800">
                                                <MoreHorizontal className="h-4 w-4"/>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default AdminPropertiesView;