import React, {useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import AdminLayout from '../layouts/AdminLayout';
import {createQuote, deleteQuote, fetchAllQuotes, PropertyQuoteDto, updateQuote} from '../services/quoteService';
import {ArrowUpDown, MoreHorizontal, PlusCircle} from 'lucide-react';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Skeleton} from '@/components/ui/skeleton';
import {Button} from '@/components/ui/button';
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from '@/components/ui/dropdown-menu';
import {Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Controller, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';

const quoteSchema = z.object({
    leadId: z.coerce.number().positive(),
    agentId: z.string().min(1, 'Agent ID is required'),
    plan: z.enum(['BRONZE', 'SILVER', 'GOLD']),
    sumInsured: z.coerce.number().positive(),
});

type QuoteFormData = z.infer<typeof quoteSchema>;

const AdminQuotesView: React.FC = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState<PropertyQuoteDto | null>(null);
    const [sortConfig, setSortConfig] = useState({key: 'id', direction: 'asc'});

    const {
        handleSubmit,
        reset,
        control,
        formState: {errors},
    } = useForm<QuoteFormData>({
        resolver: zodResolver(quoteSchema) as any,
    });

    React.useEffect(() => {
        if (selectedQuote) {
            reset({
                leadId: selectedQuote.leadId,
                agentId: selectedQuote.agentId,
                plan: selectedQuote.plan as 'BRONZE' | 'SILVER' | 'GOLD',
                sumInsured: selectedQuote.sumInsured,
            });
        } else {
            reset({
                leadId: undefined,
                agentId: '',
                plan: 'BRONZE',
                sumInsured: 0,
            });
        }
    }, [selectedQuote, reset]);

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

    const onSubmit = (data: QuoteFormData) => {
        if (selectedQuote) {
            updateMutation.mutate({
                ...selectedQuote,
                leadId: data.leadId,
                agentId: data.agentId,
                plan: data.plan,
                sumInsured: data.sumInsured,
            });
        } else {
            createMutation.mutate({
                leadId: data.leadId,
                agentId: data.agentId,
                plan: data.plan,
                sumInsured: data.sumInsured,
                coverages: [],
                premium: {net: 0, tax: 0, total: 0}
            });
        }
    };

    const handleEdit = (quote: PropertyQuoteDto) => {
        setSelectedQuote(quote);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedQuote(null);
        reset();
        setIsModalOpen(true);
    };

    const handleSort = (key: string) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({key, direction});
    };

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div className="rounded-xl border border-slate-800 bg-slate-950 text-slate-200 shadow-sm">
                    <div className="p-6 flex items-center justify-between border-b border-slate-800">
                        <div className="flex flex-col space-y-1">
                            <h3 className="font-semibold text-lg text-white">All Quotes</h3>
                            <p className="text-sm text-slate-400">Manage and track all customer quotes.</p>
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
                                    <TableHead className="text-slate-400 w-[80px] cursor-pointer"
                                               onClick={() => handleSort('id')}>
                                        <div className="flex items-center gap-1">
                                            ID {sortConfig.key === 'id' && <ArrowUpDown size={14}/>}
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-slate-400 cursor-pointer"
                                               onClick={() => handleSort('leadId')}>
                                        <div className="flex items-center gap-1">
                                            Lead ID {sortConfig.key === 'leadId' && <ArrowUpDown size={14}/>}
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
                                    <TableHead className="text-slate-400 w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isQuotesLoading ? (
                                    Array.from({length: 5}).map((_, i) => (
                                        <TableRow key={i} className="border-slate-800">
                                            <TableCell><Skeleton className="h-4 w-8 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-4 w-16 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-4 w-32 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-4 w-48 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-6 w-8 bg-slate-800"/></TableCell>
                                        </TableRow>
                                    ))
                                ) : isQuotesError ? (
                                    <TableRow className="border-slate-800">
                                        <TableCell colSpan={7} className="h-24 text-center text-red-400">
                                            Failed to load quotes data.
                                        </TableCell>
                                    </TableRow>
                                ) : quotes && quotes.length > 0 ? (
                                    quotes.map((quote) => (
                                        <TableRow key={quote.id}
                                                  className="border-slate-800 hover:bg-slate-900/50 transition-colors">
                                            <TableCell className="font-medium text-slate-300">{quote.id}</TableCell>
                                            <TableCell className="text-slate-300">{quote.leadId}</TableCell>
                                            <TableCell
                                                className="text-slate-300">{quote.agentName || quote.agentId}</TableCell>
                                            <TableCell className="text-slate-300">{quote.propertyAddress}</TableCell>
                                            <TableCell className="text-slate-300">{quote.plan}</TableCell>
                                            <TableCell className="text-slate-300">
                                                {quote.premium ? `$${quote.premium.total}` : '-'}
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
                                        <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                                            No quotes found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="bg-slate-950 border-slate-800 text-white">
                        <DialogHeader>
                            <DialogTitle>{selectedQuote ? 'Edit Quote' : 'Create Quote'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <Label htmlFor="leadId">Lead ID</Label>
                                <Controller
                                    name="leadId"
                                    control={control}
                                    render={({field}) => <Input id="leadId" {...field} type="number"
                                                                className="bg-slate-900 border-slate-700"/>}
                                />
                                {errors.leadId &&
                                    <p className="text-red-500 text-sm">{errors.leadId.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="agentId">Agent ID</Label>
                                <Controller
                                    name="agentId"
                                    control={control}
                                    render={({field}) => <Input id="agentId" {...field}
                                                                className="bg-slate-900 border-slate-700"/>}
                                />
                                {errors.agentId &&
                                    <p className="text-red-500 text-sm">{errors.agentId.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="plan">Plan</Label>
                                <Controller
                                    name="plan"
                                    control={control}
                                    render={({field}) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger className="bg-slate-900 border-slate-700">
                                                <SelectValue placeholder="Select plan"/>
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                                <SelectItem value="BRONZE">Bronze</SelectItem>
                                                <SelectItem value="SILVER">Silver</SelectItem>
                                                <SelectItem value="GOLD">Gold</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.plan && <p className="text-red-500 text-sm">{errors.plan.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="sumInsured">Sum Insured</Label>
                                <Controller
                                    name="sumInsured"
                                    control={control}
                                    render={({field}) => <Input id="sumInsured" {...field} type="number"
                                                                className="bg-slate-900 border-slate-700"/>}
                                />
                                {errors.sumInsured &&
                                    <p className="text-red-500 text-sm">{errors.sumInsured.message}</p>}
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="ghost">Cancel</Button>
                                </DialogClose>
                                <Button type="submit"
                                        disabled={createMutation.isPending || updateMutation.isPending}>
                                    {selectedQuote ? 'Save Changes' : 'Create Quote'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
};

export default AdminQuotesView;