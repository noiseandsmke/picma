import React, {useEffect, useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import AdminLayout from '../layouts/AdminLayout';
import {
    createQuote,
    deleteQuote,
    fetchAllCoverageTypes,
    fetchAllPolicyTypes,
    fetchAllQuotes,
    fetchAllQuoteTypes,
    PropertyQuoteDetailDto,
    updateQuote
} from '../services/quoteService';
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
    userInfo: z.string().min(1, 'User Info is required'),
    propertyInfo: z.string().min(1, 'Property Info is required'),
    quoteTypeId: z.number().min(1, 'Quote Type is required'),
    coverageTypeId: z.number().min(1, 'Coverage Type is required'),
    policyTypeId: z.number().min(1, 'Policy Type is required'),
});

type QuoteFormData = z.infer<typeof quoteSchema>;

const AdminQuotesView: React.FC = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState<PropertyQuoteDetailDto | null>(null);
    const [sortConfig, setSortConfig] = useState({key: 'id', direction: 'asc'});

    const {
        handleSubmit,
        reset,
        control,
        formState: {errors},
    } = useForm<QuoteFormData>({
        resolver: zodResolver(quoteSchema),
    });

    useEffect(() => {
        if (selectedQuote) {
            reset({
                userInfo: selectedQuote.propertyQuoteDto.userInfo,
                propertyInfo: selectedQuote.propertyQuoteDto.propertyInfo,
                quoteTypeId: selectedQuote.quoteTypeDto.id,
                coverageTypeId: selectedQuote.coverageTypeDto.id,
                policyTypeId: selectedQuote.policyTypeDto.id,
            });
        } else {
            reset({
                userInfo: '',
                propertyInfo: '',
                quoteTypeId: 1,
                coverageTypeId: 1,
                policyTypeId: 1,
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

    const {data: quoteTypes} = useQuery({
        queryKey: ['quote-types'],
        queryFn: fetchAllQuoteTypes,
    });

    const {data: coverageTypes} = useQuery({
        queryKey: ['coverage-types'],
        queryFn: fetchAllCoverageTypes,
    });

    const {data: policyTypes} = useQuery({
        queryKey: ['policy-types'],
        queryFn: fetchAllPolicyTypes,
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
        const quoteData: Omit<PropertyQuoteDetailDto, 'id'> = {
            propertyQuoteDto: {
                id: 0,
                userInfo: data.userInfo,
                propertyInfo: data.propertyInfo,
            },
            quoteTypeDto: {id: data.quoteTypeId, type: ''},
            coverageTypeDto: {id: data.coverageTypeId, type: ''},
            policyTypeDto: {id: data.policyTypeId, type: ''},
        };

        if (selectedQuote) {
            updateMutation.mutate({
                ...selectedQuote,
                ...quoteData,
                propertyQuoteDto: {
                    ...selectedQuote.propertyQuoteDto,
                    ...quoteData.propertyQuoteDto
                }
            });
        } else {
            createMutation.mutate(quoteData);
        }
    };

    const handleEdit = (quote: PropertyQuoteDetailDto) => {
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

    const getStatusClass = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'PENDING':
                return 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20';
            case 'APPROVED':
                return 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20';
            case 'REJECTED':
                return 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20';
            default:
                return 'bg-slate-500/10 text-slate-400';
        }
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
                                               onClick={() => handleSort('userInfo')}>
                                        <div className="flex items-center gap-1">
                                            User Info {sortConfig.key === 'userInfo' && <ArrowUpDown size={14}/>}
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-slate-400 cursor-pointer"
                                               onClick={() => handleSort('propertyInfo')}>
                                        <div className="flex items-center gap-1">
                                            Property Info {sortConfig.key === 'propertyInfo' &&
                                            <ArrowUpDown size={14}/>}
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-slate-400">Quote Type</TableHead>
                                    <TableHead className="text-slate-400">Coverage Type</TableHead>
                                    <TableHead className="text-slate-400">Policy Type</TableHead>
                                    <TableHead className="text-slate-400 w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isQuotesLoading ? (
                                    Array.from({length: 5}).map((_, i) => (
                                        <TableRow key={i} className="border-slate-800">
                                            <TableCell><Skeleton className="h-4 w-8 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-4 w-32 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-4 w-48 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-4 w-32 bg-slate-800"/></TableCell>
                                            <TableCell><Skeleton className="h-4 w-48 bg-slate-800"/></TableCell>
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
                                            <TableCell
                                                className="font-medium text-slate-300">{quote.id}</TableCell>
                                            <TableCell
                                                className="text-slate-300">{quote.propertyQuoteDto.userInfo}</TableCell>
                                            <TableCell
                                                className="text-slate-300">{quote.propertyQuoteDto.propertyInfo}</TableCell>
                                            <TableCell
                                                className="text-slate-300">{quote.quoteTypeDto.type}</TableCell>
                                            <TableCell
                                                className="text-slate-300">{quote.coverageTypeDto.type}</TableCell>
                                            <TableCell
                                                className="text-slate-300">{quote.policyTypeDto.type}</TableCell>
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
                                <Label htmlFor="userInfo">User Info</Label>
                                <Controller
                                    name="userInfo"
                                    control={control}
                                    render={({field}) => <Input id="userInfo" {...field}
                                                                className="bg-slate-900 border-slate-700"/>}
                                />
                                {errors.userInfo &&
                                    <p className="text-red-500 text-sm">{errors.userInfo.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="propertyInfo">Property Info</Label>
                                <Controller
                                    name="propertyInfo"
                                    control={control}
                                    render={({field}) => <Input id="propertyInfo" {...field}
                                                                className="bg-slate-900 border-slate-700"/>}
                                />
                                {errors.propertyInfo &&
                                    <p className="text-red-500 text-sm">{errors.propertyInfo.message}</p>}
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="quoteTypeId">Quote Type</Label>
                                    <Controller
                                        name="quoteTypeId"
                                        control={control}
                                        render={({field}) => (
                                            <Select onValueChange={(v) => field.onChange(parseInt(v))}
                                                    defaultValue={String(field.value)}>
                                                <SelectTrigger className="bg-slate-900 border-slate-700">
                                                    <SelectValue placeholder="Select type"/>
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                                    {quoteTypes?.map(type => (
                                                        <SelectItem key={type.id}
                                                                    value={String(type.id)}>{type.type}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="coverageTypeId">Coverage Type</Label>
                                    <Controller
                                        name="coverageTypeId"
                                        control={control}
                                        render={({field}) => (
                                            <Select onValueChange={(v) => field.onChange(parseInt(v))}
                                                    defaultValue={String(field.value)}>
                                                <SelectTrigger className="bg-slate-900 border-slate-700">
                                                    <SelectValue placeholder="Select type"/>
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                                    {coverageTypes?.map(type => (
                                                        <SelectItem key={type.id}
                                                                    value={String(type.id)}>{type.type}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="policyTypeId">Policy Type</Label>
                                    <Controller
                                        name="policyTypeId"
                                        control={control}
                                        render={({field}) => (
                                            <Select onValueChange={(v) => field.onChange(parseInt(v))}
                                                    defaultValue={String(field.value)}>
                                                <SelectTrigger className="bg-slate-900 border-slate-700">
                                                    <SelectValue placeholder="Select type"/>
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                                    {policyTypes?.map(type => (
                                                        <SelectItem key={type.id}
                                                                    value={String(type.id)}>{type.type}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
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