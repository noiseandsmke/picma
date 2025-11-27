import React, {useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import AdminLayout from '../layouts/AdminLayout';
import {createQuote, deleteQuote, fetchAllQuotes, PropertyQuoteDto, updateQuote} from '../services/quoteService';
import {ArrowUpDown, CalendarClock, MoreHorizontal, PlusCircle} from 'lucide-react';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Skeleton} from '@/components/ui/skeleton';
import {Button} from '@/components/ui/button';
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from '@/components/ui/dropdown-menu';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {AgentCell, CustomerCell, PlanPremiumCell, PropertyCell, QuoteIdCell} from '../components/QuoteCells';
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
                coverages: [],
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

    const getValidityStatus = (dateStr: string) => {
        if (!dateStr) return <span className="text-slate-500 text-xs">-</span>;

        const validUntil = new Date(dateStr);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const checkDate = new Date(validUntil);
        checkDate.setHours(0, 0, 0, 0);

        const diffTime = checkDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let statusColor = "text-emerald-400";
        let isExpired = false;

        if (diffDays < 0) {
            statusColor = "text-red-400 line-through decoration-red-400/50";
            isExpired = true;
        } else if (diffDays <= 3) {
            statusColor = "text-orange-400";
        }

        return (
            <div className="flex flex-col gap-0.5">
                <div className={`flex items-center gap-1.5 text-xs font-medium ${statusColor}`}>
                    <span>{dateStr}</span>
                </div>
                {!isExpired && (
                    <span className="text-[10px] text-slate-500">
                         {diffDays === 0 ? 'Expiring today' : `${diffDays} days left`}
                     </span>
                )}
                {isExpired && <span className="text-[10px] text-slate-500">Expired</span>}
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
                                    <TableHead className="text-slate-400 w-[120px]" onClick={() => handleSort('id')}>
                                        <div className="flex items-center gap-1 cursor-pointer hover:text-white">
                                            Quote ID {sortConfig.key === 'id' && <ArrowUpDown size={12}/>}
                                        </div>
                                    </TableHead>

                                    <TableHead className="text-slate-400 w-[200px]"
                                               onClick={() => handleSort('leadId')}>
                                        <div className="flex items-center gap-1 cursor-pointer hover:text-white">
                                            Customer {sortConfig.key === 'leadId' && <ArrowUpDown size={12}/>}
                                        </div>
                                    </TableHead>

                                    <TableHead className="text-slate-400 min-w-[200px]">Property</TableHead>

                                    <TableHead className="text-slate-400 w-[150px]">Plan & Premium</TableHead>

                                    <TableHead className="text-slate-400 min-w-[180px]"
                                               onClick={() => handleSort('agentName')}>
                                        <div className="flex items-center gap-1 cursor-pointer hover:text-white">
                                            Agent {sortConfig.key === 'agentName' && <ArrowUpDown size={12}/>}
                                        </div>
                                    </TableHead>

                                    <TableHead className="text-slate-400 w-[140px]">
                                        <div className="flex items-center gap-1">
                                            <CalendarClock size={14}/> Validity
                                        </div>
                                    </TableHead>

                                    <TableHead className="text-slate-400 w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isQuotesLoading ? (
                                    Array.from({length: 5}).map((_, i) => (
                                        <TableRow key={i} className="border-slate-800">
                                            <TableCell><Skeleton className="h-6 w-24 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-10 w-full bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-10 w-full bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-10 w-20 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-10 w-full bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-6 w-24 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-8 w-8 bg-slate-800"/></TableCell>
                                        </TableRow>
                                    ))
                                ) : isQuotesError ? (
                                    <TableRow className="border-slate-800">
                                        <TableCell colSpan={7} className="h-32 text-center text-red-400">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <p>Failed to load quotes data.</p>
                                                <Button variant="outline" size="sm"
                                                        onClick={() => queryClient.invalidateQueries({queryKey: ['admin-quotes']})}>
                                                    Retry
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : quotes && quotes.length > 0 ? (
                                    quotes.map((quote) => (
                                        <TableRow key={quote.id}
                                                  className="border-slate-800 hover:bg-slate-900/50 transition-colors">
                                            <TableCell>
                                                <QuoteIdCell id={quote.id} dateStr={quote.startDate}/>
                                            </TableCell>

                                            <TableCell>
                                                <CustomerCell leadId={quote.leadId}/>
                                            </TableCell>

                                            <TableCell>
                                                <PropertyCell leadId={quote.leadId} sumInsured={quote.sumInsured}/>
                                            </TableCell>

                                            <TableCell>
                                                <PlanPremiumCell plan={quote.plan}
                                                                 totalPremium={quote.premium?.total || 0}/>
                                            </TableCell>

                                            <TableCell>
                                                <AgentCell agentId={quote.agentId} agentName={quote.agentName}/>
                                            </TableCell>

                                            <TableCell>
                                                {getValidityStatus(quote.validUntil)}
                                            </TableCell>

                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost"
                                                                className="h-8 w-8 p-0 hover:bg-slate-800 text-slate-400">
                                                            <MoreHorizontal className="h-4 w-4"/>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end"
                                                                         className="bg-slate-900 border-slate-800 text-slate-200">
                                                        <DropdownMenuItem onClick={() => handleEdit(quote)}
                                                                          className="hover:bg-slate-800 cursor-pointer">
                                                            Edit Quote
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => deleteMutation.mutate(quote.id)}
                                                            className="text-red-400 hover:bg-red-950/20 hover:text-red-300 cursor-pointer">
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow className="border-slate-800">
                                        <TableCell colSpan={7} className="h-32 text-center text-slate-500">
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