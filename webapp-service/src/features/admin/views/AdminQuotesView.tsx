import React, {useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import AdminLayout from '../layouts/AdminLayout';
import {createQuote, deleteQuote, fetchAllQuotes, PropertyQuoteDto, updateQuote} from '../services/quoteService';
import {ArrowUpDown, CheckCircle, MoreHorizontal, PlusCircle, XCircle} from 'lucide-react';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Skeleton} from '@/components/ui/skeleton';
import {Button} from '@/components/ui/button';
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from '@/components/ui/dropdown-menu';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Badge} from '@/components/ui/badge';
import {AgentInfoCell, LeadInfoCell, PropertyInfoCell} from '../components/QuoteCells';
import {QuoteForm} from '../components/QuoteForm';

const AdminQuotesView: React.FC = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState<PropertyQuoteDto | null>(null);
    const [sortConfig, setSortConfig] = useState({key: 'id', direction: 'asc'});

    const {
        data: quotes,
        isLoading: isQuotesLoading,
        isError: isQuotesError
    } = useQuery({
        queryKey: ['admin-quotes', sortConfig],
        queryFn: () => fetchAllQuotes(sortConfig.key, sortConfig.direction),
    });

    const createMutation = useMutation({
        mutationFn: createQuote,
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['admin-quotes']});
            setIsModalOpen(false);
        },
    });

    const updateMutation = useMutation({
        mutationFn: updateQuote,
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['admin-quotes']});
            setIsModalOpen(false);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteQuote,
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['admin-quotes']});
        },
    });

    const handleFormSubmit = (data: any) => {
        if (selectedQuote) {
            updateMutation.mutate({
                ...selectedQuote,
                ...data,
            });
        } else {
            createMutation.mutate({
                ...data,
                coverages: [], // Default empty or calculated logic could go here
            });
        }
    };

    const handleEdit = (quote: PropertyQuoteDto) => {
        setSelectedQuote(quote);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedQuote(null);
        setIsModalOpen(true);
    };

    const handleSort = (key: string) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({key, direction});
    };

    const getPlanBadge = (plan: string) => {
        switch (plan) {
            case 'BRONZE':
                return <Badge
                    className="bg-amber-700/20 text-amber-500 border-amber-700/50 hover:bg-amber-700/30">Bronze</Badge>;
            case 'SILVER':
                return <Badge
                    className="bg-slate-500/20 text-slate-400 border-slate-500/50 hover:bg-slate-500/30">Silver</Badge>;
            case 'GOLD':
                return <Badge
                    className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50 hover:bg-yellow-500/30">Gold</Badge>;
            default:
                return <Badge variant="secondary">{plan}</Badge>;
        }
    };

    const getValidityStatus = (dateStr: string) => {
        if (!dateStr) return <span className="text-slate-500 text-xs">-</span>;

        // Handle date string which might be YYYY-MM-DD
        const validUntil = new Date(dateStr);
        const now = new Date();
        const isValid = validUntil >= now;

        return (
            <div className={`flex items-center gap-1.5 text-xs ${isValid ? 'text-emerald-400' : 'text-red-400'}`}>
                {isValid ? <CheckCircle size={12}/> : <XCircle size={12}/>}
                <span>{isValid ? dateStr : 'Expired'}</span>
            </div>
        );
    };

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div className="rounded-xl border border-slate-800 bg-slate-950 text-slate-200 shadow-sm">
                    <div className="p-6 flex items-center justify-between border-b border-slate-800">
                        <div className="flex flex-col space-y-1">
                            <h3 className="font-semibold text-lg text-white">All Quotes</h3>
                            <p className="text-sm text-slate-400">Manage and track all customer quotes with enriched
                                context.</p>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleCreate} variant="outline"
                                    className="text-white border-indigo-500 bg-indigo-500/10 hover:bg-indigo-500/20 hover:text-white">
                                <PlusCircle className="h-4 w-4 mr-2"/>
                                Create Quote
                            </Button>
                        </div>
                    </div>
                    <div className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-900/50 border-slate-800">
                                <TableRow className="border-slate-800 hover:bg-slate-900/50">
                                    <TableHead className="text-slate-400 w-[60px] cursor-pointer"
                                               onClick={() => handleSort('id')}>
                                        <div className="flex items-center gap-1">
                                            ID {sortConfig.key === 'id' && <ArrowUpDown size={14}/>}
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-slate-400 cursor-pointer"
                                               onClick={() => handleSort('leadId')}>
                                        <div className="flex items-center gap-1">
                                            Lead Info {sortConfig.key === 'leadId' && <ArrowUpDown size={14}/>}
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-slate-400 cursor-pointer"
                                               onClick={() => handleSort('agentName')}>
                                        <div className="flex items-center gap-1">
                                            Agent {sortConfig.key === 'agentName' && <ArrowUpDown size={14}/>}
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-slate-400">Property Address</TableHead>
                                    <TableHead className="text-slate-400">Plan</TableHead>
                                    <TableHead className="text-slate-400">Premium</TableHead>
                                    <TableHead className="text-slate-400">Validity</TableHead>
                                    <TableHead className="text-slate-400 w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isQuotesLoading ? (
                                    Array.from({length: 5}).map((_, i) => (
                                        <TableRow key={i} className="border-slate-800">
                                            <TableCell><Skeleton className="h-4 w-8 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-10 w-32 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-10 w-32 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-4 w-48 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-6 w-16 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-6 w-8 bg-slate-800"/></TableCell>
                                        </TableRow>
                                    ))
                                ) : isQuotesError ? (
                                    <TableRow className="border-slate-800">
                                        <TableCell colSpan={8} className="h-24 text-center text-red-400">
                                            Failed to load quotes data.
                                        </TableCell>
                                    </TableRow>
                                ) : quotes && quotes.length > 0 ? (
                                    quotes.map((quote) => (
                                        <TableRow key={quote.id}
                                                  className="border-slate-800 hover:bg-slate-900/50 transition-colors">
                                            <TableCell className="font-medium text-slate-500">#{quote.id}</TableCell>

                                            {/* Enhanced Lead Info */}
                                            <TableCell>
                                                <LeadInfoCell leadId={quote.leadId}/>
                                            </TableCell>

                                            {/* Enhanced Agent Info */}
                                            <TableCell>
                                                <AgentInfoCell agentId={quote.agentId}/>
                                            </TableCell>

                                            {/* Enhanced Property Info (Fetched from Lead -> Property) */}
                                            <TableCell>
                                                <PropertyInfoCell leadId={quote.leadId}/>
                                            </TableCell>

                                            {/* Plan Badge */}
                                            <TableCell>{getPlanBadge(quote.plan)}</TableCell>

                                            {/* Formatted Premium */}
                                            <TableCell className="text-slate-300 font-medium font-mono">
                                                {quote.premium ? new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND'
                                                }).format(quote.premium.total) : '-'}
                                            </TableCell>

                                            {/* Validity Date */}
                                            <TableCell>
                                                {getValidityStatus(quote.validUntil)}
                                            </TableCell>

                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4"/>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end"
                                                                         className="bg-slate-900 border-slate-800 text-slate-200">
                                                        <DropdownMenuItem
                                                            onClick={() => handleEdit(quote)}>Edit</DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => deleteMutation.mutate(quote.id)}
                                                            className="text-red-400">Delete</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow className="border-slate-800">
                                        <TableCell colSpan={8} className="h-24 text-center text-slate-500">
                                            No quotes found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="bg-slate-950 border-slate-800 text-white max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{selectedQuote ? 'Edit Quote' : 'Create New Quote'}</DialogTitle>
                        </DialogHeader>
                        <QuoteForm
                            initialData={selectedQuote}
                            onSubmit={handleFormSubmit}
                            onCancel={() => setIsModalOpen(false)}
                            isLoading={createMutation.isPending || updateMutation.isPending}
                        />
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
};

export default AdminQuotesView;